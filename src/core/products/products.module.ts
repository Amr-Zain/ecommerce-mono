import { Module } from '@nestjs/common';
import { PRODUCTS_REPOSITORY, VARIANTS_REPOSITORY } from '@/common/interfaces';
import { ProductsRepository } from './products.repository';
import { VariantsRepository } from './variants.repository';
import { MediaModule } from '@/media/media.module';

@Module({
  imports: [MediaModule],
  providers: [
    {
      provide: PRODUCTS_REPOSITORY,
      useClass: ProductsRepository,
    },
    {
      provide: VARIANTS_REPOSITORY,
      useClass: VariantsRepository,
    },
  ],
  exports: [PRODUCTS_REPOSITORY, VARIANTS_REPOSITORY],
})
export class ProductsModule {}