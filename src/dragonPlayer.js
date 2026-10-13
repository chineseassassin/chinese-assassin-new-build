import { audioManager } from './audio.js';

/**
 * ============================================================================
 * CHINESE ASSASSIN — CYBER DRAGON PRO MASTER DJ PLAYER STUDIO
 * ============================================================================
 */
export class DragonPlayer {
  constructor() {
    this.deck = document.getElementById('caDragonDeck');
    if (!this.deck) return;

    this.tracks = [
      { title: 'Shadow Warrior', artist: 'Chinese Assassin', duration: '3:14', durationSec: 194, src: '/background.mp3' },
      { title: 'Dragon Fire Mix', artist: 'Chinese Assassin', duration: '4:05', durationSec: 245, src: '/demo1.mp3' },
      { title: 'VIP Dimension Blend', artist: 'Chinese Assassin', duration: '3:48', durationSec: 228, src: '/demo2.mp3' }
    ];

    this.currentTrackIdx = 0;
    this.isPlaying = false;
    this.isShuffled = false;
    this.isLooped = true;
    this.isMuted = false;
    this.volume = 0.85;
    this.activePreset = 'default';

    this.stutterTimer = null;
    this.isScratching = false;

    // Visualizer State
    this.vizMode = 'bars'; // 'bars' | 'wave' | 'flux'
    this.peaks = new Array(42).fill(0);
    this.timeDataArray = new Uint8Array(128);
    this.particles = Array.from({ length: 18 }, () => ({
      x: Math.random() * 280,
      y: Math.random() * 50,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -Math.random() * 1.2 - 0.3,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.8 + 0.2
    }));

    // Master FX State
    this.isFXBypassed = false;
    this.isEchoOn = false;
    this.isLowKilled = false;
    this.isMidKilled = false;
    this.isHighKilled = false;

    this.initElements();
    this.initEvents();
    this.initVisualizer();
    this.initTurntableScratch();
    this.updateTrackInfo();
  }

  initElements() {
    // Left Zone (Track Info & Turntable)
    this.platterWrap = document.getElementById('cadpPlatterWrap');
    this.emblem = document.getElementById('cadpEmblem');
    this.trackTitle = document.getElementById('cadpTrackTitle');
    this.artistTime = document.getElementById('cadpArtistTime');
    this.eqBars = document.getElementById('cadpEqBars');
    this.heartBtn = document.getElementById('cadpHeartBtn');

    // Center Transport Controls
    this.shuffleBtn = document.getElementById('cadpShuffleBtn');
    this.prevBtn = document.getElementById('cadpPrevBtn');
    this.playBtn = document.getElementById('cadpPlayBtn');
    this.playIcon = document.getElementById('cadpPlayIcon');
    this.pauseIcon = document.getElementById('cadpPauseIcon');
    this.nextBtn = document.getElementById('cadpNextBtn');
    this.repeatBtn = document.getElementById('cadpRepeatBtn');

    // Scrubber
    this.scrubberTrack = document.getElementById('cadpScrubberTrack');
    this.scrubberFill = document.getElementById('cadpScrubberFill');

    // Right Zone 1 (Spectrum Visualizer & Volume)
    this.waveformCanvas = document.getElementById('cadpWaveformCanvas');
    this.waveformWrap = document.getElementById('cadpWaveformWrap');
    this.vizModeBtn = document.getElementById('cadpVizModeBtn');
    this.volIcon = document.getElementById('cadpVolIcon');
    this.volSlider = document.getElementById('cadpVolSlider');

    // FX Presets
    this.presetBass = document.getElementById('cadpPresetBass');
    this.presetSpatial = document.getElementById('cadpPresetSpatial');
    this.presetWarmth = document.getElementById('cadpPresetWarmth');

    // Right Zone 2 (Pro DJ Master FX & Performance Suite)
    this.fxBypassBtn = document.getElementById('cadpFxBypassBtn');
    this.bypassText = document.getElementById('cadpBypassText');
    this.filterColor = document.getElementById('cadpFilterColor');
    this.filterDrive = document.getElementById('cadpFilterDrive');
    this.filterBass = document.getElementById('cadpFilterBass');
    this.filterChop = document.getElementById('cadpFilterChop');

    // Performance Triggers
    this.fxEchoBtn = document.getElementById('cadpFxEchoBtn');
    this.fxBrakeBtn = document.getElementById('cadpFxBrakeBtn');
    this.fxRiserBtn = document.getElementById('cadpFxRiserBtn');
    this.killLowBtn = document.getElementById('cadpKillLowBtn');
    this.killMidBtn = document.getElementById('cadpKillMidBtn');
    this.killHighBtn = document.getElementById('cadpKillHighBtn');

    // VU Meters
    this.vuLeft = document.getElementById('cadpVuLeft');
    this.vuRight = document.getElementById('cadpVuRight');

    // Toast HUD
    this.toast = document.getElementById('cadpToast');
  }

