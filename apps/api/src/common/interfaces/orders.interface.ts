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
  findOrderWithPayments(
    id: bigint,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.OrderGetPayload<{ include: { payments: true } }> | null>;
  lock(id: bigint, tx: Prisma.TransactionClient): Promise<void>;
  updateOrder(id: bigint, data: Prisma.OrderUpdateInput, tx?: Prisma.TransactionClient): Promise<Order>;
  createStatusHistory(
    input: {
      orderId: bigint;
      previousStatus?: string | null;
      newStatus: string;
      actorType: string;
      actorUserId?: bigint;
      reason?: string;
      metadata?: unknown;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.OrderStatusHistoryGetPayload<Record<string, never>>>;
  findOrderItemsWithOrder(ids: bigint[], tx?: Prisma.TransactionClient): Promise<any[]>;
  lockOrderItem(id: bigint, tx: Prisma.TransactionClient): Promise<void>;
}
