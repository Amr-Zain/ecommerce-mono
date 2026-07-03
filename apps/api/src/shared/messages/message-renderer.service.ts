import { Injectable } from '@nestjs/common';

type Locale = 'en' | 'ar';

type MessageContent = {
  en?: { subject?: string | null; title?: string | null; body?: string | null; html?: string | null };
  ar?: { subject?: string | null; title?: string | null; body?: string | null; html?: string | null };
};

@Injectable()
export class MessageRenderer {
  render(content: MessageContent, variables: Record<string, unknown> = {}, locale: string = 'en') {
    const lang: Locale = locale === 'ar' ? 'ar' : 'en';
    const selected = content[lang] ?? content.en ?? content.ar ?? {};
    return {
      subject: this.interpolate(selected.subject ?? selected.title ?? '', variables),
      title: this.interpolate(selected.title ?? selected.subject ?? '', variables),
      body: this.interpolate(selected.body ?? '', variables),
      html: selected.html ? this.interpolate(selected.html, variables) : undefined,
    };
  }

  renderBoth(content: MessageContent, variables: Record<string, unknown> = {}) {
    return {
      en: this.render(content, variables, 'en'),
      ar: this.render(content, variables, 'ar'),
    };
  }

  private interpolate(template: string, variables: Record<string, unknown>): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key: string) => {
      const value = variables[key];
      if (value === undefined || value === null) return '';
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
      return JSON.stringify(value);
    });
  }
}
