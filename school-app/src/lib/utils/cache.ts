// /lib/utils/cacheService.ts
import { redis } from "@/lib/redis";

/**
 * Lightweight cache service:
 * - cacheGet / cacheSet: simple typed wrappers
 * - addTagsForKey: track keys under tag sets for targeted invalidation
 * - invalidateTags: atomic invalidation via EVAL (with safe fallback)
 * - stableKeyFromFilters: deterministic cache key generator (copied/compatible with prior impl)
 */

/* -------------------------
   stableKeyFromFilters
   ------------------------- */
export function stableKeyFromFilters(filters: Record<string, any>): string {
  const normalize = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(normalize);
    if (obj && typeof obj === "object") {
      return Object.keys(obj)
        .sort()
        .reduce((acc: Record<string, any>, key) => {
          acc[key] = normalize(obj[key]);
          return acc;
        }, {});
    }
    return obj;
  };

  const normalized = normalize(filters);
  return JSON.stringify(normalized)
    .replace(/\s+/g, "")
    .replace(/[{}"]/g, "")
    .replace(/[:,]/g, "_")
    .replace(/\W+/g, "_");
}

/* -------------------------
   cache primitives
   ------------------------- */
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn("cacheGet failed", err);
    return null;
  }
}

export async function cacheSet<T = any>(key: string, value: T, ttlSeconds = 120): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (err) {
    console.warn("cacheSet failed", err);
  }
}

/* -------------------------
   Tagging helpers
   ------------------------- */
export async function addTagsForKey(key: string, tags: string[]): Promise<void> {
  try {
    const pipeline = redis.pipeline();
    for (const t of tags) pipeline.sadd(`tag:${t}`, key);
    await pipeline.exec();
  } catch (err) {
    console.warn("addTagsForKey failed", err);
  }
}

const invalidateScript = `
  for i=1,#ARGV do
    local setKey = ARGV[i]
    local members = redis.call('SMEMBERS', setKey)
    if #members > 0 then
      redis.call('DEL', unpack(members))
    end
    redis.call('DEL', setKey)
  end
  return 1
`;

/**
 * Atomic tag invalidation: Accepts logical tag names, e.g. "users:all", "users:role:TEACHER"
 */
export async function invalidateTags(tags: string[]): Promise<void> {
  if (!tags?.length) return;
  const tagKeys = tags.map(t => `tag:${t}`);
  try {
    await redis.eval(invalidateScript, tagKeys);
  } catch (err) {
    // fallback non-atomic approach
    console.warn("invalidateTags atomic eval failed, falling back", err);
    for (const tk of tagKeys) {
      try {
        const members = await redis.smembers<string>(tk);
        if (members?.length) await redis.del(...members);
        await redis.del(tk);
      } catch (inner) {
        console.warn("invalidateTags fallback failed for", tk, inner);
      }
    }
  }
}
