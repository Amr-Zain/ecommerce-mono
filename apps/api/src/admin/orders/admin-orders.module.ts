import { Module } from '@nestjs/common';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { PaymentModule } from '@/shared/payment/payment.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PaymentModule,
  ],
  controllers: [AdminOrdersController],
  providers: [AdminOrdersService],
})
export class AdminOrdersModule {}
