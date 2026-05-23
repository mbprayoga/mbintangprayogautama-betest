import Redis from "ioredis";
import { ICacheService } from "./ICacheService";

const KEY_PREFIX = "redis_mbintangprayogautama_betest:";
const DEFAULT_TTL_SECONDS = 3600;

export class RedisCacheService implements ICacheService {
  private readonly client: Redis;

  constructor(client: Redis) {
    this.client = client;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(KEY_PREFIX + key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  async set<T>(
    key: string,
    value: T,
    ttlSeconds = DEFAULT_TTL_SECONDS,
  ): Promise<void> {
    await this.client.set(
      KEY_PREFIX + key,
      JSON.stringify(value),
      "EX",
      ttlSeconds,
    );
  }

  async del(key: string): Promise<void> {
    await this.client.del(KEY_PREFIX + key);
  }
}
