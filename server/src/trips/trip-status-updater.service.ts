import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { TripStatus } from '@prisma/client';

@Injectable()
export class TripStatusUpdaterService {
  private readonly logger = new Logger(TripStatusUpdaterService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cron job runs every minute to check and update trip statuses
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async updateTripStatuses() {
    try {
      const now = new Date();

      // Update trips to 'ongoing' if startTime has passed and status is 'scheduled'
      const updatedToOngoing = await this.prisma.trips.updateMany({
        where: {
          status: TripStatus.scheduled,
          startTime: {
            lte: now,
          },
          endTime: {
            gt: now,
          },
        },
        data: {
          status: TripStatus.ongoing,
        },
      });

      if (updatedToOngoing.count > 0) {
        this.logger.log(
          `Updated ${updatedToOngoing.count} trip(s) to 'ongoing' status`,
        );
      }

      // Update trips to 'completed' if endTime has passed and status is 'ongoing'
      const updatedToCompleted = await this.prisma.trips.updateMany({
        where: {
          status: TripStatus.ongoing,
          endTime: {
            lte: now,
          },
        },
        data: {
          status: TripStatus.completed,
        },
      });

      if (updatedToCompleted.count > 0) {
        this.logger.log(
          `Updated ${updatedToCompleted.count} trip(s) to 'completed' status`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to update trip statuses', error.stack);
    }
  }

  /**
   * Manual trigger for immediate status update (useful for testing)
   */
  async triggerStatusUpdate() {
    await this.updateTripStatuses();
    return {
      message: 'Trip status update triggered successfully',
    };
  }
}
