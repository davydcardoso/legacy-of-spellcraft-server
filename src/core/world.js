export class World {
  constructor(zoneId) {
    this.zoneId = zoneId;
    this.players = new Map();
    this.chatBuffer = [];
  }

  ensurePlayer(id) {
    if (!this.players.has(id)) {
      this.players.set(id, {
        id,
        x: Math.floor(Math.random() * 400) + 50,
        y: Math.floor(Math.random() * 400) + 50,
        speed: 120,
        input: { up: false, down: false, left: false, right: false },
        hp: 100,
        mp: 50,
        lastSeen: Date.now(),
        inventory: [] // runtime inventory loaded from DB can be merged
      });
    }
  }

  handleInput(playerId, input) {
    const p = this.players.get(playerId);
    if (!p) return;
    p.input = input || {};
    p.lastSeen = Date.now();
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
  }

  pushChat(chat) {
    this.chatBuffer.push(chat);
    if (this.chatBuffer.length > 100) this.chatBuffer.shift();
  }

  update(dt) {
    for (const p of this.players.values()) {
      let dx = 0, dy = 0;
      if (p.input.up) dy -= 1;
      if (p.input.down) dy += 1;
      if (p.input.left) dx -= 1;
      if (p.input.right) dx += 1;

      const len = Math.hypot(dx, dy);
      if (len > 0) { dx /= len; dy /= len; }

      p.x += dx * p.speed * dt;
      p.y += dy * p.speed * dt;

      p.x = Math.max(0, Math.min(4000, p.x));
      p.y = Math.max(0, Math.min(4000, p.y));
    }
  }

  snapshot() {
    return [...this.players.values()].map(p => ({
      id: p.id,
      x: Math.round(p.x),
      y: Math.round(p.y),
      hp: p.hp,
      mp: p.mp
    }));
  }

  exportPlayerState(playerId) {
    const p = this.players.get(playerId);
    if (!p) return null;
    return {
      attributes: { hp: p.hp, mp: p.mp },
      position: { x: Math.round(p.x), y: Math.round(p.y), zone: this.zoneId },
      inventory: p.inventory
    };
  }
}
