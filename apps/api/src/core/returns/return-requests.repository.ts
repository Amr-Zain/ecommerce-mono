import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma';
import { IReturnRequestsRepository } from '@/common/interfaces';

@Injectable()
export class ReturnRequestsRepository implements IReturnRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}
  findMany(args: Prisma.ReturnRequestFindManyArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.findMany(args);
  }
  count(where: Prisma.ReturnRequestWhereInput, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.count({ where });
  }
  findUnique(args: Prisma.ReturnRequestFindUniqueArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.findUnique(args);
  }
  findFirst(args: Prisma.ReturnRequestFindFirstArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.findFirst(args);
  }
  findUniqueOrThrow(args: Prisma.ReturnRequestFindUniqueOrThrowArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.findUniqueOrThrow(args);
  }
  create(args: Prisma.ReturnRequestCreateArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.create(args);
  }
  update(args: Prisma.ReturnRequestUpdateArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.update(args);
  }
  aggregate(args: Prisma.ReturnRequestAggregateArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.aggregate(args);
  }
  updateItem(args: Prisma.ReturnRequestItemUpdateArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequestItem.update(args);
  }
  findItems(args: Prisma.ReturnRequestItemFindManyArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequestItem.findMany(args);
  }
  aggregateItems(args: Prisma.ReturnRequestItemAggregateArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequestItem.aggregate(args);
  }
  async lock(id: bigint, tx: Prisma.TransactionClient) {
    await tx.$queryRaw`SELECT id FROM return_requests WHERE id = ${id} FOR UPDATE`;
  }
  createHistory(
    data: Prisma.ReturnExchangeStatusHistoryUncheckedCreateInput,
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    return tx.returnExchangeStatusHistory.create({ data });
  }
}
