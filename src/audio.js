class AudioContextManager {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.isPlaying = false;
    this.audioElement = null;
    this.sourceNode = null;
    this.biquadFilter = null;

    // 5-Band EQ nodes
    this.eqBands = null;
    this.saturationNode = null;

    this.tracks = [
      "/background.mp3",
      "/demo1.mp3",
      "/demo2.mp3"
    ];
  }

  async init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      this.audioElement = new Audio();
      this.audioElement.crossOrigin = "anonymous";
      this.audioElement.loop = true;

      this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);

      // ── 5-Band Parametric EQ ──────────────────────────────────────────────
      //  Bench (sub-bass shelving): 80Hz
      //  Low   (bass peaking):      250Hz
      //  Mid   (midrange peaking):  1000Hz
      //  High  (presence peaking):  6000Hz
      //  Saturation (high-shelf):   12000Hz  — wired to the Sat dial
      const eqConfig = [
        { type: 'lowshelf',  frequency: 80,    gain: 0 },   // Bench
        { type: 'peaking',   frequency: 250,   gain: 0 },   // Low
        { type: 'peaking',   frequency: 1000,  gain: 0 },   // Mid
        { type: 'peaking',   frequency: 6000,  gain: 0 },   // High
        { type: 'highshelf', frequency: 12000, gain: 0 },   // Saturation
      ];

      this.eqBands = eqConfig.map(cfg => {
        const f = this.audioContext.createBiquadFilter();
        f.type = cfg.type;
        f.frequency.value = cfg.frequency;
        f.gain.value = cfg.gain;
        if (cfg.type === 'peaking') f.Q.value = 1.0;
        return f;
      });

      // ── DJ lowpass filter (HOLD button sweep) ────────────────────────────
      this.biquadFilter = this.audioContext.createBiquadFilter();
      this.biquadFilter.type = 'lowpass';
      this.biquadFilter.frequency.value = 20000;

      // ── Analyser ──────────────────────────────────────────────────────────
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Signal chain: Source → EQ band 1 → 2 → 3 → 4 → 5 → DJ Filter → Analyser → Speakers
      let node = this.sourceNode;
      for (const band of this.eqBands) {
        node.connect(band);
        node = band;
      }
      node.connect(this.biquadFilter);
      this.biquadFilter.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Set one of the 5 EQ bands by index (0=Bench, 1=Low, 2=Mid, 3=High, 4=Sat).
   * sliderValue: 0–100  →  gain: -15dB to +15dB  (50 = 0dB flat)
   */
  setEQBand(bandIndex, sliderValue) {
    if (!this.eqBands) return;
    const band = this.eqBands[bandIndex];
    if (!band) return;
    // Map 0–100 slider to -15..+15 dB
    band.gain.value = ((sliderValue - 50) / 50) * 15;
  }


  playTrack(trackIndex) {
    if (!this.audioElement) return;
    
    this.stopTrack();
    
    // Load new track URL
    const safeIndex = trackIndex % this.tracks.length;
    this.audioElement.src = this.tracks[safeIndex];
    
    this.audioElement.play().then(() => {
      this.isPlaying = true;
    }).catch(e => console.error("Audio playback failed:", e));
  }

  stopTrack() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.isPlaying = false;
  }

  // Interaction: Trigger DJ Filter Sweep
  setFilterSweep(isActive) {
    if (!this.biquadFilter) return;
    
    const now = this.audioContext.currentTime;
    // Cancel any scheduled frequency changes
    this.biquadFilter.frequency.cancelScheduledValues(now);

    if (isActive) {
      // Sweep down to 300Hz quickly (muffled underwater club door sound)
      this.biquadFilter.frequency.setTargetAtTime(300, now, 0.1);
    } else {
      // Instantly open filter back up to 20kHz
      this.biquadFilter.frequency.setTargetAtTime(20000, now, 0.1);
    }
  }
  
  // Interaction: Play Scratch Sound over track
  playScratch() {
    if (!this.audioContext) return;
    const time = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(this.audioContext.destination); // Push straight to speakers, bypassing filter!
    
    // Scratch pitch envelope
    osc.frequency.setValueAtTime(300, time);
    osc.frequency.linearRampToValueAtTime(800, time + 0.1);
    osc.frequency.linearRampToValueAtTime(200, time + 0.2);
    
    // Volume envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.5, time + 0.05);
    gain.gain.linearRampToValueAtTime(0, time + 0.2);
    
    osc.start(time);
    osc.stop(time + 0.2);
  }

  // Interaction: Play scientific hover sound as floating icons come forward
  playHoverSound() {
    if (!this.audioContext) {
      this.init();
    }
    if (!this.audioContext) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    const now = performance.now();
    if (this._lastHoverTime && now - this._lastHoverTime < 35) return;
    this._lastHoverTime = now;

    const time = this.audioContext.currentTime;

    // Layer 1: Forward Surge Doppler Pitch Sweep (Sine)
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(320, time);
    osc1.frequency.exponentialRampToValueAtTime(780, time + 0.16);

    gain1.gain.setValueAtTime(0, time);
    gain1.gain.linearRampToValueAtTime(0.09, time + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc1.connect(gain1);
    gain1.connect(this.audioContext.destination);
    osc1.start(time);
    osc1.stop(time + 0.18);

    // Layer 2: Glossy High-Overtone Chime Sheen (Triangle)
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1400, time);
    osc2.frequency.exponentialRampToValueAtTime(2400, time + 0.12);

    gain2.gain.setValueAtTime(0, time);
    gain2.gain.linearRampToValueAtTime(0.04, time + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc2.connect(gain2);
    gain2.connect(this.audioContext.destination);
    osc2.start(time);
    osc2.stop(time + 0.14);

    // Layer 3: Tactile Sub Air Depth
    const osc3 = this.audioContext.createOscillator();
    const gain3 = this.audioContext.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(150, time);
    osc3.frequency.exponentialRampToValueAtTime(75, time + 0.10);

    gain3.gain.setValueAtTime(0, time);
    gain3.gain.linearRampToValueAtTime(0.05, time + 0.02);
    gain3.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc3.connect(gain3);
    gain3.connect(this.audioContext.destination);
    osc3.start(time);
    osc3.stop(time + 0.12);
  }

  // Interaction: Play Laser Warp Sound (for Secret Chamber portal modal)
  playLaserWarpSound() {
    if (!this.audioContext) this.init();
    if (!this.audioContext) return;
    const time = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.setValueAtTime(1200, time);
    osc.frequency.exponentialRampToValueAtTime(150, time + 0.35);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.linearRampToValueAtTime(0.01, time + 0.35);

    osc.start(time);
    osc.stop(time + 0.35);
  }

  // Interaction: Play Filter Engage Heavy Bass Drop sound
  playFilterEngageSound() {
    if (!this.audioContext) this.init();
    if (!this.audioContext) return;
    const time = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.3);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.linearRampToValueAtTime(0.01, time + 0.3);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  getFrequencyData() {
    if (!this.analyser || !this.isPlaying) return { bass: 0, mid: 0, treble: 0 };
    
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Simple binning
    let bass = 0, mid = 0, treble = 0;
    const len = this.dataArray.length;
    
    for (let i = 0; i < len; i++) {
      const val = this.dataArray[i];
      if (i < len * 0.1) bass += val;
      else if (i < len * 0.6) mid += val;
      else treble += val;
    }
    
    return {
      bass: bass / (len * 0.1) / 255.0,
      mid: mid / (len * 0.5) / 255.0,
      treble: treble / (len * 0.4) / 255.0
    };
  }
}

export const audioManager = new AudioContextManager();

