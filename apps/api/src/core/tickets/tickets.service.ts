import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma';
import { MediaService } from '@/media/media.service';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { NotificationService } from '@/shared/notifications/notification.service';
import { CreateTicketDto, ReplyTicketDto, TICKET_STATUSES, TicketStatus, UpdateTicketDto } from './dto/ticket.dto';
import { TicketsRepository } from './tickets.repository';

type TicketSummary = Prisma.TicketGetPayload<{
  include: {
    user: true;
    _count: {
      select: { messages: true };
    };
  };
}>;

type TicketListItem = Prisma.TicketGetPayload<{
  include: {
    user: true;
    messages: {
      orderBy: { createdAt: 'desc' };
      take: 1;
    };
    _count: {
      select: { messages: true };
    };
  };
}>;

type TicketMessageWithUser = Prisma.TicketMessageGetPayload<{
  include: {
    user: true;
  };
}>;

const TICKET_STATUS_ORDER: Record<TicketStatus, number> = {
  open: 0,
  pending: 1,
  resolved: 2,
  closed: 3,
};

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
    private readonly ticketsRepository: TicketsRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async findClientTickets(userId: bigint) {
    const tickets = await this.ticketsRepository.findMany({
      where: { userId },
      include: {
        user: true,
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return tickets.map((ticket) => this.formatListItem(ticket));
  }

  async findClientTicket(userId: bigint, id: bigint) {
    const ticket = await this.findTicketSummaryOrThrow({ id, userId });
    return this.formatTicket(ticket);
  }

  async createClientTicket(userId: bigint, dto: CreateTicketDto) {
    const ticket = await this.prisma.$transaction(async (tx) => {
      const created = await this.ticketsRepository.create(
        {
          data: {
            userId,
            title: dto.title,
            description: dto.description,
            messages: {
              create: {
                userId,
                senderType: 'client',
                body: dto.description,
              },
            },
          },
          include: {
            user: true,
            messages: { include: { user: true }, orderBy: { createdAt: 'asc' } },
          },
        },
        tx,
      );

      await this.attachMessageMedia(created.messages[0].id, dto.attachments, tx);
      return created;
    });

    return this.formatTicket(await this.findTicketSummaryById(ticket.id));
  }

  async createClientReply(userId: bigint, id: bigint, dto: ReplyTicketDto) {
    const ticket = await this.ticketsRepository.findFirst({ where: { id, userId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    this.assertTicketCanReceiveReply(ticket.status as TicketStatus);

    await this.createMessage(id, userId, 'client', dto);
    await this.ticketsRepository.update({ where: { id }, data: { status: 'open' } });
    return this.findClientTicket(userId, id);
  }

  async findAdminTickets(query: AdvancedQueryDto = {}) {
    const where = this.buildWhere(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [tickets, total] = await Promise.all([
      this.ticketsRepository.findMany({
        where,
        include: {
          user: true,
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          _count: { select: { messages: true } },
        },
        orderBy: this.buildOrderBy(query),
        skip: query.paginate === false ? undefined : (page - 1) * limit,
        take: query.paginate === false ? undefined : limit,
      }),
      query.paginate === false ? Promise.resolve(0) : this.ticketsRepository.count(where),
    ]);
    const data = tickets.map((ticket) => this.formatListItem(ticket));
    if (query.paginate === false) return data;
    return { data, meta: { page, limit, total } };
  }

  async findAdminTicket(id: bigint) {
    return this.formatTicket(await this.findTicketSummaryById(id));
  }

  async updateAdminTicket(id: bigint, dto: UpdateTicketDto) {
    if (dto.status && !TICKET_STATUSES.includes(dto.status)) {
      throw new BadRequestException('Invalid ticket status');
    }
    const ticket = await this.findTicketSummaryById(id);
    if (dto.status && TICKET_STATUS_ORDER[dto.status] < TICKET_STATUS_ORDER[ticket.status as TicketStatus]) {
      throw new BadRequestException('Ticket status can only move forward');
    }
    await this.ticketsRepository.update({
      where: { id },
      data: {
        status: dto.status,
        closedAt: dto.status === 'closed' ? new Date() : dto.status ? null : undefined,
      },
    });
    return this.findAdminTicket(id);
  }

  async deleteAdminTicket(id: bigint) {
    const ticket = await this.ticketsRepository.delete({ where: { id } });
    return { ...ticket, id: ticket.id.toString(), userId: ticket.userId.toString() };
  }

  async createAdminReply(adminId: bigint, id: bigint, dto: ReplyTicketDto) {
    const ticket = await this.findTicketSummaryById(id);
    this.assertTicketCanReceiveReply(ticket.status as TicketStatus);
    const message = await this.createMessage(id, adminId, 'admin', dto);
    await this.ticketsRepository.update({ where: { id }, data: { status: 'pending' } });
    await this.notifyUserOfAdminReply(ticket, message.id, message.body);
    return this.findAdminTicket(id);
  }

  async findClientMessages(userId: bigint, id: bigint, query: AdvancedQueryDto = {}) {
    await this.findTicketSummaryOrThrow({ id, userId });
    return this.findMessages(id, query);
  }

  async findAdminMessages(id: bigint, query: AdvancedQueryDto = {}) {
    await this.findTicketSummaryById(id);
    return this.findMessages(id, query);
  }

  private async createMessage(ticketId: bigint, userId: bigint, senderType: 'admin' | 'client', dto: ReplyTicketDto) {
    const message = await this.prisma.$transaction(async (tx) => {
      const created = await this.ticketsRepository.createMessage(
        {
          data: { ticketId, userId, senderType, body: dto.body },
        },
        tx,
      );
      await this.attachMessageMedia(created.id, dto.attachments, tx);
      await this.ticketsRepository.update({ where: { id: ticketId }, data: { updatedAt: new Date() } }, tx);
      return created;
    });
    return message;
  }

  private assertTicketCanReceiveReply(status: TicketStatus) {
    if (!['open', 'pending'].includes(status)) {
      throw new BadRequestException('Only open or pending tickets can receive replies');
    }
  }

  private async attachMessageMedia(
    messageId: bigint,
    attachments: Array<{ attachHash: string }> | undefined,
    tx: Prisma.TransactionClient,
  ) {
    const attachHashes = (attachments ?? []).map((item) => item.attachHash).filter(Boolean);
    if (attachHashes.length === 0) return;

    await this.mediaService.attachTempMediaMany(
      {
        model: 'ticketmessage',
        modelId: messageId.toString(),
        attachHashes,
      },
      tx,
    );
  }

  private async findTicketSummaryOrThrow(where: Prisma.TicketWhereInput) {
    const ticket = await this.ticketsRepository.findFirst({
      where,
      include: {
        user: true,
        _count: { select: { messages: true } },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  private findTicketSummaryById(id: bigint) {
    return this.findTicketSummaryOrThrow({ id });
  }

  private async findMessages(ticketId: bigint, query: AdvancedQueryDto = {}) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = { ticketId };
    const [messages, total] = await Promise.all([
      this.ticketsRepository.findMessages({
        where,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.ticketsRepository.countMessages(where),
    ]);

    return {
      data: await this.formatMessages(messages),
      meta: { page, limit, total },
    };
  }

  private buildWhere(query: AdvancedQueryDto): Prisma.TicketWhereInput {
    const filters = query.filters ?? {};
    const status = typeof filters.status === 'string' ? filters.status : undefined;
    return {
      ...(status ? { status } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
              { user: { name: { contains: query.search, mode: 'insensitive' } } },
              { user: { email: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
  }

  private buildOrderBy(query: AdvancedQueryDto): Prisma.TicketOrderByWithRelationInput {
    const [field, direction] = Object.entries(query.sort ?? {})[0] ?? ['updatedAt', 'desc'];
    const allowed = ['createdAt', 'updatedAt', 'status', 'title'];
    return { [allowed.includes(field) ? field : 'updatedAt']: direction === 'asc' ? 'asc' : 'desc' };
  }

  private async formatMessages(messages: TicketMessageWithUser[]) {
    const messageIds = messages.map((message) => message.id);
    const media = await this.mediaService.findByEntities('ticketmessage', messageIds);
    return messages.map((message) => ({
      id: message.id.toString(),
      ticketId: message.ticketId.toString(),
      userId: message.userId?.toString() ?? null,
      senderType: message.senderType,
      senderName: message.user?.name ?? (message.senderType === 'admin' ? 'Support' : 'Customer'),
      body: message.body,
      createdAt: message.createdAt,
      attachments: (media.get(message.id.toString()) ?? []).map((item) => ({
        ...item,
        path: this.mediaService.formatPath(item.path),
      })),
    }));
  }

  private async formatTicket(ticket: TicketSummary) {
    return {
      id: ticket.id.toString(),
      userId: ticket.userId.toString(),
      userName: ticket.user.name,
      userEmail: ticket.user.email,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      closedAt: ticket.closedAt,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      messageCount: ticket._count.messages,
    };
  }

  private notifyUserOfAdminReply(ticket: TicketSummary, messageId: bigint, messageBody: string) {
    return this.notificationService.createForUsers([ticket.userId], {
      eventId: `ticket:${ticket.id.toString()}:message:${messageId.toString()}`,
      notificationType: 'ticket_reply',
      titleKey: 'common.notification_ticket_reply_title',
      bodyKey: 'common.notification_ticket_reply_body',
      args: { title: ticket.title, body: messageBody },
      data: {
        entity: 'ticket',
        ticketId: ticket.id.toString(),
        messageId: messageId.toString(),
        messageBody,
      },
    });
  }

  private formatListItem(ticket: TicketListItem) {
    const lastMessage = ticket.messages[0];
    return {
      id: ticket.id.toString(),
      userId: ticket.userId.toString(),
      userName: ticket.user.name,
      userEmail: ticket.user.email,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      lastMessage: lastMessage?.body ?? ticket.description,
      messageCount: ticket._count.messages,
      closedAt: ticket.closedAt,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  }
}
