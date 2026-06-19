import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { EmailService } from './email.service';
import { EmailTemplateService } from './email-template.service';
import { DomainEmailListener } from './domain-email.listener';

@Module({
  imports: [PrismaModule],
  providers: [EmailService, EmailTemplateService, DomainEmailListener],
  exports: [EmailService],
})
export class EmailModule {}
