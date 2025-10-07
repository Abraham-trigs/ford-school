// /lib/redis.ts
import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("Missing Upstash Redis environment variables");
}

/**
 * Global Redis client using Upstash REST API.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/* -------------------------------------------------------------------------- */
/*                             🔹 CACHE UTILITIES                             */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves data from cache by key.
 * @param key Redis cache key.
 * @returns Parsed JSON object or null if not found.
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get<string>(key);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.warn("Redis GET error:", err);
    return null;
  }
}

/**
 * Sets data in cache with optional TTL.
 * @param key Redis cache key.
 * @param value Data to cache.
 * @param ttlSeconds Optional TTL (default: 5 minutes).
 */
export async function setCache(
  key: string,
  value: any,
  ttlSeconds = 60 * 5
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (err) {
    console.warn("Redis SET error:", err);
  }
}

/**
 * Deletes a cache entry by key.
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (err) {
    console.warn("Redis DEL error:", err);
  }
}

/* -------------------------------------------------------------------------- */
/*                         🔹 TAG-BASED INVALIDATION                          */
/* -------------------------------------------------------------------------- */

/**
 * Associates a cache key with one or more tags.
 * Enables fast invalidation for all related entries.
 * 
 * Example:
 * await addCacheTag("classroom:school:1:page:1", ["classroom:school:1"]);
 */
export async function addCacheTag(key: string, tags: string[]): Promise<void> {
  try {
    const pipeline = redis.pipeline();
    tags.forEach((tag) => pipeline.sadd(`tag:${tag}`, key));
    await pipeline.exec();
  } catch (err) {
    console.warn("Redis ADD TAG error:", err);
  }
}

/**
 * Invalidates all cache entries associated with one or more tags.
 * This avoids the use of KEYS (which is unsafe in production).
 * 
 * Example:
 * await invalidateByTags(["classroom:school:1"]);
 */
export async function invalidateByTags(tags: string[]): Promise<void> {
  try {
    const pipeline = redis.pipeline();

    for (const tag of tags) {
      const tagKey = `tag:${tag}`;
      const keys = (await redis.smembers<string>(tagKey)) || [];

      if (keys.length > 0) pipeline.del(...keys);
      pipeline.del(tagKey); // remove tag set
    }

    await pipeline.exec();
  } catch (err) {
    console.warn("Redis INVALIDATE TAGS error:", err);
  }
}

/* -------------------------------------------------------------------------- */
/*                        🔹 LUA SCRIPT (ATOMIC INVALIDATION)                 */
/* -------------------------------------------------------------------------- */

/**
 * Optional: Atomic invalidation using a Lua script.
 * This avoids race conditions and is safer in highly concurrent environments.
 * 
 * Example usage in service:
 * await redis.eval(invalidateCacheScript, [tagKey]);
 */
export const invalidateCacheScript = `
  local tagKey = KEYS[1]
  local keys = redis.call('SMEMBERS', tagKey)
  for _, k in ipairs(keys) do
    redis.call('DEL', k)
  end
  redis.call('DEL', tagKey)
  return true
`;
