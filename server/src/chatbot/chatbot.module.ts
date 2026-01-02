import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { GeminiService } from './gemini.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TripsModule } from '../trips/trips.module';
import { BookingsModule } from '../bookings/bookings.module';
import { LocationModule } from '../location/location.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    TripsModule,
    BookingsModule,
    LocationModule,
    PaymentModule,
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService, GeminiService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
