// src/core/handler.js

import { processCastSpell } from "./game/combat.js";
import { getCharRuntimeState, setCharRuntimeState } from "./game/state.js";

/**
 * handleMessage(ws, msg, ctx)
 * ctx.ZoneManager is injected by server.js
 */
export async function handleMessage(ws, msg, { ZoneManager }) {
  const { type, payload } = msg;

  switch (type) {
    case "auth:set": {
      // Simple: client provides { charId, name } after login done elsewhere
      ws.user = { charId: payload.charId, name: payload.name };
      const exists = await getCharRuntimeState(payload.charId);
      if (!exists) {
        await setCharRuntimeState(payload.charId, { zoneId: null, pos: payload.pos || { x: 0, y: 0 } });
      }

      ws.send(JSON.stringify({ type: "auth:ok", payload: { charId: payload.charId } }));
      return;
    }
    case "zone:enter": {
      const { zoneId, pos } = payload;
      if (!ws.user?.charId) {
        ws.send(JSON.stringify({ type: "error", payload: "not_auth" }));
        return;
      }

      const fromZone = ws.zoneId;
      await ZoneManager.movePlayer(ws, fromZone, zoneId, { charId: ws.user.charId, pos });

      ws.send(JSON.stringify({ type: "zone:entered", payload: { zoneId } }));
      return;
    }
    case "zone:change": {
      await handleMessage(ws, { type: "zone:enter", payload }, { ZoneManager });
      return;
    }
    case "player:action": {
      // Example payload: { action: 'cast_spell', spellId, targetId }
      if (!ws.user?.charId) {
        ws.send(JSON.stringify({ type: "error", payload: "not_auth" }));
        return;
      }

      const { action } = payload;
      if (action === "cast_spell") {
        const result = await processCastSpell(ws.user.charId, payload.spellId, payload.targetId);
        ws.send(JSON.stringify({ type: "player:action:result", payload: result }));
        if (ws.zoneId) {
          const zone = ZoneManager.getZone(ws.zoneId);
          if (zone) zone.broadcast({ type: "combat:event", payload: result }, { exclude: null });
        }
      }

      return;
    }
    case "chat:msg": {
      // payload: { channel: 'zone'|'global', text }
      if (!ws.user?.charId) {
        ws.send(JSON.stringify({ type: "error", payload: "not_auth" }));
        return;
      }
      const channel = payload.channel || "zone";
      if (channel === "zone") {
        if (!ws.zoneId) {
          ws.send(JSON.stringify({ type: "error", payload: "not_in_zone" }));
          return;
        }
        const zone = ZoneManager.getZone(ws.zoneId);
        zone.broadcast({ type: "chat:msg", payload: { from: ws.user.charId, text: payload.text } });
      } else {
        ws.send(JSON.stringify({ type: "chat:msg", payload: { from: ws.user.charId, text: payload.text } }));
      }
      return;
    }

    default:
      ws.send(JSON.stringify({ type: "error", payload: "unknown_type" }));
  }
}
