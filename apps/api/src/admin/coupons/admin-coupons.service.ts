import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { COUPONS_REPOSITORY, ICouponsRepository } from '@/common/interfaces/coupons.interface';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';

@Injectable()
export class AdminCouponsService {
  constructor(@Inject(COUPONS_REPOSITORY) private readonly couponsRepo: ICouponsRepository) {}

  async findAll() {
    const coupons = await this.couponsRepo.findMany();
    // Sort in memory or rely on default, or we can use advanced query.
    return coupons.map((c: any) => this.formatCoupon(c));
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

    const data: any = { ...dto };
    if (data.startsAt !== undefined) data.startsAt = data.startsAt ? new Date(data.startsAt) : null;
    if (data.expiresAt !== undefined) data.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    const coupon = await this.couponsRepo.update(id, data);
    return this.formatCoupon(coupon);
  }

  async remove(id: bigint) {
    await this.findOne(id);
    await this.couponsRepo.delete(id);
    return { message: 'Coupon deleted successfully' };
  }

  private formatCoupon(coupon: any) {
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
