import { Injectable } from '@nestjs/common';
import { Prisma, OutboxEvent } from '@prisma/client';
import { PrismaService } from '@/prisma';
import { DomainEvent } from './domain-event';

@Injectable()
export class OutboxEventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(event: DomainEvent, tx: Prisma.TransactionClient = this.prisma) {
    return tx.outboxEvent.create({
      data: {
        eventId: event.eventId,
        eventName: event.eventName,
        version: event.version,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        occurredAt: event.occurredAt,
        actor: event.actor as Prisma.InputJsonValue | undefined,
        payload: event.payload as Prisma.InputJsonValue,
      },
    });
  }

  async claimBatch(limit: number): Promise<OutboxEvent[]> {
    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{ id: bigint }>>`
        SELECT id FROM outbox_events
        WHERE status = 'pending' AND available_at <= NOW()
        ORDER BY id
        FOR UPDATE SKIP LOCKED
        LIMIT ${limit}
      `;
      if (rows.length === 0) return [];
      const ids = rows.map((row) => row.id);
      await tx.outboxEvent.updateMany({
        where: { id: { in: ids } },
        data: { status: 'processing', lockedAt: new Date(), attempts: { increment: 1 } },
      });
      return tx.outboxEvent.findMany({ where: { id: { in: ids } }, orderBy: { id: 'asc' } });
    });
  }

  markProcessed(id: bigint) {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: { status: 'processed', processedAt: new Date(), lockedAt: null, lastError: null },
    });
  }

  markFailed(event: OutboxEvent, error: unknown, maxAttempts: number) {
    const exhausted = event.attempts >= maxAttempts;
    const delaySeconds = Math.min(2 ** event.attempts * 5, 3600);
    return this.prisma.outboxEvent.update({
      where: { id: event.id },
      data: {
        status: exhausted ? 'failed' : 'pending',
        lockedAt: null,
        availableAt: exhausted ? event.availableAt : new Date(Date.now() + delaySeconds * 1000),
        lastError: error instanceof Error ? error.message : String(error),
      },
    });
  }

  recoverStale(olderThan: Date) {
    return this.prisma.outboxEvent.updateMany({
      where: { status: 'processing', lockedAt: { lt: olderThan } },
      data: { status: 'pending', lockedAt: null, attempts: { increment: 1 } },
    });
  }

  deleteProcessed(olderThan: Date) {
    return this.prisma.outboxEvent.deleteMany({ where: { status: 'processed', processedAt: { lt: olderThan } } });
  }
}
