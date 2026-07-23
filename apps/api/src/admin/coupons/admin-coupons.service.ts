import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { COUPONS_REPOSITORY, Coupon, ICouponsRepository } from '@/common/interfaces/coupons.interface';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class AdminCouponsService {
  constructor(@Inject(COUPONS_REPOSITORY) private readonly couponsRepo: ICouponsRepository) {}

  async findAll(query: AdvancedQueryDto) {
    const result = await this.couponsRepo.findAll(query);

    if (Array.isArray(result)) {
      return result.map((coupon) => this.formatCoupon(coupon));
    }

    return {
      data: result.data.map((coupon) => this.formatCoupon(coupon)),
      meta: result.meta,
    };
  }

  async findOne(id: bigint) {
    const coupon = await this.couponsRepo.findById(id);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return this.formatCoupon(coupon);
  }

  async create(dto: CreateCouponDto) {
    const existing = await this.couponsRepo.findByCode(dto.code);
    if (existing) {
      throw new ConflictException('Coupon code already exists');
    }

    const data = {
      code: dto.code,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      minOrderAmount: dto.minOrderAmount ?? null,
      maxDiscount: dto.maxDiscount ?? null,
      usageLimit: dto.usageLimit ?? null,
      perUserLimit: dto.perUserLimit ?? 1,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      isActive: dto.isActive ?? true,
    };

    const coupon = await this.couponsRepo.create(data);
    return this.formatCoupon(coupon);
  }

  async update(id: bigint, dto: UpdateCouponDto) {
    await this.findOne(id);

    if (dto.code) {
      const existing = await this.couponsRepo.findByCodeExceptId(dto.code, id);
      if (existing) {
        throw new ConflictException('Coupon code already exists');
      }
    }

    const data: Record<string, unknown> = { ...dto };
    if (data.startsAt !== undefined) data.startsAt = data.startsAt ? new Date(String(data.startsAt)) : null;
    if (data.expiresAt !== undefined) data.expiresAt = data.expiresAt ? new Date(String(data.expiresAt)) : null;

    const coupon = await this.couponsRepo.update(id, data as Partial<Coupon>);
    return this.formatCoupon(coupon);
  }

  async remove(id: bigint) {
    await this.findOne(id);
    await this.couponsRepo.delete(id);
    return { message: 'Coupon deleted successfully' };
  }

  private formatCoupon(coupon: Coupon) {
    return {
      id: coupon.id.toString(),
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usageCount,
      perUserLimit: coupon.perUserLimit,
      startsAt: coupon.startsAt,
      expiresAt: coupon.expiresAt,
      isActive: coupon.isActive,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    };
  }
}
