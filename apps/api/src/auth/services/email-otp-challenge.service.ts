import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { I18nService } from 'nestjs-i18n';
import { PrismaService, Prisma } from '@/prisma';
import { AUTH_DEFAULTS, AUTH_SECURITY, EmailOtpPurpose } from '@/common/constants/auth.constants';
import { I18nTranslations } from '@/generated/i18n.generated';

interface CreateChallengeInput {
  recipient: string;
  purpose: EmailOtpPurpose;
  userId?: bigint;
  requestIp?: string;
  locale?: string;
}

interface ChallengeDelivery {
  id: string;
  code: string;
  expiresAt: Date;
  recipient: string;
  locale: string;
}

type ConsumeError = 'not_found' | 'expired' | 'invalid' | 'exhausted';

@Injectable()
export class EmailOtpChallengeService {
  private readonly hashSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {
    this.hashSecret = config.get<string>('OTP_HASH_SECRET') ?? '';
    if (!this.hashSecret) throw new Error('OTP_HASH_SECRET is required');
  }

  async create(input: CreateChallengeInput): Promise<ChallengeDelivery> {
    const recipient = input.recipient.trim().toLowerCase();
    const locale = input.locale === 'ar' ? 'ar' : AUTH_DEFAULTS.language;
    const activeKey = this.activeKey(input.purpose, recipient);
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60_000);
    const cooldownAfter = new Date(now.getTime() - AUTH_SECURITY.otpResendCooldownMs);
    const code = randomInt(0, 10_000).toString().padStart(4, '0');
    const expiresAt = new Date(now.getTime() + AUTH_SECURITY.verificationExpiryMs);

    const challenge = await this.prisma.$transaction(
      async (tx) => {
        const recent = await tx.emailOtpChallenge.findFirst({
          where: { recipient, purpose: input.purpose, createdAt: { gt: cooldownAfter } },
          select: { id: true },
        });
        if (recent) throw this.tooManyRequests(this.i18n.t('errors.otp_resend_cooldown'));

        const [recipientCount, ipRecipientCount] = await Promise.all([
          tx.emailOtpChallenge.count({
            where: { recipient, purpose: input.purpose, createdAt: { gte: hourAgo } },
          }),
          input.requestIp
            ? tx.emailOtpChallenge.count({
                where: {
                  recipient,
                  purpose: input.purpose,
                  requestIp: input.requestIp,
                  createdAt: { gte: hourAgo },
                },
              })
            : Promise.resolve(0),
        ]);
        if (recipientCount >= AUTH_SECURITY.otpHourlyLimit || ipRecipientCount >= AUTH_SECURITY.otpHourlyLimit) {
          throw this.tooManyRequests(this.i18n.t('errors.otp_rate_limit'));
        }

        await tx.emailOtpChallenge.updateMany({
          where: { activeKey },
          data: { activeKey: null, invalidatedAt: now },
        });

        return tx.emailOtpChallenge.create({
          data: {
            userId: input.userId,
            recipient,
            purpose: input.purpose,
            codeHash: this.hash(code, activeKey),
            expiresAt,
            maxAttempts: AUTH_SECURITY.otpMaxAttempts,
            requestIp: input.requestIp,
            locale,
            activeKey,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return { id: challenge.id, code, expiresAt, recipient, locale };
  }

  invalidate(id: string): Promise<unknown> {
    return this.prisma.emailOtpChallenge.updateMany({
      where: { id, consumedAt: null, invalidatedAt: null },
      data: { activeKey: null, invalidatedAt: new Date() },
    });
  }

  async consume<T>(
    purpose: EmailOtpPurpose,
    recipientInput: string,
    code: string,
    onConsumed: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    const recipient = recipientInput.trim().toLowerCase();
    const normalizedCode = this.normalizeCode(code);
    const activeKey = this.activeKey(purpose, recipient);

    const result = await this.prisma.$transaction(
      async (tx): Promise<{ value?: T; error?: ConsumeError }> => {
        const challenge = await tx.emailOtpChallenge.findUnique({ where: { activeKey } });
        if (!challenge) return { error: 'not_found' };

        if (challenge.expiresAt <= new Date()) {
          await tx.emailOtpChallenge.update({
            where: { id: challenge.id },
            data: { activeKey: null, invalidatedAt: new Date() },
          });
          return { error: 'expired' };
        }

        if (!this.matches(normalizedCode, challenge.codeHash, activeKey)) {
          const attempts = challenge.attempts + 1;
          const exhausted = attempts >= challenge.maxAttempts;
          await tx.emailOtpChallenge.update({
            where: { id: challenge.id },
            data: {
              attempts,
              ...(exhausted ? { activeKey: null, invalidatedAt: new Date() } : {}),
            },
          });
          return { error: exhausted ? 'exhausted' : 'invalid' };
        }

        await tx.emailOtpChallenge.update({
          where: { id: challenge.id },
          data: { activeKey: null, consumedAt: new Date() },
        });
        return { value: await onConsumed(tx) };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    if (result.error) throw this.consumeException(result.error);
    return result.value as T;
  }

  private hash(code: string, activeKey: string): string {
    return createHmac('sha256', this.hashSecret).update(`${activeKey}:${code}`).digest('hex');
  }

  private normalizeCode(code: string): string {
    return String(code ?? '')
      .replace(/\D/g, '')
      .slice(0, 4);
  }

  private matches(code: string, expectedHash: string, activeKey: string): boolean {
    const actual = Buffer.from(this.hash(code, activeKey), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  private activeKey(purpose: EmailOtpPurpose, recipient: string): string {
    return `${purpose}:${recipient}`;
  }

  private consumeException(error: ConsumeError): BadRequestException | HttpException {
    if (error === 'exhausted') return this.tooManyRequests(this.i18n.t('errors.otp_attempts_exhausted'));
    if (error === 'expired') return new BadRequestException(this.i18n.t('errors.verification_code_expired'));
    if (error === 'invalid') return new BadRequestException(this.i18n.t('errors.invalid_verification_code'));
    return new BadRequestException(this.i18n.t('errors.verification_code_not_found'));
  }

  private tooManyRequests(message: string): HttpException {
    return new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}
