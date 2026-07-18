import { Injectable } from '@nestjs/common';
import { TransactionContext } from '@/common/persistence';
import { PrismaService, resolvePrismaClient } from '@/prisma';
import {
  CreateEmailOtpChallengeData,
  EmailOtpChallengesRepositoryPort,
} from './email-otp-challenges.repository.port';

@Injectable()
export class EmailOtpChallengesRepository implements EmailOtpChallengesRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findRecent(recipient: string, purpose: string, after: Date, context: TransactionContext) {
    const db = resolvePrismaClient(context, this.prisma);
    return Boolean(await db.emailOtpChallenge.findFirst({ where: { recipient, purpose, createdAt: { gt: after } }, select: { id: true } }));
  }

  async countRecent(recipient: string, purpose: string, after: Date, requestIp: string | undefined, context: TransactionContext) {
    const db = resolvePrismaClient(context, this.prisma);
    const [recipientCount, recipientIp] = await Promise.all([
      db.emailOtpChallenge.count({ where: { recipient, purpose, createdAt: { gte: after } } }),
      requestIp
        ? db.emailOtpChallenge.count({ where: { recipient, purpose, requestIp, createdAt: { gte: after } } })
        : Promise.resolve(0),
    ]);
    return { recipient: recipientCount, recipientIp };
  }

  async invalidateActive(activeKey: string, at: Date, context: TransactionContext) {
    const db = resolvePrismaClient(context, this.prisma);
    await db.emailOtpChallenge.updateMany({ where: { activeKey }, data: { activeKey: null, invalidatedAt: at } });
  }

  create(data: CreateEmailOtpChallengeData, context: TransactionContext) {
    return resolvePrismaClient(context, this.prisma).emailOtpChallenge.create({ data, select: { id: true } });
  }

  async invalidateById(id: string) {
    await this.prisma.emailOtpChallenge.updateMany({
      where: { id, consumedAt: null, invalidatedAt: null },
      data: { activeKey: null, invalidatedAt: new Date() },
    });
  }

  findActive(activeKey: string, context: TransactionContext) {
    return resolvePrismaClient(context, this.prisma).emailOtpChallenge.findUnique({
      where: { activeKey },
      select: { id: true, codeHash: true, expiresAt: true, attempts: true, maxAttempts: true },
    });
  }

  async recordFailedAttempt(id: string, attempts: number, exhausted: boolean, at: Date, context: TransactionContext) {
    const db = resolvePrismaClient(context, this.prisma);
    await db.emailOtpChallenge.update({
      where: { id },
      data: { attempts, ...(exhausted ? { activeKey: null, invalidatedAt: at } : {}) },
    });
  }

  async consume(id: string, at: Date, context: TransactionContext) {
    const db = resolvePrismaClient(context, this.prisma);
    await db.emailOtpChallenge.update({ where: { id }, data: { activeKey: null, consumedAt: at } });
  }
}
