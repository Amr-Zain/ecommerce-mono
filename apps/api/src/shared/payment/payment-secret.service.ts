import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

type EncryptedSecret = {
  encrypted: true;
  value: string;
};

const MASK_PREFIX = '********';

@Injectable()
export class PaymentSecretService {
  constructor(private readonly configService: ConfigService) {}

  encrypt(value: string): EncryptedSecret {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key(), iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      encrypted: true,
      value: Buffer.concat([iv, tag, encrypted]).toString('base64'),
    };
  }

  decrypt(value: unknown): string | undefined {
    if (!this.isEncryptedSecret(value)) return typeof value === 'string' ? value : undefined;

    const payload = Buffer.from(value.value, 'base64');
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', this.key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }

  mergeSecrets(existing: Record<string, unknown>, incoming: Record<string, unknown>, secretKeys: readonly string[]) {
    const next = { ...existing };
    for (const key of secretKeys) {
      const value = incoming[key];
      if (value === undefined || value === null || value === '' || this.isMasked(value)) continue;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        next[key] = this.encrypt(String(value));
      }
    }
    return next;
  }

  decryptRecord(record: Record<string, unknown>) {
    return Object.entries(record).reduce<Record<string, string | undefined>>((acc, [key, value]) => {
      acc[key] = this.decrypt(value);
      return acc;
    }, {});
  }

  mask(value: unknown) {
    const raw = this.decrypt(value);
    if (!raw) return '';
    if (raw.length <= 4) return `${MASK_PREFIX}${raw}`;
    return `${MASK_PREFIX}${raw.slice(-4)}`;
  }

  isMasked(value: unknown) {
    return typeof value === 'string' && value.startsWith(MASK_PREFIX);
  }

  verifyHmac(
    secret: string | undefined,
    payload: Buffer | string,
    signature: string | undefined,
    algorithm = 'sha256',
  ) {
    if (!secret || !signature) return false;
    const expected = createHmac(algorithm, secret).update(payload).digest('hex');
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);
    return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
  }

  private isEncryptedSecret(value: unknown): value is EncryptedSecret {
    return Boolean(
      value &&
      typeof value === 'object' &&
      (value as EncryptedSecret).encrypted === true &&
      typeof (value as EncryptedSecret).value === 'string',
    );
  }

  private key() {
    const secret =
      this.configService.get<string>('PAYMENT_SECRETS_KEY') ||
      this.configService.get<string>('JWT_SECRET') ||
      'development-payment-secret-key';
    return createHash('sha256').update(secret).digest();
  }
}
