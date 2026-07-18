import { IBaseRepository } from './base.repository.interface';
export interface Coupon {
  id: bigint;
  code: string;
  discountType: string;
  discountValue: { toString(): string } | number | string;
  minOrderAmount: { toString(): string } | number | string | null;
  maxDiscount: { toString(): string } | number | string | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  startsAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const COUPONS_REPOSITORY = Symbol('ICouponsRepository');

export interface ICouponsRepository extends IBaseRepository<Coupon> {
  findByCode(code: string): Promise<Coupon | null>;
  findActiveByCode(code: string): Promise<Coupon | null>;
  findByCodeExceptId(code: string, excludeId: bigint): Promise<Coupon | null>;
}
