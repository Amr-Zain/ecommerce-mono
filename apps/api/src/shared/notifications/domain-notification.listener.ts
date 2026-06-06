import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEvent, DOMAIN_EVENTS } from '@/common/events/domain-event';
import { IdempotentEventConsumer } from '@/common/events/idempotent-event-consumer.service';
import { NotificationService } from './notification.service';

@Injectable()
export class DomainNotificationListener {
  private static readonly ADMIN_SILENT_EVENTS = new Set(['order.created']);

  constructor(
    private readonly consumer: IdempotentEventConsumer,
    private readonly notifications: NotificationService,
  ) {}

  @OnEvent('order.*', { async: true, suppressErrors: false })
  handleOrder(event: DomainEvent) {
    return this.consume(event, 'orders');
  }

  @OnEvent('return.*', { async: true, suppressErrors: false })
  handleReturn(event: DomainEvent) {
    return this.consume(event, 'returns');
  }

  @OnEvent('exchange.*', { async: true, suppressErrors: false })
  handleExchange(event: DomainEvent) {
    return this.consume(event, 'exchanges');
  }

  @OnEvent('payment.*', { async: true, suppressErrors: false })
  handlePayment(event: DomainEvent) {
    const adminResource =
      event.aggregateType === 'return' ? 'returns' : event.aggregateType === 'exchange' ? 'exchanges' : 'orders';
    return this.consume(event, adminResource);
  }

  private consume(event: DomainEvent, adminResource: string) {
    const consumerName = `DomainNotification.${adminResource}`;
    return this.consumer.run(event, consumerName, async () => {
      const data = this.notificationData(event);
      const template = this.notificationTemplate(event);
      const input = {
        eventId: event.eventId,
        notificationType: event.eventName,
        ...template,
        data,
      };
      const userId = event.payload.userId;
      if (typeof userId === 'string') await this.notifications.createForUsers([BigInt(userId)], input);
      if (!DomainNotificationListener.ADMIN_SILENT_EVENTS.has(event.eventName)) {
        await this.notifications.createForAdmins(adminResource, input);
      }
    });
  }

  private notificationData(event: DomainEvent) {
    const data = { ...event.payload };
    const primaryIdField: Record<string, string> = {
      order: 'orderId',
      return: 'returnRequestId',
      exchange: 'exchangeRequestId',
      payment: 'paymentId',
    };
    const field = primaryIdField[event.aggregateType];
    if (field && data[field] === event.aggregateId) delete data[field];

    return {
      entity: { type: event.aggregateType, id: event.aggregateId },
      ...data,
    };
  }

  private notificationTemplate(event: DomainEvent) {
    const status = String(event.payload.newStatus ?? event.payload.status ?? '');
    const statusTemplates: Record<string, Record<string, { titleKey: string; bodyKey: string }>> = {
      order: {
        pending: this.template('order_status', 'order_pending'),
        processing: this.template('order_status', 'order_processing'),
        shipped: this.template('order_status', 'order_shipped'),
        delivered: this.template('order_status', 'order_delivered'),
        cancelled: this.template('order_cancelled', 'order_cancelled'),
        refunded: this.template('order_status', 'order_refunded'),
      },
      return: {
        requested: this.template('return_requested', 'return_requested'),
        approved: this.template('return_approved', 'return_approved'),
        rejected: this.template('return_rejected', 'return_rejected'),
        cancelled_by_client: this.template('return_cancelled', 'return_cancelled'),
        item_received: this.template('return_received', 'return_received'),
        refunded: this.template('return_refunded', 'return_refunded'),
        completed: this.template('return_completed', 'return_completed'),
      },
      exchange: {
        requested: this.template('exchange_requested', 'exchange_requested'),
        approved: this.template('exchange_approved', 'exchange_approved'),
        rejected: this.template('exchange_rejected', 'exchange_rejected'),
        cancelled_by_client: this.template('exchange_cancelled', 'exchange_cancelled'),
        item_received: this.template('exchange_received', 'exchange_received'),
        replacement_shipped: this.template('exchange_shipped', 'exchange_shipped'),
        completed: this.template('exchange_completed', 'exchange_completed'),
        requires_review: this.template('exchange_review', 'exchange_review'),
      },
    };

    if (event.eventName === 'order.created') return this.template('order_created', 'order_created');
    if (event.eventName === 'order.cancelled') return this.template('order_cancelled', 'order_cancelled');
    if (event.eventName === DOMAIN_EVENTS.exchangeReservationExpired) {
      return this.template('exchange_reservation_expired', 'exchange_reservation_expired');
    }
    if (event.eventName === 'payment.completed') {
      if (status === 'refunded') return this.template('refund_completed', 'refund_completed');
      if (status === 'requires_review') return this.template('payment_review', 'payment_review');
      return this.template('payment_completed', 'payment_completed');
    }
    if (event.eventName === 'payment.failed') return this.template('payment_review', 'payment_review');

    return statusTemplates[event.aggregateType]?.[status] ?? this.template('update', 'update');
  }

  private template(title: string, body: string) {
    return {
      titleKey: `common.notification_${title}_title`,
      bodyKey: `common.notification_${body}_body`,
    };
  }
}
