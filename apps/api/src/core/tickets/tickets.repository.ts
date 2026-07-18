import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService, resolvePrismaClient } from '@/prisma';
import { TransactionContext } from '@/common/persistence';

export type TicketSummary = Prisma.TicketGetPayload<{
  include: { user: true; _count: { select: { messages: true } } };
}>;
export type TicketListItem = Prisma.TicketGetPayload<{
  include: {
    user: true;
    messages: { orderBy: { createdAt: 'desc' }; take: 1 };
    _count: { select: { messages: true } };
  };
}>;
export type TicketMessageWithUser = Prisma.TicketMessageGetPayload<{ include: { user: true } }>;
export type TicketWhere = Prisma.TicketWhereInput;
export type TicketOrderBy = Prisma.TicketOrderByWithRelationInput;

@Injectable()
export class TicketsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany<T extends Prisma.TicketFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TicketFindManyArgs>,
    context?: TransactionContext,
  ): Promise<Array<Prisma.TicketGetPayload<T>>> {
    return resolvePrismaClient(context, this.prisma).ticket.findMany(args);
  }

  count(where: Prisma.TicketWhereInput, context?: TransactionContext) {
    return resolvePrismaClient(context, this.prisma).ticket.count({ where });
  }

  findFirst<T extends Prisma.TicketFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.TicketFindFirstArgs>,
    context?: TransactionContext,
  ): Promise<Prisma.TicketGetPayload<T> | null> {
    return resolvePrismaClient(context, this.prisma).ticket.findFirst(args);
  }

  create<T extends Prisma.TicketCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TicketCreateArgs>,
    context?: TransactionContext,
  ): Promise<Prisma.TicketGetPayload<T>> {
    return resolvePrismaClient(context, this.prisma).ticket.create(args);
  }

  update<T extends Prisma.TicketUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TicketUpdateArgs>,
    context?: TransactionContext,
  ): Promise<Prisma.TicketGetPayload<T>> {
    return resolvePrismaClient(context, this.prisma).ticket.update(args);
  }

  delete<T extends Prisma.TicketDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.TicketDeleteArgs>,
    context?: TransactionContext,
  ): Promise<Prisma.TicketGetPayload<T>> {
    return resolvePrismaClient(context, this.prisma).ticket.delete(args);
  }

  createMessage<T extends Prisma.TicketMessageCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TicketMessageCreateArgs>,
    context?: TransactionContext,
  ): Promise<Prisma.TicketMessageGetPayload<T>> {
    return resolvePrismaClient(context, this.prisma).ticketMessage.create(args);
  }

  findMessages<T extends Prisma.TicketMessageFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TicketMessageFindManyArgs>,
    context?: TransactionContext,
  ): Promise<Array<Prisma.TicketMessageGetPayload<T>>> {
    return resolvePrismaClient(context, this.prisma).ticketMessage.findMany(args);
  }

  countMessages(where: Prisma.TicketMessageWhereInput, context?: TransactionContext) {
    return resolvePrismaClient(context, this.prisma).ticketMessage.count({ where });
  }
}
