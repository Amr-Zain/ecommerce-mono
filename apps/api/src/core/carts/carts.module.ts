import { Module } from '@nestjs/common';
import { CARTS_REPOSITORY } from '@/common/interfaces/carts.interface';
import { CartsRepository } from './carts.repository';
import { MediaModule } from '@/media/media.module';

@Module({
  imports: [MediaModule],
  providers: [
    {
      provide: CARTS_REPOSITORY,
      useClass: CartsRepository,
    },
  ],
  exports: [CARTS_REPOSITORY],
})
export class CartsModule {}
