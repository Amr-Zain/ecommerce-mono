import { createHash } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Request } from 'express';
import { Prisma, PrismaService } from '@/prisma';
import { CommerceIdentity } from '../interfaces/commerce-identity.interface';
import { AnonymousSessionsRepository } from '../repositories/anonymous-sessions.repository';

const TOKEN_HEADER = 'x-anonymous-session-token';
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class AnonymousSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly anonymousSessionsRepository: AnonymousSessionsRepository,
  ) {}

  async resolveOwner(
    request: Request,
    user?: { id: bigint } | null,
    createIfMissing = false,
  ): Promise<CommerceIdentity> {
    if (user?.id) return { type: 'user', userId: user.id };

    const token = request.header(TOKEN_HEADER);
    if (!token) return { type: 'none' };
    if (!TOKEN_PATTERN.test(token)) {
      throw new UnauthorizedException('Anonymous session token is required');
    }

    const now = new Date();
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
    const existing = await this.anonymousSessionsRepository.findByTokenHash(tokenHash);
    if (!existing && !createIfMissing) return { type: 'none' };
    const session = existing ?? (await this.anonymousSessionsRepository.findOrCreate(tokenHash, expiresAt, now));

    if (session.expiresAt <= now) {
      await this.anonymousSessionsRepository.delete(session.id);
      throw new UnauthorizedException('Anonymous session expired');
    }

    await this.anonymousSessionsRepository.touch(session.id, expiresAt, now);

    return { type: 'anonymous', sessionId: session.id };
  }

  async claim(token: string | undefined, targetUserId: bigint): Promise<void> {
    if (!token || !TOKEN_PATTERN.test(token)) return;

    await this.prisma.$transaction(
      async (tx) => {
        const sessions = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM anonymous_sessions
          WHERE token_hash = ${this.hashToken(token)}
          FOR UPDATE
        `;
        const session = sessions[0];
        if (!session) return;

        await this.mergeCart(tx, session.id, targetUserId);
        await this.mergeWishlist(tx, session.id, targetUserId);
        await tx.anonymousSession.delete({ where: { id: session.id } });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  cleanupExpired() {
    return this.anonymousSessionsRepository.deleteExpired(new Date());
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async mergeCart(tx: Prisma.TransactionClient, anonymousSessionId: string, targetUserId: bigint) {
    const anonymousCart = await tx.cart.findUnique({
      where: { anonymousSessionId },
      include: { items: true },
    });
    if (!anonymousCart) return;

    const targetCart = await tx.cart.findUnique({ where: { userId: targetUserId }, include: { items: true } });
    if (!targetCart) {
      await tx.cart.update({
        where: { id: anonymousCart.id },
        data: { anonymousSessionId: null, userId: targetUserId },
      });
      return;
    }

    const targetItems = new Map(
      targetCart.items.map((item) => [this.cartItemKey(item.productId, item.variantId), item]),
    );
    for (const item of anonymousCart.items) {
      const existing = targetItems.get(this.cartItemKey(item.productId, item.variantId));
      if (existing) {
        await tx.cartItem.update({ where: { id: existing.id }, data: { quantity: { increment: item.quantity } } });
        await tx.cartItem.delete({ where: { id: item.id } });
      } else {
        await tx.cartItem.update({ where: { id: item.id }, data: { cartId: targetCart.id } });
      }
    }
    await tx.cart.delete({ where: { id: anonymousCart.id } });
  }

  private async mergeWishlist(tx: Prisma.TransactionClient, anonymousSessionId: string, targetUserId: bigint) {
    const anonymousItems = await tx.wishlistItem.findMany({ where: { anonymousSessionId } });
    if (!anonymousItems.length) return;

    const targetItems = await tx.wishlistItem.findMany({
      where: { userId: targetUserId },
      select: { productId: true },
    });
    const targetProductIds = new Set(targetItems.map((item) => item.productId.toString()));
    await tx.wishlistItem.deleteMany({
      where: {
        anonymousSessionId,
        productId: {
          in: anonymousItems
            .filter((item) => targetProductIds.has(item.productId.toString()))
            .map((item) => item.productId),
        },
      },
    });
    await tx.wishlistItem.updateMany({
      where: { anonymousSessionId },
      data: { anonymousSessionId: null, userId: targetUserId },
    });
  }

  private cartItemKey(productId: bigint, variantId: bigint | null) {
    return `${productId}:${variantId ?? 'none'}`;
  }
}
