import { Injectable } from '@nestjs/common';
import { EmailLocale, EmailTemplate, EmailTemplateVariables } from './email.types';

@Injectable()
export class EmailTemplateService {
  render<T extends EmailTemplate>(
    template: T,
    locale: EmailLocale,
    variables: EmailTemplateVariables[T],
  ): { subject: string; html: string; text: string } {
    const copy = this.copy(template, locale, variables);
    const direction = locale === 'ar' ? 'rtl' : 'ltr';
    return {
      subject: copy.subject,
      text: `${copy.heading}\n\n${copy.body}\n\n${copy.highlight ?? ''}`.trim(),
      html: `<!doctype html><html dir="${direction}" lang="${locale}"><body style="margin:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#171717"><div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #e5e5e5;border-radius:16px;padding:32px"><p style="font-size:14px;color:#737373;margin:0 0 24px">Fayendra</p><h1 style="font-size:24px;margin:0 0 16px">${copy.heading}</h1><p style="line-height:1.7;margin:0 0 24px">${copy.body}</p>${copy.highlight ? `<div style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;background:#f5f5f5;border-radius:12px;padding:18px">${copy.highlight}</div>` : ''}</div></body></html>`,
    };
  }

  private copy<T extends EmailTemplate>(template: T, locale: EmailLocale, variables: EmailTemplateVariables[T]) {
    if (template === 'welcome') {
      const name = this.escape(String((variables as EmailTemplateVariables['welcome']).name || ''));
      return locale === 'ar'
        ? { subject: 'مرحباً بك في Fayendra', heading: name ? `مرحباً ${name}` : 'مرحباً بك', body: 'تم تأكيد بريدك الإلكتروني بنجاح.' }
        : { subject: 'Welcome to Fayendra', heading: name ? `Welcome, ${name}` : 'Welcome', body: 'Your email address has been verified successfully.' };
    }

    const otp = variables as EmailTemplateVariables['emailOtp'];
    const highlight = this.escape(otp.code);
    if (template === 'passwordResetOtp') {
      return locale === 'ar'
        ? { subject: 'رمز إعادة تعيين كلمة المرور', heading: 'إعادة تعيين كلمة المرور', body: `استخدم الرمز التالي خلال ${otp.expiresMinutes} دقائق.`, highlight }
        : { subject: 'Password reset code', heading: 'Reset your password', body: `Use this code within ${otp.expiresMinutes} minutes.`, highlight };
    }
    return locale === 'ar'
      ? { subject: 'رمز التحقق', heading: 'تأكيد بريدك الإلكتروني', body: `استخدم الرمز التالي خلال ${otp.expiresMinutes} دقائق.`, highlight }
      : { subject: 'Verification code', heading: 'Verify your email', body: `Use this code within ${otp.expiresMinutes} minutes.`, highlight };
  }

  private escape(value: string): string {
    return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]!);
  }
}
