import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma';

@Injectable()
export class EventConsumerReceiptsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async claim(eventId: string, consumerName: string): Promise<boolean> {
    const { count } = await this.prisma.eventConsumerReceipt.createMany({
      data: [{ eventId, consumerName }],
      skipDuplicates: true,
    });
    return count > 0;
  }

  async release(eventId: string, consumerName: string): Promise<void> {
    await this.prisma.eventConsumerReceipt.delete({
      where: { eventId_consumerName: { eventId, consumerName } },
    });
  }
}
