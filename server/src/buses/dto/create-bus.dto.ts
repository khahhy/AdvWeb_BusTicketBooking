import { ApiProperty } from '@nestjs/swagger';

export class CreateBusDto {
  @ApiProperty({
    example: '51B-12345',
    description: 'Biển số xe, duy nhất',
  })
  plate: string;

  @ApiProperty({
    example: { wifi: true, water: true, tv: false },
    required: false,
    description: 'Tiện nghi của xe',
  })
  amenities?: Record<string, any>;
}
