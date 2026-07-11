import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CodStrategy } from './strategies/cod.strategy';
import { BankTransferStrategy } from './strategies/bank-transfer.strategy';
import { StripeCheckoutStrategy } from './strategies/stripe-checkout.strategy';
import { StripeIntentStrategy } from './strategies/stripe-intent.strategy';
import { TapStrategy } from './strategies/tap.strategy';
import { MoyasarStrategy } from './strategies/moyasar.strategy';
import { TabbyStrategy } from './strategies/tabby.strategy';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeWebhookService } from './stripe-webhook.service';
import { PaymentWebhookController } from './payment-webhook.controller';
import { PaymentReservationCleanupService } from './payment-reservation-cleanup.service';
import { PAYMENT_TRANSACTIONS_REPOSITORY } from '@/common/interfaces';
import { PaymentTransactionsRepository } from './repositories/payment-transactions.repository';
import { LoyaltyModule } from '@/shared/loyalty/loyalty.module';
import { PaymentGatewayService } from './payment-gateway.service';
import { PaymentSecretService } from './payment-secret.service';

@Module({
  imports: [LoyaltyModule],
  controllers: [StripeWebhookController, PaymentWebhookController],
  providers: [
    PaymentGatewayService,
    PaymentSecretService,
    PaymentService,
    CodStrategy,
    BankTransferStrategy,
    StripeCheckoutStrategy,
    StripeIntentStrategy,
    TapStrategy,
    MoyasarStrategy,
    TabbyStrategy,
    StripeWebhookService,
    PaymentReservationCleanupService,
    {
      provide: PAYMENT_TRANSACTIONS_REPOSITORY,
      useClass: PaymentTransactionsRepository,
    },
  ],
  exports: [PaymentService, PaymentGatewayService, StripeWebhookService, PAYMENT_TRANSACTIONS_REPOSITORY],
})
export class PaymentModule {}
