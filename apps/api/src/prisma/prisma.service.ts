import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>('database.url');
    if (!databaseUrl) {
      throw new Error('Please configure the DATABASE_URL environment variable');
    }

    const connectionString = PrismaService.normalizeLocalDatabaseUrl(databaseUrl);
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
      max: 10,
      maxLifetimeSeconds: 300,
    });
    const adapter = new PrismaPg(pool, { disposeExternalPool: true });
    super({ adapter });
  }

  async onModuleInit() {
    this.logger.log('Prisma connecting...');
    await this.$connect();
    await this.$queryRaw`SELECT 1`;
    this.logger.log('Prisma connected!');
  }

  async onModuleDestroy() {
    this.logger.log('Prisma disconnecting...');
    await this.$disconnect();
    this.logger.log('Prisma disconnected!');
  }

  async readWithConnectionRetry<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (!this.isTransientConnectionError(error)) {
        throw error;
      }

      this.logger.warn('Database connection was closed; retrying read once with a fresh connection');
      return operation();
    }
  }

  isTransientConnectionError(error: unknown): boolean {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      ['P1017', 'P2024', 'P2028'].includes((error as Prisma.PrismaClientKnownRequestError).code)
    ) {
      return true;
    }

    const message = error instanceof Error ? error.message : String(error);
    return /server has closed the connection|connection terminated|connection timeout|ECONNRESET|ETIMEDOUT/i.test(
      message,
    );
  }

  private static normalizeLocalDatabaseUrl(databaseUrl: string): string {
    if (process.platform !== 'win32') {
      return databaseUrl;
    }

    const url = new URL(databaseUrl);
    if (url.hostname === 'localhost') {
      url.hostname = '127.0.0.1';
    }
    return url.toString();
  }
}
