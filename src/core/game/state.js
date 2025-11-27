// src/core/game/state.js

import Redis from "ioredis";
let redis;

export async function initRedis() {
  if (redis) return redis;
  redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");
  redis.on("error", (e) => console.error("Redis error", e));
  return redis;
}

/**
 * Salva estado runtime do character
 * @param {*} charId 
 * @param {*} state 
 */
export async function setCharRuntimeState(charId, state) {
  if (!redis) await initRedis();
  await redis.set(`char:state:${charId}`, JSON.stringify(state));
}

/** Obtém estado runtime do character
 * @param {*} charId 
 * @returns 
 */
export async function getCharRuntimeState(charId) {
  if (!redis) await initRedis();
  const raw = await redis.get(`char:state:${charId}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/** Atualiza estado de zone do character
 * @param {*} charId 
 * @param {*} param1 
 */
export async function setCharZoneState(charId, { zoneId, pos }) {
  const state = (await getCharRuntimeState(charId)) || {};
  state.zoneId = zoneId;
  if (pos) state.pos = pos;
  await setCharRuntimeState(charId, state);
}

/** 
 * Auxiliar simples para bloqueios. Use em seções críticas (comércio, saque).
 * Uso: await acquireLock('char:123', 5000) -> retorna verdadeiro se bloqueado
 * Implementado com a chave SET NX PX
 */
export async function acquireLock(key, ttl = 5000) {
  if (!redis) await initRedis();
  const lockId = `${process.pid}:${Date.now()}:${Math.random().toString(36).slice(2, 6)}`;
  const ok = await redis.set(`lock:${key}`, lockId, "NX", "PX", ttl);
  return ok ? lockId : null;
}

export async function releaseLock(key, lockId) {
  if (!redis) await initRedis();
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  await redis.eval(script, 1, `lock:${key}`, lockId);
}

