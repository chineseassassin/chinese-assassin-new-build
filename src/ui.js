const ALBUM_DATA = [
  {
     id: "album-1",
     title: "STREET KINGS ELITE",
     artist: "CHINESE ASSASSIN",
     type: "ELITE SET",
     price: 19.99,
     cover: "linear-gradient(45deg, #ff1a1a, #000)",
     checkoutUrl: "https://chineseassassin.com/checkout/street-kings",
     tracks: [
        { title: "Bulletproof Execution", time: "4:20" },
        { title: "Ghost Protocol", time: "3:45" },
        { title: "Red Lotus Strike", time: "5:10" }
     ]
  },
  {
     id: "album-2",
     title: "TEMPLES OF TRADITION",
     artist: "CHINESE ASSASSIN",
     type: "GOLD MIX",
     price: 14.99,
     cover: "linear-gradient(45deg, #cc0000, #220000)",
     checkoutUrl: "https://chineseassassin.com/checkout/temples",
     tracks: [
        { title: "Shaolin Rhythm", time: "6:15" },
        { title: "Ancient Wisdom", time: "4:30" },
        { title: "Jade Dragon", time: "5:50" }
     ]
  },
  {
     id: "album-3",
     title: "SILENT BLADE ANTHOLOGY",
     artist: "CHINESE ASSASSIN",
     type: "ELITE SET",
     price: 24.99,
     cover: "linear-gradient(45deg, #000, #444)",
     checkoutUrl: "https://chineseassassin.com/checkout/silent-blade",
     tracks: [
        { title: "Katan Strike", time: "3:55" },
        { title: "Shadow Walk", time: "4:12" },
        { title: "Empty Streets", time: "5:05" }
     ]
  },
  {
     id: "album-4",
     title: "RED LOTUS ASSASSIN",
     artist: "CHINESE ASSASSIN",
     type: "MINI MIX",
     price: 9.99,
     cover: "linear-gradient(135deg, #ff1a1a, #331111)",
     checkoutUrl: "https://chineseassassin.com/checkout/red-lotus",
     tracks: [
        { title: "Petals of Blood", time: "4:40" },
        { title: "Crimson Night", time: "3:30" }
     ]
  },
  {
     id: "album-5",
     title: "WARRIOR'S PATH",
     artist: "CHINESE ASSASSIN",
     type: "FULL SET",
     price: 18.00,
     cover: "linear-gradient(45deg, #880000, #000)",
     checkoutUrl: "https://chineseassassin.com/checkout/warrior-path",
     tracks: [
        { title: "Bushido Code", time: "7:20" },
        { title: "Ronin Spirit", time: "4:15" },
        { title: "Final Stand", time: "6:45" }
     ]
  }
];

export class UIController {
  constructor(audioManager, characterController) {
    this.audioManager = audioManager;
    this.characterController = characterController;
    
    this.playBtn = document.getElementById('main-play-btn');
    this.iconPlay = this.playBtn.querySelector('.icon-play');
    this.iconPause = this.playBtn.querySelector('.icon-pause');
    
    this.fxFilterBtn = document.getElementById('fx-filter-btn');
    this.carouselContainer = document.getElementById('album-carousel');
    this.playlistContainer = document.getElementById('playlist-list');
    
    this.prevArrow = document.getElementById('carousel-prev');
    this.nextArrow = document.getElementById('carousel-next');
    
    this.trackTitle = document.getElementById('current-track-title');
    this.trackArtist = document.getElementById('current-track-artist');
    
    this.playerAlbumName = document.getElementById('current-album-name');
    this.playerAlbumArtist = document.getElementById('current-album-artist');
    
    this.canvas = document.getElementById('audio-visualizer');
    this.ctx = this.canvas.getContext('2d');
    
    this.currentAlbum = 0;
    this.currentTrack = 0;
    this.previewContainer = document.getElementById('playlist-list-preview');
    
    this.renderCarousel();
    this.renderPlaylist();
    this.renderPreviewList();
    this.updatePlayerAlbumInfo();
    this.updateTrackDetails();
    
    this.initEventListeners();
    this.drawVisualizer();
  }

