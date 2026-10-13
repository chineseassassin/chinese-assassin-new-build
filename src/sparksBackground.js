import { audioManager } from './audio.js';

export class SparksBackground {
  constructor() {
    this.canvas = document.getElementById('sparks-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.sparks = [];
    this.maxSparks = 110;
    this.active = false;
    this.raf = null;

    this._resize();
    window.addEventListener('resize', () => this._resize());

    // Fiery spark temperatures: white-hot -> bright gold -> orange -> crimson
    this.colors = [
      { r: 255, g: 255, b: 210 },
      { r: 255, g: 215, b:  75 },
      { r: 255, g: 145, b:  25 },
      { r: 255, g:  65, b:  35 },
      { r: 220, g:  25, b:  45 },
    ];

    for (let i = 0; i < this.maxSparks; i++) {
      this.sparks.push(this._createSpark(true));
    }
  }

  _resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _createSpark(randomY = false) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const col = this.colors[Math.floor(Math.random() * this.colors.length)];

    const size = 1.2 + Math.random() * 2.6;
    const life = 130 + Math.random() * 150;
    const age = randomY ? Math.random() * life : 0;

    return {
      x: Math.random() * (W + 200) - 100,
      y: randomY ? Math.random() * H : H + 10 + Math.random() * 30,
      vx: (Math.random() - 0.42) * 1.4 + 0.5,
      vy: -(1.4 + Math.random() * 2.6),
      size,
      col,
      alpha: 0.6 + Math.random() * 0.4,
      flickerSpeed: 0.08 + Math.random() * 0.14,
      flickerOffset: Math.random() * Math.PI * 2,
      life,
      age,
      tailLength: 4 + Math.random() * 8,
    };
  }

  _tick() {
    if (!this.active) return;
    const { ctx, canvas } = this;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isPlaying = audioManager && audioManager.isPlaying;
    const freq = isPlaying ? audioManager.getFrequencyData() : { bass: 0 };
    const bassKick = freq.bass || 0;

    // Spawn burst of sparks on audio bass hits
    if (isPlaying && bassKick > 0.40 && Math.random() < 0.5) {
      if (this.sparks.length < this.maxSparks + 30) {
        this.sparks.push(this._createSpark(false));
      }
    }

    ctx.globalCompositeOperation = 'lighter';

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];

      s.x += s.vx + Math.sin(s.age * 0.04 + s.flickerOffset) * 0.7;
      s.y += s.vy - (bassKick * 0.9);
      s.age++;

      const progress = s.age / s.life;
      let fade = 1.0;
      if (progress < 0.12) fade = progress / 0.12;
      else if (progress > 0.65) fade = (1.0 - progress) / 0.35;
      fade = Math.max(0, Math.min(1, fade));

      const flicker = 0.75 + 0.25 * Math.sin(s.age * s.flickerSpeed + s.flickerOffset);
      const currentAlpha = s.alpha * fade * flicker;

      if (currentAlpha > 0.01) {
        const { r, g, b } = s.col;

        const tailX = s.x - s.vx * s.tailLength;
        const tailY = s.y - s.vy * s.tailLength;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},${currentAlpha * 0.55})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},${currentAlpha})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = s.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        // Hot bright core
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.95})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.65, 0, Math.PI * 2);
        ctx.fill();

        // Soft ember halo
        if (s.size > 1.8) {
          const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3.8);
          halo.addColorStop(0, `rgba(${r},${g},${b},${currentAlpha * 0.4})`);
          halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 3.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (s.age >= s.life || s.y < -40 || s.x > canvas.width + 150 || s.x < -150) {
        this.sparks[i] = this._createSpark(false);
      }
    }

    ctx.globalCompositeOperation = 'source-over';

    this.raf = requestAnimationFrame(() => this._tick());
  }

  start() {
    if (this.active) return;
    this.active = true;
    this._resize();
    this._tick();
  }

  stop() {
    this.active = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }
}
