import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEvent, DOMAIN_EVENTS, MessageCampaignRequestedPayload } from '@/common/events/domain-event';
import { IdempotentEventConsumer } from '@/common/events/idempotent-event-consumer.service';
import { EmailService } from '@/shared/email/email.service';
import { NotificationService } from '@/shared/notifications/notification.service';
import { MESSAGE_CHANNELS, MESSAGE_STATUSES } from './message.constants';
import { MessageRenderer } from './message-renderer.service';
import { MessageRepository } from './message.repository';

@Injectable()
export class MessageDispatchListener {
  constructor(
    private readonly consumer: IdempotentEventConsumer,
    private readonly repository: MessageRepository,
    private readonly renderer: MessageRenderer,
    private readonly email: EmailService,
    private readonly notifications: NotificationService,
  ) {}

  @OnEvent(DOMAIN_EVENTS.messageCampaignRequested, { async: true, suppressErrors: false })
  dispatch(event: DomainEvent<MessageCampaignRequestedPayload>) {
    return this.consumer.run(event, 'MessageDispatch.campaign', async () => {
      const campaignId = BigInt(event.payload.campaignId);
      const campaign = await this.repository.getCampaign(campaignId);
      if (!campaign) return;

      const snapshot =
        campaign.templateSnapshot && typeof campaign.templateSnapshot === 'object'
          ? (campaign.templateSnapshot as MessageTemplateSnapshot)
          : {};
      const content = snapshot.content ?? {};
      const variables = (campaign.variables ?? {}) as Record<string, unknown>;
      const pending = await this.repository.pendingRecipients(campaignId);

      for (const recipient of pending) {
        try {
          const locale = this.resolveLocale(campaign.locale, recipient.user?.settings);
          const rendered = this.renderer.render(content, variables, locale);
          if (recipient.channel === MESSAGE_CHANNELS.email) {
            if (!recipient.email) {
              await this.repository.updateRecipient(recipient.id, {
                status: MESSAGE_STATUSES.skipped,
                error: 'Missing email address',
              });
              continue;
            }
            await this.email.sendRendered({
              to: recipient.email,
              subject: campaign.titleOverride ?? rendered.subject,
              html: rendered.html,
              text: rendered.body,
            });
          } else {
            await this.notifications.createRenderedForUsers([recipient.userId], {
              eventId: `${event.eventId}:${recipient.id.toString()}`,
              notificationType: 'message.campaign',
              title: campaign.titleOverride ?? rendered.title,
              body: rendered.body,
              data: { entity: { type: 'message_campaign', id: campaignId.toString() } },
            });
          }
          await this.repository.updateRecipient(recipient.id, {
            status: MESSAGE_STATUSES.sent,
            sentAt: new Date(),
            error: null,
          });
        } catch (error) {
          await this.repository.updateRecipient(recipient.id, {
            status: MESSAGE_STATUSES.failed,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      await this.repository.refreshCampaignCounts(campaignId);
    });
  }

  private resolveLocale(locale: string | null | undefined, settings: unknown) {
    if (locale === 'ar' || locale === 'en') return locale;
    const userSettings = settings && typeof settings === 'object' ? (settings as Record<string, unknown>) : {};
    const preferred = userSettings.language ?? userSettings.locale ?? userSettings.preferred_language;
    return preferred === 'ar' ? 'ar' : 'en';
  }
}

type MessageTemplateSnapshot = {
  content?: {
    en?: { subject?: string; title?: string; body?: string; html?: string };
    ar?: { subject?: string; title?: string; body?: string; html?: string };
  };
};
