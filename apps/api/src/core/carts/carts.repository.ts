import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma';
import { BaseRepository } from '@/common/repositories/base.repository';
import { Cart, CartItem, ICartsRepository } from '@/common/interfaces/carts.interface';
import { MediaService } from '@/media/media.service';
import { CommerceIdentity } from '@/auth/interfaces/commerce-identity.interface';

@Injectable()
export class CartsRepository extends BaseRepository<Cart> implements ICartsRepository {
  constructor(prisma: PrismaService, mediaService: MediaService) {
    super(prisma, undefined);
  }

  protected getModel() {
    return this.prisma.cart;
  }

  async findByOwner(identity: CommerceIdentity): Promise<Cart | null> {
    if (identity.type === 'none') return null;
    const record = await this.prisma.cart.findUnique({
      where: identity.type === 'user' ? { userId: identity.userId } : { anonymousSessionId: identity.sessionId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
          include: {
            product: {
              include: {
                translations: true,
                variants: {
                  where: { isActive: true },
                  orderBy: [{ isDefault: 'desc' }, { price: 'asc' }, { id: 'asc' }],
                  include: {
                    attributes: {
                      include: {
                        attribute: {
                          include: {
                            translations: true,
                          },
                        },
                        value: {
                          include: {
                            translations: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            variant: {
              include: {
                attributes: {
                  include: {
                    attribute: {
                      include: {
                        translations: true,
                      },
                    },
                    value: {
                      include: {
                        translations: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    return record;
  }

  async findOrCreateByOwner(identity: CommerceIdentity): Promise<Cart> {
    if (identity.type === 'none') {
      throw new Error('Cannot create a cart without a commerce identity');
    }
    let cart = await this.findByOwner(identity);
    if (!cart) {
      await this.prisma.cart.create({
        data: identity.type === 'user' ? { userId: identity.userId } : { anonymousSessionId: identity.sessionId },
      });
      cart = await this.findByOwner(identity);
    }
    return cart!;
  }

  async addItem(cartId: bigint, productId: bigint, variantId: bigint | null, quantity: number): Promise<CartItem> {
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId,
          productId,
          variantId: variantId as bigint,
        },
      },
    });

    if (existingItem) {
      const updatedItem = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      return updatedItem;
    }

    const newItem = await this.prisma.cartItem.create({
      data: {
        cartId,
        productId,
        variantId: variantId ?? null,
        quantity,
      },
    });
    return newItem;
  }

  async updateItemQuantity(cartItemId: bigint, quantity: number): Promise<CartItem> {
    const updated = await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
    return updated;
  }

  async updateItem(cartItemId: bigint, data: { quantity?: number; variantId?: bigint }): Promise<CartItem> {
    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data,
    });
  }

  async removeItem(cartItemId: bigint): Promise<CartItem> {
    const deleted = await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });
    return deleted;
  }

  async clearCart(cartId: bigint): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}
