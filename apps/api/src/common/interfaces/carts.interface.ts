import { IBaseRepository } from './base.repository.interface';
import { CommerceIdentity } from '@/auth/interfaces/commerce-identity.interface';

export interface CartItem {
  id: bigint;
  cartId: bigint;
  productId: bigint;
  variantId: bigint | null;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: bigint;
  userId: bigint | null;
  anonymousSessionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: CartItem[];
}

export const CARTS_REPOSITORY = Symbol('ICartsRepository');

export interface ICartsRepository extends IBaseRepository<Cart> {
  findByOwner(identity: CommerceIdentity): Promise<Cart | null>;
  findOrCreateByOwner(identity: CommerceIdentity): Promise<Cart>;
  addItem(cartId: bigint, productId: bigint, variantId: bigint | null, quantity: number): Promise<CartItem>;
  updateItemQuantity(cartItemId: bigint, quantity: number): Promise<CartItem>;
  removeItem(cartItemId: bigint): Promise<CartItem>;
  clearCart(cartId: bigint): Promise<void>;
}
