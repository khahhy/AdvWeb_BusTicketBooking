import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client';
import type { RequestWithUser } from 'src/common/type/request-with-user.interface';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin: Get booking statistics' })
  @ApiResponse({ status: 200, description: 'Fetched stats successfully.' })
  @Get('stats')
  async getStats() {
    return this.bookingsService.getStats();
  }

  @ApiOperation({ summary: 'Create a new booking (Lock seat & Init payment)' })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({
    status: 201,
    description: 'Booking initiated successfully.',
  })
  @ApiResponse({
    status: 409,
    description: 'Seat conflict! The selected seat is already booked/locked.',
  })
  @ApiResponse({ status: 400, description: 'Invalid trip or route logic.' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all bookings with filters (Admin)' })
  @ApiResponse({ status: 200, description: 'Fetched all bookings.' })
  @Get()
  async findAll(@Query() query: QueryBookingDto) {
    return this.bookingsService.findAll(query);
  }

  @ApiOperation({ summary: 'Get booking history of current user' })
  @ApiResponse({ status: 200, description: 'Fetched user bookings.' })
  @Get('my-bookings')
  async findMyBookings(@Req() req: RequestWithUser) {
    return this.bookingsService.findAllByUser(req.user.userId);
  }

  @ApiOperation({ summary: 'Get booking details by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID', type: String })
  @ApiResponse({ status: 200, description: 'Fetched booking details.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @ApiOperation({ summary: 'Cancel a booking and release seat locks' })
  @ApiParam({ name: 'id', description: 'Booking ID', type: String })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel (permission or already cancelled).',
  })
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.bookingsService.cancel(id, req.user.userId);
  }
}
