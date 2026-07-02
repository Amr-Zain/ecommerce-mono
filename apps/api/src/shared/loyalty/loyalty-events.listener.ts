import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEvent, DOMAIN_EVENTS } from '@/common/events/domain-event';
import { IdempotentEventConsumer } from '@/common/events/idempotent-event-consumer.service';
import { LoyaltyService } from './loyalty.service';

@Injectable()
export class LoyaltyEventsListener {
  constructor(
    private readonly consumer: IdempotentEventConsumer,
    private readonly loyalty: LoyaltyService,
  ) {}

  @OnEvent('payment.completed', { async: true, suppressErrors: false })
  handlePaymentCompleted(event: DomainEvent) {
    return this.consumer.run(event, 'Loyalty.payment.completed', async () => {
      const payload = event.payload as { status?: string; refundSource?: unknown; orderId?: string };
      if (payload.status !== 'completed' || payload.refundSource) return;
      const orderId = payload.orderId;
      if (typeof orderId === 'string') await this.loyalty.awardPaidOrder(BigInt(orderId));
    });
  }

  @OnEvent(DOMAIN_EVENTS.authEmailVerified, { async: true, suppressErrors: false })
  handleEmailVerified(event: DomainEvent) {
    return this.consumer.run(event, 'Loyalty.auth.email_verified', async () => {
      const userId = (event.payload as { userId?: string }).userId;
      if (typeof userId === 'string') await this.loyalty.awardWelcome(BigInt(userId));
    });
  }
}
