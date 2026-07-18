import { Module } from '@nestjs/common';
import { ClientOrdersController } from './client-orders.controller';
import { ClientOrdersService } from './client-orders.service';
import { PaymentModule } from '@/shared/payment/payment.module';
import { OrderLifecycleModule } from '@/shared/orders/order-lifecycle.module';
import { OrdersModule } from '@/core/orders/orders.module';

@Module({
  imports: [PaymentModule, OrderLifecycleModule, OrdersModule],
  controllers: [ClientOrdersController],
  providers: [ClientOrdersService],
})
export class ClientOrdersModule {}
