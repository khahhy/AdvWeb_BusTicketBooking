import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/signup.dto';
import { hash } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signUp(dto: SignUpDto) {
    const existingUser = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    let hashedPassword: string | null = null;
    if (dto.password) {
      hashedPassword = await hash(dto.password, 10);
    }

    const user = await this.prisma.users.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        password: hashedPassword,
        role: 'passenger',
        status: 'active',
        authProvider: 'local',
      },
    });

    return { id: user.id, email: user.email };
  }
}
