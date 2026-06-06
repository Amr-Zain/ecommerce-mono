import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma';
import { IReturnRequestsRepository } from '@/common/interfaces';

@Injectable()
export class ReturnRequestsRepository implements IReturnRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}
  findMany(args: Prisma.ReturnRequestFindManyArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.findMany(args as never);
  }
  count(where: Prisma.ReturnRequestWhereInput, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.count({ where });
  }
  findUnique(args: Prisma.ReturnRequestFindUniqueArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.findUnique(args as never);
  }
  findFirst(args: Prisma.ReturnRequestFindFirstArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.findFirst(args as never);
  }
  findUniqueOrThrow(args: Prisma.ReturnRequestFindUniqueOrThrowArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.findUniqueOrThrow(args as never);
  }
  create(args: Prisma.ReturnRequestCreateArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.create(args as never);
  }
  update(args: Prisma.ReturnRequestUpdateArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.update(args as never);
  }
  aggregate(args: Prisma.ReturnRequestAggregateArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.aggregate(args as never);
  }
  updateItem(args: Prisma.ReturnRequestItemUpdateArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequestItem.update(args as never);
  }
  findItems(args: Prisma.ReturnRequestItemFindManyArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequestItem.findMany(args as never);
  }
  aggregateItems(args: Prisma.ReturnRequestItemAggregateArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequestItem.aggregate(args as never);
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
