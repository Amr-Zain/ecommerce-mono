import { Injectable, Logger } from '@nestjs/common';

/**
 * Cache service
 * Handles caching with Redis or in-memory store
 *
 * TODO: Integrate with Redis or use @nestjs/cache-manager
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, { value: unknown; expiry: number }>();

  async get<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    this.logger.debug(`Cache hit: ${key}`);
    return cached.value as T;
  }

  async set(key: string, value: unknown, ttl = 3600): Promise<void> {
    const expiry = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expiry });
    this.logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
    this.logger.debug(`Cache deleted: ${key}`);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.logger.log('Cache cleared');
  }

  async has(key: string): Promise<boolean> {
    const cached = this.cache.get(key);

    if (!cached) {
      return false;
    }

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}
