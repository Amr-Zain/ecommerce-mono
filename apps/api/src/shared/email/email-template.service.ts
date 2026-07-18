import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageRepository } from '@/shared/messages/message.repository';
import { EmailLocale, EmailTemplate, EmailTemplateVariables } from './email.types';

type LocalizedContent = {
  subject?: string;
  body?: string;
  html?: string;
};

type MessageContent = {
  en?: LocalizedContent;
  ar?: LocalizedContent;
};

@Injectable()
export class EmailTemplateService {
  private readonly templateKeyMap: Record<EmailTemplate, string> = {
    emailOtp: 'email_otp',
    passwordResetOtp: 'password_reset_otp',
    welcome: 'welcome',
  };

  constructor(private readonly messages: MessageRepository) {}

  async render<T extends EmailTemplate>(
    template: T,
    locale: EmailLocale,
    variables: EmailTemplateVariables[T],
  ): Promise<{ subject: string; html: string; text: string }> {
    const key = this.templateKeyMap[template];
    const record = await this.messages.findTemplateByKey(key);

    if (!record) {
      throw new NotFoundException(`Email template "${key}" not found`);
    }
    if (!record.isActive) {
      throw new Error(`Email template "${key}" is inactive`);
    }

    const content = (record.content ?? {}) as MessageContent;
    const lang = locale === 'ar' ? 'ar' : 'en';
    const localized = content[lang] ?? content.en ?? content.ar ?? {};

    const rawVariables = this.stringifyVariables(variables);
    const escapedVariables = this.escapeVariables(rawVariables);

    const subject = this.interpolate(String(localized.subject ?? ''), rawVariables);
    const body = this.interpolate(String(localized.body ?? ''), rawVariables);
    const html = this.interpolate(String(localized.html ?? ''), escapedVariables);

    if (!subject || !html) {
      throw new Error(`Email template "${key}" is missing subject or html for locale "${lang}"`);
    }

    return { subject, html, text: body };
  }

  private stringifyVariables(variables: Record<string, unknown>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(variables)) {
      if (value === undefined || value === null) {
        result[key] = '';
      } else if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'bigint'
      ) {
        result[key] = String(value);
      } else {
        result[key] = JSON.stringify(value);
      }
    }
    return result;
  }

  private escapeVariables(variables: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(variables)) {
      result[key] = this.escape(value);
    }
    return result;
  }

  private interpolate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key: string) => variables[key] ?? '');
  }

  private escape(value: string): string {
    return value.replace(
      /[&<>"']/g,
      (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]!,
    );
  }
}
