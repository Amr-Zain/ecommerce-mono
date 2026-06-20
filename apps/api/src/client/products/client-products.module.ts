import { Module } from '@nestjs/common';
import { ClientProductsController } from './client-products.controller';
import { ClientProductsService } from './client-products.service';
import { ProductsModule as CoreProductsModule } from '@/core/products/products.module';

@Module({
  imports: [CoreProductsModule],
  controllers: [ClientProductsController],
  providers: [ClientProductsService],
})
export class ClientProductsModule {}
