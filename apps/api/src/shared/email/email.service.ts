import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplate, SendTemplateEmailInput } from './email.types';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter?: Transporter;
  private readonly resendApiKey?: string;
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
    this.from = { name: required('EMAIL_FROM_NAME'), address: required('EMAIL_FROM_ADDRESS') };
    this.resendApiKey = config.get<string>('RESEND_API_KEY')?.trim() || undefined;

    if (this.resendApiKey) return;

    const port = Number(required('SMTP_PORT'));
    if (!Number.isInteger(port) || port <= 0) throw new Error('SMTP_PORT must be a valid port');
    this.transporter = nodemailer.createTransport({
      host: required('SMTP_HOST'),
      port,
      secure: required('SMTP_SECURE').toLowerCase() === 'true',
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 30_000,
      auth: { user: required('SMTP_USER'), pass: required('SMTP_PASSWORD') },
    });
  }

  async onModuleInit() {
    if (this.resendApiKey) {
      this.logger.log('Resend email API configured');
      return;
    }
    void this.transporter!.verify().then(
      () => this.logger.log('SMTP connection verified'),
      () => this.logger.warn('SMTP connection unavailable; email delivery will retry when sending'),
    );
  }

  async sendTemplate<T extends EmailTemplate>(input: SendTemplateEmailInput<T>): Promise<void> {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.to)) throw new Error('Invalid email recipient');
    const rendered = await this.templates.render(input.template, input.locale, input.variables);
    await this.sendRendered({ to: input.to, ...rendered });
  }

  async sendRendered(input: { to: string; subject: string; html?: string; text: string }): Promise<void> {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.to)) throw new Error('Invalid email recipient');
    if (this.resendApiKey) {
      let response: Response;
      try {
        response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${this.from.name} <${this.from.address}>`,
            to: [input.to],
            subject: input.subject,
            html: input.html,
            text: input.text,
          }),
          signal: AbortSignal.timeout(15_000),
        });
      } catch (error) {
        this.logger.warn(
          `Resend email API request failed: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
        throw new Error('Resend email API request failed');
      }
      if (!response.ok) throw new Error(`Resend email delivery failed (HTTP ${response.status})`);
      return;
    }

    await this.transporter!.sendMail({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
  }
}
