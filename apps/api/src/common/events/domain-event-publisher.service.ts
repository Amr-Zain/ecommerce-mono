import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DomainEvent } from './domain-event';
import { OutboxEventsRepository } from './outbox-events.repository';

@Injectable()
export class DomainEventPublisher {
  constructor(private readonly outboxEventsRepository: OutboxEventsRepository) {}

  publish(event: DomainEvent, tx: Prisma.TransactionClient) {
    return this.outboxEventsRepository.create(event, tx);
  }
}
