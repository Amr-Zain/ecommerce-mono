import { EmailTemplateService } from './email-template.service';

describe('EmailTemplateService', () => {
  const templates = new EmailTemplateService();

  it('renders English OTP email as HTML and text', () => {
    const result = templates.render('emailOtp', 'en', { code: '1234', expiresMinutes: 10 });
    expect(result.subject).toBe('Verification code');
    expect(result.html).toContain('1234');
    expect(result.text).toContain('1234');
  });

  it('renders Arabic email with RTL direction', () => {
    const result = templates.render('passwordResetOtp', 'ar', { code: '5678', expiresMinutes: 10 });
    expect(result.html).toContain('dir="rtl"');
    expect(result.html).toContain('5678');
  });

  it('escapes user-controlled welcome names', () => {
    const result = templates.render('welcome', 'en', { name: '<script>alert(1)</script>' });
    expect(result.html).not.toContain('<script>');
    expect(result.html).toContain('&lt;script&gt;');
  });
});
