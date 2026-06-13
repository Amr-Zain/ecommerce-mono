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
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../generated/i18n.generated';
import { AnonymousSessionService } from './services/anonymous-session.service';
import {
  AUTH_CONFIG_KEYS,
  AUTH_COOKIE,
  AUTH_DEFAULTS,
  AUTH_ENCODING,
  AUTH_ENVIRONMENTS,
  AUTH_EXPIRATION_UNITS,
  AUTH_IDENTIFIER_TYPES,
  AUTH_PLATFORMS,
  AUTH_SECURITY,
  AUTH_TOKEN_TYPES,
  AUTH_USER_TYPES,
  AuthConfigSecretKey,
} from '../common/constants/auth.constants';

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
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly anonymousSessions: AnonymousSessionService,
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

    if (user.userType !== AUTH_USER_TYPES.admin) {
      throw new UnauthorizedException(this.i18n.t('errors.password_login_admin_only'));
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
    const isEmailRegistration = registerDto.type === AUTH_IDENTIFIER_TYPES.email;
    const existingUser = isEmailRegistration
      ? await this.usersRepository.findByEmail(registerDto.email!)
      : await this.usersRepository.findByPhone(registerDto.phoneCode, registerDto.phone!);

    if (existingUser) {
      throw new ConflictException(this.i18n.t(isEmailRegistration ? 'errors.email_exists' : 'errors.phone_exists'));
    }

    // Generate verification code (hardcoded to 1111 for now)
    const verificationCode = AUTH_DEFAULTS.verificationCode;
    const verificationExpiry = new Date(Date.now() + AUTH_SECURITY.registrationVerificationExpiryMs);

    await this.usersRepository.create({
      name: registerDto.name,
      email: isEmailRegistration ? registerDto.email : undefined,
      phone: isEmailRegistration ? undefined : registerDto.phone,
      phoneCode: isEmailRegistration ? undefined : registerDto.phoneCode,
      userType: AUTH_USER_TYPES.client,
      emailVerificationCode: isEmailRegistration ? verificationCode : undefined,
      emailVerificationExpiry: isEmailRegistration ? verificationExpiry : undefined,
      phoneVerificationCode: isEmailRegistration ? undefined : verificationCode,
      phoneVerificationExpiry: isEmailRegistration ? undefined : verificationExpiry,
      isEmailVerified: false,
      isPhoneVerified: false,
      isActive: true,
    });

    const destination = isEmailRegistration ? registerDto.email : `${registerDto.phoneCode}${registerDto.phone}`;
    console.log(`${isEmailRegistration ? 'Email' : 'Phone'} verification code for ${destination}: ${verificationCode}`);

    return {
      message: this.i18n.t(
        isEmailRegistration ? 'common.auth_email_registration_successful' : 'common.auth_phone_registration_successful',
      ),
    };
  }

  /**
   * Login user (typically used for admin password login)
   */
  async login(
    user: AuthUserPayload,
    deviceInfo?: string,
    ipAddress?: string,
    lang: string = AUTH_DEFAULTS.language,
    anonymousToken?: string,
  ): Promise<AuthResponseDto> {
    // For admins, verify email is verified
    if (user.userType === AUTH_USER_TYPES.admin && !user.isEmailVerified) {
      throw new UnauthorizedException(this.i18n.t('errors.email_verification_required'));
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user, deviceInfo, ipAddress);
    await this.anonymousSessions.claim(anonymousToken, user.id);

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
                user.role.translations?.find((t) => t.langId === AUTH_DEFAULTS.language)?.name ||
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
      return AUTH_SECURITY.fallbackRefreshExpirationMs;
    }
    switch (unit) {
      case AUTH_EXPIRATION_UNITS.days:
        return value * 24 * 60 * 60 * 1000;
      case AUTH_EXPIRATION_UNITS.hours:
        return value * 60 * 60 * 1000;
      case AUTH_EXPIRATION_UNITS.minutes:
        return value * 60 * 1000;
      case AUTH_EXPIRATION_UNITS.seconds:
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
    const tokenId = randomBytes(AUTH_SECURITY.refreshTokenIdBytes).toString(AUTH_ENCODING.hex);

    // Refresh token payload
    const refreshPayload: JwtPayload = {
      sub: user.id.toString(),
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      type: AUTH_TOKEN_TYPES.refresh,
      jti: tokenId,
    };

    // Sign tokens
    const refreshSecret = this.getJwtSigningSecretOrThrow(AUTH_CONFIG_KEYS.refreshSecret);
    const refreshExpiration = this.configService.get<string>(
      AUTH_CONFIG_KEYS.refreshExpiration,
      AUTH_DEFAULTS.refreshExpiration,
    );

    const accessToken = this.generateAccessToken(user);

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: refreshSecret,
      expiresIn: refreshExpiration as unknown as number,
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

  private generateAccessToken(user: AuthUserPayload): string {
    const payload: JwtPayload = {
      sub: user.id.toString(),
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      role: user.role?.translations?.find((t) => t.langId === AUTH_DEFAULTS.language)?.name ?? undefined,
      userType: user.userType ?? undefined,
      type: AUTH_TOKEN_TYPES.access,
    };
    const secret = this.getJwtSigningSecretOrThrow(AUTH_CONFIG_KEYS.accessSecret);
    const expiration = this.configService.get<string>(
      AUTH_CONFIG_KEYS.accessExpiration,
      AUTH_DEFAULTS.accessExpiration,
    );

    return this.jwtService.sign(payload, {
      secret,
      expiresIn: expiration as unknown as number,
    });
  }

  private authResult(user: AuthUserPayload, accessToken: string, refreshToken: string): AuthResponseDto {
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
                user.role.translations.find((translation) => translation.langId === AUTH_DEFAULTS.language)?.name || '',
              permissions: PermissionUtil.groupPermissionsAsStrings(user.role.permissions),
            }
          : undefined,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    };
  }

  /**
   * Send verification code (OTP) via Email or Phone
   */
  async sendOtp(dto: SendOtpDto): Promise<{ message: string }> {
    const type = dto.type;
    let user: UserInterface | null = null;

    if (type === AUTH_IDENTIFIER_TYPES.email) {
      const email = dto.email;
      if (!email) {
        throw new BadRequestException(this.i18n.t('errors.email_required'));
      }
      user = await this.usersRepository.findByEmail(email);

      if (!user) {
        // Auto-register new client
        user = await this.usersRepository.create({
          email,
          userType: AUTH_USER_TYPES.client,
          isActive: true,
          isEmailVerified: false,
        });
      }
    } else {
      const phone = dto.phone;
      const phoneCode = dto.phoneCode ?? AUTH_DEFAULTS.phoneCode;
      if (!phone) {
        throw new BadRequestException(this.i18n.t('errors.phone_required'));
      }
      user = await this.usersRepository.findByPhone(phoneCode, phone);

      if (!user) {
        // Auto-register new client
        user = await this.usersRepository.create({
          phone,
          phoneCode,
          userType: AUTH_USER_TYPES.client,
          isActive: true,
          isPhoneVerified: false,
        });
      }
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException(this.i18n.t('errors.account_inactive_or_not_found'));
    }

    const verificationCode = AUTH_DEFAULTS.verificationCode;
    const verificationExpiry = new Date(Date.now() + AUTH_SECURITY.verificationExpiryMs);

    if (type === AUTH_IDENTIFIER_TYPES.email) {
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

    return { message: this.i18n.t('common.auth_verification_code_sent_successfully') };
  }

  /**
   * Verify verification code (OTP) and login/register client user
   */
  async verifyOtp(
    dto: VerifyOtpDto,
    deviceInfo?: string,
    ipAddress?: string,
    anonymousToken?: string,
    lang: string = AUTH_DEFAULTS.language,
  ): Promise<AuthResponseDto> {
    const type = dto.type;
    let user: AuthUserPayload | null = null;

    if (type === AUTH_IDENTIFIER_TYPES.email) {
      const email = dto.email;
      if (!email) {
        throw new BadRequestException(this.i18n.t('errors.email_required'));
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
        throw new UnauthorizedException(this.i18n.t('errors.invalid_credentials'));
      }

      if (!user.emailVerificationCode || !user.emailVerificationExpiry) {
        throw new BadRequestException(this.i18n.t('errors.verification_code_not_found'));
      }

      if (user.emailVerificationExpiry < new Date()) {
        throw new BadRequestException(this.i18n.t('errors.verification_code_expired'));
      }

      if (user.emailVerificationCode !== dto.code) {
        throw new BadRequestException(this.i18n.t('errors.invalid_verification_code'));
      }

      // Mark as verified
      await this.usersRepository.update(user.id, {
        isEmailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpiry: null,
      });
    } else {
      const phone = dto.phone;
      const phoneCode = dto.phoneCode ?? AUTH_DEFAULTS.phoneCode;
      if (!phone) {
        throw new BadRequestException(this.i18n.t('errors.phone_required'));
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
        throw new UnauthorizedException(this.i18n.t('errors.invalid_credentials'));
      }

      if (!user.phoneVerificationCode || !user.phoneVerificationExpiry) {
        throw new BadRequestException(this.i18n.t('errors.verification_code_not_found'));
      }

      if (user.phoneVerificationExpiry < new Date()) {
        throw new BadRequestException(this.i18n.t('errors.verification_code_expired'));
      }

      if (user.phoneVerificationCode !== dto.code) {
        throw new BadRequestException(this.i18n.t('errors.invalid_verification_code'));
      }

      // Mark as verified
      await this.usersRepository.update(user.id, {
        isPhoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationExpiry: null,
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException(this.i18n.t('errors.account_inactive'));
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await this.generateTokens(user, deviceInfo, ipAddress);
    await this.anonymousSessions.claim(anonymousToken, user.id);

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
                user.role.translations.find(
                  (t: { langId: string; name: string }) => t.langId === AUTH_DEFAULTS.language,
                )?.name ||
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
   * Refresh access token
   */
  async refreshAccessToken(user: AuthUserPayload, oldRefreshToken: string): Promise<AuthResponseDto> {
    // Decode old refresh token to get token ID
    const decoded = this.jwtService.decode<JwtPayload>(oldRefreshToken);

    if (!decoded?.jti) {
      throw new UnauthorizedException(this.i18n.t('errors.invalid_refresh_token'));
    }

    // Revoke old refresh token
    await this.refreshTokensRepository.revokeByToken(decoded.jti);

    // Generate new tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);
    return this.authResult(user, accessToken, refreshToken);
  }

  /**
   * Logout (revoke refresh token)
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    const decoded = this.jwtService.decode<JwtPayload>(refreshToken);

    if (decoded?.jti) {
      await this.refreshTokensRepository.revokeByToken(decoded.jti);
    }

    return { message: this.i18n.t('common.auth_logged_out_successfully') };
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: bigint): Promise<{ message: string }> {
    await this.refreshTokensRepository.revokeAllUserTokens(userId);

    return { message: this.i18n.t('common.auth_logged_out_all_devices') };
  }

  /**
   * Forgot password - send reset code
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return { message: this.i18n.t('common.auth_password_reset_code_sent') };
    }

    // Generate reset code (hardcoded to 1111 for now)
    const resetCode = AUTH_DEFAULTS.verificationCode;
    const resetExpiry = new Date(Date.now() + AUTH_SECURITY.verificationExpiryMs);

    await this.usersRepository.update(user.id, {
      passwordResetCode: resetCode,
      passwordResetExpiry: resetExpiry,
    });

    // TODO: Send reset code via email
    console.log(`Password reset code for ${email}: ${resetCode}`);

    return { message: this.i18n.t('common.auth_password_reset_code_sent') };
  }

  /**
   * Reset password with code
   */
  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ email });

    if (!user) {
      throw new NotFoundException(this.i18n.t('errors.user_not_found'));
    }

    if (!user.passwordResetCode || !user.passwordResetExpiry) {
      throw new BadRequestException(this.i18n.t('errors.reset_code_not_found'));
    }

    if (user.passwordResetExpiry < new Date()) {
      throw new BadRequestException(this.i18n.t('errors.reset_code_expired'));
    }

    if (user.passwordResetCode !== code) {
      throw new BadRequestException(this.i18n.t('errors.invalid_reset_code'));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, AUTH_SECURITY.bcryptRounds);

    // Update password and clear reset code
    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      passwordResetCode: null,
      passwordResetExpiry: null,
    });

    // Revoke all refresh tokens
    await this.refreshTokensRepository.revokeAllUserTokens(user.id);

    return { message: this.i18n.t('common.auth_password_reset_successful') };
  }

  /**
   * Verify phone with code
   */
  async verifyPhone(phone: string, code: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ phone });

    if (!user) {
      throw new NotFoundException(this.i18n.t('errors.user_not_found'));
    }

    if (user.isPhoneVerified) {
      throw new BadRequestException(this.i18n.t('errors.phone_already_verified'));
    }

    if (!user.phoneVerificationCode || !user.phoneVerificationExpiry) {
      throw new BadRequestException(this.i18n.t('errors.verification_code_not_found'));
    }

    if (user.phoneVerificationExpiry < new Date()) {
      throw new BadRequestException(this.i18n.t('errors.verification_code_expired'));
    }

    if (user.phoneVerificationCode !== code) {
      throw new BadRequestException(this.i18n.t('errors.invalid_verification_code'));
    }

    // Mark phone as verified
    await this.usersRepository.update(user.id, {
      isPhoneVerified: true,
      phoneVerificationCode: null,
      phoneVerificationExpiry: null,
    });

    return { message: this.i18n.t('common.auth_phone_verified_successfully') };
  }

  /**
   * Send phone verification code
   */
  async sendPhoneVerification(phone: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ phone });

    if (!user) {
      throw new NotFoundException(this.i18n.t('errors.user_not_found'));
    }

    if (user.isPhoneVerified) {
      throw new BadRequestException(this.i18n.t('errors.phone_already_verified'));
    }

    // Generate verification code
    const verificationCode = AUTH_DEFAULTS.verificationCode;
    const verificationExpiry = new Date(Date.now() + AUTH_SECURITY.verificationExpiryMs);

    await this.usersRepository.update(user.id, {
      phoneVerificationCode: verificationCode,
      phoneVerificationExpiry: verificationExpiry,
    });

    // TODO: Send SMS
    console.log(`Phone verification code for ${phone}: ${verificationCode}`);

    return { message: this.i18n.t('common.auth_verification_code_sent') };
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
    return { message: this.i18n.t('common.auth_session_revoked_successfully') };
  }

  /**
   * Set secure HttpOnly cookies and format Auth response depending on platform
   */
  handleAuthResponse(
    res: Response,
    authResult: { accessToken: string; refreshToken: string; user?: Record<string, unknown> },
    platform: string,
  ): Response {
    if (platform === AUTH_PLATFORMS.browser) {
      res.cookie(AUTH_COOKIE.refreshToken, authResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === AUTH_ENVIRONMENTS.production,
        sameSite: AUTH_COOKIE.sameSite,
        maxAge: AUTH_SECURITY.refreshCookieMaxAgeMs,
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
    res.clearCookie(AUTH_COOKIE.refreshToken);
  }

  private getJwtSigningSecretOrThrow(envKey: AuthConfigSecretKey): string {
    const secret = this.configService.get<string>(envKey);
    if (!secret || secret.trim() === '') {
      throw new Error(`${envKey} is not configured`);
    }
    return secret;
  }
}
