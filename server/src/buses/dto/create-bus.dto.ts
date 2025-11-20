import { ApiProperty } from '@nestjs/swagger';

export class CreateBusDto {
  @ApiProperty({
    example: '51B-12345',
    description: 'Plate number, unique',
  })
  plate: string;

  @ApiProperty({
    example: { wifi: true, water: true, tv: false },
    required: false,
    description: 'Bus amenities',
  })
  amenities?: Record<string, any>;
}
