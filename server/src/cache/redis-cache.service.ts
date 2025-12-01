import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RedisCacheService {
  constructor(private readonly redis: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    await this.redis.client.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  }

  async setNX<T>(
    key: string,
    value: T,
    ttlSeconds = 300,
  ): Promise<string | null> {
    return this.redis.client.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
      NX: true,
    });
  }

  async exists(key: string): Promise<boolean> {
    return (await this.redis.client.exists(key)) === 1;
  }

  async ttl(key: string): Promise<number> {
    return this.redis.client.ttl(key);
  }

  async del(key: string): Promise<number> {
    return this.redis.client.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const stream = this.redis.client.scanIterator({
      MATCH: pattern,
      COUNT: 100,
    });

    for await (const key of stream as AsyncIterable<string>) {
      await this.redis.client.del(key);
    }
  }
}
