import { randomUUID } from 'node:crypto';
import type { ExchangeRequestStatus, ReturnRequestStatus } from '@/common/constants/return-exchange.constants';

export type {
  OrderCreatedPayload,
  OrderStatusChangedPayload,
  OrderCancelledPayload,
  PaymentCompletedPayload,
  PaymentFailedPayload,
  ReturnRequestedPayload,
  ReturnStatusPayload,
  ExchangeRequestedPayload,
  ExchangeStatusPayload,
  ExchangeReservationExpiredPayload,
} from './domain-event-payloads';

export const DOMAIN_EVENTS = {
  orderCreated: 'order.created',
  orderStatusChanged: 'order.status_changed',
  orderCancelled: 'order.cancelled',
  paymentCompleted: 'payment.completed',
  paymentFailed: 'payment.failed',
  returnRequested: 'return.requested',
  exchangeRequested: 'exchange.requested',
  exchangeReservationExpired: 'exchange.reservation_expired',
} as const;

export const returnStatusEvent = (status: ReturnRequestStatus) => `return.${status}` as const;
export const exchangeStatusEvent = (status: ExchangeRequestStatus) => `exchange.${status}` as const;

export interface DomainEvent<TPayload extends object = any> {
  eventId: string;
  eventName: string;
  version: number;
  aggregateType: string;
  aggregateId: string;
  occurredAt: Date;
  actor?: { type: string; userId?: string };
  payload: TPayload;
}

export function createDomainEvent<TPayload extends object>(
  input: Omit<DomainEvent<TPayload>, 'eventId' | 'version' | 'occurredAt'> &
    Partial<Pick<DomainEvent<TPayload>, 'eventId' | 'version' | 'occurredAt'>>,
): DomainEvent<TPayload> {
  return {
    ...input,
    eventId: input.eventId ?? randomUUID(),
    version: input.version ?? 1,
    occurredAt: input.occurredAt ?? new Date(),
  };
}
