import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryNotificationDto } from './dto/query-notification.dto';

interface NotificationData {
  template?: string | null;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryNotificationDto) {
    const { page = 1, limit = 10, search, type, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationsWhereInput = {
      AND: [
        status ? { status } : {},
        type ? { type } : {},
        search
          ? {
              OR: [
                { content: { contains: search, mode: 'insensitive' } },
                {
                  booking: {
                    ticketCode: { contains: search, mode: 'insensitive' },
                  },
                },
                {
                  user: { fullName: { contains: search, mode: 'insensitive' } },
                },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                {
                  user: {
                    phoneNumber: { contains: search, mode: 'insensitive' },
                  },
                },
              ],
            }
          : {},
      ],
    };

    const [notifications, total, stats] = await Promise.all([
      this.prisma.notifications.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phoneNumber: true,
            },
          },
          booking: {
            select: {
              ticketCode: true,
            },
          },
        },
      }),
      this.prisma.notifications.count({ where }),
      this.prisma.notifications.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const statistics = stats.reduce(
      (acc, curr) => {
        acc.total += curr._count.id;
        if (curr.status === 'sent') acc.sent += curr._count.id;
        else if (curr.status === 'failed') acc.failed += curr._count.id;
        else if (curr.status === 'pending') acc.pending += curr._count.id;
        return acc;
      },
      { total: 0, sent: 0, failed: 0, pending: 0 },
    );

    const formattedData = notifications.map((notif) => ({
      id: notif.id,
      userId: notif.userId,
      userName: notif.user?.fullName || 'Unknown User',
      contactInfo:
        notif.type === 'sms' ? notif.user?.phoneNumber : notif.user?.email,
      bookingId: notif.bookingId,
      bookingTicketCode: notif.booking?.ticketCode,
      type: notif.type,
      template: notif.template || 'System Notification',
      content: notif.content,
      status: notif.status,
      sentAt: notif.sentAt,
      createdAt: notif.createdAt,
    }));

    return {
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: statistics,
    };
  }

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
