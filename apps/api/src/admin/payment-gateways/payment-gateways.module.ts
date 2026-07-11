import { Module } from '@nestjs/common';
import { PaymentModule } from '@/shared/payment/payment.module';
import { PaymentGatewaysController } from './payment-gateways.controller';
import { PaymentSessionsController } from './payment-sessions.controller';

@Module({
  imports: [PaymentModule],
  controllers: [PaymentGatewaysController, PaymentSessionsController],
})
export class AdminPaymentGatewaysModule {}
