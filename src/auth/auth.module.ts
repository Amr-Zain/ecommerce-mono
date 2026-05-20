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
import { PermissionDiscoveryService } from './services/permission-discovery.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../admin/users/users.module';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    DiscoveryModule,
    UsersModule,
    MediaModule,
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
    PermissionDiscoveryService,
    RefreshTokensRepository,
  ],
  exports: [AuthService, RefreshTokensRepository],
})
export class AuthModule {}
