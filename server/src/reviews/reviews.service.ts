import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: dto.bookingId },
      select: {
        id: true,
        userId: true,
        status: true,
        trip: { select: { startTime: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (!booking.userId || booking.userId !== userId) {
      throw new ForbiddenException('You can only review your own booking');
    }

    if (booking.status !== BookingStatus.confirmed) {
      throw new BadRequestException('Only confirmed bookings can be reviewed');
    }

    if (booking.trip.startTime >= new Date()) {
      throw new BadRequestException('Trip has not completed yet');
    }

    const existingReview = await this.prisma.reviews.findFirst({
      where: { bookingId: dto.bookingId, userId },
    });

    if (existingReview) {
      throw new ConflictException('Review already submitted for this booking');
    }

    const trimmedComment = dto.comment?.trim();

    const review = await this.prisma.reviews.create({
      data: {
        booking: { connect: { id: dto.bookingId } },
        user: { connect: { id: userId } },
        rating: dto.rating,
        comment: trimmedComment?.length ? trimmedComment : null,
      },
    });

    return { message: 'Review submitted successfully', data: review };
  }

  async findByBooking(bookingId: string, userId: string) {
    const review = await this.prisma.reviews.findFirst({
      where: { bookingId, userId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return { message: 'Fetched review successfully', data: review };
  }

  async findByUser(userId: string) {
    const reviews = await this.prisma.reviews.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return { message: 'Fetched reviews successfully', data: reviews };
  }
}
