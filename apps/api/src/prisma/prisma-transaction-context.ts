import { TransactionContext } from '@/common/persistence';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

export type PrismaDbClient = PrismaService | Prisma.TransactionClient;

export class PrismaTransactionContext extends TransactionContext {
  constructor(readonly client: Prisma.TransactionClient) {
    super();
  }
}

export function resolvePrismaClient(
  context: TransactionContext | undefined,
  fallback: PrismaService,
): PrismaDbClient {
  if (!context) return fallback;
  if (!(context instanceof PrismaTransactionContext)) {
    throw new TypeError('Unsupported transaction context');
  }
  return context.client;
}
