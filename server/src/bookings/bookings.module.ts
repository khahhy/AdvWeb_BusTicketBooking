import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingsGateway } from './bookings.gateway';
import { ETicketModule } from 'src/eticket/eticket.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [ETicketModule, EmailModule],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsGateway],
})
export class BookingsModule {}
