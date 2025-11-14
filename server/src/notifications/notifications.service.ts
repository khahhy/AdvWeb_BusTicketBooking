import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.notifications.findMany({
      include: {
        user: true,
        booking: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.notifications.findUnique({
      where: { id },
      include: {
        user: true,
        booking: true,
      },
    });
  }
}
