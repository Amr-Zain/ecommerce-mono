import { Injectable } from '@nestjs/common';
import { Prisma, Notification } from '@prisma/client';
import { PrismaService } from '@/prisma';

export type NotificationRecord = Notification;

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  createMany(
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
    return this.prisma.notification.createMany({
      data: recipientIds.map((recipientId) => ({
        recipientId,
        eventId: input.eventId,
        notificationType: input.notificationType,
        titleKey: input.titleKey,
        bodyKey: input.bodyKey,
        args: input.args as Prisma.InputJsonValue | undefined,
        data: input.data as Prisma.InputJsonValue | undefined,
      })),
      skipDuplicates: true,
    });
  }

  findByRecipient(recipientId: bigint, unreadOnly: boolean, skip: number, take: number) {
    return this.prisma.notification.findMany({
      where: { recipientId, ...(unreadOnly ? { readAt: null } : {}) },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  count(recipientId: bigint, unreadOnly = false) {
    return this.prisma.notification.count({ where: { recipientId, ...(unreadOnly ? { readAt: null } : {}) } });
  }

  markRead(recipientId: bigint, id: bigint) {
    return this.prisma.notification.updateMany({ where: { id, recipientId }, data: { readAt: new Date() } });
  }

  markAllRead(recipientId: bigint) {
    return this.prisma.notification.updateMany({ where: { recipientId, readAt: null }, data: { readAt: new Date() } });
  }

  findAdminRecipients(resource: string) {
    return this.prisma.user.findMany({
      where: {
        userType: 'admin',
        isActive: true,
        role: { permissions: { some: { resource, action: { in: ['list', 'read'] } } } },
      },
      select: { id: true },
    });
  }

  findCreated(eventId: string, recipientIds: bigint[]): Promise<Notification[]> {
    return this.prisma.notification.findMany({ where: { eventId, recipientId: { in: recipientIds } } });
  }
}
