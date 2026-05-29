import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>('database.url');
    if (!databaseUrl) {
      throw new Error('Please configure the DATABASE_URL environment variable');
    }
    const adapter = new PrismaPg({ connectionString: databaseUrl });
    super({ adapter });
  }

  async onModuleInit() {
    console.log('Prisma connecting...');
    await this.$connect();
    console.log('Prisma connected!');
  }

  async onModuleDestroy() {
    console.log('Prisma disconnecting...');
    await this.$disconnect();
    console.log('Prisma disconnected!');
  }
}
