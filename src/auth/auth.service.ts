import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../prisma';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { randomBytes } from 'crypto';
import { PermissionUtil } from '../common/utils/permission.util';
import { USERS_REPOSITORY, User as UserInterface } from '@/common/interfaces';
import { UsersRepository } from '@/core/users/users.repository';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CaseTransformer } from '../common/utils/case-transformer.util';
import { Response } from 'express';

/** Same include as local/JWT validation — single source for “user + role + permissions”. */
export type AuthUserPayload = Prisma.UserGetPayload<{
  include: {
    role: {
      include: {
        permissions: {
          select: {
            id: true;
            resource: true;
            action: true;
          };
        };
        translations: true;
      };
    };
  };
}>;

type AuthSessionSummary = Prisma.RefreshTokenGetPayload<{
  select: {
    id: true;
    deviceInfo: true;
    ipAddress: true;
    createdAt: true;
    expiresAt: true;
  };
}>;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
  ) {}

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<AuthUserPayload | null> {
    const user = (await this.usersRepository.findOne(
      { email },
      {
        include: {
          role: {
            include: {
              permissions: {
                select: {
                  id: true,
                  resource: true,
                  action: true,
                },
              },
              translations: true,
            },
          },
        },
      },
    )) as AuthUserPayload | null;

    if (!user || !user.password) {
      return null;
    }

    if (user.userType !== 'admin') {
      throw new UnauthorizedException('Access denied. Password-based login is restricted to admins.');
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
    const existingUser = await this.usersRepository.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Generate verification code (hardcoded to 1111 for now)
    const verificationCode = '1111';
    const verificationExpiry = new Date(Date.now() + 150 * 60 * 1000); // 150 minutes

    // Create user
    await this.usersRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      phone: registerDto.phone,
      phoneCode: registerDto.phoneCode,
      emailVerificationCode: verificationCode,
      emailVerificationExpiry: verificationExpiry,
      isEmailVerified: false,
      isActive: true,
    });

    // TODO: Send verification email with code
    console.log(`Email verification code for ${registerDto.email}: ${verificationCode}`);

    return {
      message: 'Registration successful. Please verify your email with the code sent.',
    };
  }

  /**
   * Login user (typically used for admin password login)
   */
  async login(
    user: AuthUserPayload,
    deviceInfo?: string,
    ipAddress?: string,
    lang: string = 'en',
  ): Promise<AuthResponseDto> {
    // For admins, verify email is verified
    if (user.userType === 'admin' && !user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user, deviceInfo, ipAddress);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id.toString(),
        name: user.name || '',
        email: user.email || '',
        role: user.role
          ? {
              id: user.role.id.toString(),
              name:
                user.role.translations?.find((t) => t.langId === lang)?.name ||
                user.role.translations?.find((t) => t.langId === 'en')?.name ||
                '',
              permissions: PermissionUtil.groupPermissionsAsStrings(user.role.permissions),
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
  private parseExpirationToMs(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1), 10);
    if (isNaN(value)) {
      return 7 * 24 * 60 * 60 * 1000; // default 7 days
    }
    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'm':
        return value * 60 * 1000;
      case 's':
        return value * 1000;
      default:
        return value; // assume ms
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    user: AuthUserPayload,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Generate unique token ID for refresh token
    const tokenId = randomBytes(32).toString('hex');

    const accessPayload: JwtPayload = {
      sub: user.id.toString(),
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      role: user.role?.translations?.find((t) => t.langId === 'en')?.name ?? undefined,
      userType: user.userType ?? undefined,
      type: 'access',
    };

    // Refresh token payload
    const refreshPayload: JwtPayload = {
      sub: user.id.toString(),
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      type: 'refresh',
      jti: tokenId,
    };

    // Sign tokens
    const accessSecret = this.getJwtSigningSecretOrThrow('JWT_SECRET');
    const refreshSecret = this.getJwtSigningSecretOrThrow('JWT_REFRESH_SECRET');
    const accessExpiration = this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m');
    const refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: accessSecret,
      expiresIn: accessExpiration as unknown as '15m',
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: refreshSecret,
      expiresIn: refreshExpiration as unknown as '7d',
    });

    // Store refresh token in database
    await this.refreshTokensRepository.create({
      userId: user.id,
      token: tokenId,
      deviceInfo,
      ipAddress,
      expiresAt: new Date(Date.now() + this.parseExpirationToMs(refreshExpiration)),
    });

    return { accessToken, refreshToken };
  }

  /**
   * Send verification code (OTP) via Email or Phone
   */
  async sendOtp(dto: SendOtpDto): Promise<{ message: string }> {
    const type = dto.type;
    let user: UserInterface | null = null;

    if (type === 'email') {
      const email = dto.email;
      if (!email) {
        throw new BadRequestException('Email is required');
      }
      user = await this.usersRepository.findByEmail(email);

      if (!user) {
        // Auto-register new client
        user = await this.usersRepository.create({
          email,
          userType: 'client',
          isActive: true,
          isEmailVerified: false,
        });
      }
    } else {
      const phone = dto.phone;
      const phoneCode = dto.phoneCode ?? '+966';
      if (!phone) {
        throw new BadRequestException('Phone is required');
      }
      user = await this.usersRepository.findByPhone(phoneCode, phone);

      if (!user) {
        // Auto-register new client
        user = await this.usersRepository.create({
          phone,
          phoneCode,
          userType: 'client',
          isActive: true,
          isPhoneVerified: false,
        });
      }
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is inactive or not found');
    }

    // Generate verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    if (type === 'email') {
      await this.usersRepository.update(user.id, {
        emailVerificationCode: verificationCode,
        emailVerificationExpiry: verificationExpiry,
      });
      console.log(`[OTP] Email verification code for ${dto.email}: ${verificationCode}`);
    } else {
      await this.usersRepository.update(user.id, {
        phoneVerificationCode: verificationCode,
        phoneVerificationExpiry: verificationExpiry,
      });
      console.log(`[OTP] Phone verification code for ${user.phoneCode ?? ''}${user.phone ?? ''}: ${verificationCode}`);
    }

    return { message: 'Verification code sent successfully' };
  }

  /**
   * Verify verification code (OTP) and login/register client user
   */
  async verifyOtp(
    dto: VerifyOtpDto,
    deviceInfo?: string,
    ipAddress?: string,
    lang: string = 'en',
  ): Promise<AuthResponseDto> {
    const type = dto.type;
    let user: AuthUserPayload | null = null;

    if (type === 'email') {
      const email = dto.email;
      if (!email) {
        throw new BadRequestException('Email is required');
      }
      user = (await this.usersRepository.findOne(
        { email },
        {
          include: {
            role: {
              include: {
                permissions: true,
                translations: true,
              },
            },
          },
        },
      )) as AuthUserPayload | null;

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.emailVerificationCode || !user.emailVerificationExpiry) {
        throw new BadRequestException('No verification code found');
      }

      if (user.emailVerificationExpiry < new Date()) {
        throw new BadRequestException('Verification code expired');
      }

      if (user.emailVerificationCode !== dto.code) {
        throw new BadRequestException('Invalid verification code');
      }

      // Mark as verified
      await this.usersRepository.update(user.id, {
        isEmailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpiry: null,
      });
    } else {
      const phone = dto.phone;
      const phoneCode = dto.phoneCode ?? '+966';
      if (!phone) {
        throw new BadRequestException('Phone is required');
      }
      user = (await this.usersRepository.findOne(
        { phone, phoneCode },
        {
          include: {
            role: {
              include: {
                permissions: true,
                translations: true,
              },
            },
          },
        },
      )) as AuthUserPayload | null;

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.phoneVerificationCode || !user.phoneVerificationExpiry) {
        throw new BadRequestException('No verification code found');
      }

      if (user.phoneVerificationExpiry < new Date()) {
        throw new BadRequestException('Verification code expired');
      }

      if (user.phoneVerificationCode !== dto.code) {
        throw new BadRequestException('Invalid verification code');
      }

      // Mark as verified
      await this.usersRepository.update(user.id, {
        isPhoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationExpiry: null,
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Guest User Session Migration
    if (dto.guestToken) {
      const guestUser = await this.usersRepository.findOne({ guestToken: dto.guestToken });

      if (guestUser && guestUser.id !== user.id) {
        // Perform structural migration inside database transaction
        await this.prisma.$transaction(async (tx) => {
          // Check relations like Address, Order, Review, etc.
          await tx.address.updateMany({
            where: { userId: guestUser.id },
            data: { userId: user.id },
          });

          await tx.order.updateMany({
            where: { userId: guestUser.id },
            data: { userId: user.id },
          });

          await tx.review.updateMany({
            where: { userId: guestUser.id },
            data: { userId: user.id },
          });

          // Delete guest user
          await tx.user.delete({
            where: { id: guestUser.id },
          });
        });
        console.log(`[GUEST MIGRATION] Migrated and deleted guest user ID: ${guestUser.id} to user ID: ${user.id}`);
      }
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await this.generateTokens(user, deviceInfo, ipAddress);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id.toString(),
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || undefined,
        role: user.role
          ? {
              id: user.role.id.toString(),
              name:
                user.role.translations.find((t: { langId: string; name: string }) => t.langId === lang)?.name ||
                user.role.translations.find((t: { langId: string; name: string }) => t.langId === 'en')?.name ||
                '',
              permissions: PermissionUtil.groupPermissionsAsStrings(user.role.permissions),
            }
          : undefined,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    };
  }

  /**
   * Create a guest user profile and generate tokens
   */
  async createGuest(deviceInfo?: string, ipAddress?: string): Promise<AuthResponseDto> {
    const guestToken = 'guest_' + randomBytes(16).toString('hex');

    // Create new guest user record
    const guestUser = (await this.usersRepository.create(
      {
        name: 'Guest User',
        userType: 'client',
        guestToken: guestToken,
        isActive: true,
        isEmailVerified: false,
        isPhoneVerified: false,
      },
      {
        include: {
          role: {
            include: {
              permissions: true,
              translations: true,
            },
          },
        },
      },
    )) as AuthUserPayload;

    // Generate access and refresh tokens for guest
    const { accessToken, refreshToken } = await this.generateTokens(guestUser, deviceInfo, ipAddress);

    return {
      accessToken,
      refreshToken,
      user: {
        id: guestUser.id.toString(),
        name: guestUser.name || 'Guest User',
        email: '',
        guestToken: guestUser.guestToken ?? undefined,
        role: undefined,
        isEmailVerified: false,
        isPhoneVerified: false,
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(
    user: AuthUserPayload,
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Decode old refresh token to get token ID
    const decoded = this.jwtService.decode<JwtPayload>(oldRefreshToken);

    if (!decoded?.jti) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old refresh token
    await this.refreshTokensRepository.revokeByToken(decoded.jti);

    // Generate new tokens
    return this.generateTokens(user);
  }

  /**
   * Logout (revoke refresh token)
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    const decoded = this.jwtService.decode<JwtPayload>(refreshToken);

    if (decoded?.jti) {
      await this.refreshTokensRepository.revokeByToken(decoded.jti);
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: bigint): Promise<{ message: string }> {
    await this.refreshTokensRepository.revokeAllUserTokens(userId);

    return { message: 'Logged out from all devices' };
  }

  /**
   * Forgot password - send reset code
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset code has been sent' };
    }

    // Generate reset code (hardcoded to 1111 for now)
    const resetCode = '1111';
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.usersRepository.update(user.id, {
      passwordResetCode: resetCode,
      passwordResetExpiry: resetExpiry,
    });

    // TODO: Send reset code via email
    console.log(`Password reset code for ${email}: ${resetCode}`);

    return { message: 'If the email exists, a reset code has been sent' };
  }

  /**
   * Reset password with code
   */
  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ email });

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
    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      passwordResetCode: null,
      passwordResetExpiry: null,
    });

    // Revoke all refresh tokens
    await this.refreshTokensRepository.revokeAllUserTokens(user.id);

    return { message: 'Password reset successfully' };
  }

  /**
   * Verify phone with code
   */
  async verifyPhone(phone: string, code: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ phone });

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
    await this.usersRepository.update(user.id, {
      isPhoneVerified: true,
      phoneVerificationCode: null,
      phoneVerificationExpiry: null,
    });

    return { message: 'Phone verified successfully' };
  }

  /**
   * Send phone verification code
   */
  async sendPhoneVerification(phone: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ phone });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isPhoneVerified) {
      throw new BadRequestException('Phone already verified');
    }

    // Generate verification code
    const verificationCode = '1111';
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.usersRepository.update(user.id, {
      phoneVerificationCode: verificationCode,
      phoneVerificationExpiry: verificationExpiry,
    });

    // TODO: Send SMS
    console.log(`Phone verification code for ${phone}: ${verificationCode}`);

    return { message: 'Verification code sent' };
  }

  /**
   * Get user sessions
   */
  async getSessions(userId: bigint): Promise<AuthSessionSummary[]> {
    return this.refreshTokensRepository.getUserSessions(userId);
  }

  /**
   * Revoke specific session
   */
  async revokeSession(userId: bigint, sessionId: bigint): Promise<{ message: string }> {
    await this.refreshTokensRepository.revokeSession(userId, sessionId);
    return { message: 'Session revoked successfully' };
  }

  /**
   * Set secure HttpOnly cookies and format Auth response depending on platform
   */
  handleAuthResponse(
    res: Response,
    authResult: { accessToken: string; refreshToken: string; user?: Record<string, unknown> },
    platform: string,
  ): Response {
    if (platform === 'browser') {
      res.cookie('refreshToken', authResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const { refreshToken: _r, ...resultWithoutRefresh } = authResult;
      const snakeCaseResult = CaseTransformer.transformToSnake(resultWithoutRefresh);
      return res.status(201).json(snakeCaseResult);
    }

    const snakeCaseResult = CaseTransformer.transformToSnake(authResult);
    return res.status(201).json(snakeCaseResult);
  }

  /**
   * Clear refresh token cookie from the client response
   */
  clearRefreshTokenCookie(res: Response) {
    res.clearCookie('refreshToken');
  }

  private getJwtSigningSecretOrThrow(envKey: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): string {
    const secret = this.configService.get<string>(envKey);
    if (!secret || secret.trim() === '') {
      throw new Error(`${envKey} is not configured`);
    }
    return secret;
  }
}
