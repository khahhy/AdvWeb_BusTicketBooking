import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { SmsService } from './sms.service';
import { NotificationsService } from './notifications.service';

interface BookingData {
  id: string;
  userId: string | null;
  ticketCode: string;
  customerInfo: Record<string, string | undefined>;
  user: {
    email?: string;
    phoneNumber?: string;
    fullName?: string;
  } | null;
  trip: {
    startTime: Date;
    bus: {
      plate: string;
    };
  };
  route: {
    origin: {
      name: string;
    };
    destination: {
      name: string;
    };
  };
  pickupStop: {
    location: {
      name: string;
      address?: string;
    };
  };
  dropoffStop: any;
  seat: {
    seatNumber: string;
  };
}

@Injectable()
export class NotificationsSchedulerService {
  private readonly logger = new Logger(NotificationsSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Runs every hour to check for trips departing in the next 24 hours
   * and sends reminder notifications to passengers
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendTripReminders() {
    this.logger.log('Running trip reminder job...');

    try {
      // Get current time and 24 hours from now
      const now = new Date();
      const twentyFourHoursLater = new Date(
        now.getTime() + 24 * 60 * 60 * 1000,
      );

      // Find all bookings with trips departing in the next 24 hours
      const upcomingBookings = await this.prisma.bookings.findMany({
        where: {
          status: 'confirmed',
          trip: {
            startTime: {
              gte: now,
              lte: twentyFourHoursLater,
            },
            status: 'scheduled',
          },
        },
        include: {
          user: true,
          trip: {
            include: {
              bus: true,
            },
          },
          route: {
            include: {
              origin: true,
              destination: true,
            },
          },
          pickupStop: {
            include: {
              location: true,
            },
          },
          dropoffStop: {
            include: {
              location: true,
            },
          },
          seat: true,
        },
      });

      this.logger.log(
        `Found ${upcomingBookings.length} upcoming trips to send reminders for`,
      );

      for (const booking of upcomingBookings) {
        try {
          // Check if reminder notification already sent
          const existingNotification =
            await this.prisma.notifications.findFirst({
              where: {
                bookingId: booking.id,
                template: 'trip_reminder',
                status: 'sent',
              },
            });

          if (existingNotification) {
            this.logger.debug(
              `Reminder already sent for booking ${booking.ticketCode}`,
            );
            continue;
          }

          const customerInfo = booking.customerInfo as Record<string, any>;
          const userEmail = (booking.user?.email || customerInfo?.email) as
            | string
            | undefined;
          const userPhone = (booking.user?.phoneNumber ||
            customerInfo?.phoneNumber) as string | undefined;

          let emailSent = false;
          let smsSent = false;

          // Send email notification if user has email
          if (userEmail) {
            try {
              await this.sendTripReminderEmail(booking);
              emailSent = true;

              // Create email notification record
              await this.prisma.notifications.create({
                data: {
                  userId: booking.userId!,
                  bookingId: booking.id,
                  type: 'email',
                  template: 'trip_reminder',
                  content: `Your trip to ${booking.route.destination.city} departs tomorrow at ${booking.trip.startTime.toLocaleTimeString()}. Please arrive 30 minutes early.`,
                  status: 'sent',
                  sentAt: new Date(),
                },
              });

              this.logger.log(
                `Email reminder sent for booking ${booking.ticketCode}`,
              );
            } catch (error) {
              this.logger.error(
                `Failed to send email for booking ${booking.ticketCode}:`,
                error,
              );
            }
          }

          // Send SMS notification if user has phone number and SMS service is available
          if (userPhone && this.smsService.isServiceAvailable()) {
            try {
              const reminderDetails = this.prepareTripReminderDetails(booking);
              const smsResult = await this.smsService.sendTripReminderSms(
                userPhone,
                reminderDetails,
              );

              if (smsResult.success) {
                smsSent = true;

                // Create SMS notification record
                await this.prisma.notifications.create({
                  data: {
                    userId: booking.userId!,
                    bookingId: booking.id,
                    type: 'sms',
                    template: 'trip_reminder',
                    content: `SMS reminder sent to ${userPhone}`,
                    status: 'sent',
                    sentAt: new Date(),
                  },
                });

                this.logger.log(
                  `SMS reminder sent for booking ${booking.ticketCode}`,
                );
              }
            } catch (error) {
              this.logger.error(
                `Failed to send SMS for booking ${booking.ticketCode}:`,
                error,
              );
            }
          }

          if (emailSent || smsSent) {
            this.logger.log(
              `Reminders sent for ${booking.ticketCode}: Email=${emailSent}, SMS=${smsSent}`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Failed to send reminder for booking ${booking.ticketCode}:`,
            error,
          );
        }
      }

      this.logger.log('Trip reminder job completed');
    } catch (error) {
      this.logger.error('Error in trip reminder job:', error);
    }
  }

  /**
   * Sends a trip reminder email to the passenger
   */
  private async sendTripReminderEmail(booking: BookingData) {
    const reminderDetails = this.prepareTripReminderDetails(booking);
    const email = (booking.user?.email ||
      booking.customerInfo?.email) as string;

    await this.emailService.sendTripReminderEmail(email, reminderDetails);
  }

  /**
   * Prepare trip reminder details for email and SMS
   */
  private prepareTripReminderDetails(booking: BookingData) {
    const customerInfo = booking.customerInfo;
    const customerName =
      booking.user?.fullName || customerInfo?.fullName || 'Valued Customer';

    const tripDate = new Date(booking.trip.startTime);
    const formattedDate = tripDate.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = tripDate.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const hoursUntilTrip = Math.floor(
      (tripDate.getTime() - new Date().getTime()) / (1000 * 60 * 60),
    );

    return {
      customerName,
      ticketCode: booking.ticketCode || 'N/A',
      tripDate: formattedDate,
      tripTime: formattedTime,
      origin: booking.route.origin.name,
      destination: booking.route.destination.name,
      pickupLocation: booking.pickupStop.location.name,
      pickupAddress: booking.pickupStop.location.address || '',
      seatNumber: booking.seat.seatNumber,
      busPlate: booking.trip.bus.plate,
      hoursUntilTrip,
    };
  }

  /**
   * Cleanup old notifications (optional - runs daily)
   * Removes notifications older than 30 days
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldNotifications() {
    this.logger.log('Running notification cleanup job...');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.prisma.notifications.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo,
          },
          status: 'sent',
        },
      });

      this.logger.log(`Cleaned up ${result.count} old notifications`);
    } catch (error) {
      this.logger.error('Error in notification cleanup job:', error);
    }
  }
}
