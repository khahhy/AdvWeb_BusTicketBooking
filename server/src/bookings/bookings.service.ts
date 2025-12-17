import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BookingsGateway } from './bookings.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisCacheService } from 'src/cache/redis-cache.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { LookupBookingDto } from './dto/lookup-booking.dto';
import { Prisma, BookingStatus } from '@prisma/client';
import { QueryBookingDto } from './dto/query-booking.dto';
import { generateBookingReference } from 'src/common/utils/generateBookingReference';
import { ETicketService } from 'src/eticket/eticket.service';
import { EmailService } from 'src/email/email.service';
import { SmsService } from 'src/notifications/sms.service';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheManager: RedisCacheService,
    private readonly bookingsGateway: BookingsGateway,
    private readonly eTicketService: ETicketService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  private async generateUniqueTicketCode(): Promise<string> {
    const maxAttempts = 10;
    for (let i = 0; i < maxAttempts; i++) {
      const code = generateBookingReference();
      const existing = await this.prisma.bookings.findUnique({
        where: { ticketCode: code },
      });
      if (!existing) return code;
    }
    throw new InternalServerErrorException(
      'Failed to generate unique booking reference',
    );
  }

  private async calculateDetailsFromRoute(tripId: string, routeId: string) {
    console.log('=== CALCULATE DETAILS FROM ROUTE ===');
    console.log('tripId:', tripId, 'routeId:', routeId);

    const route = await this.prisma.routes.findUnique({
      where: { id: routeId },
      select: { originLocationId: true, destinationLocationId: true },
    });
    if (!route) throw new NotFoundException('Route not found');
    console.log('Route:', route);

    const stops = await this.prisma.tripStops.findMany({
      where: {
        tripId,
        locationId: {
          in: [route.originLocationId, route.destinationLocationId],
        },
      },
      select: { id: true, sequence: true, locationId: true },
    });
    console.log('Stops found:', stops);

    const startStop = stops.find(
      (s) => s.locationId === route.originLocationId,
    );
    const endStop = stops.find(
      (s) => s.locationId === route.destinationLocationId,
    );
    console.log('startStop:', startStop, 'endStop:', endStop);

    if (!startStop || !endStop) {
      throw new BadRequestException(
        'Trip does not stop at the Route locations',
      );
    }
    if (startStop.sequence >= endStop.sequence) {
      throw new BadRequestException('Invalid route direction');
    }

    // Get ALL segments for this trip first to debug
    const allSegments = await this.prisma.tripSegments.findMany({
      where: { tripId },
      include: { fromStop: true, toStop: true },
    });
    console.log(
      'All trip segments:',
      allSegments.map((s) => ({
        id: s.id,
        fromStopSeq: s.fromStop.sequence,
        toStopSeq: s.toStop.sequence,
      })),
    );

    const segments = await this.prisma.tripSegments.findMany({
      where: {
        tripId,
        fromStop: { sequence: { gte: startStop.sequence } },
        toStop: { sequence: { lte: endStop.sequence } },
      },
      select: { id: true },
    });
    console.log('Filtered segments:', segments);
    console.log('=====================================');

    return {
      segmentIds: segments.map((s) => s.id),
      pickupStopId: startStop.id,
      dropoffStopId: endStop.id,
    };
  }

  // bookings.service.ts

  async lockSeat(
    userId: string,
    tripId: string,
    seatId: string,
    routeId: string,
  ) {
    const { segmentIds } = await this.calculateDetailsFromRoute(
      tripId,
      routeId,
    );
    const TTL = 120; // 2m

    const isBookedInDb = await this.prisma.seatSegmentLocks.findFirst({
      where: { tripId, seatId, segmentId: { in: segmentIds } },
    });
    if (isBookedInDb)
      throw new ConflictException(
        'Seat is already booked for this route segment.',
      );

    for (const segId of segmentIds) {
      const lockKey = `lock:trip:${tripId}:segment:${segId}:seat:${seatId}`;
      const holder = await this.cacheManager.get(lockKey);

      if (holder && holder !== userId) {
        throw new ConflictException(
          `Ghế đang được giữ bởi người khác ở đoạn ${segId}`,
        );
      }
    }

    const lockPromises = segmentIds.map((segId) => {
      const lockKey = `lock:trip:${tripId}:segment:${segId}:seat:${seatId}`;
      return this.cacheManager.set(lockKey, userId, TTL);
    });

    await Promise.all(lockPromises);

    this.bookingsGateway.emitSeatLocked(tripId, seatId, segmentIds);

    return { message: 'Seat locked successfully', expiresIn: TTL };
  }

  async unlockSeat(
    userId: string,
    tripId: string,
    seatId: string,
    routeId: string,
  ) {
    const { segmentIds } = await this.calculateDetailsFromRoute(
      tripId,
      routeId,
    );

    const unlockPromises = segmentIds.map(async (segId) => {
      const lockKey = `lock:trip:${tripId}:segment:${segId}:seat:${seatId}`;
      const holderId = await this.cacheManager.get<string>(lockKey);

      if (holderId && holderId === userId) {
        await this.cacheManager.del(lockKey);
      }
    });

    await Promise.all(unlockPromises);

    this.bookingsGateway.emitSeatUnlocked(tripId, seatId, segmentIds);

    return { message: 'Seat unlocked successfully' };
  }

  async create(createBookingDto: CreateBookingDto) {
    console.log('=== BOOKING CREATE CALLED ===');
    console.log('DTO:', JSON.stringify(createBookingDto, null, 2));

    try {
      const { userId, tripId, seatId, seatIds, routeId, customerInfo } =
        createBookingDto;

      // Support both single seatId and array of seatIds
      const allSeatIds = seatIds?.length ? seatIds : seatId ? [seatId] : [];

      if (allSeatIds.length === 0) {
        throw new BadRequestException(
          'At least one seat must be selected (provide seatId or seatIds)',
        );
      }

      const { segmentIds, pickupStopId, dropoffStopId } =
        await this.calculateDetailsFromRoute(tripId, routeId);

      const lockIdentifier = userId || 'guest-temp-id';

      console.log('Lock identifier:', lockIdentifier);
      console.log('Checking locks for segments:', segmentIds);
      console.log('Processing seats:', allSeatIds);

      // Clear any existing locks by this user before creating booking for all seats
      for (const currentSeatId of allSeatIds) {
        for (const segId of segmentIds) {
          const lockKey = `lock:trip:${tripId}:segment:${segId}:seat:${currentSeatId}`;
          const lockHolder = await this.cacheManager.get<string>(lockKey);

          console.log(
            `Seat ${currentSeatId}, Segment ${segId} - Lock holder:`,
            lockHolder,
          );

          const isOwnLock = lockHolder === lockIdentifier;
          const isGuestToAuthFlow = lockHolder === 'guest-temp-id' && userId;

          if (isOwnLock || isGuestToAuthFlow) {
            console.log(
              `Removing lock for seat ${currentSeatId}, segment ${segId}`,
            );
            await this.cacheManager.del(lockKey);
          } else if (lockHolder) {
            console.warn(
              `Lock conflict for seat ${currentSeatId} - Expected: ${lockIdentifier}, Got: ${lockHolder}`,
            );
            throw new ConflictException(
              `Seat ${currentSeatId} at segment ${segId} is being held by another user.`,
            );
          } else {
            console.log(
              `No lock found for seat ${currentSeatId}, segment ${segId}, proceeding...`,
            );
          }
        }
      }

      // Create bookings for all seats in a transaction
      const result = await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const tripRoute = await tx.tripRouteMap.findUnique({
            where: {
              tripId_routeId: {
                tripId,
                routeId,
              },
            },
            select: { price: true },
          });

          if (!tripRoute) {
            throw new NotFoundException(
              'This route is not available for the selected trip.',
            );
          }

          const bookings: {
            bookingId: string;
            ticketCode: string;
            seatId: string;
          }[] = [];
          let totalPrice = 0;

          for (const currentSeatId of allSeatIds) {
            // Check for conflicts in SeatSegmentLocks (if segments exist)
            if (segmentIds.length > 0) {
              const conflictLock = await tx.seatSegmentLocks.findFirst({
                where: {
                  tripId,
                  seatId: currentSeatId,
                  segmentId: { in: segmentIds },
                },
              });

              if (conflictLock) {
                throw new ConflictException(
                  `Seat ${currentSeatId} is already booked or reserved for this segment.`,
                );
              }
            }

            // Also check Bookings table directly for conflicts
            const existingBooking = await tx.bookings.findFirst({
              where: {
                tripId,
                routeId,
                seatId: currentSeatId,
                status: { in: ['confirmed', 'pendingPayment'] },
              },
            });

            if (existingBooking) {
              throw new ConflictException(
                `Seat ${currentSeatId} is already booked for this route.`,
              );
            }

            const ticketCode = await this.generateUniqueTicketCode();

            // Build booking data with proper relation connections
            const bookingCreateInput: Prisma.BookingsCreateInput = {
              customerInfo: customerInfo as unknown as Prisma.InputJsonValue,
              price: tripRoute.price,
              status: BookingStatus.pendingPayment,
              ticketCode,
              trip: { connect: { id: tripId } },
              route: { connect: { id: routeId } },
              seat: { connect: { id: currentSeatId } },
              pickupStop: { connect: { id: pickupStopId } },
              dropoffStop: { connect: { id: dropoffStopId } },
            };

            if (userId) {
              Object.assign(bookingCreateInput, {
                user: { connect: { id: userId } },
              });
            }

            const booking = await tx.bookings.create({
              data: bookingCreateInput,
              include: { seat: true },
            });

            // Only create segment locks if segments exist
            if (segmentIds.length > 0) {
              const lockData = segmentIds.map((segId) => ({
                tripId,
                seatId: currentSeatId,
                segmentId: segId,
                bookingId: booking.id,
              }));

              await tx.seatSegmentLocks.createMany({
                data: lockData,
              });
            }

            // Delete Redis locks for this seat
            const deleteLockPromises = segmentIds.map((segId) => {
              const lockKey = `lock:trip:${tripId}:segment:${segId}:seat:${currentSeatId}`;
              return this.cacheManager.del(lockKey);
            });
            await Promise.all(deleteLockPromises);

            bookings.push({
              bookingId: booking.id,
              ticketCode: booking.ticketCode || ticketCode,
              seatId: currentSeatId,
            });

            totalPrice += Number(tripRoute.price);
          }

          return {
            bookingId: bookings[0].bookingId, // Primary booking ID for payment
            bookingIds: bookings.map((b) => b.bookingId),
            ticketCodes: bookings.map((b) => b.ticketCode),
            ticketCode: bookings[0].ticketCode, // For backward compatibility
            seatCount: bookings.length,
            totalPrice,
            status: BookingStatus.pendingPayment,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          };
        },
      );

      // Emit seat sold events for all seats
      for (const currentSeatId of allSeatIds) {
        this.bookingsGateway.emitSeatSold(tripId, currentSeatId, segmentIds);
      }

      console.log(
        `Created ${result.seatCount} booking(s), IDs: ${result.bookingIds.join(', ')}`,
      );

      return { message: 'Booking initiated successfully', data: result };
    } catch (err) {
      console.error('=== BOOKING CREATE ERROR ===');
      console.error('Input DTO:', JSON.stringify(createBookingDto, null, 2));
      console.error('Error:', err);
      console.error('Stack:', err instanceof Error ? err.stack : 'No stack');
      console.error('============================');

      if (
        err instanceof ConflictException ||
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to create booking', {
        cause: err,
      });
    }
  }

  async findOne(id: string) {
    try {
      const booking = await this.prisma.bookings.findUnique({
        where: { id },
        include: {
          trip: {
            select: {
              tripName: true,
              startTime: true,
              bus: {
                select: {
                  plate: true,
                  busType: true,
                },
              },
            },
          },
          route: {
            select: {
              name: true,
            },
          },
          seat: { select: { seatNumber: true } },
          pickupStop: { include: { location: true } },
          dropoffStop: { include: { location: true } },
        },
      });

      if (!booking) throw new NotFoundException('Booking not found');
      return { message: 'Fetched booking details successfully', data: booking };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch booking', {
        cause: err,
      });
    }
  }

  async findAll(query: QueryBookingDto) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        userId,
        tripId,
        dateFrom,
        dateTo,
      } = query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: Prisma.BookingsWhereInput = {
        AND: [
          status ? { status } : {},
          userId ? { userId } : {},
          tripId ? { tripId } : {},
          dateFrom || dateTo
            ? {
                createdAt: {
                  gte: dateFrom ? new Date(dateFrom) : undefined,
                  lte: dateTo
                    ? new Date(new Date(dateTo).setHours(23, 59, 59, 999))
                    : undefined,
                },
              }
            : {},
        ],
      };

      const [bookings, total] = await Promise.all([
        this.prisma.bookings.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { fullName: true, email: true, phoneNumber: true },
            },
            trip: { select: { tripName: true, startTime: true } },
            route: { select: { name: true } },
            seat: { select: { seatNumber: true } },
          },
        }),
        this.prisma.bookings.count({ where }),
      ]);

      return {
        message: 'Fetched bookings successfully',
        data: bookings,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch bookings', {
        cause: err,
      });
    }
  }

  async findAllByUser(userId: string) {
    try {
      const bookings = await this.prisma.bookings.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          trip: { select: { tripName: true, startTime: true } },
          route: { select: { name: true } },
          seat: { select: { seatNumber: true } },
          pickupStop: { include: { location: true } },
          dropoffStop: { include: { location: true } },
        },
      });
      return {
        message: 'Fetched user bookings successfully',
        data: bookings,
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch user bookings', {
        cause: err,
      });
    }
  }

  async findByGuestInfo(lookupDto: LookupBookingDto) {
    try {
      const { email, phoneNumber } = lookupDto;

      const bookings = await this.prisma.bookings.findMany({
        where: {
          customerInfo: {
            path: ['email'],
            equals: email,
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          trip: { select: { tripName: true, startTime: true, endTime: true } },
          route: {
            select: {
              name: true,
              origin: { select: { name: true, city: true } },
              destination: { select: { name: true, city: true } },
            },
          },
          seat: { select: { seatNumber: true } },
          pickupStop: { include: { location: true } },
          dropoffStop: { include: { location: true } },
        },
      });

      const filteredBookings = bookings.filter((booking) => {
        const info = booking.customerInfo as { phoneNumber?: string };
        return info?.phoneNumber === phoneNumber;
      });

      return {
        message: 'Fetched guest bookings successfully',
        data: filteredBookings,
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch guest bookings', {
        cause: err,
      });
    }
  }

  async findByTicketCode(ticketCode: string, email: string) {
    try {
      const booking = await this.prisma.bookings.findUnique({
        where: { ticketCode },
        include: {
          trip: { select: { tripName: true, startTime: true, endTime: true } },
          route: {
            select: {
              name: true,
              origin: { select: { name: true, city: true } },
              destination: { select: { name: true, city: true } },
            },
          },
          seat: { select: { seatNumber: true } },
          pickupStop: { include: { location: true } },
          dropoffStop: { include: { location: true } },
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      const customerInfo = booking.customerInfo as { email?: string };
      if (customerInfo?.email !== email) {
        throw new NotFoundException('Booking not found');
      }

      return {
        message: 'Fetched booking successfully',
        data: booking,
      };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch booking', {
        cause: err,
      });
    }
  }

  async cancel(id: string, userId?: string) {
    try {
      const booking = await this.prisma.bookings.findUnique({
        where: { id },
        select: { status: true, userId: true, tripId: true, seatId: true },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      if (userId && booking.userId && booking.userId !== userId) {
        throw new BadRequestException(
          'You do not have permission to cancel this booking',
        );
      }

      if (booking.status === BookingStatus.cancelled) {
        throw new BadRequestException('Booking is already cancelled');
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const updatedBooking = await tx.bookings.update({
          where: { id },
          data: { status: BookingStatus.cancelled },
        });

        const locks = await tx.seatSegmentLocks.findMany({
          where: { bookingId: id },
          select: { segmentId: true },
        });

        await tx.seatSegmentLocks.deleteMany({
          where: { bookingId: id },
        });

        // Notify via WebSocket
        const segmentIds = locks.map((lock) => lock.segmentId);
        this.bookingsGateway.emitSeatUnlocked(
          booking.tripId,
          booking.seatId,
          segmentIds,
        );

        return updatedBooking;
      });

      return { message: 'Booking cancelled successfully', data: result };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to cancel booking', {
        cause: err,
      });
    }
  }

  async cancelByTicketCode(ticketCode: string, email: string) {
    try {
      const booking = await this.prisma.bookings.findUnique({
        where: { ticketCode },
        select: { id: true, status: true, customerInfo: true },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      const customerInfo = booking.customerInfo as { email?: string };
      if (customerInfo?.email !== email) {
        throw new NotFoundException('Booking not found');
      }

      if (booking.status === BookingStatus.cancelled) {
        throw new BadRequestException('Booking is already cancelled');
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const updatedBooking = await tx.bookings.update({
          where: { id: booking.id },
          data: { status: BookingStatus.cancelled },
        });

        await tx.seatSegmentLocks.deleteMany({
          where: { bookingId: booking.id },
        });

        return updatedBooking;
      });

      return { message: 'Booking cancelled successfully', data: result };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to cancel booking', {
        cause: err,
      });
    }
  }

  async modify(
    id: string,
    userId: string,
    modifyData: {
      tripId?: string;
      seatId?: string;
      routeId?: string;
      customerInfo?: any;
    },
  ) {
    try {
      const booking = await this.prisma.bookings.findUnique({
        where: { id },
        include: {
          trip: true,
          seatLocks: true,
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      if (booking.userId !== userId) {
        throw new BadRequestException(
          'You do not have permission to modify this booking',
        );
      }

      if (booking.status === BookingStatus.cancelled) {
        throw new BadRequestException('Cannot modify a cancelled booking');
      }

      // Check if trip has already departed
      if (new Date() > booking.trip.startTime) {
        throw new BadRequestException(
          'Cannot modify booking for a trip that has already departed',
        );
      }

      const result = await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const updatedData: Prisma.BookingsUpdateInput = {}; // If changing seat or trip, handle seat locks
          if (modifyData.seatId || modifyData.tripId || modifyData.routeId) {
            const newTripId = modifyData.tripId || booking.tripId;
            const newSeatId = modifyData.seatId || booking.seatId;
            const newRouteId = modifyData.routeId || booking.routeId;

            // Calculate new segments
            const { segmentIds, pickupStopId, dropoffStopId } =
              await this.calculateDetailsFromRoute(newTripId, newRouteId);

            // Check if new seat is available
            const conflictLock = await tx.seatSegmentLocks.findFirst({
              where: {
                tripId: newTripId,
                seatId: newSeatId,
                segmentId: { in: segmentIds },
                bookingId: { not: id },
              },
            });

            if (conflictLock) {
              throw new ConflictException(
                'Selected seat is already booked for this segment',
              );
            }

            // Get new price if route changed
            let newPrice = booking.price;
            if (modifyData.routeId || modifyData.tripId) {
              const tripRoute = await tx.tripRouteMap.findUnique({
                where: {
                  tripId_routeId: {
                    tripId: newTripId,
                    routeId: newRouteId,
                  },
                },
                select: { price: true },
              });

              if (!tripRoute) {
                throw new NotFoundException(
                  'Route not available for selected trip',
                );
              }
              newPrice = tripRoute.price;
            }

            // Remove old locks
            await tx.seatSegmentLocks.deleteMany({
              where: { bookingId: id },
            });

            // Create new locks
            await tx.seatSegmentLocks.createMany({
              data: segmentIds.map((segId) => ({
                tripId: newTripId,
                seatId: newSeatId,
                segmentId: segId,
                bookingId: id,
              })),
            });

            Object.assign(updatedData, {
              ...(modifyData.tripId && {
                trip: { connect: { id: newTripId } },
              }),
              ...(modifyData.seatId && {
                seat: { connect: { id: newSeatId } },
              }),
              ...(modifyData.routeId && {
                route: { connect: { id: newRouteId } },
              }),
              pickupStop: { connect: { id: pickupStopId } },
              dropoffStop: { connect: { id: dropoffStopId } },
              price: newPrice,
            });

            // Emit WebSocket events
            if (booking.tripId !== newTripId || booking.seatId !== newSeatId) {
              // Unlock old seat
              const oldSegmentIds = booking.seatLocks.map((l) => l.segmentId);
              this.bookingsGateway.emitSeatUnlocked(
                booking.tripId,
                booking.seatId,
                oldSegmentIds,
              );
              // Lock new seat
              this.bookingsGateway.emitSeatSold(
                newTripId,
                newSeatId,
                segmentIds,
              );
            }
          }

          // Update customer info if provided
          if (modifyData.customerInfo) {
            Object.assign(updatedData, {
              customerInfo:
                modifyData.customerInfo as unknown as Prisma.InputJsonValue,
            });
          }

          const updatedBooking = await tx.bookings.update({
            where: { id },
            data: updatedData,
            include: {
              trip: { select: { tripName: true, startTime: true } },
              seat: { select: { seatNumber: true } },
              route: { select: { name: true } },
              pickupStop: { include: { location: true } },
              dropoffStop: { include: { location: true } },
            },
          });

          return updatedBooking;
        },
      );

      return { message: 'Booking modified successfully', data: result };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException ||
        err instanceof ConflictException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to modify booking', {
        cause: err,
      });
    }
  }

  async getStats() {
    try {
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      const [
        totalBookings,
        bookingsToday,
        statusBreakdown,
        revenueTotal,
        revenueToday,
      ] = await Promise.all([
        this.prisma.bookings.count(),

        this.prisma.bookings.count({
          where: { createdAt: { gte: startOfToday } },
        }),

        this.prisma.bookings.groupBy({
          by: ['status'],
          _count: { id: true },
        }),

        this.prisma.bookings.aggregate({
          where: { status: BookingStatus.confirmed },
          _sum: { price: true },
        }),

        this.prisma.bookings.aggregate({
          where: {
            status: BookingStatus.confirmed,
            createdAt: { gte: startOfToday },
          },
          _sum: { price: true },
        }),
      ]);

      const breakdown = statusBreakdown.reduce(
        (acc, curr) => {
          acc[curr.status] = curr._count.id;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        message: 'Fetched dashboard stats successfully',
        data: {
          bookings: {
            total: totalBookings,
            today: bookingsToday,
            breakdown: {
              pendingPayment: breakdown[BookingStatus.pendingPayment] || 0,
              confirmed: breakdown[BookingStatus.confirmed] || 0,
              cancelled: breakdown[BookingStatus.cancelled] || 0,
            },
          },
          revenue: {
            total: Number(revenueTotal._sum.price) || 0,
            today: Number(revenueToday._sum.price) || 0,
          },
        },
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch booking stats', {
        cause: err,
      });
    }
  }

  async getRevenueChart() {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT 
          TO_CHAR("createdAt", 'YYYY-MM-DD') as date, 
          COALESCE(SUM(price), 0) as revenue
        FROM "Bookings"
        WHERE status = 'confirmed'
          AND "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
        ORDER BY date ASC;
      `;

      const formattedData = (
        result as {
          date: string;
          revenue: number | string;
        }[]
      ).map((item) => ({
        date: item.date,
        revenue: Number(item.revenue),
      }));

      return {
        message: 'Fetched revenue chart successfully',
        data: formattedData,
      };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to get revenue chart');
    }
  }

  async getBookingTrends() {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT 
          EXTRACT(HOUR FROM t."startTime") as hour, 
          COUNT(b.id) as count
        FROM "Bookings" b
        JOIN "Trips" t ON b."tripId" = t.id
        WHERE b.status = 'confirmed'
        GROUP BY EXTRACT(HOUR FROM t."startTime")
        ORDER BY hour ASC;
      `;

      const fullDayStats = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        bookings: 0,
      }));

      (
        result as {
          hour: number | string;
          count: bigint | number;
        }[]
      ).forEach((item) => {
        const hourIndex = Number(item.hour);
        if (fullDayStats[hourIndex]) {
          fullDayStats[hourIndex].bookings = Number(item.count);
        }
      });

      return {
        message: 'Fetched booking trends successfully',
        data: fullDayStats,
      };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to get booking trends');
    }
  }

  async getOccupancyRate() {
    try {
      const trips = await this.prisma.trips.findMany({
        where: {
          startTime: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
        include: {
          _count: {
            select: { bookings: { where: { status: 'confirmed' } } },
          },
          bus: {
            include: {
              _count: { select: { seats: true } },
            },
          },
        },
      });

      if (trips.length === 0) {
        return {
          message: 'Fetched occupancy rate successfully',
          data: { averageOccupancy: 0, totalTrips: 0 },
        };
      }

      let totalPercentage = 0;

      trips.forEach((trip) => {
        const totalSeats = trip.bus._count.seats || 1;
        const bookedSeats = trip._count.bookings;
        const occupancy = (bookedSeats / totalSeats) * 100;
        totalPercentage += occupancy;
      });

      const averageOccupancy = totalPercentage / trips.length;

      return {
        message: 'Fetched occupancy rate successfully',
        data: {
          averageOccupancy: Math.round(averageOccupancy * 100) / 100,
          totalTrips: trips.length,
        },
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to get occupancy rate', {
        cause: err,
      });
    }
  }

  async sendETicketEmail(ticketCode: string) {
    try {
      const ticketData = await this.eTicketService.getBookingData(ticketCode);
      const pdfBuffer = await this.eTicketService.generatePDF(ticketCode);

      await this.emailService.sendETicketEmail(
        ticketData.email,
        ticketCode,
        ticketData.passengerName,
        {
          from: ticketData.from,
          to: ticketData.to,
          departureTime: ticketData.departureTime,
          seatNumber: ticketData.seatNumber,
        },
        pdfBuffer,
      );

      return { message: 'E-ticket email sent successfully' };
    } catch (err) {
      console.error('Failed to send e-ticket email:', err);
      throw new InternalServerErrorException('Failed to send e-ticket email', {
        cause: err,
      });
    }
  }

  async sendBookingConfirmationSms(ticketCode: string) {
    try {
      // Check if SMS service is available
      if (!this.smsService.isServiceAvailable()) {
        console.log('SMS service not configured, skipping confirmation SMS');
        return;
      }

      const ticketData = await this.eTicketService.getBookingData(ticketCode);

      // Extract phone number from customerInfo
      const booking = await this.prisma.bookings.findUnique({
        where: { ticketCode },
        select: { customerInfo: true, price: true },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      const customerInfo = booking.customerInfo as Record<string, any>;
      const phoneNumber = (customerInfo?.phone || customerInfo?.phoneNumber) as
        | string
        | undefined;

      if (!phoneNumber) {
        console.log('No phone number found in booking, skipping SMS');
        return;
      }

      await this.smsService.sendBookingConfirmationSms(phoneNumber, {
        customerName: ticketData.passengerName,
        ticketCode,
        tripDate: new Date(ticketData.departureTime).toLocaleDateString(
          'vi-VN',
        ),
        tripTime: new Date(ticketData.departureTime).toLocaleTimeString(
          'vi-VN',
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        ),
        origin: ticketData.from,
        destination: ticketData.to,
        seatNumber: ticketData.seatNumber,
        price: new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(Number(booking.price)),
      });

      console.log(`Booking confirmation SMS sent to ${phoneNumber}`);
      return { message: 'Booking confirmation SMS sent successfully' };
    } catch (err) {
      console.error('Failed to send booking confirmation SMS:', err);
      // Don't throw error, just log it so it doesn't block the booking
    }
  }
}
