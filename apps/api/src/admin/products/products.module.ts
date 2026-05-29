import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { VariantsService } from './variants.service';
import { VariantsController } from './variants.controller';
import { ProductsModule as CoreProductsModule } from '@/core/products/products.module';

@Module({
  imports: [CoreProductsModule],
  controllers: [ProductsController, VariantsController],
  providers: [ProductsService, VariantsService],
  exports: [ProductsService, VariantsService],
})
export class ProductsModule {}
