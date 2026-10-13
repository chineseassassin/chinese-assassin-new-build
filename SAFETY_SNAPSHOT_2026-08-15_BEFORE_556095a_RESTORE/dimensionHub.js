import gsap from 'gsap';
import { audioManager } from './audio.js';

export class DimensionHub {
  constructor() {
    this.hub = document.getElementById('dimension-hub');
    this.container = document.getElementById('hub-container');
    if (!this.hub || !this.container) return;

    this.orbitAngleOffset = 0;
    this.isOrbiting = true;
    this.orbitSpeedMultiplier = 1.0;

    this.initOrbitalLayout();
    this.initEmberParticles();
    this.initFingertipEnergyStrands();
    this.Get-Content .\src\app\approvals\page.tsx();
    this.initEvents();
    this.initMenuNavigation();
    this.initLightningCanvas();
    this.initDJFilterButton();
    this.initSecretChamberModal();
    this.initAudioReactivity();
    this.activate(false);
    window.addEventListener('portalEntered', () => this.activate(true));
    window.addEventListener('resize', () => this.initOrbitalLayout());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  // EXACT CONCEPT ORBITAL ARC LAYOUT
  // ─────────────────────────────────────────────────────────────────────────
  initOrbitalLayout() {
    const portals = document.querySelectorAll('.realm-portal');
    if (!portals.length) return;

    const total = portals.length;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const isMobile = W < 768;

    const rx = isMobile ? W * 0.36 : Math.min(W * 0.40, 500);
    const ry = isMobile ? H * 0.25 : Math.min(H * 0.30, 230);
    const offset = this.orbitAngleOffset;

    portals.forEach((portal, i) => {
      const baseAngle = ((i / total) * Math.PI * 2) + (Math.PI * 1.2) + offset;
      const cosA = Math.cos(baseAngle);
      const sinA = Math.sin(baseAngle);

      const x = cosA * rx;
      const y = sinA * ry;
      const z = sinA * 60 + 80;

      const rotateY = -cosA * 22;
      const rotateX =  sinA * 8;
      const scale   = 0.88 + (sinA + 1) * 0.09;
      const zIndex  = sinA > 0 ? 18 : 5;

      portal.style.zIndex = zIndex;

      portal.dataset.baseX     = x;
      portal.dataset.baseY     = y;
      portal.dataset.baseZ     = z;
      portal.dataset.baseRy    = rotateY;
      portal.dataset.baseRx    = rotateX;
      portal.dataset.baseScale = scale;

      gsap.set(portal, {
        x, y, z, scale, rotateY, rotateX,
        transformOrigin: 'center center',
        force3D: true
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONTINUOUS SLOW ORBITAL ROTATION
  // ─────────────────────────────────────────────────────────────────────────
  initContinuousOrbit() {
    gsap.ticker.add(() => {
      if (!this.hub || !this.hub.classList.contains('active')) return;
      if (!this.isOrbiting) return;
      this.orbitAngleOffset += 0.00055 * this.orbitSpeedMultiplier;
      this.initOrbitalLayout();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LIVE BASS-DROP CRIMSON LIGHTNING FLASHES
  // ─────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  // LIVE BASS-DROP CRIMSON LIGHTNING FLASHES & BEAT LIGHTING
  // ─────────────────────────────────────────────────────────────────────────
  initLightningCanvas() {
    const canvas = document.getElementById('lightning-flash-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });

    const triggerLightningBolt = () => {
      if (!this.hub || !this.hub.classList.contains('active')) return;

      // Primary lightning bolt starting from top sky
      const startX = W * 0.15 + Math.random() * W * 0.7;
      let currX = startX;
      let currY = 0;
      const segments = [];
      const branches = [];

      while (currY < H * 0.75) {
        const nextX = currX + (Math.random() - 0.5) * 70;
        const nextY = currY + 15 + Math.random() * 40;
        segments.push({ x1: currX, y1: currY, x2: nextX, y2: nextY });

        // Occasional electric side-branching
        if (Math.random() < 0.35) {
          const bX = nextX + (Math.random() - 0.5) * 80;
          const bY = nextY + 25 + Math.random() * 30;
          branches.push({ x1: nextX, y1: nextY, x2: bX, y2: bY });
        }

        currX = nextX;
        currY = nextY;
      }

      // Draw lightning glow & core lines
      ctx.clearRect(0, 0, W, H);

      // Outer glow pass
      ctx.beginPath();
      for (const seg of [...segments, ...branches]) {
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
      }
      ctx.strokeStyle = 'rgba(255, 32, 58, 0.9)';
      ctx.lineWidth   = 6;
      ctx.shadowBlur  = 35;
      ctx.shadowColor = '#ff1a1a';
      ctx.stroke();

      // Inner white-hot core
      ctx.beginPath();
      for (const seg of segments) {
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth   = 2.2;
      ctx.shadowBlur  = 15;
      ctx.shadowColor = '#ffffff';
      ctx.stroke();

      // ── 1. Flash Background Hero Image to HQ Clarity ────────────────────
      const masterImg = document.querySelector('.master-img');
      if (masterImg) {
        gsap.timeline()
          .to(masterImg, { 
            filter: 'brightness(1.9) contrast(1.4) drop-shadow(0 0 60px rgba(255, 32, 58, 0.95))', 
            scale: 1.035,
            duration: 0.05 
          })
          .to(masterImg, { 
            filter: 'none', 
            scale: 1, 
            duration: 0.4, 
            ease: 'power2.out' 
          });
      }

      // ── 2. Beats & Waveform Equalizer Light Up ──────────────────────────
      const ebars = document.querySelectorAll('.cd-waveform .ebar');
      ebars.forEach((bar) => {
        gsap.timeline()
          .to(bar, {
            height: `${70 + Math.random() * 30}%`,
            backgroundColor: '#ffffff',
            boxShadow: '0 0 15px #ff203a, 0 0 30px #ffffff',
            duration: 0.05
          })
          .to(bar, {
            clearProps: 'backgroundColor,boxShadow',
            duration: 0.4,
            ease: 'power2.out'
          });
      });

      // ── 3. Cyber-Deck Player Widget Flash ──────────────────────────────
      const cyberDeck = document.getElementById('cyber-deck');
      if (cyberDeck) {
        gsap.timeline()
          .to(cyberDeck, {
            borderColor: 'rgba(255, 32, 58, 1)',
            boxShadow: '0 0 45px rgba(255, 32, 58, 0.8), inset 0 0 25px rgba(255, 32, 58, 0.5)',
            duration: 0.06
          })
          .to(cyberDeck, {
            borderColor: 'rgba(255, 32, 58, 0.4)',
            boxShadow: '0 0 20px rgba(255, 32, 58, 0.25), inset 0 0 10px rgba(0, 0, 0, 0.5)',
            duration: 0.45,
            ease: 'power2.out'
          });
      }

      // Clear canvas after flash
      setTimeout(() => ctx.clearRect(0, 0, W, H), 220);
    };

    // Trigger initial strike 1 second after portal entrance
    setTimeout(() => triggerLightningBolt(), 1000);

    // Schedule periodic lightning strikes every 4 to 8 seconds
    const scheduleNextBolt = () => {
      const delay = 4000 + Math.random() * 4000;
      setTimeout(() => {
        triggerLightningBolt();
        scheduleNextBolt();
      }, delay);
    };
    scheduleNextBolt();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HOLD FOR LIVE DJ FILTER INTERACTION
  // ─────────────────────────────────────────────────────────────────────────
  initDJFilterButton() {
    const fxBtn = document.getElementById('home-fx-btn');
    const playBtn = document.getElementById('home-play-btn');
    if (!fxBtn) return;

    const startFilter = (e) => {
      e.preventDefault();
      audioManager.playFilterEngageSound();
      audioManager.setFilterSweep(true);
      this.orbitSpeedMultiplier = 0.2; // Slow down orbit to quarter-speed
      fxBtn.classList.add('fx-active');

      const masterImg = document.querySelector('.master-img');
      if (masterImg) {
        gsap.to(masterImg, { filter: 'brightness(0.7) hue-rotate(-20deg)', duration: 0.3 });
      }
    };

    const stopFilter = () => {
      audioManager.setFilterSweep(false);
      this.orbitSpeedMultiplier = 1.0; // Resume full speed
      fxBtn.classList.remove('fx-active');

      const masterImg = document.querySelector('.master-img');
      if (masterImg) {
        gsap.to(masterImg, { filter: 'none', duration: 0.4 });
      }
    };

    fxBtn.addEventListener('mousedown', startFilter);
    fxBtn.addEventListener('mouseup', stopFilter);
    fxBtn.addEventListener('mouseleave', stopFilter);

    fxBtn.addEventListener('touchstart', startFilter, { passive: false });
    fxBtn.addEventListener('touchend', stopFilter);

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        audioManager.init();
        if (audioManager.isPlaying) {
          audioManager.stopTrack();
          playBtn.querySelector('.icon-play').style.display = 'block';
          playBtn.querySelector('.icon-pause').style.display = 'none';
        } else {
          audioManager.playTrack(0);
          playBtn.querySelector('.icon-play').style.display = 'none';
          playBtn.querySelector('.icon-pause').style.display = 'block';
        }
      });
    }

    this.initEkhoPlayerWidget();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CYBER-DECK MINI HUD (COMPACT PLAYER & EQ)
  // ─────────────────────────────────────────────────────────────────────────
  initEkhoPlayerWidget() {
    const tabPlayer = document.getElementById('cd-tab-player');
    const tabEq = document.getElementById('cd-tab-eq');
    const viewPlayer = document.getElementById('cd-view-player');
    const viewEq = document.getElementById('cd-view-eq');

    if (!tabPlayer || !tabEq || !viewPlayer || !viewEq) return;

    // Tab switching logic: Player <-> EQ
    tabPlayer.addEventListener('click', () => {
      audioManager.playHoverSound();
      tabPlayer.classList.add('active');
      tabEq.classList.remove('active');

      viewPlayer.classList.add('active');
      viewEq.classList.remove('active');

      gsap.fromTo(viewPlayer, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' });
    });

    tabEq.addEventListener('click', () => {
      audioManager.playHoverSound();
      tabEq.classList.add('active');
      tabPlayer.classList.remove('active');

      viewEq.classList.add('active');
      viewPlayer.classList.remove('active');

      gsap.fromTo(viewEq, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' });
    });

    // ── EQ Sliders → Live audio band gain ────────────────────────────────
    // Bench=0 (80Hz shelf), Low=1 (250Hz), Mid=2 (1kHz), High=3 (6kHz)
    const eqSliders = [
      { id: 'eq-bench', band: 0 },
      { id: 'eq-low',   band: 1 },
      { id: 'eq-mid',   band: 2 },
      { id: 'eq-high',  band: 3 },
    ];

    eqSliders.forEach(({ id, band }) => {
      const slider = document.getElementById(id);
      if (!slider) return;
      slider.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        // Update fill bar
        const fill = slider.parentElement.querySelector('.cd-fader-fill');
        if (fill) fill.style.height = `${val}%`;
        // Apply to audio EQ band
        audioManager.setEQBand(band, val);
      });
    });

    // ── Saturation Knob → High-Shelf band (index 4, 12kHz) ───────────────
    const satKnob = document.getElementById('knob-sat');
    const satHzText = document.getElementById('sat-hz-text');
    if (satKnob && satHzText) {
      let satStep = 0; // 0–6 steps
      satKnob.addEventListener('click', () => {
        satStep = (satStep + 1) % 7;
        const sliderVal = satStep * (100 / 6); // 0, 17, 33, 50, 67, 83, 100
        const hz = Math.round(20 + satStep * 12);
        satHzText.textContent = `${hz}Hz`;
        gsap.to(satKnob, { rotate: satStep * 40, duration: 0.25, ease: 'back.out(2)' });
        audioManager.setEQBand(4, sliderVal);
      });
    }

    // ── Bass Knob → Bass peaking band (index 1, 250Hz) ───────────────────
    const bassKnob = document.getElementById('knob-bass');
    if (bassKnob) {
      let bassStep = 3; // Start at flat (50 = 0dB)
      bassKnob.addEventListener('click', () => {
        bassStep = (bassStep + 1) % 7;
        const sliderVal = bassStep * (100 / 6);
        gsap.to(bassKnob, { rotate: bassStep * 40, duration: 0.25, ease: 'back.out(2)' });
        audioManager.setEQBand(1, sliderVal);
        // Visual pulse to confirm bass boost
        if (bassStep > 3) {
          gsap.to(bassKnob, { boxShadow: '0 0 18px #ff203a', duration: 0.15, yoyo: true, repeat: 1 });
        }
      });
    }

    // ── Play / Pause via clicking the disc thumbnail ──────────────────────
    const playTrigger = document.getElementById('cd-play-trigger');
    if (playTrigger) {
      playTrigger.addEventListener('click', async () => {
        await audioManager.init();

        const iconPlay  = playTrigger.querySelector('.cd-icon-play');
        const iconPause = playTrigger.querySelector('.cd-icon-pause');

        if (audioManager.isPlaying) {
          audioManager.stopTrack();
          playTrigger.classList.remove('playing');
          if (iconPlay)  iconPlay.style.display  = 'block';
          if (iconPause) iconPause.style.display = 'none';
        } else {
          audioManager.playTrack(0);
          playTrigger.classList.add('playing');
          if (iconPlay)  iconPlay.style.display  = 'none';
          if (iconPause) iconPause.style.display = 'block';
        }
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SECRET CHAMBER HOLOGRAPHIC VIP MODAL
  // ─────────────────────────────────────────────────────────────────────────
  initSecretChamberModal() {
    const modal    = document.getElementById('secret-chamber-modal');
    const closeBtn = document.getElementById('sc-modal-close');
    const triggers = [
      document.getElementById('secret-chamber-widget'),
      document.getElementById('secret-chamber-link')
    ];

    const openModal = (e) => {
      if (e) e.preventDefault();
      audioManager.playLaserWarpSound();
      if (!modal) return;

      modal.classList.add('active');
      const glass = modal.querySelector('.sc-modal-glass');
      gsap.fromTo(glass,
        { scale: 0.4, opacity: 0, rotateX: 25 },
        { scale: 1, opacity: 1, rotateX: 0, duration: 0.6, ease: 'back.out(1.5)' }
      );
    };

    const closeModal = () => {
      if (!modal) return;
      const glass = modal.querySelector('.sc-modal-glass');
      gsap.to(glass, {
        scale: 0.5, opacity: 0, rotateX: -20, duration: 0.35, ease: 'power2.in',
        onComplete: () => modal.classList.remove('active')
      });
    };

    triggers.forEach(trig => trig?.addEventListener('click', openModal));
    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REAL-TIME AUDIO REACTIVITY (Pulsing Cards & Waveform Bars)
  // ─────────────────────────────────────────────────────────────────────────
  initAudioReactivity() {
    const timeCurEl = document.getElementById('ekho-time-cur');
    const tick = () => {
      const freq = audioManager.getFrequencyData();
      if (audioManager.audioElement && audioManager.isPlaying && timeCurEl) {
        const curSec = Math.floor(audioManager.audioElement.currentTime || 0);
        const mins = Math.floor(curSec / 60);
        const secs = (curSec % 60).toString().padStart(2, '0');
        timeCurEl.textContent = `${mins}:${secs}`;
      }

      if (freq.bass > 0.05) {
        document.querySelectorAll('.ebar').forEach((bar, idx) => {
          const scaleY = 0.3 + Math.sin(Date.now() * 0.01 + idx) * 0.7 * freq.bass;
          bar.style.transform = `scaleY(${Math.max(0.2, scaleY)})`;
        });
      }
      requestAnimationFrame(tick);
    };
    tick();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EMBER PARTICLE CANVAS
  // ─────────────────────────────────────────────────────────────────────────
  initEmberParticles() {
    let canvas = document.getElementById('halo-ember-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'halo-ember-canvas';
      canvas.style.cssText = `
        position: absolute; inset: 0; width: 100%; height: 100%;
        pointer-events: none; z-index: 3;
      `;
      this.container.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 55 }, () => ({
      x:  W / 2 + (Math.random() - 0.5) * 480,
      y:  H / 2 + (Math.random() - 0.5) * 340,
      r:  Math.random() * 2.2 + 0.8,
      color: Math.random() > 0.28 ? 'rgba(255,32,58,' : 'rgba(0,229,255,',
      vx: (Math.random() - 0.5) * 0.75,
      vy: -Math.random() * 1.1 - 0.35,
      life: Math.floor(Math.random() * 100)
    }));

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.life++;
        if (p.y < 0 || p.life > 130) {
          p.x = W / 2 + (Math.random() - 0.5) * 400;
          p.y = H / 2 + 80 + Math.random() * 60;
          p.life = 0;
        }
        const alpha = 0.75 - (p.life / 130) * 0.75;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + alpha + ')';
        ctx.shadowBlur = 9;
        ctx.shadowColor = 'rgba(255,32,58,0.9)';
        ctx.fill();
      }
      requestAnimationFrame(tick);
    };
    tick();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FINGERTIP ENERGY STRANDS
  // ─────────────────────────────────────────────────────────────────────────
  initFingertipEnergyStrands() {
    const canvas = document.getElementById('fingertip-energy-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Energy lines connecting through music card boxes disabled per user request
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MOUSE PARALLAX & HOVER
  // ─────────────────────────────────────────────────────────────────────────
  initEvents() {
    window.addEventListener('mousemove', (e) => {
      if (!this.hub.classList.contains('active')) return;
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      const panX = (e.clientX - cx) / cx;
      const panY = (e.clientY - cy) / cy;

      gsap.to(this.container, {
        rotateY:  panX * 10,
        rotateX: -panY * 8,
        duration: 1.8,
        ease: 'power2.out'
      });

      const masterImg = document.querySelector('.master-img');
      if (masterImg) {
        gsap.to(masterImg, { x: panX * 12, y: panY * 8, duration: 1.4, ease: 'power2.out' });
      }
    });

    document.querySelectorAll('.realm-portal').forEach(portal => {
      portal.addEventListener('mouseenter', () => {
        audioManager.playHoverSound();
        this.isOrbiting = false;
        const baseZ = parseFloat(portal.dataset.baseZ || 80);
        gsap.killTweensOf(portal, 'scale,z');
        gsap.to(portal, { scale: 1.18, z: baseZ + 65, duration: 0.35, ease: 'back.out(1.4)', overwrite: 'auto' });
        portal.style.zIndex = 120;
        document.querySelectorAll('.realm-portal').forEach(p => {
          if (p !== portal) gsap.to(p, { opacity: 0.4, duration: 0.3 });
        });
      });

      portal.addEventListener('mouseleave', () => {
        this.isOrbiting = true;
        const baseZ     = parseFloat(portal.dataset.baseZ || 80);
        const baseScale = parseFloat(portal.dataset.baseScale || 1);
        gsap.killTweensOf(portal, 'scale,z');
        gsap.to(portal, {
          scale: baseScale, z: baseZ,
          duration: 0.35, ease: 'power2.out', overwrite: 'auto',
          onComplete: () => { portal.style.zIndex = parseFloat(baseZ) > 80 ? 18 : 5; }
        });
        document.querySelectorAll('.realm-portal').forEach(p => {
          gsap.to(p, { opacity: 1, duration: 0.3 });
        });
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // NAV MENU LINKS
  // ─────────────────────────────────────────────────────────────────────────
  initMenuNavigation() {
    const homeLink          = document.getElementById('home-link');
    const secretChamberLink = document.getElementById('secret-chamber-link');

    homeLink?.addEventListener('click', e => {
      e.preventDefault();
      this.deactivate();
      homeLink.classList.add('nav-active');
      secretChamberLink?.classList.remove('nav-active');
    });

    secretChamberLink?.addEventListener('click', e => {
      e.preventDefault();
      this.activate(false);
      secretChamberLink.classList.add('nav-active');
      homeLink?.classList.remove('nav-active');
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ACTIVATE / DEACTIVATE
  // ─────────────────────────────────────────────────────────────────────────
  activate(withCinematicEntry = false) {
    if (!this.hub) return;
    this.hub.classList.add('active');
    document.getElementById('secret-chamber-link')?.classList.add('nav-active');
    document.getElementById('home-link')?.classList.remove('nav-active');

    if (withCinematicEntry) {
      // 3D Assembly Animation: cards zoom in smoothly from deep space into orbit!
      gsap.fromTo(this.container,
        { scale: 0.75, z: -350, opacity: 0 },
        { scale: 1, z: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }
      );
      const portals = document.querySelectorAll('.realm-portal');
      gsap.fromTo(portals,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 0.85, stagger: 0.05, ease: 'back.out(1.3)', delay: 0.15 }
      );
    } else {
      gsap.set(this.container, { scale: 1, opacity: 1, z: 0 });
    }
  }

  deactivate() {
    gsap.to(this.container, {
      scale: 0.3, opacity: 0, z: -800,
      duration: 1.0, ease: 'power3.in',
      onComplete: () => this.hub.classList.remove('active')
    });
  }
}
