import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma';

@Injectable()
export class ReturnRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}
  findMany<T extends Prisma.ReturnRequestFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.ReturnRequestFindManyArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Array<Prisma.ReturnRequestGetPayload<T>>> {
    return tx.returnRequest.findMany(args);
  }
  count(where: Prisma.ReturnRequestWhereInput, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.count({ where });
  }
  findUnique<T extends Prisma.ReturnRequestFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.ReturnRequestFindUniqueArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.ReturnRequestGetPayload<T> | null> {
    return tx.returnRequest.findUnique(args);
  }
  findFirst<T extends Prisma.ReturnRequestFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.ReturnRequestFindFirstArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.ReturnRequestGetPayload<T> | null> {
    return tx.returnRequest.findFirst(args);
  }
  findUniqueOrThrow<T extends Prisma.ReturnRequestFindUniqueOrThrowArgs>(
    args: Prisma.SelectSubset<T, Prisma.ReturnRequestFindUniqueOrThrowArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.ReturnRequestGetPayload<T>> {
    return tx.returnRequest.findUniqueOrThrow(args);
  }
  create<T extends Prisma.ReturnRequestCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.ReturnRequestCreateArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.ReturnRequestGetPayload<T>> {
    return tx.returnRequest.create(args);
  }
  update<T extends Prisma.ReturnRequestUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.ReturnRequestUpdateArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.ReturnRequestGetPayload<T>> {
    return tx.returnRequest.update(args);
  }
  aggregate(args: Prisma.ReturnRequestAggregateArgs, tx: Prisma.TransactionClient = this.prisma) {
    return tx.returnRequest.aggregate(args);
  }
  updateItem<T extends Prisma.ReturnRequestItemUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.ReturnRequestItemUpdateArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.ReturnRequestItemGetPayload<T>> {
    return tx.returnRequestItem.update(args);
  }
  findItems<T extends Prisma.ReturnRequestItemFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.ReturnRequestItemFindManyArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Array<Prisma.ReturnRequestItemGetPayload<T>>> {
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
