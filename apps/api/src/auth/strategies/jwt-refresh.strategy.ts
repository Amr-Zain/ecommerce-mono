import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { RefreshTokensRepository } from '../repositories/refresh-tokens.repository';
import { Request } from 'express';

interface EnrichedRefreshToken {
  id: bigint;
  isRevoked: boolean;
  expiresAt: Date;
  user: {
    id: bigint;
    isActive: boolean;
    name: string | null;
    email: string | null;
    phone: string | null;
    phoneCode: string | null;
    userType: string;
    guestToken: string | null;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    role?: {
      id: bigint;
      translations: { langId: string; name: string }[];
      permissions: { id: bigint; resource: string; action: string }[];
    };
  };
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    private refreshTokensRepository: RefreshTokensRepository,
  ) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token: string | null = null;
          if (request && request.cookies) {
            token = (request.cookies as Record<string, string>)['refreshToken'] || null;
          }
          return token;
        },
        ExtractJwt.fromBodyField('refreshToken'),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    // Only validate refresh tokens
    if (payload.type !== 'refresh' || !payload.jti) {
      throw new UnauthorizedException('Invalid token type');
    }

    // Check if refresh token exists and is not revoked
    const refreshToken = (await this.refreshTokensRepository.findOne(
      { token: payload.jti },
      {
        include: {
          user: {
            include: {
              role: {
                include: {
                  permissions: true,
                  translations: true,
                },
              },
            },
          },
        },
      },
    )) as unknown as EnrichedRefreshToken;

    if (!refreshToken || refreshToken.isRevoked) {
      throw new UnauthorizedException('Invalid or revoked refresh token');
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    if (!refreshToken.user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    return refreshToken.user;
  }
}
