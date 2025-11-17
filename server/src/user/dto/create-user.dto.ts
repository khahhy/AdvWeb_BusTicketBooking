import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Bocchi',
    description: 'Full name of the user',
  })
  fullName: string;

  @ApiProperty({
    example: 'bocchi@gmail.com',
    description: 'Email of the user',
  })
  email: string;

  @ApiProperty({
    example: '+84123456789',
    description: 'Phone number of the user',
    required: false,
  })
  phoneNumber?: string;

  @ApiProperty({
    example: 'strongpasswordhash',
    description: 'Hashed password of the user',
    required: false,
  })
  password?: string;
}
