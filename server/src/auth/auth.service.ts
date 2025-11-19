import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/signup.dto';
import { hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async signUp(dto: SignUpDto) {
    const existingUser = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    if (!dto.password) {
      throw new BadRequestException('Password is required');
    }

    const hashedPassword = await hash(dto.password, 10);

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    
    // Token expires in 24 hours
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);

    const user = await this.prisma.users.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        password: hashedPassword,
        role: 'passenger',
        status: 'unverified',
        emailVerified: false,
        verificationToken,
        tokenExpiresAt,
        authProvider: 'local',
      },
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(user.email, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email fails, but log the error
    }

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      email: user.email,
    };
  }

  async verifyEmail(token: string) {
    // Trim and decode token
    const cleanToken = decodeURIComponent(token.trim());
    console.log('Verifying token:', cleanToken);
    console.log('Token length:', cleanToken.length);
    
    const user = await this.prisma.users.findUnique({
      where: { verificationToken: cleanToken },
    });

    console.log('User found by token:', user ? `Yes (${user.email})` : 'No');
    
    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    // If already verified, return success (idempotent)
    if (user.emailVerified) {
      console.log('Email already verified, returning success');
      
      // Clear token after successful re-verification (cleanup)
      if (user.verificationToken) {
        await this.prisma.users.update({
          where: { id: user.id },
          data: {
            verificationToken: null,
            tokenExpiresAt: null,
          },
        });
      }
      
      return {
        message: 'Email verified successfully. Your account is now active.',
        email: user.email,
        alreadyVerified: true,
      };
    }

    // Check if token expired (only for unverified users)
    if (user.tokenExpiresAt && new Date() > user.tokenExpiresAt) {
      throw new BadRequestException('Verification token has expired');
    }

    console.log('Updating user to verified status...');
    
    // Update user to verified but keep token for 10 minutes
    // This allows the same verification link to work if user refreshes the page
    const tokenExpiryExtended = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        status: 'active',
        tokenExpiresAt: tokenExpiryExtended, // Keep token valid for 10 more minutes
      },
    });

    console.log('User verified successfully!');

    return {
      message: 'Email verified successfully. Your account is now active.',
      email: user.email,
      alreadyVerified: false,
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new verification token
    const verificationToken = randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);

    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        verificationToken,
        tokenExpiresAt,
      },
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(user.email, verificationToken);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      throw new BadRequestException('Failed to send verification email');
    }

    return {
      message: 'Verification email sent successfully. Please check your inbox.',
    };
  }
}
