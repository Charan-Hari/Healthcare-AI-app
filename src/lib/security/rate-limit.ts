import { redis } from "@/lib/redis/client";

type RateLimitInput = {
  key: string;
  windowMs: number;
  limit: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

const fallbackStore = new Map<string, { count: number; resetAt: number }>();

function inMemoryFallback(input: RateLimitInput): RateLimitResult {
  const now = Date.now();
  const existing = fallbackStore.get(input.key);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + input.windowMs;
    fallbackStore.set(input.key, { count: 1, resetAt });
    return { allowed: true, remaining: input.limit - 1, resetAt };
  }

  if (existing.count >= input.limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  fallbackStore.set(input.key, existing);
  return { allowed: true, remaining: input.limit - existing.count, resetAt: existing.resetAt };
}

export async function checkRateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  // If redis unavailable, fallback safely
  if (!redis) return inMemoryFallback(input);

  const now = Date.now();
  const windowKey = `${input.key}:${Math.floor(now / input.windowMs)}`;
  const ttlSeconds = Math.ceil(input.windowMs / 1000);

  try {
    if (redis.status !== "ready") {
      await redis.connect();
    }

    const count = await redis.incr(windowKey);
    if (count === 1) {
      await redis.expire(windowKey, ttlSeconds);
    }

    const windowStart = Math.floor(now / input.windowMs) * input.windowMs;
    const resetAt = windowStart + input.windowMs;

    if (count > input.limit) {
      return { allowed: false, remaining: 0, resetAt };
    }

    return {
      allowed: true,
      remaining: Math.max(input.limit - count, 0),
      resetAt,
    };
  } catch {
    return inMemoryFallback(input);
  }
}
