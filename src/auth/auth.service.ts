import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { randomBytes } from 'crypto';

interface LoginUser {
  id: bigint;
  name: string;
  email: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  userType?: string;
  role?: { id: bigint; nameEn: string; nameAr: string; permissions?: unknown[] };
  [key: string]: unknown;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<unknown> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Generate verification code (hardcoded to 1111 for now)
    const verificationCode = '1111';
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        phone: registerDto.phone,
        phoneCode: registerDto.phoneCode,
        emailVerificationCode: verificationCode,
        emailVerificationExpiry: verificationExpiry,
        isEmailVerified: false,
        isActive: true,
      },
    });

    // TODO: Send verification email with code
    console.log(`Email verification code for ${registerDto.email}: ${verificationCode}`);

    return {
      message: 'Registration successful. Please verify your email with the code sent.',
    };
  }

  /**
   * Verify email with code
   */
  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (!user.emailVerificationCode || !user.emailVerificationExpiry) {
      throw new BadRequestException('No verification code found');
    }

    if (user.emailVerificationExpiry < new Date()) {
      throw new BadRequestException('Verification code expired');
    }

    if (user.emailVerificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    // Mark email as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpiry: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  /**
   * Resend email verification code
   */
  async resendEmailVerification(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new verification code
    const verificationCode = '1111';
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCode: verificationCode,
        emailVerificationExpiry: verificationExpiry,
      },
    });

    // TODO: Send verification email
    console.log(`Email verification code for ${email}: ${verificationCode}`);

    return { message: 'Verification code sent' };
  }

  /**
   * Login user
   */
  async login(user: LoginUser, deviceInfo?: string, ipAddress?: string): Promise<AuthResponseDto> {
    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user, deviceInfo, ipAddress);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
          ? {
              id: user.role.id.toString(),
              nameEn: user.role.nameEn,
              nameAr: user.role.nameAr,
            }
          : undefined,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    };
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    user: LoginUser,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Generate unique token ID for refresh token
    const tokenId = randomBytes(32).toString('hex');

    // Access token payload
    const accessPayload: JwtPayload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.role?.nameEn,
      userType: user.userType,
      type: 'access',
    };

    // Refresh token payload
    const refreshPayload: JwtPayload = {
      sub: user.id.toString(),
      email: user.email,
      type: 'refresh',
      jti: tokenId,
    };

    // Sign tokens
    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokenId,
        deviceInfo,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(
    user: LoginUser,
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Decode old refresh token to get token ID
    const decoded = this.jwtService.decode<JwtPayload>(oldRefreshToken);

    if (!decoded?.jti) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { token: decoded.jti },
      data: { isRevoked: true },
    });

    // Generate new tokens
    return this.generateTokens(user);
  }

  /**
   * Logout (revoke refresh token)
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    const decoded = this.jwtService.decode(refreshToken);

    if (decoded?.jti) {
      await this.prisma.refreshToken.updateMany({
        where: { token: decoded.jti },
        data: { isRevoked: true },
      });
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: bigint): Promise<{ message: string }> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return { message: 'Logged out from all devices' };
  }

  /**
   * Forgot password - send reset code
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset code has been sent' };
    }

    // Generate reset code (hardcoded to 1111 for now)
    const resetCode = '1111';
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetCode: resetCode,
        passwordResetExpiry: resetExpiry,
      },
    });

    // TODO: Send reset code via email
    console.log(`Password reset code for ${email}: ${resetCode}`);

    return { message: 'If the email exists, a reset code has been sent' };
  }

  /**
   * Reset password with code
   */
  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.passwordResetCode || !user.passwordResetExpiry) {
      throw new BadRequestException('No reset code found');
    }

    if (user.passwordResetExpiry < new Date()) {
      throw new BadRequestException('Reset code expired');
    }

    if (user.passwordResetCode !== code) {
      throw new BadRequestException('Invalid reset code');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset code
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetCode: null,
        passwordResetExpiry: null,
      },
    });

    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });

    return { message: 'Password reset successfully' };
  }

  /**
   * Verify phone with code
   */
  async verifyPhone(phone: string, code: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isPhoneVerified) {
      throw new BadRequestException('Phone already verified');
    }

    if (!user.phoneVerificationCode || !user.phoneVerificationExpiry) {
      throw new BadRequestException('No verification code found');
    }

    if (user.phoneVerificationExpiry < new Date()) {
      throw new BadRequestException('Verification code expired');
    }

    if (user.phoneVerificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    // Mark phone as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isPhoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationExpiry: null,
      },
    });

    return { message: 'Phone verified successfully' };
  }

  /**
   * Send phone verification code
   */
  async sendPhoneVerification(phone: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isPhoneVerified) {
      throw new BadRequestException('Phone already verified');
    }

    // Generate verification code
    const verificationCode = '1111';
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerificationCode: verificationCode,
        phoneVerificationExpiry: verificationExpiry,
      },
    });

    // TODO: Send SMS
    console.log(`Phone verification code for ${phone}: ${verificationCode}`);

    return { message: 'Verification code sent' };
  }

  /**
   * Get user sessions
   */
  async getSessions(userId: bigint) {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Revoke specific session
   */
  async revokeSession(userId: bigint, sessionId: bigint): Promise<{ message: string }> {
    await this.prisma.refreshToken.updateMany({
      where: {
        id: sessionId,
        userId,
      },
      data: {
        isRevoked: true,
      },
    });

    return { message: 'Session revoked successfully' };
  }
}
