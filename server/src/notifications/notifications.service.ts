import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

interface NotificationData {
  template?: string | null;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    const notifications = await this.prisma.notifications.findMany({
      where: {
        userId,
      },
      include: {
        booking: {
          select: {
            id: true,
            ticketCode: true,
            route: {
              select: {
                origin: {
                  select: {
                    name: true,
                    city: true,
                  },
                },
                destination: {
                  select: {
                    name: true,
                    city: true,
                  },
                },
              },
            },
            trip: {
              select: {
                id: true,
                startTime: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match frontend expectations
    return notifications.map((notification) => ({
      id: notification.id,
      type: this.mapNotificationType(notification.type),
      title: this.generateTitle(notification),
      message: notification.content || '',
      timestamp: notification.createdAt.toISOString(),
      isRead: notification.status === 'sent',
      priority: 'medium',
      bookingCode: notification.booking?.ticketCode || undefined,
      actionUrl: notification.bookingId
        ? `/booking-details/${notification.bookingId}`
        : undefined,
    }));
  }

  async findOne(id: string, userId: string) {
    const notification = await this.prisma.notifications.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
            ticketCode: true,
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this notification',
      );
    }

    return notification;
  }

  async markAsRead(id: string, userId: string) {
    // Verify ownership
    await this.findOne(id, userId);

    return this.prisma.notifications.update({
      where: { id },
      data: {
        status: 'sent',
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notifications.updateMany({
      where: {
        userId,
        status: 'pending',
      },
      data: {
        status: 'sent',
      },
    });
  }

  async delete(id: string, userId: string) {
    // Verify ownership
    await this.findOne(id, userId);

    return this.prisma.notifications.delete({
      where: { id },
    });
  }

  private mapNotificationType(type: string): string {
    // Map database notification type to frontend type
    if (type === 'email') return 'booking';
    return 'system';
  }

  private generateTitle(notification: NotificationData): string {
    // Generate a user-friendly title based on notification content
    const template = notification.template;
    if (template?.includes('booking')) {
      return 'Booking Notification';
    }
    if (template?.includes('payment')) {
      return 'Payment Update';
    }
    return 'System Notification';
  }
}
