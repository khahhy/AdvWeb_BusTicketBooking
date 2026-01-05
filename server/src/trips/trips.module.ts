import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { TripStatusUpdaterService } from './trip-status-updater.service';

@Module({
  controllers: [TripsController],
  providers: [TripsService, TripStatusUpdaterService],
  exports: [TripStatusUpdaterService],
})
export class TripsModule {}
