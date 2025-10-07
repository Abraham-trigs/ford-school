// /lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

/**
 * Configures a distributed rate limiter using Upstash Redis.
 * Uses a sliding window algorithm to smooth out bursts.
 */
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1m"), // 10 requests/min per key
  prefix: "ratelimit",
});

/**
 * Example usage:
 * const { success } = await rateLimiter.limit(userId)
 * if (!success) throw new Error("RateLimit");
 */
