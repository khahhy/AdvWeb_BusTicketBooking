import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.routes.findMany({
      include: {
        origin: true,
        destination: true,
        tripRoutes: {
          include: {
            trip: {
              include: {
                segments: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.routes.findUnique({
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
  }
}
