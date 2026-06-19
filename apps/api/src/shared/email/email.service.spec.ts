jest.mock('nodemailer', () => ({
  __esModule: true,
  default: { createTransport: jest.fn() },
}));

import nodemailer from 'nodemailer';
import { EmailService } from './email.service';

describe('EmailService', () => {
  const values: Record<string, string> = {
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: 'smtp-user',
    SMTP_PASSWORD: 'smtp-password',
    EMAIL_FROM_NAME: 'Ecommerce',
    EMAIL_FROM_ADDRESS: 'hello@example.com',
  };
  const config = { get: jest.fn((key: string) => values[key]) };
  const verify = jest.fn().mockResolvedValue(true);
  const sendMail = jest.fn().mockResolvedValue({ messageId: 'message-1' });
  const render = jest.fn().mockResolvedValue({
    subject: 'Verification code',
    html: '<h1>1234</h1>',
    text: '1234',
  });
  const templates = { render } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ verify, sendMail });
  });

  it('validates configuration and verifies SMTP during startup', async () => {
    const service = new EmailService(config as never, templates);
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'smtp.example.com', port: 587, secure: false }),
    );
    await service.onModuleInit();
    expect(verify).toHaveBeenCalled();
  });

  it('sends rendered template email with the configured sender', async () => {
    const service = new EmailService(config as never, templates);
    await service.sendTemplate({
      to: 'user@example.com',
      locale: 'en',
      template: 'emailOtp',
      variables: { code: '1234', expiresMinutes: 10 },
    });
    expect(render).toHaveBeenCalledWith('emailOtp', 'en', { code: '1234', expiresMinutes: 10 });
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: { name: 'Ecommerce', address: 'hello@example.com' },
        to: 'user@example.com',
        subject: 'Verification code',
      }),
    );
  });

  it('fails fast when required SMTP configuration is missing', () => {
    expect(() => new EmailService({ get: jest.fn() } as never, templates)).toThrow('SMTP_PORT is required');
  });
});
