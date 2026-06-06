import { NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { DomainNotificationListener } from './domain-notification.listener';

describe('NotificationService', () => {
  const repository = {
    createMany: jest.fn(),
    findCreated: jest.fn(),
    findAdminRecipients: jest.fn(),
    findByRecipient: jest.fn(),
    count: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
  };
  const i18n = { t: jest.fn((key: string) => key) };
  const emitter = { emit: jest.fn(), on: jest.fn(), off: jest.fn() };
  const service = new NotificationService(repository as never, i18n as never, emitter as never);

  beforeEach(() => jest.clearAllMocks());

  it('creates deduplicated notifications and emits committed records', async () => {
    const notification = { id: 1n, recipientId: 4n };
    repository.createMany.mockResolvedValue({ count: 1 });
    repository.findCreated.mockResolvedValue([notification]);

    await service.createForUsers([4n], {
      eventId: 'event-1',
      notificationType: 'order.created',
      titleKey: 'common.notification_order_created_title',
      bodyKey: 'common.notification_order_created_body',
    });

    expect(repository.createMany).toHaveBeenCalled();
    expect(emitter.emit).toHaveBeenCalledWith('notification.created.4', notification);
  });

  it('does not allow a user to mark another user notification as read', async () => {
    repository.markRead.mockResolvedValue({ count: 0 });

    await expect(service.markRead(4n, 99n)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('exposes entity separately from related notification data', async () => {
    repository.findByRecipient.mockResolvedValue([
      {
        id: 1n,
        notificationType: 'return.approved',
        titleKey: 'common.notification_return_approved_title',
        bodyKey: 'common.notification_return_approved_body',
        args: {},
        data: { entity: { type: 'return', id: '8' }, orderId: '42', status: 'approved' },
        readAt: null,
        createdAt: new Date(),
      },
    ]);
    repository.count.mockResolvedValue(1);

    const result = await service.findAll(7n, 1, 20, false, 'en');

    expect(result.data[0]).toEqual(
      expect.objectContaining({
        entity: { type: 'return', id: '8' },
        data: { orderId: '42', status: 'approved' },
      }),
    );
  });
});

describe('DomainNotificationListener', () => {
  const consumer = { run: jest.fn((_event, _name, handler) => handler()) };
  const notifications = { createForUsers: jest.fn(), createForAdmins: jest.fn() };
  const listener = new DomainNotificationListener(consumer as never, notifications as never);

  beforeEach(() => jest.clearAllMocks());

  it('stores the primary entity once and uses a translated event-specific message', async () => {
    await listener.handleReturn({
      eventId: 'event-1',
      eventName: 'return.approved',
      version: 1,
      aggregateType: 'return',
      aggregateId: '8',
      occurredAt: new Date(),
      payload: { returnRequestId: '8', orderId: '42', userId: '7', status: 'approved' },
    });

    expect(notifications.createForUsers).toHaveBeenCalledWith(
      [7n],
      expect.objectContaining({
        titleKey: 'common.notification_return_approved_title',
        bodyKey: 'common.notification_return_approved_body',
        data: {
          entity: { type: 'return', id: '8' },
          orderId: '42',
          userId: '7',
          status: 'approved',
        },
      }),
    );
  });

  it('uses the translated order status message', async () => {
    await listener.handleOrder({
      eventId: 'event-2',
      eventName: 'order.status_changed',
      version: 1,
      aggregateType: 'order',
      aggregateId: '42',
      occurredAt: new Date(),
      payload: { userId: '7', newStatus: 'shipped' },
    });

    expect(notifications.createForUsers).toHaveBeenCalledWith(
      [7n],
      expect.objectContaining({
        titleKey: 'common.notification_order_status_title',
        bodyKey: 'common.notification_order_shipped_body',
      }),
    );
  });

  it('uses a human-safe translated fallback for unknown events', async () => {
    await listener.handleOrder({
      eventId: 'event-3',
      eventName: 'order.future_event',
      version: 1,
      aggregateType: 'order',
      aggregateId: '42',
      occurredAt: new Date(),
      payload: { userId: '7' },
    });

    expect(notifications.createForUsers).toHaveBeenCalledWith(
      [7n],
      expect.objectContaining({
        titleKey: 'common.notification_update_title',
        bodyKey: 'common.notification_update_body',
      }),
    );
  });

  it('uses the aggregate permission for payment event admin recipients', async () => {
    await listener.handlePayment({
      eventId: 'event-4',
      eventName: 'payment.completed',
      version: 1,
      aggregateType: 'return',
      aggregateId: '8',
      occurredAt: new Date(),
      payload: { status: 'refunded' },
    });

    expect(notifications.createForAdmins).toHaveBeenCalledWith(
      'returns',
      expect.objectContaining({
        titleKey: 'common.notification_refund_completed_title',
        bodyKey: 'common.notification_refund_completed_body',
      }),
    );
  });
});
