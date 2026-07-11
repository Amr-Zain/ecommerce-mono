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
export class TabbyStrategy extends HttpPaymentStrategy {
  readonly methodName = PAYMENT_METHODS.tabby;
  readonly providerIdentifier = PAYMENT_PROVIDERS.tabby;

  constructor(gateways: PaymentGatewayService, configService: ConfigService, i18n: I18nService<I18nTranslations>) {
    super(gateways, configService, i18n);
  }

  async initiate(referenceId: string, amount: number, options?: PaymentInitiateOptions): Promise<PaymentInitResult> {
    try {
      const gateway = await this.gateway(options?.providerIdentifier);
      const baseUrl = gateway.environment === 'live' ? 'https://api.tabby.ai' : 'https://api.tabby.ai';
      const checkout = await this.request<JsonRecord>(
        `${baseUrl}/api/v2/checkout`,
        {
          method: 'POST',
          body: JSON.stringify({
            payment: {
              amount: amount.toFixed(2),
              currency: (options?.currency || 'SAR').toUpperCase(),
              description: this.description(referenceId, options),
              buyer: options?.gatewayData?.buyer || this.buyer(options),
              shipping_address: this.shippingAddress(options),
              order: options?.gatewayData?.order || this.order(referenceId, options),
              meta: { ...options?.metadata, checkoutId: referenceId },
            },
            lang: options?.gatewayData?.lang || 'en',
            merchant_code: gateway.publicSettings.merchant_code || options?.gatewayData?.merchant_code,
            merchant_urls: {
              success: this.successUrl(gateway, referenceId, options),
              cancel: this.cancelUrl(gateway, options),
              failure: this.cancelUrl(gateway, options),
            },
          }),
        },
        { bearer: gateway.secrets.secret_key },
      );
      const product = (
        ((checkout.configuration as JsonRecord | undefined)?.available_products as JsonRecord | undefined)
          ?.installments as JsonRecord[] | undefined
      )?.[0];
      const checkoutPayment =
        checkout.payment && typeof checkout.payment === 'object' ? (checkout.payment as JsonRecord) : {};
      return {
        transactionRef: this.text(checkoutPayment.id) || this.text(checkout.id) || PAYMENT_REFERENCE_PREFIXES.error,
        sessionKey: this.text(checkout.id),
        status: PAYMENT_STATUSES.pending,
        redirectUrl: this.text(product?.web_url) || this.text(checkout.web_url),
        providerIdentifier: gateway.identifier,
        gatewayResponse: checkout,
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
        `https://api.tabby.ai/api/v2/payments/${transactionRef}`,
        { method: 'GET' },
        { bearer: gateway.secrets.secret_key },
      );
      return {
        status: this.normalizeStatus(this.text(payment.status)),
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
        `https://api.tabby.ai/api/v2/payments/${transactionRef}/refunds`,
        { method: 'POST', body: JSON.stringify({ amount: amount.toFixed(2) }) },
        { bearer: gateway.secrets.secret_key },
      );
      return { status: PAYMENT_STATUSES.refunded, gatewayResponse: refund };
    } catch (error) {
      return { status: PAYMENT_STATUSES.failed, gatewayResponse: { error: this.failure(error) } };
    }
  }

  async cancel(transactionRef: string): Promise<PaymentCancelResult> {
    try {
      const gateway = await this.gateway();
      const close = await this.request<JsonRecord>(
        `https://api.tabby.ai/api/v2/payments/${transactionRef}/close`,
        { method: 'POST', body: JSON.stringify({}) },
        { bearer: gateway.secrets.secret_key },
      );
      return { status: PAYMENT_STATUSES.expired, gatewayResponse: close };
    } catch (error) {
      return { status: PAYMENT_STATUSES.failed, gatewayResponse: { error: this.failure(error) } };
    }
  }

  normalizeStatus(status: string) {
    const normalized = status.toLowerCase();
    if (['authorized', 'closed', 'paid', 'captured'].includes(normalized)) return PAYMENT_STATUSES.completed;
    if (['rejected', 'expired', 'canceled', 'cancelled'].includes(normalized)) return PAYMENT_STATUSES.failed;
    return PAYMENT_STATUSES.pending;
  }

  private description(referenceId: string, options?: PaymentInitiateOptions) {
    const itemCount = options?.orderDetails?.items.length ?? 0;
    return itemCount > 0 ? `Checkout #${referenceId} - ${itemCount} item(s)` : `Checkout #${referenceId}`;
  }

  private buyer(options?: PaymentInitiateOptions) {
    const customer = options?.orderDetails?.customer;
    return {
      name: customer?.name || 'Customer',
      email: customer?.email || undefined,
      phone: customer?.phone || undefined,
    };
  }

  private shippingAddress(options?: PaymentInitiateOptions) {
    const address = options?.orderDetails?.shippingAddress;
    if (!address) return undefined;
    return {
      address: address.address || undefined,
      city: address.city || undefined,
      zip: undefined,
    };
  }

  private order(referenceId: string, options?: PaymentInitiateOptions) {
    const details = options?.orderDetails;
    return {
      reference_id: referenceId,
      tax_amount: details?.taxAmount?.toFixed(2) ?? '0.00',
      shipping_amount: details?.shippingAmount?.toFixed(2) ?? '0.00',
      discount_amount: details?.discountAmount?.toFixed(2) ?? '0.00',
      items:
        details?.items.map((item) => ({
          title: item.name,
          description: item.description || undefined,
          quantity: item.quantity,
          unit_price: item.unitAmount.toFixed(2),
          reference_id: item.variantId || item.productId,
          product_url: undefined,
          category: undefined,
        })) ?? [],
    };
  }
}
