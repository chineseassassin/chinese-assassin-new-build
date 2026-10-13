// ============================================================================
// CHINESE ASSASSIN — CUSTOM USB MIXTAPE BUILDER ENGINE
// Blueprint Rebuild — Matches exact uploaded UI blueprint
// Left: Music Catalog Panel | Right: Drive + Checkout Panel
// ============================================================================

export const USB_DRIVE_TIERS = [
  { id: 'usb-16',  name: '16 GB Compact Metal',    capacityGB: 16,  price: 29.99, tag: 'Starter' },
  { id: 'usb-32',  name: '32 GB Stealth Metallic',  capacityGB: 32,  price: 39.99, tag: 'Standard' },
  { id: 'usb-64',  name: '64 GB Pro Assassin Drive', capacityGB: 64,  price: 59.99, tag: 'POPULAR', default: true },
  { id: 'usb-128', name: '128 GB Ultimate Collector',capacityGB: 128, price: 89.99, tag: 'MAX STORAGE' }
];

export const ALBUMS_CATALOG = [
  {
    id: 'alb-1',
    title: 'Kung Fu Master Stem Remixes',
    artist: 'Chinese Assassin',
    category: 'THE VAULT',
    era: 'Remixes',
    tracks: 16,
    runtime: '1:04:20',
    fileSizeMB: 5939,
    sizeDisplay: '5.80 GB',
    sizeGB: 5.80,
    price: 22.50,
    cover: '/Images/FACEID1.jpg',
    badge: 'REMIX',
    categoryLabel: 'THE VAULT',
    description: 'Exclusive stem remixes of the iconic Kung Fu Master series.'
  },
  {
    id: 'alb-2',
    title: "90's Dancehall Anthems",
    artist: 'Chinese Assassin',
    category: 'CLASSIC SELECTION',
    era: 'Old School',
    tracks: 24,
    runtime: '1:38:00',
    fileSizeMB: 7629,
    sizeDisplay: '7.45 GB',
    sizeGB: 7.45,
    price: 24.99,
    cover: '/Images/FACEID2.jpg',
    badge: 'OLD SCHOOL',
    categoryLabel: 'CLASSIC SELECTION',
    description: 'Foundation dancehall anthems from the golden era of 90s reggae.'
  },
  {
    id: 'alb-3',
    title: 'New School Bangers Vol. 1',
    artist: 'Chinese Assassin',
    category: 'NEW ERA',
    era: 'New School',
    tracks: 24,
    runtime: '1:36:00',
    fileSizeMB: 6349,
    sizeDisplay: '6.20 GB',
    sizeGB: 6.20,
    price: 19.99,
    cover: '/Images/FACEID3.jpg',
    badge: 'NEW SCHOOL',
    categoryLabel: 'NEW ERA',
    description: 'The freshest new school riddim selections with heavyweight 808s.'
  },
  {
    id: 'alb-4',
    title: 'Exclusive Remix Pack',
    artist: 'Chinese Assassin',
    category: 'SECRET STASH',
    era: 'Remixes',
    tracks: 20,
    runtime: '1:20:00',
    fileSizeMB: 6349,
    sizeDisplay: '6.20 GB',
    sizeGB: 6.20,
    price: 19.99,
    cover: '/riddim.jpg',
    badge: 'REMIX',
    categoryLabel: 'SECRET STASH',
    description: 'Secret stash of exclusive bootleg remixes and unreleased VIP dubs.'
  },
  {
    id: 'alb-5',
    title: 'Reggae Lovers Collection',
    artist: 'Chinese Assassin',
    category: 'VINTAGE VIBES',
    era: 'Old School',
    tracks: 18,
    runtime: '1:12:00',
    fileSizeMB: 7373,
    sizeDisplay: '7.20 GB',
    sizeGB: 7.20,
    price: 23.50,
    cover: '/Images/LANDING_PAGE2.png',
    badge: 'OLD SCHOOL',
    categoryLabel: 'VINTAGE VIBES',
    description: 'Classic lovers rock and roots reggae from the golden era.'
  },
  {
    id: 'alb-6',
    title: 'Street Kings Elite Vol. 1',
    artist: 'Chinese Assassin',
    category: 'THE VAULT',
    era: 'Old School',
    tracks: 12,
    runtime: '58:20',
    fileSizeMB: 4301,
    sizeDisplay: '4.20 GB',
    sizeGB: 4.20,
    price: 19.99,
    cover: '/Images/THEDOOR2.jpg',
    badge: 'OLD SCHOOL',
    categoryLabel: 'THE VAULT',
    description: 'Classic 90s & 2000s street soundclash dubplates.'
  },
  {
    id: 'alb-7',
    title: 'The Vault VIP Stash 2026',
    artist: 'Chinese Assassin',
    category: 'THE VAULT',
    era: 'New School',
    tracks: 18,
    runtime: '1:12:44',
    fileSizeMB: 6963,
    sizeDisplay: '6.80 GB',
    sizeGB: 6.80,
    price: 24.99,
    cover: '/Images/FACEID1.jpg',
    badge: 'NEW SCHOOL',
    categoryLabel: 'THE VAULT',
    description: 'Heavyweight modern 2026 riddim selections and new era dubs.'
  },
  {
    id: 'alb-8',
    title: 'Silent Blade Remix Anthology',
    artist: 'Chinese Assassin',
    category: 'SECRET STASH',
    era: 'Remixes',
    tracks: 24,
    runtime: '1:35:10',
    fileSizeMB: 1864,
    sizeDisplay: '1.82 GB',
    sizeGB: 1.82,
    price: 29.99,
    cover: '/Images/FACEID3.jpg',
    badge: 'REMIX',
    categoryLabel: 'SECRET STASH',
    description: 'Exclusive bootleg remixes, mashups, and unreleased VIP dubs.'
  }
];

