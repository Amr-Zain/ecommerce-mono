import { IdempotentEventConsumer } from './idempotent-event-consumer.service';
import { OutboxWorker } from './outbox-worker.service';
import { createDomainEvent } from './domain-event';
import { DomainEventPublisher } from './domain-event-publisher.service';

describe('durable domain events', () => {
  it('writes an event through the provided transaction client', async () => {
    const repository = { create: jest.fn().mockResolvedValue(undefined) };
    const publisher = new DomainEventPublisher(repository as never);
    const tx = { outboxEvent: {} };
    const event = createDomainEvent({
      eventName: 'order.created',
      aggregateType: 'order',
      aggregateId: '1',
      payload: { orderId: '1' },
    });

    await publisher.publish(event, tx as never);

    expect(repository.create).toHaveBeenCalledWith(event, tx);
  });

  it('dispatches claimed events and marks them processed', async () => {
    const event = {
      id: 1n,
      eventId: 'event-1',
      eventName: 'order.created',
      version: 1,
      aggregateType: 'order',
      aggregateId: '1',
      actor: null,
      payload: { orderId: '1' },
      occurredAt: new Date(),
      status: 'processing',
      attempts: 1,
      availableAt: new Date(),
      lockedAt: new Date(),
      processedAt: null,
      lastError: null,
      createdAt: new Date(),
    };
    const repository = {
      claimBatch: jest.fn().mockResolvedValue([event]),
      markProcessed: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn(),
    };
    const emitter = { emitAsync: jest.fn().mockResolvedValue([]) };
    const worker = new OutboxWorker(repository as never, emitter as never);

    await worker.dispatchPending();

    expect(emitter.emitAsync).toHaveBeenCalledWith('order.created', expect.objectContaining({ eventId: 'event-1' }));
    expect(repository.markProcessed).toHaveBeenCalledWith(1n);
    expect(repository.markFailed).not.toHaveBeenCalled();
  });

  it('records a failed dispatch for retry', async () => {
    const event = { id: 1n, eventId: 'event-1', eventName: 'order.created', attempts: 1 };
    const repository = {
      claimBatch: jest.fn().mockResolvedValue([event]),
      markProcessed: jest.fn(),
      markFailed: jest.fn().mockResolvedValue(undefined),
    };
    const error = new Error('listener failed');
    const emitter = { emitAsync: jest.fn().mockRejectedValue(error) };
    const worker = new OutboxWorker(repository as never, emitter as never);

    await worker.dispatchPending();

    expect(repository.markFailed).toHaveBeenCalledWith(event, error, 10);
  });

  it('skips an idempotent consumer after a receipt exists', async () => {
    const prisma = {
      eventConsumerReceipt: {
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
        delete: jest.fn(),
      },
    };
    const consumer = new IdempotentEventConsumer(prisma as never);
    const handler = jest.fn();

    await consumer.run(
      createDomainEvent({
        eventId: 'event-1',
        eventName: 'order.created',
        aggregateType: 'order',
        aggregateId: '1',
        payload: {},
      }),
      'test-consumer',
      handler,
    );

    expect(prisma.eventConsumerReceipt.createMany).toHaveBeenCalledWith({
      data: [{ eventId: 'event-1', consumerName: 'test-consumer' }],
      skipDuplicates: true,
    });
    expect(handler).not.toHaveBeenCalled();
    expect(prisma.eventConsumerReceipt.delete).not.toHaveBeenCalled();
  });

  it('runs handler when receipt does not exist, and deletes receipt on error', async () => {
    const prisma = {
      eventConsumerReceipt: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
        delete: jest.fn().mockResolvedValue({}),
      },
    };
    const consumer = new IdempotentEventConsumer(prisma as never);
    const handler = jest.fn().mockRejectedValue(new Error('handler failed'));

    await expect(
      consumer.run(
        createDomainEvent({
          eventId: 'event-1',
          eventName: 'order.created',
          aggregateType: 'order',
          aggregateId: '1',
          payload: {},
        }),
        'test-consumer',
        handler,
      ),
    ).rejects.toThrow('handler failed');

    expect(handler).toHaveBeenCalled();
    expect(prisma.eventConsumerReceipt.delete).toHaveBeenCalledWith({
      where: { eventId_consumerName: { eventId: 'event-1', consumerName: 'test-consumer' } },
    });
  });
});
