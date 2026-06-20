import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule, type CacheOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';
import { CacheService } from './cache.service';
import { PublicCacheInvalidationListener, PublicCacheInvalidationPublisher } from './public-cache-invalidation.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): CacheOptions => {
        const enabled = config.get<string>('CACHE_ENABLED') !== 'false';
        const ttlSeconds = Number(config.get<string>('CACHE_DEFAULT_TTL_SECONDS') ?? 60);
        const redisUrl = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';

        if (!enabled) {
          return { ttl: ttlSeconds * 1000 };
        }

        return {
          ttl: ttlSeconds * 1000,
          nonBlocking: true,
          stores: [
            createKeyv(redisUrl, {
              throwOnConnectError: false,
              throwOnErrors: false,
              connectionTimeout: 1000,
            }),
          ],
        };
      },
    }),
  ],
  providers: [CacheService, PublicCacheInvalidationPublisher, PublicCacheInvalidationListener],
  exports: [CacheService, PublicCacheInvalidationPublisher],
})
export class CacheModule {}
