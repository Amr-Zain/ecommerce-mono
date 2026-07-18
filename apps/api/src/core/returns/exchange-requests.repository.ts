import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma';

@Injectable()
export class ExchangeRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}
  findMany<T extends Prisma.ExchangeRequestFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.ExchangeRequestFindManyArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Array<Prisma.ExchangeRequestGetPayload<T>>> {
    return tx.exchangeRequest.findMany(args);
  }
  count(where: Prisma.ExchangeRequestWhereInput, tx: Prisma.TransactionClient = this.prisma) {
    return tx.exchangeRequest.count({ where });
  }
  findUnique<T extends Prisma.ExchangeRequestFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.ExchangeRequestFindUniqueArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.ExchangeRequestGetPayload<T> | null> {
    return tx.exchangeRequest.findUnique(args);
  }
  findFirst<T extends Prisma.ExchangeRequestFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.ExchangeRequestFindFirstArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.ExchangeRequestGetPayload<T> | null> {
    return tx.exchangeRequest.findFirst(args);
  }
  findUniqueOrThrow<T extends Prisma.ExchangeRequestFindUniqueOrThrowArgs>(
    args: Prisma.SelectSubset<T, Prisma.ExchangeRequestFindUniqueOrThrowArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.ExchangeRequestGetPayload<T>> {
    return tx.exchangeRequest.findUniqueOrThrow(args);
  }
  create<T extends Prisma.ExchangeRequestCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.ExchangeRequestCreateArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.ExchangeRequestGetPayload<T>> {
    return tx.exchangeRequest.create(args);
  }
  update<T extends Prisma.ExchangeRequestUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.ExchangeRequestUpdateArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.ExchangeRequestGetPayload<T>> {
    return tx.exchangeRequest.update(args);
  }
  updateMany(args: Prisma.ExchangeRequestUpdateManyArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.exchangeRequest.updateMany(args);
  }
  updateItem<T extends Prisma.ExchangeRequestItemUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.ExchangeRequestItemUpdateArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.ExchangeRequestItemGetPayload<T>> {
    return tx.exchangeRequestItem.update(args);
  }
  findItems<T extends Prisma.ExchangeRequestItemFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.ExchangeRequestItemFindManyArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Array<Prisma.ExchangeRequestItemGetPayload<T>>> {
    return tx.exchangeRequestItem.findMany(args);
  }
  aggregateItems(args: Prisma.ExchangeRequestItemAggregateArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.exchangeRequestItem.aggregate(args);
  }
  async lock(id: bigint, tx: Prisma.TransactionClient) {
    await tx.$queryRaw`SELECT id FROM exchange_requests WHERE id = ${id} FOR UPDATE`;
  }
  createHistory(
    data: Prisma.ReturnExchangeStatusHistoryUncheckedCreateInput,
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    return tx.returnExchangeStatusHistory.create({ data });
  }
}
