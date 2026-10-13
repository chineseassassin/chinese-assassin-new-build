import gsap from 'gsap';

/**
 * ============================================================================
 * HOLLYWOOD AAA DUAL-PAGE CINEMATIC INTRO ENGINE
 * ============================================================================
 * Features:
 * - Stage 1: Intro Page 1 (LANDINGPAGE1.0) Awakening in Darkness
 * - Stage 2: 3D Morph & Lightning Shockwave Transition to Intro Page 2 (INTRO-PAGE-2)
 * - Volumetric Lighting & Ray-traced Reflection simulation
 * - Physically-accurate rain, fog, and ember particle dynamics
 * - Procedural Web Audio 3D Sound Engine (Sub-bass, Thunder, Wind, Electric Arcs)
 * - Smooth AAA Game Crane Camera Push into Interactive Homepage
 */
export class CinematicIntro {
  constructor() {
    this.container      = document.getElementById('cinematic-intro');
    this.canvas         = document.getElementById('cinematic-intro-canvas');
    this.grainCanvas    = document.getElementById('grain-canvas');
    this.lightningFlash = document.getElementById('cinematic-lightning-flash');

    if (!this.container || !this.canvas) return;

    // Respect initial hidden state; only show when triggered
    if (this.container.style.display !== 'none') {
      this.container.style.display = 'flex';
      this.container.style.opacity = '1';
    }

    this.ctx      = this.canvas.getContext('2d');
    this.grainCtx = this.grainCanvas ? this.grainCanvas.getContext('2d') : null;

    // ── Engine State & Camera ─────────────────────────────────────────────
    this.isRunning     = true;
    this.startTime     = Date.now();
    this.mouse         = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.camera        = { scale: 1.0, x: 0, y: 0, shakeX: 0, shakeY: 0 };
    this.transitioning = false;
    this.doorsOpening  = false;

    // ── 3D Slide & Scale Morph Dual-Page State ─────────────────────────────
    this.p1State = { x: 0, scale: 1.0, alpha: 1.0, rotY: 0 };
    this.p2State = { x: 100, scale: 0.92, alpha: 0.0, rotY: 15 };

    this.portalEnergy   = 0.0;
    this.runeGlow       = 0.0;

    this.hudText        = "CHINESE ASSASSIN — ANCIENT TEMPLE AWAKENING";
    this.hudAlpha       = 1.0;

    // ── Load Hero Artwork (Intro Page 2 -> Intro Page 5 Sequence) ──────────
    const loadImage = (sources, callback) => {
      let index = 0;
      const tryNext = () => {
        if (index >= sources.length) return;
        const img = new Image();
        img.onload = () => callback(img);
        img.onerror = () => {
          index++;
          tryNext();
        };
        img.src = sources[index];
      };
      tryNext();
    };

    this.p1Loaded = false;
    loadImage(['/Images/INTRO-PAGE-2.png', '/INTRO-PAGE-2.png', 'INTRO-PAGE-2.png'], (img) => {
      this.p1Image  = img;
      this.p1Loaded = true;
    });

    this.p2Loaded = false;
    loadImage(['/Images/ICON PAGE-5.png', '/Images/ICON%20PAGE-5.png', '/ICON PAGE-5.png', '/ICON%20PAGE-5.png', 'ICON PAGE-5.png'], (img) => {
      this.p2Image  = img;
      this.p2Loaded = true;
    });

    // ── Particle Systems ──────────────────────────────────────────────────
    this.embers = [];
    this.rainDrops = [];
    this.fogNodes = [];
    this.lightningArcs = [];
    this.shockwaves = [];

    this.initCanvasSize();
    this.initEmbers();
    this.initRain();
    this.initFog();
    this.initSmoke();
    this.initEvents();
    this.initAudioEngine();

    // Start Main Render & Animation Loops
    requestAnimationFrame(() => this.renderLoop());
    this.startDualPageCinematicTimeline();
  }

  // ── Canvas Sizing & DPR Match ─────────────────────────────────────────────
  initCanvasSize() {
    const resize = () => {
      this.width  = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width  = this.width;
      this.canvas.height = this.height;
      if (this.grainCanvas) {
        this.grainCanvas.width  = this.width;
        this.grainCanvas.height = this.height;
      }
    };
    resize();
    window.addEventListener('resize', resize);
  }

