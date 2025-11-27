import uWS from "uWebSockets.js";
import { v4 as uuidv4 } from "uuid";

import { initRedis } from "./core/game/state.js";
import { handleMessage } from "./core/handler.js";

import ZoneManager from "./core/zoneManager.js";

const PORT = process.env.PORT || 3000;

await initRedis(); 
await ZoneManager.init(); 

const app = uWS.App();

app.ws("/*", {
  idleTimeout: 32,
  maxBackpressure: 1024,
  open: (ws) => {
    ws.id = uuidv4();
    ws.isAlive = true;
    ws.user = null;
    ws.zoneId = null;
    ws.send(JSON.stringify({ type: "sys:welcome", payload: { wsId: ws.id } }));
  },

  message: async (ws, message, isBinary) => {
    let msg;
    try {
      const str = Buffer.from(message).toString();
      msg = JSON.parse(str);
    } catch (err) {
      ws.send(JSON.stringify({ type: "error", payload: "invalid_json" }));
      return;
    }

    try {
      await handleMessage(ws, msg, { ZoneManager });
    } catch (err) {
      console.error("handleMessage error", err);
      try {
        ws.send(JSON.stringify({ type: "error", payload: "server_error" }));
      } catch {}
    }
  },

  close: (ws, code, message) => {
    // cleanup: remove player from zone
    if (ws.zoneId) {
      ZoneManager.removePlayerFromZone(ws.zoneId, ws.id).catch((err) => console.error(err));
    }
    // optional: persist session / char state
  },
});

app.listen(PORT, (token) => {
  if (token) console.log(`uWS listening on ${PORT}`);
  else console.error("uWS failed to listen");
});
