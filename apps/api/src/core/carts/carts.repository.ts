import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma';
import { BaseRepository } from '@/common/repositories/base.repository';
import { Cart, CartItem, ICartsRepository } from '@/common/interfaces/carts.interface';
import { MediaService } from '@/media/media.service';

@Injectable()
export class CartsRepository extends BaseRepository<Cart> implements ICartsRepository {
  constructor(prisma: PrismaService, mediaService: MediaService) {
    super(prisma, mediaService, undefined);
  }

  protected getModel() {
    return this.prisma.cart;
  }

  async findByUserId(userId: bigint): Promise<Cart | null> {
    const record = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                translations: true,
                variants: {
                  where: { isActive: true },
                  take: 1,
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

  async findOrCreateByUserId(userId: bigint): Promise<Cart> {
    let cart = await this.findByUserId(userId);
    if (!cart) {
      const newCart = await this.prisma.cart.create({
        data: { userId },
      });
      cart = await this.findByUserId(newCart.userId);
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
