import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Inject,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
import { EmailOtpChallengeService } from './services/email-otp-challenge.service';
import { DomainEventPublisher } from '@/common/events/domain-event-publisher.service';
import { createDomainEvent, DOMAIN_EVENTS } from '@/common/events/domain-event';
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
  EMAIL_OTP_PURPOSES,
  AuthConfigSecretKey,
  getRefreshTokenCookieName,
} from '../common/constants/auth.constants';
import { LoyaltyService } from '@/shared/loyalty/loyalty.service';

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
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly anonymousSessions: AnonymousSessionService,
    private readonly emailChallenges: EmailOtpChallengeService,
    private readonly eventEmitter: EventEmitter2,
    private readonly domainEvents: DomainEventPublisher,
    private readonly loyaltyService: LoyaltyService,
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
  async register(
    registerDto: RegisterDto,
    requestIp?: string,
    lang: string = AUTH_DEFAULTS.language,
  ): Promise<{ message: string }> {
    const isEmailRegistration = registerDto.type === AUTH_IDENTIFIER_TYPES.email;
    const existingUser = isEmailRegistration
      ? await this.usersRepository.findByEmail(registerDto.email!)
      : await this.usersRepository.findByPhone(registerDto.phoneCode, registerDto.phone!);

    if (existingUser) {
      throw new ConflictException(this.i18n.t(isEmailRegistration ? 'errors.email_exists' : 'errors.phone_exists'));
    }

    const verificationCode = AUTH_DEFAULTS.phoneVerificationCode;
    const verificationExpiry = new Date(Date.now() + AUTH_SECURITY.registrationVerificationExpiryMs);

    const user = await this.usersRepository.create({
      name: registerDto.name,
      email: isEmailRegistration ? registerDto.email : undefined,
      phone: isEmailRegistration ? undefined : registerDto.phone,
      phoneCode: isEmailRegistration ? undefined : registerDto.phoneCode,
      userType: AUTH_USER_TYPES.client,
      phoneVerificationCode: isEmailRegistration ? undefined : verificationCode,
      phoneVerificationExpiry: isEmailRegistration ? undefined : verificationExpiry,
      isEmailVerified: false,
      isPhoneVerified: false,
      isActive: true,
    });

    if (isEmailRegistration) {
      const challenge = await this.emailChallenges.create({
        recipient: registerDto.email!,
        purpose: EMAIL_OTP_PURPOSES.login,
        userId: user.id,
        requestIp,
        locale: lang,
      });
      await this.deliverEmailChallenge(challenge, DOMAIN_EVENTS.authEmailOtpRequested);
    } else {
      console.log(`Phone verification code for ${registerDto.phoneCode}${registerDto.phone}: ${verificationCode}`);
    }

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
    const { accessToken, refreshToken, sessionId } = await this.generateTokens(user, deviceInfo, ipAddress);
    await this.anonymousSessions.claim(anonymousToken, user.id);

    return {
      accessToken,
      refreshToken,
      sessionId,
      user: {
        id: user.id.toString(),
        name: user.name || '',
        email: user.email || '',
        userType: user.userType ?? AUTH_USER_TYPES.admin,
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
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
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
    const session = await this.refreshTokensRepository.create({
      userId: user.id,
      token: tokenId,
      deviceInfo,
      ipAddress,
      expiresAt: new Date(Date.now() + this.parseExpirationToMs(refreshExpiration)),
    });

    return { accessToken, refreshToken, sessionId: session.id.toString() };
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

  private authResult(
    user: AuthUserPayload,
    accessToken: string,
    refreshToken: string,
    sessionId: string,
  ): AuthResponseDto {
    return {
      accessToken,
      refreshToken,
      sessionId,
      user: {
        id: user.id.toString(),
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || undefined,
        userType: user.userType ?? AUTH_USER_TYPES.client,
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
  async sendOtp(
    dto: SendOtpDto,
    requestIp?: string,
    lang: string = AUTH_DEFAULTS.language,
  ): Promise<{ message: string }> {
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

    const verificationCode = AUTH_DEFAULTS.phoneVerificationCode;
    const verificationExpiry = new Date(Date.now() + AUTH_SECURITY.verificationExpiryMs);

    if (type === AUTH_IDENTIFIER_TYPES.email) {
      const challenge = await this.emailChallenges.create({
        recipient: dto.email!,
        purpose: EMAIL_OTP_PURPOSES.login,
        userId: user.id,
        requestIp,
        locale: lang,
      });
      await this.deliverEmailChallenge(challenge, DOMAIN_EVENTS.authEmailOtpRequested);
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

      await this.emailChallenges.consume(EMAIL_OTP_PURPOSES.login, email, dto.code, async (tx) => {
        await tx.user.update({ where: { id: user!.id }, data: { isEmailVerified: true } });
        await this.domainEvents.publish(
          createDomainEvent({
            eventName: DOMAIN_EVENTS.authEmailVerified,
            aggregateType: 'user',
            aggregateId: user!.id.toString(),
            payload: {
              userId: user!.id.toString(),
              recipient: email.toLowerCase(),
              locale: lang,
              name: user!.name ?? undefined,
            },
          }),
          tx,
        );
      });
      user = { ...user, isEmailVerified: true };
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
      await this.loyaltyService.awardWelcome(user.id);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(this.i18n.t('errors.account_inactive'));
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken, sessionId } = await this.generateTokens(user, deviceInfo, ipAddress);
    await this.anonymousSessions.claim(anonymousToken, user.id);

    return {
      accessToken,
      refreshToken,
      sessionId,
      user: {
        id: user.id.toString(),
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || undefined,
        userType: user.userType ?? AUTH_USER_TYPES.client,
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

    const previousSession = await this.refreshTokensRepository.consumeActiveToken(decoded.jti, user.id);
    if (!previousSession) {
      throw new UnauthorizedException(this.i18n.t('errors.invalid_refresh_token'));
    }

    const { accessToken, refreshToken, sessionId } = await this.generateTokens(
      user,
      previousSession.deviceInfo ?? undefined,
      previousSession.ipAddress ?? undefined,
    );
    return this.authResult(user, accessToken, refreshToken, sessionId);
  }

  /**
   * Logout (revoke refresh token)
   */
  async logout(userId: bigint, refreshToken: string): Promise<{ message: string }> {
    const decoded = this.jwtService.decode<JwtPayload>(refreshToken);

    if (!decoded?.jti || decoded.sub !== userId.toString()) {
      throw new UnauthorizedException(this.i18n.t('errors.invalid_refresh_token'));
    }

    await this.refreshTokensRepository.revokeByToken(decoded.jti, userId);

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
  async forgotPassword(
    email: string,
    requestIp?: string,
    lang: string = AUTH_DEFAULTS.language,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return { message: this.i18n.t('common.auth_password_reset_code_sent') };
    }

    try {
      const challenge = await this.emailChallenges.create({
        recipient: email,
        purpose: EMAIL_OTP_PURPOSES.passwordReset,
        userId: user.id,
        requestIp,
        locale: lang,
      });
      await this.deliverEmailChallenge(challenge, DOMAIN_EVENTS.authPasswordResetRequested);
    } catch (error) {
      this.logger.error('Password reset email delivery failed', error);
    }

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

    const hashedPassword = await bcrypt.hash(newPassword, AUTH_SECURITY.bcryptRounds);
    await this.emailChallenges.consume(EMAIL_OTP_PURPOSES.passwordReset, email, code, async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
      await tx.refreshToken.updateMany({ where: { userId: user.id, isRevoked: false }, data: { isRevoked: true } });
    });

    return { message: this.i18n.t('common.auth_password_reset_successful') };
  }

  /**
   * Change an authenticated dashboard administrator's password.
   */
  async changePassword(userId: bigint, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ id: userId });

    if (!user || user.userType !== AUTH_USER_TYPES.admin || !user.password) {
      throw new BadRequestException(this.i18n.t('errors.invalid_credentials'));
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException(this.i18n.t('errors.invalid_credentials'));
    }

    const password = await bcrypt.hash(newPassword, AUTH_SECURITY.bcryptRounds);
    await this.usersRepository.update(userId, { password });

    return { message: this.i18n.t('common.auth_password_changed_successfully') };
  }

  private async deliverEmailChallenge(
    challenge: { id: string; code: string; expiresAt: Date; recipient: string; locale: string },
    eventName: typeof DOMAIN_EVENTS.authEmailOtpRequested | typeof DOMAIN_EVENTS.authPasswordResetRequested,
  ) {
    const purpose = eventName === DOMAIN_EVENTS.authEmailOtpRequested ? 'login' : 'password_reset';
    try {
      await this.eventEmitter.emitAsync(
        eventName,
        createDomainEvent({
          eventName,
          aggregateType: 'email_otp_challenge',
          aggregateId: challenge.id,
          payload: {
            recipient: challenge.recipient,
            locale: challenge.locale,
            code: challenge.code,
            expiresAt: challenge.expiresAt.toISOString(),
            purpose,
          },
        }),
      );
    } catch (error) {
      await this.emailChallenges.invalidate(challenge.id);
      throw new ServiceUnavailableException(this.i18n.t('errors.email_delivery_unavailable'), { cause: error });
    }
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
    await this.loyaltyService.awardWelcome(user.id);

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
    const verificationCode = AUTH_DEFAULTS.phoneVerificationCode;
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
    const revoked = await this.refreshTokensRepository.revokeSession(userId, sessionId);
    if (!revoked) {
      throw new NotFoundException('Active session not found');
    }
    return { message: this.i18n.t('common.auth_session_revoked_successfully') };
  }

  /**
   * Set secure HttpOnly cookies and format Auth response depending on platform
   */
  handleAuthResponse(
    res: Response,
    authResult: AuthResponseDto,
    platform: string,
    previousCookieName?: string,
  ): Response {
    if (platform === AUTH_PLATFORMS.browser) {
      const cookieName = getRefreshTokenCookieName(authResult.user.userType);
      res.cookie(cookieName, authResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === AUTH_ENVIRONMENTS.production,
        sameSite: AUTH_COOKIE.sameSite,
        maxAge: AUTH_SECURITY.refreshCookieMaxAgeMs,
      });

      if (previousCookieName && previousCookieName !== cookieName) {
        res.clearCookie(previousCookieName);
      }

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
  clearRefreshTokenCookie(res: Response, cookieName: string) {
    res.clearCookie(cookieName);
  }

  private getJwtSigningSecretOrThrow(envKey: AuthConfigSecretKey): string {
    const secret = this.configService.get<string>(envKey);
    if (!secret || secret.trim() === '') {
      throw new Error(`${envKey} is not configured`);
    }
    return secret;
  }
}
