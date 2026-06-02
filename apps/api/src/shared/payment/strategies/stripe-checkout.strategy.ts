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
  FRONTEND_URL_FALLBACK,
  PAYMENT_GATEWAY_CURRENCIES,
  PAYMENT_METHODS,
  PAYMENT_REFERENCE_PREFIXES,
  PAYMENT_STATUSES,
  STRIPE_CONFIG,
} from '../payment.constants';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeCheckoutStrategy implements PaymentStrategy {
  readonly methodName = PAYMENT_METHODS.stripeCheckout;
  private stripe: Stripe.Stripe;

  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || STRIPE_CONFIG.defaultSecretKey);
  }

  async initiate(referenceId: string, amount: number, options?: PaymentInitiateOptions): Promise<PaymentInitResult> {
    const amountInCents = Math.round(amount * 100);
    const domain = this.configService.get<string>('FRONTEND_URL') || FRONTEND_URL_FALLBACK;

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: PAYMENT_GATEWAY_CURRENCIES.sar,
              product_data: {
                name: `Checkout #${referenceId}`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        expires_at: options?.expiresAt ? Math.floor(options.expiresAt.getTime() / 1000) : undefined,
        success_url: `${domain}${STRIPE_CONFIG.successPath}?session_id=${STRIPE_CONFIG.checkoutSessionIdPlaceholder}&checkout_id=${referenceId}`,
        cancel_url: `${domain}${STRIPE_CONFIG.cancelPath}`,
        metadata: {
          ...options?.metadata,
          checkoutId: referenceId,
        },
      });

      return {
        transactionRef: session.id,
        status: PAYMENT_STATUSES.pending,
        redirectUrl: session.url || undefined,
        gatewayResponse: { sessionId: session.id },
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
      const session = await this.stripe.checkout.sessions.retrieve(transactionRef);
      if (session.payment_status === 'paid') {
        return {
          status: PAYMENT_STATUSES.completed,
          gatewayResponse: { session },
        };
      }
      return {
        status: PAYMENT_STATUSES.pending,
        gatewayResponse: { session },
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
      const session = await this.stripe.checkout.sessions.retrieve(transactionRef);
      if (!session.payment_intent) {
        return {
          status: PAYMENT_STATUSES.failed,
          gatewayResponse: { error: this.i18n.t('errors.payment_intent_not_found') },
        };
      }

      const refund = await this.stripe.refunds.create({
        payment_intent: session.payment_intent as string,
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
      const session = await this.stripe.checkout.sessions.retrieve(transactionRef);
      if (session.status === 'open') {
        const expired = await this.stripe.checkout.sessions.expire(transactionRef);
        return {
          status: PAYMENT_STATUSES.expired,
          gatewayResponse: { session: expired },
        };
      }

      return {
        status: session.status === 'expired' ? PAYMENT_STATUSES.expired : PAYMENT_STATUSES.pending,
        gatewayResponse: { session },
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
