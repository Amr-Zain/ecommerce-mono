import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailTemplateService } from './email-template.service';
import { DomainEmailListener } from './domain-email.listener';

@Module({
  providers: [EmailService, EmailTemplateService, DomainEmailListener],
  exports: [EmailService],
})
export class EmailModule {}
