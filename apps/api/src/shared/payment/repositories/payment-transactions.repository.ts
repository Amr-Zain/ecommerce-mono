import { Injectable } from '@nestjs/common';
import { Prisma, PaymentTransaction } from '@prisma/client';
import { PrismaService } from '@/prisma';
import { IPaymentTransactionsRepository } from '@/common/interfaces/payment-transactions.interface';

@Injectable()
export class PaymentTransactionsRepository implements IPaymentTransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst(
    where: Prisma.PaymentTransactionWhereInput,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<PaymentTransaction | null> {
    return tx.paymentTransaction.findFirst({ where });
  }

  async create(
    data: Prisma.PaymentTransactionUncheckedCreateInput | Prisma.PaymentTransactionCreateInput,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<PaymentTransaction> {
    return tx.paymentTransaction.create({ data });
  }

  async updateMany(
    args: {
      where: Prisma.PaymentTransactionWhereInput;
      data: Prisma.PaymentTransactionUpdateManyMutationInput;
    },
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.BatchPayload> {
    return tx.paymentTransaction.updateMany(args);
  }

  async findById(
    id: bigint,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<PaymentTransaction | null> {
    return tx.paymentTransaction.findUnique({ where: { id } });
  }

  async update(
    id: bigint,
    data: Prisma.PaymentTransactionUpdateInput,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<PaymentTransaction> {
    return tx.paymentTransaction.update({ where: { id }, data });
  }

  async findMany(
    where: Prisma.PaymentTransactionWhereInput,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<PaymentTransaction[]> {
    return tx.paymentTransaction.findMany({ where });
  }
}
