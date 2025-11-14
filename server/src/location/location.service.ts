import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.locations.findMany();
  }

  async findOne(id: string) {
    return this.prisma.locations.findUnique({
      where: { id },
    });
  }
}
