import { Module } from '@nestjs/common';
import { AdminCouponsController } from './admin-coupons.controller';
import { AdminCouponsService } from './admin-coupons.service';
import { CouponsModule } from '@/core/coupons/coupons.module';

@Module({
  imports: [CouponsModule],
  controllers: [AdminCouponsController],
  providers: [AdminCouponsService],
})
export class AdminCouponsModule {}
