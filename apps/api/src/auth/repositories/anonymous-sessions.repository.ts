import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma';

@Injectable()
export class AnonymousSessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByTokenHash(tokenHash: string) {
    return this.prisma.anonymousSession.findUnique({ where: { tokenHash } });
  }

  findOrCreate(tokenHash: string, expiresAt: Date, lastActiveAt: Date) {
    return this.prisma.anonymousSession.upsert({
      where: { tokenHash },
      create: { tokenHash, expiresAt, lastActiveAt },
      update: {},
    });
  }

  touch(id: string, expiresAt: Date, lastActiveAt: Date) {
    return this.prisma.anonymousSession.update({
      where: { id },
      data: { expiresAt, lastActiveAt },
    });
  }

  delete(id: string) {
    return this.prisma.anonymousSession.delete({ where: { id } });
  }

  deleteExpired(now: Date) {
    return this.prisma.anonymousSession.deleteMany({ where: { expiresAt: { lt: now } } });
  }
}
