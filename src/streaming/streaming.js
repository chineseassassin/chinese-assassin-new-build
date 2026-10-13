/* ==========================================================================
   CHINESE ASSASSIN — STANDALONE STREAMING & RADIO LOGIC
   Scoped exclusively for /streaming page (streaming.html)
   ========================================================================== */

// ── 1. MIXES & STATIONS DATABASE ──────────────────────────────────────────
const MIXES_DATA = [
  {
    id: 'mix-1',
    title: 'CHINESE ASSASSIN — TEMPLE OF DANCEHALL 2026',
    artist: 'DJ PETER S & CHINESE ASSASSIN',
    category: 'dancehall',
    duration: '48:15',
    plays: '24.8K',
    cover: './ACONCEPT1.jpg.png',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'mix-2',
    title: 'REGGAE GOLD TEMPLE ESSENTIALS',
    artist: 'CHINESE ASSASSIN CREW',
    category: 'reggae',
    duration: '54:30',
    plays: '18.4K',
    cover: './AAA-1.png',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'mix-3',
    title: 'SOCA MONARCH POWER VOL. 9',
    artist: 'DJ PETER S',
    category: 'soca',
    duration: '42:10',
    plays: '15.9K',
    cover: './AAAB.JPG.png',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'mix-4',
    title: 'CYBER HIP-HOP & ROAD RAGE MIX',
    artist: 'CHINESE ASSASSIN CREW',
    category: 'hiphop',
    duration: '50:00',
    plays: '21.2K',
    cover: './AAACPNG.JPG.png',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: 'mix-5',
    title: 'CHINESE ASSASSIN CLASSIC DANCEHALL VAULT',
    artist: 'DJ PETER S',
    category: 'dancehall',
    duration: '62:15',
    plays: '31.5K',
    cover: './FACE.JPG.png',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
  {
    id: 'mix-6',
    title: 'ANCIENT REGGAE DUB & ROOT RHYTHMS',
    artist: 'CHINESE ASSASSIN CREW',
    category: 'reggae',
    duration: '45:20',
    plays: '12.7K',
    cover: './ACONCEPT1.jpg.png',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
  }
];

const TOP_FANS_DATA = [
  { rank: 1, name: 'DragonNinja_99', hours: '142 hrs streamed', avatar: './FACEID1.JPG.png' },
  { rank: 2, name: 'VipSocaKing', hours: '118 hrs streamed', avatar: './FACEID2.JPG.png' },
  { rank: 3, name: 'AssassinQueen', hours: '96 hrs streamed', avatar: './FACEID3.JPG.png' },
  { rank: 4, name: 'CyberDJ_Miami', hours: '84 hrs streamed', avatar: './FACEID4.JPG.png' }
];

const RECENTLY_PLAYED_DATA = [
  { title: 'TEMPLE OF DANCEHALL 2026', time: '10 mins ago', thumb: './ACONCEPT1.jpg.png' },
  { title: 'REGGAE GOLD TEMPLE ESSENTIALS', time: '1 hour ago', thumb: './AAA-1.png' },
  { title: 'SOCA MONARCH POWER VOL. 9', time: '3 hours ago', thumb: './AAAB.JPG.png' }
];

// ── 2. PLAYER STATE ────────────────────────────────────────────────────────
class StreamingAppController {
  constructor() {
    this.currentTrack = MIXES_DATA[0];
    this.isPlaying = false;
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';

    this.initElements();
    this.initEvents();
    this.renderMixes('all');
    this.renderTopFans();
    this.renderRecentlyPlayed();
    this.loadTrack(this.currentTrack, false);
  }

  initElements() {
    this.playBtn = document.getElementById('play-pause-btn');
    this.playIcon = document.getElementById('play-icon');
    this.pauseIcon = document.getElementById('pause-icon');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');

    this.currentCover = document.getElementById('current-cover');
    this.currentTitle = document.getElementById('current-title');
    this.currentArtist = document.getElementById('current-artist');

    this.progressFill = document.getElementById('progress-bar-fill');
    this.progressTrack = document.getElementById('progress-bar-track');
    this.timeCurrent = document.getElementById('time-current');
    this.timeTotal = document.getElementById('time-total');
    this.volumeSlider = document.getElementById('volume-slider');
    this.eqVisualizer = document.getElementById('eq-visualizer');

    this.mixesGrid = document.getElementById('mixes-grid');
    this.categoryTabs = document.getElementById('category-tabs');
    this.topFansList = document.getElementById('top-fans-list');
    this.recentMixesList = document.getElementById('recent-mixes-list');
  }

  initEvents() {
    // Play/Pause Master Toggle
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlay());
    }

    // Previous / Next Buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.playPrev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.playNext());
    }

    // Volume Control
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        this.audio.volume = parseFloat(e.target.value);
      });
    }

    // Audio Time Update
    this.audio.addEventListener('timeupdate', () => {
      if (this.audio.duration) {
        const pct = (this.audio.currentTime / this.audio.duration) * 100;
        if (this.progressFill) this.progressFill.style.width = `${pct}%`;
        if (this.timeCurrent) this.timeCurrent.textContent = this.formatTime(this.audio.currentTime);
        if (this.timeTotal) this.timeTotal.textContent = this.formatTime(this.audio.duration);
      }
    });

    // Seek Click
    if (this.progressTrack) {
      this.progressTrack.addEventListener('click', (e) => {
        const rect = this.progressTrack.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        if (this.audio.duration) {
          this.audio.currentTime = pct * this.audio.duration;
        }
      });
    }

    // Category Tabs Filter
    if (this.categoryTabs) {
      this.categoryTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        this.categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderMixes(btn.dataset.category);
      });
    }
  }

  loadTrack(track, autoPlay = true) {
    this.currentTrack = track;
    this.audio.src = track.streamUrl;

    if (this.currentCover) this.currentCover.src = track.cover;
    if (this.currentTitle) this.currentTitle.textContent = track.title;
    if (this.currentArtist) this.currentArtist.textContent = track.artist;

    if (autoPlay) {
      this.play();
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    this.audio.play().catch(() => {});
    if (this.playIcon) this.playIcon.style.display = 'none';
    if (this.pauseIcon) this.pauseIcon.style.display = 'block';
    if (this.eqVisualizer) this.eqVisualizer.classList.add('playing');
  }

  pause() {
    this.isPlaying = false;
    this.audio.pause();
    if (this.playIcon) this.playIcon.style.display = 'block';
    if (this.pauseIcon) this.pauseIcon.style.display = 'none';
    if (this.eqVisualizer) this.eqVisualizer.classList.remove('playing');
  }

  playPrev() {
    const idx = MIXES_DATA.findIndex(m => m.id === this.currentTrack.id);
    const prevIdx = (idx - 1 + MIXES_DATA.length) % MIXES_DATA.length;
    this.loadTrack(MIXES_DATA[prevIdx], true);
  }

  playNext() {
    const idx = MIXES_DATA.findIndex(m => m.id === this.currentTrack.id);
    const nextIdx = (idx + 1) % MIXES_DATA.length;
    this.loadTrack(MIXES_DATA[nextIdx], true);
  }

  formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  renderMixes(category = 'all') {
    if (!this.mixesGrid) return;
    const filtered = category === 'all' 
      ? MIXES_DATA 
      : MIXES_DATA.filter(m => m.category === category);

    this.mixesGrid.innerHTML = filtered.map(mix => `
      <div class="mix-card" data-id="${mix.id}">
        <div class="card-img-wrap">
          <img src="${mix.cover}" alt="${mix.title}" />
          <span class="card-genre-tag">${mix.category.toUpperCase()}</span>
          <div class="card-play-overlay">
            <div class="mini-play-btn">▶</div>
          </div>
        </div>
        <h4 class="mix-card-title">${mix.title}</h4>
        <p class="mix-card-dj">${mix.artist}</p>
        <div class="card-meta-row">
          <span>⏱ ${mix.duration}</span>
          <span>🎧 ${mix.plays} Plays</span>
        </div>
      </div>
    `).join('');

    // Attach card click listeners
    this.mixesGrid.querySelectorAll('.mix-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const track = MIXES_DATA.find(m => m.id === id);
        if (track) this.loadTrack(track, true);
      });
    });
  }

  renderTopFans() {
    if (!this.topFansList) return;
    this.topFansList.innerHTML = TOP_FANS_DATA.map(fan => `
      <div class="fan-item">
        <span class="fan-rank">#${fan.rank}</span>
        <img src="${fan.avatar}" alt="${fan.name}" class="fan-avatar" />
        <span class="fan-name">${fan.name}</span>
        <span class="fan-hours">${fan.hours}</span>
      </div>
    `).join('');
  }

  renderRecentlyPlayed() {
    if (!this.recentMixesList) return;
    this.recentMixesList.innerHTML = RECENTLY_PLAYED_DATA.map(item => `
      <div class="recent-item">
        <img src="${item.thumb}" alt="${item.title}" class="recent-thumb" />
        <div>
          <div class="recent-title">${item.title}</div>
          <div class="recent-time">${item.time}</div>
        </div>
      </div>
    `).join('');
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.streamingApp = new StreamingAppController();
});
