import { Prisma, PaymentTransaction } from '@prisma/client';

export const PAYMENT_TRANSACTIONS_REPOSITORY = 'PAYMENT_TRANSACTIONS_REPOSITORY';

export interface IPaymentTransactionsRepository {
  create(
    data: Prisma.PaymentTransactionUncheckedCreateInput | Prisma.PaymentTransactionCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PaymentTransaction>;

  findFirst(
    where: Prisma.PaymentTransactionWhereInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PaymentTransaction | null>;

  updateMany(
    args: {
      where: Prisma.PaymentTransactionWhereInput;
      data: Prisma.PaymentTransactionUpdateManyMutationInput;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload>;

  findById(
    id: bigint,
    tx?: Prisma.TransactionClient,
  ): Promise<PaymentTransaction | null>;

  update(
    id: bigint,
    data: Prisma.PaymentTransactionUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PaymentTransaction>;

  findMany(
    where: Prisma.PaymentTransactionWhereInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PaymentTransaction[]>;
}
