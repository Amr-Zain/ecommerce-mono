import { Injectable } from '@nestjs/common';
import { DomainEvent } from './domain-event';
import { EventConsumerReceiptsRepository } from './event-consumer-receipts.repository';

@Injectable()
export class IdempotentEventConsumer {
  constructor(private readonly receipts: EventConsumerReceiptsRepository) {}

  async run(event: DomainEvent, consumerName: string, handler: () => Promise<void>) {
    if (!(await this.receipts.claim(event.eventId, consumerName))) return;
    try {
      await handler();
    } catch (error) {
      await this.receipts.release(event.eventId, consumerName);
      throw error;
    }
  }
}
