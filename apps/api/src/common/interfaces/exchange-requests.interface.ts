import { Prisma } from '@prisma/client';

export const EXCHANGE_REQUESTS_REPOSITORY = 'EXCHANGE_REQUESTS_REPOSITORY';

export interface IExchangeRequestsRepository {
  findMany(args: Prisma.ExchangeRequestFindManyArgs, tx?: Prisma.TransactionClient): Promise<any[]>;
  count(where: Prisma.ExchangeRequestWhereInput, tx?: Prisma.TransactionClient): Promise<number>;
  findUnique(args: Prisma.ExchangeRequestFindUniqueArgs, tx?: Prisma.TransactionClient): Promise<any | null>;
  findFirst(args: Prisma.ExchangeRequestFindFirstArgs, tx?: Prisma.TransactionClient): Promise<any | null>;
  findUniqueOrThrow(args: Prisma.ExchangeRequestFindUniqueOrThrowArgs, tx?: Prisma.TransactionClient): Promise<any>;
  create(args: Prisma.ExchangeRequestCreateArgs, tx?: Prisma.TransactionClient): Promise<any>;
  update(args: Prisma.ExchangeRequestUpdateArgs, tx?: Prisma.TransactionClient): Promise<any>;
  updateMany(args: Prisma.ExchangeRequestUpdateManyArgs, tx?: Prisma.TransactionClient): Promise<Prisma.BatchPayload>;
  updateItem(args: Prisma.ExchangeRequestItemUpdateArgs, tx?: Prisma.TransactionClient): Promise<any>;
  findItems(args: Prisma.ExchangeRequestItemFindManyArgs, tx?: Prisma.TransactionClient): Promise<any[]>;
  aggregateItems(args: Prisma.ExchangeRequestItemAggregateArgs, tx?: Prisma.TransactionClient): Promise<any>;
  lock(id: bigint, tx: Prisma.TransactionClient): Promise<void>;
  createHistory(
    data: Prisma.ReturnExchangeStatusHistoryUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<any>;
}
