import { HttpException } from '@nestjs/common';
import { EmailOtpChallengeService } from './email-otp-challenge.service';
import { EMAIL_OTP_PURPOSES } from '@/common/constants/auth.constants';

describe('EmailOtpChallengeService', () => {
  const config = { get: jest.fn((key: string) => (key === 'OTP_HASH_SECRET' ? 'test-secret' : undefined)) };
  const i18n = { t: jest.fn((key: string) => key) };
  const unitOfWork = { execute: jest.fn((handler) => handler({})) };

  it('creates a four-digit challenge and stores only its hash', async () => {
    let storedData: Record<string, unknown> | undefined;
    const repository = {
      findRecent: jest.fn().mockResolvedValue(false),
      countRecent: jest.fn().mockResolvedValue({ recipient: 0, recipientIp: 0 }),
      invalidateActive: jest.fn().mockResolvedValue(undefined),
      create: jest.fn((data) => {
        storedData = data;
        return Promise.resolve({ id: 'challenge-1' });
      }),
    };
    const service = new EmailOtpChallengeService(
      repository as never,
      unitOfWork as never,
      config as never,
      i18n as never,
    );

    const result = await service.create({
      recipient: ' USER@Example.com ',
      purpose: EMAIL_OTP_PURPOSES.login,
      userId: 1n,
      requestIp: '127.0.0.1',
      locale: 'en',
    });

    expect(result.code).toMatch(/^\d{4}$/);
    expect(storedData?.recipient).toBe('user@example.com');
    expect(storedData?.codeHash).toMatch(/^[a-f0-9]{64}$/);
    expect(storedData?.codeHash).not.toBe(result.code);
  });

  it('rejects requests during the resend cooldown', async () => {
    const repository = { findRecent: jest.fn().mockResolvedValue(true) };
    const service = new EmailOtpChallengeService(
      repository as never,
      unitOfWork as never,
      config as never,
      i18n as never,
    );

    await expect(
      service.create({ recipient: 'user@example.com', purpose: EMAIL_OTP_PURPOSES.login }),
    ).rejects.toBeInstanceOf(HttpException);
  });
});
