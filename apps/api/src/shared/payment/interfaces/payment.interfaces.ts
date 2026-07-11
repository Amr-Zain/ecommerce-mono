import { PaymentStatus } from '../payment.constants';

export type PaymentGatewayData = Record<string, unknown>;

export interface PaymentInitResult {
  transactionRef: string;
  status: Extract<PaymentStatus, 'pending' | 'completed' | 'awaiting_confirmation'>;
  redirectUrl?: string;
  clientSecret?: string | null;
  sessionKey?: string | null;
  providerIdentifier?: string;
  gatewayResponse?: PaymentGatewayData;
}

export interface PaymentInitiateOptions {
  providerIdentifier?: string;
  paymentMethod?: string;
  country?: string;
  currency?: string;
  channel?: string;
  paymentSource?: PaymentGatewayData;
  gatewayData?: PaymentGatewayData;
  metadata?: Record<string, string>;
  expiresAt?: Date;
  successUrl?: string;
  cancelUrl?: string;
  pendingCheckoutId?: string | bigint;
  orderId?: string | bigint;
  walletTransactionId?: string | bigint;
  returnRequestId?: string | bigint;
  exchangeRequestId?: string | bigint;
  orderDetails?: PaymentOrderDetails;
}

export interface PaymentOrderDetails {
  referenceId: string;
  currency: string;
  amount: number;
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  taxAmount: number;
  walletAmount?: number;
  externalAmount?: number;
  customer?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  shippingAddress?: {
    address?: string | null;
    city?: string | null;
    country?: string | null;
  };
  items: PaymentOrderItem[];
}

export interface PaymentOrderItem {
  name: string;
  description?: string | null;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
  productId?: string;
  variantId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentVerifyResult {
  status: Extract<PaymentStatus, 'completed' | 'failed' | 'pending'>;
  providerIdentifier?: string;
  gatewayResponse?: PaymentGatewayData;
}

export interface PaymentRefundResult {
  status: Extract<PaymentStatus, 'refunded' | 'failed'>;
  gatewayResponse?: PaymentGatewayData;
}

export interface PaymentRefundOptions {
  idempotencyKey?: string;
  providerIdentifier?: string;
}

export interface PaymentCancelResult {
  status: Extract<PaymentStatus, 'failed' | 'expired' | 'pending'>;
  gatewayResponse?: PaymentGatewayData;
}

export interface PaymentStrategy {
  readonly methodName: string;
  readonly providerIdentifier?: string;
  initiate(referenceId: string, amount: number, options?: PaymentInitiateOptions): Promise<PaymentInitResult>;
  verify(transactionRef: string, gatewayData: PaymentGatewayData): Promise<PaymentVerifyResult>;
  refund(transactionRef: string, amount: number, options?: PaymentRefundOptions): Promise<PaymentRefundResult>;
  cancel(transactionRef: string): Promise<PaymentCancelResult>;
  parseWebhook?(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): Promise<PaymentGatewayData>;
  normalizeStatus?(gatewayStatus: string): PaymentStatus;
}
