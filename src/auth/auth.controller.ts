import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Req,
    Param,
    Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

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
    async login(@Req() req: Request, @Body() loginDto: LoginDto) {
        const deviceInfo = req.headers['user-agent'];
        const ipAddress = req.ip;
        return this.authService.login(req.user, deviceInfo, ipAddress);
    }

    @Public()
    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    async refresh(@CurrentUser() user: any, @Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshAccessToken(user, refreshTokenDto.refreshToken);
    }

    @Post('logout')
    async logout(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.logout(refreshTokenDto.refreshToken);
    }

    @Post('logout-all')
    async logoutAll(@CurrentUser() user: any) {
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
        return this.authService.resetPassword(
            resetPasswordDto.email,
            resetPasswordDto.code,
            resetPasswordDto.newPassword,
        );
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
    async getProfile(@CurrentUser() user: any) {
        return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
                ? {
                    id: user.role.id.toString(),
                    nameEn: user.role.nameEn,
                    nameAr: user.role.nameAr,
                }
                : null,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            isActive: user.isActive,
        };
    }

    @Get('sessions')
    async getSessions(@CurrentUser() user: any) {
        return this.authService.getSessions(user.id);
    }

    @Delete('sessions/:sessionId')
    async revokeSession(@CurrentUser() user: any, @Param('sessionId') sessionId: string) {
        return this.authService.revokeSession(user.id, BigInt(sessionId));
    }
}
