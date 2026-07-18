import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { PermissionDiscoveryService } from './services/permission-discovery.service';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { MediaModule } from '../media/media.module';
import { UsersModule as CoreUsersModule } from '@/core/users/users.module';
import { AnonymousSessionService } from './services/anonymous-session.service';
import { AnonymousSessionsRepository } from './repositories/anonymous-sessions.repository';
import { EmailOtpChallengeService } from './services/email-otp-challenge.service';
import { EmailOtpChallengesRepository } from './repositories/email-otp-challenges.repository';
import { EMAIL_OTP_CHALLENGES_REPOSITORY } from './repositories/email-otp-challenges.repository.port';
import { LoyaltyModule } from '@/shared/loyalty/loyalty.module';
import { RolesModule as CoreRolesModule } from '@/core/roles/roles.module';

@Module({
  imports: [
    PassportModule,
    DiscoveryModule,
    MediaModule,
    CoreUsersModule,
    CoreRolesModule,
    LoyaltyModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION', '15m') as unknown as '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    OptionalJwtAuthGuard,
    PermissionDiscoveryService,
    RefreshTokensRepository,
    AnonymousSessionService,
    AnonymousSessionsRepository,
    EmailOtpChallengeService,
    { provide: EMAIL_OTP_CHALLENGES_REPOSITORY, useClass: EmailOtpChallengesRepository },
  ],
  exports: [AuthService, RefreshTokensRepository, OptionalJwtAuthGuard, AnonymousSessionService],
})
export class AuthModule {}
