import * as THREE from 'three';
import gsap from 'gsap';
import { audioManager } from './audio.js';
import { SceneEnvironment } from './sceneEnvironment.js';
import { CharacterController } from './characterController.js';
import { DimensionHub } from './dimensionHub.js';
import { CinematicIntro } from './intro.js';
import { NetflixPlayer } from './netflixPlayer.js';
import { USBBuilderUI } from './usbBuilder.js';
import { adminAlbumManager } from './adminAlbumManager.js';
import { checkoutEngine } from './checkoutEngine.js';
import { customerAccount } from './customerAccount.js';

class App {
  constructor() {
    this.canvas = document.querySelector('#webgl-canvas');
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // ── Page 1: Show #cinematic-intro with the mechanical slide-open card player ──
    const introEl = document.getElementById('cinematic-intro');
    if (introEl)  { 
      introEl.style.display = 'flex'; 
      introEl.style.opacity = '1';
    }

    this.initScene();
    this.initModules();
    this.initEvents();
    this.initEnterUniverseBtn();
    
    this.clock = new THREE.Clock();
    
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.animate();
  }

  initEnterUniverseBtn() {
    const btn = document.getElementById('nf-enter-universe-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      // Slide glass card out, then show the temple doors intro
      const stageEl = document.getElementById('stage');
      const introEl = document.getElementById('cinematic-intro');
      const appEl   = document.getElementById('app');

      if (stageEl) {
        gsap.to(stageEl, {
          opacity: 0,
          y: -40,
          duration: 0.55,
          ease: 'power2.inOut',
          onComplete: () => {
            stageEl.style.display = 'none';
            if (introEl) { introEl.style.display = ''; }
            if (appEl)   { appEl.style.display   = ''; }
            // Start the cinematic intro sequence
            if (this.intro) this.intro.start();
          }
        });
      } else {
        if (introEl) { introEl.style.display = ''; }
        if (appEl)   { appEl.style.display   = ''; }
        if (this.intro) this.intro.start();
      }
    });
  }


  initScene() {
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 3, 8);
    this.cameraPivot = new THREE.Group();
    this.cameraPivot.add(this.camera);
    this.scene.add(this.cameraPivot);
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  initModules() {
    this.env = new SceneEnvironment(this.scene);
    this.character = new CharacterController(this.scene);
    this.hub = new DimensionHub();

    // Instantiate the card player
    if (document.getElementById('stage')) {
      this.netflixPlayer = new NetflixPlayer(null);
      window.netflixPlayer = this.netflixPlayer;
    }

    this.intro = new CinematicIntro();
  }

  initEvents() {
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('mousedown', this.onMouseDown.bind(this));
    window.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    
    this.scrollDepth = 0;
    this.targetScrollDepth = 0;
    this.targetHoverZoom = 0;
    this.currentHoverZoom = 0;

    // ── GLOBAL HOVER SOUND FOR FLOATING ICONS & CARDS ────────────────
    document.addEventListener('mouseover', (e) => {
      const floatingTarget = e.target.closest(
        '.realm-portal, .glass-card, .icon-btn, .logo-rotator, .site-logo-img, ' +
        '.gc-play-btn, .mega-preview-btn, .mix-thumb, .sign-in-btn, .mobile-nav-item, ' +
        '.cassette-option, .capacity-card, .genre-pill, .pwd-toggle, .auth-close-btn, ' +
        '.google-btn, .auth-tab, [data-orbit-index], .floating-icon, .door-enter-btn, ' +
        '.skip-intro-btn, .hud-corner, .faceid-lock-icon'
      );
      if (floatingTarget && !floatingTarget._hasHoverAudioTracked) {
        floatingTarget._hasHoverAudioTracked = true;
        audioManager.playHoverSound();
        floatingTarget.addEventListener('mouseleave', () => {
          floatingTarget._hasHoverAudioTracked = false;
        }, { once: true });
      }
    });

    // Portal entered → go straight to home (scanner moved to sign-in flow)
    window.addEventListener('portalEntered', () => {
      audioManager.stopTrack();
      this.playBootUpSequence();
    });

    // ── SIGN-IN BUTTON → Open Auth Modal Immediately ───────────────────
    const signInBtn = document.getElementById('sign-in-btn');
    const signInModal = document.getElementById('sign-in-modal');
    const scannerPhase = document.getElementById('signin-scanner-phase');
    const authPhase = document.getElementById('signin-auth-phase');
    const progressFill = document.getElementById('signin-progress-fill');
    const statusText = document.getElementById('scanner-status-text');
    const closeBtn = document.getElementById('auth-close-btn');

    if (signInBtn && signInModal) {
      signInBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Show modal + Auth Form immediately
        signInModal.classList.add('open');
        signInModal.style.opacity = '1';
        scannerPhase.style.display = 'none';
        authPhase.style.display = 'flex';
        authPhase.style.opacity = '1';

        const card = authPhase.querySelector('.auth-modal-card');
        if (card && window.gsap) {
          gsap.fromTo(card, 
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
          );
        }
      });
    }

    // ── FLASH DRIVE MIXES BUILDER TRIGGER ──────────────────────────────
    document.addEventListener('click', (e) => {
      const flashDriveTarget = e.target.closest('[href="/flashdrive"], [href="#usb-builder"], .flash-drive-trigger, [data-orbit-index="8"]');
      if (flashDriveTarget) {
        e.preventDefault();
        e.stopPropagation();
        if (window.usbBuilder) {
          window.usbBuilder.show();
        }
      }

      const adminTarget = e.target.closest('[href="#admin"], .admin-manager-trigger, #admin-nav-link, #usb-admin-modal-btn');
      if (adminTarget) {
        e.preventDefault();
        e.stopPropagation();
        if (window.adminAlbumManager) {
          window.adminAlbumManager.show();
        }
      }

      const accountTarget = e.target.closest('[href="#account"], .customer-account-trigger, #account-nav-link');
      if (accountTarget) {
        e.preventDefault();
        e.stopPropagation();
        if (window.customerAccount) {
          window.customerAccount.show();
        }
      }
    });

    // ── MOBILE NAVIGATION DRAWER TOGGLE ──────────────────────────────
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    const menuToggleBtn = document.querySelector('.menu-toggle-btn');
    const mobileDrawerClose = document.getElementById('mobile-drawer-close');

    if (menuToggleBtn && mobileDrawer) {
      menuToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        mobileDrawer.classList.toggle('open');
      });
    }

    if (mobileDrawerClose && mobileDrawer) {
      mobileDrawerClose.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    }

    if (mobileDrawer) {
      mobileDrawer.addEventListener('click', (e) => {
        if (e.target === mobileDrawer || e.target.closest('.mobile-nav-item, .sign-in-btn')) {
          mobileDrawer.classList.remove('open');
        }
      });
    }



    // Function to trigger scanner AFTER successful login / register / Google auth
    window.triggerBiometricScanSequence = function(userName = 'CHINESE ASSASSIN') {
      if (!signInModal || !scannerPhase || !authPhase) return;

      // Ensure modal is open
      signInModal.classList.add('open');
      signInModal.style.opacity = '1';

      // Fade out auth phase
      if (window.gsap) {
        gsap.to(authPhase, {
          opacity: 0, duration: 0.3, ease: 'power2.in',
          onComplete: () => {
            authPhase.style.display = 'none';
            authPhase.style.opacity = '';
            
            // Show scanner phase
            scannerPhase.style.display = '';
            scannerPhase.style.opacity = '1';

            // Audio beep sound
            if (window.audioManager) window.audioManager.playHoverSound();

            // Reset + re-trigger progress animation
            if (progressFill) {
              progressFill.style.animation = 'none';
              progressFill.offsetHeight; // reflow
              progressFill.style.animation = 'progressLoad 3.4s ease-in-out forwards';
            }

            // Update user status ticker
            const steps = [
              `AUTHENTICATING ${userName.toUpperCase()}...`,
              'VERIFYING RETINAL DNA MATCH...',
              'ENCRYPTING VIP SESSION...',
              'ACCESS GRANTED • WELCOME ASSASSIN'
            ];
            steps.forEach((msg, i) => {
              setTimeout(() => { if (statusText) statusText.textContent = msg; }, i * 800);
            });

            // After scan completes → close modal smoothly
            setTimeout(() => {
              gsap.to(signInModal, {
                opacity: 0, duration: 0.6, ease: 'power2.in',
                onComplete: () => {
                  signInModal.classList.remove('open');
                  signInModal.style.opacity = '';
                  scannerPhase.style.display = 'none';
                  
                  // Highlight SIGN IN button as Logged In
                  if (signInBtn) {
                    signInBtn.innerHTML = `👤 ${userName.toUpperCase()}`;
                    signInBtn.style.color = '#ff203a';
                    signInBtn.style.borderColor = '#ff203a';
                  }
                }
              });
            }, 3600);
          }
        });
      }
    };

    // Close button
    if (closeBtn && signInModal) {
      closeBtn.addEventListener('click', () => {
        if (window.gsap) {
          gsap.to(signInModal, {
            opacity: 0, duration: 0.3, ease: 'power2.in',
            onComplete: () => {
              signInModal.classList.remove('open');
              signInModal.style.opacity = '';
            }
          });
        } else {
          signInModal.classList.remove('open');
        }
      });
      // Click backdrop to close (only when auth phase is visible)
      signInModal.addEventListener('click', (e) => {
        if (e.target === signInModal && authPhase.style.display !== 'none') {
          closeBtn.click();
        }
      });
    }



    // Portal Click Warp Interaction
    const portals = document.querySelectorAll('.realm-portal');
    portals.forEach(portal => {
      portal.addEventListener('click', (e) => {
        e.preventDefault();
        const url = portal.getAttribute('href');
        
        // Trigger Warp Effect
        document.getElementById('app').classList.add('warp-active');
        audioManager.playScratch(); // Portal warp sound!

        // Zoom camera into portal
        gsap.to(this.camera.position, { z: 0, duration: 0.5, ease: 'power2.in' });

        setTimeout(() => {
          window.location.href = url;
          document.getElementById('app').classList.remove('warp-active');
          // Reset camera
          gsap.to(this.camera.position, { z: 4, duration: 1 });
        }, 600);
      });
    });

    // Home Screen Master Controls
    const homePlayBtn = document.getElementById('home-play-btn');
    const homeFxBtn = document.getElementById('home-fx-btn');

    if (homePlayBtn) {
      homePlayBtn.addEventListener('click', async () => {
        await audioManager.init();
        if (audioManager.isPlaying) {
          audioManager.stopTrack();
          this.setHomePlayingState(false);
        } else {
          audioManager.playTrack(0);
          this.setHomePlayingState(true);
        }
      });
    }

    // Google Login Callback (Global)
    window.handleCredentialResponse = (response) => {
      try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        // Find the sign-in button if it exists and replace it with user info or just success
        console.log("Logged in user:", payload);
        alert(`Welcome, ${payload.name}! You are now entered into the VIP Chamber.`);
      } catch (err) {
        console.error("Failed to parse Google JWT", err);
      }
    };

    if (homeFxBtn) {
       const activateFilter = () => {
         homeFxBtn.classList.add('active-hold');
         audioManager.setFilterSweep(true);
       };
       const deactivateFilter = () => {
         homeFxBtn.classList.remove('active-hold');
         audioManager.setFilterSweep(false);
       };
       homeFxBtn.addEventListener('mousedown', activateFilter);
       homeFxBtn.addEventListener('mouseup', deactivateFilter);
       homeFxBtn.addEventListener('mouseleave', deactivateFilter);
       homeFxBtn.addEventListener('touchstart', (e) => { e.preventDefault(); activateFilter(); });
       homeFxBtn.addEventListener('touchend', deactivateFilter);
    }

    // Header Logic
    this.initHeader();
  }

  initHeader() {
    // Logo Rotator
    const rotator = document.getElementById('rotating-logo');
    if (rotator) {
      const images = Array.from(rotator.querySelectorAll('.site-logo-img'));
      if (images.length > 1) {
        let currentIdx = 0;
        setInterval(() => {
          const prevImg = images[currentIdx];
          if (prevImg) {
            prevImg.classList.remove('rot-active');
            prevImg.classList.add('rot-exit');
          }
          currentIdx = (currentIdx + 1) % images.length;
          const nextImg = images[currentIdx];
          if (nextImg) {
            nextImg.classList.remove('rot-exit');
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                nextImg.classList.add('rot-active');
              });
            });
          }
        }, 450);
      }
    }

    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        if (themeIcon) themeIcon.textContent = isLight ? '🌙' : '🌞';
        localStorage.setItem('cinematic_dj_theme', isLight ? 'light' : 'dark');
      });
      // Initial check
      if (localStorage.getItem('cinematic_dj_theme') === 'light') {
        document.body.classList.add('light-mode');
        if (themeIcon) themeIcon.textContent = '🌙';
      }
    }

    // Mega Menu Audio Preview (30 sec)
    const previewBtn = document.getElementById('mega-preview-play');
    if (previewBtn) {
      previewBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        await audioManager.init();
        
        if (this.isPreviewPlaying) {
          audioManager.stopTrack();
          this.isPreviewPlaying = false;
          previewBtn.innerHTML = '<svg viewBox="0 0 24 24" width="30" height="30"><path fill="#fff" d="M8 5v14l11-7z"/></svg>';
          this.setHomePlayingState(false);
          return;
        }

        // Change icon to pause
        previewBtn.innerHTML = '<svg viewBox="0 0 24 24" width="30" height="30"><path fill="#fff" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        this.isPreviewPlaying = true;

        audioManager.playTrack(1); // Play demo2 or similar
        this.setHomePlayingState(true);

        // Auto-stop after 30 seconds
        setTimeout(() => {
          if (this.isPreviewPlaying) {
            audioManager.stopTrack();
            this.isPreviewPlaying = false;
            previewBtn.innerHTML = '<svg viewBox="0 0 24 24" width="30" height="30"><path fill="#fff" d="M8 5v14l11-7z"/></svg>';
            this.setHomePlayingState(false);
          }
        }, 30000);
      });
    }

    // Interactive Background for Light Mode
    const appEl = document.getElementById('app');
    if (appEl) {
      window.addEventListener('mousemove', (e) => {
        if (document.body.classList.contains('light-mode')) {
          const x = (e.clientX / window.innerWidth - 0.5) * 30; // max 30px shift
          const y = (e.clientY / window.innerHeight - 0.5) * 30;
          appEl.style.backgroundPosition = `calc(50% + ${x}px) calc(50% + ${y}px)`;
        } else {
          appEl.style.backgroundPosition = 'center center';
        }
      });
    }
  }

  setHomePlayingState(isPlaying) {
    const playIcon = document.querySelector('#home-play-btn .icon-play');
    const pauseIcon = document.querySelector('#home-play-btn .icon-pause');
    if (isPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      this.character.setMixing(true);
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      this.character.setMixing(false);
    }
  }

  playBootUpSequence() {
    // Instant camera reset — no bounce, no animation
    if (this.cameraPivot) {
      this.cameraPivot.position.set(0, 0, 0);
      this.cameraPivot.rotation.set(0, 0, 0);
    }
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onWheel(event) {
    // Normal page scrolling is used now, so no preventDefault
    this.targetScrollDepth += event.deltaY * 0.5;
    this.targetScrollDepth = Math.max(0, Math.min(this.targetScrollDepth, 1000));
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    gsap.to(this.cameraPivot.rotation, {
      y: -this.mouse.x * 0.2,
      x: this.mouse.y * 0.1,
      duration: 1
    });

    // Light mode: interactive DJ parallax background
    if (document.body.classList.contains('light-mode')) {
      const app = document.getElementById('app');
      if (app) {
        const shiftX = (event.clientX / window.innerWidth - 0.5) * 40;
        const shiftY = (event.clientY / window.innerHeight - 0.5) * 40;
        app.style.backgroundPosition = `calc(50% + ${shiftX}px) calc(50% + ${shiftY}px)`;
      }
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.character.getIntersectableMeshes());
    
    if (intersects.length > 0) {
      this.targetHoverZoom = 1.0;
    } else {
      this.targetHoverZoom = 0.0;
    }
  }

  onMouseDown(event) {
    if (!audioManager.isPlaying) return;

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.character.getIntersectableMeshes());
    
    if (intersects.length > 0) {
      audioManager.playScratch();
      // Provide visual feedback by flashing the DJ pulse
      this.character.setMixing(true);
      setTimeout(() => { if (!audioManager.isPlaying) this.character.setMixing(false); }, 200);
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    
    // Smoothly interpolate scroll and hover zooms
    this.scrollDepth += (this.targetScrollDepth - this.scrollDepth) * 10 * delta;
    this.currentHoverZoom += (this.targetHoverZoom - this.currentHoverZoom) * 5 * delta;

    // Base camera Z = 8. Scroll can bring it to 3. Hover brings it closer by 1 unit.
    const scrollZ = 8 - (this.scrollDepth / 1000) * 5;
    this.camera.position.z = scrollZ - this.currentHoverZoom;
    


    if (audioManager.isPlaying) {
      const frequencyData = audioManager.getFrequencyData();
      this.env.update(frequencyData);
      this.character.update(delta, frequencyData);
    } else {
      this.character.update(delta, { bass: 0, mid: 0, treble: 0 });
      this.env.update({ bass: 0, mid: 0, treble: 0 }); 
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Start App when DOM is ready
window.onload = () => {
  new App();
};