  initEvents() {
    // Play / Pause
    if (this.playBtn) {
      this.playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.togglePlayback();
      });
    }

    // Previous Track
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.prevTrack();
      });
    }

    // Next Track
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.nextTrack();
      });
    }

    // Shuffle Toggle
    if (this.shuffleBtn) {
      this.shuffleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isShuffled = !this.isShuffled;
        this.shuffleBtn.classList.toggle('active', this.isShuffled);
        this.showToast(this.isShuffled ? '🔀 SHUFFLE: ON' : '🔀 SHUFFLE: OFF');
      });
    }

    // Repeat / Loop Toggle
    if (this.repeatBtn) {
      this.repeatBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isLooped = !this.isLooped;
        this.repeatBtn.classList.toggle('active', this.isLooped);
        this.showToast(this.isLooped ? '🔁 REPEAT: ALL' : '🔁 REPEAT: OFF');
      });
    }

    // Heart / VIP Favorite
    if (this.heartBtn) {
      this.heartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.heartBtn.classList.toggle('liked');
        const isLiked = this.heartBtn.classList.contains('liked');
        this.showToast(isLiked ? '❤️ ADDED TO VIP FAVORITES' : '🤍 REMOVED FROM FAVORITES');
      });
    }

    // Scrubber Click & Drag Seeking
    if (this.scrubberTrack) {
      this.scrubberTrack.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = this.scrubberTrack.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        if (audioManager.audioElement && audioManager.audioElement.duration) {
          audioManager.audioElement.currentTime = pct * audioManager.audioElement.duration;
          this.updateScrubber(pct * 100);
        }
      });
    }

    // Volume Slider
    if (this.volSlider) {
      this.volSlider.addEventListener('input', (e) => {
        this.volume = parseFloat(e.target.value);
        if (audioManager.audioElement) {
          audioManager.audioElement.volume = this.volume;
        }
        if (this.volume === 0) {
          this.isMuted = true;
          this.volIcon?.classList.add('muted');
        } else {
          this.isMuted = false;
          this.volIcon?.classList.remove('muted');
        }
      });
    }

    // Volume Mute Toggle
    if (this.volIcon) {
      this.volIcon.addEventListener('click', (e) => {
        e.preventDefault();
        this.isMuted = !this.isMuted;
        if (audioManager.audioElement) {
          audioManager.audioElement.muted = this.isMuted;
        }
        this.volIcon.classList.toggle('muted', this.isMuted);
        this.showToast(this.isMuted ? '🔇 AUDIO MUTED' : '🔊 AUDIO UNMUTED');
      });
    }

    // Visualizer Mode Switch
    if (this.vizModeBtn) {
      this.vizModeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.cycleVizMode();
      });
    }

    if (this.waveformWrap) {
      this.waveformWrap.addEventListener('click', () => {
        this.cycleVizMode();
      });
    }

    // ── 1. MASTER FX BYPASS / KILL SWITCH ───────────────────────────────
    if (this.fxBypassBtn) {
      this.fxBypassBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.isFXBypassed = !this.isFXBypassed;
        audioManager.setFXBypass(this.isFXBypassed);
        this.fxBypassBtn.classList.toggle('active', !this.isFXBypassed);
        this.fxBypassBtn.classList.toggle('bypassed', this.isFXBypassed);
        if (this.bypassText) {
          this.bypassText.textContent = this.isFXBypassed ? 'BYPASSED' : 'FX ON';
        }
        this.showToast(this.isFXBypassed ? '🛡️ MASTER FX BYPASSED (CLEAN AUDIO)' : '⚡ MASTER FX ENGAGED');
      });
    }

    // ── 2. PIONEER BIPOLAR COLOR FILTER (LPF ⇄ HPF) ────────────────────
    if (this.filterColor) {
      this.filterColor.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value); // -100..0..+100
        if (!this.isFXBypassed) {
          audioManager.setBipolarColorFilter(val);
        }
        if (val < -10) {
          this.showToast(`🎛️ COLOR: LPF SWEEP (${Math.round(Math.abs(val))}%)`);
        } else if (val > 10) {
          this.showToast(`🎛️ COLOR: HPF SWEEP (${Math.round(val)}%)`);
        } else {
          this.showToast('🎛️ COLOR: FLAT BYPASS (0)');
        }
      });
      this.filterColor.addEventListener('dblclick', () => {
        this.filterColor.value = 0;
        audioManager.setBipolarColorFilter(0);
        this.showToast('🎛️ COLOR FILTER RESET (CENTER)');
      });
    }

    // ── 3. ANALOG TAPE DRIVE SATURATION ────────────────────────────────
    if (this.filterDrive) {
      this.filterDrive.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value); // 0–100
        if (!this.isFXBypassed) {
          audioManager.setDrive(val);
        }
        this.showToast(`🔥 TAPE DRIVE SATURATION: ${Math.round(val)}%`);
      });
    }

    // ── 4. SUB-HARMONIC BASS BOOST ─────────────────────────────────────
    if (this.filterBass) {
      this.filterBass.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value); // 0–100
        const gainDb = ((val - 50) / 50) * 16;
        if (!this.isFXBypassed) {
          if (audioManager.subBassNode) audioManager.subBassNode.gain.value = Math.max(0, gainDb);
          if (audioManager.eqBands && audioManager.eqBands[0]) audioManager.eqBands[0].gain.value = gainDb;
          if (audioManager.eqBands && audioManager.eqBands[1]) audioManager.eqBands[1].gain.value = gainDb * 0.7;
        }
        this.showToast(`🔊 SUB-BASS EXCITER: ${gainDb >= 0 ? '+' : ''}${gainDb.toFixed(1)}dB`);
      });
    }

    // ── 5. CYBER STUTTER BEAT CHOP FX ──────────────────────────────────
    if (this.filterChop) {
      this.filterChop.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value); // 0–100
        clearInterval(this.stutterTimer);
        if (val > 15 && this.isPlaying && !this.isFXBypassed) {
          const speed = Math.max(30, 200 - val * 1.6);
          this.stutterTimer = setInterval(() => {
            if (audioManager.audioElement && this.isPlaying) {
              audioManager.audioElement.muted = !audioManager.audioElement.muted;
            }
          }, speed);
          this.showToast(`⚡ DJ STUTTER CHOP: ${Math.round(val)}%`);
        } else {
          if (audioManager.audioElement) {
            audioManager.audioElement.muted = this.isMuted;
          }
          if (val === 0) this.showToast('⚡ CHOP FX: OFF');
        }
      });
    }

    // ── 6. DUB ECHO FREEZE TOGGLE ──────────────────────────────────────
    if (this.fxEchoBtn) {
      this.fxEchoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.isEchoOn = !this.isEchoOn;
        audioManager.toggleEchoFreeze(this.isEchoOn);
        this.fxEchoBtn.classList.toggle('active', this.isEchoOn);
        this.showToast(this.isEchoOn ? '🌀 DUB ECHO FREEZE: ON' : '🌀 DUB ECHO: OFF');
      });
    }

    // ── 7. VINYL MOTOR BRAKE (TAPE STOP) ───────────────────────────────
    if (this.fxBrakeBtn) {
      this.fxBrakeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showToast('🛑 VINYL MOTOR BRAKE SLOWDOWN');
        this.fxBrakeBtn.classList.add('active');
        audioManager.triggerVinylBrake(0.8, () => {
          this.isPlaying = false;
          this.updatePlayState(false);
          this.fxBrakeBtn.classList.remove('active');
        });
      });
    }

    // ── 8. CLUB WHITE NOISE RISER DROP ─────────────────────────────────
    if (this.fxRiserBtn) {
      this.fxRiserBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.fxRiserBtn.classList.add('active');
        audioManager.triggerNoiseRiser(2.2);
        this.showToast('🚀 WHITE NOISE DROP RISER');
        setTimeout(() => {
          this.fxRiserBtn.classList.remove('active');
        }, 2200);
      });
    }

    // ── 9. FREQUENCY ISOLATOR KILL BUTTONS ─────────────────────────────
    if (this.killLowBtn) {
      this.killLowBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.isLowKilled = !this.isLowKilled;
        audioManager.setBandKill('low', this.isLowKilled);
        this.killLowBtn.classList.toggle('active', this.isLowKilled);
        this.showToast(this.isLowKilled ? '✂️ LOW-END KILLED (-∞ dB)' : '🔊 LOW-END RESTORED');
      });
    }

    if (this.killMidBtn) {
      this.killMidBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.isMidKilled = !this.isMidKilled;
        audioManager.setBandKill('mid', this.isMidKilled);
        this.killMidBtn.classList.toggle('active', this.isMidKilled);
        this.showToast(this.isMidKilled ? '✂️ MID-RANGE KILLED (-∞ dB)' : '🔊 MID-RANGE RESTORED');
      });
    }

    if (this.killHighBtn) {
      this.killHighBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.isHighKilled = !this.isHighKilled;
        audioManager.setBandKill('high', this.isHighKilled);
        this.killHighBtn.classList.toggle('active', this.isHighKilled);
        this.showToast(this.isHighKilled ? '✂️ HIGH-END KILLED (-∞ dB)' : '🔊 HIGH-END RESTORED');
      });
    }

    // ── FX PRESETS ─────────────────────────────────────────────────────
    if (this.presetBass) {
      this.presetBass.addEventListener('click', () => this.applyPreset('bass'));
    }
    if (this.presetSpatial) {
      this.presetSpatial.addEventListener('click', () => this.applyPreset('spatial'));
    }
    if (this.presetWarmth) {
      this.presetWarmth.addEventListener('click', () => this.applyPreset('warmth'));
    }
  }

  cycleVizMode() {
    const modes = ['bars', 'wave', 'flux'];
    const nextIdx = (modes.indexOf(this.vizMode) + 1) % modes.length;
    this.vizMode = modes[nextIdx];
    const modeNames = { bars: 'MODE: PRO BARS', wave: 'MODE: NEON WAVE', flux: 'MODE: CYBER FLUX' };
    if (this.vizModeBtn) {
      this.vizModeBtn.textContent = modeNames[this.vizMode];
    }
    this.showToast(`📊 SPECTRUM: ${modeNames[this.vizMode]}`);
  }

  applyPreset(type) {
    if (this.activePreset === type) {
      this.activePreset = 'default';
      this.resetEQ();
      this.presetBass?.classList.remove('active');
      this.presetSpatial?.classList.remove('active');
      this.presetWarmth?.classList.remove('active');
      this.showToast('🎛️ DSP PRESET: FLAT MASTER');
      return;
    }

    this.activePreset = type;
    this.presetBass?.classList.toggle('active', type === 'bass');
    this.presetSpatial?.classList.toggle('active', type === 'spatial');
    this.presetWarmth?.classList.toggle('active', type === 'warmth');

    if (type === 'bass') {
      if (audioManager.eqBands) {
        audioManager.eqBands[0].gain.value = 12;
        audioManager.eqBands[1].gain.value = 8;
        audioManager.eqBands[2].gain.value = -2;
        audioManager.eqBands[3].gain.value = 4;
      }
      this.showToast('🔥 PRESET: CLUB BASS BOOST ACTIVE');
    } else if (type === 'spatial') {
      if (audioManager.eqBands) {
        audioManager.eqBands[0].gain.value = 4;
        audioManager.eqBands[1].gain.value = -3;
        audioManager.eqBands[2].gain.value = 6;
        audioManager.eqBands[3].gain.value = 10;
        audioManager.eqBands[4].gain.value = 8;
      }
      this.showToast('🌌 PRESET: SPATIAL 8D EXPANDER ACTIVE');
    } else if (type === 'warmth') {
      if (audioManager.eqBands) {
        audioManager.eqBands[0].gain.value = 6;
        audioManager.eqBands[1].gain.value = 4;
        audioManager.eqBands[2].gain.value = 3;
        audioManager.eqBands[3].gain.value = -2;
        audioManager.eqBands[4].gain.value = -4;
      }
      this.showToast('📻 PRESET: VIP TAPE WARMTH ACTIVE');
    }
  }

  resetEQ() {
    if (audioManager.eqBands) {
      audioManager.eqBands.forEach(b => { b.gain.value = 0; });
    }
  }

  initTurntableScratch() {
    if (!this.platterWrap) return;

    let startX = 0;
    this.platterWrap.addEventListener('mousedown', (e) => {
      this.isScratching = true;
      startX = e.clientX;
      audioManager.playScratch();
      this.showToast('💿 VINYL SCRATCH FX');
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isScratching) return;
      const delta = e.clientX - startX;
      if (Math.abs(delta) > 20) {
        audioManager.playScratch();
        startX = e.clientX;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isScratching = false;
    });

    this.platterWrap.addEventListener('click', (e) => {
      e.preventDefault();
      audioManager.playScratch();
    });
  }

  async togglePlayback() {
    await audioManager.init();

    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  async play() {
    await audioManager.init();
    audioManager.playTrack(this.currentTrackIdx);
    this.isPlaying = true;
    this.updatePlayState(true);
    this.showToast(`▶ PLAYING: ${this.tracks[this.currentTrackIdx].title.toUpperCase()}`);
  }

  pause() {
    if (audioManager.audioElement) {
      audioManager.audioElement.pause();
    }
    this.isPlaying = false;
    this.updatePlayState(false);
    clearInterval(this.stutterTimer);
    this.showToast('⏸ PAUSED');
  }

  nextTrack() {
    if (this.isShuffled) {
      this.currentTrackIdx = Math.floor(Math.random() * this.tracks.length);
    } else {
      this.currentTrackIdx = (this.currentTrackIdx + 1) % this.tracks.length;
    }
    this.updateTrackInfo();
    if (this.isPlaying) this.play();
  }

  prevTrack() {
    this.currentTrackIdx = (this.currentTrackIdx - 1 + this.tracks.length) % this.tracks.length;
    this.updateTrackInfo();
    if (this.isPlaying) this.play();
  }

  updateTrackInfo() {
    const cur = this.tracks[this.currentTrackIdx];
    if (this.trackTitle) this.trackTitle.textContent = cur.title;
    if (this.artistTime) this.artistTime.textContent = `${cur.artist} • 0:00 / ${cur.duration}`;
  }

  updateScrubber(pct) {
    if (this.scrubberFill) {
      this.scrubberFill.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    }
  }

  updatePlayState(playing) {
    if (this.deck) this.deck.classList.toggle('playing', playing);
    if (this.emblem) this.emblem.classList.toggle('spinning', playing);
    if (this.eqBars) this.eqBars.classList.toggle('active', playing);

    if (this.playIcon) this.playIcon.style.display = playing ? 'none' : 'block';
    if (this.pauseIcon) this.pauseIcon.style.display = playing ? 'block' : 'none';
  }

  initVisualizer() {
    if (!this.waveformCanvas) return;
    const ctx = this.waveformCanvas.getContext('2d');
    if (!ctx) return;

    const numBars = 40;

    const render = () => {
      requestAnimationFrame(render);

      const w = this.waveformCanvas.width;
      const h = this.waveformCanvas.height;
      ctx.clearRect(0, 0, w, h);

      // Pure black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      if (this.isPlaying && audioManager.analyser && audioManager.dataArray) {
        audioManager.analyser.getByteFrequencyData(audioManager.dataArray);
        audioManager.analyser.getByteTimeDomainData(this.timeDataArray);

        let sumVolume = 0;

        // ══════════════════════════════════════════════════════════════
        // MODE 1: PRO MULTI-BAND BARS & FLOATING PEAK HOLD CAPS
        // ══════════════════════════════════════════════════════════════
        if (this.vizMode === 'bars') {
          // ── LED Segmented Spectrum Analyzer (Green → Yellow → Red) ──
          const gap       = 2.0;                    // gap between bars
          const barWidth  = (w / numBars) - gap;    // bar pixel width
          const segH      = 2.5;                    // LED segment height
          const segGap    = 0.8;                    // gap between segments
          const segStep   = segH + segGap;          // total step per segment
          const mirrorH   = h * 0.3;               // reflection zone height
          const barZoneH  = h - mirrorH - 2;       // usable bar zone

          for (let i = 0; i < numBars; i++) {
            // Logarithmic frequency mapping — rich bass detail
            const logIdx = Math.floor(Math.pow(i / numBars, 1.5) * (audioManager.dataArray.length * 0.5));
            const val    = audioManager.dataArray[logIdx] || 0;
            sumVolume   += val;

            const barHeight = Math.max(segStep, (val / 255) * barZoneH);
            const x         = i * (barWidth + gap) + 1;
            const numSegs   = Math.floor(barHeight / segStep);
            const totalSegs = Math.floor(barZoneH / segStep);

            // Update Peak Hold (slower decay for dramatic hang)
            if (barHeight > (this.peaks[i] || 0)) {
              this.peaks[i] = barHeight;
            } else {
              this.peaks[i] = Math.max(0, (this.peaks[i] || 0) - 0.5);
            }

            // ── Draw segmented LED bar (bottom → top) ──
            for (let s = 0; s < numSegs; s++) {
              const segY     = barZoneH - (s + 1) * segStep + 1;
              const progress = s / totalSegs; // 0 = bottom, 1 = top

              // Colour stops: green (0%) → yellow-green (45%) → yellow (65%) → orange (80%) → red (100%)
              let r, g, b;
              if (progress < 0.45) {
                // Bright green → yellow-green
                const t = progress / 0.45;
                r = Math.round(0   + t * 128);   // 0   → 128
                g = Math.round(220 + t * 15);    // 220 → 235
                b = 0;
              } else if (progress < 0.65) {
                // yellow-green → yellow
                const t = (progress - 0.45) / 0.20;
                r = Math.round(128 + t * 127);   // 128 → 255
                g = Math.round(235 - t * 20);    // 235 → 215
                b = 0;
              } else if (progress < 0.80) {
                // yellow → orange
                const t = (progress - 0.65) / 0.15;
                r = 255;
                g = Math.round(215 - t * 115);   // 215 → 100
                b = 0;
              } else {
                // orange → red
                const t = (progress - 0.80) / 0.20;
                r = 255;
                g = Math.round(100 - t * 100);   // 100 → 0
                b = 0;
              }

              const color  = `rgb(${r},${g},${b})`;
              const glow   = progress > 0.75 ? 6 : (progress > 0.5 ? 3 : 1);

              ctx.fillStyle   = color;
              ctx.shadowColor = color;
              ctx.shadowBlur  = glow;
              ctx.fillRect(x, segY, barWidth, segH);
            }

            // ── Floating Peak Hold Cap ──
            const peakSegs = Math.floor((this.peaks[i] || 0) / segStep);
            if (peakSegs > 0) {
              const peakY     = barZoneH - peakSegs * segStep + 1;
              const peakProg  = peakSegs / totalSegs;
              // Cap colour follows the same gradient
              let pr, pg;
              if (peakProg < 0.65) { pr = 255; pg = 220; }
              else { pr = 255; pg = Math.round(100 * (1 - (peakProg - 0.65) / 0.35)); }
              const capColor  = `rgb(${pr},${pg},0)`;
              ctx.fillStyle   = capColor;
              ctx.shadowColor = capColor;
              ctx.shadowBlur  = 10;
              ctx.fillRect(x, peakY, barWidth, segH + 0.5);
            }

            // ── Mirror Reflection (dimmed, inverted) ──
            const reflBase = barZoneH + 3;
            ctx.save();
            ctx.globalAlpha = 0.22;
            for (let s = 0; s < Math.min(numSegs, Math.floor(mirrorH / segStep)); s++) {
              const reflY    = reflBase + s * segStep;
              const progress = s / totalSegs;
              let r2, g2;
              if (progress < 0.45) { r2 = 0; g2 = 220; }
              else if (progress < 0.65) { r2 = 128; g2 = 200; }
              else { r2 = 255; g2 = 80; }
              ctx.fillStyle   = `rgb(${r2},${g2},0)`;
              ctx.shadowBlur  = 0;
              ctx.fillRect(x, reflY, barWidth, segH);
            }
            ctx.restore();
          }
        }

        // ══════════════════════════════════════════════════════════════
        // MODE 2: HOLOGRAPHIC NEON OSCILLOSCOPE WAVE + EMBERS
        // ══════════════════════════════════════════════════════════════
        else if (this.vizMode === 'wave') {
          ctx.beginPath();
          const sliceWidth = w / this.timeDataArray.length;
          let x = 0;

          for (let i = 0; i < this.timeDataArray.length; i++) {
            const v = this.timeDataArray[i] / 128.0;
            const y = (v * h) / 2;
            sumVolume += Math.abs(this.timeDataArray[i] - 128) * 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }

          ctx.strokeStyle = '#ff2a4b';
          ctx.shadowColor = '#ff203a';
          ctx.shadowBlur = 12;
          ctx.lineWidth = 2.4;
          ctx.stroke();

          // Second harmonic golden glow wave
          ctx.beginPath();
          x = 0;
          for (let i = 0; i < this.timeDataArray.length; i++) {
            const v = (this.timeDataArray[i] / 128.0) * 0.8 + 0.1;
            const y = (v * h) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
          }
          ctx.strokeStyle = '#ffea88';
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 8;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Floating audio spark particles
          this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < 0) { p.y = h; p.x = Math.random() * w; }
            ctx.fillStyle = `rgba(255, 230, 136, ${p.alpha})`;
            ctx.shadowColor = '#ff203a';
            ctx.shadowBlur = 4;
            ctx.fillRect(p.x, p.y, p.size, p.size);
          });
        }

        // ══════════════════════════════════════════════════════════════
        // MODE 3: SYMMETRICAL CYBER ENERGY FLUX
        // ══════════════════════════════════════════════════════════════
        else if (this.vizMode === 'flux') {
          const halfBars = Math.floor(numBars / 2);
          const barWidth = (w / numBars) - 1.5;
          const centerY = h / 2;

          for (let i = 0; i < halfBars; i++) {
            const sampleIdx = Math.floor((i / halfBars) * 36);
            const val = audioManager.dataArray[sampleIdx] || 0;
            sumVolume += val * 2;
            const fluxHeight = (val / 255) * (h * 0.44);

            const xL = (halfBars - 1 - i) * (barWidth + 1.5);
            const xR = (halfBars + i) * (barWidth + 1.5);

            const grad = ctx.createLinearGradient(0, centerY - fluxHeight, 0, centerY + fluxHeight);
            grad.addColorStop(0, '#ffea88');
            grad.addColorStop(0.5, '#ff2540');
            grad.addColorStop(1, '#ffea88');

            ctx.fillStyle = grad;
            ctx.shadowColor = '#ff203a';
            ctx.shadowBlur = 6;

            ctx.fillRect(xL, centerY - fluxHeight, barWidth, fluxHeight * 2);
            ctx.fillRect(xR, centerY - fluxHeight, barWidth, fluxHeight * 2);
          }

          // Center laser horizontal beam
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, centerY);
          ctx.lineTo(w, centerY);
          ctx.stroke();
        }

        // Live VU Meter LED animation
        const avgVolPct = Math.min(100, Math.round((sumVolume / (numBars * 255)) * 140));
        if (this.vuLeft) this.vuLeft.style.height = `${avgVolPct}%`;
        if (this.vuRight) this.vuRight.style.height = `${Math.min(100, avgVolPct * 1.05)}%`;

        // Live track duration updater
        if (audioManager.audioElement && audioManager.audioElement.currentTime) {
          const cur = Math.floor(audioManager.audioElement.currentTime);
          const dur = Math.floor(audioManager.audioElement.duration || this.tracks[this.currentTrackIdx].durationSec);
          const min = Math.floor(cur / 60);
          const sec = cur % 60;
          const timeStr = `${min}:${sec < 10 ? '0' : ''}${sec}`;
          const curTrack = this.tracks[this.currentTrackIdx];
          if (this.artistTime) {
            this.artistTime.textContent = `${curTrack.artist} • ${timeStr} / ${curTrack.duration}`;
          }
          if (dur > 0) {
            this.updateScrubber((cur / dur) * 100);
          }
        }
      } else {
        // Idle ambient visualizer
        const time = Date.now() * 0.003;
        const barWidth = (w / numBars) - 2.0;
        for (let i = 0; i < numBars; i++) {
          const wave = Math.sin(time + i * 0.28) * 0.5 + 0.5;
          const barHeight = Math.max(3, wave * 14);
          const x = i * (barWidth + 2.0) + 2;
          const y = h - barHeight - 2;

          ctx.fillStyle = 'rgba(255, 30, 50, 0.45)';
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.fillRect(x, y, barWidth, barHeight);
        }
        if (this.vuLeft) this.vuLeft.style.height = '12%';
        if (this.vuRight) this.vuRight.style.height = '12%';
      }
    };

    render();
  }

  showToast(msg) {
    if (!this.toast) return;
    this.toast.textContent = msg;
    this.toast.classList.add('visible');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      this.toast.classList.remove('visible');
    }, 1900);
  }
}
