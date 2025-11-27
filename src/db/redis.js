// src/db/redis.js

import Redis from "ioredis";
let redis;

export async function initRedis() {
  if (redis) return redis;
  redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");
  redis.on("error", (e) => console.error("Redis error", e));
  return redis;
}
