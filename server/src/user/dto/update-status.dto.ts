import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'New status of the user',
    enum: UserStatus,
  })
  status: UserStatus;
}