  renderPreviewList() {
    if (!this.previewContainer) return;
    this.previewContainer.innerHTML = '';
    const album = ALBUM_DATA[this.currentAlbum];
    
    album.tracks.slice(0, 5).forEach((track, idx) => {
       const li = document.createElement('li');
       li.innerHTML = `
         <span class="track-num">${idx + 1}</span>
         <span class="track-name">${track.title}</span>
         <span class="track-time-sub">${track.time}</span>
       `;
       li.addEventListener('click', () => {
          this.currentTrack = idx;
          this.audioManager.playTrack(idx);
          this.updateTrackDetails();
          this.setPlayingState(true);
       });
       this.previewContainer.appendChild(li);
    });
  }

  renderCarousel() {
    this.carouselContainer.innerHTML = '';
    
    ALBUM_DATA.forEach((album, index) => {
      const card = document.createElement('div');
      card.className = `album-card`;
      const badgeClass = album.type.includes('ELITE') ? 'badge-full' : 'badge-mini';
      card.innerHTML = `
        <div class="album-badge ${badgeClass}">${album.type}</div>
        <div class="album-cover" style="background: ${album.cover}">
          <div class="album-overlay">
             <div class="album-play-icon">
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
             </div>
          </div>
        </div>
        <div class="album-info-overlay">
          <div class="album-title">${album.title}</div>
          <div class="album-artist">${album.artist}</div>
        </div>
      `;
      
      card.addEventListener('click', async (e) => {
         const isPlayBtn = e.target.closest('.album-play-icon');
         
         if (this.currentAlbum === index) {
            // Clicked center album, toggle playback
            if (this.audioManager.isPlaying) {
              this.audioManager.stopTrack();
              this.setPlayingState(false);
            } else {
              await this.audioManager.init();
              this.audioManager.playTrack(this.currentTrack);
              this.setPlayingState(true);
            }
         } else {
            // Not centered yet, slide it to center
            this.selectAlbum(index);
            
            // If they explicitly clicked its play icon, auto-play it after sliding
            if (isPlayBtn) {
               await this.audioManager.init();
               setTimeout(() => {
                 this.audioManager.playTrack(0);
                 this.setPlayingState(true);
               }, 400); // Wait for coverflow transition
            }
         }
      });
      
      this.carouselContainer.appendChild(card);
    });
    
    this.updateCoverflowMath();
  }

  updateCoverflowMath() {
    const cards = Array.from(this.carouselContainer.querySelectorAll('.album-card'));
    
    cards.forEach((card, index) => {
      const offset = index - this.currentAlbum; // 0 is center, -1 is left, 1 is right
      
      if (offset === 0) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
      
      // Math for 3D Coverflow
      const maxOffset = 3;
      if (Math.abs(offset) > maxOffset) {
        card.style.display = 'none'; // Hide distant cards entirely
        return;
      } else {
        card.style.display = 'block';
      }

      const zIndex = 100 - Math.abs(offset);
      const scale = offset === 0 ? 1 : Math.max(0.6, 1 - Math.abs(offset) * 0.15);
      
      // Space cards closer if they are further back
      const translateX = offset === 0 ? 0 : Math.sign(offset) * (180 + Math.abs(offset) * 20);
      
      // Rotate side cards 45 deg facing the center
      const rotateY = offset === 0 ? 0 : Math.sign(offset) * -50; 
      
      // Blur side cards like premium Sonaar effect
      const blur = offset === 0 ? 'none' : `blur(${Math.abs(offset) * 2}px)`;
      const opacity = offset === 0 ? 1 : Math.max(0.4, 1 - Math.abs(offset) * 0.25);
      
      card.style.transform = `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`;
      card.style.zIndex = zIndex;
      card.style.opacity = opacity;
      card.style.filter = blur;
    });
  }

  selectAlbum(index) {
    if (this.currentAlbum === index) return; // Prevent double-trigger
    
    this.currentAlbum = index;
    this.currentTrack = 0; // Reset to first track
    
    if (this.audioManager.isPlaying) {
      this.audioManager.stopTrack();
      this.setPlayingState(false);
    }
    
    this.updateCoverflowMath();
    this.renderPlaylist();
    this.updatePlayerAlbumInfo();
    this.updateTrackDetails();
  }

