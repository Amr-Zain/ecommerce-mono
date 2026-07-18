import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TransactionOptions, UnitOfWork } from '@/common/persistence';
import { PrismaService } from './prisma.service';
import { PrismaTransactionContext } from './prisma-transaction-context';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(
    work: (context: PrismaTransactionContext) => Promise<T>,
    options: TransactionOptions = {},
  ): Promise<T> {
    const maxRetries = Math.max(0, options.maxRetries ?? 0);
    let attempt = 0;

    for (;;) {
      try {
        return await this.prisma.$transaction(
          (client) => work(new PrismaTransactionContext(client)),
          options.isolation === 'serializable'
            ? { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
            : undefined,
        );
      } catch (error) {
        if (!this.isRetryable(error) || attempt >= maxRetries) throw error;
        attempt += 1;
      }
    }
  }

  private isRetryable(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      ['P2028', 'P2034'].includes((error as Prisma.PrismaClientKnownRequestError).code)
    );
  }
}
