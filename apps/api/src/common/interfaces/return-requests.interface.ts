import { Prisma } from '@prisma/client';

export const RETURN_REQUESTS_REPOSITORY = 'RETURN_REQUESTS_REPOSITORY';

export interface IReturnRequestsRepository {
  findMany(args: Prisma.ReturnRequestFindManyArgs, tx?: Prisma.TransactionClient): Promise<any[]>;
  count(where: Prisma.ReturnRequestWhereInput, tx?: Prisma.TransactionClient): Promise<number>;
  findUnique(args: Prisma.ReturnRequestFindUniqueArgs, tx?: Prisma.TransactionClient): Promise<any | null>;
  findFirst(args: Prisma.ReturnRequestFindFirstArgs, tx?: Prisma.TransactionClient): Promise<any | null>;
  findUniqueOrThrow(args: Prisma.ReturnRequestFindUniqueOrThrowArgs, tx?: Prisma.TransactionClient): Promise<any>;
  create(args: Prisma.ReturnRequestCreateArgs, tx?: Prisma.TransactionClient): Promise<any>;
  update(args: Prisma.ReturnRequestUpdateArgs, tx?: Prisma.TransactionClient): Promise<any>;
  aggregate(args: Prisma.ReturnRequestAggregateArgs, tx?: Prisma.TransactionClient): Promise<any>;
  updateItem(args: Prisma.ReturnRequestItemUpdateArgs, tx?: Prisma.TransactionClient): Promise<any>;
  findItems(args: Prisma.ReturnRequestItemFindManyArgs, tx?: Prisma.TransactionClient): Promise<any[]>;
  aggregateItems(args: Prisma.ReturnRequestItemAggregateArgs, tx?: Prisma.TransactionClient): Promise<any>;
  lock(id: bigint, tx: Prisma.TransactionClient): Promise<void>;
  createHistory(
    data: Prisma.ReturnExchangeStatusHistoryUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<any>;
}