  renderPlaylist() {
    this.playlistContainer.innerHTML = '';
    const album = ALBUM_DATA[this.currentAlbum];
    
    album.tracks.forEach((track, index) => {
      const isActive = index === this.currentTrack ? 'track-active' : '';
      const numFormatted = (index + 1).toString().padStart(2, '0');
      
      const li = document.createElement('li');
      li.className = `playlist-row ${isActive}`;
      li.setAttribute('data-track', index);
      
      li.innerHTML = `
        <div class="col-play">
          <button class="row-play-btn">
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        <div class="col-num">${numFormatted}</div>
        <div class="col-info">
          <span class="title">${track.title}</span>
          <span class="artist">${album.artist}</span>
        </div>
        <div class="col-time">${track.time}</div>
        <div class="col-actions">
          <button class="action-btn outline-btn buy-set-btn">Buy Full $${album.price.toFixed(2)}</button>
        </div>
      `;
      
      li.addEventListener('click', async (e) => {
         if (e.target.closest('.buy-set-btn')) {
            this.openCart(album.title, album.price, album.checkoutUrl);
            return;
         }
         if (e.target.closest('.action-btn') && !e.target.closest('.row-play-btn')) return;
         this.selectTrack(index);
      });
      
      this.playlistContainer.appendChild(li);
    });
  }

  openCart(itemName, price, checkoutUrl = '') {
    const overlay = document.getElementById('checkout-cart-overlay');
    const panel = document.getElementById('checkout-cart-panel');
    const container = document.getElementById('cart-items-container');
    const total = document.getElementById('cart-total-price');
    const shopifyCheckoutBtn = document.getElementById('shopify-checkout-btn');
    
    container.innerHTML = `
      <div class="cart-item-row">
        <span>${itemName} HQ Download</span>
        <span>$${price.toFixed(2)}</span>
      </div>
    `;
    total.innerText = `$${price.toFixed(2)}`;

    if (shopifyCheckoutBtn) {
        shopifyCheckoutBtn.setAttribute('href', checkoutUrl || 'https://your-store.myshopify.com/cart');
    }
    
    overlay.classList.add('active');
    panel.classList.add('active');
  }

  async selectTrack(index) {
    if (this.currentTrack !== index) {
      this.currentTrack = index;
      this.updatePlaylistUI();
      this.updateTrackDetails();
      
      await this.audioManager.init();
      this.characterController.triggerTransition();
      
      if (this.audioManager.isPlaying) {
        setTimeout(() => {
          this.audioManager.playTrack(this.currentTrack);
        }, 300);
      } else {
         this.audioManager.playTrack(this.currentTrack);
         this.setPlayingState(true);
      }
    } else {
      if (this.audioManager.isPlaying) {
        this.audioManager.stopTrack();
        this.setPlayingState(false);
      } else {
        this.audioManager.playTrack(this.currentTrack);
        this.setPlayingState(true);
      }
    }
  }

  updatePlayerAlbumInfo() {
    const album = ALBUM_DATA[this.currentAlbum];
    if (this.playerAlbumName) this.playerAlbumName.innerText = album.title;
    if (this.playerAlbumArtist) this.playerAlbumArtist.innerText = album.artist;
  }

  updateTrackDetails() {
    const album = ALBUM_DATA[this.currentAlbum];
    const track = album.tracks[this.currentTrack];
    this.trackTitle.innerText = track.title;
    this.trackArtist.innerText = album.artist;
    
    // Sync to sticky player
    const stickyTitle = document.getElementById('sticky-track-title');
    if (stickyTitle) stickyTitle.innerText = track.title + " - " + album.title;
  }

  updatePlaylistUI() {
    const rows = this.playlistContainer.querySelectorAll('.playlist-row');
    rows.forEach((row, index) => {
      if (index === this.currentTrack) {
        row.classList.add('track-active');
      } else {
        row.classList.remove('track-active');
      }
    });
  }

  setPlayingState(isPlaying) {
    const stickyPlayIcon = document.querySelector('#sticky-play-btn .icon-play');
    const stickyPauseIcon = document.querySelector('#sticky-play-btn .icon-pause');
    const stickyPlayer = document.getElementById('sticky-player');
    
    if (isPlaying) {
       this.iconPlay.style.display = 'none';
       this.iconPause.style.display = 'block';
       if(stickyPlayIcon) stickyPlayIcon.style.display = 'none';
       if(stickyPauseIcon) stickyPauseIcon.style.display = 'block';
       if(stickyPlayer) stickyPlayer.classList.add('visible');
       this.characterController.setMixing(true);
    } else {
       this.iconPlay.style.display = 'block';
       this.iconPause.style.display = 'none';
       if(stickyPlayIcon) stickyPlayIcon.style.display = 'block';
       if(stickyPauseIcon) stickyPauseIcon.style.display = 'none';
       if(stickyPlayer) stickyPlayer.classList.remove('visible');
       this.characterController.setMixing(false);
    }
  }

