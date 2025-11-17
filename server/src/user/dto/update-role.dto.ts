import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'New role of the user',
    enum: UserRole,
  })
  role: UserRole;
}
