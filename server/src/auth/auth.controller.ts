import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
  Res,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { RequestWithGoogleUser } from 'src/common/type/request-with-google-user.interface';
import type { RequestWithUser } from 'src/common/type/request-with-user.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user - sends verification email' })
  @Post('signup')
  async signUp(@Body() dto: SignUpDto) {
    console.log('controller', dto);
    return this.authService.signUp(dto);
  }

  @ApiOperation({ summary: 'Sign in with email and password' })
  @Post('signin')
  async signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @ApiOperation({ summary: 'Verify email with token' })
  @ApiQuery({ name: 'token', description: 'Verification token from email' })
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @ApiOperation({ summary: 'Resend verification email' })
  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  @ApiOperation({ summary: 'Request password reset - sends reset email' })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @ApiOperation({ summary: 'Reset password with token' })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Initiates the Google OAuth flow
  }

  @ApiOperation({ summary: 'Google OAuth callback' })
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(
    @Req() req: RequestWithGoogleUser,
    @Res() res: Response,
  ) {
    // Handle the Google OAuth callback
    const token = await this.authService.googleLogin(req.user);

    // Redirect to frontend with token
    res.redirect(
      `${process.env.FRONTEND_URL}/auth-success?token=${token.accessToken}`,
    );
  }

  @ApiOperation({ summary: 'Get current user info' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getCurrentUser(@Req() req: RequestWithUser) {
    return this.authService.getUserById(req.user.userId);
  }

  @ApiOperation({ summary: 'Get user profile' })
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getProfile(@Req() req: RequestWithUser) {
    console.log('Profile endpoint hit by user:', req.user);
    try {
      const result = await this.authService.getUserById(req.user.userId);
      console.log('Profile result:', result);
      return result;
    } catch (error) {
      console.error('Profile endpoint error:', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Update user profile' })
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.userId, updateProfileDto);
  }

  @ApiOperation({ summary: 'Change password for current user' })
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async changePassword(
    @Req() req: RequestWithUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.userId, dto);
  }
}
