import { Controller, Get, Param } from '@nestjs/common';
import { LocationsService } from './location.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @ApiOperation({ summary: 'Get all locations' })
  @Get()
  async findAll() {
    return this.locationsService.findAll();
  }

  @ApiOperation({ summary: 'Get a location by ID' })
  @ApiParam({ name: 'id', description: 'Location ID', type: String })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }
}
