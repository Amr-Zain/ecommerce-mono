import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { RefreshToken } from '@prisma/client';
import { BaseRepository } from '../../common/repositories/base.repository';
import { MediaService } from '../../media/media.service';

export type RefreshTokenPayload = RefreshToken;

@Injectable()
export class RefreshTokensRepository extends BaseRepository<RefreshTokenPayload> {
  constructor(prisma: PrismaService, mediaService: MediaService) {
    super(prisma, mediaService, undefined);
  }

  protected getModel() {
    return this.prisma.refreshToken;
  }

  async revokeByToken(token: string, userId?: bigint): Promise<boolean> {
    const result = await this.prisma.refreshToken.updateMany({
      where: { token, userId, isRevoked: false },
      data: { isRevoked: true },
    });
    return result.count > 0;
  }

  async consumeActiveToken(token: string, userId: bigint) {
    const session = await this.prisma.refreshToken.findFirst({
      where: {
        token,
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
      },
    });

    if (!session) return null;

    const result = await this.prisma.refreshToken.updateMany({
      where: {
        id: session.id,
        token,
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      data: { isRevoked: true },
    });

    return result.count === 1 ? session : null;
  }

  findActiveWithUser(token: string) {
    return this.prisma.refreshToken.findFirst({
      where: {
        token,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
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
    });
  }

  async revokeAllUserTokens(userId: bigint): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  async getUserSessions(userId: bigint): Promise<
    {
      id: bigint;
      deviceInfo: string | null;
      ipAddress: string | null;
      createdAt: Date;
      expiresAt: Date;
    }[]
  > {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async revokeSession(userId: bigint, sessionId: bigint): Promise<boolean> {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        id: sessionId,
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      data: {
        isRevoked: true,
      },
    });
    return result.count > 0;
  }
}
