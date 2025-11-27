export class GameLoop {
  constructor(world, opts = {}) {
    this.world = world;
    this.tps = opts.tps || 20;
    this.interval = 1000 / this.tps;
    this.lastTime = Date.now();
    this.timer = null;
    this.onSnapshot = opts.onSnapshot || null;
  }

  start() {
    if (this.timer) return;
    this.lastTime = Date.now();
    this.timer = setInterval(() => {
      const now = Date.now();
      const dt = (now - this.lastTime) / 1000;
      this.lastTime = now;

      this.world.update(dt);
      const snap = this.world.snapshot();
      if (this.onSnapshot) this.onSnapshot(snap);
    }, this.interval);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
