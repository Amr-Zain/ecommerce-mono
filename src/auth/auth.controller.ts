import { Controller, Post, Body, UseGuards, Get, Req, Res, Param, Delete, UnauthorizedException } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { AuthService, AuthUserPayload } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Request, Response } from 'express';
import { PermissionUtil } from '../common/utils/permission.util';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterDto } from './dto/register.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

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
  @Post('send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto);
  }

  @Public()
  @Post('login-otp')
  async loginOtp(@Req() req: Request, @Res() res: Response, @Body() verifyOtpDto: VerifyOtpDto) {
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip;
    const platform = (req.headers['x-platform'] as string) || 'browser';

    const authResult = await this.authService.verifyOtp(verifyOtpDto, deviceInfo, ipAddress);
    return this.authService.handleAuthResponse(res, authResult, platform);
  }

  @Public()
  @Post('create-guest')
  async createGuest(@Req() req: Request, @Res() res: Response) {
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip;
    const platform = (req.headers['x-platform'] as string) || 'browser';

    const authResult = await this.authService.createGuest(deviceInfo, ipAddress);
    return this.authService.handleAuthResponse(res, authResult, platform);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response, @Body() _loginDto: LoginDto, @I18nLang() lang: string) {
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip;
    const platform = (req.headers['x-platform'] as string) || 'browser';

    // req.user should exist because LocalAuthGuard ensures authentication
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const authResult = await this.authService.login(req.user as AuthUserPayload, deviceInfo, ipAddress, lang);
    return this.authService.handleAuthResponse(res, authResult, platform);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @CurrentUser() user: AuthUserPayload,
    @Req() req: Request,
    @Res() res: Response,
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    const cookies = req.cookies as Record<string, string> | undefined;
    const token = cookies?.['refreshToken'] || refreshTokenDto.refreshToken;
    if (!token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const platform = (req.headers['x-platform'] as string) || 'browser';
    const authResult = await this.authService.refreshAccessToken(user, token);
    return this.authService.handleAuthResponse(res, authResult, platform);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response, @Body() refreshTokenDto: RefreshTokenDto) {
    const cookies = req.cookies as Record<string, string> | undefined;
    const token = cookies?.['refreshToken'] || refreshTokenDto.refreshToken;
    if (!token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    // Revoke token
    const result = await this.authService.logout(token);

    // Clear cookie if present
    this.authService.clearRefreshTokenCookie(res);

    return res.status(200).json(result);
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
