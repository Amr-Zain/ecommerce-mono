import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
import { decodeCacheValue, encodeCacheValue } from './cache-codec';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly enabled: boolean;
  private readonly keyPrefix: string;
  private readonly tagTtlMs: number;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly config: ConfigService,
  ) {
    this.enabled = this.config.get<string>('CACHE_ENABLED') !== 'false';
    this.keyPrefix = this.config.get<string>('CACHE_KEY_PREFIX') ?? 'ecommerce:api';
    this.tagTtlMs = Number(this.config.get<string>('CACHE_TAG_TTL_SECONDS') ?? 86400) * 1000;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const cached = await this.cacheManager.get<unknown>(this.normalizeKey(key));
      if (cached === undefined || cached === null) {
        return null;
      }

      this.logger.debug(`Cache hit: ${key}`);
      return decodeCacheValue<T>(cached);
    } catch (error) {
      this.logger.warn(`Cache read failed for ${key}: ${this.errorMessage(error)}`);
      return null;
    }
  }

  async set(key: string, value: unknown, ttl = 3600, tags: string[] = []): Promise<void> {
    if (!this.enabled || value === undefined) {
      return;
    }

    const normalizedKey = this.normalizeKey(key);
    const ttlMs = ttl * 1000;

    try {
      await this.cacheManager.set(normalizedKey, encodeCacheValue(value), ttlMs);
      await this.linkTags(normalizedKey, tags);
      this.logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.warn(`Cache write failed for ${key}: ${this.errorMessage(error)}`);
    }
  }

  async remember<T>(key: string, ttl: number, tags: string[], loader: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await loader();
    await this.set(key, value, ttl, tags);
    return value;
  }

  async del(key: string): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      await this.cacheManager.del(this.normalizeKey(key));
      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.warn(`Cache delete failed for ${key}: ${this.errorMessage(error)}`);
    }
  }

  async invalidateTags(tags: string[]): Promise<void> {
    if (!this.enabled || tags.length === 0) {
      return;
    }

    for (const tag of tags) {
      await this.invalidateTag(tag);
    }
  }

  async clear(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      await this.cacheManager.clear();
      this.logger.log('Cache cleared');
    } catch (error) {
      this.logger.warn(`Cache clear failed: ${this.errorMessage(error)}`);
    }
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== null;
  }

  private async linkTags(normalizedKey: string, tags: string[]) {
    for (const tag of new Set(tags)) {
      const tagKey = this.tagIndexKey(tag);
      const existing = (await this.get<string[]>(tagKey)) ?? [];
      const next = Array.from(new Set([...existing, normalizedKey]));
      await this.cacheManager.set(tagKey, encodeCacheValue(next), this.tagTtlMs);
    }
  }

  private async invalidateTag(tag: string) {
    const tagKey = this.tagIndexKey(tag);
    try {
      const keys = (await this.get<string[]>(tagKey)) ?? [];
      if (keys.length > 0) {
        await this.cacheManager.mdel(keys);
      }
      await this.cacheManager.del(tagKey);
      this.logger.debug(`Cache tag invalidated: ${tag} (${keys.length} keys)`);
    } catch (error) {
      this.logger.warn(`Cache tag invalidation failed for ${tag}: ${this.errorMessage(error)}`);
    }
  }

  private tagIndexKey(tag: string): string {
    return this.normalizeKey(`tag:${tag}`);
  }

  private normalizeKey(key: string): string {
    return key.startsWith(`${this.keyPrefix}:`) ? key : `${this.keyPrefix}:${key}`;
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
