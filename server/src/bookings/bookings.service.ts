import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.bookings.findMany();
  }

  async findOne(id: string) {
    return this.prisma.bookings.findUnique({
      where: { id },
      include: {
        user: true,
        trip: {
          include: {
            bus: true,
            tripStops: true,
            segments: true,
          },
        },
        route: true,
        seat: true,
        pickupStop: true,
        dropoffStop: true,
        seatLocks: true,
        payments: true,
        reviews: true,
        notifications: true,
      },
    });
  }
}
