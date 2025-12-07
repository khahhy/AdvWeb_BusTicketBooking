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
  Res,
  Header,
} from '@nestjs/common';
import type { Response } from 'express';
import { BookingsService } from './bookings.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiProduces,
} from '@nestjs/swagger';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { LookupBookingDto } from './dto/lookup-booking.dto';
import { ModifyBookingDto } from './dto/modify-booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client';
import type { RequestWithUser } from 'src/common/type/request-with-user.interface';
import { ETicketService } from 'src/eticket/eticket.service';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly eTicketService: ETicketService,
  ) {}

  @Post('lock')
  @ApiOperation({ summary: 'Lock a seat temporarily (User/Guest)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tripId', 'seatId', 'routeId'],
      properties: {
        tripId: { type: 'string', format: 'uuid', example: 'trip-uuid-123' },
        seatId: { type: 'string', format: 'uuid', example: 'seat-uuid-456' },
        routeId: { type: 'string', format: 'uuid', example: 'route-uuid-789' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Seat locked successfully.' })
  @ApiResponse({ status: 409, description: 'Seat is already locked/sold.' })
  async lockSeat(
    @Body() body: { tripId: string; seatId: string; routeId: string },
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.userId || 'guest-temp-id';
    return this.bookingsService.lockSeat(
      userId,
      body.tripId,
      body.seatId,
      body.routeId,
    );
  }

  @Post('unlock')
  @ApiOperation({ summary: 'Unlock a seat (User/Guest)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tripId', 'seatId', 'routeId'],
      properties: {
        tripId: { type: 'string', format: 'uuid', example: 'trip-uuid-123' },
        seatId: { type: 'string', format: 'uuid', example: 'seat-uuid-456' },
        routeId: { type: 'string', format: 'uuid', example: 'route-uuid-789' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Seat unlocked successfully.' })
  async unlockSeat(
    @Body() body: { tripId: string; seatId: string; routeId: string },
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.userId || 'guest-temp-id';
    return this.bookingsService.unlockSeat(
      userId,
      body.tripId,
      body.seatId,
      body.routeId,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin: Get booking statistics' })
  @ApiResponse({ status: 200, description: 'Fetched stats successfully.' })
  @Get('stats')
  async getStats() {
    return this.bookingsService.getStats();
  }

  @ApiOperation({ summary: 'Guest: Look up bookings by email and phone number' })
  @ApiBody({ type: LookupBookingDto })
  @ApiResponse({ status: 200, description: 'Fetched guest bookings.' })
  @Post('guest/lookup')
  @HttpCode(HttpStatus.OK)
  async lookupGuestBookings(@Body() lookupDto: LookupBookingDto) {
    return this.bookingsService.findByGuestInfo(lookupDto);
  }

  @ApiOperation({ summary: 'Look up booking by ticket code and email' })
  @ApiParam({ name: 'ticketCode', description: 'Booking reference code' })
  @ApiQuery({ name: 'email', description: 'Email used when booking' })
  @ApiResponse({ status: 200, description: 'Fetched booking details.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @Get('lookup/:ticketCode')
  async lookupByTicketCode(
    @Param('ticketCode') ticketCode: string,
    @Query('email') email: string,
  ) {
    return this.bookingsService.findByTicketCode(ticketCode, email);
  }

  @ApiOperation({ summary: 'Get e-ticket data by ticket code (for rendering)' })
  @ApiParam({ name: 'ticketCode', description: 'Booking reference code' })
  @ApiResponse({ status: 200, description: 'E-ticket data for rendering.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @Get('eticket/:ticketCode')
  async getETicketData(@Param('ticketCode') ticketCode: string) {
    return this.eTicketService.getFullBookingData(ticketCode);
  }

  @ApiOperation({ summary: 'Download e-ticket PDF by ticket code (server-generated)' })
  @ApiParam({ name: 'ticketCode', description: 'Booking reference code' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF e-ticket file.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @Get('eticket/:ticketCode/download')
  @Header('Content-Type', 'application/pdf')
  async downloadETicket(
    @Param('ticketCode') ticketCode: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.eTicketService.generatePDF(ticketCode);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="eticket-${ticketCode}.pdf"`,
    );
    res.send(pdfBuffer);
  }

  @ApiOperation({ summary: 'Resend e-ticket email' })
  @ApiParam({ name: 'ticketCode', description: 'Booking reference code' })
  @ApiResponse({ status: 200, description: 'E-ticket email sent successfully.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @Post('eticket/:ticketCode/resend')
  @HttpCode(HttpStatus.OK)
  async resendETicket(@Param('ticketCode') ticketCode: string) {
    return this.bookingsService.sendETicketEmail(ticketCode);
  }

  @ApiOperation({ summary: 'Guest: Cancel booking by ticket code' })
  @ApiParam({ name: 'ticketCode', description: 'Booking reference code' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', format: 'email', example: 'guest@example.com' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @Patch('guest/:ticketCode/cancel')
  async cancelGuestBooking(
    @Param('ticketCode') ticketCode: string,
    @Body('email') email: string,
  ) {
    return this.bookingsService.cancelByTicketCode(ticketCode, email);
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel a booking and release seat locks (Authenticated users)' })
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Modify a booking (change seat, trip, route, or customer info)',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tripId: {
          type: 'string',
          format: 'uuid',
          description: 'New trip ID (optional)',
        },
        seatId: {
          type: 'string',
          format: 'uuid',
          description: 'New seat ID (optional)',
        },
        routeId: {
          type: 'string',
          format: 'uuid',
          description: 'New route ID (optional)',
        },
        customerInfo: {
          type: 'object',
          description: 'Updated customer information (optional)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Booking modified successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Cannot modify (permission, cancelled, or departed).',
  })
  @Patch(':id/modify')
  async modify(
    @Param('id') id: string,
    @Body() modifyData: ModifyBookingDto,
    @Req() req: RequestWithUser,
  ) {
    return this.bookingsService.modify(id, req.user.userId, modifyData);
  }
}
