import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CodStrategy } from './strategies/cod.strategy';
import { BankTransferStrategy } from './strategies/bank-transfer.strategy';
import { StripeCheckoutStrategy } from './strategies/stripe-checkout.strategy';
import { StripeIntentStrategy } from './strategies/stripe-intent.strategy';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeWebhookService } from './stripe-webhook.service';
import { PaymentReservationCleanupService } from './payment-reservation-cleanup.service';
import { PAYMENT_TRANSACTIONS_REPOSITORY } from '@/common/interfaces';
import { PaymentTransactionsRepository } from './repositories/payment-transactions.repository';
import { LoyaltyModule } from '@/shared/loyalty/loyalty.module';

@Module({
  imports: [LoyaltyModule],
  controllers: [StripeWebhookController],
  providers: [
    PaymentService,
    CodStrategy,
    BankTransferStrategy,
    StripeCheckoutStrategy,
    StripeIntentStrategy,
    StripeWebhookService,
    PaymentReservationCleanupService,
    {
      provide: PAYMENT_TRANSACTIONS_REPOSITORY,
      useClass: PaymentTransactionsRepository,
    },
  ],
  exports: [PaymentService, StripeWebhookService, PAYMENT_TRANSACTIONS_REPOSITORY],
})
export class PaymentModule {}
