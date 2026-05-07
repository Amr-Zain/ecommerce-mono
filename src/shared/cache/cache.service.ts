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
    private cache = new Map<string, { value: any; expiry: number }>();

    /**
     * Get value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        const cached = this.cache.get(key);

        if (!cached) {
            return null;
        }

        // Check if expired
        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }

        this.logger.debug(`Cache hit: ${key}`);
        return cached.value as T;
    }

    /**
     * Set value in cache
     */
    async set(key: string, value: any, ttl = 3600): Promise<void> {
        const expiry = Date.now() + ttl * 1000;
        this.cache.set(key, { value, expiry });
        this.logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
    }

    /**
     * Delete value from cache
     */
    async del(key: string): Promise<void> {
        this.cache.delete(key);
        this.logger.debug(`Cache deleted: ${key}`);
    }

    /**
     * Clear all cache
     */
    async clear(): Promise<void> {
        this.cache.clear();
        this.logger.log('Cache cleared');
    }

    /**
     * Check if key exists in cache
     */
    async has(key: string): Promise<boolean> {
        const cached = this.cache.get(key);

        if (!cached) {
            return false;
        }

        // Check if expired
        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }
}
