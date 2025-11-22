import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { CreateTripDto } from 'src/trips/dto/create-trip.dto';
import { TripQueryDto } from 'src/trips/dto/trip-query.dto';
import { UpdateTripDto } from 'src/trips/dto/update-trip.dto';
import { Prisma } from '@prisma/client';
import { TripStatus } from '@prisma/client';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTripDto) {
    const { busId, stops } = dto;

    const bus = await this.prisma.buses.findUnique({ where: { id: busId } });
    if (!bus) {
      throw new BadRequestException('Invalid busId');
    }

    if (!stops || stops.length < 2) {
      throw new BadRequestException('A trip must have at least 2 stops');
    }

    for (let i = 0; i < stops.length; i++) {
      const curr = stops[i];
      const arrival = curr.arrivalTime
        ? new Date(curr.arrivalTime).getTime()
        : null;
      const departure = curr.departureTime
        ? new Date(curr.departureTime).getTime()
        : null;

      if (arrival && departure && arrival > departure) {
        throw new BadRequestException(
          `Stop ${i + 1}: arrivalTime must be <= departureTime`,
        );
      }

      if (i > 0) {
        const prevDeparture = stops[i - 1].departureTime
          ? new Date(stops[i - 1].departureTime).getTime()
          : null;

        if (arrival && prevDeparture && arrival < prevDeparture) {
          throw new BadRequestException(
            `Stop ${i + 1}: arrivalTime overlaps with previous stop`,
          );
        }
      }
    }

    const firstStop = stops[0];
    const lastStop = stops[stops.length - 1];

    const firstLocation = await this.prisma.locations.findUnique({
      where: { id: stops[0].locationId },
    });
    const lastLocation = await this.prisma.locations.findUnique({
      where: { id: stops[stops.length - 1].locationId },
    });

    if (!firstLocation || !lastLocation) {
      throw new BadRequestException(
        'Invalid locationId for first or last stop',
      );
    }

    const tripName = `${firstLocation.city} - ${lastLocation.city}`;
    const startTime = firstStop.departureTime;
    const endTime = lastStop.arrivalTime;

    const overlappingTrip = await this.prisma.trips.findFirst({
      where: {
        busId,
        OR: [
          {
            startTime: { lte: endTime },
            endTime: { gte: startTime },
          },
        ],
        status: { not: 'cancelled' },
      },
    });

    if (overlappingTrip) {
      throw new BadRequestException(
        'Bus has another trip overlapping with this time',
      );
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      // create trip
      const trip = await prisma.trips.create({
        data: {
          tripName,
          busId,
          startTime,
          endTime,
        },
      });

      // create trip stops
      await prisma.tripStops.createMany({
        data: stops.map((s, idx) => ({
          tripId: trip.id,
          locationId: s.locationId,
          sequence: idx + 1,
          arrivalTime: idx === 0 ? null : s.arrivalTime,
          departureTime: idx === stops.length - 1 ? null : s.departureTime,
        })),
      });

      const createdStops = await prisma.tripStops.findMany({
        where: { tripId: trip.id },
        orderBy: { sequence: 'asc' },
      });

      // create trip segments
      const segments = createdStops.slice(0, -1).map((fromStop, idx) => {
        const toStop = createdStops[idx + 1];
        const durationMinutes =
          fromStop.departureTime && toStop.arrivalTime
            ? Math.round(
                (new Date(toStop.arrivalTime).getTime() -
                  new Date(fromStop.departureTime).getTime()) /
                  60000,
              )
            : null;

        return {
          tripId: trip.id,
          fromStopId: fromStop.id,
          toStopId: toStop.id,
          segmentIndex: idx + 1,
          durationMinutes,
        };
      });

      await prisma.tripSegments.createMany({ data: segments });

      return prisma.trips.findUnique({
        where: { id: trip.id },
        include: { tripStops: true },
      });
    });

    return result;
  }

  async findAll(query: TripQueryDto) {
    const {
      startTime,
      endTime,
      origin,
      destination,
      status,
      busId,
      includeStops,
      includeSegments,
    } = query;

    const where: Prisma.TripsWhereInput = {};
    const include: Prisma.TripsInclude = {};

    // Filter startTime range
    if (startTime || endTime) {
      where.startTime = {};

      if (startTime) where.startTime.gte = new Date(startTime);
      if (endTime) where.startTime.lte = new Date(endTime);
    }

    // Status
    if (status) {
      where.status = status;
    }

    // Bus
    if (busId) {
      where.busId = busId;
    }

    // Origin filter: trips that contain this location
    if (origin) {
      where.tripStops = {
        some: { locationId: origin },
      };
    }

    // Destination filter: trips that contain this location
    if (destination) {
      where.tripStops = {
        ...where.tripStops,
        some: { locationId: destination },
      };
    }

    // Includes
    include.bus = true;

    if (includeStops === 'true') {
      include.tripStops = {
        orderBy: { sequence: 'asc' },
        include: { location: true },
      };
    }

    if (includeSegments === 'true') {
      include.segments = {
        orderBy: { segmentIndex: 'asc' },
      };
    }

    // Query DB
    const trips = await this.prisma.trips.findMany({
      where,
      include: {
        ...include,
        tripStops: {
          orderBy: { sequence: 'asc' },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // If both origin + destination → need to validate order
    if (origin && destination) {
      return trips.filter((trip) => {
        const stops = trip.tripStops;

        const originStop = stops.find((s) => s.locationId === origin);
        const destStop = stops.find((s) => s.locationId === destination);

        return (
          originStop && destStop && originStop.sequence < destStop.sequence
        );
      });
    }

    return trips;
  }

  async findOne(id: string) {
    const trip = await this.prisma.trips.findUnique({
      where: { id },
      include: {
        bus: true,
        tripStops: {
          orderBy: { sequence: 'asc' },
          include: { location: true },
        },
        segments: {
          orderBy: { segmentIndex: 'asc' },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }

  async update(tripId: string, dto: UpdateTripDto) {
    const trip = await this.prisma.trips.findUnique({
      where: { id: tripId },
      include: { bookings: true, tripStops: true, segments: true },
    });

    if (!trip) throw new NotFoundException('Trip not found');

    if (trip.status !== 'scheduled') {
      throw new BadRequestException('Cannot update trip that is not scheduled');
    }

    if (trip.bookings.length > 0) {
      throw new BadRequestException(
        'Cannot update trip with existing bookings',
      );
    }

    const { busId, stops } = dto;

    // Validate new busId
    if (busId && busId !== trip.busId) {
      const bus = await this.prisma.buses.findUnique({ where: { id: busId } });
      if (!bus) throw new BadRequestException('Invalid busId');
    }

    let startTime: Date = trip.startTime;
    let endTime: Date = trip.endTime;
    let tripName = trip.tripName;

    if (stops) {
      if (stops.length < 2) {
        throw new BadRequestException('A trip must have at least 2 stops');
      }

      for (let i = 0; i < stops.length; i++) {
        const curr = stops[i];
        const arrival = curr.arrivalTime
          ? new Date(curr.arrivalTime).getTime()
          : null;
        const departure = curr.departureTime
          ? new Date(curr.departureTime).getTime()
          : null;

        if (arrival && departure && arrival > departure) {
          throw new BadRequestException(
            `Stop ${i + 1}: arrivalTime must be <= departureTime`,
          );
        }

        if (i > 0) {
          const prevDeparture = stops[i - 1].departureTime
            ? new Date(stops[i - 1].departureTime).getTime()
            : null;

          if (arrival && prevDeparture && arrival < prevDeparture) {
            throw new BadRequestException(
              `Stop ${i + 1}: arrivalTime overlaps with previous stop`,
            );
          }
        }
      }

      const firstStop = stops[0];
      const lastStop = stops[stops.length - 1];

      const firstLocation = await this.prisma.locations.findUnique({
        where: { id: stops[0].locationId },
      });
      const lastLocation = await this.prisma.locations.findUnique({
        where: { id: stops[stops.length - 1].locationId },
      });

      if (!firstLocation || !lastLocation) {
        throw new BadRequestException(
          'Invalid locationId for first or last stop',
        );
      }

      tripName = `${firstLocation.city} - ${lastLocation.city}`;
      startTime = new Date(firstStop.departureTime);
      endTime = new Date(lastStop.arrivalTime);
    }

    const overlappingTrip = await this.prisma.trips.findFirst({
      where: {
        busId,
        id: { not: tripId },
        OR: [
          {
            startTime: { lte: endTime },
            endTime: { gte: startTime },
          },
        ],
        status: { not: 'cancelled' },
      },
    });

    if (overlappingTrip) {
      throw new BadRequestException(
        'Bus has another trip overlapping with this time',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      await prisma.trips.update({
        where: { id: tripId },
        data: { busId: busId ?? trip.busId, tripName, startTime, endTime },
      });

      if (stops) {
        await prisma.tripSegments.deleteMany({ where: { tripId } });
        await prisma.tripStops.deleteMany({ where: { tripId } });

        await prisma.tripStops.createMany({
          data: stops.map((s, idx) => ({
            tripId,
            locationId: s.locationId,
            sequence: idx + 1,
            arrivalTime: idx === 0 ? null : s.arrivalTime,
            departureTime: idx === stops.length - 1 ? null : s.departureTime,
          })),
        });

        const createdStops = await prisma.tripStops.findMany({
          where: { tripId },
          orderBy: { sequence: 'asc' },
        });

        const segments = createdStops.slice(0, -1).map((fromStop, idx) => {
          const toStop = createdStops[idx + 1];
          const durationMinutes =
            fromStop.departureTime && toStop.arrivalTime
              ? Math.round(
                  (new Date(toStop.arrivalTime).getTime() -
                    new Date(fromStop.departureTime).getTime()) /
                    60000,
                )
              : null;
          return {
            tripId,
            fromStopId: fromStop.id,
            toStopId: toStop.id,
            segmentIndex: idx + 1,
            durationMinutes,
          };
        });

        await prisma.tripSegments.createMany({ data: segments });
      }

      return prisma.trips.findUnique({
        where: { id: tripId },
        include: {
          bus: true,
          tripStops: {
            orderBy: { sequence: 'asc' },
            include: { location: true },
          },
          segments: { orderBy: { segmentIndex: 'asc' } },
        },
      });
    });
  }

  async updateStatus(tripId: string, status: TripStatus) {
    const trip = await this.prisma.trips.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');

    if (trip.status === status) {
      throw new BadRequestException(`Trip is already ${status}`);
    }

    const updatedTrip = await this.prisma.trips.update({
      where: { id: tripId },
      data: { status },
    });

    return updatedTrip;
  }

  async remove(tripId: string) {
    const trip = await this.prisma.trips.findUnique({
      where: { id: tripId },
      include: { bookings: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.bookings.length > 0) {
      throw new BadRequestException(
        'Cannot delete trip with existing bookings',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      await prisma.tripSegments.deleteMany({ where: { tripId } });

      await prisma.tripStops.deleteMany({ where: { tripId } });

      return prisma.trips.delete({ where: { id: tripId } });
    });
  }

  async getSeatsStatus(tripId: string, routeId: string) {
    try {
      const trip = await this.prisma.trips.findUnique({
        where: { id: tripId },
        include: {
          bus: {
            include: {
              seats: {
                orderBy: { seatNumber: 'asc' },
              },
            },
          },
        },
      });

      if (!trip) throw new NotFoundException('Trip not found');
      if (!trip.bus)
        throw new NotFoundException('Bus assigned to trip not found');

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
          'This Trip does not cover the selected Route locations',
        );
      }
      if (startStop.sequence >= endStop.sequence) {
        throw new BadRequestException('Invalid route direction for this trip');
      }

      const relevantSegments = await this.prisma.tripSegments.findMany({
        where: {
          tripId,
          fromStop: { sequence: { gte: startStop.sequence } },
          toStop: { sequence: { lte: endStop.sequence } },
        },
        select: { id: true },
      });

      const segmentIds = relevantSegments.map((s) => s.id);

      const lockedSeats = await this.prisma.seatSegmentLocks.findMany({
        where: {
          tripId,
          segmentId: { in: segmentIds },
        },
        select: { seatId: true },
      });

      const lockedSeatIds = new Set(lockedSeats.map((lock) => lock.seatId));

      const result = trip.bus.seats.map((seat) => {
        const isLocked = lockedSeatIds.has(seat.id);
        return {
          seatId: seat.id,
          seatNumber: seat.seatNumber,
          coordinates: seat.coordinates,
          status: isLocked ? 'BOOKED' : 'AVAILABLE',
        };
      });

      return {
        message: 'Fetched seat status successfully',
        data: result,
        meta: {
          totalSeats: result.length,
          availableSeats: result.filter((s) => s.status === 'AVAILABLE').length,
        },
      };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to fetch seat status', {
        cause: err,
      });
    }
  }
}
