import { Global, Module } from '@nestjs/common';
import { DomainEventPublisher } from './domain-event-publisher.service';
import { IdempotentEventConsumer } from './idempotent-event-consumer.service';
import { OutboxEventsRepository } from './outbox-events.repository';
import { OutboxWorker } from './outbox-worker.service';
import { EventConsumerReceiptsRepository } from './event-consumer-receipts.repository';

@Global()
@Module({
  providers: [
    DomainEventPublisher,
    IdempotentEventConsumer,
    EventConsumerReceiptsRepository,
    OutboxEventsRepository,
    OutboxWorker,
  ],
  exports: [DomainEventPublisher, IdempotentEventConsumer],
})
export class DomainEventsModule {}
