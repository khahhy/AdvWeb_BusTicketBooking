import { Controller, Get, Param } from '@nestjs/common';
import { BusesService } from './buses.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('buses')
@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @ApiOperation({ summary: 'Get all buses' })
  @Get()
  async findAll() {
    return this.busesService.findAll();
  }

  @ApiOperation({ summary: 'Get a bus by ID' })
  @ApiParam({ name: 'id', description: 'Bus ID', type: String })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.busesService.findOne(id);
  }
}
