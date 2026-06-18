import { Module } from '@nestjs/common';
import { EmailModule } from '@/shared/email/email.module';
import { NotificationModule } from '@/shared/notifications/notification.module';
import { MessageCampaignController, MessageTemplateController } from './message.controller';
import { MessageDispatchListener } from './message-dispatch.listener';
import { MessageRenderer } from './message-renderer.service';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';

@Module({
  imports: [EmailModule, NotificationModule],
  controllers: [MessageTemplateController, MessageCampaignController],
  providers: [MessageService, MessageRepository, MessageRenderer, MessageDispatchListener],
  exports: [MessageService],
})
export class MessageModule {}
