import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { BusType, SeatCapacity } from '@prisma/client';

export class CreateBusDto {
  @ApiProperty({
    example: '51B-12345',
    description: 'Plate number, unique',
  })
  @IsNotEmpty()
  plate: string;

  @ApiPropertyOptional({
    enum: BusType,
    example: BusType.standard,
    description: 'Type of bus',
  })
  @IsOptional()
  @IsEnum(BusType)
  busType?: BusType;

  @ApiPropertyOptional({
    enum: SeatCapacity,
    example: SeatCapacity.SEAT_32,
    description: 'Total seats capacity (16, 28, or 32)',
  })
  @IsOptional()
  @IsEnum(SeatCapacity)
  seatCapacity?: SeatCapacity;

  @ApiPropertyOptional({
    example: {
      wifi: true,
      water: true,
      tv: false,
      airCondition: true,
      toilet: false,
      blanket: true,
      snack: false,
      entertainment: true,
      usb: true,
      reclining: false,
    },
    description: 'Bus amenities',
  })
  @IsOptional()
  amenities?: Record<string, any>;
}
