import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Prisma, BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async calculateDetailsFromRoute(tripId: string, routeId: string) {
    const route = await this.prisma.routes.findUnique({
      where: { id: routeId },
      select: { originLocationId: true, destinationLocationId: true },
    });
    if (!route) throw new NotFoundException('Route not found');

    const stops = await this.prisma.tripStops.findMany({
      where: {
        tripId,
        locationId: {
          in: [route.originLocationId, route.destinationLocationId],
        },
      },
      select: { id: true, sequence: true, locationId: true },
    });

    const startStop = stops.find(
      (s) => s.locationId === route.originLocationId,
    );
    const endStop = stops.find(
      (s) => s.locationId === route.destinationLocationId,
    );

    if (!startStop || !endStop) {
      throw new BadRequestException(
        'Trip does not stop at the Route locations',
      );
    }
    if (startStop.sequence >= endStop.sequence) {
      throw new BadRequestException('Invalid route direction');
    }

    const segments = await this.prisma.tripSegments.findMany({
      where: {
        tripId,
        fromStop: { sequence: { gte: startStop.sequence } },
        toStop: { sequence: { lte: endStop.sequence } },
      },
      select: { id: true },
    });

    return {
      segmentIds: segments.map((s) => s.id),
      pickupStopId: startStop.id,
      dropoffStopId: endStop.id,
    };
  }

  async create(createBookingDto: CreateBookingDto) {
    try {
      const { userId, tripId, seatId, routeId, customerInfo } =
        createBookingDto;

      const { segmentIds, pickupStopId, dropoffStopId } =
        await this.calculateDetailsFromRoute(tripId, routeId);

      const result = await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const conflictLock = await tx.seatSegmentLocks.findFirst({
            where: {
              tripId,
              seatId,
              segmentId: { in: segmentIds },
            },
          });

          if (conflictLock) {
            throw new ConflictException(
              'Selected seat is already booked or reserved for this segment.',
            );
          }

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

          const booking = await tx.bookings.create({
            data: {
              userId,
              tripId,
              routeId,
              seatId,
              pickupStopId,
              dropoffStopId,
              customerInfo: customerInfo as unknown as Prisma.InputJsonValue,
              price: tripRoute.price,
              status: BookingStatus.pendingPayment,
            },
          });

          await tx.seatSegmentLocks.createMany({
            data: segmentIds.map((segId) => ({
              tripId,
              seatId,
              segmentId: segId,
              bookingId: booking.id,
            })),
          });

          return {
            bookingId: booking.id,
            status: booking.status,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          };
        },
      );

      return { message: 'Booking initiated successfully', data: result };
    } catch (err) {
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
          trip: { select: { tripName: true, startTime: true } },
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

  async findAll() {
    try {
      const bookings = await this.prisma.bookings.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true, email: true } },
          trip: { select: { tripName: true, startTime: true } },
          route: { select: { name: true } },
          seat: { select: { seatNumber: true } },
        },
      });
      return { message: 'Fetched all bookings successfully', data: bookings };
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

  async cancel(id: string, userId: string) {
    try {
      const booking = await this.prisma.bookings.findUnique({
        where: { id },
        select: { status: true, userId: true },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      if (booking.userId !== userId) {
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

        await tx.seatSegmentLocks.deleteMany({
          where: { bookingId: id },
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
}
