import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisEnabled = (process.env.REDIS_ENABLED || "true") === "true";

const globalForRedis = globalThis as unknown as { redis?: Redis | null };

export const redis =
  globalForRedis.redis ??
  (redisEnabled
    ? new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        enableReadyCheck: true,
        lazyConnect: true,
      })
    : null);

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
