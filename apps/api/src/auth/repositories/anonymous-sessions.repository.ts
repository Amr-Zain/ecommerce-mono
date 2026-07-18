import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnonymousSessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByTokenHash(tokenHash: string) {
    return this.prisma.anonymousSession.findUnique({ where: { tokenHash } });
  }

  findOrCreate(tokenHash: string, expiresAt: Date, lastActiveAt: Date) {
    return this.prisma.anonymousSession.upsert({
      where: { tokenHash },
      create: { tokenHash, expiresAt, lastActiveAt },
      update: {},
    });
  }

  touch(id: string, expiresAt: Date, lastActiveAt: Date) {
    return this.prisma.anonymousSession.update({
      where: { id },
      data: { expiresAt, lastActiveAt },
    });
  }

  delete(id: string) {
    return this.prisma.anonymousSession.delete({ where: { id } });
  }

  deleteExpired(now: Date) {
    return this.prisma.anonymousSession.deleteMany({ where: { expiresAt: { lt: now } } });
  }

  async claimToUser(tokenHash: string, targetUserId: bigint): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        const sessions = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM anonymous_sessions WHERE token_hash = ${tokenHash} FOR UPDATE
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

  private async mergeCart(tx: Prisma.TransactionClient, anonymousSessionId: string, targetUserId: bigint) {
    const anonymousCart = await tx.cart.findUnique({ where: { anonymousSessionId }, include: { items: true } });
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
      targetCart.items.map((item) => [`${item.productId}:${item.variantId ?? 'none'}`, item]),
    );
    for (const item of anonymousCart.items) {
      const existing = targetItems.get(`${item.productId}:${item.variantId ?? 'none'}`);
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
}
