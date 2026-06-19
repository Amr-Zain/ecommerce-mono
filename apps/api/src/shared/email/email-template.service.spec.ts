import { NotFoundException } from '@nestjs/common';
import { EmailTemplateService } from './email-template.service';

describe('EmailTemplateService', () => {
  const findUnique = jest.fn();
  const prisma = { messageTemplate: { findUnique } } as any;
  const service = new EmailTemplateService(prisma);

  beforeEach(() => jest.clearAllMocks());

  const makeTemplate = (overrides: Partial<{ isActive: boolean; content: Record<string, unknown> }> = {}) => ({
    id: BigInt(1),
    key: 'email_otp',
    name: 'Email Verification OTP',
    channel: 'email',
    purpose: 'otp',
    isActive: true,
    content: {
      en: {
        subject: 'Verification code',
        body: 'Use {{code}} within {{expiresMinutes}} minutes.',
        html: '<h1>Code: {{code}}</h1><p>Expires in {{expiresMinutes}} minutes</p>',
      },
      ar: {
        subject: 'رمز التحقق',
        body: 'استخدم {{code}} خلال {{expiresMinutes}} دقيقة.',
        html: '<h1>الرمز: {{code}}</h1><p>صالح لمدة {{expiresMinutes}} دقيقة</p>',
      },
    },
    ...overrides,
  });

  it('renders English email from DB template', async () => {
    findUnique.mockResolvedValue(makeTemplate());
    const result = await service.render('emailOtp', 'en', { code: '1234', expiresMinutes: 10 });
    expect(result.subject).toBe('Verification code');
    expect(result.html).toContain('Code: 1234');
    expect(result.text).toContain('Use 1234 within 10 minutes.');
  });

  it('renders Arabic email with RTL content from DB template', async () => {
    findUnique.mockResolvedValue(makeTemplate());
    const result = await service.render('emailOtp', 'ar', { code: '5678', expiresMinutes: 10 });
    expect(result.subject).toBe('رمز التحقق');
    expect(result.html).toContain('الرمز: 5678');
    expect(result.text).toContain('استخدم 5678 خلال 10 دقيقة.');
  });

  it('escapes user-controlled variables in HTML but keeps plain text raw', async () => {
    findUnique.mockResolvedValue(makeTemplate());
    const result = await service.render('emailOtp', 'en', { code: '<script>alert(1)</script>', expiresMinutes: 10 });
    expect(result.html).not.toContain('<script>');
    expect(result.html).toContain('&lt;script&gt;');
    expect(result.text).toContain('<script>alert(1)</script>');
  });

  it('throws NotFoundException when template is missing', async () => {
    findUnique.mockResolvedValue(null);
    await expect(service.render('emailOtp', 'en', { code: '1234', expiresMinutes: 10 })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws when template is inactive', async () => {
    findUnique.mockResolvedValue(makeTemplate({ isActive: false }));
    await expect(service.render('emailOtp', 'en', { code: '1234', expiresMinutes: 10 })).rejects.toThrow('is inactive');
  });

  it('throws when localized content is missing subject or html', async () => {
    findUnique.mockResolvedValue(makeTemplate({ content: { en: { subject: '', body: '', html: '' } } }));
    await expect(service.render('emailOtp', 'en', { code: '1234', expiresMinutes: 10 })).rejects.toThrow(
      'missing subject or html',
    );
  });
});
