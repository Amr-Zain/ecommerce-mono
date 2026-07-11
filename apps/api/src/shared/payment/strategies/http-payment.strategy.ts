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
  PaymentStrategy,
  PaymentVerifyResult,
} from '../interfaces/payment.interfaces';
import { FRONTEND_URL_FALLBACK, STRIPE_CONFIG } from '../payment.constants';
import { PaymentGatewayService, RuntimePaymentGateway } from '../payment-gateway.service';

export type JsonRecord = Record<string, unknown>;

export abstract class HttpPaymentStrategy implements PaymentStrategy {
  abstract readonly methodName: string;
  abstract readonly providerIdentifier: string;

  constructor(
    protected readonly gateways: PaymentGatewayService,
    protected readonly configService: ConfigService,
    protected readonly i18n: I18nService<I18nTranslations>,
  ) {}

  abstract initiate(referenceId: string, amount: number, options?: PaymentInitiateOptions): Promise<PaymentInitResult>;
  abstract verify(transactionRef: string, gatewayData: PaymentGatewayData): Promise<PaymentVerifyResult>;
  abstract refund(transactionRef: string, amount: number, options?: PaymentRefundOptions): Promise<PaymentRefundResult>;
  abstract cancel(transactionRef: string): Promise<PaymentCancelResult>;

  protected async gateway(identifier?: string) {
    if (identifier) return this.gateways.getRuntimeGateway(identifier);
    return this.gateways.getRuntimeGatewayByProvider(this.providerIdentifier);
  }

  protected async request<T>(
    url: string,
    init: RequestInit,
    auth: { bearer?: string; basic?: string },
  ): Promise<T & JsonRecord> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    };
    if (auth.bearer) headers.Authorization = `Bearer ${auth.bearer}`;
    if (auth.basic) headers.Authorization = `Basic ${Buffer.from(`${auth.basic}:`).toString('base64')}`;

    const response = await fetch(url, { ...init, headers });
    const json = (await response.json().catch(() => ({}))) as T & JsonRecord;
    if (!response.ok) {
      throw new Error(this.errorMessage(json) || `Payment provider request failed (${response.status})`);
    }
    return json;
  }

  protected frontendUrl(gateway: RuntimePaymentGateway) {
    return (
      this.text(gateway.publicSettings.frontend_url) ||
      this.configService.get<string>('FRONTEND_URL') ||
      FRONTEND_URL_FALLBACK
    );
  }

  protected successUrl(gateway: RuntimePaymentGateway, referenceId: string, options?: PaymentInitiateOptions) {
    return (
      options?.successUrl ||
      `${this.frontendUrl(gateway)}${this.text(
        gateway.publicSettings.success_path,
        STRIPE_CONFIG.successPath,
      )}?checkout_id=${referenceId}`
    );
  }

  protected cancelUrl(gateway: RuntimePaymentGateway, options?: PaymentInitiateOptions) {
    return (
      options?.cancelUrl ||
      `${this.frontendUrl(gateway)}${this.text(gateway.publicSettings.cancel_path, STRIPE_CONFIG.cancelPath)}`
    );
  }

  protected failure(error: unknown) {
    return error instanceof Error ? error.message : this.i18n.t('errors.INTERNAL_SERVER_ERROR');
  }

  protected text(value: unknown, fallback = '') {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      ? String(value)
      : fallback;
  }

  private errorMessage(json: JsonRecord) {
    const errors = json.errors;
    if (typeof json.message === 'string') return json.message;
    if (Array.isArray(errors) && errors.length) return String(errors[0]);
    if (errors && typeof errors === 'object') return JSON.stringify(errors);
    return '';
  }
}
