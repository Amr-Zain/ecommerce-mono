import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma';
import { DomainEvent } from './domain-event';

@Injectable()
export class IdempotentEventConsumer {
  constructor(private readonly prisma: PrismaService) {}

  async run(event: DomainEvent, consumerName: string, handler: () => Promise<void>) {
    const { count } = await this.prisma.eventConsumerReceipt.createMany({
      data: [{ eventId: event.eventId, consumerName }],
      skipDuplicates: true,
    });
    if (count === 0) return;
    try {
      await handler();
    } catch (error) {
      await this.prisma.eventConsumerReceipt.delete({
        where: { eventId_consumerName: { eventId: event.eventId, consumerName } },
      });
      throw error;
    }
  }
}
