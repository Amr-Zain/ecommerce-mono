import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { I18nService } from 'nestjs-i18n';
import { TransactionContext, UNIT_OF_WORK, UnitOfWork } from '@/common/persistence';
import { AUTH_DEFAULTS, AUTH_SECURITY, EmailOtpPurpose } from '@/common/constants/auth.constants';
import { I18nTranslations } from '@/generated/i18n.generated';
import {
  EMAIL_OTP_CHALLENGES_REPOSITORY,
  EmailOtpChallengesRepositoryPort,
} from '../repositories/email-otp-challenges.repository.port';

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
    @Inject(EMAIL_OTP_CHALLENGES_REPOSITORY) private readonly challenges: EmailOtpChallengesRepositoryPort,
    @Inject(UNIT_OF_WORK) private readonly unitOfWork: UnitOfWork,
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

    const challenge = await this.unitOfWork.execute(
      async (context) => {
        if (await this.challenges.findRecent(recipient, input.purpose, cooldownAfter, context)) {
          throw this.tooManyRequests(this.i18n.t('errors.otp_resend_cooldown'));
        }
        const counts = await this.challenges.countRecent(recipient, input.purpose, hourAgo, input.requestIp, context);
        if (counts.recipient >= AUTH_SECURITY.otpHourlyLimit || counts.recipientIp >= AUTH_SECURITY.otpHourlyLimit) {
          throw this.tooManyRequests(this.i18n.t('errors.otp_rate_limit'));
        }
        await this.challenges.invalidateActive(activeKey, now, context);
        return this.challenges.create(
          {
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
          context,
        );
      },
      { isolation: 'serializable', maxRetries: 2 },
    );

    return { id: challenge.id, code, expiresAt, recipient, locale };
  }

  invalidate(id: string): Promise<void> {
    return this.challenges.invalidateById(id);
  }

  async consume<T>(
    purpose: EmailOtpPurpose,
    recipientInput: string,
    code: string,
    onConsumed: (context: TransactionContext) => Promise<T>,
  ): Promise<T> {
    const recipient = recipientInput.trim().toLowerCase();
    const normalizedCode = this.normalizeCode(code);
    const activeKey = this.activeKey(purpose, recipient);

    const result = await this.unitOfWork.execute(
      async (context): Promise<{ value?: T; error?: ConsumeError }> => {
        const challenge = await this.challenges.findActive(activeKey, context);
        if (!challenge) return { error: 'not_found' };
        const now = new Date();
        if (challenge.expiresAt <= now) {
          await this.challenges.invalidateActive(activeKey, now, context);
          return { error: 'expired' };
        }
        if (!this.matches(normalizedCode, challenge.codeHash, activeKey)) {
          const attempts = challenge.attempts + 1;
          const exhausted = attempts >= challenge.maxAttempts;
          await this.challenges.recordFailedAttempt(challenge.id, attempts, exhausted, now, context);
          return { error: exhausted ? 'exhausted' : 'invalid' };
        }
        await this.challenges.consume(challenge.id, now, context);
        return { value: await onConsumed(context) };
      },
      { isolation: 'serializable', maxRetries: 2 },
    );

    if (result.error) throw this.consumeException(result.error);
    return result.value as T;
  }

  private hash(code: string, activeKey: string) {
    return createHmac('sha256', this.hashSecret).update(`${activeKey}:${code}`).digest('hex');
  }
  private normalizeCode(code: string) {
    return code.replace(/\D/g, '').slice(0, 4);
  }
  private matches(code: string, expectedHash: string, activeKey: string) {
    const actual = Buffer.from(this.hash(code, activeKey), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }
  private activeKey(purpose: EmailOtpPurpose, recipient: string) {
    return `${purpose}:${recipient}`;
  }
  private consumeException(error: ConsumeError): BadRequestException | HttpException {
    if (error === 'exhausted') return this.tooManyRequests(this.i18n.t('errors.otp_attempts_exhausted'));
    if (error === 'expired') return new BadRequestException(this.i18n.t('errors.verification_code_expired'));
    if (error === 'invalid') return new BadRequestException(this.i18n.t('errors.invalid_verification_code'));
    return new BadRequestException(this.i18n.t('errors.verification_code_not_found'));
  }
  private tooManyRequests(message: string) {
    return new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}
