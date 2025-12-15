import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID của booking',
    example: 'booking-uuid-123',
  })
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @ApiProperty({
    description: 'Tên người mua (tùy chọn)',
    example: 'Nguyễn Văn A',
    required: false,
  })
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiProperty({
    description: 'Email người mua (tùy chọn)',
    example: 'nguyenvana@gmail.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  buyerEmail?: string;

  @ApiProperty({
    description: 'Số điện thoại người mua (tùy chọn)',
    example: '0987654321',
    required: false,
  })
  @IsOptional()
  @IsString()
  buyerPhone?: string;
}
