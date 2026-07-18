import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UNIT_OF_WORK, UnitOfWork } from '@/common/persistence';
import { createDomainEvent, DOMAIN_EVENTS } from '@/common/events/domain-event';
import { DomainEventPublisher } from '@/common/events/domain-event-publisher.service';
import { MessageRepository } from './message.repository';
import { MessageRenderer } from './message-renderer.service';
import {
  MESSAGE_CHANNELS,
  MESSAGE_LOCALES,
  MESSAGE_RECIPIENT_TYPES,
  MESSAGE_RECIPIENT_USER_TYPES,
} from './message.constants';
import {
  CreateMessageTemplateDto,
  PreviewMessageTemplateDto,
  UpdateMessageTemplateDto,
} from './dto/message-template.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly repository: MessageRepository,
    private readonly renderer: MessageRenderer,
    @Inject(UNIT_OF_WORK) private readonly unitOfWork: UnitOfWork,
    private readonly events: DomainEventPublisher,
  ) {}

  listTemplates(query: Record<string, unknown>) {
    return this.repository.listTemplates(query).then((templates) =>
      templates.map((template) => ({
        ...template,
        validation: this.validateTemplateShape(
          template.channel,
          template.content as MessageContent,
          template.variables,
        ),
      })),
    );
  }

  async getTemplate(id: bigint) {
    const template = await this.repository.getTemplate(id);
    if (!template) throw new NotFoundException('Message template not found');
    return template;
  }

  createTemplate(dto: CreateMessageTemplateDto) {
    this.assertTemplateValid(dto.channel, dto.content, dto.variables);
    return this.repository.createTemplate({
      key: dto.key,
      name: dto.name,
      channel: dto.channel,
      purpose: dto.purpose,
      content: dto.content,
      variables: dto.variables,
      isActive: dto.isActive ?? true,
    });
  }

  async updateTemplate(id: bigint, dto: UpdateMessageTemplateDto) {
    const existing = await this.getTemplate(id);
    this.assertTemplateValid(
      dto.channel ?? existing.channel,
      (dto.content ?? existing.content) as MessageContent,
      dto.variables ?? existing.variables ?? undefined,
    );
    return this.repository.updateTemplate(id, {
      name: dto.name,
      channel: dto.channel,
      purpose: dto.purpose,
      content: dto.content,
      variables: dto.variables,
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
    this.assertTemplateUsable(template, dto.variables ?? {});
    const rendered = this.renderer.render(template.content as MessageContent, dto.variables ?? {}, dto.locale ?? 'en');
    return {
      ...(channel === MESSAGE_CHANNELS.email || channel === MESSAGE_CHANNELS.both
        ? {
            email: {
              subject: dto.titleOverride ?? rendered.subject,
              html: rendered.html,
              text: rendered.body,
            },
          }
        : {}),
      ...(channel === MESSAGE_CHANNELS.notification || channel === MESSAGE_CHANNELS.both
        ? {
            notification: {
              title: dto.titleOverride ?? rendered.title,
              body: rendered.body,
            },
          }
        : {}),
    };
  }

  async verifyTemplate(id: bigint, dto: PreviewMessageTemplateDto) {
    const template = await this.getTemplate(id);
    const channel = dto.channel ?? template.channel;
    this.assertChannelAllowed(template.channel, channel);
    const validation = this.validateTemplateShape(
      channel,
      template.content as MessageContent,
      template.variables,
      dto.variables ?? {},
    );
    if (!validation.isValid) {
      throw new BadRequestException(`Message template is invalid: ${validation.errors.join('; ')}`);
    }
    return validation;
  }

  async send(dto: SendMessageDto, senderId?: bigint) {
    const template = await this.getTemplate(BigInt(dto.templateId));
    if (!template.isActive) throw new BadRequestException('Message template is inactive');
    this.assertChannelAllowed(template.channel, dto.channel);
    this.assertTemplateUsable(template, dto.variables ?? {});

    const users = await this.resolveRecipients(dto);
    if (users.length === 0) throw new BadRequestException('No recipients found');
    const channels = this.deliveryChannels(dto.channel);
    const recipients = users.map((user) => ({ userId: user.id, email: user.email, channels }));

    return this.unitOfWork.execute(async (context) => {
      const campaign = await this.repository.createCampaign(context, {
        templateId: template.id,
        senderId,
        channel: dto.channel,
        locale: dto.locale ?? MESSAGE_LOCALES.profile,
        recipientType: dto.recipientType,
        recipientUserType: dto.recipientUserType,
        titleOverride: dto.titleOverride,
        variables: dto.variables,
        templateSnapshot: {
          id: template.id.toString(),
          key: template.key,
          name: template.name,
          channel: template.channel,
          purpose: template.purpose,
          content: template.content,
        },
        recipients,
      });

      await this.events.publish(
        createDomainEvent({
          eventName: DOMAIN_EVENTS.messageCampaignRequested,
          aggregateType: 'message_campaign',
          aggregateId: campaign.id.toString(),
          payload: { campaignId: campaign.id.toString() },
        }),
        context,
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
    const where: { isActive: boolean; userType?: string; ids?: bigint[] } = { isActive: true };
    if (dto.recipientType === MESSAGE_RECIPIENT_TYPES.admin) where.userType = 'admin';
    if (dto.recipientType === MESSAGE_RECIPIENT_TYPES.client) where.userType = 'client';
    if (dto.recipientType === MESSAGE_RECIPIENT_TYPES.specific) {
      if (!dto.recipientIds?.length) throw new BadRequestException('recipientIds are required for specific sends');
      if (!dto.recipientUserType) {
        throw new BadRequestException('recipientUserType is required for specific sends');
      }
      if (!Object.values(MESSAGE_RECIPIENT_USER_TYPES).some((type) => type === dto.recipientUserType)) {
        throw new BadRequestException('recipientUserType must be client or admin');
      }
      const ids = dto.recipientIds.map((id) => BigInt(id));
      where.userType = dto.recipientUserType;
      where.ids = ids;
      const users = await this.repository.findRecipients(where);
      if (users.length !== new Set(ids.map((id) => id.toString())).size) {
        throw new BadRequestException(
          `One or more selected ${dto.recipientUserType} recipients were not found, inactive, or belong to another user type`,
        );
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

  private assertTemplateUsable(
    template: { channel: string; content: unknown; variables: unknown },
    values: Record<string, unknown>,
  ) {
    const result = this.validateTemplateShape(
      template.channel,
      template.content as MessageContent,
      template.variables,
      values,
    );
    if (!result.isValid) {
      throw new BadRequestException(`Message template is invalid: ${result.errors.join('; ')}`);
    }
  }

  private assertTemplateValid(channel: string, content: MessageContent, variables: unknown) {
    const result = this.validateTemplateShape(channel, content, variables);
    if (!result.isValid) {
      throw new BadRequestException(`Message template is invalid: ${result.errors.join('; ')}`);
    }
  }

  private validateTemplateShape(
    channel: string,
    content: MessageContent,
    variables: unknown,
    values?: Record<string, unknown>,
  ) {
    const errors: string[] = [];
    const declaredVariables = new Set(Object.keys(this.asVariableMap(variables)));
    const usedVariables = new Set<string>();

    for (const locale of ['en', 'ar'] as const) {
      const localized = content?.[locale];
      if (!localized) {
        errors.push(`${locale} content is required`);
        continue;
      }

      if ((channel === MESSAGE_CHANNELS.email || channel === MESSAGE_CHANNELS.both) && !this.hasText(localized.body)) {
        errors.push(`${locale} body is required for email`);
      }
      if (
        (channel === MESSAGE_CHANNELS.email || channel === MESSAGE_CHANNELS.both) &&
        !this.hasText(localized.subject) &&
        !this.hasText(localized.html)
      ) {
        errors.push(`${locale} subject or html is required for email`);
      }
      if (
        (channel === MESSAGE_CHANNELS.notification || channel === MESSAGE_CHANNELS.both) &&
        !this.hasText(localized.title)
      ) {
        errors.push(`${locale} title is required for notification`);
      }
      if (
        (channel === MESSAGE_CHANNELS.notification || channel === MESSAGE_CHANNELS.both) &&
        !this.hasText(localized.body)
      ) {
        errors.push(`${locale} body is required for notification`);
      }

      for (const variable of this.extractVariables([
        localized.subject,
        localized.title,
        localized.body,
        localized.html,
      ])) {
        usedVariables.add(variable);
      }
    }

    for (const variable of usedVariables) {
      if (!declaredVariables.has(variable)) {
        errors.push(`{{ ${variable} }} is used but not declared`);
      }
      if (values && (values[variable] === undefined || values[variable] === null || values[variable] === '')) {
        errors.push(`{{ ${variable} }} value is required`);
      }
    }

    return { isValid: errors.length === 0, errors, usedVariables: Array.from(usedVariables) };
  }

  private extractVariables(values: Array<string | null | undefined>) {
    const variables = new Set<string>();
    for (const value of values) {
      if (!value) continue;
      for (const match of value.matchAll(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g)) {
        if (match[1]) variables.add(match[1]);
      }
    }
    return variables;
  }

  private asVariableMap(variables: unknown) {
    return variables && typeof variables === 'object' && !Array.isArray(variables)
      ? (variables as Record<string, unknown>)
      : {};
  }

  private hasText(value: unknown) {
    return typeof value === 'string' && value.trim().length > 0;
  }
}

type MessageContent = {
  en?: { subject?: string | null; title?: string | null; body?: string | null; html?: string | null };
  ar?: { subject?: string | null; title?: string | null; body?: string | null; html?: string | null };
};
