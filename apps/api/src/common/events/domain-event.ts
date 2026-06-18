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
  authEmailOtpRequested: 'auth.email_otp_requested',
  authPasswordResetRequested: 'auth.password_reset_requested',
  authEmailVerified: 'auth.email_verified',
  messageCampaignRequested: 'message.campaign_requested',
  orderCreated: 'order.created',
  orderStatusChanged: 'order.status_changed',
  orderCancelled: 'order.cancelled',
  paymentCompleted: 'payment.completed',
  paymentFailed: 'payment.failed',
  returnRequested: 'return.requested',
  exchangeRequested: 'exchange.requested',
  exchangeReservationExpired: 'exchange.reservation_expired',
} as const;

export interface AuthEmailOtpRequestedPayload {
  recipient: string;
  locale: string;
  code: string;
  expiresAt: string;
  purpose: 'login';
}

export interface AuthPasswordResetRequestedPayload {
  recipient: string;
  locale: string;
  code: string;
  expiresAt: string;
  purpose: 'password_reset';
}

export interface AuthEmailVerifiedPayload {
  userId: string;
  recipient: string;
  locale: string;
  name?: string;
}

export interface MessageCampaignRequestedPayload {
  campaignId: string;
}

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
