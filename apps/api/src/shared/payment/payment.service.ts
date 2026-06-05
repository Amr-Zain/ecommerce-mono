import { Injectable, BadRequestException } from '@nestjs/common';
import {
  PaymentStrategy,
  PaymentInitResult,
  PaymentVerifyResult,
  PaymentRefundResult,
  PaymentInitiateOptions,
  PaymentCancelResult,
  PaymentGatewayData,
  PaymentRefundOptions,
} from './interfaces/payment.interfaces';
import { CodStrategy } from './strategies/cod.strategy';
import { BankTransferStrategy } from './strategies/bank-transfer.strategy';
import { StripeCheckoutStrategy } from './strategies/stripe-checkout.strategy';
import { StripeIntentStrategy } from './strategies/stripe-intent.strategy';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';

@Injectable()
export class PaymentService {
  private readonly strategies: Map<string, PaymentStrategy> = new Map();

  constructor(
    private readonly codStrategy: CodStrategy,
    private readonly bankTransferStrategy: BankTransferStrategy,
    private readonly stripeCheckoutStrategy: StripeCheckoutStrategy,
    private readonly stripeIntentStrategy: StripeIntentStrategy,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {
    this.registerStrategy(this.codStrategy);
    this.registerStrategy(this.bankTransferStrategy);
    this.registerStrategy(this.stripeCheckoutStrategy);
    this.registerStrategy(this.stripeIntentStrategy);
  }

  registerStrategy(strategy: PaymentStrategy) {
    this.strategies.set(strategy.methodName.toLowerCase(), strategy);
  }

  getStrategy(method: string): PaymentStrategy {
    const strategy = this.strategies.get(method.toLowerCase());
    if (!strategy) {
      throw new BadRequestException(this.i18n.t('errors.unsupported_payment_method', { args: { method } }));
    }
    return strategy;
  }

  async initiatePayment(
    method: string,
    referenceId: string,
    amount: number,
    options?: PaymentInitiateOptions,
  ): Promise<PaymentInitResult> {
    const strategy = this.getStrategy(method);
    return strategy.initiate(referenceId, amount, options);
  }

  async verifyPayment(
    method: string,
    transactionRef: string,
    gatewayData: PaymentGatewayData,
  ): Promise<PaymentVerifyResult> {
    const strategy = this.getStrategy(method);
    return strategy.verify(transactionRef, gatewayData);
  }

  async refundPayment(
    method: string,
    transactionRef: string,
    amount: number,
    options?: PaymentRefundOptions,
  ): Promise<PaymentRefundResult> {
    const strategy = this.getStrategy(method);
    return strategy.refund(transactionRef, amount, options);
  }

  async cancelPayment(method: string, transactionRef: string): Promise<PaymentCancelResult> {
    const strategy = this.getStrategy(method);
    return strategy.cancel(transactionRef);
  }
}