  initEventListeners() {
    // Arrow Navigation
    if (this.prevArrow) {
      this.prevArrow.addEventListener('click', () => {
        let newIndex = this.currentAlbum - 1;
        if (newIndex < 0) newIndex = ALBUM_DATA.length - 1; // loop
        this.selectAlbum(newIndex);
      });
    }
    
    if (this.nextArrow) {
      this.nextArrow.addEventListener('click', () => {
        let newIndex = this.currentAlbum + 1;
        if (newIndex >= ALBUM_DATA.length) newIndex = 0; // loop
        this.selectAlbum(newIndex);
      });
    }

    this.playBtn.addEventListener('click', async () => {
      await this.audioManager.init();
      
      if (this.audioManager.isPlaying) {
        this.audioManager.stopTrack();
        this.setPlayingState(false);
      } else {
        this.audioManager.playTrack(this.currentTrack);
        this.setPlayingState(true);
      }
    });

    if (this.fxFilterBtn) {
      const activateFilter = () => {
        this.fxFilterBtn.classList.add('active-hold');
        this.audioManager.setFilterSweep(true);
      };
      const deactivateFilter = () => {
        this.fxFilterBtn.classList.remove('active-hold');
        this.audioManager.setFilterSweep(false);
      };
      this.fxFilterBtn.addEventListener('mousedown', activateFilter);
      this.fxFilterBtn.addEventListener('mouseup', deactivateFilter);
      this.fxFilterBtn.addEventListener('mouseleave', deactivateFilter);
      this.fxFilterBtn.addEventListener('touchstart', (e) => { 
        e.preventDefault(); 
        activateFilter(); 
      });
      this.fxFilterBtn.addEventListener('touchend', deactivateFilter);
    }
    
    const headerBtn = document.getElementById('header-listen-btn');
    if (headerBtn) {
      headerBtn.addEventListener('click', () => {
        document.querySelector('.hero-section').scrollIntoView({ behavior: 'smooth' });
        if (!this.audioManager.isPlaying) {
           this.playBtn.click();
        }
      });
    }

    // E-Commerce UI Listeners
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartOverlay = document.getElementById('checkout-cart-overlay');
    const cartPanel = document.getElementById('checkout-cart-panel');
    
    const closeCart = () => {
      cartOverlay.classList.remove('active');
      cartPanel.classList.remove('active');
    };
    
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    const bundleBtns = document.querySelectorAll('.add-bundle-btn');
    bundleBtns.forEach((btn, idx) => {
       btn.addEventListener('click', () => {
          this.openCart(idx === 0 ? "VIP Summer Pack" : "All-Access Lifetime", idx === 0 ? 19.99 : 99.00);
       });
    });

    // Theme Toggle Listeners
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');

    // Load initial theme
    if (localStorage.getItem('cinematic_dj_theme') === 'light') {
       document.body.classList.add('light-mode');
       if(themeIcon) themeIcon.textContent = '🌙';
    }

    if (themeToggleBtn && themeIcon) {
       themeToggleBtn.addEventListener('click', () => {
          document.body.classList.toggle('light-mode');
          const isLight = document.body.classList.contains('light-mode');
          themeIcon.textContent = isLight ? '🌙' : '🌞';
          localStorage.setItem('cinematic_dj_theme', isLight ? 'light' : 'dark');
       });
    }

    const teaserCloseBtn = document.getElementById('teaser-close-btn');
    if (teaserCloseBtn) {
      teaserCloseBtn.addEventListener('click', () => {
        document.getElementById('audio-teaser-modal').classList.remove('active');
      });
    }
    
    const teaserBuyBtn = document.getElementById('teaser-buy-btn');
    if (teaserBuyBtn) {
       teaserBuyBtn.addEventListener('click', () => {
          document.getElementById('audio-teaser-modal').classList.remove('active');
          const album = ALBUM_DATA[this.currentAlbum];
          this.openCart(album.title, album.price, album.checkoutUrl);
       });
    }

    // Google Auth Listeners
    const loginBtn = document.getElementById('user-profile-btn');
    const loginModal = document.getElementById('login-modal');
    const loginCloseBtn = document.getElementById('login-close-btn');

    // Sticky Player Logic
    const scrollWrapper = document.getElementById('scroll-wrapper');
    const stickyPlayer = document.getElementById('sticky-player');
    const stickyPlayBtn = document.getElementById('sticky-play-btn');
    const stickyBuyBtn = document.getElementById('sticky-buy-btn');
    
    if (stickyPlayBtn) {
       stickyPlayBtn.addEventListener('click', () => {
          const album = ALBUM_DATA[this.currentAlbum];
          this.audioManager.currentTrackConfig = album;
          if (this.audioManager.isPlaying) {
             this.audioManager.stopTrack();
             this.setPlayingState(false);
          } else {
             this.audioManager.playTrack();
             this.setPlayingState(true);
             this.updateTrackInfo();
          }
       });
    }

    if (stickyBuyBtn) {
       stickyBuyBtn.addEventListener('click', () => {
          const album = ALBUM_DATA[this.currentAlbum];
          this.openCart(album.title, album.price, album.checkoutUrl);
       });
    }

    // Progress Bar Scrubbing Logic
    const handleProgressClick = (e, barId) => {
       const bar = document.getElementById(barId);
       if (!bar || !this.audioManager.audioElement) return;
       const rect = bar.getBoundingClientRect();
       const clickX = e.clientX - rect.left;
       const percent = Math.max(0, Math.min(1, clickX / rect.width));
       const audioTimeLimit = 30; // 30s preview limit
       this.audioManager.audioElement.currentTime = percent * audioTimeLimit;
    };

    const mainProgressBar = document.getElementById('main-progress-bar');
    const stickyProgressBar = document.getElementById('sticky-progress-bar');
    if (mainProgressBar) mainProgressBar.addEventListener('click', (e) => handleProgressClick(e, 'main-progress-bar'));
    if (stickyProgressBar) stickyProgressBar.addEventListener('click', (e) => handleProgressClick(e, 'sticky-progress-bar'));

    // Admin Dashboard Logic
    const adminPortalLink = document.getElementById('admin-portal-link');
    const adminModal = document.getElementById('admin-dashboard-modal');
    const adminCloseBtn = document.getElementById('admin-close-btn');
    const adminSaveBtn = document.getElementById('admin-save-btn');
    const adminLinksContainer = document.getElementById('admin-links-container');
    
    // Load and Hydrate Links
    const savedLinksRaw = localStorage.getItem('cinematic_dj_mix_links');
    if (savedLinksRaw) {
       try {
          const savedLinksMap = JSON.parse(savedLinksRaw);
          ALBUM_DATA.forEach(album => {
             if(savedLinksMap[album.id]) {
                 album.checkoutUrl = savedLinksMap[album.id];
             }
          });
       } catch(e) {}
    }

    if (adminPortalLink && adminLinksContainer) {
        adminPortalLink.addEventListener('click', () => {
             adminLinksContainer.innerHTML = '';
             ALBUM_DATA.forEach(album => {
                adminLinksContainer.innerHTML += `
                  <div style="margin-bottom: 20px;">
                     <label style="display: block; font-size: 0.85rem; color: #00e5ff; font-weight: bold; margin-bottom: 8px;">${album.title} <span style="color:#aaa;font-weight:normal;">(${album.type})</span></label>
                     <input type="text" class="admin-mix-link-input" data-id="${album.id}" value="${album.checkoutUrl || ''}" placeholder="https://your-store.myshopify.com/cart..." style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 6px;">
                  </div>
                `;
             });
             adminModal.classList.add('active');
        });
    }

    if (adminCloseBtn) {
        adminCloseBtn.addEventListener('click', () => {
             adminModal.classList.remove('active');
        });
    }

    if (adminSaveBtn) {
        adminSaveBtn.addEventListener('click', () => {
             const newLinks = {};
             document.querySelectorAll('.admin-mix-link-input').forEach(input => {
                const val = input.value.trim();
                const albumId = input.dataset.id;
                if(val) newLinks[albumId] = val;
                
                // Update live data array immediately
                const album = ALBUM_DATA.find(a => a.id === albumId);
                if(album) album.checkoutUrl = val;
             });
             
             localStorage.setItem('cinematic_dj_mix_links', JSON.stringify(newLinks));
             adminModal.classList.remove('active');
             alert("All specific Mix Links have been successfully wired!");
        });
    }

    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
         loginModal.classList.add('active');
      });
    }

    if (loginCloseBtn) {
      loginCloseBtn.addEventListener('click', () => {
         loginModal.classList.remove('active');
      });
    }

    // Bind Google callback to window
    window.handleCredentialResponse = (response) => {
       try {
         // Decode JWT token payload
         const base64Url = response.credential.split('.')[1];
         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
         const payload = JSON.parse(window.atob(base64));
         
         if (loginModal) loginModal.classList.remove('active');
         
         // Swap out "Sign In" button with dynamic Google profile image & name
         if (loginBtn) {
             loginBtn.innerHTML = `<img src="${payload.picture}" style="width: 24px; height: 24px; border-radius: 50%; vertical-align: middle; margin-right: 8px;"> ${payload.given_name || payload.name}`;
             loginBtn.style.background = 'transparent';
             loginBtn.style.border = '1px solid var(--secondary-neon)';
             loginBtn.style.color = '#fff';
         }
         console.log("Logged in user:", payload);
       } catch (err) {
         console.error("Failed to parse Google JWT", err);
       }
    };

    this.initLogoRotator();
  }

  initLogoRotator() {
    const rotator = document.getElementById('rotating-logo');
    if (!rotator) return;
    
    const images = Array.from(rotator.querySelectorAll('.site-logo-img'));
    if (images.length <= 1) return;
    
    let currentIdx = 0;
    let interval;

    const nextLogo = () => {
      const prevImg = images[currentIdx];
      prevImg.classList.remove('rot-active');
      prevImg.classList.add('rot-exit');
      
      currentIdx = (currentIdx + 1) % images.length;
      const nextImg = images[currentIdx];
      
      nextImg.classList.remove('rot-exit');
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          nextImg.classList.add('rot-active');
        });
      });
    };

    const startRotator = () => {
      interval = setInterval(nextLogo, 450); // Hyper-Fast cycle
    };

    const stopRotator = () => {
      clearInterval(interval);
    };

    rotator.addEventListener('mouseenter', stopRotator);
    rotator.addEventListener('mouseleave', startRotator);
    
    startRotator();
  }

  drawVisualizer() {
    requestAnimationFrame(this.drawVisualizer.bind(this));
    if (!this.ctx || !this.audioManager.analyser) return;

    const parentContainer = this.canvas.parentElement;
    if (parentContainer && this.canvas.width !== parentContainer.clientWidth) {
      this.canvas.width = parentContainer.clientWidth;
      this.canvas.height = parentContainer.clientHeight;
    }

    const width = this.canvas.width;
    const height = this.canvas.height;
    
    this.ctx.clearRect(0, 0, width, height);

    if (this.audioManager.isPlaying) {
      try {
        this.audioManager.analyser.getByteFrequencyData(this.audioManager.dataArray);
        
        const bufferLength = Math.floor(this.audioManager.analyser.frequencyBinCount * 0.7);
        const barWidth = (width / bufferLength) * 2;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (this.audioManager.dataArray[i] / 255) * height;
          const gradient = this.ctx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, '#ff1a1a'); // Assassin Red
          gradient.addColorStop(1, '#00e5ff'); // Cyber Blue

          this.ctx.fillStyle = gradient;
          this.ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }

        const audioTimeLimit = 30;
        let currTime = 0;

        // Teaser fade-out cutoff logic
        if (this.audioManager.audioElement) {
          currTime = this.audioManager.audioElement.currentTime;
          
          // Update progress bars
          const progressPercent = Math.min((currTime / audioTimeLimit) * 100, 100);
          const mainFill = document.getElementById('main-progress-fill');
          const stickyFill = document.getElementById('sticky-progress-fill');
          if (mainFill) mainFill.style.width = `${progressPercent}%`;
          if (stickyFill) stickyFill.style.width = `${progressPercent}%`;
          
          const timeLabel = document.getElementById('sticky-track-time');
          if (timeLabel) timeLabel.innerText = `${Math.floor(currTime)}:00 / 0:30 Preview`;

          if (currTime > audioTimeLimit) {
            // Just for demo purposes we stop after 30 seconds of play!
            this.audioManager.stopTrack();
            this.setPlayingState(false);
            const modal = document.getElementById('audio-teaser-modal');
            const priceTag = document.getElementById('teaser-price-tag');
            if (modal && priceTag) {
               const album = ALBUM_DATA[this.currentAlbum];
               priceTag.innerText = `$${album.price.toFixed(2)}`;
               modal.classList.add('active');
            }
          }
        }
      } catch (e) {
        // Silent catch for unexpected DOM shifts during animation
      }
    }
  }
}
