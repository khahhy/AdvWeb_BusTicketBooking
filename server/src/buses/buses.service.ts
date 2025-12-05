import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import { RedisCacheService } from 'src/cache/redis-cache.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { QueryBusesDto } from './dto/query-buses.dto';
import { Prisma, BusType, Buses, Seats } from '@prisma/client';

@Injectable()
export class BusesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogsService,
    private readonly cacheManager: RedisCacheService,
  ) {}

  private generateSeats(busId: string, capacity: number = 32) {
    const seats: Array<{
      busId: string;
      seatNumber: string;
      coordinates: { x: number; y: number };
    }> = [];

    if (capacity === 16) {
      const seatLayout = [
        { num: '01', x: 2, y: 0 },
        { num: '02', x: 1, y: 0 },
        { num: '03', x: 2, y: 1 },
        { num: '04', x: 1, y: 1 },
        { num: '05', x: 0, y: 1 },
        { num: '06', x: 2, y: 2 },
        { num: '07', x: 1, y: 2 },
        { num: '08', x: 0, y: 2 },
        { num: '09', x: 2, y: 3 },
        { num: '10', x: 1, y: 3 },
        { num: '11', x: 0, y: 3 },
        { num: '12', x: 3, y: 4 },
        { num: '13', x: 2, y: 4 },
        { num: '14', x: 1, y: 4 },
        { num: '15', x: 0, y: 4 },
      ];

      seatLayout.forEach((s) => {
        seats.push({
          busId,
          seatNumber: s.num,
          coordinates: { x: s.x, y: s.y },
        });
      });
    } else {
      let totalRows = 0;

      switch (capacity) {
        case 28:
          totalRows = 7;
          break;
        case 32:
        default:
          totalRows = 8;
          break;
      }

      let seatCounter = 1;

      for (let row = 0; row < totalRows; row++) {
        for (let col = 0; col < 4; col++) {
          seats.push({
            busId,
            seatNumber: String(seatCounter).padStart(2, '0'),
            coordinates: { x: col, y: row },
          });
          seatCounter++;
        }
      }
    }

    return seats;
  }

  async create(
    createBusDto: CreateBusDto,
    userId: string,
    ip: string,
    userAgent: string,
  ) {
    try {
      const exists = await this.prisma.buses.findUnique({
        where: { plate: createBusDto.plate },
      });
      if (exists) {
        throw new BadRequestException('Plate already exists');
      }

      const bus = await this.prisma.buses.create({
        data: {
          plate: createBusDto.plate,
          busType: createBusDto.busType || BusType.standard,
          amenities: createBusDto.amenities || Prisma.JsonNull,
        },
      });

      const seats = this.generateSeats(bus.id, 32);

      await this.prisma.seats.createMany({
        data: seats,
      });

      await this.activityLogService.logAction({
        userId: userId,
        action: 'CREATE_BUS',
        entityId: bus.id,
        entityType: 'Buses',
        metadata: { busId: bus.id, plate: bus.plate },
        ipAddress: ip,
        userAgent: userAgent,
      });

      await this.cacheManager.delByPattern('buses:all*');

      return { message: 'Bus created successfully', data: bus };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to create bus', {
        cause: err,
      });
    }
  }

  async findAll(query?: QueryBusesDto) {
    try {
      const cacheKey = `buses:all:${JSON.stringify(query || {})}`;

      const cachedData = await this.cacheManager.get<Buses[]>(cacheKey);
      if (cachedData) {
        return { message: 'Fetched all buses successfully', data: cachedData };
      }
      const where: Prisma.BusesWhereInput = {};

      if (query?.busType && query.busType.length > 0) {
        where.busType = {
          in: query.busType,
        };
      }

      if (query?.amenities && query.amenities.length > 0) {
        const amenityConditions = query.amenities.map((amenity) => ({
          amenities: {
            path: [amenity],
            equals: true,
          },
        }));
        where.AND = amenityConditions;
      }

      const buses = await this.prisma.buses.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      await this.cacheManager.set(cacheKey, buses, 600);

      return { message: 'Fetched all buses successfully', data: buses };
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch buses', {
        cause: err,
      });
    }
  }

  async findOne(id: string) {
    try {
      const cacheKey = `buses:detail:${id}`;
      const cachedData = await this.cacheManager.get<Buses>(cacheKey);

      if (cachedData)
        return { message: 'Fetched bus successfully', data: cachedData };

      const bus = await this.prisma.buses.findUnique({
        where: { id },
      });
      if (!bus) throw new NotFoundException('Bus not found');

      await this.cacheManager.set(cacheKey, bus, 86400);

      return { message: 'Fetched bus successfully', data: bus };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch bus', {
        cause: err,
      });
    }
  }

  async update(
    id: string,
    data: UpdateBusDto,
    userId: string,
    ip: string,
    userAgent: string,
  ) {
    try {
      const bus = await this.prisma.buses.findUnique({ where: { id } });
      if (!bus) throw new NotFoundException('Bus not found');

      const updatedBus = await this.prisma.buses.update({
        where: { id },
        data: {
          ...data,
          amenities: data.amenities ?? undefined,
        },
      });

      await this.activityLogService.logAction({
        userId: userId,
        action: 'UPDATE_BUS',
        entityId: bus.id,
        entityType: 'Buses',
        metadata: { busId: bus.id, changes: data },
        ipAddress: ip,
        userAgent: userAgent,
      });

      await this.cacheManager.del(`buses:detail:${id}`);
      await this.cacheManager.delByPattern('buses:all*');

      return { message: 'Bus updated successfully', data: updatedBus };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to update bus', {
        cause: err,
      });
    }
  }

  async remove(id: string, userId: string, ip: string, userAgent: string) {
    try {
      const bus = await this.prisma.buses.findUnique({ where: { id } });
      if (!bus) throw new NotFoundException('Bus not found');

      const [, deletedBus] = await this.prisma.$transaction([
        this.prisma.seats.deleteMany({ where: { busId: id } }),
        this.prisma.buses.delete({ where: { id } }),
      ]);

      await this.activityLogService.logAction({
        userId: userId,
        action: 'DELETE_BUS',
        entityId: bus.id,
        entityType: 'Buses',
        metadata: { busId: bus.id, plate: bus.plate },
        ipAddress: ip,
        userAgent: userAgent,
      });

      await Promise.all([
        this.cacheManager.del(`buses:detail:${id}`),
        this.cacheManager.del(`buses:seats:${id}`),
        this.cacheManager.delByPattern('buses:all*'),
      ]);

      return { message: 'Bus deleted successfully', data: deletedBus };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete bus', {
        cause: err,
      });
    }
  }

  async getSeats(busId: string) {
    try {
      const cacheKey = `buses:seats:${busId}`;
      const cachedSeats = await this.cacheManager.get<Seats[]>(cacheKey);

      if (cachedSeats)
        return {
          message: 'Fetched seats for bus successfully',
          data: cachedSeats,
        };

      const bus = await this.prisma.buses.findUnique({ where: { id: busId } });
      if (!bus) throw new NotFoundException('Bus not found');

      const seats = await this.prisma.seats.findMany({
        where: { busId },
        orderBy: { seatNumber: 'asc' },
      });

      await this.cacheManager.set(cacheKey, seats, 604800);

      return { message: 'Fetched seats for bus successfully', data: seats };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch seats', {
        cause: err,
      });
    }
  }
}
