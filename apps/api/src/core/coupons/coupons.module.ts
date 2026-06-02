import { Module } from '@nestjs/common';
import { COUPONS_REPOSITORY } from '@/common/interfaces/coupons.interface';
import { CouponsRepository } from './coupons.repository';
import { PrismaModule } from '@/prisma/prisma.module';
import { MediaModule } from '@/media/media.module';

@Module({
  imports: [PrismaModule, MediaModule],
  providers: [
    {
      provide: COUPONS_REPOSITORY,
      useClass: CouponsRepository,
    },
  ],
  exports: [COUPONS_REPOSITORY],
})
export class CouponsModule {}
