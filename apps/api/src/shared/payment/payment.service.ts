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
import { TapStrategy } from './strategies/tap.strategy';
import { MoyasarStrategy } from './strategies/moyasar.strategy';
import { TabbyStrategy } from './strategies/tabby.strategy';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { PaymentGatewayService, RuntimePaymentGateway } from './payment-gateway.service';
import { PAYMENT_METHODS, PAYMENT_PROVIDERS, PAYMENT_STATUSES } from './payment.constants';

@Injectable()
export class PaymentService {
  private readonly strategies: Map<string, PaymentStrategy> = new Map();

  constructor(
    private readonly codStrategy: CodStrategy,
    private readonly bankTransferStrategy: BankTransferStrategy,
    private readonly stripeCheckoutStrategy: StripeCheckoutStrategy,
    private readonly stripeIntentStrategy: StripeIntentStrategy,
    private readonly tapStrategy: TapStrategy,
    private readonly moyasarStrategy: MoyasarStrategy,
    private readonly tabbyStrategy: TabbyStrategy,
    private readonly paymentGateways: PaymentGatewayService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {
    this.registerStrategy(this.codStrategy);
    this.registerStrategy(this.bankTransferStrategy);
    this.registerStrategy(this.stripeCheckoutStrategy);
    this.registerStrategy(this.stripeIntentStrategy);
    this.registerStrategy(this.tapStrategy);
    this.registerStrategy(this.moyasarStrategy);
    this.registerStrategy(this.tabbyStrategy);
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
    const gateway = await this.paymentGateways.resolveGatewayForPayment(method, options);
    const strategy = this.getStrategy(this.strategyKey(method, gateway));
    const result = await strategy.initiate(referenceId, amount, {
      ...options,
      paymentMethod: method,
      providerIdentifier: gateway?.identifier || options?.providerIdentifier,
    });
    await this.paymentGateways.recordInitiation({
      gateway,
      method,
      amount,
      currency: options?.currency,
      result,
      options,
    });
    return result;
  }

  async assertPaymentMethodAvailable(method: string, options?: PaymentInitiateOptions) {
    this.getStrategy(this.strategyKey(method, await this.paymentGateways.resolveGatewayForPayment(method, options)));
  }

  async verifyPayment(
    method: string,
    transactionRef: string,
    gatewayData: PaymentGatewayData,
  ): Promise<PaymentVerifyResult> {
    const session = await this.paymentGateways.findSessionByTransactionRef(transactionRef);
    const providerIdentifier =
      this.toText(gatewayData.providerIdentifier) || this.toText(session?.providerIdentifier) || '';
    const gateway = providerIdentifier ? await this.paymentGateways.getRuntimeGateway(providerIdentifier) : null;
    const strategy = this.getStrategy(this.strategyKey(method, gateway));
    const result = await strategy.verify(transactionRef, { ...gatewayData, providerIdentifier: gateway?.identifier });
    await this.paymentGateways.updateSessionStatus(transactionRef, result.status, result.gatewayResponse);
    return result;
  }

  async refundPayment(
    method: string,
    transactionRef: string,
    amount: number,
    options?: PaymentRefundOptions,
  ): Promise<PaymentRefundResult> {
    const session = await this.paymentGateways.findSessionByTransactionRef(transactionRef);
    const providerIdentifier = options?.providerIdentifier || session?.providerIdentifier;
    const gateway = providerIdentifier ? await this.paymentGateways.getRuntimeGateway(providerIdentifier) : null;
    const strategy = this.getStrategy(this.strategyKey(method, gateway));
    const result = await strategy.refund(transactionRef, amount, {
      ...options,
      providerIdentifier: gateway?.identifier,
    });
    if (result.status === PAYMENT_STATUSES.refunded) {
      await this.paymentGateways.updateSessionStatus(transactionRef, result.status, result.gatewayResponse);
    }
    return result;
  }

  async cancelPayment(method: string, transactionRef: string): Promise<PaymentCancelResult> {
    const session = await this.paymentGateways.findSessionByTransactionRef(transactionRef);
    const gateway = session?.providerIdentifier
      ? await this.paymentGateways.getRuntimeGateway(session.providerIdentifier)
      : null;
    const strategy = this.getStrategy(this.strategyKey(method, gateway));
    const result = await strategy.cancel(transactionRef);
    await this.paymentGateways.updateSessionStatus(transactionRef, result.status, result.gatewayResponse);
    return result;
  }

  private strategyKey(method: string, gateway?: RuntimePaymentGateway | null) {
    if (method === PAYMENT_METHODS.card && gateway?.provider === PAYMENT_PROVIDERS.stripe)
      return PAYMENT_METHODS.stripeCheckout;
    if (method === PAYMENT_METHODS.card && gateway?.provider === PAYMENT_PROVIDERS.tap)
      return PAYMENT_METHODS.tapCheckout;
    if (method === PAYMENT_METHODS.card && gateway?.provider === PAYMENT_PROVIDERS.moyasar)
      return PAYMENT_METHODS.moyasar;
    if (method === PAYMENT_METHODS.applePay && gateway?.provider === PAYMENT_PROVIDERS.tap)
      return PAYMENT_METHODS.tapCheckout;
    if (method === PAYMENT_METHODS.applePay && gateway?.provider === PAYMENT_PROVIDERS.moyasar)
      return PAYMENT_METHODS.moyasar;
    if (method === PAYMENT_METHODS.tabby) return PAYMENT_METHODS.tabby;
    return method;
  }

  private toText(value: unknown) {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : '';
  }
}
