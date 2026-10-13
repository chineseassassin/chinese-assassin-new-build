/**
 * ============================================================================
 * NETFLIX-STYLE VIDEO/AUDIO PLAYER CONTROLLER
 * ============================================================================
 * Features:
 * - Dynamic Fullscreen on Play / Exit Fullscreen on Pause
 * - Custom Description & Metadata editing with localStorage persistence
 * - Interactive Video/Audio scrubber, volume, tracks & chapters selector
 * - Netflix Hero Layout with MHP.JPG backdrop artwork
 * - In-Video HUD with auto-hide on inactivity
 */

const STORAGE_KEY = 'ca_netflix_video_meta_v2';

export const DEFAULT_META = {
  title: 'CHINESE ASSASSIN',
  tagline: 'EXCLUSIVE SERIES • VIP ORIGINALS',
  synopsis: 'A legendary martial arts master and underground turntable assassin unites ancient Kung Fu wisdom with high-energy electronic soundscapes. When the VIP portal opens, only the worthy unlock the golden master tapes and claim their destiny.',
  matchScore: '99% Match',
  ageRating: '18+',
  duration: '4K Ultra HD • Spatial Audio',
  year: '2026',
  genres: 'Martial Arts • Cinematic Bass • DJ Turntablism • Blockbuster Soundscapes',
  cast: 'Master DJ, Clan of Assassins, VIP Universe Sound Lab',
  videoSource: '/AURA-FUNNY.mp4'
};

export const TRACK_LIST = [
  {
    id: 'ch1',
    title: 'Chapter 1: The Dragon Awakens',
    type: 'video',
    src: '/AURA-FUNNY.mp4',
    duration: '02:45',
    desc: 'The master unlocks the ancient turntable scrolls.',
    thumb: '/MHP2.jpg'
  },
  {
    id: 'ch2',
    title: 'Chapter 2: Temple of Dimensions',
    type: 'video',
    src: '/website_intro.mp4',
    duration: '01:30',
    desc: 'Journey through the biometric gate into the VIP universe.',
    thumb: '/assassin_temple_new.jpg'
  },
  {
    id: 'tr1',
    title: 'Audio Set: Sub-Zero Bass Dubstep',
    type: 'audio',
    src: '/demo1.mp3',
    duration: '03:52',
    desc: 'Heavyweight basslines and lethal chops.',
    thumb: '/dj_background.png'
  },
  {
    id: 'tr2',
    title: 'Audio Set: Crimson Dragon Trap Mix',
    type: 'audio',
    src: '/demo2.mp3',
    duration: '04:15',
    desc: 'Hypnotic synth lines and thunderous 808s.',
    thumb: '/banner_crimson_cyber.png'
  }
];

export class NetflixPlayer {
  constructor(introInstance) {
    this.intro = introInstance;
    this.stage = document.getElementById('stage');
    this.video = document.getElementById('nf-main-video');
    this.screenUnit = document.querySelector('.nf-screen-unit');
    this.screenImg = document.querySelector('.nf-screen-img');
    this.minimalUI = document.querySelector('.ca-minimal-hero-ui');
    this.descPanel = document.getElementById('ca-description-panel');
    this.hud = document.getElementById('nf-player-hud');
    this.editModal = document.getElementById('nf-edit-modal');
    
    this.isPlaying = false;
    this.isMuted = false;
    this.currentTrack = TRACK_LIST[0];
    this.meta = this.loadMeta();
    this.hideHudTimer = null;
    this.isUserSeeking = false;

    this.initDOM();
    this.initEvents();
    this.applyMetaToUI();
  }

