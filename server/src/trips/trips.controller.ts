import { Controller, Get, Param } from '@nestjs/common';
import { TripsService } from './trips.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @ApiOperation({ summary: 'Get all trips' })
  @Get()
  async findAll() {
    return this.tripsService.findAll();
  }

  @ApiOperation({ summary: 'Get a trip by ID with stops and segments' })
  @ApiParam({ name: 'id', description: 'Trip ID', type: String })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }
}
