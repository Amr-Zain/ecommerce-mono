import { Injectable } from '@nestjs/common';
import {
  PaymentStrategy,
  PaymentInitResult,
  PaymentVerifyResult,
  PaymentRefundResult,
  PaymentInitiateOptions,
  PaymentCancelResult,
  PaymentGatewayData,
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

@Injectable()
export class StripeIntentStrategy implements PaymentStrategy {
  readonly methodName = PAYMENT_METHODS.stripeIntent;
  private stripe: Stripe.Stripe;

  constructor(private readonly i18n: I18nService<I18nTranslations>) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || STRIPE_CONFIG.defaultSecretKey);
  }

  async initiate(referenceId: string, amount: number, options?: PaymentInitiateOptions): Promise<PaymentInitResult> {
    const amountInCents = Math.round(amount * 100);

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
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
      const intent = await this.stripe.paymentIntents.retrieve(transactionRef);
      if (intent.status === 'succeeded') {
        return {
          status: PAYMENT_STATUSES.completed,
          gatewayResponse: { intent },
        };
      }
      return {
        status: PAYMENT_STATUSES.pending,
        gatewayResponse: { intent },
      };
    } catch (error: unknown) {
      return {
        status: PAYMENT_STATUSES.failed,
        gatewayResponse: { error: this.getErrorMessage(error) },
      };
    }
  }

  async refund(transactionRef: string, amount: number): Promise<PaymentRefundResult> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: transactionRef,
        amount: Math.round(amount * 100),
      });

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
      const intent = await this.stripe.paymentIntents.cancel(transactionRef);
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
}
