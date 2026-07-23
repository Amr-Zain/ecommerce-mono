import { Module } from '@nestjs/common';
import { COUPONS_REPOSITORY } from '@/common/interfaces/coupons.interface';
import { CouponsRepository } from './coupons.repository';
import { MediaModule } from '@/media/media.module';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [CommonModule, MediaModule],
  providers: [
    {
      provide: COUPONS_REPOSITORY,
      useClass: CouponsRepository,
    },
  ],
  exports: [COUPONS_REPOSITORY],
})
export class CouponsModule {}
