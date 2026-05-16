import { Controller, Post, Body, UseGuards, Get, Req, Param, Delete, UnauthorizedException } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { AuthService, AuthUserPayload } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Request } from 'express';
import { PermissionUtil } from '../common/utils/permission.util';

interface AuthUser {
  id: bigint;
  name: string;
  email: string;
  phone?: string;
  role?: { id: bigint; translations: { langId: string; name: string }[] };
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  [key: string]: unknown;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.email, verifyEmailDto.code);
  }

  @Public()
  @Post('resend-email-verification')
  async resendEmailVerification(@Body() body: { email: string }) {
    return this.authService.resendEmailVerification(body.email);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Body() _loginDto: LoginDto, @I18nLang() lang: string) {
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip;

    // req.user should exist because LocalAuthGuard ensures authentication
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.authService.login(req.user as AuthUserPayload, deviceInfo, ipAddress, lang);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@CurrentUser() user: AuthUserPayload, @Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(user, refreshTokenDto.refreshToken);
  }

  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Post('logout-all')
  async logoutAll(@CurrentUser() user: AuthUserPayload) {
    return this.authService.logoutAll(user.id);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.email, resetPasswordDto.code, resetPasswordDto.newPassword);
  }

  @Public()
  @Post('verify-phone')
  async verifyPhone(@Body() verifyPhoneDto: VerifyPhoneDto) {
    return this.authService.verifyPhone(verifyPhoneDto.phone, verifyPhoneDto.code);
  }

  @Public()
  @Post('send-phone-verification')
  async sendPhoneVerification(@Body() body: { phone: string }) {
    return this.authService.sendPhoneVerification(body.phone);
  }

  @Get('me')
  getProfile(@CurrentUser() user: AuthUserPayload, @I18nLang() lang: string) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
        ? {
            id: user.role.id.toString(),
            name:
              user.role.translations.find((t) => t.langId === lang)?.name ||
              user.role.translations.find((t) => t.langId === 'en')?.name ||
              '',
            permissions: PermissionUtil.groupPermissions(user.role.permissions),
          }
        : null,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      isActive: user.isActive,
    };
  }

  @Get('sessions')
  async getSessions(@CurrentUser() user: AuthUser) {
    return this.authService.getSessions(user.id);
  }

  @Delete('sessions/:sessionId')
  async revokeSession(@CurrentUser() user: AuthUser, @Param('sessionId') sessionId: string) {
    return this.authService.revokeSession(user.id, BigInt(sessionId));
  }
}
