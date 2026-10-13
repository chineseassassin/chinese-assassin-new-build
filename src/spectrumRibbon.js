import { audioManager } from './audio.js';

export class SpectrumRibbon {
  constructor() {
    this.canvas = document.getElementById('spectrum-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.active = false;
    this.raf = null;
    this.phase = 0;

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _getCardCenters() {
    const portals = Array.from(document.querySelectorAll('.realm-portal'));
    if (portals.length < 3) return [];

    const centers = [];
    portals.forEach(portal => {
      const rect = portal.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        centers.push({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          isHovered: portal.dataset.isHovered === 'true'
        });
      }
    });

    return centers;
  }

  _tick() {
    if (!this.active) return;
    const { ctx, canvas } = this;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centers = this._getCardCenters();
    if (centers.length < 3) {
      this.raf = requestAnimationFrame(() => this._tick());
      return;
    }

    const isPlaying = audioManager && audioManager.isPlaying;
    const freq = isPlaying ? audioManager.getFrequencyData() : { bass: 0, mid: 0, treble: 0 };
    const waveform = isPlaying ? audioManager.getWaveformData() : null;
    const bass = freq.bass || 0;
    const mid = freq.mid || 0;

    this.phase += 0.04 + (isPlaying ? bass * 0.06 : 0);

    const n = centers.length;
    const samplesPerSegment = 24;
    const allPoints = [];

    // Interpolate points around the closed loop
    for (let i = 0; i < n; i++) {
      const p0 = centers[(i - 1 + n) % n];
      const p1 = centers[i];
      const p2 = centers[(i + 1) % n];
      const p3 = centers[(i + 2) % n];

      for (let s = 0; s < samplesPerSegment; s++) {
        const t = s / samplesPerSegment;
        const t2 = t * t;
        const t3 = t2 * t;

        // Catmull-Rom spline interpolation
        const x = 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
        );

        const y = 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
        );

        // Calculate normal vector perpendicular to curve
        const dx = p2.x - p0.x;
        const dy = p2.y - p0.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        // Waveform displacement
        let waveOffset = 0;
        if (isPlaying) {
          const globalIdx = (i * samplesPerSegment + s) % (waveform ? waveform.length : 128);
          const rawWave = waveform ? (waveform[globalIdx] - 128) / 128 : 0;
          const harmonic = Math.sin(t * Math.PI * 4 + this.phase * 2 + i) * (6 + bass * 18);
          waveOffset = rawWave * (12 + bass * 30) + harmonic;
        } else {
          // Subtle breathing when paused
          waveOffset = Math.sin(t * Math.PI * 2 + this.phase * 0.8 + i) * 2.5;
        }

        allPoints.push({
          x: x + nx * waveOffset,
          y: y + ny * waveOffset
        });
      }
    }

    if (allPoints.length < 4) {
      this.raf = requestAnimationFrame(() => this._tick());
      return;
    }

    ctx.globalCompositeOperation = 'lighter';

    // 1. Outer Neon Glow
    ctx.beginPath();
    ctx.moveTo(allPoints[0].x, allPoints[0].y);
    for (let j = 1; j < allPoints.length; j++) {
      ctx.lineTo(allPoints[j].x, allPoints[j].y);
    }
    ctx.closePath();

    const alphaGlow = isPlaying ? (0.35 + bass * 0.45) : 0.20;
    ctx.strokeStyle = `rgba(255, 30, 60, ${alphaGlow})`;
    ctx.lineWidth = isPlaying ? (6 + bass * 6) : 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(255, 20, 50, 0.9)';
    ctx.shadowBlur = isPlaying ? (20 + bass * 25) : 10;
    ctx.stroke();

    // 2. Mid Laser Beam (Vibrant Crimson-Orange)
    ctx.beginPath();
    ctx.moveTo(allPoints[0].x, allPoints[0].y);
    for (let j = 1; j < allPoints.length; j++) {
      ctx.lineTo(allPoints[j].x, allPoints[j].y);
    }
    ctx.closePath();

    const alphaBeam = isPlaying ? 0.90 : 0.45;
    ctx.strokeStyle = `rgba(255, 75, 95, ${alphaBeam})`;
    ctx.lineWidth = isPlaying ? 2.8 : 1.8;
    ctx.shadowBlur = 0;
    ctx.stroke();

    // 3. Ultra-Bright White-Hot Core Line
    ctx.beginPath();
    ctx.moveTo(allPoints[0].x, allPoints[0].y);
    for (let j = 1; j < allPoints.length; j++) {
      ctx.lineTo(allPoints[j].x, allPoints[j].y);
    }
    ctx.closePath();

    ctx.strokeStyle = `rgba(255, 255, 255, ${isPlaying ? 0.95 : 0.6})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 4. Energy Node Rings at each card center
    centers.forEach((c, idx) => {
      const ringRadius = 14 + (isPlaying ? bass * 14 + Math.sin(this.phase * 3 + idx) * 4 : 0);
      const ringAlpha = isPlaying ? (0.5 + bass * 0.4) : 0.25;

      ctx.beginPath();
      ctx.arc(c.x, c.y, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 50, 80, ${ringAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${ringAlpha * 1.5})`;
      ctx.fill();
    });

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
