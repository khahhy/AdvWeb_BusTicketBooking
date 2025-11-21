import { PartialType } from '@nestjs/swagger';
import { CreateRouteDto } from './create-route.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateRouteDto extends PartialType(CreateRouteDto) {
  @ApiProperty({
    example: true,
    description: 'Status of the route',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
