import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma';
import { IExchangeRequestsRepository } from '@/common/interfaces';

@Injectable()
export class ExchangeRequestsRepository implements IExchangeRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}
  findMany(args: Prisma.ExchangeRequestFindManyArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.exchangeRequest.findMany(args);
  }
  count(where: Prisma.ExchangeRequestWhereInput, tx: Prisma.TransactionClient = this.prisma) {
    return tx.exchangeRequest.count({ where });
  }
  findUnique(args: Prisma.ExchangeRequestFindUniqueArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.exchangeRequest.findUnique(args);
  }
  findFirst(args: Prisma.ExchangeRequestFindFirstArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.exchangeRequest.findFirst(args);
  }
  findUniqueOrThrow(args: Prisma.ExchangeRequestFindUniqueOrThrowArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.exchangeRequest.findUniqueOrThrow(args);
  }
  create(args: Prisma.ExchangeRequestCreateArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.exchangeRequest.create(args);
  }
  update(args: Prisma.ExchangeRequestUpdateArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.exchangeRequest.update(args);
  }
  updateMany(args: Prisma.ExchangeRequestUpdateManyArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.exchangeRequest.updateMany(args);
  }
  updateItem(args: Prisma.ExchangeRequestItemUpdateArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.exchangeRequestItem.update(args);
  }
  findItems(args: Prisma.ExchangeRequestItemFindManyArgs, tx: Prisma.TransactionClient = this.prisma) {
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
