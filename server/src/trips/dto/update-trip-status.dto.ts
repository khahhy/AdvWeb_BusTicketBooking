import { IsEnum } from 'class-validator';
import { TripStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTripStatusDto {
  @ApiProperty({ enum: TripStatus })
  @IsEnum(TripStatus)
  status: TripStatus;
}
