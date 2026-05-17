import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { VariantsService } from './variants.service';
import { VariantsController } from './variants.controller';
import { VariantsRepository } from './variants.repository';

@Module({
  controllers: [ProductsController, VariantsController],
  providers: [ProductsService, ProductsRepository, VariantsService, VariantsRepository],
  exports: [ProductsService, VariantsService],
})
export class ProductsModule {}
