import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';

@Injectable()
export class BusesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogsService,
  ) {}

  private generateSeats(busId: string) {
    const seats: Array<{
      busId: string;
      seatNumber: string;
      coordinates: { x: number; y: number };
    }> = [];
    const columns = ['A', 'B', 'C', 'D'];
    const rows = 8;

    for (const col of columns) {
      for (let row = 1; row <= rows; row++) {
        seats.push({
          busId,
          seatNumber: `${col}${row}`,
          coordinates: { x: columns.indexOf(col), y: row - 1 },
        });
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
          amenities: createBusDto.amenities || {},
        },
      });

      const seats = this.generateSeats(bus.id);

      await this.prisma.seats.createMany({
        data: seats,
      });

      await this.activityLogService.logAction({
        userId: userId,
        action: 'CREATE_BUS',
        entityId: bus.id,
        entityType: 'Buses',
        metadata: { busId: bus.id },
        ipAddress: ip,
        userAgent: userAgent,
      });

      return { message: 'Bus created successfully', data: bus };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to create bus', {
        cause: err,
      });
    }
  }

  async findAll() {
    try {
      const buses = await this.prisma.buses.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return { message: 'Fetched all buses successfully', data: buses };
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch buses', {
        cause: err,
      });
    }
  }

  async findOne(id: string) {
    try {
      const bus = await this.prisma.buses.findUnique({
        where: { id },
      });
      if (!bus) throw new NotFoundException('Bus not found');
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
        data,
      });
      await this.activityLogService.logAction({
        userId: userId,
        action: 'UPDATE_BUS',
        entityId: bus.id,
        entityType: 'Buses',
        metadata: { busId: bus.id },
        ipAddress: ip,
        userAgent: userAgent,
      });

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
        metadata: { busId: bus.id },
        ipAddress: ip,
        userAgent: userAgent,
      });

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
      const bus = await this.prisma.buses.findUnique({ where: { id: busId } });
      if (!bus) throw new NotFoundException('Bus not found');

      const seats = await this.prisma.seats.findMany({
        where: { busId },
        orderBy: { seatNumber: 'asc' },
      });
      return { message: 'Fetched seats for bus successfully', data: seats };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch seats', {
        cause: err,
      });
    }
  }
}
