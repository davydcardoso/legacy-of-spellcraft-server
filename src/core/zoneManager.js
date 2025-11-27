// src/coere/zoneManager.js

import Zone from "./zone.js";

/**
 * ZoneManager: mantém um mapa zoneId -> Zone instance.
 * - cria zones on-demand
 * - remove/add players para zones
 * - auxilia na transição entre zones
 */
const zones = new Map();

export default {
  async init() {
    this.createZone("hogwarts_zone", { tickRate: 200 });
    this.createZone("forbidden_forest", { tickRate: 300 });
    this.createZone("hogsmeade", { tickRate: 250 });
    console.log("ZoneManager initialized with default zones");
  },

  createZone(zoneId, opts = {}) {
    if (zones.has(zoneId)) return zones.get(zoneId);
    const z = new Zone(zoneId, opts);
    zones.set(zoneId, z);
    return z;
  },

  getZone(zoneId) {
    return zones.get(zoneId);
  },

  listZones() {
    return Array.from(zones.keys());
  },

  async addPlayerToZone(zoneId, ws, playerMeta = {}) {
    const zone = this.getZone(zoneId) || this.createZone(zoneId);
    await zone.addPlayerToZone(ws, playerMeta);
    return zone;
  },

  async removePlayerFromZone(zoneId, wsId) {
    const zone = this.getZone(zoneId);
    if (!zone) return;
    await zone.removePlayer(wsId);
  },

  async movePlayer(ws, fromZoneId, toZoneId, playerMeta = {}) {
    // atomic-ish: remove from old, add to new, return snapshot
    if (fromZoneId) {
      const from = this.getZone(fromZoneId);
      if (from) await from.removePlayer(ws.id);
    }

    const to = await this.addPlayerToZone(toZoneId, ws, playerMeta);
    return to;
  },
};
