import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ModerateReviewDto {
  @ApiProperty({
    description: 'Updated review status',
    enum: ReviewStatus,
    example: ReviewStatus.hidden,
  })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;
}
