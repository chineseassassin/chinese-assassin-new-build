import { audioManager } from './audio.js';

/**
 * ============================================================================
 * CHINESE ASSASSIN — PORTAL HOME PAGE & MEDIA HUB CONTROLLER
 * ============================================================================
 * Handles interactions for THEPORTALHOMEPAGE:
 * - Smooth scroll between Portal Hero and Media Hub Dashboard
 * - Sidebar navigation tabs switching
 * - Live Radio player card audio playback
 * - Latest Mixes & Recently Played instant track launcher
 * - Show Reminder notification alerts
 * - Simulated real-time live chat stream & song request prompt
 */
export class PortalHomeController {
  constructor() {
    this.container = document.getElementById('portal-home-page');
    if (!this.container) return;

    this.initPortalCircleVideo();
    this.initScrollTriggers();
    this.initBackToTop();
    this.initSidebarNav();
    this.initLiveRadioCard();
    this.initMixLaunchers();
    this.initReminders();
    this.initLiveChat();
    this.initTuneInShow();
  }

  // Portal Circle Video — invisible anchor over artwork PLAY btn triggers video
  initPortalCircleVideo() {
    const hero      = document.getElementById('portal-hero');
    const anchor    = document.getElementById('ph-play-anchor');
    const video     = document.getElementById('ph-portal-video');
    const closeBtn  = document.getElementById('ph-portal-close-btn');
    const soundBtn  = document.getElementById('ph-portal-sound-btn');
    const soundIcon = soundBtn ? soundBtn.querySelector('.ph-portal-sound-icon') : null;

    if (!video || !hero) return;

    const showVideo = async () => {
      video.muted = true;           // always start muted (browser policy)
      try { await video.play(); } catch (e) {}
      hero.classList.add('portal-video-active');
      this.showToast('🌀 PORTAL STREAMING — TAP 🔇 FOR SOUND');
    };

    const hideVideo = () => {
      video.pause();
      video.currentTime = 0;
      hero.classList.remove('portal-video-active');
      // Reset sound icon
      video.muted = true;
      if (soundIcon) soundIcon.textContent = '🔇';
      this.showToast('⏹ PORTAL CLOSED');
    };

    // Invisible anchor over the printed PLAY button in the artwork
    if (anchor) {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        if (hero.classList.contains('portal-video-active')) {
          hideVideo();
        } else {
          showVideo();
        }
      });
    }

    // ✕ Close button stops video and returns to artwork
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideVideo();
      });
    }

    // Clicking the circle video itself also toggles/stops video
    const circleInner = document.getElementById('ph-portal-circle-inner');
    if (circleInner) {
      circleInner.addEventListener('click', (e) => {
        if (e.target.closest('#ph-portal-sound-btn') || e.target.closest('#ph-portal-close-btn')) return;
        hideVideo();
      });
    }

    // 🔇 / 🔊 Sound toggle
    if (soundBtn) {
      soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        if (!video.muted) {
          video.volume = 0.75;
          if (soundIcon) soundIcon.textContent = '🔊';
          this.showToast('🔊 PORTAL AUDIO ON');
        } else {
          if (soundIcon) soundIcon.textContent = '🔇';
          this.showToast('🔇 PORTAL AUDIO MUTED');
        }
      });
    }
  }


  // 1. Smooth Scroll from Hero to Dashboard
  initScrollTriggers() {
    const beginBtn = document.getElementById('ph-begin-journey-btn');
    const scrollTrigger = document.getElementById('ph-scroll-trigger');
    const dashboard = document.getElementById('portal-dashboard');

    const scrollToDashboard = (e) => {
      if (e) e.preventDefault();
      if (dashboard) {
        dashboard.scrollIntoView({ behavior: 'smooth' });
      }
    };

    if (beginBtn) beginBtn.addEventListener('click', scrollToDashboard);
    if (scrollTrigger) scrollTrigger.addEventListener('click', scrollToDashboard);
  }

  // 1.1 Floating Back to Top Button
  initBackToTop() {
    const bttBtn = document.getElementById('hub-back-to-top-btn');
    if (!bttBtn) return;

    // Smooth scroll back to top on click
    bttBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
      const portalHero = document.getElementById('portal-hero');
      if (portalHero) portalHero.scrollIntoView({ behavior: 'smooth' });
      this.showToast('⬆️ RETURNED TO TOP');
    });
  }

  // 2. Sidebar Navigation Tabs
  initSidebarNav() {
    const navButtons = this.container.querySelectorAll('.hub-nav-item');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.dataset.tab;
        if (tab === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        this.showToast(`📂 OPENED: ${btn.textContent.trim()}`);
      });
    });
  }

  // 3. Live Radio Card Player
  initLiveRadioCard() {
    const playBtn = document.getElementById('hub-radio-play');
    const prevBtn = document.getElementById('hub-radio-prev');
    const nextBtn = document.getElementById('hub-radio-next');
    let isPlaying = false;

    if (playBtn) {
      playBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await audioManager.init();
        isPlaying = !isPlaying;

        if (isPlaying) {
          audioManager.playTrack(0);
          playBtn.textContent = '⏸';
          this.showToast('📻 LIVE RADIO: DRAGON\'S CALL STREAMING');
        } else {
          if (audioManager.audioElement) audioManager.audioElement.pause();
          playBtn.textContent = '▶';
          this.showToast('⏸ LIVE RADIO PAUSED');
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.showToast('📻 TUNING TO PREVIOUS STATION...');
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.showToast('📻 TUNING TO NEXT STATION...');
      });
    }
  }

  // 4. Latest Mixes & Recently Played Audio Launcher
  initMixLaunchers() {
    const mixItems = this.container.querySelectorAll('.hub-mix-item');
    mixItems.forEach(item => {
      item.addEventListener('click', async (e) => {
        e.preventDefault();
        await audioManager.init();
        const trackTitle = item.dataset.track || 'Chinese Assassin Mix';
        audioManager.playTrack(1);
        this.showToast(`▶ PLAYING MIX: ${trackTitle.toUpperCase()}`);
      });
    });

    const recentRows = this.container.querySelectorAll('.hub-recent-row');
    recentRows.forEach(row => {
      row.addEventListener('click', async (e) => {
        e.preventDefault();
        await audioManager.init();
        const track = row.dataset.track || 'Track';
        audioManager.playTrack(2);
        this.showToast(`▶ PLAYING: ${track.toUpperCase()}`);
      });
    });
  }

  // 5. Set Reminder Buttons for Upcoming Shows
  initReminders() {
    const remindButtons = this.container.querySelectorAll('.hub-remind-btn');
    remindButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const show = btn.dataset.show || 'Upcoming Show';
        btn.textContent = '✓ REMINDED';
        btn.style.background = '#33ff66';
        btn.style.color = '#000';
        this.showToast(`🔔 REMINDER SET: ${show.toUpperCase()}`);
      });
    });
  }

  // 6. Tune in to Featured Show
  initTuneInShow() {
    const tuneInBtn = document.getElementById('hub-tune-in-show');
    if (tuneInBtn) {
      tuneInBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await audioManager.init();
        audioManager.playTrack(0);
        this.showToast('🔴 TUNED IN TO: THE ASSASSIN HOUR (LIVE)');
      });
    }
  }

  // 7. Live Chat Simulation & Song Request
  initLiveChat() {
    const chatForm = document.getElementById('hub-chat-form');
    const chatInput = document.getElementById('hub-chat-input');
    const chatMessages = document.getElementById('hub-chat-messages');
    const requestSongBtn = document.getElementById('hub-request-song-btn');

    if (chatForm && chatInput && chatMessages) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        const newMsg = document.createElement('div');
        newMsg.className = 'hub-chat-msg user-own';
        newMsg.innerHTML = `
          <img src="/assassin_scanner.jpg" class="hub-chat-avatar" alt="" onerror="this.onerror=null; this.src='/WICKED3.png';" />
          <div class="hub-chat-bubble">
            <div class="hub-chat-user-row">
              <span class="hub-chat-name" style="color:#ffbb00;">CA_Nation (You)</span>
              <span class="hub-chat-time">just now</span>
            </div>
            <p>${text}</p>
          </div>
        `;
        chatMessages.appendChild(newMsg);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
    }

    if (requestSongBtn) {
      requestSongBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const song = prompt('Enter the track or mix you would like to request:');
        if (song && song.trim()) {
          this.showToast(`🎵 SONG REQUEST SUBMITTED: "${song.trim()}"`);
          if (chatMessages) {
            const reqMsg = document.createElement('div');
            reqMsg.className = 'hub-chat-msg';
            reqMsg.innerHTML = `
              <img src="/assassin_scanner.jpg" class="hub-chat-avatar" alt="" onerror="this.onerror=null; this.src='/WICKED3.png';" />
              <div class="hub-chat-bubble" style="border-color:rgba(255,215,0,0.5);">
                <div class="hub-chat-user-row">
                  <span class="hub-chat-name" style="color:#ffd700;">🎵 Song Request</span>
                  <span class="hub-chat-time">just now</span>
                </div>
                <p>CA_Nation requested: <strong>${song.trim()}</strong></p>
              </div>
            `;
            chatMessages.appendChild(reqMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        }
      });
    }

    // Gentle incoming ambient chat loop
    const simulatedMessages = [
      { name: 'KillaTone_Official', text: 'Lock in for the next hour! Heavy dubs incoming 🔥' },
      { name: 'ReggaeQueen99', text: 'This playlist is legendary 👑' },
      { name: 'SoundClash_Fan', text: 'Selector pull up dat one!! 🔊' }
    ];
    let msgIdx = 0;

    setInterval(() => {
      if (!chatMessages) return;
      const data = simulatedMessages[msgIdx % simulatedMessages.length];
      msgIdx++;

      const ambientMsg = document.createElement('div');
      ambientMsg.className = 'hub-chat-msg';
      ambientMsg.innerHTML = `
        <img src="/PNG-NEW/B.png" class="hub-chat-avatar" alt="" />
        <div class="hub-chat-bubble">
          <div class="hub-chat-user-row">
            <span class="hub-chat-name">${data.name}</span>
            <span class="hub-chat-time">just now</span>
          </div>
          <p>${data.text}</p>
        </div>
      `;
      chatMessages.appendChild(ambientMsg);
      if (chatMessages.children.length > 25) {
        chatMessages.removeChild(chatMessages.children[0]);
      }
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 28000);

    this.initGlobalNavigation();
  }

  initGlobalNavigation() {
    const homeLink = document.getElementById('home-link');
    const mobileHomeLink = document.getElementById('mobile-home-link');
    const logoWrapper = document.querySelector('.logo-wrapper');

    const handleHomeClick = (e) => {
      if (e) e.preventDefault();
      this.showHomePage();
    };

    homeLink?.addEventListener('click', handleHomeClick);
    mobileHomeLink?.addEventListener('click', handleHomeClick);
    logoWrapper?.addEventListener('click', handleHomeClick);

    // When entering the portal, hide home page so the floating icon page shows
    window.addEventListener('portalEntered', () => {
      this.hideHomePage();
    });
  }

  showHomePage() {
    if (!this.container) return;
    this.container.classList.add('active');
    this.container.style.display = 'block';
    document.body.classList.add('portal-home-active');

    // Hide old floating top menu header (.site-header)
    const siteHeaders = document.querySelectorAll('.site-header, #mobile-nav-drawer');
    siteHeaders.forEach(el => el.style.display = 'none');

    // Hide intro & temple doors
    const intro = document.getElementById('cinematic-intro');
    if (intro) intro.style.display = 'none';
    const doors = document.getElementById('cinematic-temple-doors');
    if (doors) doors.style.display = 'none';

    // Hide dimension hub floating cards while viewing home page
    const dimHub = document.getElementById('dimension-hub');
    if (dimHub) dimHub.classList.remove('active');

    // Hide old Dragon deck so only the single persistent bottom master player is visible
    const dragonDeck = document.getElementById('caDragonDeck');
    if (dragonDeck) {
      dragonDeck.style.display = 'none';
      dragonDeck.style.opacity = '0';
      dragonDeck.style.pointerEvents = 'none';
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  hideHomePage() {
    if (!this.container) return;
    this.container.classList.remove('active');
    this.container.style.display = 'none';
    document.body.classList.remove('portal-home-active');

    // Restore site header
    const siteHeaders = document.querySelectorAll('.site-header');
    siteHeaders.forEach(el => el.style.display = '');

    // Restore dragon deck when leaving home page
    const dragonDeck = document.getElementById('caDragonDeck');
    if (dragonDeck && document.body.classList.contains('portal-active')) {
      dragonDeck.style.display = 'block';
      dragonDeck.style.opacity = '1';
      dragonDeck.style.pointerEvents = 'auto';
    }
  }

  showToast(msg) {
    const toast = document.getElementById('cadpToast') || document.getElementById('caDjToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2400);
  }
}

// Auto instantiate
export const portalHome = new PortalHomeController();

