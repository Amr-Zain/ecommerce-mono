import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplate, SendTemplateEmailInput } from './email.types';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;
  private readonly from: { name: string; address: string };

  constructor(
    config: ConfigService,
    private readonly templates: EmailTemplateService,
  ) {
    const required = (key: string) => {
      const value = config.get<string>(key);
      if (!value) throw new Error(`${key} is required`);
      return value;
    };
    const port = Number(required('SMTP_PORT'));
    if (!Number.isInteger(port) || port <= 0) throw new Error('SMTP_PORT must be a valid port');

    this.from = { name: required('EMAIL_FROM_NAME'), address: required('EMAIL_FROM_ADDRESS') };
    this.transporter = nodemailer.createTransport({
      host: required('SMTP_HOST'),
      port,
      secure: required('SMTP_SECURE').toLowerCase() === 'true',
      auth: { user: required('SMTP_USER'), pass: required('SMTP_PASSWORD') },
    });
  }

  async onModuleInit() {
    await this.transporter.verify();
    this.logger.log('SMTP connection verified');
  }

  async sendTemplate<T extends EmailTemplate>(input: SendTemplateEmailInput<T>): Promise<void> {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.to)) throw new Error('Invalid email recipient');
    const rendered = await this.templates.render(input.template, input.locale, input.variables);
    await this.transporter.sendMail({ from: this.from, to: input.to, ...rendered });
  }

  async sendRendered(input: { to: string; subject: string; html?: string; text: string }): Promise<void> {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.to)) throw new Error('Invalid email recipient');
    await this.transporter.sendMail({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
  }
}
