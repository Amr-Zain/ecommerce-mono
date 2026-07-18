import { Injectable } from '@nestjs/common';
import { DomainEvent } from './domain-event';
import { OutboxEventsRepository } from './outbox-events.repository';
import { TransactionContext } from '@/common/persistence';

@Injectable()
export class DomainEventPublisher {
  constructor(private readonly outboxEventsRepository: OutboxEventsRepository) {}

  publish(event: DomainEvent, context: TransactionContext | object) {
    return this.outboxEventsRepository.create(event, context);
  }
}
