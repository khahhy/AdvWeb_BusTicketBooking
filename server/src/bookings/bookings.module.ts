import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingsGateway } from './bookings.gateway';
import { ETicketModule } from 'src/eticket/eticket.module';
import { EmailModule } from 'src/email/email.module';
import { PaymentModule } from 'src/payment/payment.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [ETicketModule, EmailModule, PaymentModule, NotificationsModule],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsGateway],
  exports: [BookingsService],
})
export class BookingsModule {}
