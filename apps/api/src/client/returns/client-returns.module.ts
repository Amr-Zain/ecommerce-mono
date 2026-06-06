import { Module } from '@nestjs/common';
import { ProductsModule as CoreProductsModule } from '@/core/products/products.module';
import { ClientReturnsController } from './client-returns.controller';
import { ClientReturnsService } from './client-returns.service';
import { ReturnsModule } from '@/core/returns/returns.module';
import { OrdersModule } from '@/core/orders/orders.module';

@Module({
  imports: [CoreProductsModule, ReturnsModule, OrdersModule],
  controllers: [ClientReturnsController],
  providers: [ClientReturnsService],
})
export class ClientReturnsModule {}
