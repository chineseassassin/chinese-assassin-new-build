/**
 * portalRain.js - Cinematic Rain Engine for the Enter The Portal page
 */

export class PortalRain {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.drops = [];
    this.splashes = [];
    this.raf = null;
    this.running = false;
    this.w = 0;
    this.h = 0;
  }

  start() {
    this.canvas = document.getElementById('portal-rain-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.running = true;
    this.spawnDrops(220);
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  resize() {
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w;
    this.canvas.height = this.h;
  }

  spawnDrops(count) {
    for (let i = 0; i < count; i++) {
      this.drops.push(this.newDrop(true));
    }
  }

  newDrop(random) {
    const speed  = 14 + Math.random() * 18;
    const length = 18 + Math.random() * 32;
    const angle  = 72 + Math.random() * 8;
    const rad    = (angle * Math.PI) / 180;
    return {
      x:     Math.random() * (this.w + 200) - 100,
      y:     random ? Math.random() * this.h : -length,
      dx:    Math.sin(rad) * speed,
      dy:    Math.cos(rad) * speed,
      len:   length,
      width: 0.6 + Math.random() * 0.9,
      alpha: 0.25 + Math.random() * 0.45,
      r:     180 + Math.floor(Math.random() * 60),
      g:     210 + Math.floor(Math.random() * 40),
      b:     255,
    };
  }

  spawnSplash(x, y) {
    const count = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI;
      const spd = 1.5 + Math.random() * 3;
      this.splashes.push({
        x, y,
        vx:    Math.cos(ang) * spd * (Math.random() < 0.5 ? -1 : 1),
        vy:   -Math.sin(ang) * spd,
        life:  1.0,
        decay: 0.07 + Math.random() * 0.06,
        r:     0.8 + Math.random() * 1.8,
        alpha: 0.55 + Math.random() * 0.35,
      });
    }
  }

  loop() {
    if (!this.running) return;
    this.raf = requestAnimationFrame(() => this.loop());
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      d.x += d.dx;
      d.y += d.dy;
      ctx.save();
      ctx.globalAlpha = d.alpha;
      ctx.strokeStyle = `rgb(${d.r},${d.g},${d.b})`;
      ctx.lineWidth   = d.width;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.dx * (d.len / d.dy), d.y - d.len);
      ctx.stroke();
      ctx.restore();
      if (d.y > this.h + 20 || d.x > this.w + 100) {
        if (d.y > this.h - 10 && d.y < this.h + 20) this.spawnSplash(d.x, this.h);
        this.drops[i] = this.newDrop(false);
      }
    }

    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.x += s.vx; s.y += s.vy; s.vy += 0.18; s.life -= s.decay;
      if (s.life <= 0) { this.splashes.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = s.alpha * s.life;
      ctx.fillStyle   = 'rgba(180,220,255,1)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const mist = ctx.createLinearGradient(0, this.h * 0.75, 0, this.h);
    mist.addColorStop(0, 'rgba(100,140,200,0)');
    mist.addColorStop(1, 'rgba(100,140,200,0.08)');
    ctx.fillStyle = mist;
    ctx.fillRect(0, this.h * 0.75, this.w, this.h * 0.25);
  }
}
