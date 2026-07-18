import { Module } from '@nestjs/common';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminOrdersRepository } from './admin-orders.repository';
import { PaymentModule } from '@/shared/payment/payment.module';
import { OrderLifecycleModule } from '@/shared/orders/order-lifecycle.module';
import { OrdersModule } from '@/core/orders/orders.module';

@Module({
  imports: [PaymentModule, OrderLifecycleModule, OrdersModule],
  controllers: [AdminOrdersController],
  providers: [AdminOrdersService, AdminOrdersRepository],
})
export class AdminOrdersModule {}
