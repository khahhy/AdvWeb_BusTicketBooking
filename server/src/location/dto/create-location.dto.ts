import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({
    example: 'Bến xe Miền Đông',
    description: 'Name of the location',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: '292 Đinh Bộ Lĩnh, P.26, Bình Thạnh, TP.HCM',
    description: 'Detail Address (Optional)',
    required: false,
  })
  address?: string;

  @ApiProperty({
    example: 'TP.HCM',
    description: 'City name',
  })
  @IsNotEmpty()
  @IsString()
  city: string;
}
