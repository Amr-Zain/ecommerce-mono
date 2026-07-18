import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { I18nTranslations } from '@/generated/i18n.generated';
import { NotificationEmitter } from './notification-emitter';
import { NotificationRecord, NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly emitter: NotificationEmitter,
  ) {}

  async createForUsers(
    recipientIds: bigint[],
    input: {
      eventId: string;
      notificationType: string;
      titleKey: string;
      bodyKey: string;
      args?: Record<string, unknown>;
      data?: Record<string, unknown>;
    },
  ) {
    if (recipientIds.length === 0) return;
    await this.repository.createMany(recipientIds, input);
    const notifications = await this.repository.findCreated(input.eventId, recipientIds);
    for (const notification of notifications) {
      this.emitter.emit(`notification.created.${notification.recipientId.toString()}`, notification);
    }
  }

  async createRenderedForUsers(
    recipientIds: bigint[],
    input: {
      eventId: string;
      notificationType: string;
      title: string;
      body: string;
      data?: Record<string, unknown>;
    },
  ) {
    return this.createForUsers(recipientIds, {
      eventId: input.eventId,
      notificationType: input.notificationType,
      titleKey: 'common.notification_custom_title',
      bodyKey: 'common.notification_custom_body',
      args: { title: input.title, body: input.body },
      data: input.data,
    });
  }

  async createForAdmins(resource: string, input: Parameters<NotificationService['createForUsers']>[1]) {
    const admins = await this.repository.findAdminRecipients(resource);
    return this.createForUsers(
      admins.map((admin) => admin.id),
      input,
    );
  }

  async findAll(recipientId: bigint, page: number, limit: number, unreadOnly: boolean, lang: string) {
    const [items, total] = await Promise.all([
      this.repository.findByRecipient(recipientId, unreadOnly, (page - 1) * limit, limit),
      this.repository.count(recipientId, unreadOnly),
    ]);
    return { data: items.map((item) => this.format(item, lang)), meta: { page, limit, total } };
  }

  async unreadCount(recipientId: bigint) {
    return { count: await this.repository.count(recipientId, true) };
  }

  async markRead(recipientId: bigint, id: bigint) {
    const result = await this.repository.markRead(recipientId, id);
    if (result.count !== 1) throw new NotFoundException('Notification not found');
    return { success: true };
  }

  async markAllRead(recipientId: bigint) {
    return { count: (await this.repository.markAllRead(recipientId)).count };
  }

  stream(recipientId: bigint, lang: string): Observable<MessageEvent> {
    const eventName = `notification.created.${recipientId.toString()}`;
    return new Observable((subscriber) => {
      const handler = (notification: NotificationRecord) =>
        subscriber.next({ type: 'notification', data: this.format(notification, lang) } as MessageEvent);
      this.emitter.on(eventName, handler);
      const heartbeat = setInterval(
        () => subscriber.next({ type: 'heartbeat', data: new Date().toISOString() } as MessageEvent),
        30_000,
      );
      return () => {
        clearInterval(heartbeat);
        this.emitter.off(eventName, handler);
      };
    });
  }

  private format(notification: NotificationRecord, lang: string) {
    const args = (notification.args ?? {}) as Record<string, unknown>;
    const storedData = (notification.data ?? {}) as Record<string, unknown>;
    const { entity, ...data } = storedData;

    return {
      id: notification.id.toString(),
      type: notification.notificationType,
      entity,
      title: this.i18n.t(notification.titleKey as never, { lang, args }),
      body: this.i18n.t(notification.bodyKey as never, { lang, args }),
      data,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }
}
