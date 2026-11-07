export interface CacheSetOptions {
  ttl: number; // saniye
  tags?: string[];
}

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options: CacheSetOptions): Promise<void>;
  delete(key: string): Promise<void>;
  invalidateByTag(tag: string): Promise<void>;
  invalidateByTags(tags: string[]): Promise<void>;
  clear(): Promise<void>;
}

export interface MinimalRedisClient {
  get(key: string): Promise<string | null>;
  del(...keys: string[]): Promise<number>;
  smembers(key: string): Promise<string[]>;
  keys(pattern: string): Promise<string[]>;
  pipeline(): {
    setex(key: string, seconds: number, value: string): void;
    sadd(key: string, ...members: string[]): void;
    expire(key: string, seconds: number): void;
    del(...keys: string[]): void;
    exec(): Promise<unknown>;
  };
}

export class RedisCacheService implements ICacheService {
  private readonly TAG_INDEX_PREFIX = 'cache:tag:';
  private readonly KEY_PREFIX = 'cache:data:';

  constructor(private readonly redis: MinimalRedisClient) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(this.KEY_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  }

  async set<T>(key: string, value: T, options: CacheSetOptions): Promise<void> {
    const serialized = JSON.stringify(value);
    const pipeline = this.redis.pipeline();

    pipeline.setex(this.KEY_PREFIX + key, options.ttl, serialized);

    if (options.tags && options.tags.length > 0) {
      for (const tag of options.tags) {
        pipeline.sadd(this.TAG_INDEX_PREFIX + tag, this.KEY_PREFIX + key);
        pipeline.expire(this.TAG_INDEX_PREFIX + tag, options.ttl + 120);
      }
    }

    await pipeline.exec();
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(this.KEY_PREFIX + key);
  }

  async invalidateByTag(tag: string): Promise<void> {
    const tagKey = this.TAG_INDEX_PREFIX + tag;
    const keys = await this.redis.smembers(tagKey);
    if (keys.length > 0) {
      const pipeline = this.redis.pipeline();
      for (const k of keys) {
        pipeline.del(k);
      }
      pipeline.del(tagKey);
      await pipeline.exec();
    }
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    await Promise.all(tags.map((tag) => this.invalidateByTag(tag)));
  }

  async clear(): Promise<void> {
    const keys = await this.redis.keys(`${this.KEY_PREFIX}*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

