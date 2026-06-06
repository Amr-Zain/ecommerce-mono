import { Module } from '@nestjs/common';
import { PaymentModule } from '@/shared/payment/payment.module';
import { OrderLifecycleService } from './order-lifecycle.service';
import { OrdersModule } from '@/core/orders/orders.module';
import { ProductsModule } from '@/core/products/products.module';

@Module({
  imports: [PaymentModule, OrdersModule, ProductsModule],
  providers: [OrderLifecycleService],
  exports: [OrderLifecycleService],
})
export class OrderLifecycleModule {}
