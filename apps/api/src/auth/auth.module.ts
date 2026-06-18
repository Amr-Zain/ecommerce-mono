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
import { PrismaModule } from '../prisma/prisma.module';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { MediaModule } from '../media/media.module';
import { UsersModule as CoreUsersModule } from '@/core/users/users.module';
import { AnonymousSessionService } from './services/anonymous-session.service';
import { AnonymousSessionsRepository } from './repositories/anonymous-sessions.repository';
import { EmailOtpChallengeService } from './services/email-otp-challenge.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    DiscoveryModule,
    MediaModule,
    CoreUsersModule,
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
  ],
  exports: [AuthService, RefreshTokensRepository, OptionalJwtAuthGuard, AnonymousSessionService],
})
export class AuthModule {}
