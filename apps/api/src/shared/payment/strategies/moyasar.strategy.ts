import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import {
  PaymentCancelResult,
  PaymentGatewayData,
  PaymentInitResult,
  PaymentInitiateOptions,
  PaymentRefundOptions,
  PaymentRefundResult,
  PaymentVerifyResult,
} from '../interfaces/payment.interfaces';
import { PAYMENT_METHODS, PAYMENT_PROVIDERS, PAYMENT_REFERENCE_PREFIXES, PAYMENT_STATUSES } from '../payment.constants';
import { PaymentGatewayService } from '../payment-gateway.service';
import { HttpPaymentStrategy, JsonRecord } from './http-payment.strategy';

@Injectable()
export class MoyasarStrategy extends HttpPaymentStrategy {
  readonly methodName = PAYMENT_METHODS.moyasar;
  readonly providerIdentifier = PAYMENT_PROVIDERS.moyasar;

  constructor(gateways: PaymentGatewayService, configService: ConfigService, i18n: I18nService<I18nTranslations>) {
    super(gateways, configService, i18n);
  }

  async initiate(referenceId: string, amount: number, options?: PaymentInitiateOptions): Promise<PaymentInitResult> {
    try {
      const gateway = await this.gateway(options?.providerIdentifier);
      const source = options?.paymentSource || options?.gatewayData || {};
      const payment = await this.request<JsonRecord>(
        'https://api.moyasar.com/v1/payments',
        {
          method: 'POST',
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            currency: (options?.currency || 'SAR').toUpperCase(),
            description: this.description(referenceId, options),
            callback_url: this.successUrl(gateway, referenceId, options),
            source,
            metadata: this.metadata(referenceId, options),
          }),
        },
        { basic: gateway.secrets.secret_key },
      );
      return {
        transactionRef: this.text(payment.id, PAYMENT_REFERENCE_PREFIXES.error),
        status: this.toInitiateStatus(this.normalizeStatus(this.text(payment.status, 'initiated'))),
        redirectUrl:
          this.text((payment.source as JsonRecord | undefined)?.transaction_url) || this.text(payment.transaction_url),
        providerIdentifier: gateway.identifier,
        gatewayResponse: payment,
      };
    } catch (error) {
      return {
        transactionRef: PAYMENT_REFERENCE_PREFIXES.error,
        status: PAYMENT_STATUSES.pending,
        gatewayResponse: { error: this.failure(error) },
      };
    }
  }

  async verify(transactionRef: string, gatewayData: PaymentGatewayData): Promise<PaymentVerifyResult> {
    try {
      const gateway = await this.gateway(this.text(gatewayData.providerIdentifier));
      const payment = await this.request<JsonRecord>(
        `https://api.moyasar.com/v1/payments/${transactionRef}`,
        { method: 'GET' },
        { basic: gateway.secrets.secret_key },
      );
      return {
        status: this.toVerifyStatus(this.normalizeStatus(this.text(payment.status))),
        providerIdentifier: gateway.identifier,
        gatewayResponse: payment,
      };
    } catch (error) {
      return { status: PAYMENT_STATUSES.failed, gatewayResponse: { error: this.failure(error) } };
    }
  }

  async refund(transactionRef: string, amount: number, options?: PaymentRefundOptions): Promise<PaymentRefundResult> {
    try {
      const gateway = await this.gateway(options?.providerIdentifier);
      const refund = await this.request<JsonRecord>(
        `https://api.moyasar.com/v1/payments/${transactionRef}/refund`,
        { method: 'POST', body: JSON.stringify({ amount: Math.round(amount * 100) }) },
        { basic: gateway.secrets.secret_key },
      );
      return { status: PAYMENT_STATUSES.refunded, gatewayResponse: refund };
    } catch (error) {
      return { status: PAYMENT_STATUSES.failed, gatewayResponse: { error: this.failure(error) } };
    }
  }

  cancel(transactionRef: string): Promise<PaymentCancelResult> {
    return Promise.resolve({
      status: PAYMENT_STATUSES.pending,
      gatewayResponse: { transactionRef, action: 'moyasar_cancel_not_required' },
    });
  }

  normalizeStatus(status: string) {
    const normalized = status.toLowerCase();
    if (['paid', 'captured', 'verified'].includes(normalized)) return PAYMENT_STATUSES.completed;
    if (['failed', 'voided', 'canceled', 'cancelled'].includes(normalized)) return PAYMENT_STATUSES.failed;
    if (['expired'].includes(normalized)) return PAYMENT_STATUSES.expired;
    return PAYMENT_STATUSES.pending;
  }

  private toInitiateStatus(status: string) {
    return status === PAYMENT_STATUSES.completed ? PAYMENT_STATUSES.completed : PAYMENT_STATUSES.pending;
  }

  private toVerifyStatus(status: string) {
    return status === PAYMENT_STATUSES.completed
      ? PAYMENT_STATUSES.completed
      : status === PAYMENT_STATUSES.failed || status === PAYMENT_STATUSES.expired
        ? PAYMENT_STATUSES.failed
        : PAYMENT_STATUSES.pending;
  }

  private description(referenceId: string, options?: PaymentInitiateOptions) {
    const itemCount = options?.orderDetails?.items.length ?? 0;
    return itemCount > 0 ? `Checkout #${referenceId} - ${itemCount} item(s)` : `Checkout #${referenceId}`;
  }

  private metadata(referenceId: string, options?: PaymentInitiateOptions) {
    const details = options?.orderDetails;
    return {
      ...options?.metadata,
      checkoutId: referenceId,
      items: details?.items
        ? JSON.stringify(
            details.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unitAmount: item.unitAmount,
              totalAmount: item.totalAmount,
              productId: item.productId,
              variantId: item.variantId,
            })),
          )
        : undefined,
      subtotal: details?.subtotal?.toFixed(2),
      shippingAmount: details?.shippingAmount?.toFixed(2),
      discountAmount: details?.discountAmount?.toFixed(2),
      taxAmount: details?.taxAmount?.toFixed(2),
      walletAmount: details?.walletAmount?.toFixed(2),
    };
  }
}
