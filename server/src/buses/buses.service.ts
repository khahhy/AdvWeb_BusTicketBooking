import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BusesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.buses.findMany();
  }

  async findOne(id: string) {
    return this.prisma.buses.findUnique({
      where: { id },
      include: {
        seats: true,
      },
    });
  }
}
