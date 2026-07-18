import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailTemplateService } from './email-template.service';
import { DomainEmailListener } from './domain-email.listener';
import { MessageRepository } from '@/shared/messages/message.repository';

@Module({
  providers: [EmailService, EmailTemplateService, DomainEmailListener, MessageRepository],
  exports: [EmailService],
})
export class EmailModule {}