export class USBBuilderUI {
  constructor() {
    this.selectedTier = USB_DRIVE_TIERS.find(t => t.default) || USB_DRIVE_TIERS[2];
    this.selectedAlbums = new Set();
    this.activeFilter = 'ALL';
    this.searchQuery = '';
    this.sortOrder = 'Newest';
    this.initDOM();
  }

  initDOM() {
    if (!document.getElementById('usb-builder-modal')) {
      const modal = document.createElement('div');
      modal.id = 'usb-builder-modal';
      modal.className = 'usb-backdrop';
      modal.style.display = 'none';
      modal.innerHTML = this.renderTemplate();
      document.body.appendChild(modal);
      this.bindEvents();
    }
  }

  renderTemplate() {
    return `
      <div class="usb-container">
        <div class="usb-top-header">
          <div class="usb-header-left">
            <div class="usb-header-logo-row">
              <img src="/CA_DRAGON_LOGO.png" alt="CA" class="usb-header-logo" onerror="this.style.display='none'" />
              <div class="usb-header-titles">
                <div class="usb-header-pre">BUILD YOUR CUSTOM</div>
                <div class="usb-header-main">MIXTAPE USB DRIVE</div>
                <p class="usb-header-sub">Curate your ultimate soundclash arsenal. Old School, New School &amp; Exclusive Remixes on a Metallic Flash Drive.</p>
              </div>
              <div class="usb-header-pills">
                <span class="usb-pill">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  <span>HIGH QUALITY<br><small>320kbps MP3</small></span>
                </span>
                <span class="usb-pill">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>SECURE<br><small>ENCRYPTION</small></span>
                </span>
                <span class="usb-pill">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span>WORLDWIDE<br><small>SHIPPING</small></span>
                </span>
                <span class="usb-pill">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span>EXCLUSIVE<br><small>REMIXES</small></span>
                </span>
              </div>
            </div>
          </div>
          <div class="usb-drive-widget">
            <button class="usb-close-x" id="usb-close-modal-btn" aria-label="Close">&#10005;</button>
            <div class="usb-drive-widget-inner">
              <div class="usb-drive-bg-dragon">
                <svg viewBox="0 0 200 200" width="100%" height="100%" fill="rgba(255,255,255,0.06)">
                  <path d="M100 10 C60 10 30 40 30 80 C30 110 50 130 80 145 L80 160 C80 170 90 180 100 180 C110 180 120 170 120 160 L120 145 C150 130 170 110 170 80 C170 40 140 10 100 10 Z"/>
                </svg>
              </div>
              <div class="usb-drive-widget-header">
                <span class="usb-dw-title">METALLIC FLASH DRIVE</span>
                <span class="usb-dw-sub">Zinc-Alloy Casing &#8226; USB 3.2</span>
              </div>
              <div class="usb-dw-specs">
                <div class="usb-dw-spec"><span class="usb-dw-val">320</span><span class="usb-dw-lbl">KBPS MP3</span></div>
                <div class="usb-dw-spec"><span class="usb-dw-val">WAV</span><span class="usb-dw-lbl">LOSSLESS</span></div>
                <div class="usb-dw-spec"><span class="usb-dw-val">USB 3.2</span><span class="usb-dw-lbl">HIGH SPEED</span></div>
                <div class="usb-dw-spec"><span class="usb-dw-val">64GB+</span><span class="usb-dw-lbl">STORAGE</span></div>
              </div>
              <div class="usb-dw-trust">&#128274; Secure Encrypted Checkout</div>
            </div>
          </div>
        </div>

        <div class="usb-main-body">
          <div class="usb-catalog-panel">
            <div class="usb-catalog-panel-inner">
              <div class="usb-cat-header">
                <h2 class="usb-cat-title">ADD MUSIC TO YOUR DRIVE</h2>
              </div>
              <div class="usb-filter-row">
                <div class="usb-filter-pills" id="usb-filter-pills">
                  <button class="usb-fpill ${this.activeFilter === 'ALL' ? 'active' : ''}" data-filter="ALL">ALL</button>
                  <button class="usb-fpill ${this.activeFilter === 'Old School' ? 'active' : ''}" data-filter="Old School">OLD SCHOOL</button>
                  <button class="usb-fpill ${this.activeFilter === 'New School' ? 'active' : ''}" data-filter="New School">NEW SCHOOL</button>
                  <button class="usb-fpill ${this.activeFilter === 'Remixes' ? 'active' : ''}" data-filter="Remixes">REMIXES</button>
                </div>
                <div class="usb-search-wrap">
                  <svg class="usb-search-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" id="usb-search-inp" class="usb-search-inp" placeholder="Search tracks, artists, mixes..." value="${this.searchQuery}" />
                </div>
                <select id="usb-sort-select" class="usb-sort-sel">
                  <option value="Newest" ${this.sortOrder === 'Newest' ? 'selected' : ''}>Newest</option>
                  <option value="Oldest" ${this.sortOrder === 'Oldest' ? 'selected' : ''}>Oldest</option>
                  <option value="Price Low" ${this.sortOrder === 'Price Low' ? 'selected' : ''}>Price Low</option>
                  <option value="Price High" ${this.sortOrder === 'Price High' ? 'selected' : ''}>Price High</option>
                </select>
              </div>
              <div class="usb-album-grid" id="usb-album-grid">
                ${this.renderAlbumGrid()}
              </div>
              <div class="usb-load-more-row">
                <button class="usb-load-more-btn" id="usb-load-more-btn">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  LOAD MORE MIXES
                </button>
              </div>
            </div>
          </div>

          <aside class="usb-drive-panel" id="usb-drive-panel">
            <div class="usb-drive-panel-inner">
              <h3 class="usb-drive-panel-title">YOUR USB DRIVE</h3>
              <div class="usb-drive-visual" id="usb-drive-visual">
                ${this.renderDriveVisual()}
              </div>
              <div class="usb-storage-stats" id="usb-storage-stats">
                ${this.renderStorageStats()}
              </div>
              <div class="usb-panel-divider"></div>
              <div class="usb-pricing" id="usb-pricing">
                ${this.renderPricing()}
              </div>
              <div class="usb-security-badge">
                &#128274; 256-BIT SSL ENCRYPTED &#8226; WORLDWIDE SHIPPING
              </div>
              <button class="usb-checkout-btn" id="usb-checkout-btn">
                PROCEED TO CHECKOUT &#8594;
              </button>
            </div>
          </aside>
        </div>
      </div>
    `;
  }

