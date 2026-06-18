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

      const content = (campaign.templateSnapshot as any).content ?? {};
      const variables = (campaign.variables ?? {}) as Record<string, unknown>;
      const rendered = this.renderer.renderBoth(content, variables);
      const pending = await this.repository.pendingRecipients(campaignId);

      for (const recipient of pending) {
        try {
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
              subject: campaign.titleOverride ?? rendered.en.subject,
              html: rendered.en.html,
              text: rendered.en.body,
            });
          } else {
            await this.notifications.createRenderedForUsers([recipient.userId], {
              eventId: `${event.eventId}:${recipient.id.toString()}`,
              notificationType: 'message.campaign',
              title: campaign.titleOverride ?? rendered.en.title,
              body: rendered.en.body,
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
}
