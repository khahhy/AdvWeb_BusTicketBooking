import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CustomerInfoDto } from './customer-info.dto';

export class CreateBookingDto {
  @ApiPropertyOptional({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'Unique identifier of the user (optional for guest checkout)',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'Unique identifier of the Trip',
  })
  @IsUUID()
  @IsNotEmpty()
  tripId: string;

  @ApiProperty({
    example: 'b1234567-89ab-cdef-0123-456789abcdef',
    description: 'Unique identifier of the Route',
  })
  @IsUUID()
  @IsNotEmpty()
  routeId: string;

  @ApiProperty({
    example: 'c2345678-90ab-cdef-1234-567890abcdef',
    description: 'Unique identifier of the Seat to book',
  })
  @IsUUID()
  @IsNotEmpty()
  seatId: string;

  @ApiProperty({
    type: CustomerInfoDto,
    description: 'Cusotomer information',
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customerInfo: CustomerInfoDto;
}