  renderAlbumGrid() {
    let albums = ALBUMS_CATALOG.filter(alb => {
      const matchFilter = this.activeFilter === 'ALL' || alb.era === this.activeFilter;
      const matchSearch = !this.searchQuery ||
        alb.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        alb.artist.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        alb.category.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });

    if (this.sortOrder === 'Price Low') albums = albums.sort((a, b) => a.price - b.price);
    if (this.sortOrder === 'Price High') albums = albums.sort((a, b) => b.price - a.price);
    if (this.sortOrder === 'Oldest') albums = [...albums].reverse();

    if (albums.length === 0) {
      return `<div class="usb-empty-state"><p>No albums found. Try a different filter or search.</p></div>`;
    }

    const usedMB = this.getUsedMB();
    const capMB = this.selectedTier.capacityGB * 1024;
    const availMB = capMB - usedMB;

    return albums.map(alb => {
      const isAdded = this.selectedAlbums.has(alb.id);
      const wouldOverflow = !isAdded && alb.fileSizeMB > availMB;
      const badgeClass = alb.era === 'Old School' ? 'badge-old' : alb.era === 'New School' ? 'badge-new' : 'badge-remix';
      const badgeText = alb.era === 'Remixes' ? 'REMIX' : alb.era === 'Old School' ? 'OLD SCHOOL' : 'NEW SCHOOL';

      return `
        <div class="usb-alb-card${isAdded ? ' is-added' : ''}${wouldOverflow ? ' is-locked' : ''}" data-album-id="${alb.id}">
          <div class="usb-alb-cover">
            <img src="${alb.cover}" alt="${alb.title}" onerror="this.src='/riddim.jpg'" />
            <span class="usb-alb-era-badge ${badgeClass}">${badgeText}</span>
            ${isAdded ? '<div class="usb-alb-added-overlay"><span>&#10003;</span></div>' : ''}
          </div>
          <div class="usb-alb-info">
            <div class="usb-alb-category">${alb.categoryLabel || alb.category}</div>
            <div class="usb-alb-title">${alb.title}</div>
            <div class="usb-alb-specs">
              <span>&#127925; ${alb.tracks} <small>SONGS</small></span>
              <span>&#128190; ${alb.sizeDisplay}</span>
              <span class="usb-alb-price">$${alb.price.toFixed(2)}</span>
            </div>
          </div>
          <button
            class="usb-alb-btn${isAdded ? ' added' : ''}${wouldOverflow ? ' locked' : ''}"
            data-album-toggle="${alb.id}"
            ${wouldOverflow ? 'disabled' : ''}>
            ${isAdded ? '&#10003; ADDED &#10005;' : wouldOverflow ? 'NO SPACE' : '+ ADD &#8853;'}
          </button>
        </div>
      `;
    }).join('');
  }

