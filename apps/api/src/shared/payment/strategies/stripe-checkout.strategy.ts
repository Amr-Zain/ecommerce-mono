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
import { PaymentGatewayService, RuntimePaymentGateway } from '../payment-gateway.service';

@Injectable()
export class StripeCheckoutStrategy implements PaymentStrategy {
  readonly methodName = PAYMENT_METHODS.stripeCheckout;
  readonly providerIdentifier = 'stripe';

  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly configService: ConfigService,
    private readonly paymentGateways: PaymentGatewayService,
  ) {}

  async initiate(referenceId: string, amount: number, options?: PaymentInitiateOptions): Promise<PaymentInitResult> {
    const gateway = await this.getGateway(options?.providerIdentifier);
    const stripe = this.createStripe(gateway);
    const domain =
      this.text(gateway.publicSettings.frontend_url) ||
      this.configService.get<string>('FRONTEND_URL') ||
      FRONTEND_URL_FALLBACK;
    const successPath = this.text(gateway.publicSettings.success_path, STRIPE_CONFIG.successPath);
    const cancelPath = this.text(gateway.publicSettings.cancel_path, STRIPE_CONFIG.cancelPath);

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: this.checkoutLineItems(referenceId, amount, options),
        mode: 'payment',
        expires_at: options?.expiresAt ? Math.floor(options.expiresAt.getTime() / 1000) : undefined,
        success_url:
          options?.successUrl ||
          `${domain}${successPath}?session_id=${STRIPE_CONFIG.checkoutSessionIdPlaceholder}&checkout_id=${referenceId}`,
        cancel_url: options?.cancelUrl || `${domain}${cancelPath}`,
        metadata: {
          ...options?.metadata,
          checkoutId: referenceId,
        },
      });

      return {
        transactionRef: session.id,
        status: PAYMENT_STATUSES.pending,
        redirectUrl: session.url || undefined,
        providerIdentifier: gateway.identifier,
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
      const gateway = await this.getGateway(this.text(gatewayData.providerIdentifier));
      const session = await this.createStripe(gateway).checkout.sessions.retrieve(transactionRef);
      if (session.payment_status === 'paid') {
        return {
          status: PAYMENT_STATUSES.completed,
          providerIdentifier: gateway.identifier,
          gatewayResponse: { session },
        };
      }
      return {
        status: PAYMENT_STATUSES.pending,
        providerIdentifier: gateway.identifier,
        gatewayResponse: { session },
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
      const stripe = this.createStripe(gateway);
      const session = await stripe.checkout.sessions.retrieve(transactionRef);
      if (!session.payment_intent) {
        return {
          status: PAYMENT_STATUSES.failed,
          gatewayResponse: { error: this.i18n.t('errors.payment_intent_not_found') },
        };
      }

      const refund = await stripe.refunds.create(
        {
          payment_intent: session.payment_intent as string,
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
      const stripe = this.createStripe(gateway);
      const session = await stripe.checkout.sessions.retrieve(transactionRef);
      if (session.status === 'open') {
        const expired = await stripe.checkout.sessions.expire(transactionRef);
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

  private checkoutLineItems(
    referenceId: string,
    amount: number,
    options?: PaymentInitiateOptions,
  ): Array<Record<string, unknown>> {
    const details = options?.orderDetails;
    const currency = (details?.currency || PAYMENT_GATEWAY_CURRENCIES.sar).toLowerCase();
    const sourceLines =
      details?.items.map((item) => ({
        name: item.quantity > 1 ? `${item.name} x ${item.quantity}` : item.name,
        description: [
          item.description,
          `Qty: ${item.quantity}`,
          `Unit: ${details.currency} ${item.unitAmount.toFixed(2)}`,
        ]
          .filter(Boolean)
          .join(' | '),
        amount: item.totalAmount,
      })) ?? [];

    if (details?.shippingAmount && details.shippingAmount > 0) {
      sourceLines.push({
        name: 'Shipping',
        description: 'Delivery fee',
        amount: details.shippingAmount,
      });
    }

    if (!sourceLines.length) {
      return [
        {
          price_data: {
            currency,
            product_data: { name: `Checkout #${referenceId}` },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ];
    }

    const targetCents = Math.max(1, Math.round(amount * 100));
    const sourceTotal = sourceLines.reduce((sum, line) => sum + Math.max(0, line.amount), 0);
    const allocated = sourceLines.map((line) =>
      sourceTotal > 0 ? Math.max(0, Math.round((Math.max(0, line.amount) / sourceTotal) * targetCents)) : 0,
    );
    const allocatedTotal = allocated.reduce((sum, value) => sum + value, 0);
    if (allocated.length) allocated[0] += targetCents - allocatedTotal;

    return sourceLines
      .map((line, index) => ({
        price_data: {
          currency,
          product_data: {
            name: line.name,
            description: line.description || undefined,
          },
          unit_amount: Math.max(1, allocated[index]),
        },
        quantity: 1,
      }))
      .filter((item) => item.price_data.unit_amount > 0);
  }
}
