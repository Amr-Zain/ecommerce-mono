import { Injectable } from '@nestjs/common';
import { CommerceIdentity } from '@/auth/interfaces/commerce-identity.interface';
import { PrismaService } from '@/prisma';

type PersistedCommerceIdentity = Exclude<CommerceIdentity, { type: 'none' }>;

@Injectable()
export class ClientWishlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(identity: PersistedCommerceIdentity, langId: string) {
    return this.prisma.wishlistItem.findMany({
      where: this.whereForIdentity(identity),
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            translations: {
              where: { langId },
              take: 1,
            },
            variants: {
              select: {
                id: true,
                price: true,
                compareAtPrice: true,
                stockQuantity: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
  }

  findProduct(identity: PersistedCommerceIdentity, productId: bigint) {
    return this.prisma.wishlistItem.findFirst({
      where: { ...this.whereForIdentity(identity), productId },
      select: { id: true },
    });
  }

  findProductState(productId: bigint) {
    return this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    });
  }

  create(identity: PersistedCommerceIdentity, productId: bigint) {
    return this.prisma.wishlistItem.create({
      data: { ...this.whereForIdentity(identity), productId },
    });
  }

  delete(id: bigint) {
    return this.prisma.wishlistItem.delete({ where: { id } });
  }

  private whereForIdentity(identity: PersistedCommerceIdentity) {
    return identity.type === 'user' ? { userId: identity.userId } : { anonymousSessionId: identity.sessionId };
  }
}
