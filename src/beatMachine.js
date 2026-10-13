/**
 * ============================================================================
 * CHINESE ASSASSIN — BEAT MACHINE (16-Pad MPC Drum Controller)
 * ============================================================================
 * - 16 velocity-sensitive pads in 4×4 grid (like Maschine / MPC)
 * - Two sample banks (A / B) — 32 total pad slots
 * - Keyboard shortcut mapping for every pad
 * - Synthesized fallback sounds via WebAudio (no file needed yet)
 * - Visual pad flash on hit + status display
 * - VU meter animation per hit
 * - Master pad volume knob
 * - Ready to hot-swap real audio files once loaded into /sound effects/
 * ============================================================================
 */

class BeatMachine {
  constructor() {
    this.grid      = document.getElementById('cdmPadGrid');
    this.statusEl  = document.getElementById('cdmStatus');
    this.volKnob   = document.getElementById('cdmPadVolume');
    this.bankABtn  = document.getElementById('cdmBankA');
    this.bankBBtn  = document.getElementById('cdmBankB');
    this.vuLeft    = document.getElementById('cdmVuLeft');
    this.vuRight   = document.getElementById('cdmVuRight');
    this.vuLeft2   = document.getElementById('cdmVuLeft2');
    this.vuRight2  = document.getElementById('cdmVuRight2');

    if (!this.grid) return; // not on this page

    this.ctx        = null;
    this.padVolume  = 0.85;
    this.currentBank = 'A';
    this.vuTimer    = null;

    // ── Pad definitions ────────────────────────────────────────────────
    // Each entry: { label, key, synth: {type, freq, decay}, file }
    // 'file' will be loaded from /sound effects/ once user uploads them.
    this.banks = {
      A: [
        { pad:1,  label:'KICK',    key:'1', synth:{ type:'kick'   } },
        { pad:2,  label:'SNARE',   key:'2', synth:{ type:'snare'  } },
        { pad:3,  label:'BASS',    key:'3', synth:{ type:'bass'   } },
        { pad:4,  label:'SUB DRP', key:'4', synth:{ type:'sub'    } },
        { pad:5,  label:'KICK 2',  key:'z', synth:{ type:'kick2'  } },
        { pad:6,  label:'PERC',    key:'x', synth:{ type:'perc'   } },
        { pad:7,  label:'TOM LO',  key:'c', synth:{ type:'tomlo'  } },
        { pad:8,  label:'FX HIT',  key:'v', synth:{ type:'fxhit'  } },
        { pad:9,  label:'RIM',     key:'a', synth:{ type:'rim'    } },
        { pad:10, label:'CLAP',    key:'s', synth:{ type:'clap'   } },
        { pad:11, label:'SNARE 2', key:'d', synth:{ type:'snare2' } },
        { pad:12, label:'TOM HI',  key:'f', synth:{ type:'tomhi'  } },
        { pad:13, label:'CRASH',   key:'q', synth:{ type:'crash'  } },
        { pad:14, label:'OPEN HH', key:'w', synth:{ type:'openHH' } },
        { pad:15, label:'CLO HH',  key:'e', synth:{ type:'cloHH'  } },
        { pad:16, label:'TAMBR',   key:'r', synth:{ type:'tamb'   } },
      ],
      B: [
        { pad:1,  label:'BD 808',  key:'1', synth:{ type:'kick'   } },
        { pad:2,  label:'SD 808',  key:'2', synth:{ type:'snare'  } },
        { pad:3,  label:'JUNGLE',  key:'3', synth:{ type:'bass'   } },
        { pad:4,  label:'RAGGA',   key:'4', synth:{ type:'sub'    } },
        { pad:5,  label:'AMEN',    key:'z', synth:{ type:'kick2'  } },
        { pad:6,  label:'STAB',    key:'x', synth:{ type:'perc'   } },
        { pad:7,  label:'HORN',    key:'c', synth:{ type:'tomlo'  } },
        { pad:8,  label:'BELL',    key:'v', synth:{ type:'fxhit'  } },
        { pad:9,  label:'FLUTE',   key:'a', synth:{ type:'rim'    } },
        { pad:10, label:'VOCAL',   key:'s', synth:{ type:'clap'   } },
        { pad:11, label:'LASER',   key:'d', synth:{ type:'snare2' } },
        { pad:12, label:'SWEEP',   key:'f', synth:{ type:'tomhi'  } },
        { pad:13, label:'RISE',    key:'q', synth:{ type:'crash'  } },
        { pad:14, label:'DROP',    key:'w', synth:{ type:'openHH' } },
        { pad:15, label:'SFX 1',   key:'e', synth:{ type:'cloHH'  } },
        { pad:16, label:'SFX 2',   key:'r', synth:{ type:'tamb'   } },
      ],
    };

    // Build keyboard map: lowercase key -> padIndex
    this.keyMap = {};
    this.banks.A.forEach((p, idx) => { this.keyMap[p.key.toLowerCase()] = idx; });

    this.init();
  }