  loadMeta() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_META, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Could not read saved meta from localStorage', e);
    }
    return { ...DEFAULT_META };
  }

  saveMeta(newMeta) {
    this.meta = { ...this.meta, ...newMeta };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.meta));
    } catch (e) {
      console.warn('Could not write meta to localStorage', e);
    }
    this.applyMetaToUI();
  }

  resetMeta() {
    this.meta = { ...DEFAULT_META };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    this.applyMetaToUI();
  }

  applyMetaToUI() {
    // Title
    const titleEl = document.getElementById('nf-video-title');
    if (titleEl) titleEl.innerText = this.meta.title || DEFAULT_META.title;

    // Tagline / Badge
    const taglineEl = document.getElementById('nf-video-tagline');
    if (taglineEl) taglineEl.innerText = this.meta.tagline || DEFAULT_META.tagline;

    // Synopsis
    const synopsisEl = document.getElementById('nf-video-synopsis');
    if (synopsisEl) synopsisEl.innerText = this.meta.synopsis || DEFAULT_META.synopsis;

    // Badges
    const matchEl = document.getElementById('nf-meta-match');
    if (matchEl) matchEl.innerText = this.meta.matchScore || DEFAULT_META.matchScore;

    const ratingEl = document.getElementById('nf-meta-rating');
    if (ratingEl) ratingEl.innerText = this.meta.ageRating || DEFAULT_META.ageRating;

    const durEl = document.getElementById('nf-meta-duration');
    if (durEl) durEl.innerText = this.meta.duration || DEFAULT_META.duration;

    const yearEl = document.getElementById('nf-meta-year');
    if (yearEl) yearEl.innerText = this.meta.year || DEFAULT_META.year;

    // Details tab fields
    const genresEl = document.getElementById('nf-details-genres');
    if (genresEl) genresEl.innerText = this.meta.genres || DEFAULT_META.genres;

    const castEl = document.getElementById('nf-details-cast');
    if (castEl) castEl.innerText = this.meta.cast || DEFAULT_META.cast;

    // HUD Header title
    const hudTitle = document.getElementById('nf-hud-title');
    if (hudTitle) hudTitle.innerText = this.meta.title || DEFAULT_META.title;

    // Sync modal fields if open
    this.populateModalFields();
  }

  initDOM() {
    // Render Episodes / Track list in tabs
    this.renderTrackList();

    // Screen image — WICKED3.jpg
    if (this.screenImg) {
      this.screenImg.src = '/WICKED3.jpg';
      this.screenImg.onerror = () => {
        this.screenImg.src = '/WICKED3.png';
      };
    }

    // Set initial video source
    if (this.video && this.meta.videoSource) {
      this.setMediaSource(this.meta.videoSource, 'video');
    }
  }

  initEvents() {
    // 1a. Hero Play Button on floating card
    const heroPlayBtn = document.getElementById('nf-hero-play-btn');
    if (heroPlayBtn) {
      heroPlayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.togglePlayPause();
      });
    }

    // 1b. Description Toggle Button & Close
    const descToggleBtn = document.getElementById('ca-desc-toggle-btn');
    if (descToggleBtn) {
      descToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.descPanel) {
          this.descPanel.classList.toggle('open');
        }
      });
    }

    const descCloseBtn = document.getElementById('ca-desc-close-btn');
    if (descCloseBtn) {
      descCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.descPanel) {
          this.descPanel.classList.remove('open');
        }
      });
    }

    // Close description panel when clicking outside of it
    document.addEventListener('click', (e) => {
      if (this.descPanel && this.descPanel.classList.contains('open')) {
        if (!this.descPanel.contains(e.target) && !e.target.closest('#ca-desc-toggle-btn')) {
          this.descPanel.classList.remove('open');
        }
      }
    });

    // 2. HUD Play/Pause button
    const hudPlayBtn = document.getElementById('nf-hud-play-btn');
    if (hudPlayBtn) {
      hudPlayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.togglePlayPause();
      });
    }

    // 3. Center Screen Play/Pause click
    if (this.video) {
      this.video.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.togglePlayPause();
      });

      this.video.addEventListener('timeupdate', () => this.onTimeUpdate());
      this.video.addEventListener('loadedmetadata', () => this.onMetaLoaded());
      this.video.addEventListener('ended', () => this.onEnded());
      this.video.addEventListener('play', () => this.onPlayStateChange(true));
      this.video.addEventListener('pause', () => this.onPlayStateChange(false));
    }

    // 4. Scrubber / Progress Bar
    const scrubTrack = document.getElementById('nf-hud-progress-track');
    if (scrubTrack) {
      scrubTrack.addEventListener('click', (e) => this.onScrubClick(e));
      scrubTrack.addEventListener('mousemove', (e) => this.onScrubHover(e));
    }

    // 5. Volume Slider & Mute
    const volSlider = document.getElementById('nf-hud-volume-slider');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (this.video) this.video.volume = val;
        this.updateVolumeUI(val);
      });
    }

    const muteBtn = document.getElementById('nf-hud-mute-btn');
    const heroAudioBtn = document.getElementById('nf-audio-btn');
    [muteBtn, heroAudioBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleMute();
        });
      }
    });

    // 6. Fullscreen toggle button on HUD
    const fsBtn = document.getElementById('nf-hud-fullscreen-btn');
    if (fsBtn) {
      fsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.isPlaying) {
          this.pause();
        } else {
          this.play();
        }
      });
    }

    // 7. Fullscreen exit button on HUD top-left
    const exitFsBtn = document.getElementById('nf-hud-back-btn');
    if (exitFsBtn) {
      exitFsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.pause();
      });
    }

    // 8. Skip forward 10s / backward 10s
    const rewBtn = document.getElementById('nf-hud-rewind-btn');
    if (rewBtn) {
      rewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.video) this.video.currentTime = Math.max(0, this.video.currentTime - 10);
      });
    }

    const fwdBtn = document.getElementById('nf-hud-forward-btn');
    if (fwdBtn) {
      fwdBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.video) this.video.currentTime = Math.min(this.video.duration || 0, this.video.currentTime + 10);
      });
    }

    // 9. Sync with Browser Fullscreen Change (e.g. user presses Esc key)
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        // Exited browser fullscreen -> restore stage and pause if playing
        if (this.stage) this.stage.classList.remove('fullscreen-mode');
        if (this.isPlaying) {
          this.pause();
        }
      }
    });

    // 10. Global Keyboard Shortcuts when Stage is active
    document.addEventListener('keydown', (e) => {
      const modalOpen = this.editModal && this.editModal.classList.contains('active');
      if (modalOpen) return; // Don't intercept when editing text

      if (e.code === 'Space') {
        const intro = document.getElementById('cinematic-intro');
        if (intro && intro.style.display !== 'none') {
          e.preventDefault();
          this.togglePlayPause();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        this.toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        this.togglePlayPause();
      } else if (e.key === 'Escape') {
        if (this.isPlaying) {
          this.pause();
        }
      }
    });

    // 11. Mouse Movement in Fullscreen HUD
    if (this.stage) {
      this.stage.addEventListener('mousemove', () => {
        if (this.isPlaying) {
          this.showHud();
          this.startHideHudTimer();
        }
      });
    }

    // 12. Description Edit Modal Handlers
    this.initEditModalEvents();

    // 13. Tabs Switcher
    this.initTabs();
  }

  // ── IN-PLACE PLAY / PAUSE LOGIC (SHARED PLAYBACK STATE ACROSS UPPER & BOTTOM PLAY) ──
  async play() {
    if (!this.video) return;

    if (!this.screenUnit) this.screenUnit = document.querySelector('.nf-screen-unit');

    try {
      if (this.screenUnit) {
        this.screenUnit.classList.add('in-playback-mode');
      }
      await this.video.play();
      this.isPlaying = true;
      this.onPlayStateChange(true);
    } catch (err) {
      console.warn('Playback error or user gesture required:', err);
      if (this.screenUnit) {
        this.screenUnit.classList.add('in-playback-mode');
      }
      this.isPlaying = true;
    }
  }

  pause() {
    if (this.video && !this.video.paused) {
      this.video.pause();
    }
    this.isPlaying = false;
    if (!this.screenUnit) this.screenUnit = document.querySelector('.nf-screen-unit');
    if (this.screenUnit) {
      this.screenUnit.classList.remove('in-playback-mode');
    }
    this.onPlayStateChange(false);
  }

  togglePlayPause() {
    if (this.video && !this.video.paused) {
      this.pause();
    } else {
      this.play();
    }
  }

  // ── STEP 3: VIDEO END BEHAVIOR ────────────────────────────────────────────
  onEnded() {
    if (this.video) {
      this.video.pause();
      this.video.currentTime = 0;
    }
    this.isPlaying = false;
    if (!this.screenUnit) this.screenUnit = document.querySelector('.nf-screen-unit');
    if (this.screenUnit) {
      this.screenUnit.classList.remove('in-playback-mode');
    }
    this.onPlayStateChange(false);
  }

  enterFullscreen() {
    if (!this.stage) this.stage = document.getElementById('stage');

    // 1. Apply CSS fullscreen mode to stage container
    if (this.stage) {
      this.stage.classList.add('fullscreen-mode');
    }

    // 2. Hide hero content overlay, close description panel, show Video & HUD
    if (this.minimalUI) {
      this.minimalUI.classList.add('in-playback-mode');
    }
    if (this.descPanel) {
      this.descPanel.classList.remove('open');
    }
    if (this.screenUnit) {
      this.screenUnit.classList.add('in-playback-mode');
    }

    // 3. Request native browser fullscreen on stage container if supported
    try {
      const elem = this.stage || document.documentElement;
      if (elem.requestFullscreen && !document.fullscreenElement) {
        elem.requestFullscreen().catch(() => {
          // Native fullscreen request blocked by browser policy — CSS fallback handles 100vw/100vh
        });
      }
    } catch (e) {}

    this.showHud();
    this.startHideHudTimer();
  }

  exitFullscreen() {
    if (!this.stage) this.stage = document.getElementById('stage');

    // 1. Remove CSS fullscreen mode from stage container
    if (this.stage) {
      this.stage.classList.remove('fullscreen-mode');
    }

    // 2. Restore hero UI overlay and screen surface
    if (this.minimalUI) {
      this.minimalUI.classList.remove('in-playback-mode');
    }
    if (this.screenUnit) {
      this.screenUnit.classList.remove('in-playback-mode');
    }

    // 3. Exit native browser fullscreen if active
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}

    // Hide HUD
    this.hideHud();
    if (this.hideHudTimer) clearTimeout(this.hideHudTimer);
  }

  onPlayStateChange(playing) {
    this.isPlaying = playing;
    const hudPlayIcon = document.getElementById('nf-hud-play-icon');
    const heroPlayText = document.getElementById('nf-hero-play-text');
    const heroPlayIcon = document.getElementById('nf-hero-play-icon');

    if (playing) {
      if (hudPlayIcon) {
        // Pause icon SVG
        hudPlayIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
      }
      if (heroPlayText) heroPlayText.innerText = 'Resume';
      if (heroPlayIcon) {
        heroPlayIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
      }
    } else {
      if (hudPlayIcon) {
        // Play icon SVG
        hudPlayIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`;
      }
      if (heroPlayText) heroPlayText.innerText = 'Play';
      if (heroPlayIcon) {
        heroPlayIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`;
      }
    }
  }

  showHud() {
    if (this.hud) {
      this.hud.classList.add('visible');
    }
  }

  hideHud() {
    if (this.hud) {
      this.hud.classList.remove('visible');
    }
  }

  startHideHudTimer() {
    if (this.hideHudTimer) clearTimeout(this.hideHudTimer);
    this.hideHudTimer = setTimeout(() => {
      if (this.isPlaying) {
        this.hideHud();
      }
    }, 3000);
  }

  // ── MEDIA SOURCE & TRACK SELECTOR ─────────────────────────────────────────
  setMediaSource(src, type = 'video') {
    if (!this.video) return;

    this.video.src = src;
    this.video.load();

    const hudSub = document.getElementById('nf-hud-subtitle');
    if (hudSub && this.currentTrack) {
      hudSub.innerText = this.currentTrack.title;
    }
  }

  switchTrack(trackId) {
    const track = TRACK_LIST.find(t => t.id === trackId);
    if (!track) return;
    this.currentTrack = track;
    this.setMediaSource(track.src, track.type);
    this.renderTrackList();
    this.play();
  }

  renderTrackList() {
    const container = document.getElementById('nf-tracks-list');
    if (!container) return;

    container.innerHTML = TRACK_LIST.map((t, idx) => `
      <div class="nf-track-card ${this.currentTrack && this.currentTrack.id === t.id ? 'active' : ''}" data-track-id="${t.id}">
        <div class="nf-track-num">${idx + 1}</div>
        <div class="nf-track-thumb-wrap">
          <img src="${t.thumb}" alt="${t.title}" class="nf-track-thumb" />
          <div class="nf-track-play-hover">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div class="nf-track-info">
          <div class="nf-track-title-row">
            <span class="nf-track-title">${t.title}</span>
            <span class="nf-track-duration">${t.duration}</span>
          </div>
          <p class="nf-track-desc">${t.desc}</p>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.nf-track-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-track-id');
        this.switchTrack(id);
      });
    });
  }

  // ── TIME & SCRUBBER ───────────────────────────────────────────────────────
  onTimeUpdate() {
    if (!this.video || this.isUserSeeking) return;

    const cur = this.video.currentTime || 0;
    const dur = this.video.duration || 1;
    const pct = (cur / dur) * 100;

    const fill = document.getElementById('nf-hud-progress-fill');
    if (fill) fill.style.width = `${pct}%`;

    const timeTxt = document.getElementById('nf-hud-time-current');
    if (timeTxt) timeTxt.innerText = this.formatTime(cur);

    const durTxt = document.getElementById('nf-hud-time-duration');
    if (durTxt) durTxt.innerText = this.formatTime(dur);
  }

  onMetaLoaded() {
    const dur = this.video ? this.video.duration : 0;
    const durTxt = document.getElementById('nf-hud-time-duration');
    if (durTxt) durTxt.innerText = this.formatTime(dur);
  }

  onEnded() {
    this.pause();
    if (this.video) this.video.currentTime = 0;
  }

  onScrubClick(e) {
    if (!this.video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const targetTime = pos * (this.video.duration || 0);
    this.video.currentTime = targetTime;
  }

  onScrubHover(e) {
    const tooltip = document.getElementById('nf-hud-scrub-tooltip');
    if (!tooltip || !this.video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const hoverTime = pos * (this.video.duration || 0);
    tooltip.innerText = this.formatTime(hoverTime);
    tooltip.style.left = `${pos * 100}%`;
    tooltip.style.display = 'block';

    const onLeave = () => {
      tooltip.style.display = 'none';
      e.currentTarget.removeEventListener('mouseleave', onLeave);
    };
    e.currentTarget.addEventListener('mouseleave', onLeave);
  }

  formatTime(secs) {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // ── VOLUME & MUTE ─────────────────────────────────────────────────────────
  toggleMute() {
    if (!this.video) return;
    this.isMuted = !this.isMuted;
    this.video.muted = this.isMuted;
    this.updateVolumeUI(this.isMuted ? 0 : this.video.volume);
  }

  updateVolumeUI(val) {
    const muteBtn = document.getElementById('nf-hud-mute-btn');
    const heroAudioBtn = document.getElementById('nf-audio-btn');
    const volSlider = document.getElementById('nf-hud-volume-slider');

    if (volSlider) volSlider.value = this.isMuted ? 0 : val;

    const iconHtml = (this.isMuted || val === 0)
      ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="#ffffff"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`
      : `<svg viewBox="0 0 24 24" width="20" height="20" fill="#ffffff"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;

    if (muteBtn) muteBtn.innerHTML = iconHtml;
    if (heroAudioBtn) heroAudioBtn.innerHTML = iconHtml;
  }

  // ── EDIT MODAL & METADATA MANAGEMENT ─────────────────────────────────────
  initEditModalEvents() {
    const editBtns = document.querySelectorAll('#nf-edit-btn, #nf-header-edit-btn, #nf-details-edit-btn');
    editBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openEditModal();
      });
    });

    const closeBtn = document.getElementById('nf-modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeEditModal());
    }

    const cancelBtn = document.getElementById('nf-modal-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeEditModal());
    }

    const saveBtn = document.getElementById('nf-modal-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveModalChanges();
      });
    }

    const resetBtn = document.getElementById('nf-modal-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Reset video description and details to default?')) {
          this.resetMeta();
          this.populateModalFields();
        }
      });
    }

    // Preset chips
    const presets = document.querySelectorAll('.nf-preset-pill');
    presets.forEach(p => {
      p.addEventListener('click', () => {
        const type = p.getAttribute('data-preset');
        this.applyPreset(type);
      });
    });
  }

  openEditModal() {
    if (!this.editModal) return;
    this.populateModalFields();
    this.editModal.classList.add('active');
  }

  closeEditModal() {
    if (!this.editModal) return;
    this.editModal.classList.remove('active');
  }

  populateModalFields() {
    const titleInp = document.getElementById('nf-edit-title-input');
    const taglineInp = document.getElementById('nf-edit-tagline-input');
    const synInp = document.getElementById('nf-edit-synopsis-input');
    const matchInp = document.getElementById('nf-edit-match-input');
    const ratingInp = document.getElementById('nf-edit-rating-input');
    const yearInp = document.getElementById('nf-edit-year-input');
    const durInp = document.getElementById('nf-edit-dur-input');
    const genresInp = document.getElementById('nf-edit-genres-input');
    const castInp = document.getElementById('nf-edit-cast-input');

    if (titleInp) titleInp.value = this.meta.title || '';
    if (taglineInp) taglineInp.value = this.meta.tagline || '';
    if (synInp) synInp.value = this.meta.synopsis || '';
    if (matchInp) matchInp.value = this.meta.matchScore || '99% Match';
    if (ratingInp) ratingInp.value = this.meta.ageRating || '18+';
    if (yearInp) yearInp.value = this.meta.year || '2026';
    if (durInp) durInp.value = this.meta.duration || '4K Ultra HD';
    if (genresInp) genresInp.value = this.meta.genres || '';
    if (castInp) castInp.value = this.meta.cast || '';
  }

  saveModalChanges() {
    const titleInp = document.getElementById('nf-edit-title-input');
    const taglineInp = document.getElementById('nf-edit-tagline-input');
    const synInp = document.getElementById('nf-edit-synopsis-input');
    const matchInp = document.getElementById('nf-edit-match-input');
    const ratingInp = document.getElementById('nf-edit-rating-input');
    const yearInp = document.getElementById('nf-edit-year-input');
    const durInp = document.getElementById('nf-edit-dur-input');
    const genresInp = document.getElementById('nf-edit-genres-input');
    const castInp = document.getElementById('nf-edit-cast-input');

    const updated = {
      title: titleInp ? titleInp.value.trim() || DEFAULT_META.title : DEFAULT_META.title,
      tagline: taglineInp ? taglineInp.value.trim() || DEFAULT_META.tagline : DEFAULT_META.tagline,
      synopsis: synInp ? synInp.value.trim() || DEFAULT_META.synopsis : DEFAULT_META.synopsis,
      matchScore: matchInp ? matchInp.value.trim() : '99% Match',
      ageRating: ratingInp ? ratingInp.value.trim() : '18+',
      year: yearInp ? yearInp.value.trim() : '2026',
      duration: durInp ? durInp.value.trim() : '4K Ultra HD',
      genres: genresInp ? genresInp.value.trim() : DEFAULT_META.genres,
      cast: castInp ? castInp.value.trim() : DEFAULT_META.cast
    };

    this.saveMeta(updated);
    this.closeEditModal();

    // Visual feedback notification
    this.showToast('Description & Details saved successfully!');
  }

  applyPreset(type) {
    const synInp = document.getElementById('nf-edit-synopsis-input');
    const titleInp = document.getElementById('nf-edit-title-input');
    const taglineInp = document.getElementById('nf-edit-tagline-input');

    if (type === 'assassin') {
      if (titleInp) titleInp.value = 'CHINESE ASSASSIN';
      if (taglineInp) taglineInp.value = 'EXCLUSIVE SERIES • VIP ORIGINALS';
      if (synInp) synInp.value = 'A legendary martial arts master and underground turntable assassin unites ancient Kung Fu wisdom with high-energy electronic soundscapes. When the VIP portal opens, only the worthy unlock the golden master tapes and claim their destiny.';
    } else if (type === 'djset') {
      if (titleInp) titleInp.value = 'VIP DIMENSION TOUR: LIVE';
      if (taglineInp) taglineInp.value = 'CONCERT EXPERIENCE • DOLBY 5.1';
      if (synInp) synInp.value = 'Step into the neon-lit underground sound arena. Master-class 4-deck mixing, thunderous bass drops, and mind-bending visual spectacles captured directly from the main stage.';
    } else if (type === 'heist') {
      if (titleInp) titleInp.value = 'THE GOLDEN MINT HEIST';
      if (taglineInp) taglineInp.value = 'CRIME SAGA • BLOCKBUSTER';
      if (synInp) synInp.value = 'An elite syndicate of sonic outlaws plans the most daring heist in electronic music history: to liberate unreleased master tracks locked deep inside the high-security vault.';
    }
  }

  showToast(msg) {
    let toast = document.getElementById('nf-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'nf-toast';
      toast.className = 'nf-toast-msg';
      document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // ── CLEAN TABS SWITCHER (OVERVIEW | EPISODES & TRACKS | DETAILS & CREDITS) ──
  initTabs() {
    const navItems = document.querySelectorAll('.ca-hotspot-tab, .ca-nav-item');
    const panes = document.querySelectorAll('.ca-tab-pane');

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const targetTab = item.getAttribute('data-tab');

        navItems.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));

        item.classList.add('active');
        if (targetTab && targetTab !== 'overview') {
          const activePane = document.getElementById(`nf-pane-${targetTab}`);
          if (activePane) activePane.classList.add('active');
        }
      });
    });

    // Bottom Chinese Assassin Player Console Hotspots
    const deckPlayBtn = document.getElementById('ca-btn-play-pause') || document.getElementById('ca-deck-play-btn');
    if (deckPlayBtn) {
      deckPlayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.togglePlayPause();
      });
    }

    const nextBtn = document.getElementById('ca-btn-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.nextTrack();
      });
    }

    const prevBtn = document.getElementById('ca-btn-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.prevTrack();
      });
    }

    const shuffleBtn = document.getElementById('ca-btn-shuffle');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showToast('🔀 Shuffle Mode Activated');
      });
    }

    const repeatBtn = document.getElementById('ca-btn-repeat');
    if (repeatBtn) {
      repeatBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showToast('🔁 Repeat Mode: Current Chapter');
      });
    }

    const volSlider = document.getElementById('ca-deck-volume');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        this.setVolume(parseFloat(e.target.value));
      });
    }

    const djFilterBtn = document.getElementById('ca-btn-dj-filter');
    if (djFilterBtn) {
      djFilterBtn.addEventListener('mousedown', () => {
        const homeFxBtn = document.getElementById('home-fx-btn');
        if (homeFxBtn) homeFxBtn.dispatchEvent(new MouseEvent('mousedown'));
        this.showToast('⚡ LIVE DJ FILTER ENGAGED');
      });
      djFilterBtn.addEventListener('mouseup', () => {
        const homeFxBtn = document.getElementById('home-fx-btn');
        if (homeFxBtn) homeFxBtn.dispatchEvent(new MouseEvent('mouseup'));
      });
    }
  }
}
