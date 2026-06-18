import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma';

@Injectable()
export class TicketsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany<T extends Prisma.TicketFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TicketFindManyArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Array<Prisma.TicketGetPayload<T>>> {
    return tx.ticket.findMany(args as Prisma.TicketFindManyArgs) as Promise<Array<Prisma.TicketGetPayload<T>>>;
  }

  count(where: Prisma.TicketWhereInput, tx: Prisma.TransactionClient = this.prisma) {
    return tx.ticket.count({ where });
  }

  findFirst<T extends Prisma.TicketFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.TicketFindFirstArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.TicketGetPayload<T> | null> {
    return tx.ticket.findFirst(args as Prisma.TicketFindFirstArgs) as Promise<Prisma.TicketGetPayload<T> | null>;
  }

  create<T extends Prisma.TicketCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TicketCreateArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.TicketGetPayload<T>> {
    return tx.ticket.create(args as Prisma.TicketCreateArgs) as unknown as Promise<Prisma.TicketGetPayload<T>>;
  }

  update<T extends Prisma.TicketUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TicketUpdateArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.TicketGetPayload<T>> {
    return tx.ticket.update(args as Prisma.TicketUpdateArgs) as unknown as Promise<Prisma.TicketGetPayload<T>>;
  }

  delete<T extends Prisma.TicketDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.TicketDeleteArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.TicketGetPayload<T>> {
    return tx.ticket.delete(args as Prisma.TicketDeleteArgs) as unknown as Promise<Prisma.TicketGetPayload<T>>;
  }

  createMessage<T extends Prisma.TicketMessageCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TicketMessageCreateArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.TicketMessageGetPayload<T>> {
    return tx.ticketMessage.create(args as Prisma.TicketMessageCreateArgs) as unknown as Promise<
      Prisma.TicketMessageGetPayload<T>
    >;
  }

  findMessages<T extends Prisma.TicketMessageFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TicketMessageFindManyArgs>,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<Array<Prisma.TicketMessageGetPayload<T>>> {
    return tx.ticketMessage.findMany(args as Prisma.TicketMessageFindManyArgs) as Promise<
      Array<Prisma.TicketMessageGetPayload<T>>
    >;
  }

  countMessages(where: Prisma.TicketMessageWhereInput, tx: Prisma.TransactionClient = this.prisma) {
    return tx.ticketMessage.count({ where });
  }
}
