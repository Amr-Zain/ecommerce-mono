import { TransactionContext } from '@/common/persistence';
import { EmailOtpPurpose } from '@/common/constants/auth.constants';

export const EMAIL_OTP_CHALLENGES_REPOSITORY = Symbol('EmailOtpChallengesRepository');

export interface EmailOtpChallengeRecord {
  id: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

export interface CreateEmailOtpChallengeData {
  userId?: bigint;
  recipient: string;
  purpose: EmailOtpPurpose;
  codeHash: string;
  expiresAt: Date;
  maxAttempts: number;
  requestIp?: string;
  locale: string;
  activeKey: string;
}

export interface EmailOtpChallengesRepositoryPort {
  findRecent(
    recipient: string,
    purpose: EmailOtpPurpose,
    after: Date,
    context: TransactionContext,
  ): Promise<boolean>;
  countRecent(
    recipient: string,
    purpose: EmailOtpPurpose,
    after: Date,
    requestIp: string | undefined,
    context: TransactionContext,
  ): Promise<{ recipient: number; recipientIp: number }>;
  invalidateActive(activeKey: string, at: Date, context: TransactionContext): Promise<void>;
  create(data: CreateEmailOtpChallengeData, context: TransactionContext): Promise<{ id: string }>;
  invalidateById(id: string): Promise<void>;
  findActive(activeKey: string, context: TransactionContext): Promise<EmailOtpChallengeRecord | null>;
  recordFailedAttempt(id: string, attempts: number, exhausted: boolean, at: Date, context: TransactionContext): Promise<void>;
  consume(id: string, at: Date, context: TransactionContext): Promise<void>;
}
