import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { GetRouteTripsDto } from './dto/get-route-trips';
import { CreateTripRouteMapDto } from './dto/create-trip-route-map.dto';
import {
  Prisma,
  TripStatus,
  Trips,
  TripStops,
  Locations,
} from '@prisma/client';

@Injectable()
export class RoutesService {
  private readonly PRICE_PER_KM = 1400;
  private readonly WEEKEND_SURCHARGE = 0.05;
  private readonly HOLIDAY_SURCHARGE = 0.1;

  constructor(private readonly prisma: PrismaService) {}

  async create(createRouteDto: CreateRouteDto) {
    try {
      const { originLocationId, destinationLocationId } = createRouteDto;

      if (originLocationId === destinationLocationId) {
        throw new BadRequestException(
          'Origin and Destination cannot be the same location',
        );
      }

      const [origin, destination] = await Promise.all([
        this.prisma.locations.findUnique({ where: { id: originLocationId } }),
        this.prisma.locations.findUnique({
          where: { id: destinationLocationId },
        }),
      ]);

      if (!origin || !destination) {
        throw new NotFoundException('Origin or Destination location not found');
      }

      const existingRoute = await this.prisma.routes.findFirst({
        where: {
          originLocationId,
          destinationLocationId,
        },
      });

      if (existingRoute) {
        throw new BadRequestException('This route already exists');
      }

      const routeName = `${origin.city} - ${destination.city}`;

      const route = await this.prisma.routes.create({
        data: {
          originLocationId,
          destinationLocationId,
          name: routeName,
          description: createRouteDto.description,
          isActive: false,
        },
        include: {
          origin: true,
          destination: true,
        },
      });

      return { message: 'Route created successfully', data: route };
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to create route', {
        cause: err,
      });
    }
  }

  async findAll(originId?: string, destinationId?: string, isActive?: boolean) {
    try {
      const where: Prisma.RoutesWhereInput = {};
      if (originId) where.originLocationId = originId;
      if (destinationId) where.destinationLocationId = destinationId;
      if (isActive !== undefined) where.isActive = isActive;

      const routes = await this.prisma.routes.findMany({
        where,
        include: {
          origin: true,
          destination: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return { message: 'Fetched routes successfully', data: routes };
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch routes', {
        cause: err,
      });
    }
  }

  async findOne(id: string) {
    try {
      const route = await this.prisma.routes.findUnique({
        where: { id },
        include: {
          origin: true,
          destination: true,
          tripRoutes: {
            include: {
              trip: true,
            },
          },
        },
      });

      if (!route) throw new NotFoundException('Route not found');

      return { message: 'Fetched route successfully', data: route };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch route', {
        cause: err,
      });
    }
  }

  async update(id: string, updateRouteDto: UpdateRouteDto) {
    try {
      const existingRoute = await this.prisma.routes.findUnique({
        where: { id },
        include: { origin: true, destination: true },
      });

      if (!existingRoute) throw new NotFoundException('Route not found');

      let newName = existingRoute.name;

      if (
        (updateRouteDto.originLocationId &&
          updateRouteDto.originLocationId !== existingRoute.originLocationId) ||
        (updateRouteDto.destinationLocationId &&
          updateRouteDto.destinationLocationId !==
            existingRoute.destinationLocationId)
      ) {
        const newOriginId =
          updateRouteDto.originLocationId || existingRoute.originLocationId;
        const newDestId =
          updateRouteDto.destinationLocationId ||
          existingRoute.destinationLocationId;

        if (newOriginId === newDestId) {
          throw new BadRequestException(
            'Origin and Destination cannot be the same location',
          );
        }

        const [origin, destination] = await Promise.all([
          this.prisma.locations.findUnique({ where: { id: newOriginId } }),
          this.prisma.locations.findUnique({ where: { id: newDestId } }),
        ]);

        if (!origin || !destination) {
          throw new NotFoundException(
            'New Origin or Destination location not found',
          );
        }
        newName = `${origin.city} - ${destination.city}`;
      }

      const updatedRoute = await this.prisma.routes.update({
        where: { id },
        data: {
          ...updateRouteDto,
          name: newName,
        },
        include: {
          origin: true,
          destination: true,
        },
      });

      return { message: 'Route updated successfully', data: updatedRoute };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to update route', {
        cause: err,
      });
    }
  }

  async remove(id: string) {
    try {
      const route = await this.prisma.routes.findUnique({ where: { id } });
      if (!route) throw new NotFoundException('Route not found');

      const bookingCount = await this.prisma.bookings.count({
        where: { routeId: id },
      });

      if (bookingCount > 0) {
        throw new BadRequestException(
          `Cannot delete this Route. There are ${bookingCount} bookings associated with it.`,
        );
      }

      await this.prisma.$transaction([
        this.prisma.tripRouteMap.deleteMany({
          where: { routeId: id },
        }),
        this.prisma.routes.delete({
          where: { id },
        }),
      ]);

      return {
        message: 'Route and associated trip-maps deleted successfully',
      };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to delete route', {
        cause: err,
      });
    }
  }

  async findTripsForRoute(routeId: string, query: GetRouteTripsDto) {
    try {
      const route = await this.prisma.routes.findUnique({
        where: { id: routeId },
      });
      if (!route) throw new NotFoundException('Route not found');

      const { startDate, endDate } = query;
      const whereTrip: Prisma.TripsWhereInput = {
        status: TripStatus.scheduled,
      };

      if (startDate || endDate) {
        whereTrip.startTime = {};
        if (startDate) whereTrip.startTime.gte = new Date(startDate);
        if (endDate) whereTrip.startTime.lte = new Date(endDate);
      }

      const trips = await this.prisma.trips.findMany({
        where: {
          ...whereTrip,
          AND: [
            { tripStops: { some: { locationId: route.originLocationId } } },
            {
              tripStops: { some: { locationId: route.destinationLocationId } },
            },
          ],
        },
        include: {
          tripStops: {
            include: { location: true },
            orderBy: { sequence: 'asc' },
          },
          bus: true,
        },
      });

      const result = trips
        .map((trip) => {
          const pricing = this.calculateTripRoutePrice(
            trip,
            route.originLocationId,
            route.destinationLocationId,
          );

          if (!pricing) return null;

          return {
            tripId: trip.id,
            startTime: trip.startTime,
            endTime: trip.endTime,
            busName: trip.bus.plate,
            amenities: trip.bus.amenities,
            pickupLocation: pricing.pickupName,
            dropoffLocation: pricing.dropoffName,
            pricing: pricing.details,
          };
        })
        .filter((item) => item !== null);

      return {
        message: `Found ${result.length} trips matching this route`,
        data: result,
      };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to find trips for route', {
        cause: err,
      });
    }
  }

  async createTripRouteMap(dto: CreateTripRouteMapDto) {
    try {
      const { tripId, routeId, manualPrice } = dto;

      const existingMap = await this.prisma.tripRouteMap.findUnique({
        where: { tripId_routeId: { tripId, routeId } },
      });

      if (existingMap) {
        throw new ConflictException(
          'This configuration for Trip and Route already exists.',
        );
      }

      const route = await this.prisma.routes.findUnique({
        where: { id: routeId },
      });
      if (!route) throw new NotFoundException('Route not found');

      const trip = await this.prisma.trips.findUnique({
        where: { id: tripId },
        include: {
          tripStops: {
            include: { location: true },
            orderBy: { sequence: 'asc' },
          },
        },
      });
      if (!trip) throw new NotFoundException('Trip not found');

      let finalPrice = 0;

      if (manualPrice !== undefined && manualPrice !== null) {
        finalPrice = manualPrice;
      } else {
        const pricingCalc = this.calculateTripRoutePrice(
          trip,
          route.originLocationId,
          route.destinationLocationId,
        );

        if (!pricingCalc) {
          throw new BadRequestException(
            'Invalid Trip for this Route (Stops do not match or wrong sequence)',
          );
        }
        finalPrice = pricingCalc.details.finalPrice;
      }

      const operations: Prisma.PrismaPromise<unknown>[] = [
        this.prisma.tripRouteMap.create({
          data: {
            tripId,
            routeId,
            price: finalPrice,
          },
        }),
      ];

      if (!route.isActive) {
        operations.push(
          this.prisma.routes.update({
            where: { id: routeId },
            data: { isActive: true },
          }),
        );
      }

      const [newTripRouteMap] = await this.prisma.$transaction(operations);

      return {
        message: 'Trip Route Map created successfully',
        data: newTripRouteMap,
      };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof ConflictException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Failed to create trip route map',
        { cause: err },
      );
    }
  }

  async removeTripRouteMap(tripId: string, routeId: string) {
    try {
      const tripRouteMap = await this.prisma.tripRouteMap.findUnique({
        where: {
          tripId_routeId: { tripId, routeId },
        },
      });

      if (!tripRouteMap) {
        throw new NotFoundException('TripRouteMap configuration not found');
      }

      const bookingCount = await this.prisma.bookings.count({
        where: {
          tripId: tripId,
          routeId: routeId,
        },
      });

      if (bookingCount > 0) {
        throw new BadRequestException(
          `Cannot delete this Trip configuration. There are ${bookingCount} bookings associated with it.`,
        );
      }

      await this.prisma.tripRouteMap.delete({
        where: {
          tripId_routeId: { tripId, routeId },
        },
      });

      return { message: 'TripRouteMap deleted successfully' };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Failed to delete trip route map',
        { cause: err },
      );
    }
  }

  async getTripRouteMap(tripId: string, routeId: string) {
    try {
      const data = await this.prisma.tripRouteMap.findUnique({
        where: {
          tripId_routeId: { tripId, routeId },
        },
        include: {
          trip: {
            include: {
              bus: true,
            },
          },
          route: {
            include: {
              origin: true,
              destination: true,
            },
          },
        },
      });

      if (!data) {
        throw new NotFoundException('TripRouteMap configuration not found');
      }

      return {
        message: 'Fetched trip detail successfully',
        data: {
          tripId: data.tripId,
          routeId: data.routeId,
          price: data.price,
          tripName: data.trip.tripName,
          startTime: data.trip.startTime,
          endTime: data.trip.endTime,
          status: data.trip.status,

          bus: {
            plate: data.trip.bus.plate,
            amenities: data.trip.bus.amenities,
          },

          routeName: data.route.name,
          origin: data.route.origin.name,
          originCity: data.route.origin.city,
          destination: data.route.destination.name,
          destinationCity: data.route.destination.city,
        },
      };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        'Failed to get trip route map detail',
        { cause: err },
      );
    }
  }

  private calculateTripRoutePrice(
    trip: Trips & { tripStops: (TripStops & { location: Locations })[] },
    originId: string,
    destinationId: string,
  ) {
    const originStop = trip.tripStops.find((s) => s.locationId === originId);
    const destStop = trip.tripStops.find((s) => s.locationId === destinationId);

    if (!originStop || !destStop || originStop.sequence >= destStop.sequence) {
      return null;
    }

    const distanceKm = this.calculateSegmentDistance(
      trip.tripStops,
      originStop.sequence,
      destStop.sequence,
    );

    const priceDetails = this.calculatePrice(trip.startTime, distanceKm);

    return {
      pickupName: originStop.location.name,
      dropoffName: destStop.location.name,
      details: {
        ...priceDetails,
        currency: 'VND',
      },
    };
  }

  private calculateSegmentDistance(
    sortedStops: (TripStops & { location: Locations })[],
    startSeq: number,
    endSeq: number,
  ): number {
    let totalDistance = 0;
    for (let i = 0; i < sortedStops.length - 1; i++) {
      const currentStop = sortedStops[i];
      const nextStop = sortedStops[i + 1];

      if (currentStop.sequence >= startSeq && nextStop.sequence <= endSeq) {
        if (
          currentStop.location.latitude &&
          currentStop.location.longitude &&
          nextStop.location.latitude &&
          nextStop.location.longitude
        ) {
          totalDistance += this.getDistanceFromLatLonInKm(
            currentStop.location.latitude,
            currentStop.location.longitude,
            nextStop.location.latitude,
            nextStop.location.longitude,
          );
        }
      }
    }
    return totalDistance;
  }

  private getDistanceFromLatLonInKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  private calculatePrice(date: Date, distanceKm: number) {
    const basePrice = Math.round(distanceKm * this.PRICE_PER_KM);
    let surchargePercent = 0;
    let reason = 'Normal day';

    const tripDate = new Date(date);
    const dayOfWeek = tripDate.getDay();
    const day = tripDate.getDate();
    const month = tripDate.getMonth() + 1;

    const isHoliday =
      (day === 30 && month === 4) ||
      (day === 1 && month === 5) ||
      (day === 2 && month === 9);

    if (isHoliday) {
      surchargePercent = this.HOLIDAY_SURCHARGE;
      reason = 'Holiday surcharge';
    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
      surchargePercent = this.WEEKEND_SURCHARGE;
      reason = 'Weekend surcharge';
    }

    const finalPrice = basePrice * (1 + surchargePercent);

    return {
      basePrice,
      surcharge: `${surchargePercent * 100}%`,
      surchargeReason: reason,
      finalPrice: Math.round(finalPrice),
    };
  }
}
