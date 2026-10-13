// ============================================================================
// CHINESE ASSASSIN — CUSTOMER ACCOUNT & USPS ORDER TRACKING ENGINE (PROMPTS 12 & 13)
// Features: View Orders, Download Receipts, Reorder Previous USB Builds,
// Save Favorite Albums, Save Addresses, Full 9-Stage USPS Order Timeline with Timestamps,
// USPS Tracking Number, Latest Tracking Events, External USPS Track Package Button.
// ============================================================================

import { usbBuilder } from './usbBuilder.js';

const ACCOUNT_STORAGE_KEY = 'chinese_assassin_customer_account';

export class CustomerAccount {
  constructor() {
    this.activeTab = 'orders';
    this.selectedTrackingOrderId = null;
    this.accountData = {
      profile: {
        name: 'Chinese Assassin Fan',
        email: 'assassin_fan@example.com',
        phone: '+1 (555) 123-4567',
        tier: 'VIP Platinum Member',
        joined: 'January 2026'
      },
      orders: [
        {
          orderNumber: 'CA-2026-94810',
          transactionId: 'TXN-MS808-VIP94',
          orderDate: 'July 28, 2026',
          tier: { id: 'usb-64', name: '64 GB Pro Assassin Drive', capacityGB: 64, price: 59.99 },
          engravingText: 'ASSASSIN VIP 2026',
          albumIds: ['alb-1', 'alb-2', 'alb-4'],
          status: 'In Transit',
          uspsTrackingNumber: '9400 1000 0000 0000 0000 00',
          estimatedDelivery: 'August 4, 2026 by 7:00 PM',
          currentStageIndex: 7, // Out for Delivery
          shippingAddress: {
            address: '88 Cyberpunk Blvd, Level 4',
            city: 'Neon City',
            state: 'FL',
            zip: '33101',
            country: 'United States'
          },
          pricing: {
            subtotal: 74.97,
            drivePrice: 59.99,
            shipping: 0,
            tax: 13.50,
            grandTotal: 148.46
          }
        },
        {
          orderNumber: 'CA-2026-81042',
          transactionId: 'TXN-VIP128-CLASH',
          orderDate: 'June 15, 2026',
          tier: { id: 'usb-128', name: '128 GB Ultimate Collector', capacityGB: 128, price: 89.99 },
          engravingText: 'SOUNDCLASH KING',
          albumIds: ['alb-4', 'alb-8', 'alb-10'],
          status: 'Delivered',
          uspsTrackingNumber: '9400 1111 2222 3333 4444 55',
          estimatedDelivery: 'June 18, 2026 by 2:15 PM',
          currentStageIndex: 8, // Delivered
          shippingAddress: {
            address: '88 Cyberpunk Blvd, Level 4',
            city: 'Neon City',
            state: 'FL',
            zip: '33101',
            country: 'United States'
          },
          pricing: {
            subtotal: 104.97,
            drivePrice: 89.99,
            shipping: 0,
            tax: 19.50,
            grandTotal: 214.46
          }
        }
      ],
      favorites: ['alb-1', 'alb-4', 'alb-8'],
      addresses: [
        {
          id: 'addr-1',
          label: 'Primary Home Residence',
          name: 'Chinese Assassin Fan',
          street: '88 Cyberpunk Blvd, Level 4',
          city: 'Neon City',
          state: 'FL',
          zip: '33101',
          country: 'United States',
          isDefaultShipping: true,
          isDefaultBilling: true
        },
        {
          id: 'addr-2',
          label: 'Studio & Rehearsal Lab',
          name: 'Chinese Assassin Studio',
          street: '450 Soundclash Blvd, Suite 808',
          city: 'Miami',
          state: 'FL',
          zip: '33101',
          country: 'United States',
          isDefaultShipping: false,
          isDefaultBilling: false
        }
      ]
    };
    this.initStorage();
  }

