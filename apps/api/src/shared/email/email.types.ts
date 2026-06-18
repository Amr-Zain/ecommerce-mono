export type EmailLocale = 'en' | 'ar';
export type EmailTemplate = 'emailOtp' | 'passwordResetOtp' | 'welcome';

export interface EmailTemplateVariables {
  emailOtp: { code: string; expiresMinutes: number };
  passwordResetOtp: { code: string; expiresMinutes: number };
  welcome: { name?: string };
}

export interface SendTemplateEmailInput<T extends EmailTemplate> {
  to: string;
  locale: EmailLocale;
  template: T;
  variables: EmailTemplateVariables[T];
}
