import { Module } from '@nestjs/common';
import { PaymentModule } from '@/shared/payment/payment.module';
import { AdminReturnsController } from './admin-returns.controller';
import { AdminReturnsService } from './admin-returns.service';
import { OrderLifecycleModule } from '@/shared/orders/order-lifecycle.module';
import { ReturnsModule } from '@/core/returns/returns.module';
import { ProductsModule } from '@/core/products/products.module';

@Module({
  imports: [PaymentModule, OrderLifecycleModule, ReturnsModule, ProductsModule],
  controllers: [AdminReturnsController],
  providers: [AdminReturnsService],
})
export class AdminReturnsModule {}
