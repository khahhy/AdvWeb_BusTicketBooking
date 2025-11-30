import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum BusType {
  STANDARD = 'standard',
  VIP = 'vip',
  SLEEPER = 'sleeper',
  LIMOUSINE = 'limousine',
}

export class CreateBusDto {
  @ApiProperty({
    example: '51B-12345',
    description: 'Plate number, unique',
  })
  plate: string;

  @ApiPropertyOptional({
    enum: BusType,
    example: BusType.STANDARD,
    description: 'Type of bus',
  })
  @IsOptional()
  @IsEnum(BusType)
  busType?: BusType;

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
      reclining: false
    },
    description: 'Bus amenities',
  })
  amenities?: Record<string, any>;
}
