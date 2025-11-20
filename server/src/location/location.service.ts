import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      const locations = await this.prisma.locations.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return { message: 'Fetched all locations successfully', data: locations };
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch locations', {
        cause: err,
      });
    }
  }

  async findOne(id: string) {
    try {
      const location = await this.prisma.locations.findUnique({
        where: { id },
      });
      if (!location) throw new NotFoundException('Location not found');
      return { message: 'Fetched location successfully', data: location };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch location', {
        cause: err,
      });
    }
  }

  async create(createLocationDto: CreateLocationDto) {
    try {
      const newLocation = await this.prisma.locations.create({
        data: createLocationDto,
      });
      return { message: 'Location created successfully', data: newLocation };
    } catch (err) {
      throw new InternalServerErrorException('Failed to create location', {
        cause: err,
      });
    }
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    try {
      const location = await this.prisma.locations.findUnique({
        where: { id },
      });
      if (!location) throw new NotFoundException('Location not found');

      const updatedLocation = await this.prisma.locations.update({
        where: { id },
        data: updateLocationDto,
      });
      return {
        message: 'Location updated successfully',
        data: updatedLocation,
      };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to update location', {
        cause: err,
      });
    }
  }

  async remove(id: string) {
    try {
      const location = await this.prisma.locations.findUnique({
        where: { id },
      });
      if (!location) throw new NotFoundException('Location not found');

      const deletedLocation = await this.prisma.locations.delete({
        where: { id },
      });
      return {
        message: 'Location deleted successfully',
        data: deletedLocation,
      };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete location', {
        cause: err,
      });
    }
  }
}
