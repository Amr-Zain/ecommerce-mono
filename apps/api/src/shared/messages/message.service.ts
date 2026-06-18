import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaService } from '@/prisma';
import { createDomainEvent, DOMAIN_EVENTS } from '@/common/events/domain-event';
import { DomainEventPublisher } from '@/common/events/domain-event-publisher.service';
import { MessageRepository } from './message.repository';
import { MessageRenderer } from './message-renderer.service';
import { MESSAGE_CHANNELS, MESSAGE_RECIPIENT_TYPES } from './message.constants';
import { CreateMessageTemplateDto, PreviewMessageTemplateDto, UpdateMessageTemplateDto } from './dto/message-template.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly repository: MessageRepository,
    private readonly renderer: MessageRenderer,
    private readonly prisma: PrismaService,
    private readonly events: DomainEventPublisher,
  ) {}

  listTemplates(query: Record<string, unknown>) {
    return this.repository.listTemplates(query);
  }

  async getTemplate(id: bigint) {
    const template = await this.repository.getTemplate(id);
    if (!template) throw new NotFoundException('Message template not found');
    return template;
  }

  createTemplate(dto: CreateMessageTemplateDto) {
    return this.repository.createTemplate({
      key: dto.key,
      name: dto.name,
      channel: dto.channel,
      purpose: dto.purpose,
      content: dto.content as unknown as Prisma.InputJsonValue,
      variables: dto.variables as Prisma.InputJsonValue | undefined,
      isActive: dto.isActive ?? true,
    });
  }

  async updateTemplate(id: bigint, dto: UpdateMessageTemplateDto) {
    await this.getTemplate(id);
    return this.repository.updateTemplate(id, {
      name: dto.name,
      channel: dto.channel,
      purpose: dto.purpose,
      content: dto.content as unknown as Prisma.InputJsonValue | undefined,
      variables: dto.variables as Prisma.InputJsonValue | undefined,
      isActive: dto.isActive,
    });
  }

  async deleteTemplate(id: bigint) {
    await this.getTemplate(id);
    return this.repository.deleteTemplate(id);
  }

  async previewTemplate(id: bigint, dto: PreviewMessageTemplateDto) {
    const template = await this.getTemplate(id);
    const channel = dto.channel ?? template.channel;
    this.assertChannelAllowed(template.channel, channel);
    const rendered = this.renderer.render(template.content as any, dto.variables ?? {}, dto.locale ?? 'en');
    return {
      ...(channel === MESSAGE_CHANNELS.email || channel === MESSAGE_CHANNELS.both
        ? {
            email: {
              subject: rendered.subject,
              html: rendered.html,
              text: rendered.body,
            },
          }
        : {}),
      ...(channel === MESSAGE_CHANNELS.notification || channel === MESSAGE_CHANNELS.both
        ? {
            notification: {
              title: rendered.title,
              body: rendered.body,
            },
          }
        : {}),
    };
  }

  async send(dto: SendMessageDto, senderId?: bigint) {
    const template = await this.getTemplate(BigInt(dto.templateId));
    if (!template.isActive) throw new BadRequestException('Message template is inactive');
    this.assertChannelAllowed(template.channel, dto.channel);

    const users = await this.resolveRecipients(dto);
    if (users.length === 0) throw new BadRequestException('No recipients found');
    const channels = this.deliveryChannels(dto.channel);
    const recipients = users.map((user) => ({ userId: user.id, email: user.email, channels }));

    return this.prisma.$transaction(async (tx) => {
      const campaign = await this.repository.createCampaign(tx, {
        templateId: template.id,
        senderId,
        channel: dto.channel,
        recipientType: dto.recipientType,
        titleOverride: dto.titleOverride,
        variables: dto.variables,
        templateSnapshot: {
          id: template.id.toString(),
          key: template.key,
          name: template.name,
          channel: template.channel,
          purpose: template.purpose,
          content: template.content,
        } as Prisma.InputJsonValue,
        recipients,
      });

      await this.events.publish(
        createDomainEvent({
          eventName: DOMAIN_EVENTS.messageCampaignRequested,
          aggregateType: 'message_campaign',
          aggregateId: campaign.id.toString(),
          payload: { campaignId: campaign.id.toString() },
        }),
        tx,
      );

      return campaign;
    });
  }

  listCampaigns() {
    return this.repository.listCampaigns();
  }

  async getCampaign(id: bigint) {
    const campaign = await this.repository.getCampaign(id);
    if (!campaign) throw new NotFoundException('Message campaign not found');
    return campaign;
  }

  private async resolveRecipients(dto: SendMessageDto) {
    const where: Prisma.UserWhereInput = { isActive: true };
    if (dto.recipientType === MESSAGE_RECIPIENT_TYPES.admin) where.userType = 'admin';
    if (dto.recipientType === MESSAGE_RECIPIENT_TYPES.client) where.userType = 'client';
    if (dto.recipientType === MESSAGE_RECIPIENT_TYPES.specific) {
      if (!dto.recipientIds?.length) throw new BadRequestException('recipientIds are required for specific sends');
      const ids = dto.recipientIds.map((id) => BigInt(id));
      where.id = { in: ids };
      const users = await this.repository.findRecipients(where);
      if (users.length !== new Set(ids.map((id) => id.toString())).size) {
        throw new BadRequestException('One or more specific recipients were not found or are inactive');
      }
      return users;
    }
    return this.repository.findRecipients(where);
  }

  private assertChannelAllowed(templateChannel: string, requestedChannel: string) {
    if (requestedChannel === MESSAGE_CHANNELS.both && templateChannel !== MESSAGE_CHANNELS.both) {
      throw new BadRequestException('Template does not support both channels');
    }
    if (templateChannel !== MESSAGE_CHANNELS.both && requestedChannel !== templateChannel) {
      throw new BadRequestException('Template does not support the requested channel');
    }
  }

  private deliveryChannels(channel: string) {
    return channel === MESSAGE_CHANNELS.both ? [MESSAGE_CHANNELS.email, MESSAGE_CHANNELS.notification] : [channel];
  }
}
