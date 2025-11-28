import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  HttpCode,
  HttpStatus,
  Query,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripQueryDto } from './dto/trip-query.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { UpdateTripStatusDto } from './dto/update-trip-status.dto';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth('JWT-auth')
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

  @ApiOperation({
    summary:
      'Get all trips with filters (startTime, endTime, origin stop of route, destination stop of route, busId, status). Note: trip contain route, that route maybe not set sold yet',
  })
  @ApiQuery({ name: 'startTime', required: false })
  @ApiQuery({ name: 'endTime', required: false })
  @ApiQuery({
    name: 'origin',
    required: false,
    description: 'Location ID to MATCH as origin stop',
  })
  @ApiQuery({
    name: 'destination',
    required: false,
    description: 'Location ID to MACTH as destination stop',
  })
  @ApiQuery({ name: 'busId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'includeStops', required: false })
  @ApiQuery({ name: 'includeSegments', required: false })
  @Get()
  async findAll(@Query() query: TripQueryDto) {
    return this.tripsService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a trip by ID with stops & segments' })
  @ApiParam({ name: 'id', type: String, required: true })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin: Update a trip (bus, stops, segments)' })
  @ApiBody({ type: UpdateTripDto })
  @ApiParam({ name: 'id', type: String, description: 'Trip ID to update' })
  @ApiResponse({ status: 200, description: 'Trip updated successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or constraints violation.',
  })
  @ApiResponse({ status: 404, description: 'Trip not found.' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTripDto) {
    return this.tripsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth('JWT-auth')
  @Patch(':id/status')
  @ApiBody({ type: UpdateTripStatusDto })
  @ApiOperation({ summary: 'Update the status of a trip' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTripStatusDto,
  ) {
    return this.tripsService.updateStatus(id, dto.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a trip (only if no bookings exist)' })
  @ApiParam({ name: 'id', type: String })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tripsService.remove(id);
  }

  @ApiOperation({
    summary: 'Get real-time seat status for a specific Trip and Route',
    description:
      'Returns seat map with status (AVAILABLE/BOOKED) based on the segments of the selected Route.',
  })
  @ApiParam({ name: 'id', description: 'Trip ID', type: String })
  @ApiQuery({
    name: 'routeId',
    description: 'Route ID (to calculate segments)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Fetched seat map successfully.' })
  @ApiResponse({ status: 404, description: 'Trip or Route not found.' })
  @Get(':id/seats')
  async getSeatsStatus(
    @Param('id') tripId: string,
    @Query('routeId') routeId: string,
  ) {
    return this.tripsService.getSeatsStatus(tripId, routeId);
  }
}
