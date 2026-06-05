import { Module } from '@nestjs/common';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { PaymentModule } from '@/shared/payment/payment.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { OrderLifecycleModule } from '@/shared/orders/order-lifecycle.module';
import { OrdersModule } from '@/core/orders/orders.module';

@Module({
  imports: [
    PrismaModule,
    PaymentModule,
    OrderLifecycleModule,
    OrdersModule,
  ],
  controllers: [AdminOrdersController],
  providers: [AdminOrdersService],
})
export class AdminOrdersModule {}
