import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

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
