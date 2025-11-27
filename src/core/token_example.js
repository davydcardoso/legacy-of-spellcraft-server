import { createToken } from './auth.js';
const t = createToken({ sub: "player_test", name: "Test Player" });
console.log("TOKEN:", t);
console.log("ws://localhost:9001/?token=" + t + "&zone=1");
