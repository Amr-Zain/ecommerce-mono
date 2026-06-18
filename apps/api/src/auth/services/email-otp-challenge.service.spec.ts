import { HttpException } from '@nestjs/common';
import { EmailOtpChallengeService } from './email-otp-challenge.service';
import { EMAIL_OTP_PURPOSES } from '@/common/constants/auth.constants';

describe('EmailOtpChallengeService', () => {
  const config = { get: jest.fn((key: string) => (key === 'OTP_HASH_SECRET' ? 'test-secret' : undefined)) };
  const i18n = { t: jest.fn((key: string) => key) };

  it('creates a four-digit challenge and stores only its hash', async () => {
    let storedData: Record<string, unknown> | undefined;
    const tx = {
      emailOtpChallenge: {
        findFirst: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn(({ data }) => {
          storedData = data;
          return Promise.resolve({ id: 'challenge-1', ...data });
        }),
      },
    };
    const prisma = { $transaction: jest.fn((handler) => handler(tx)) };
    const service = new EmailOtpChallengeService(prisma as never, config as never, i18n as never);

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
    const tx = { emailOtpChallenge: { findFirst: jest.fn().mockResolvedValue({ id: 'recent' }) } };
    const prisma = { $transaction: jest.fn((handler) => handler(tx)) };
    const service = new EmailOtpChallengeService(prisma as never, config as never, i18n as never);

    await expect(
      service.create({ recipient: 'user@example.com', purpose: EMAIL_OTP_PURPOSES.login }),
    ).rejects.toBeInstanceOf(HttpException);
  });
});
