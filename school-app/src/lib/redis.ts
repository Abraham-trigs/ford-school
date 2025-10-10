// src/lib/redis.ts
import { createClient, RedisClientType } from "redis";

let client: RedisClientType | null = null;
let isConnecting = false;

/**
 * Creates or reuses a Redis client.
 * Ensures connection resilience and reuse across hot reloads (Next.js dev mode).
 */
export async function getRedisClient(): Promise<RedisClientType | null> {
  if (client?.isOpen) return client;
  if (isConnecting) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return client;
  }

  isConnecting = true;
  try {
    client = createClient({
      url: process.env.REDIS_URL,
      socket: { reconnectStrategy: () => 2000 },
    });

    client.on("error", (err) => {
      console.error("🔴 Redis connection error:", err);
    });

    // Prevents duplicate connect() calls in Next.js dev mode
    if (!client.isOpen) {
      await client.connect();
      console.log("🟢 Redis connected successfully");
    }

    return client;
  } catch (err) {
    console.error("⚠️ Redis not available:", err);
    return null;
  } finally {
    isConnecting = false;
  }
}

/**
 * Retrieves cached JSON data safely
 */
export async function getCache<T = unknown>(key: string): Promise<T | null> {
  const redis = await getRedisClient();
  if (!redis) return null;
  try {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (err) {
    console.error(`❌ Failed to get cache for key ${key}:`, err);
    return null;
  }
}

/**
 * Stores data in cache with optional expiry (seconds)
 */
export async function setCache<T = unknown>(
  key: string,
  value: T,
  ttlSeconds = 3600
): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    console.error(`❌ Failed to set cache for key ${key}:`, err);
  }
}

/**
 * Deletes a cached key
 */
export async function deleteCache(key: string): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.error(`❌ Failed to delete cache for key ${key}:`, err);
  }
}

/**
 * Finance cache key helper — ensures scoped multi-tenant cache
 */
export function financeCacheKey(schoolId: string, type: string) {
  return `finance:${schoolId}:${type}:v1`;
}