  renderDriveVisual() {
    const isEmpty = this.selectedAlbums.size === 0;
    return `
      <div class="usb-dv-icon${isEmpty ? '' : ' filled'}">
        <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" stroke-width="1.4">
          <rect x="2" y="8" width="20" height="12" rx="2" ry="2"/>
          <path d="M6 8V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/>
          <circle cx="12" cy="14" r="2.2" fill="currentColor" stroke="none"/>
        </svg>
      </div>
      <div class="usb-dv-status">
        ${isEmpty
          ? `<p class="usb-dv-label">DRIVE IS EMPTY</p><p class="usb-dv-sub">Add albums from the<br>catalog to build your<br>custom mix drive.</p>`
          : `<p class="usb-dv-label">${this.selectedAlbums.size} ALBUM${this.selectedAlbums.size > 1 ? 'S' : ''} LOADED</p><p class="usb-dv-sub">Drive is being filled<br>with your mixes.</p>`
        }
      </div>
    `;
  }

  renderStorageStats() {
    const usedMB = this.getUsedMB();
    const capGB = this.selectedTier.capacityGB;
    const capMB = capGB * 1024;
    const remainGB = Math.max(0, (capMB - usedMB) / 1024);
    const usedDisplay = usedMB < 1024 ? `${usedMB} MB` : `${(usedMB / 1024).toFixed(1)} GB`;
    const pct = Math.min(100, Math.round((usedMB / capMB) * 100));

    return `
      <div class="usb-stat-row">
        <span class="usb-stat-lbl">USB SIZE</span>
        <span class="usb-stat-val stat-drive">${capGB} GB PRO ASSASSIN DRIVE</span>
      </div>
      <div class="usb-stat-row">
        <span class="usb-stat-lbl">ALBUMS SELECTED</span>
        <span class="usb-stat-val${this.selectedAlbums.size > 0 ? ' stat-active' : ''}">${this.selectedAlbums.size}</span>
      </div>
      <div class="usb-stat-row">
        <span class="usb-stat-lbl">STORAGE USED</span>
        <span class="usb-stat-val stat-used">${usedDisplay}</span>
      </div>
      <div class="usb-stat-row">
        <span class="usb-stat-lbl">STORAGE REMAINING</span>
        <span class="usb-stat-val stat-remain">${remainGB.toFixed(1)} GB</span>
      </div>
      <div class="usb-storage-bar-wrap">
        <div class="usb-storage-bar-track">
          <div class="usb-storage-bar-fill" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }

  renderPricing() {
    const albumsTotal = this.calcAlbumsTotal();
    const drivePrice = this.selectedTier.price;
    const tax = (albumsTotal + drivePrice) * 0.10;
    const grandTotal = albumsTotal + drivePrice + tax;

    return `
      <div class="usb-price-row">
        <span class="usb-price-lbl">USB DRIVE (${this.selectedTier.capacityGB}GB)</span>
        <span class="usb-price-val">$${drivePrice.toFixed(2)}</span>
      </div>
      <div class="usb-price-row">
        <span class="usb-price-lbl">ALBUMS (${this.selectedAlbums.size})</span>
        <span class="usb-price-val">$${albumsTotal.toFixed(2)}</span>
      </div>
      <div class="usb-price-row">
        <span class="usb-price-lbl">SHIPPING</span>
        <span class="usb-price-val price-free">FREE</span>
      </div>
      <div class="usb-price-row">
        <span class="usb-price-lbl">TAX (10%)</span>
        <span class="usb-price-val">$${tax.toFixed(2)}</span>
      </div>
      <div class="usb-grand-total">
        <span class="usb-grand-lbl">GRAND TOTAL</span>
        <span class="usb-grand-val" id="usb-grand-total">$${grandTotal.toFixed(2)}</span>
      </div>
    `;
  }

  getUsedMB() {
    let used = 0;
    this.selectedAlbums.forEach(id => {
      const alb = ALBUMS_CATALOG.find(a => a.id === id);
      if (alb) used += alb.fileSizeMB;
    });
    return used;
  }

  calcAlbumsTotal() {
    let total = 0;
    this.selectedAlbums.forEach(id => {
      const alb = ALBUMS_CATALOG.find(a => a.id === id);
      if (alb) total += alb.price;
    });
    return total;
  }

  updatePanelLive() {
    const dvEl = document.getElementById('usb-drive-visual');
    if (dvEl) dvEl.innerHTML = this.renderDriveVisual();
    const ssEl = document.getElementById('usb-storage-stats');
    if (ssEl) ssEl.innerHTML = this.renderStorageStats();
    const prEl = document.getElementById('usb-pricing');
    if (prEl) prEl.innerHTML = this.renderPricing();
    this.bindCheckoutButton();
    if (window.gsap) {
      const gt = document.getElementById('usb-grand-total');
      if (gt) gsap.fromTo(gt, { scale: 1.15 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
    }
  }

  updateCardState(id, modal) {
    const card = modal.querySelector(`[data-album-id="${id}"]`);
    if (!card) return;
    const isAdded = this.selectedAlbums.has(id);
    const btn = card.querySelector('[data-album-toggle]');
    if (btn) {
      btn.innerHTML = isAdded ? '&#10003; ADDED &#10005;' : '+ ADD &#8853;';
      btn.className = `usb-alb-btn${isAdded ? ' added' : ''}`;
      btn.disabled = false;
    }
    card.classList.toggle('is-added', isAdded);
    const cover = card.querySelector('.usb-alb-cover');
    if (cover) {
      let overlay = cover.querySelector('.usb-alb-added-overlay');
      if (isAdded && !overlay) {
        overlay = document.createElement('div');
        overlay.className = 'usb-alb-added-overlay';
        overlay.innerHTML = '<span>&#10003;</span>';
        cover.appendChild(overlay);
      } else if (!isAdded && overlay) {
        overlay.remove();
      }
    }
  }

  bindEvents() {
    const modal = document.getElementById('usb-builder-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('usb-close-modal-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.hide());

    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.hide();
    });

    const filterPills = document.getElementById('usb-filter-pills');
    if (filterPills) {
      filterPills.addEventListener('click', (e) => {
        const pill = e.target.closest('[data-filter]');
        if (pill) {
          this.activeFilter = pill.dataset.filter;
          filterPills.querySelectorAll('.usb-fpill').forEach(p => p.classList.toggle('active', p.dataset.filter === this.activeFilter));
          this.refreshGrid();
        }
      });
    }

    const searchInp = document.getElementById('usb-search-inp');
    if (searchInp) {
      searchInp.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.refreshGrid();
      });
    }

    const sortSel = document.getElementById('usb-sort-select');
    if (sortSel) {
      sortSel.addEventListener('change', (e) => {
        this.sortOrder = e.target.value;
        this.refreshGrid();
      });
    }

    modal.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('[data-album-toggle]');
      if (toggleBtn) {
        const id = toggleBtn.dataset.albumToggle;
        if (this.selectedAlbums.has(id)) {
          this.selectedAlbums.delete(id);
        } else {
          this.selectedAlbums.add(id);
        }
        this.updateCardState(id, modal);
        this.updatePanelLive();
        this.updateAllCardAvailability(modal);
        if (window.gsap) {
          const card = modal.querySelector(`[data-album-id="${id}"]`);
          if (card) gsap.fromTo(card, { scale: 0.96 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
        }
      }
    });

    const loadMoreBtn = document.getElementById('usb-load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        const origHTML = loadMoreBtn.innerHTML;
        loadMoreBtn.innerHTML = 'LOADING...';
        setTimeout(() => { loadMoreBtn.innerHTML = origHTML; }, 1200);
      });
    }

    this.bindCheckoutButton();
  }

  bindCheckoutButton() {
    const btn = document.getElementById('usb-checkout-btn');
    if (btn) {
      btn.onclick = () => {
        if (window.checkoutEngine) {
          window.checkoutEngine.show();
        } else {
          alert('Checkout coming soon!');
        }
      };
    }
  }

  updateAllCardAvailability(modal) {
    const usedMB = this.getUsedMB();
    const capMB = this.selectedTier.capacityGB * 1024;
    const availMB = capMB - usedMB;
    modal.querySelectorAll('.usb-alb-card').forEach(card => {
      const id = card.dataset.albumId;
      const alb = ALBUMS_CATALOG.find(a => a.id === id);
      if (!alb || this.selectedAlbums.has(id)) return;
      const wouldOverflow = alb.fileSizeMB > availMB;
      const btn = card.querySelector('[data-album-toggle]');
      card.classList.toggle('is-locked', wouldOverflow);
      if (btn) {
        btn.disabled = wouldOverflow;
        btn.className = `usb-alb-btn${wouldOverflow ? ' locked' : ''}`;
        btn.innerHTML = wouldOverflow ? 'NO SPACE' : '+ ADD &#8853;';
      }
    });
  }

  refreshGrid() {
    const gridEl = document.getElementById('usb-album-grid');
    if (gridEl) gridEl.innerHTML = this.renderAlbumGrid();
  }

  refreshGridOnly() { this.refreshGrid(); }
  updateStorageLive() { this.updatePanelLive(); }
  refreshSelectedList() { this.updatePanelLive(); }

  show() {
    this.initDOM();
    const modal = document.getElementById('usb-builder-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if (window.gsap) {
        const container = modal.querySelector('.usb-container');
        if (container) gsap.fromTo(container, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
      }
    }
  }

  hide() {
    const modal = document.getElementById('usb-builder-modal');
    if (modal) {
      if (window.gsap) {
        const container = modal.querySelector('.usb-container');
        if (container) {
          gsap.to(container, { opacity: 0, y: 20, duration: 0.3, ease: 'power2.in',
            onComplete: () => { modal.style.display = 'none'; document.body.style.overflow = ''; }
          });
        } else {
          modal.style.display = 'none';
          document.body.style.overflow = '';
        }
      } else {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    }
  }

  getAlbumById(id) {
    return ALBUMS_CATALOG.find(a => a.id === id);
  }
}

export const usbBuilder = new USBBuilderUI();
window.usbBuilder = usbBuilder;
