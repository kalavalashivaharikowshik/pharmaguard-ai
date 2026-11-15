import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Small JSON cache. Uses Redis when REDIS_URL is set, otherwise an in-memory
 * map with TTLs, so the app runs the same way with or without Redis.
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly redis?: Redis;
  private readonly memory = new Map<string, { value: string; expiresAt: number }>();

  constructor() {
    const url = process.env.REDIS_URL;
    if (url) {
      this.redis = new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: false });
      this.redis.on('error', (err) => this.logger.warn(`Redis error: ${err.message}`));
      this.logger.log('Redis cache enabled.');
    } else {
      this.logger.log('REDIS_URL not set. Using in-memory cache.');
    }
  }

  get usingRedis(): boolean {
    return !!this.redis;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.redis) {
        const raw = await this.redis.get(key);
        return raw ? (JSON.parse(raw) as T) : null;
      }
      const hit = this.memory.get(key);
      if (!hit) return null;
      if (hit.expiresAt < Date.now()) {
        this.memory.delete(key);
        return null;
      }
      return JSON.parse(hit.value) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
    const raw = JSON.stringify(value);
    try {
      if (this.redis) {
        await this.redis.set(key, raw, 'EX', ttlSeconds);
        return;
      }
      this.memory.set(key, { value: raw, expiresAt: Date.now() + ttlSeconds * 1000 });
    } catch {
      // Cache failures must never break a request.
    }
  }

  /** Deletes every key that starts with the prefix. */
  async invalidate(prefix: string): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(`${prefix}*`);
        if (keys.length) await this.redis.del(...keys);
        return;
      }
      for (const key of this.memory.keys()) {
        if (key.startsWith(prefix)) this.memory.delete(key);
      }
    } catch {
      // ignore
    }
  }

  /** Returns the cached value or computes, stores and returns it. */
  async wrap<T>(key: string, ttlSeconds: number, compute: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await compute();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async onModuleDestroy() {
    await this.redis?.quit().catch(() => undefined);
  }
}
