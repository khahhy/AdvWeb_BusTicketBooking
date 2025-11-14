import { Controller, Get, Param } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @ApiOperation({ summary: 'Get all bookings' })
  @Get()
  async findAll() {
    return this.bookingsService.findAll();
  }

  @ApiOperation({ summary: 'Get a booking by ID with related data' })
  @ApiParam({ name: 'id', description: 'Booking ID', type: String })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }
}
