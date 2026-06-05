import { PaymentStatus } from '../payment.constants';

export type PaymentGatewayData = Record<string, unknown>;

export interface PaymentInitResult {
  transactionRef: string;
  status: Extract<PaymentStatus, 'pending' | 'completed' | 'awaiting_confirmation'>;
  redirectUrl?: string;
  gatewayResponse?: PaymentGatewayData;
}

export interface PaymentInitiateOptions {
  metadata?: Record<string, string>;
  expiresAt?: Date;
}

export interface PaymentVerifyResult {
  status: Extract<PaymentStatus, 'completed' | 'failed' | 'pending'>;
  gatewayResponse?: PaymentGatewayData;
}

export interface PaymentRefundResult {
  status: Extract<PaymentStatus, 'refunded' | 'failed'>;
  gatewayResponse?: PaymentGatewayData;
}

export interface PaymentRefundOptions {
  idempotencyKey?: string;
}

export interface PaymentCancelResult {
  status: Extract<PaymentStatus, 'failed' | 'expired' | 'pending'>;
  gatewayResponse?: PaymentGatewayData;
}

export interface PaymentStrategy {
  readonly methodName: string;
  initiate(referenceId: string, amount: number, options?: PaymentInitiateOptions): Promise<PaymentInitResult>;
  verify(transactionRef: string, gatewayData: PaymentGatewayData): Promise<PaymentVerifyResult>;
  refund(transactionRef: string, amount: number, options?: PaymentRefundOptions): Promise<PaymentRefundResult>;
  cancel(transactionRef: string): Promise<PaymentCancelResult>;
}
