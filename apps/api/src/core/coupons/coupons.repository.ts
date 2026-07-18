import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { BaseRepository } from '@/common/repositories/base.repository';
import { Coupon, ICouponsRepository } from '@/common/interfaces/coupons.interface';
import { MediaService } from '@/media/media.service';

@Injectable()
export class CouponsRepository extends BaseRepository<Coupon> implements ICouponsRepository {
  constructor(prisma: PrismaService, mediaService: MediaService) {
    super(prisma, undefined);
  }

  protected getModel() {
    return this.prisma.coupon;
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return this.prisma.coupon.findUnique({
      where: { code },
    });
  }

  async findActiveByCode(code: string): Promise<Coupon | null> {
    return this.prisma.coupon.findFirst({
      where: { code, isActive: true },
    });
  }

  async findByCodeExceptId(code: string, excludeId: bigint): Promise<Coupon | null> {
    return this.prisma.coupon.findFirst({
      where: { code, id: { not: excludeId } },
    });
  }
}
