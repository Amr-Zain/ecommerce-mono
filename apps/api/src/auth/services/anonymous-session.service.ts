import { createHash } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Request } from 'express';
import { CommerceIdentity } from '../interfaces/commerce-identity.interface';
import { AnonymousSessionsRepository } from '../repositories/anonymous-sessions.repository';

const TOKEN_HEADER = 'x-anonymous-session-token';
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class AnonymousSessionService {
  constructor(private readonly anonymousSessionsRepository: AnonymousSessionsRepository) {}

  async resolveOwner(
    request: Request,
    user?: { id: bigint } | null,
    createIfMissing = false,
  ): Promise<CommerceIdentity> {
    if (user?.id) return { type: 'user', userId: user.id };

    const token = request.header(TOKEN_HEADER);
    if (!token) return { type: 'none' };
    if (!TOKEN_PATTERN.test(token)) {
      throw new UnauthorizedException('Anonymous session token is required');
    }

    const now = new Date();
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
    const existing = await this.anonymousSessionsRepository.findByTokenHash(tokenHash);
    if (!existing && !createIfMissing) return { type: 'none' };
    const session = existing ?? (await this.anonymousSessionsRepository.findOrCreate(tokenHash, expiresAt, now));

    if (session.expiresAt <= now) {
      await this.anonymousSessionsRepository.delete(session.id);
      throw new UnauthorizedException('Anonymous session expired');
    }

    await this.anonymousSessionsRepository.touch(session.id, expiresAt, now);

    return { type: 'anonymous', sessionId: session.id };
  }

  async claim(token: string | undefined, targetUserId: bigint): Promise<void> {
    if (!token || !TOKEN_PATTERN.test(token)) return;

    await this.anonymousSessionsRepository.claimToUser(this.hashToken(token), targetUserId);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  cleanupExpired() {
    return this.anonymousSessionsRepository.deleteExpired(new Date());
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
