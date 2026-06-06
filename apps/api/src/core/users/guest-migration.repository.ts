import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '@/prisma';
import { AUTH_SECURITY } from '@/common/constants/auth.constants';
import { PRISMA_ERROR_CODES } from '@/common/constants/prisma.constants';
import { GuestMigrationResult } from '@/common/interfaces';

type LockedUser = {
  id: bigint;
  guestToken: string | null;
};

@Injectable()
export class GuestMigrationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async migrateGuestData(guestToken: string, targetUserId: bigint): Promise<GuestMigrationResult> {
    for (let attempt = 1; attempt <= AUTH_SECURITY.guestMigrationMaxRetries; attempt++) {
      try {
        return await this.migrateGuestDataOnce(guestToken, targetUserId);
      } catch (error) {
        if (!this.isRetryableTransactionConflict(error) || attempt === AUTH_SECURITY.guestMigrationMaxRetries) {
          throw error;
        }
        // Wait before retrying (exponential backoff with jitter)
        const delay = Math.min(100 * Math.pow(2, attempt) + Math.random() * 50, 1000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error('Unreachable: guest migration retry loop exhausted without returning or throwing');
  }

  private migrateGuestDataOnce(guestToken: string, targetUserId: bigint): Promise<GuestMigrationResult> {
    return this.prisma.$transaction(
      async (tx) => {
        const guestUser = await this.lockUsersAndFindGuest(tx, guestToken, targetUserId);
        if (!guestUser || guestUser.id === targetUserId) {
          return null;
        }

        await this.migrateGuestOwnedRelations(tx, guestUser.id, targetUserId);
        await this.mergeGuestReviews(tx, guestUser.id, targetUserId);
        await this.mergeGuestCart(tx, guestUser.id, targetUserId);
        await this.mergeGuestWishlist(tx, guestUser.id, targetUserId);
        await tx.user.delete({ where: { id: guestUser.id } });

        return { guestUserId: guestUser.id, targetUserId };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: AUTH_SECURITY.guestMigrationMaxWaitMs,
        timeout: AUTH_SECURITY.guestMigrationTimeoutMs,
      },
    );
  }

  private isRetryableTransactionConflict(error: unknown): boolean {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return false;
    }

    return (error as { code?: unknown }).code === PRISMA_ERROR_CODES.transactionConflict;
  }

  private async lockUsersAndFindGuest(
    tx: Prisma.TransactionClient,
    guestToken: string,
    targetUserId: bigint,
  ): Promise<LockedUser | null> {
    const users = await tx.$queryRaw<LockedUser[]>`
      SELECT id, guest_token AS "guestToken"
      FROM users
      WHERE id = ${targetUserId} OR guest_token = ${guestToken}
      ORDER BY id
      FOR UPDATE
    `;

    return users.find((user) => user.guestToken === guestToken) ?? null;
  }

  private async migrateGuestOwnedRelations(tx: Prisma.TransactionClient, guestUserId: bigint, targetUserId: bigint) {
    await tx.address.updateMany({
      where: { userId: guestUserId },
      data: { userId: targetUserId },
    });
    await tx.order.updateMany({
      where: { userId: guestUserId },
      data: { userId: targetUserId },
    });
  }

  private async mergeGuestReviews(tx: Prisma.TransactionClient, guestUserId: bigint, targetUserId: bigint) {
    await tx.$queryRaw`
      SELECT id
      FROM reviews
      WHERE user_id IN (${guestUserId}, ${targetUserId})
      ORDER BY id
      FOR UPDATE
    `;

    const guestReviews = await tx.review.findMany({
      where: { userId: guestUserId },
      select: { productId: true },
    });
    const targetReviews = await tx.review.findMany({
      where: { userId: targetUserId },
      select: { productId: true },
    });
    if (guestReviews.length === 0) {
      return;
    }

    const targetProductIds = new Set(targetReviews.map((review) => review.productId.toString()));
    const duplicateProductIds = guestReviews
      .filter((review) => targetProductIds.has(review.productId.toString()))
      .map((review) => review.productId);

    if (duplicateProductIds.length > 0) {
      await tx.review.deleteMany({
        where: {
          userId: guestUserId,
          productId: { in: duplicateProductIds },
        },
      });
    }

    await tx.review.updateMany({
      where: { userId: guestUserId },
      data: { userId: targetUserId },
    });
  }

  private async mergeGuestCart(tx: Prisma.TransactionClient, guestUserId: bigint, targetUserId: bigint) {
    await tx.$queryRaw`
      SELECT id
      FROM carts
      WHERE user_id IN (${guestUserId}, ${targetUserId})
      ORDER BY id
      FOR UPDATE
    `;

    const guestCart = await tx.cart.findUnique({
      where: { userId: guestUserId },
      include: { items: true },
    });
    if (!guestCart) {
      return;
    }

    const targetCart = await tx.cart.findUnique({
      where: { userId: targetUserId },
      include: { items: true },
    });
    if (!targetCart) {
      await tx.cart.update({
        where: { id: guestCart.id },
        data: { userId: targetUserId },
      });
      return;
    }

    const targetItems = new Map(
      targetCart.items.map((item) => [this.cartItemKey(item.productId, item.variantId), item]),
    );

    for (const guestItem of guestCart.items) {
      const key = this.cartItemKey(guestItem.productId, guestItem.variantId);
      const targetItem = targetItems.get(key);

      if (targetItem) {
        await tx.cartItem.update({
          where: { id: targetItem.id },
          data: { quantity: { increment: guestItem.quantity } },
        });
        await tx.cartItem.delete({ where: { id: guestItem.id } });
        continue;
      }

      const movedItem = await tx.cartItem.update({
        where: { id: guestItem.id },
        data: { cartId: targetCart.id },
      });
      targetItems.set(key, movedItem);
    }

    await tx.cart.delete({ where: { id: guestCart.id } });
  }

  private async mergeGuestWishlist(tx: Prisma.TransactionClient, guestUserId: bigint, targetUserId: bigint) {
    await tx.$queryRaw`
      SELECT id
      FROM wishlist_items
      WHERE user_id IN (${guestUserId}, ${targetUserId})
      ORDER BY id
      FOR UPDATE
    `;

    const guestItems = await tx.wishlistItem.findMany({
      where: { userId: guestUserId },
      select: { productId: true },
    });
    const targetItems = await tx.wishlistItem.findMany({
      where: { userId: targetUserId },
      select: { productId: true },
    });
    if (guestItems.length === 0) {
      return;
    }

    const targetProductIds = new Set(targetItems.map((item) => item.productId.toString()));
    const duplicateProductIds = guestItems
      .filter((item) => targetProductIds.has(item.productId.toString()))
      .map((item) => item.productId);

    if (duplicateProductIds.length > 0) {
      await tx.wishlistItem.deleteMany({
        where: {
          userId: guestUserId,
          productId: { in: duplicateProductIds },
        },
      });
    }

    await tx.wishlistItem.updateMany({
      where: { userId: guestUserId },
      data: { userId: targetUserId },
    });
  }

  private cartItemKey(productId: bigint, variantId: bigint | null) {
    return `${productId.toString()}:${variantId?.toString() ?? 'none'}`;
  }
}
