import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentGateway } from './payment.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PayOSModule } from 'src/payos/payos.module';
import { EmailModule } from 'src/email/email.module';
import { ETicketModule } from 'src/eticket/eticket.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { SettingModule } from 'src/setting/setting.module';

@Module({
  imports: [
    SettingModule,
    ConfigModule,
    PrismaModule,
    PayOSModule,
    EmailModule,
    ETicketModule,
    NotificationsModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentGateway],
  exports: [PaymentService],
})
export class PaymentModule {}
