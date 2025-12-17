import type { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from './user/user.module';
import { LocationModule } from './location/location.module';
import { BusesModule } from './buses/buses.module';
import { TripsModule } from './trips/trips.module';
import { RoutesModule } from './routes/routes.module';
import { BookingsModule } from './bookings/bookings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { SettingModule } from './setting/setting.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { RedisModule } from './redis/redis.module';
import { RedisCacheModule } from './cache/redis-cache.module';
import { HealthModule } from './health/health.module';
import { PaymentModule } from './payment/payment.module';
import { PayOSModule } from './payos/payos.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Type issue with ScheduleModule from @nestjs/schedule library

    ScheduleModule.forRoot() as unknown as DynamicModule,
    PrismaModule,
    UserModule,
    LocationModule,
    BusesModule,
    TripsModule,
    RoutesModule,
    BookingsModule,
    NotificationsModule,
    AuthModule,
    SettingModule,
    ActivityLogsModule,
    RedisModule,
    RedisCacheModule,
    HealthModule,
    PaymentModule,
    PayOSModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
