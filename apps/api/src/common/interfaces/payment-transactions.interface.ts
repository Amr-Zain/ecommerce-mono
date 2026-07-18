import { TransactionContext } from '@/common/persistence';

export const PAYMENT_TRANSACTIONS_REPOSITORY = Symbol('IPaymentTransactionsRepository');

export type PaymentPersistenceContext = TransactionContext;
export type PaymentTransactionFilter = Record<string, unknown>;
export type PaymentTransactionCommand = Record<string, unknown>;

export interface PaymentTransactionRecord {
  id: bigint;
  orderId: bigint;
  amount: { toString(): string } | number | string;
  paymentMethod: string;
  paymentStatus: string;
  transactionRef: string | null;
  gatewayResponse: unknown;
  paidAt: Date | null;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  refundSource: string | null;
  refundReason: string | null;
  idempotencyKey: string | null;
  requestedById: bigint | null;
  returnRequestId: bigint | null;
  exchangeRequestId: bigint | null;
}

export interface IPaymentTransactionsRepository {
  create(data: PaymentTransactionCommand, context?: PaymentPersistenceContext): Promise<PaymentTransactionRecord>;
  findFirst(
    filter: PaymentTransactionFilter,
    context?: PaymentPersistenceContext,
  ): Promise<PaymentTransactionRecord | null>;
  updateMany(
    command: { where: PaymentTransactionFilter; data: PaymentTransactionCommand },
    context?: PaymentPersistenceContext,
  ): Promise<{ count: number }>;
  findById(id: bigint, context?: PaymentPersistenceContext): Promise<PaymentTransactionRecord | null>;
  update(
    id: bigint,
    data: PaymentTransactionCommand,
    context?: PaymentPersistenceContext,
  ): Promise<PaymentTransactionRecord>;
  findMany(filter: PaymentTransactionFilter, context?: PaymentPersistenceContext): Promise<PaymentTransactionRecord[]>;
}
