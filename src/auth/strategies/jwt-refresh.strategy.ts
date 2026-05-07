import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
        });
    }

    async validate(payload: JwtPayload) {
        // Only validate refresh tokens
        if (payload.type !== 'refresh' || !payload.jti) {
            throw new UnauthorizedException('Invalid token type');
        }

        // Check if refresh token exists and is not revoked
        const refreshToken = await this.prisma.refreshToken.findUnique({
            where: { token: payload.jti },
            include: {
                user: {
                    include: {
                        role: {
                            include: {
                                permissions: true,
                            },
                        },
                    },
                },
            },
        });

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
