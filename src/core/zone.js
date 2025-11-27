// src/core/zone.js

import EventEmitter from "events";
import { setCharZoneState, getCharRuntimeState } from "./game/state.js";

class Zone extends EventEmitter {
  constructor(zoneId, { tickRate = 200 } = {}) {
    super();
    this.zoneId = zoneId;
    this.players = new Map(); // wsId -> { ws, charId }
    this.mobs = new Map(); // mobId -> mobState
    this.tickRate = tickRate;
    this._tickHandle = null;
    this._startLoop();
  }

  _startLoop() {
    if (this._tickHandle) return;
    this._tickHandle = setInterval(() => this._tick(), this.tickRate);
  }

  _stopLoop() {
    if (this._tickHandle) {
      clearInterval(this._tickHandle);
      this._tickHandle = null;
    }
  }

  /**
   * Adiciona player na zone/map do game
   * @param {*} ws
   * @param {charId, pos} playerMeta
   */
  async addPlayer(ws, playerMeta = {}) {
    const entry = { ws, charId: playerMeta.charId || null };
    this.players.set(ws.id, entry);
    ws.zoneId = this.zoneId;

    if (entry.charId) {
      await setCharZoneState(entry.charId, { zoneId: this.zoneId, pos: playerMeta.pos || { x: 0, y: 0 } });
    }

    const snapshot = await this._createSnapshotFor(ws.id);
    ws.send(JSON.stringify({ type: "zone:snapshot", payload: snapshot }));

    this.broadcast({ type: "zone:player_join", payload: { wsId: ws.id, charId: entry.charId } }, { exclude: ws.id });
  }

  async removePlayer(wsId) {
    const ent = this.players.get(wsId);
    if (!ent) return;
    const { ws, charId } = ent;

    this.players.delete(wsId);
    if (charId) {
      await setCharZoneState(charId, { zoneId: null });
    }

    this.broadcast({ type: "zone:player_leave", payload: { wsId } }, { exclude: wsId });
  }

  broadcast(msgObj, { exclude } = {}) {
    const raw = JSON.stringify(msgObj);
    for (const [wsId, ent] of this.players) {
      if (exclude && wsId === exclude) continue;
      try {
        ent.ws.send(raw);
      } catch (ex) {
        /* ignore */
      }
    }
  }

  /**
   * _createSnapshotFor: cria um snapshot leve do estado atual da zone para um player
   * @param {*} wsId
   * @returns
   */
  async _createSnapshotFor(wsId) {
    // Compose a small snapshot: players list (id + charId + pos), mobs list
    const players = [];
    for (const [id, ent] of this.players) {
      // attempt to fetch runtime state from Redis for accurate pos/hp
      const runtime = ent.charId ? await getCharRuntimeState(ent.charId) : null;
      players.push({
        wsId: id,
        charId: ent.charId,
        pos: runtime?.pos || { x: 0, y: 0 },
        hp: runtime?.hp ?? null,
      });

      const mobs = Array.from(this.mobs.values());
      return { zoneId: this.zoneId, players, mobs };
    }
  }

  /**
   * Zone tick: atualiza estado da zone, NPCs, mobs, etc.
   */
  async _tick() {
    // Tick: update mobs AI, process area effects, broadcast small updates
    // For performance: build delta and broadcast only deltas
    try {
      for (const [mobId, mob] of this.mobs) {
        // TODO: implement real AI
        // mob.pos.x += 0; mob.pos.y += 0;
      }

      // Example: gather players runtime state and broadcast health/pos updates
      const updates = [];
      for (const [wsId, ent] of this.players) {
        if (!ent.charId) continue;
        const state = await getCharRuntimeState(ent.charId);
        if (!state) continue;
        updates.push({ wsId, charId: ent.charId, pos: state.pos, hp: state.hp, mp: state.mp });
      }

      if (updates.length) {
        this.broadcast({ type: "zone:update", payload: { updates } });
      }
    } catch (ex) {
      console.error(`Zone ${this.zoneId} tick error`, err);
    }
  }

  spawnMob(mobState) {
    const id = `mob:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    this.mobs.set(id, { id, ...mobState });
    this.broadcast({ type: "zone:mob_spawn", payload: { mob: this.mobs.get(id) } });
    return id;
  }

  despawnMob(mobId) {
    if (this.mobs.has(mobId)) {
      this.mobs.delete(mobId);
      this.broadcast({ type: "zone:mob_despawn", payload: { mobId } });
    }
  }
}

export default Zone;