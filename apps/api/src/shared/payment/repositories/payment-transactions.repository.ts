import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService, resolvePrismaClient } from '@/prisma';
import {
  IPaymentTransactionsRepository,
  PaymentPersistenceContext,
  PaymentTransactionCommand,
  PaymentTransactionFilter,
  PaymentTransactionRecord,
} from '@/common/interfaces/payment-transactions.interface';

@Injectable()
export class PaymentTransactionsRepository implements IPaymentTransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst(
    where: PaymentTransactionFilter,
    context?: PaymentPersistenceContext,
  ): Promise<PaymentTransactionRecord | null> {
    return this.db(context).paymentTransaction.findFirst({ where: where as Prisma.PaymentTransactionWhereInput });
  }

  async create(
    data: PaymentTransactionCommand,
    context?: PaymentPersistenceContext,
  ): Promise<PaymentTransactionRecord> {
    return this.db(context).paymentTransaction.create({ data: data as Prisma.PaymentTransactionUncheckedCreateInput });
  }

  async updateMany(
    args: {
      where: PaymentTransactionFilter;
      data: PaymentTransactionCommand;
    },
    context?: PaymentPersistenceContext,
  ): Promise<{ count: number }> {
    return this.db(context).paymentTransaction.updateMany({
      where: args.where as Prisma.PaymentTransactionWhereInput,
      data: args.data as Prisma.PaymentTransactionUpdateManyMutationInput,
    });
  }

  async findById(id: bigint, context?: PaymentPersistenceContext): Promise<PaymentTransactionRecord | null> {
    return this.db(context).paymentTransaction.findUnique({ where: { id } });
  }

  async update(
    id: bigint,
    data: PaymentTransactionCommand,
    context?: PaymentPersistenceContext,
  ): Promise<PaymentTransactionRecord> {
    return this.db(context).paymentTransaction.update({
      where: { id },
      data: data as Prisma.PaymentTransactionUpdateInput,
    });
  }

  async findMany(
    where: PaymentTransactionFilter,
    context?: PaymentPersistenceContext,
  ): Promise<PaymentTransactionRecord[]> {
    return this.db(context).paymentTransaction.findMany({ where: where as Prisma.PaymentTransactionWhereInput });
  }

  private db(context?: PaymentPersistenceContext) {
    return resolvePrismaClient(context, this.prisma);
  }
}
