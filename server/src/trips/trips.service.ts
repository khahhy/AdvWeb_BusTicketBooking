import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { CreateTripDto } from 'src/trips/dto/create-trip.dto';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTripDto) {
    const { busId, stops } = dto;

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

  async findAll() {
    return this.prisma.trips.findMany();
  }

  async findOne(id: string) {
    return this.prisma.trips.findUnique({
      where: { id },
      include: {
        bus: true,
        tripStops: true,
        segments: true,
      },
    });
  }
}
