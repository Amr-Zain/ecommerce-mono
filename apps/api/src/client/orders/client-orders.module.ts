import { Module } from '@nestjs/common';
import { ClientOrdersController } from './client-orders.controller';
import { ClientOrdersService } from './client-orders.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { PaymentModule } from '@/shared/payment/payment.module';

@Module({
  imports: [PrismaModule, PaymentModule],
  controllers: [ClientOrdersController],
  providers: [ClientOrdersService],
})
export class ClientOrdersModule {}