  // ── 1. Storage & Sync ───────────────────────────────────────────────────
  initStorage() {
    try {
      const stored = localStorage.getItem(ACCOUNT_STORAGE_KEY);
      if (stored) {
        this.accountData = JSON.parse(stored);
      } else {
        this.saveStorage();
      }
    } catch (err) {
      console.error('Failed to load customer account storage:', err);
    }
  }

  saveStorage() {
    try {
      localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(this.accountData));
    } catch (err) {
      console.error('Failed to save customer account storage:', err);
    }
  }

  // Add new order from checkout engine
  addOrder(newOrder) {
    if (!newOrder) return;
    
    // Attach default USPS tracking number if missing
    if (!newOrder.uspsTrackingNumber) {
      const randTrack = `9400 ${Math.floor(1000+Math.random()*9000)} ${Math.floor(1000+Math.random()*9000)} ${Math.floor(1000+Math.random()*9000)} ${Math.floor(1000+Math.random()*9000)} ${Math.floor(10+Math.random()*90)}`;
      newOrder.uspsTrackingNumber = randTrack;
    }
    if (newOrder.currentStageIndex === undefined) {
      newOrder.currentStageIndex = 2; // Preparing USB
    }

    this.accountData.orders.unshift(newOrder);

    // Also update saved profile details
    if (newOrder.customer) {
      this.accountData.profile.name = newOrder.customer.name || this.accountData.profile.name;
      this.accountData.profile.email = newOrder.customer.email || this.accountData.profile.email;
      this.accountData.profile.phone = newOrder.customer.phone || this.accountData.profile.phone;
    }

    this.saveStorage();
  }

  // ── 2. Helper to Build 9-Stage Tracking Data Structure (Prompt 13) ────────
  getTrackingDetails(order) {
    if (!order) return null;

    const baseDate = order.orderDate || 'July 28, 2026';
    const isDelivered = order.status === 'Delivered' || order.currentStageIndex === 8;
    const trackingNumber = order.uspsTrackingNumber || '9400 1000 0000 0000 0000 00';
    const cleanTrackNum = trackingNumber.replace(/\s+/g, '');
    const currentIdx = order.currentStageIndex !== undefined ? order.currentStageIndex : (isDelivered ? 8 : 7);

    // Prompt 13: 9 Stages with explicit Timestamps
    const stages = [
      { name: 'Order Received', icon: '📥', timestamp: `${baseDate} - 10:14 AM` },
      { name: 'Payment Confirmed', icon: '💳', timestamp: `${baseDate} - 10:15 AM` },
      { name: 'Preparing USB', icon: '⚡', timestamp: `${baseDate} - 02:30 PM` },
      { name: 'Music Loaded', icon: '💾', timestamp: 'July 29, 2026 - 09:00 AM' },
      { name: 'Quality Check', icon: '🔍', timestamp: 'July 29, 2026 - 11:45 AM' },
      { name: 'Packaged', icon: '📦', timestamp: 'July 29, 2026 - 03:20 PM' },
      { name: 'Shipped', icon: '🚚', timestamp: 'July 30, 2026 - 08:10 AM' },
      { name: 'Out for Delivery', icon: '🏃', timestamp: 'August 1, 2026 - 07:30 AM' },
      { name: 'Delivered', icon: '🏡', timestamp: isDelivered ? 'August 1, 2026 - 02:15 PM' : 'Pending' }
    ];

    const latestEvents = [
      { time: 'August 1, 2026 - 07:30 AM', location: 'MIAMI FL 33101', description: 'Out for Delivery by USPS Mail Carrier' },
      { time: 'August 1, 2026 - 05:12 AM', location: 'MIAMI FL 33101', description: 'Arrived at USPS Post Office Destination Facility' },
      { time: 'July 30, 2026 - 08:10 AM', location: 'ATLANTA GA 30301', description: 'Departed USPS Regional Distribution Center' },
      { time: 'July 29, 2026 - 03:20 PM', location: 'KINGSTON NY 12401', description: 'Accepted at USPS Origin Facility' }
    ];

    return {
      carrier: 'USPS (United States Postal Service)',
      service: 'USPS Priority Mail Express® 2-Day',
      trackingNumber,
      trackingUrl: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${cleanTrackNum}`,
      estimatedDelivery: order.estimatedDelivery || 'August 4, 2026 by 7:00 PM',
      currentStageIndex: currentIdx,
      stages,
      latestEvents
    };
  }

  // ── 3. DOM Initialization ────────────────────────────────────────────────
  initDOM() {
    if (document.getElementById('customer-account-modal')) return;

    const modalMarkup = `
      <!-- CUSTOMER ACCOUNT & VIP DASHBOARD MODAL (PROMPT 12 & 13) -->
      <div id="customer-account-modal" class="account-modal-overlay" style="display: none;">
        <div class="account-modal-container glass-card">

          <!-- VIP HEADER BANNER -->
          <header class="account-header">
            <div class="account-profile-summary">
              <div class="account-avatar-wrap">
                <img src="/Images/FACEID1.jpg" alt="Member Avatar" class="account-avatar" onerror="this.src='/riddim.jpg'">
                <span class="avatar-vip-badge">VIP</span>
              </div>
              <div class="account-profile-info">
                <div class="profile-badge-row">
                  <span class="badge-platinum" id="acc-badge-tier">${this.accountData.profile.tier}</span>
                  <span class="badge-joined">Member Since ${this.accountData.profile.joined}</span>
                </div>
                <h2 class="account-user-name" id="acc-user-name">${this.accountData.profile.name}</h2>
                <span class="account-user-email" id="acc-user-email">📧 ${this.accountData.profile.email} &bull; 📱 ${this.accountData.profile.phone}</span>
              </div>
            </div>

            <button id="account-close-btn" class="account-btn-close">✕</button>
          </header>

          <!-- DASHBOARD TABS NAVIGATION -->
          <nav class="account-tabs-nav">
            <button class="acc-tab ${this.activeTab === 'orders' ? 'active' : ''}" data-acc-tab="orders">
              <span class="tab-icon">📦</span> MY ORDERS (${this.accountData.orders.length})
            </button>
            <button class="acc-tab ${this.activeTab === 'tracking' ? 'active' : ''}" data-acc-tab="tracking">
              <span class="tab-icon">🚚</span> USPS ORDER TRACKING
            </button>
            <button class="acc-tab ${this.activeTab === 'favorites' ? 'active' : ''}" data-acc-tab="favorites">
              <span class="tab-icon">❤️</span> FAVORITE ALBUMS (${this.accountData.favorites.length})
            </button>
            <button class="acc-tab ${this.activeTab === 'addresses' ? 'active' : ''}" data-acc-tab="addresses">
              <span class="tab-icon">📍</span> SAVED ADDRESSES (${this.accountData.addresses.length})
            </button>
            <button class="acc-tab ${this.activeTab === 'profile' ? 'active' : ''}" data-acc-tab="profile">
              <span class="tab-icon">👤</span> PROFILE & SETTINGS
            </button>
          </nav>

          <!-- TAB CONTENT CONTAINER -->
          <main class="account-tab-content" id="account-tab-content">
            ${this.renderTabContent()}
          </main>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalMarkup);
    this.bindEvents();
  }

  // ── 4. Render Tab Contents ────────────────────────────────────────────────
  renderTabContent() {
    if (this.activeTab === 'orders') return this.renderOrdersTab();
    if (this.activeTab === 'tracking') return this.renderTrackingTab();
    if (this.activeTab === 'favorites') return this.renderFavoritesTab();
    if (this.activeTab === 'addresses') return this.renderAddressesTab();
    if (this.activeTab === 'profile') return this.renderProfileTab();
    return this.renderOrdersTab();
  }

  // ── 5. Orders Tab ─────────────────────────────────────────────────────────
  renderOrdersTab() {
    if (this.accountData.orders.length === 0) {
      return `
        <div class="acc-empty-state">
          <span class="acc-empty-icon">📦</span>
          <h3>No Orders Found</h3>
          <p>You haven't built any custom USB drives yet.</p>
          <button class="acc-btn-primary" onclick="window.customerAccount.hide(); if(window.usbBuilder) window.usbBuilder.show();">⚡ BUILD YOUR FIRST USB DRIVE</button>
        </div>
      `;
    }

    return `
      <div class="orders-list-grid">
        ${this.accountData.orders.map(order => {
          const statusClass = order.status === 'Delivered' ? 'st-delivered' :
                              order.status === 'In Transit' ? 'st-transit' : 'st-production';

          return `
            <div class="order-card glass-card" data-order-num="${order.orderNumber}">
              <!-- Order Header -->
              <div class="order-card-header">
                <div class="order-id-group">
                  <span class="order-number-lbl">ORDER #${order.orderNumber}</span>
                  <span class="order-date-sub">Placed on ${order.orderDate} &bull; Txn ID: ${order.transactionId || 'TXN-VERIFIED'}</span>
                </div>
                <div class="order-status-badge ${statusClass}">
                  ${order.status === 'Delivered' ? '✅ DELIVERED' : order.status === 'In Transit' ? '🚚 IN TRANSIT (USPS)' : '⚡ IN PRODUCTION'}
                </div>
              </div>

              <!-- Drive & Engraving Summary -->
              <div class="order-drive-banner">
                <span class="drive-icon">💾</span>
                <div class="drive-info">
                  <span class="drive-name">${order.tier.name} (${order.tier.capacityGB} GB Hardware)</span>
                  <span class="drive-engraved">Laser Engraved Text: <strong>"${order.engravingText || 'ASSASSIN VIP'}"</strong></span>
                </div>
                <span class="order-grand-price">$${order.pricing.grandTotal.toFixed(2)}</span>
              </div>

              <!-- Included Albums Thumbnail Manifest -->
              <div class="order-albums-strip">
                <span class="strip-label">${order.albumIds.length} PRE-LOADED ALBUMS:</span>
                <div class="strip-thumbs-row">
                  ${order.albumIds.map(id => {
                    const alb = usbBuilder.getAlbumById ? usbBuilder.getAlbumById(id) : null;
                    const cover = alb ? alb.cover : '/riddim.jpg';
                    const title = alb ? alb.title : id;
                    return `<img src="${cover}" alt="${title}" title="${title}" class="strip-thumb-img" onerror="this.src='/riddim.jpg'">`;
                  }).join('')}
                </div>
              </div>

              <!-- Order Action Buttons -->
              <div class="order-actions-row">
                <button class="order-act-btn btn-reorder" data-reorder="${order.orderNumber}">
                  🔄 REORDER THIS USB BUILD
                </button>
                <button class="order-act-btn btn-receipt" data-view-receipt="${order.orderNumber}">
                  📄 PRINT / DOWNLOAD RECEIPT
                </button>
                <button class="order-act-btn btn-track" data-track-order="${order.orderNumber}">
                  🚚 TRACK USPS SHIPMENT
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ── 6. USPS Order Tracking Tab (Prompt 13 Required Spec) ──────────────────
  renderTrackingTab() {
    let targetOrder = this.accountData.orders[0];
    if (this.selectedTrackingOrderId) {
      const found = this.accountData.orders.find(o => o.orderNumber === this.selectedTrackingOrderId);
      if (found) targetOrder = found;
    }

    if (!targetOrder) {
      return `<div class="acc-empty-state"><span class="acc-empty-icon">🚚</span><h3>No Shipments to Track</h3></div>`;
    }

    const trk = this.getTrackingDetails(targetOrder);

    return `
      <div class="tracking-dashboard-panel glass-card">
        
        <!-- Order Selector Header -->
        <div class="track-header-row">
          <div>
            <span class="track-tag">🇺🇸 OFFICIAL USPS SHIPMENT TRACKING</span>
            <h3 class="track-title">ORDER #${targetOrder.orderNumber}</h3>
            
            <div class="usps-meta-details">
              <span class="usps-meta-item">📦 <strong>CARRIER:</strong> ${trk.carrier} (${trk.service})</span>
              <span class="usps-meta-item">🔢 <strong>TRACKING NUMBER:</strong> <code class="usps-code">${trk.trackingNumber}</code></span>
            </div>
          </div>

          <div class="track-header-right">
            <div class="track-delivery-box">
              <span class="del-lbl">ESTIMATED DELIVERY</span>
              <span class="del-date">${trk.estimatedDelivery}</span>
            </div>

            <!-- Prompt 13: Track Package Button -->
            <a href="${trk.trackingUrl}" target="_blank" class="usps-track-external-btn">
              🔗 TRACK PACKAGE ON USPS.COM
            </a>
          </div>
        </div>

        <!-- PROMPT 13: FULL 9-STAGE ORDER TIMELINE WITH TIMESTAMPS -->
        <div class="timeline-container">
          <div class="timeline-header-label">
            <span>⚙️ ORDER PRODUCTION & SHIPMENT TIMELINE (9 STAGES)</span>
            <span class="timeline-stage-count">Stage ${trk.currentStageIndex + 1} of 9</span>
          </div>

          <div class="timeline-stepper">
            ${trk.stages.map((stg, idx) => {
              const isDone = idx <= trk.currentStageIndex;
              const isActive = idx === trk.currentStageIndex;
              const stateClass = isDone ? (isActive ? 'active' : 'completed') : 'pending';

              return `
                <div class="t-step-node ${stateClass}">
                  <div class="node-circle">
                    ${isDone && !isActive ? '✓' : stg.icon}
                  </div>
                  <div class="node-info">
                    <span class="node-name">${stg.name}</span>
                    <span class="node-time">${stg.timestamp}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- PROMPT 13: LATEST TRACKING EVENTS LOG -->
        <div class="latest-events-box">
          <h4 class="events-title">📋 LATEST USPS TRACKING EVENTS</h4>
          <div class="events-list">
            ${trk.latestEvents.map(evt => `
              <div class="event-row">
                <span class="evt-time">${evt.time}</span>
                <span class="evt-loc">${evt.location}</span>
                <span class="evt-desc">${evt.description}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Destination Address -->
        <div class="track-address-card">
          <h4>📍 DESTINATION DELIVERY ADDRESS:</h4>
          <p>${targetOrder.shippingAddress.address}, ${targetOrder.shippingAddress.city}, ${targetOrder.shippingAddress.state} ${targetOrder.shippingAddress.zip}, ${targetOrder.shippingAddress.country}</p>
        </div>

      </div>
    `;
  }

  // ── 7. Favorites Tab ─────────────────────────────────────────────────────
  renderFavoritesTab() {
    const favIds = this.accountData.favorites;
    if (favIds.length === 0) {
      return `
        <div class="acc-empty-state">
          <span class="acc-empty-icon">❤️</span>
          <h3>No Favorite Albums Saved</h3>
          <p>Click the heart icon on any album card to bookmark it to your account.</p>
        </div>
      `;
    }

    return `
      <div class="favorites-grid">
        ${favIds.map(id => {
          const alb = usbBuilder.getAlbumById ? usbBuilder.getAlbumById(id) : null;
          if (!alb) return '';
          return `
            <div class="fav-album-card glass-card">
              <div class="fav-thumb-wrap">
                <img src="${alb.cover}" alt="${alb.title}" class="fav-thumb" onerror="this.src='/riddim.jpg'">
                <button class="fav-remove-heart" data-toggle-fav="${alb.id}" title="Remove from Favorites">❤️</button>
              </div>
              <div class="fav-info">
                <span class="fav-genre">${alb.category} &bull; ${alb.era}</span>
                <h4 class="fav-title">${alb.title}</h4>
                <div class="fav-specs">
                  <span>🎵 ${alb.tracks} Tracks</span>
                  <span>💾 ${alb.sizeDisplay}</span>
                  <span class="fav-price">$${alb.price.toFixed(2)}</span>
                </div>
                <button class="fav-add-usb-btn" data-album-toggle="${alb.id}">
                  + ADD TO USB
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ── 8. Saved Addresses Tab ───────────────────────────────────────────────
  renderAddressesTab() {
    return `
      <div class="addresses-section">
        <div class="addr-header-row">
          <h3 class="addr-title">SAVED ADDRESS BOOK</h3>
          <button id="add-new-address-btn" class="acc-btn-primary">+ ADD NEW ADDRESS</button>
        </div>

        <div class="addresses-grid">
          ${this.accountData.addresses.map(addr => `
            <div class="address-card glass-card ${addr.isDefaultShipping ? 'default-card' : ''}">
              <div class="addr-card-top">
                <span class="addr-label">${addr.label}</span>
                ${addr.isDefaultShipping ? `<span class="addr-default-badge">DEFAULT SHIPPING</span>` : ''}
              </div>
              <strong class="addr-name">${addr.name}</strong>
              <p class="addr-street">${addr.street}</p>
              <p class="addr-city">${addr.city}, ${addr.state} ${addr.zip}</p>
              <p class="addr-country">${addr.country}</p>

              <div class="addr-actions">
                <button class="addr-btn btn-edit" data-edit-addr="${addr.id}">✏️ Edit</button>
                ${!addr.isDefaultShipping ? `<button class="addr-btn btn-default" data-set-default="${addr.id}">Set Default</button>` : ''}
                <button class="addr-btn btn-delete" data-delete-addr="${addr.id}">🗑️ Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ── 9. Profile Tab ───────────────────────────────────────────────────────
  renderProfileTab() {
    const p = this.accountData.profile;
    return `
      <div class="profile-settings-panel glass-card">
        <h3 class="profile-title">ACCOUNT PROFILE & SECURITY</h3>
        
        <form id="profile-edit-form" class="profile-form">
          <div class="form-grid-2">
            <div class="chk-group">
              <label class="chk-label">FULL NAME</label>
              <input type="text" id="prof-name" class="chk-input" value="${p.name}" required>
            </div>
            <div class="chk-group">
              <label class="chk-label">EMAIL ADDRESS</label>
              <input type="email" id="prof-email" class="chk-input" value="${p.email}" required>
            </div>
          </div>

          <div class="form-grid-2" style="margin-top: 10px;">
            <div class="chk-group">
              <label class="chk-label">PHONE NUMBER</label>
              <input type="tel" id="prof-phone" class="chk-input" value="${p.phone}" required>
            </div>
            <div class="chk-group">
              <label class="chk-label">VIP TIER STATUS</label>
              <input type="text" class="chk-input readonly-input" value="${p.tier}" readonly>
            </div>
          </div>

          <div class="prof-actions" style="margin-top: 16px;">
            <button type="submit" class="acc-btn-primary">💾 SAVE PROFILE CHANGES</button>
          </div>
        </form>
      </div>
    `;
  }

  // ── 10. Actions Logic ────────────────────────────────────────────────────
  reorderBuild(orderNum) {
    const order = this.accountData.orders.find(o => o.orderNumber === orderNum);
    if (!order) return;

    if (window.usbBuilder) {
      if (order.tier) window.usbBuilder.selectedTier = order.tier;
      if (order.engravingText) window.usbBuilder.customEngravingText = order.engravingText;
      if (Array.isArray(order.albumIds)) window.usbBuilder.selectedAlbums = new Set(order.albumIds);

      window.usbBuilder.refresh();
      window.usbBuilder.updateStorageLive();
      window.usbBuilder.refreshSelectedList();
    }

    this.hide();
    if (window.usbBuilder) window.usbBuilder.show();
    alert(`⚡ REORDER LOADED! Loaded USB Drive (${order.tier.capacityGB}GB), Engraving ("${order.engravingText}"), and ${order.albumIds.length} Albums into builder.`);
  }

  toggleFavorite(albumId) {
    const idx = this.accountData.favorites.indexOf(albumId);
    if (idx === -1) {
      this.accountData.favorites.push(albumId);
    } else {
      this.accountData.favorites.splice(idx, 1);
    }
    this.saveStorage();
    this.refreshTabContent();
  }

  // ── 11. Bind Events ──────────────────────────────────────────────────────
  bindEvents() {
    const modal = document.getElementById('customer-account-modal');
    if (!modal) return;

    // Close button
    const closeBtn = document.getElementById('account-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.hide());

    // Tab Navigation
    modal.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-acc-tab]');
      if (tabBtn) {
        this.activeTab = tabBtn.dataset.accTab;
        const allTabs = modal.querySelectorAll('[data-acc-tab]');
        allTabs.forEach(t => t.classList.toggle('active', t === tabBtn));
        this.refreshTabContent();
      }
    });

    // Reorder & Tracking Actions
    modal.addEventListener('click', (e) => {
      const reorderBtn = e.target.closest('[data-reorder]');
      if (reorderBtn) {
        this.reorderBuild(reorderBtn.dataset.reorder);
      }

      const receiptBtn = e.target.closest('[data-view-receipt]');
      if (receiptBtn) {
        const orderNum = receiptBtn.dataset.viewReceipt;
        const order = this.accountData.orders.find(o => o.orderNumber === orderNum);
        if (order && window.checkoutEngine) {
          window.checkoutEngine.showConfirmationModal(order);
        }
      }

      const trackBtn = e.target.closest('[data-track-order]');
      if (trackBtn) {
        this.selectedTrackingOrderId = trackBtn.dataset.trackOrder;
        this.activeTab = 'tracking';
        const allTabs = modal.querySelectorAll('[data-acc-tab]');
        allTabs.forEach(t => t.classList.toggle('active', t.dataset.accTab === 'tracking'));
        this.refreshTabContent();
      }

      const favBtn = e.target.closest('[data-toggle-fav]');
      if (favBtn) {
        this.toggleFavorite(favBtn.dataset.toggleFav);
      }
    });

    // Profile Form Save
    modal.addEventListener('submit', (e) => {
      if (e.target.id === 'profile-edit-form') {
        e.preventDefault();
        this.accountData.profile.name = document.getElementById('prof-name').value;
        this.accountData.profile.email = document.getElementById('prof-email').value;
        this.accountData.profile.phone = document.getElementById('prof-phone').value;
        this.saveStorage();
        const userNameEl = document.getElementById('acc-user-name');
        const userEmailEl = document.getElementById('acc-user-email');
        if (userNameEl) userNameEl.textContent = this.accountData.profile.name;
        if (userEmailEl) userEmailEl.textContent = `📧 ${this.accountData.profile.email} • 📱 ${this.accountData.profile.phone}`;
        alert('✅ Profile details updated successfully.');
      }
    });
  }

  refreshTabContent() {
    const content = document.getElementById('account-tab-content');
    if (content) content.innerHTML = this.renderTabContent();
  }

  // ── Show / Hide ─────────────────────────────────────────────────────────
  show(tabName = 'orders') {
    this.initDOM();
    if (tabName) this.activeTab = tabName;
    const modal = document.getElementById('customer-account-modal');
    if (modal) {
      this.refreshTabContent();
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  hide() {
    const modal = document.getElementById('customer-account-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }
}

export const customerAccount = new CustomerAccount();
window.customerAccount = customerAccount;
