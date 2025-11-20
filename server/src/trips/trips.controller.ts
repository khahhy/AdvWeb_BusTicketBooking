import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateTripDto } from './dto/create-trip.dto';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @ApiOperation({ summary: 'Admin: Create a new trip with stops' })
  @ApiBody({ type: CreateTripDto })
  @ApiResponse({ status: 201, description: 'Trip created successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or stops timeline error.',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(createTripDto);
  }

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
