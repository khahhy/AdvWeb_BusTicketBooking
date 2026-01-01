import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import type { RequestWithUser } from 'src/common/type/request-with-user.interface';
import { CreateReviewDto } from './dto/create-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a review for a completed booking' })
  @ApiResponse({ status: 201, description: 'Review submitted successfully.' })
  @ApiResponse({ status: 400, description: 'Booking not completed.' })
  @ApiResponse({ status: 403, description: 'Not allowed to review booking.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @ApiResponse({ status: 409, description: 'Review already exists.' })
  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(req.user.userId, createReviewDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user review for a booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Fetched review successfully.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  @Get('booking/:bookingId')
  async findByBooking(
    @Param('bookingId') bookingId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.reviewsService.findByBooking(bookingId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all reviews by current user' })
  @ApiResponse({ status: 200, description: 'Fetched reviews successfully.' })
  @Get('my')
  async findMyReviews(@Req() req: RequestWithUser) {
    return this.reviewsService.findByUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin: Get all reviews for moderation' })
  @ApiResponse({ status: 200, description: 'Fetched reviews successfully.' })
  @Get('admin')
  async findAllForAdmin() {
    return this.reviewsService.findAllForAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin: Moderate a review' })
  @ApiResponse({ status: 200, description: 'Review moderated successfully.' })
  @Patch(':id/moderate')
  async moderateReview(
    @Param('id') id: string,
    @Body() dto: ModerateReviewDto,
    @Req() req: RequestWithUser,
  ) {
    return this.reviewsService.moderateReview(id, req.user.userId, dto.status);
  }

  @ApiOperation({ summary: 'Get all visible reviews for a route' })
  @ApiParam({ name: 'routeId', description: 'Route ID' })
  @ApiResponse({ status: 200, description: 'Fetched reviews successfully.' })
  @Get('route/:routeId')
  async findByRoute(@Param('routeId') routeId: string) {
    return this.reviewsService.findByRoute(routeId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin: Delete a review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully.' })
  @Delete(':id')
  async removeReview(@Param('id') id: string) {
    return this.reviewsService.removeReview(id);
  }
}