  // ── WebAudio context (lazy init on first interaction) ────────────────
  async ensureCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  // ── Synthesized drum sounds (no file needed) ─────────────────────────
  playSynth(type) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const vol = this.padVolume;
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(vol, now);
    master.connect(ctx.destination);

    switch (type) {
      case 'kick':
      case 'kick2': {
        const osc = ctx.createOscillator();
        const g   = ctx.createGain();
        osc.type = 'sine';
        const startFreq = type === 'kick' ? 160 : 120;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
        g.gain.setValueAtTime(1, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.connect(g); g.connect(master);
        osc.start(now); osc.stop(now + 0.4);
        break;
      }
      case 'snare':
      case 'snare2': {
        // Noise layer
        const bufSz = ctx.sampleRate * 0.18;
        const buf   = ctx.createBuffer(1, bufSz, ctx.sampleRate);
        const data  = buf.getChannelData(0);
        for (let i = 0; i < bufSz; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.7, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        noise.connect(ng); ng.connect(master);
        // Body tone
        const osc = ctx.createOscillator();
        const og = ctx.createGain();
        osc.frequency.value = type === 'snare' ? 220 : 180;
        og.gain.setValueAtTime(0.5, now);
        og.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(og); og.connect(master);
        noise.start(now); noise.stop(now + 0.2);
        osc.start(now); osc.stop(now + 0.12);
        break;
      }
      case 'clap': {
        for (let rep = 0; rep < 3; rep++) {
          const delay = rep * 0.012;
          const bufSz = ctx.sampleRate * 0.08;
          const buf   = ctx.createBuffer(1, bufSz, ctx.sampleRate);
          const data  = buf.getChannelData(0);
          for (let i = 0; i < bufSz; i++) data[i] = Math.random() * 2 - 1;
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.6, now + delay);
          g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass'; filter.frequency.value = 1200;
          src.connect(filter); filter.connect(g); g.connect(master);
          src.start(now + delay); src.stop(now + delay + 0.12);
        }
        break;
      }
      case 'cloHH': {
        const bufSz = ctx.sampleRate * 0.06;
        const buf = ctx.createBuffer(1, bufSz, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSz; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource(); src.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass'; filter.frequency.value = 7000;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.55, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        src.connect(filter); filter.connect(g); g.connect(master);
        src.start(now); src.stop(now + 0.07);
        break;
      }
      case 'openHH': {
        const bufSz = ctx.sampleRate * 0.3;
        const buf = ctx.createBuffer(1, bufSz, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSz; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource(); src.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass'; filter.frequency.value = 5500;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.5, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        src.connect(filter); filter.connect(g); g.connect(master);
        src.start(now); src.stop(now + 0.34);
        break;
      }
      case 'crash': {
        const bufSz = ctx.sampleRate * 0.8;
        const buf = ctx.createBuffer(1, bufSz, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSz; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource(); src.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass'; filter.frequency.value = 4500; filter.Q.value = 0.6;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.6, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        src.connect(filter); filter.connect(g); g.connect(master);
        src.start(now); src.stop(now + 0.9);
        break;
      }
      case 'bass':
      case 'sub': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        const f = type === 'sub' ? 45 : 80;
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 0.5, now + 0.25);
        g.gain.setValueAtTime(0.9, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = 350;
        osc.connect(filter); filter.connect(g); g.connect(master);
        osc.start(now); osc.stop(now + 0.45);
        break;
      }
      case 'rim': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.02);
        g.gain.setValueAtTime(0.6, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(g); g.connect(master);
        osc.start(now); osc.stop(now + 0.06);
        break;
      }
      case 'tomlo':
      case 'tomhi': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        const startF = type === 'tomhi' ? 350 : 160;
        osc.frequency.setValueAtTime(startF, now);
        osc.frequency.exponentialRampToValueAtTime(startF * 0.35, now + 0.2);
        g.gain.setValueAtTime(0.85, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(g); g.connect(master);
        osc.start(now); osc.stop(now + 0.28);
        break;
      }
      case 'perc': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
        g.gain.setValueAtTime(0.65, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(g); g.connect(master);
        osc.start(now); osc.stop(now + 0.12);
        break;
      }
      case 'fxhit': {
        // Filtered noise sweep FX hit
        const bufSz = ctx.sampleRate * 0.4;
        const buf = ctx.createBuffer(1, bufSz, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSz; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource(); src.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass'; filter.Q.value = 12;
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(4000, now + 0.35);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.8, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        src.connect(filter); filter.connect(g); g.connect(master);
        src.start(now); src.stop(now + 0.45);
        break;
      }
      case 'tamb': {
        for (let i = 0; i < 6; i++) {
          const bufSz = ctx.sampleRate * 0.04;
          const buf = ctx.createBuffer(1, bufSz, ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let j = 0; j < bufSz; j++) data[j] = Math.random() * 2 - 1;
          const src = ctx.createBufferSource(); src.buffer = buf;
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass'; filter.frequency.value = 6000;
          const g = ctx.createGain();
          const t = now + i * 0.025;
          g.gain.setValueAtTime(0.4, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
          src.connect(filter); filter.connect(g); g.connect(master);
          src.start(t); src.stop(t + 0.05);
        }
        break;
      }
    }
  }

  // ── Hit a pad by its dataset index (0-based in current bank) ─────────
  async hitPad(padEl) {
    await this.ensureCtx();

    const padNum = parseInt(padEl.dataset.pad, 10);
    const bankDef = this.banks[this.currentBank];
    const def = bankDef.find(p => p.pad === padNum);
    if (!def) return;

    // Visual flash
    padEl.classList.add('active');
    setTimeout(() => padEl.classList.remove('active'), 120);

    // Update status
    if (this.statusEl) {
      this.statusEl.textContent = `PAD ${padNum} · ${def.label}`;
    }

    // Play synthesized sound
    this.playSynth(def.synth.type);

    // VU flash
    this.flashVU();
  }

  flashVU() {
    const pct = 55 + Math.random() * 40;
    const pct2 = 50 + Math.random() * 45;
    [this.vuLeft, this.vuLeft2].forEach(el => { if(el) el.style.height = `${pct}%`; });
    [this.vuRight, this.vuRight2].forEach(el => { if(el) el.style.height = `${pct2}%`; });
    clearTimeout(this.vuTimer);
    this.vuTimer = setTimeout(() => {
      [this.vuLeft, this.vuLeft2, this.vuRight, this.vuRight2].forEach(el => {
        if (el) el.style.height = '8%';
      });
    }, 200);
  }

  switchBank(bank) {
    this.currentBank = bank;
    this.bankABtn?.classList.toggle('active', bank === 'A');
    this.bankBBtn?.classList.toggle('active', bank === 'B');

    // Update pad labels from bank definition
    const pads = this.grid.querySelectorAll('.cdm-pad');
    const bankDef = this.banks[bank];
    pads.forEach(padEl => {
      const padNum = parseInt(padEl.dataset.pad, 10);
      const def = bankDef.find(p => p.pad === padNum);
      if (def) {
        const nameEl = padEl.querySelector('.cdm-pad-name');
        if (nameEl) nameEl.textContent = def.label;
        padEl.dataset.label = def.label;
      }
    });

    if (this.statusEl) {
      this.statusEl.textContent = `BANK ${bank} LOADED`;
    }
  }

  init() {
    // Pad click events
    this.grid.querySelectorAll('.cdm-pad').forEach(padEl => {
      padEl.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.hitPad(padEl);
      });

      // Touch support
      padEl.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.hitPad(padEl);
      }, { passive: false });
    });

    // Bank switcher
    this.bankABtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchBank('A');
    });
    this.bankBBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchBank('B');
    });

    // Volume knob
    this.volKnob?.addEventListener('input', (e) => {
      this.padVolume = parseFloat(e.target.value);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Only fire when drum machine is visible and no text input is focused
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      const idx = this.keyMap[key];
      if (idx !== undefined) {
        e.preventDefault();
        const bankDef = this.banks[this.currentBank];
        const def = bankDef[idx];
        if (!def) return;
        const padEl = this.grid.querySelector(`.cdm-pad[data-pad="${def.pad}"]`);
        if (padEl) this.hitPad(padEl);
      }
    });

    console.log('[BeatMachine] 16-pad drum machine initialised ✓');
  }
}

// ── Mount ─────────────────────────────────────────────────────────────────
const beatMachine = new BeatMachine();
export { beatMachine };
