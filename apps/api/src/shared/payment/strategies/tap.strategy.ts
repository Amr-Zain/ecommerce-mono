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
export class TapStrategy extends HttpPaymentStrategy {
  readonly methodName = PAYMENT_METHODS.tapCheckout;
  readonly providerIdentifier = PAYMENT_PROVIDERS.tap;

  constructor(gateways: PaymentGatewayService, configService: ConfigService, i18n: I18nService<I18nTranslations>) {
    super(gateways, configService, i18n);
  }

  async initiate(referenceId: string, amount: number, options?: PaymentInitiateOptions): Promise<PaymentInitResult> {
    try {
      const gateway = await this.gateway(options?.providerIdentifier);
      const charge = await this.request<JsonRecord>(
        'https://api.tap.company/v2/charges',
        {
          method: 'POST',
          body: JSON.stringify({
            amount,
            currency: (options?.currency || 'SAR').toUpperCase(),
            threeDSecure: true,
            save_card: false,
            description: this.description(referenceId, options),
            metadata: this.metadata(referenceId, options),
            reference: { transaction: referenceId, order: options?.orderId?.toString() || referenceId },
            receipt: { email: false, sms: false },
            customer: this.customer(options),
            items: this.items(options),
            source: {
              id: this.text(options?.paymentSource?.id) || this.text(options?.paymentSource?.token) || 'src_all',
            },
            redirect: { url: this.successUrl(gateway, referenceId, options) },
            post: { url: `${this.frontendUrl(gateway)}/webhooks/payments/tap` },
          }),
        },
        { bearer: gateway.secrets.secret_key },
      );

      return {
        transactionRef: this.text(charge.id, PAYMENT_REFERENCE_PREFIXES.error),
        status: this.toInitiateStatus(this.normalizeStatus(this.text(charge.status, 'INITIATED'))),
        redirectUrl:
          this.text((charge.transaction as JsonRecord | undefined)?.url) ||
          this.text((charge.redirect as JsonRecord | undefined)?.url),
        providerIdentifier: gateway.identifier,
        gatewayResponse: charge,
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
      const charge = await this.request<JsonRecord>(
        `https://api.tap.company/v2/charges/${transactionRef}`,
        { method: 'GET' },
        { bearer: gateway.secrets.secret_key },
      );
      return {
        status: this.toVerifyStatus(this.normalizeStatus(this.text(charge.status))),
        providerIdentifier: gateway.identifier,
        gatewayResponse: charge,
      };
    } catch (error) {
      return { status: PAYMENT_STATUSES.failed, gatewayResponse: { error: this.failure(error) } };
    }
  }

  async refund(transactionRef: string, amount: number, options?: PaymentRefundOptions): Promise<PaymentRefundResult> {
    try {
      const gateway = await this.gateway(options?.providerIdentifier);
      const refund = await this.request<JsonRecord>(
        'https://api.tap.company/v2/refunds',
        { method: 'POST', body: JSON.stringify({ charge_id: transactionRef, amount }) },
        { bearer: gateway.secrets.secret_key },
      );
      return { status: PAYMENT_STATUSES.refunded, gatewayResponse: refund };
    } catch (error) {
      return { status: PAYMENT_STATUSES.failed, gatewayResponse: { error: this.failure(error) } };
    }
  }

  cancel(transactionRef: string): Promise<PaymentCancelResult> {
    return Promise.resolve({
      status: PAYMENT_STATUSES.pending,
      gatewayResponse: { transactionRef, action: 'tap_cancel_not_required' },
    });
  }

  normalizeStatus(status: string) {
    const normalized = status.toUpperCase();
    if (['CAPTURED', 'PAID'].includes(normalized)) return PAYMENT_STATUSES.completed;
    if (['DECLINED', 'FAILED', 'CANCELLED', 'ABANDONED', 'VOID'].includes(normalized)) return PAYMENT_STATUSES.failed;
    if (['EXPIRED'].includes(normalized)) return PAYMENT_STATUSES.expired;
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

  private customer(options?: PaymentInitiateOptions) {
    const customer = options?.orderDetails?.customer;
    if (!customer) return undefined;
    return {
      first_name: customer.name || 'Customer',
      email: customer.email || undefined,
      phone: { number: customer.phone || undefined },
    };
  }

  private items(options?: PaymentInitiateOptions) {
    return options?.orderDetails?.items.map((item) => ({
      name: item.name,
      description: item.description || undefined,
      quantity: item.quantity,
      amount_per_unit: item.unitAmount,
      total_amount: item.totalAmount,
    }));
  }
}
