import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService, resolvePrismaClient } from '@/prisma';
import { TransactionContext } from '@/common/persistence';
import { MESSAGE_STATUSES } from './message.constants';

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  listTemplates(query: Record<string, unknown>) {
    const where: Prisma.MessageTemplateWhereInput = {};
    if (typeof query.channel === 'string') where.channel = query.channel;
    if (typeof query.purpose === 'string') where.purpose = query.purpose;
    if (query.isActive !== undefined)
      where.isActive = query.isActive === true || query.isActive === 'true' || query.isActive === '1';
    if (query.search) {
      const search = typeof query.search === 'string' ? query.search : '';
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.messageTemplate.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  createTemplate(data: {
    key: string;
    name: string;
    channel: string;
    purpose: string;
    content: unknown;
    variables?: unknown;
    isActive: boolean;
  }) {
    return this.prisma.messageTemplate.create({
      data: {
        ...data,
        content: data.content as Prisma.InputJsonValue,
        variables: data.variables as Prisma.InputJsonValue | undefined,
      },
    });
  }

  updateTemplate(id: bigint, data: Record<string, unknown>) {
    return this.prisma.messageTemplate.update({
      where: { id },
      data: data as Prisma.MessageTemplateUpdateInput,
    });
  }

  getTemplate(id: bigint) {
    return this.prisma.messageTemplate.findUnique({ where: { id } });
  }

  findTemplateByKey(key: string) {
    return this.prisma.messageTemplate.findUnique({ where: { key } });
  }

  deleteTemplate(id: bigint) {
    return this.prisma.messageTemplate.delete({ where: { id } });
  }

  findRecipients(filter: { isActive: boolean; userType?: string; ids?: bigint[] }) {
    return this.prisma.user.findMany({
      where: {
        isActive: filter.isActive,
        ...(filter.userType ? { userType: filter.userType } : {}),
        ...(filter.ids ? { id: { in: filter.ids } } : {}),
      },
      select: { id: true, email: true, name: true, userType: true, isActive: true, settings: true },
      orderBy: { id: 'asc' },
    });
  }

  createCampaign(
    context: TransactionContext,
    input: {
      templateId: bigint;
      senderId?: bigint;
      channel: string;
      locale: string;
      recipientType: string;
      recipientUserType?: string;
      titleOverride?: string;
      variables?: Record<string, unknown>;
      templateSnapshot: Prisma.InputJsonValue;
      recipients: { userId: bigint; email: string | null; channels: string[] }[];
    },
  ) {
    const rows = input.recipients.flatMap((recipient) =>
      recipient.channels.map((channel) => ({
        userId: recipient.userId,
        email: recipient.email,
        channel,
        status: channel === 'email' && !recipient.email ? MESSAGE_STATUSES.skipped : MESSAGE_STATUSES.queued,
        error: channel === 'email' && !recipient.email ? 'Missing email address' : undefined,
      })),
    );
    return resolvePrismaClient(context, this.prisma).messageCampaign.create({
      data: {
        templateId: input.templateId,
        senderId: input.senderId,
        channel: input.channel,
        locale: input.locale,
        recipientType: input.recipientType,
        recipientUserType: input.recipientUserType,
        titleOverride: input.titleOverride,
        variables: input.variables as Prisma.InputJsonValue | undefined,
        templateSnapshot: input.templateSnapshot,
        queuedCount: rows.filter((row) => row.status === MESSAGE_STATUSES.queued).length,
        skippedCount: rows.filter((row) => row.status === MESSAGE_STATUSES.skipped).length,
        recipients: { createMany: { data: rows } },
      },
    });
  }

  listCampaigns() {
    return this.prisma.messageCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        template: { select: { id: true, key: true, name: true } },
        sender: { select: { id: true, name: true } },
      },
    });
  }

  getCampaign(id: bigint) {
    return this.prisma.messageCampaign.findUnique({
      where: { id },
      include: {
        template: true,
        sender: { select: { id: true, name: true } },
        recipients: {
          include: { user: { select: { id: true, name: true, email: true, userType: true, settings: true } } },
          orderBy: { id: 'asc' },
        },
      },
    });
  }

  pendingRecipients(campaignId: bigint) {
    return this.prisma.messageCampaignRecipient.findMany({
      where: { campaignId, status: MESSAGE_STATUSES.queued },
      include: {
        user: { select: { id: true, name: true, email: true, userType: true, settings: true } },
        campaign: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  updateRecipient(id: bigint, data: Prisma.MessageCampaignRecipientUpdateInput) {
    return this.prisma.messageCampaignRecipient.update({ where: { id }, data });
  }

  async refreshCampaignCounts(campaignId: bigint) {
    const grouped = await this.prisma.messageCampaignRecipient.groupBy({
      by: ['status'],
      where: { campaignId },
      _count: { _all: true },
    });
    const count = (status: string) => grouped.find((item) => item.status === status)?._count._all ?? 0;
    const failed = count(MESSAGE_STATUSES.failed);
    await this.prisma.messageCampaign.update({
      where: { id: campaignId },
      data: {
        queuedCount: count(MESSAGE_STATUSES.queued),
        sentCount: count(MESSAGE_STATUSES.sent),
        failedCount: failed,
        skippedCount: count(MESSAGE_STATUSES.skipped),
        status: failed > 0 ? MESSAGE_STATUSES.completedWithFailures : MESSAGE_STATUSES.completed,
      },
    });
  }
}
