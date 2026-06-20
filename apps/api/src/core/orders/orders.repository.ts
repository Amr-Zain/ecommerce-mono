import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@/common/repositories/base.repository';
import {
  AdminOrderRecord,
  ClientOrderRecord,
  IOrdersRepository,
  Order,
  OrderLifecycleRecord,
} from '@/common/interfaces/orders.interface';
import { PrismaService } from '@/prisma';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';

@Injectable()
export class OrdersRepository extends BaseRepository<Order> implements IOrdersRepository {
  constructor(prisma: PrismaService) {
    super(prisma, undefined, undefined);
  }

  protected getModel() {
    return this.prisma.order;
  }

  async findAdminOrders(
    query: AdvancedQueryDto,
    where: Prisma.OrderWhereInput,
    langId: string,
  ): Promise<PaginatedResult<AdminOrderRecord> | AdminOrderRecord[]> {
    const include = {
      items: { include: { translations: { where: { langId } } } },
      payments: true,
      user: true,
      statusHistory: { orderBy: { createdAt: 'asc' as const } },
    };

    if (query.paginate === false) {
      return this.prisma.order.findMany({
        where,
        include,
        orderBy: { createdAt: 'desc' },
      });
    }

    const result = await this.paginate(
      {
        ...query,
        sort: Object.keys(query.sort ?? {}).length > 0 ? query.sort : { createdAt: 'desc' },
      },
      where,
      { include },
    );
    return result as PaginatedResult<AdminOrderRecord>;
  }

  findAdminOrderById(id: bigint, langId: string): Promise<AdminOrderRecord | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { translations: { where: { langId } } } },
        payments: true,
        user: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  findClientOrders(userId: bigint, status: string | undefined, langId: string): Promise<ClientOrderRecord[]> {
    return this.prisma.order.findMany({
      where: { userId, ...(status ? { status } : {}) },
      include: {
        items: { include: { translations: { where: { langId } } } },
        payments: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findClientOrderById(userId: bigint, id: bigint, langId: string): Promise<ClientOrderRecord | null> {
    return this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: { include: { translations: { where: { langId } } } },
        payments: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  findLifecycleOrder(id: bigint, tx: Prisma.TransactionClient = this.prisma): Promise<OrderLifecycleRecord | null> {
    return tx.order.findUnique({ where: { id }, include: { items: true, payments: true } });
  }

  findOrderWithPayments(id: bigint, tx: Prisma.TransactionClient = this.prisma) {
    return tx.order.findUnique({ where: { id }, include: { payments: true } });
  }

  async lock(id: bigint, tx: Prisma.TransactionClient) {
    await tx.$queryRaw`SELECT id FROM orders WHERE id = ${id} FOR UPDATE`;
  }

  async updateOrder(
    id: bigint,
    data: Prisma.OrderUpdateInput,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Order> {
    return tx.order.update({ where: { id }, data });
  }

  async createStatusHistory(
    input: {
      orderId: bigint;
      previousStatus?: string | null;
      newStatus: string;
      actorType: string;
      actorUserId?: bigint;
      reason?: string;
      metadata?: unknown;
    },
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    const toJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;
    return tx.orderStatusHistory.create({
      data: {
        orderId: input.orderId,
        previousStatus: input.previousStatus,
        newStatus: input.newStatus,
        actorType: input.actorType,
        actorUserId: input.actorUserId,
        reason: input.reason,
        metadata: input.metadata ? toJson(input.metadata) : undefined,
      },
    });
  }

  findOrderItemsWithOrder(ids: bigint[], tx: Prisma.TransactionClient = this.prisma) {
    return tx.orderItem.findMany({ where: { id: { in: ids } }, include: { order: true } });
  }

  async lockOrderItem(id: bigint, tx: Prisma.TransactionClient) {
    await tx.$queryRaw`SELECT id FROM order_items WHERE id = ${id} FOR UPDATE`;
  }
}
