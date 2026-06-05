import { Prisma } from '@prisma/client';
import { IBaseRepository } from './base.repository.interface';

export type Order = Prisma.OrderGetPayload<Record<string, never>>;

export type AdminOrderRecord = Prisma.OrderGetPayload<{
  include: {
    items: { include: { translations: true } };
    payments: true;
    user: true;
    statusHistory: true;
  };
}>;

export type ClientOrderRecord = Prisma.OrderGetPayload<{
  include: {
    items: { include: { translations: true } };
    payments: true;
    statusHistory: true;
  };
}>;

export type OrderLifecycleRecord = Prisma.OrderGetPayload<{
  include: { items: true; payments: true };
}>;

export const ORDERS_REPOSITORY = 'ORDERS_REPOSITORY';

export interface IOrdersRepository extends IBaseRepository<Order> {
  findAdminOrders(where: Prisma.OrderWhereInput, langId: string): Promise<AdminOrderRecord[]>;
  findAdminOrderById(id: bigint, langId: string): Promise<AdminOrderRecord | null>;
  findClientOrders(userId: bigint, status: string | undefined, langId: string): Promise<ClientOrderRecord[]>;
  findClientOrderById(userId: bigint, id: bigint, langId: string): Promise<ClientOrderRecord | null>;
  findLifecycleOrder(id: bigint, tx?: Prisma.TransactionClient): Promise<OrderLifecycleRecord | null>;
  findOrderWithPayments(id: bigint, tx?: Prisma.TransactionClient): Promise<Prisma.OrderGetPayload<{ include: { payments: true } }> | null>;
  lock(id: bigint, tx: Prisma.TransactionClient): Promise<void>;
}
