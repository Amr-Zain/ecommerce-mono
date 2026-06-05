import { Module } from '@nestjs/common';
import { ProductsModule as CoreProductsModule } from '@/core/products/products.module';
import { ClientReturnsController } from './client-returns.controller';
import { ClientReturnsService } from './client-returns.service';

@Module({
  imports: [CoreProductsModule],
  controllers: [ClientReturnsController],
  providers: [ClientReturnsService],
})
export class ClientReturnsModule {}