  // ── Drifting Crimson Embers ───────────────────────────────────────────────
  initEmbers() {
    for (let i = 0; i < 180; i++) {
      this.embers.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2.8 + 0.6,
        dx: (Math.random() - 0.5) * 0.7,
        dy: -(Math.random() * 1.6 + 0.4),
        opacity: Math.random() * 0.85 + 0.15,
        hue: Math.floor(Math.random() * 25)
      });
    }
  }

  // ── Physically Accurate Rain Drops ────────────────────────────────────────
  initRain() {
    for (let i = 0; i < 140; i++) {
      this.rainDrops.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        len: Math.random() * 22 + 10,
        speed: Math.random() * 18 + 14,
        opacity: Math.random() * 0.4 + 0.1
      });
    }
  }

  // ── Volumetric Rolling Fog Layer ──────────────────────────────────────────
  initFog() {
    for (let i = 0; i < 12; i++) {
      this.fogNodes.push({
        x: Math.random() * window.innerWidth,
        y: window.innerHeight * 0.65 + (Math.random() - 0.5) * 150,
        r: Math.random() * 250 + 200,
        dx: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.25 + 0.05
      });
    }
  }

  // ── Floating Volumetric Smoke Puffs ─────────────────────────────────────
  initSmoke() {
    this.smokePuffs = [];
    for (let i = 0; i < 28; i++) {
      this.smokePuffs.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.95,
        r: Math.random() * 220 + 140,
        dx: (Math.random() - 0.5) * 0.45,
        dy: -(Math.random() * 0.35 + 0.1),
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.003,
        alpha: Math.random() * 0.22 + 0.08
      });
    }
  }

  // ── Web Audio Procedural Cinematic Sound Engine ───────────────────────────
  initAudioEngine() {
    const startAudioContext = () => {
      if (this.audioCtx) return;
      try {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.setupCinematicAudioNodes();
      } catch (e) {
        console.warn('Web Audio API not initialized', e);
      }
      window.removeEventListener('pointerdown', startAudioContext);
      window.removeEventListener('keydown', startAudioContext);
    };
    window.addEventListener('pointerdown', startAudioContext);
    window.addEventListener('keydown', startAudioContext);
  }

  setupCinematicAudioNodes() {
    // Continuous audio humming disabled per user request
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch (e) {}
      this.audioCtx = null;
    }
  }

  playThunderStrike() {
    // Disabled humming audio per user request
  }

  playPortalEruptImpact() {
    // Disabled humming audio per user request
  }

  flashLightning() {
    if (this.lightningFlash) {
      this.lightningFlash.style.opacity = '1';
      setTimeout(() => { this.lightningFlash.style.opacity = '0'; }, 110);
    }
    this.camera.shakeX = (Math.random() - 0.5) * 32;
    this.camera.shakeY = (Math.random() - 0.5) * 22;
    this.playThunderStrike();
  }

  // ── HOLLYWOOD DUAL-PAGE CINEMATIC TIMELINE (EXTENDED TO 11.5s) ─────────────
  startDualPageCinematicTimeline() {
    // STAGE 1: INTRO PAGE 2 AWAKENING (0.0s – 4.5s)
    this.hudText = "CHINESE ASSASSIN — ANCIENT TEMPLE AWAKENING (PAGE 2)";
    gsap.to(this.p1State, { alpha: 1.0, duration: 2.2, ease: 'sine.inOut' });
    gsap.to(this, { hudAlpha: 1.0, duration: 2.0, delay: 0.5 });
    gsap.to(this.camera, { scale: 1.08, duration: 4.5, ease: 'sine.inOut' });

    // STAGE 2: LIGHTNING OPTICAL FLASH & PURE CROSS-DISSOLVE (4.5s – 7.5s)
    setTimeout(() => {
      this.hudText = "[ SUPERNATURAL PORTAL ACTIVATION — ENTER THE PORTAL (PAGE 5) ]";
      this.flashLightning();

      // Shockwave Ring Explosion
      this.shockwaves.push({
        x: this.width / 2,
        y: this.height * 0.45,
        radius: 20,
        maxRadius: Math.max(this.width, this.height) * 0.95,
        alpha: 1.0
      });

      this.p1State.x = 0;
      this.p1State.rotY = 0;
      this.p1State.scale = 1.0;
      this.p2State.x = 0;
      this.p2State.rotY = 0;

      // Pure cross-dissolve: Page 1 fades out, Page 2 fades in cleanly centered
      gsap.to(this.p1State, { alpha: 0.0, duration: 1.6, ease: 'power2.inOut' });
      
      this.p2State.alpha = 0.0;
      gsap.to(this.p2State, { alpha: 1.0, scale: 1.0, duration: 1.6, ease: 'power2.inOut' });

      gsap.to(this, { runeGlow: 1.0, portalEnergy: 0.85, duration: 2.2 });
    }, 4500);

    // STAGE 3: INTRO PAGE 5 PEAK STORM & AUDIO SPECTRUM RINGS (7.5s – 11.5s)
    setTimeout(() => {
      this.hudText = "[ CHINESE ASSASSIN GATEWAY OPEN — PREPARING TEMPLE DOORS ]";
      this.flashLightning();
      gsap.to(this, { portalEnergy: 1.0, duration: 2.0 });
    }, 7500);

    // STAGE 4: AUTOMATIC SEAMLESS TRANSITION TO DOOR PAGE (11.5s)
    setTimeout(() => {
      this.triggerTransitionToDoors();
    }, 11500);
  }

  // ── Event Handlers ────────────────────────────────────────────────────────
  initEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / this.width  - 0.5) * 2;
      this.mouse.targetY = (e.clientY / this.height - 0.5) * 2;
    });

    if (this.canvas) {
      this.canvas.addEventListener('click', () => {
        this.triggerTransitionToDoors();
      });
    }

    const skipBtn = document.getElementById('skip-intro-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        skipBtn.classList.add('skip-hidden');
        this.triggerTransitionToDoors();
      });
    }

    const doorBtn = document.getElementById('door-enter-btn');
    if (doorBtn) {
      doorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.startFaceIdScanSequence();
      });
    }

    const cinematicBtn = document.getElementById('cinematic-enter-btn');
    if (cinematicBtn) {
      cinematicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.triggerTransitionToDoors();
      });
    }
  }

  // ── Biometric 4-Image FaceID Scan Sequence ──────────────────────────────
  startFaceIdScanSequence() {
    if (this.scanning || this.doorsOpening) return;
    this.scanning = true;

    const doorBtn  = document.getElementById('door-enter-btn');
    const faceBox  = document.getElementById('portal-faceid-box');
    const scanImg  = document.getElementById('faceid-scan-img');
    const badge    = document.getElementById('faceid-match-badge');
    const status   = document.getElementById('faceid-status-text');
    const fill     = document.getElementById('faceid-progress-fill');
    const pct      = document.getElementById('faceid-pct-text');
    const granted  = document.getElementById('faceid-granted-text');

    if (doorBtn) {
      gsap.to(doorBtn, { opacity: 0, scale: 0.8, duration: 0.25, onComplete: () => { doorBtn.style.display = 'none'; } });
    }

    if (faceBox) {
      faceBox.style.display = 'flex';
      gsap.fromTo(faceBox, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)', delay: 0.15 });
    }

    const scanSteps = [
      { src: '/FACEID1.jpg', fallback: '/FACEID1.JPG.png', label: 'ANALYZING BIOMETRIC SUBJECT 1/4...', badge: 'FACEID: 1/4' },
      { src: '/FACEID2.jpg', fallback: '/FACEID2.JPG.png', label: 'VERIFYING NEURAL PATTERNS 2/4...', badge: 'FACEID: 2/4' },
      { src: '/FACEID3.jpg', fallback: '/FACEID3.JPG.png', label: 'MATCHING ASSASSIN IDENTITY 3/4...', badge: 'MATCH: 98.4%' },
      { src: '/FACEID4.jpg', fallback: '/FACEID4.JPG.png', label: 'BIOMETRIC VERIFICATION COMPLETE 4/4!', badge: 'VERIFIED 4/4' },
    ];

    let currentStep = 0;
    let progress = 0;

    const updateStep = (index) => {
      const step = scanSteps[index];
      if (!step) return;

      if (scanImg) {
        gsap.to(scanImg, { opacity: 0.3, duration: 0.08, yoyo: true, repeat: 1, onComplete: () => {
          scanImg.src = step.src;
          scanImg.onerror = () => { scanImg.src = step.fallback; };
        }});
      }
      if (status) status.textContent = step.label;
      if (badge)  badge.textContent  = step.badge;
    };

    updateStep(0);

    const timer = setInterval(() => {
      progress += 2;
      if (fill) fill.style.width = `${progress}%`;
      if (pct)  pct.textContent  = `${progress}%`;

      if (progress >= 25 && currentStep === 0) {
        currentStep = 1;
        updateStep(1);
      } else if (progress >= 50 && currentStep === 1) {
        currentStep = 2;
        updateStep(2);
      } else if (progress >= 75 && currentStep === 2) {
        currentStep = 3;
        updateStep(3);
      }

      if (progress >= 100) {
        clearInterval(timer);
        if (status) {
          status.textContent = 'ACCESS: GRANTED — WELCOME ASSASSIN';
          status.style.color = '#00e5ff';
        }
        if (granted) granted.style.display = 'inline';

        setTimeout(() => {
          if (faceBox) {
            gsap.to(faceBox, { scale: 1.25, opacity: 0, duration: 0.45, ease: 'power2.in' });
          }
          this.openTempleDoors();
        }, 400);
      }
    }, 28);
  }

  triggerTransitionToDoors() {
    if (this.transitioning) return;
    this.transitioning = true;

    const skipBtn = document.getElementById('skip-intro-btn');
    if (skipBtn) skipBtn.classList.add('skip-hidden');

    const cinematicWrap = document.querySelector('.cinematic-ui-wrap');
    if (cinematicWrap) cinematicWrap.style.display = 'none';

    const doors = document.getElementById('cinematic-temple-doors');
    const faceBox = document.getElementById('portal-faceid-box');
    const doorBtn = document.getElementById('door-enter-btn');

    if (doors) {
      doors.style.display = 'block';
      gsap.to(doors, { opacity: 1, duration: 0.6, ease: 'power2.out' });
    }

    if (faceBox) {
      faceBox.style.display = 'none';
      faceBox.style.opacity = '0';
    }

    if (doorBtn) {
      doorBtn.style.display = 'inline-block';
      doorBtn.style.opacity = '1';
      gsap.fromTo(doorBtn, 
        { scale: 0.8, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)', delay: 0.2 }
      );
    }
  }

  openTempleDoors() {
    if (this.doorsOpening) return;
    this.doorsOpening = true;

    const leftDoor  = document.querySelector('.left-door');
    const rightDoor = document.querySelector('.right-door');

    if (leftDoor && rightDoor) {
      gsap.to(leftDoor,  { rotateY: -92, duration: 1.1, ease: 'power3.inOut' });
      gsap.to(rightDoor, { rotateY:  92, duration: 1.1, ease: 'power3.inOut' });
    }

    window.dispatchEvent(new Event('portalEntered'));

    if (this.container) {
      gsap.to(this.container, {
        opacity: 0,
        duration: 0.7,
        delay: 0.45,
        ease: 'power2.inOut',
        onComplete: () => {
          this.isRunning = false;
          this.container.style.display = 'none';
          window.location.href = '/dimension-hub.html';
        }
      });
    }
  }

  // ── HOLLYWOOD CANVAS RENDER LOOP (60 FPS RENDERER) ──────────────────────
  renderLoop() {
    if (!this.isRunning) return;

    const time = (Date.now() - this.startTime) * 0.001;

    // Mouse Parallax Damping
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Camera Shake Decay
    this.camera.shakeX *= 0.88;
    this.camera.shakeY *= 0.88;

    const ctx = this.ctx;
    const w   = this.width;
    const h   = this.height;

    // Clear Screen with Darkness
    ctx.fillStyle = '#020002';
    ctx.fillRect(0, 0, w, h);

    ctx.save();

    // Unreal Engine Quality Camera Crane Push & Parallax
    const wobX = Math.sin(time * 0.7) * 3.0;
    const wobY = Math.cos(time * 0.9) * 2.0;
    const cx = w / 2, cy = h / 2;
    ctx.translate(cx + this.camera.shakeX + wobX + this.camera.x, cy + this.camera.shakeY + wobY + this.camera.y);
    ctx.scale(this.camera.scale, this.camera.scale);
    ctx.translate(-cx, -cy);

    // ── RENDER STAGE 1: INTRO PAGE 1 (INTRO-PAGE-2.png) ─────────────────
    if (this.p1Image && (this.p1Loaded || this.p1Image.naturalWidth > 0) && this.p1State.alpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = this.p1State.alpha;
      const offsetX = (this.p1State.x / 100) * w + this.mouse.x * 12;
      this._drawCoverImage(ctx, this.p1Image, w, h, offsetX, this.mouse.y * 8, this.p1State.scale, false);
      ctx.restore();
    }

    // ── RENDER STAGE 2: INTRO PAGE 2 (ICON PAGE-5.png) ───────────────────
    if (this.p2Image && (this.p2Loaded || this.p2Image.naturalWidth > 0) && this.p2State.alpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = this.p2State.alpha;
      const offsetX = (this.p2State.x / 100) * w + this.mouse.x * 14;
      this._drawCoverImage(ctx, this.p2Image, w, h, offsetX, this.mouse.y * 10, this.p2State.scale, false);
      ctx.restore();
    }

    // ── FX: PORTAL VORTEX ENERGY RING GLOW ────────────────────────────────
    if (this.portalEnergy > 0.05) {
      this._drawPortalEnergyRing(ctx, w, h, time);
    }

    // ── FX: VOLUMETRIC FOG & FLOATING SMOKE ───────────────────────────────
    this._drawVolumetricFog(ctx, w, h, time);
    this._drawFloatingSmoke(ctx, w, h, time);

    // ── FX: PHYSICALLY ACCURATE RAIN ───────────────────────────────────────
    this._drawRain(ctx, w, h);

    // ── FX: DRIFTING EMBERS ────────────────────────────────────────────────
    this._drawEmbers(ctx, w, h, time);

    // ── FX: SHOCKWAVE EXPANSION ───────────────────────────────────────────
    this._drawShockwaves(ctx);

    ctx.restore();

    // ── FX: CYBER HUD TEXT OVERLAY ────────────────────────────────────────
    if (this.hudAlpha > 0.05) {
      ctx.save();
      ctx.globalAlpha = this.hudAlpha;
      ctx.font = '800 0.75rem "Outfit", monospace';
      ctx.fillStyle = '#ff203a';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff203a';
      ctx.shadowBlur = 14;
      ctx.fillText(this.hudText, w / 2, h * 0.965);
      ctx.restore();
    }

    // Film Grain & Vignette Overlay
    this.renderFilmGrain();

    requestAnimationFrame(() => this.renderLoop());
  }

  // ── Proportional Contain Image Helper (Strict Safe-Zone Contain) ─────────
  _drawCoverImage(ctx, img, w, h, offsetX = 0, offsetY = 0, scaleFactor = 1.0, cropBottom = false) {
    if (!img || (!img.width && !img.naturalWidth)) return;

    const srcW = img.naturalWidth || img.width;
    const fullH = img.naturalHeight || img.height;
    const srcH = cropBottom ? fullH * 0.89 : fullH;

    // Fit scale at 0.82 ensures 100% of top, bottom, left, right borders are completely visible
    const fitScale = Math.min((w * 0.82) / srcW, (h * 0.82) / srcH) * scaleFactor;
    const dw = srcW * fitScale;
    const dh = srcH * fitScale;

    const dx = (w - dw) / 2 + offsetX;
    const dy = (h - dh) / 2 + offsetY;

    ctx.save();
    ctx.drawImage(img, 0, 0, srcW, srcH, dx, dy, dw, dh);
    ctx.restore();
  }

  // ── Portal Vortex Energy Ring Rendering ──────────────────────────────────
  _drawPortalEnergyRing(ctx, w, h, time) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const pcx = w / 2;
    const pcy = h * 0.44;
    const radius = Math.min(w, h) * 0.28;

    ctx.strokeStyle = `rgba(255, 30, 60, ${this.portalEnergy * 0.85})`;
    ctx.lineWidth = 6;
    ctx.shadowColor = '#ff203a';
    ctx.shadowBlur = 40 * this.portalEnergy;
    ctx.beginPath();
    ctx.arc(pcx, pcy, radius, 0, Math.PI * 2);
    ctx.stroke();

    const arcCount = 12;
    for (let i = 0; i < arcCount; i++) {
      const angle = (i / arcCount) * Math.PI * 2 + time * 1.5;
      const ax = pcx + Math.cos(angle) * radius;
      const ay = pcy + Math.sin(angle) * radius;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ax, ay, Math.random() * 4 + 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Volumetric Fog ───────────────────────────────────────────────────────
  _drawVolumetricFog(ctx, w, h, time) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (let f of this.fogNodes) {
      f.x += f.dx + Math.sin(time * 0.5 + f.y) * 0.2;
      if (f.x < -f.r) f.x = w + f.r;
      if (f.x > w + f.r) f.x = -f.r;

      const fa = typeof f.alpha === 'number' ? f.alpha : 0.15;
      const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      grad.addColorStop(0, `rgba(255, 20, 40, ${fa * 0.3})`);
      grad.addColorStop(0.6, `rgba(180, 10, 20, ${fa * 0.1})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Floating Volumetric Smoke Effect ─────────────────────────────────────
  _drawFloatingSmoke(ctx, w, h, time) {
    if (!this.smokePuffs || !this.smokePuffs.length) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (let s of this.smokePuffs) {
      s.x += s.dx + Math.sin(time * 0.4 + s.y * 0.01) * 0.3;
      s.y += s.dy;
      s.rot += s.rotSpeed;

      if (s.y < -s.r) { s.y = h + s.r; s.x = Math.random() * w; }
      if (s.x < -s.r) s.x = w + s.r;
      if (s.x > w + s.r) s.x = -s.r;

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s.r);
      grad.addColorStop(0, `rgba(255, 30, 50, ${s.alpha * 0.35})`);
      grad.addColorStop(0.4, `rgba(180, 15, 30, ${s.alpha * 0.18})`);
      grad.addColorStop(0.8, `rgba(40, 5, 12, ${s.alpha * 0.06})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // ── Rain Animation ───────────────────────────────────────────────────────
  _drawRain(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 200, 210, 0.35)';
    ctx.lineWidth = 1.2;

    for (let r of this.rainDrops) {
      r.y += r.speed;
      r.x += 1.5;
      if (r.y > h) { r.y = -r.len; r.x = Math.random() * w; }

      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - 3, r.y + r.len);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── Drifting Embers ──────────────────────────────────────────────────────
  _drawEmbers(ctx, w, h, time) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let e of this.embers) {
      e.x += e.dx + Math.sin(time + e.x) * 0.25;
      e.y += e.dy;
      if (e.y < -10) { e.y = h + 10; e.x = Math.random() * w; }
      if (e.x < -10) e.x = w + 10;
      if (e.x > w + 10) e.x = -10;

      ctx.fillStyle = `hsla(${e.hue}, 100%, 65%, ${e.opacity})`;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Shockwaves ───────────────────────────────────────────────────────────
  _drawShockwaves(ctx) {
    if (!this.shockwaves.length) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += 24;
      sw.alpha *= 0.92;

      if (sw.alpha < 0.01 || sw.radius > sw.maxRadius) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      ctx.strokeStyle = `rgba(255, 32, 58, ${sw.alpha})`;
      ctx.lineWidth = 5;
      ctx.shadowColor = '#ff203a';
      ctx.shadowBlur = 35;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── Film Grain & Vignette ────────────────────────────────────────────────
  renderFilmGrain() {
    if (!this.grainCtx) return;
    const gctx = this.grainCtx;
    const w = this.width, h = this.height;
    gctx.clearRect(0, 0, w, h);

    const imgData = gctx.createImageData(128, 128);
    const buf = new Uint32Array(imgData.data.buffer);
    for (let i = 0; i < buf.length; i++) {
      if (Math.random() < 0.12) {
        buf[i] = (Math.floor(Math.random() * 40) << 24) | 0x00ffffff;
      }
    }
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 128; patternCanvas.height = 128;
    patternCanvas.getContext('2d').putImageData(imgData, 0, 0);

    gctx.fillStyle = gctx.createPattern(patternCanvas, 'repeat');
    gctx.fillRect(0, 0, w, h);

    const vign = gctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    vign.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vign.addColorStop(1, 'rgba(0, 0, 0, 0.78)');
    gctx.fillStyle = vign;
    gctx.fillRect(0, 0, w, h);
  }
}
