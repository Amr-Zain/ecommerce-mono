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

  get<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);

    if (!cached) {
      return Promise.resolve(null);
    }

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return Promise.resolve(null);
    }

    this.logger.debug(`Cache hit: ${key}`);
    return Promise.resolve(cached.value as T);
  }

  set(key: string, value: unknown, ttl = 3600): Promise<void> {
    const expiry = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expiry });
    this.logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
    return Promise.resolve();
  }

  del(key: string): Promise<void> {
    this.cache.delete(key);
    this.logger.debug(`Cache deleted: ${key}`);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.cache.clear();
    this.logger.log('Cache cleared');
    return Promise.resolve();
  }

  has(key: string): Promise<boolean> {
    const cached = this.cache.get(key);

    if (!cached) {
      return Promise.resolve(false);
    }

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }
}
