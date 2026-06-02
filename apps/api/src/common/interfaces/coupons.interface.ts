import { IBaseRepository } from './base.repository.interface';
import { Coupon as PrismaCoupon } from '@prisma/client';

export type Coupon = PrismaCoupon;

export const COUPONS_REPOSITORY = 'COUPONS_REPOSITORY';

export interface ICouponsRepository extends IBaseRepository<Coupon> {
  findByCode(code: string): Promise<Coupon | null>;
  findActiveByCode(code: string): Promise<Coupon | null>;
  findByCodeExceptId(code: string, excludeId: bigint): Promise<Coupon | null>;
}
