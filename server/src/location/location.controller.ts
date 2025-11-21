import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LocationsService } from './location.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @ApiOperation({ summary: 'Create a new location' })
  @ApiBody({ type: CreateLocationDto })
  @ApiResponse({ status: 201, description: 'Location created successfully.' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.create(createLocationDto);
  }

  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({
    status: 200,
    description: 'Fetched all locations successfully.',
  })
  @Get()
  async findAll() {
    return this.locationsService.findAll();
  }

  @ApiOperation({
    summary: 'Get distinct list of cities, for example: Hà Nội, Đà Lạt',
  })
  @ApiResponse({
    status: 200,
    description: 'Fetched list of cities successfully.',
  })
  @Get('cities')
  getCities() {
    return this.locationsService.getCities();
  }

  @ApiOperation({
    summary:
      'Get locations (or bus stop) filtered by city, for example: Bến xe miền tây',
  })
  @ApiParam({
    name: 'city',
    description: 'City name to filter locations',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Fetched locations by city successfully.',
  })
  @Get('city/:city')
  getLocationsByCity(@Param('city') city: string) {
    return this.locationsService.getLocationsByCity(city);
  }

  @ApiOperation({ summary: 'Get a location by ID' })
  @ApiParam({ name: 'id', description: 'Location ID', type: String })
  @ApiResponse({ status: 200, description: 'Fetched location successfully.' })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a location' })
  @ApiParam({ name: 'id', description: 'Location ID', type: String })
  @ApiBody({ type: UpdateLocationDto })
  @ApiResponse({ status: 200, description: 'Location updated successfully.' })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationsService.update(id, updateLocationDto);
  }

  @ApiOperation({ summary: 'Delete a location' })
  @ApiParam({ name: 'id', description: 'Location ID', type: String })
  @ApiResponse({ status: 200, description: 'Location deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }
}
