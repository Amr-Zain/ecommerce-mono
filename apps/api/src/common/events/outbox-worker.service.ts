import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OutboxEventRecord, OutboxEventsRepository } from './outbox-events.repository';

@Injectable()
export class OutboxWorker {
  private readonly logger = new Logger(OutboxWorker.name);
  private readonly maxAttempts = 10;

  constructor(
    private readonly repository: OutboxEventsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async dispatchPending() {
    const events = await this.repository.claimBatch(50);
    await Promise.allSettled(events.map((event) => this.dispatch(event)));
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async recoverAndClean() {
    await this.repository.recoverStale(new Date(Date.now() - 10 * 60_000));
    await this.repository.deleteProcessed(new Date(Date.now() - 30 * 24 * 60 * 60_000));
  }

  private async dispatch(event: OutboxEventRecord) {
    try {
      await this.eventEmitter.emitAsync(event.eventName, {
        eventId: event.eventId,
        eventName: event.eventName,
        version: event.version,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        occurredAt: event.occurredAt,
        actor: event.actor,
        payload: event.payload,
      });
      await this.repository.markProcessed(event.id);
    } catch (error) {
      this.logger.error(`Failed to dispatch ${event.eventName} (${event.eventId})`, error);
      await this.repository.markFailed(event, error, this.maxAttempts);
    }
  }
}
