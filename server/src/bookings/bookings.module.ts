import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingsGateway } from './bookings.gateway';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, BookingsGateway],
})
export class BookingsModule {}
