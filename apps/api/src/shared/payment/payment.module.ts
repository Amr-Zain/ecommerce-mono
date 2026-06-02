import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CodStrategy } from './strategies/cod.strategy';
import { BankTransferStrategy } from './strategies/bank-transfer.strategy';
import { StripeCheckoutStrategy } from './strategies/stripe-checkout.strategy';
import { StripeIntentStrategy } from './strategies/stripe-intent.strategy';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeWebhookService } from './stripe-webhook.service';
import { PaymentReservationCleanupService } from './payment-reservation-cleanup.service';

@Module({
  controllers: [StripeWebhookController],
  providers: [
    PaymentService,
    CodStrategy,
    BankTransferStrategy,
    StripeCheckoutStrategy,
    StripeIntentStrategy,
    StripeWebhookService,
    PaymentReservationCleanupService,
  ],
  exports: [PaymentService, StripeWebhookService],
})
export class PaymentModule {}
