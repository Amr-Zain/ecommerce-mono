import { Injectable } from '@nestjs/common';
import {
  PaymentStrategy,
  PaymentInitResult,
  PaymentVerifyResult,
  PaymentRefundResult,
  PaymentInitiateOptions,
  PaymentCancelResult,
  PaymentGatewayData,
  PaymentRefundOptions,
} from '../interfaces/payment.interfaces';
import Stripe from 'stripe';
import {
  PAYMENT_GATEWAY_CURRENCIES,
  PAYMENT_METHODS,
  PAYMENT_REFERENCE_PREFIXES,
  PAYMENT_STATUSES,
  STRIPE_CONFIG,
} from '../payment.constants';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { PaymentGatewayService, RuntimePaymentGateway } from '../payment-gateway.service';

@Injectable()
export class StripeIntentStrategy implements PaymentStrategy {
  readonly methodName = PAYMENT_METHODS.stripeIntent;
  readonly providerIdentifier = 'stripe';

  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly paymentGateways: PaymentGatewayService,
  ) {}

  async initiate(referenceId: string, amount: number, options?: PaymentInitiateOptions): Promise<PaymentInitResult> {
    const amountInCents = Math.round(amount * 100);

    try {
      const gateway = await this.getGateway(options?.providerIdentifier);
      const paymentIntent = await this.createStripe(gateway).paymentIntents.create({
        amount: amountInCents,
        currency: PAYMENT_GATEWAY_CURRENCIES.sar,
        metadata: {
          ...options?.metadata,
          checkoutId: referenceId,
        },
      });

      return {
        transactionRef: paymentIntent.id,
        status: PAYMENT_STATUSES.pending,
        clientSecret: paymentIntent.client_secret,
        providerIdentifier: gateway.identifier,
        gatewayResponse: {
          clientSecret: paymentIntent.client_secret,
        },
      };
    } catch (error: unknown) {
      return {
        transactionRef: PAYMENT_REFERENCE_PREFIXES.error,
        status: PAYMENT_STATUSES.pending,
        gatewayResponse: { error: this.getErrorMessage(error) },
      };
    }
  }

  async verify(transactionRef: string, gatewayData: PaymentGatewayData): Promise<PaymentVerifyResult> {
    try {
      const gateway = await this.getGateway(this.text(gatewayData.providerIdentifier));
      const intent = await this.createStripe(gateway).paymentIntents.retrieve(transactionRef);
      if (intent.status === 'succeeded') {
        return {
          status: PAYMENT_STATUSES.completed,
          providerIdentifier: gateway.identifier,
          gatewayResponse: { intent },
        };
      }
      return {
        status: PAYMENT_STATUSES.pending,
        providerIdentifier: gateway.identifier,
        gatewayResponse: { intent },
      };
    } catch (error: unknown) {
      return {
        status: PAYMENT_STATUSES.failed,
        gatewayResponse: { error: this.getErrorMessage(error) },
      };
    }
  }

  async refund(transactionRef: string, amount: number, options?: PaymentRefundOptions): Promise<PaymentRefundResult> {
    try {
      const gateway = await this.getGateway(options?.providerIdentifier);
      const refund = await this.createStripe(gateway).refunds.create(
        {
          payment_intent: transactionRef,
          amount: Math.round(amount * 100),
        },
        options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : undefined,
      );

      return {
        status: PAYMENT_STATUSES.refunded,
        gatewayResponse: { refund },
      };
    } catch (error: unknown) {
      return {
        status: PAYMENT_STATUSES.failed,
        gatewayResponse: { error: this.getErrorMessage(error) },
      };
    }
  }

  async cancel(transactionRef: string): Promise<PaymentCancelResult> {
    try {
      const gateway = await this.getGateway();
      const intent = await this.createStripe(gateway).paymentIntents.cancel(transactionRef);
      return {
        status: PAYMENT_STATUSES.expired,
        gatewayResponse: { intent },
      };
    } catch (error: unknown) {
      return {
        status: PAYMENT_STATUSES.failed,
        gatewayResponse: { error: this.getErrorMessage(error) },
      };
    }
  }

  private getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : this.i18n.t('errors.INTERNAL_SERVER_ERROR');
  }

  private async getGateway(identifier?: string) {
    if (identifier) return this.paymentGateways.getRuntimeGateway(identifier);
    return this.paymentGateways.getRuntimeGatewayByProvider(this.providerIdentifier);
  }

  private createStripe(gateway: RuntimePaymentGateway) {
    return new Stripe(gateway.secrets.secret_key || STRIPE_CONFIG.defaultSecretKey, {
      apiVersion: this.text(gateway.publicSettings.api_version, STRIPE_CONFIG.apiVersion) as never,
    });
  }

  private text(value: unknown, fallback = '') {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      ? String(value)
      : fallback;
  }
}
