import { Module } from '@nestjs/common';
import { NotificationEmitter } from './notification-emitter';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { AdminNotificationController, ClientNotificationController } from './notification.controller';
import { DomainNotificationListener } from './domain-notification.listener';

@Module({
  controllers: [ClientNotificationController, AdminNotificationController],
  providers: [NotificationEmitter, NotificationService, NotificationRepository, DomainNotificationListener],
  exports: [NotificationService],
})
export class NotificationModule {}
