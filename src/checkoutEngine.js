// ============================================================================
// CHINESE ASSASSIN — PREMIUM CHECKOUT & ORDER CONFIRMATION ENGINE (PROMPT 11)
// Features: Customer Info, Shipping/Billing Address, 5 Payment Gateways
// (Credit Card, Stripe, PayPal, Apple Pay, Google Pay), Unique Order Number
// Generator, Digital Printable Receipt Generator, Confirmation Page, and Email Dispatch.
// ============================================================================

import { usbBuilder } from './usbBuilder.js';

export class CheckoutEngine {
  constructor() {
    this.paymentMethod = 'credit-card';
    this.sameAsShipping = true;
    this.currentOrder = null;
    this.formData = {
      fullName: 'VIP Soundclash Member',
      email: 'vip.assassin@soundclash.com',
      phone: '+1 (555) 382-9102',
      shippingAddress: '450 Soundclash Blvd, Suite 808',
      city: 'Kingston / Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'United States',
      billingAddress: '450 Soundclash Blvd, Suite 808',
      billingCity: 'Kingston / Miami',
      billingState: 'FL',
      billingZipCode: '33101',
      billingCountry: 'United States',
      cardName: 'VIP Soundclash Member',
      cardNumber: '4532 8910 2049 8812',
      cardExp: '12/28',
      cardCvc: '808'
    };
  }

  // ── Helper to Generate Unique Order Number ──────────────────────────────
  generateOrderNumber() {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    return `CA-2026-${randomDigits}`;
  }

  // ── Helper to Generate Transaction ID ──────────────────────────────────
  generateTransactionId() {
    return `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  }

  // ── 1. Render & Inject Checkout Modal DOM ────────────────────────────────
  initDOM() {
    if (document.getElementById('checkout-modal')) return;

    const modalMarkup = `
      <!-- CHECKOUT MODAL (PROMPT 11) -->
      <div id="checkout-modal" class="checkout-modal-overlay" style="display: none;">
        <div class="checkout-modal-container glass-card">

          <!-- CHECKOUT HEADER -->
          <header class="checkout-header">
            <div class="checkout-header-left">
              <span class="checkout-badge-ssl">🔒 256-BIT SSL ENCRYPTED CHECKOUT</span>
              <h2 class="checkout-title">CUSTOM USB DRIVE CHECKOUT</h2>
              <p class="checkout-subtitle">Enter shipping details & select your preferred VIP payment method.</p>
            </div>
            <button id="checkout-close-btn" class="checkout-btn-close">✕</button>
          </header>

          <!-- CHECKOUT BODY (2 COLUMNS: FORM & ORDER SUMMARY) -->
          <div class="checkout-body">

            <!-- LEFT COLUMN: CUSTOMER, ADDRESS & PAYMENT FORM -->
            <form id="checkout-form" class="checkout-form-panel">

              <!-- SECTION 1: CUSTOMER CONTACT INFO -->
              <div class="checkout-section-box">
                <div class="chk-section-header">
                  <span class="chk-num">1</span>
                  <h3>CUSTOMER CONTACT INFORMATION</h3>
                </div>

                <div class="chk-grid-2">
                  <div class="chk-group">
                    <label class="chk-label">FULL NAME *</label>
                    <input type="text" id="chk-name" class="chk-input" required value="${this.formData.fullName}" placeholder="John Doe">
                  </div>
                  <div class="chk-group">
                    <label class="chk-label">EMAIL ADDRESS * <span class="chk-hint-tag">Receipt Sent Here</span></label>
                    <input type="email" id="chk-email" class="chk-input" required value="${this.formData.email}" placeholder="john@example.com">
                  </div>
                </div>

                <div class="chk-group" style="margin-top: 10px;">
                  <label class="chk-label">PHONE NUMBER * <span class="chk-hint-tag">SMS Shipping Updates</span></label>
                  <input type="tel" id="chk-phone" class="chk-input" required value="${this.formData.phone}" placeholder="+1 (555) 000-0000">
                </div>
              </div>

              <!-- SECTION 2: SHIPPING ADDRESS -->
              <div class="checkout-section-box">
                <div class="chk-section-header">
                  <span class="chk-num">2</span>
                  <h3>SHIPPING ADDRESS</h3>
                </div>

                <div class="chk-group">
                  <label class="chk-label">STREET ADDRESS *</label>
                  <input type="text" id="chk-address" class="chk-input" required value="${this.formData.shippingAddress}" placeholder="123 Soundclash Way, Apt 4B">
                </div>

                <div class="chk-grid-3" style="margin-top: 10px;">
                  <div class="chk-group">
                    <label class="chk-label">CITY *</label>
                    <input type="text" id="chk-city" class="chk-input" required value="${this.formData.city}" placeholder="Miami">
                  </div>
                  <div class="chk-group">
                    <label class="chk-label">STATE / PROVINCE *</label>
                    <input type="text" id="chk-state" class="chk-input" required value="${this.formData.state}" placeholder="FL">
                  </div>
                  <div class="chk-group">
                    <label class="chk-label">POSTAL / ZIP CODE *</label>
                    <input type="text" id="chk-zip" class="chk-input" required value="${this.formData.zipCode}" placeholder="33101">
                  </div>
                </div>

                <div class="chk-group" style="margin-top: 10px;">
                  <label class="chk-label">COUNTRY *</label>
                  <select id="chk-country" class="chk-input" required>
                    <option value="United States">United States</option>
                    <option value="Jamaica">Jamaica</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Japan">Japan</option>
                    <option value="Germany">Germany</option>
                    <option value="Australia">Australia</option>
                    <option value="France">France</option>
                  </select>
                </div>
              </div>

              <!-- SECTION 3: BILLING ADDRESS -->
              <div class="checkout-section-box">
                <div class="chk-section-header">
                  <span class="chk-num">3</span>
                  <h3>BILLING ADDRESS</h3>
                </div>

                <label class="chk-checkbox-label">
                  <input type="checkbox" id="chk-same-billing" checked>
                  <span>Billing address is the same as shipping address</span>
                </label>

                <div id="chk-billing-fields" class="chk-billing-drawer" style="display: none; margin-top: 12px;">
                  <div class="chk-group">
                    <label class="chk-label">BILLING STREET ADDRESS</label>
                    <input type="text" id="chk-billing-address" class="chk-input" value="${this.formData.billingAddress}">
                  </div>
                  <div class="chk-grid-3" style="margin-top: 8px;">
                    <div class="chk-group">
                      <label class="chk-label">CITY</label>
                      <input type="text" id="chk-billing-city" class="chk-input" value="${this.formData.billingCity}">
                    </div>
                    <div class="chk-group">
                      <label class="chk-label">STATE</label>
                      <input type="text" id="chk-billing-state" class="chk-input" value="${this.formData.billingState}">
                    </div>
                    <div class="chk-group">
                      <label class="chk-label">ZIP CODE</label>
                      <input type="text" id="chk-billing-zip" class="chk-input" value="${this.formData.billingZipCode}">
                    </div>
                  </div>
                </div>
              </div>

              <!-- SECTION 4: PAYMENT METHOD SELECTION (5 GATEWAYS) -->
              <div class="checkout-section-box">
                <div class="chk-section-header">
                  <span class="chk-num">4</span>
                  <h3>SELECT PAYMENT METHOD</h3>
                </div>

                <!-- 5 Supported Payment Methods Tabs -->
                <div class="payment-methods-grid">
                  <button type="button" class="pay-method-btn active" data-pay-method="credit-card">
                    <span class="pay-icon">💳</span>
                    <span class="pay-title">Credit Card</span>
                  </button>
                  <button type="button" class="pay-method-btn" data-pay-method="stripe">
                    <span class="pay-icon">🟦</span>
                    <span class="pay-title">Stripe</span>
                  </button>
                  <button type="button" class="pay-method-btn" data-pay-method="paypal">
                    <span class="pay-icon">🟨</span>
                    <span class="pay-title">PayPal</span>
                  </button>
                  <button type="button" class="pay-method-btn" data-pay-method="apple-pay">
                    <span class="pay-icon">🍏</span>
                    <span class="pay-title">Apple Pay</span>
                  </button>
                  <button type="button" class="pay-method-btn" data-pay-method="google-pay">
                    <span class="pay-icon">🌐</span>
                    <span class="pay-title">Google Pay</span>
                  </button>
                </div>

                <!-- Payment Form Views -->
                <div class="payment-form-container" id="payment-form-container">
                  ${this.renderPaymentForm('credit-card')}
                </div>
              </div>

            </form>

            <!-- RIGHT COLUMN: ORDER MANIFEST SUMMARY -->
            <aside class="checkout-summary-panel glass-card" id="checkout-summary-panel">
              ${this.renderOrderSummaryPanel()}
            </aside>

          </div>
        </div>
      </div>

      <!-- ORDER CONFIRMATION & RECEIPT MODAL (PROMPT 11) -->
      <div id="order-confirmation-modal" class="checkout-modal-overlay" style="display: none;">
        <div class="confirmation-container glass-card" id="confirmation-container">
          <!-- Rendered dynamically after payment completion -->
        </div>
      </div>

      <!-- EMAIL NOTIFICATION TOAST -->
      <div id="email-notification-toast" class="email-toast" style="display: none;">
        <!-- Floating simulated email receipt alert -->
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalMarkup);
    this.bindEvents();
  }

  // ── 2. Render Payment Method Specific Sub-Forms ──────────────────────────
  renderPaymentForm(method) {
    if (method === 'credit-card') {
      return `
        <div class="pay-subform card-subform">
          <div class="chk-group">
            <label class="chk-label">CARDHOLDER NAME *</label>
            <input type="text" id="pay-card-name" class="chk-input" required value="${this.formData.cardName}" placeholder="Name on Card">
          </div>
          <div class="chk-group" style="margin-top: 10px;">
            <label class="chk-label">CARD NUMBER *</label>
            <div class="card-num-input-wrap">
              <input type="text" id="pay-card-number" class="chk-input" maxlength="19" required value="${this.formData.cardNumber}" placeholder="4532 8910 2049 8812">
              <span class="card-brands-icons">💳 Visa / MC / Amex</span>
            </div>
          </div>
          <div class="chk-grid-2" style="margin-top: 10px;">
            <div class="chk-group">
              <label class="chk-label">EXPIRY DATE *</label>
              <input type="text" id="pay-card-exp" class="chk-input" maxlength="5" required value="${this.formData.cardExp}" placeholder="MM/YY">
            </div>
            <div class="chk-group">
              <label class="chk-label">CVC / CVV *</label>
              <input type="password" id="pay-card-cvc" class="chk-input" maxlength="4" required value="${this.formData.cardCvc}" placeholder="808">
            </div>
          </div>
        </div>
      `;
    }

    if (method === 'stripe') {
      return `
        <div class="pay-subform express-subform stripe-bg">
          <div class="express-badge">🟦 STRIPE DIRECT PAYMENT</div>
          <p>Instant 1-Click checkout with Stripe Elements. Secure 256-bit encryption.</p>
          <div class="express-stripe-preview">
            <span>Pay with Stripe Card or Saved Wallet</span>
          </div>
        </div>
      `;
    }

    if (method === 'paypal') {
      return `
        <div class="pay-subform express-subform paypal-bg">
          <div class="express-badge">🟨 PAYPAL EXPRESS CHECKOUT</div>
          <p>You will be redirected to PayPal to authorize your payment seamlessly.</p>
          <div class="express-paypal-preview">
            <span>PayPal Buyer Protection Active</span>
          </div>
        </div>
      `;
    }

    if (method === 'apple-pay') {
      return `
        <div class="pay-subform express-subform apple-bg">
          <div class="express-badge">🍏 APPLE PAY ONE-TOUCH</div>
          <p>Double-click side button or use Touch ID / Face ID on your Apple device to authorize.</p>
          <div class="apple-pay-btn-mock">
            <span> Pay</span>
          </div>
        </div>
      `;
    }

    if (method === 'google-pay') {
      return `
        <div class="pay-subform express-subform google-bg">
          <div class="express-badge">🌐 GOOGLE PAY ONE-TOUCH</div>
          <p>Pay instantly using your Google Account saved cards and addresses.</p>
          <div class="google-pay-btn-mock">
            <span>G Pay</span>
          </div>
        </div>
      `;
    }
  }

  // ── 3. Render Order Summary Side-Panel ────────────────────────────────────
  renderOrderSummaryPanel() {
    const tier = usbBuilder.selectedTier;
    const selectedAlbumIds = Array.from(usbBuilder.selectedAlbums);
    const subtotal = usbBuilder.calculateAlbumsSubtotal();
    const drivePrice = tier.price;
    const shipping = usbBuilder.calculateShipping();
    const tax = usbBuilder.calculateTax(subtotal + drivePrice);
    const grandTotal = subtotal + drivePrice + shipping + tax;
    const engraving = usbBuilder.customEngravingText || 'ASSASSIN VIP 2026';

    return `
      <div class="summary-card-header">
        <h3>ORDER SUMMARY</h3>
        <span class="summary-item-count">${selectedAlbumIds.length + 1} ITEMS</span>
      </div>

      <!-- Drive Item -->
      <div class="sum-item-row highlight-drive">
        <div class="sum-thumb">💾</div>
        <div class="sum-details">
          <span class="sum-title">${tier.name}</span>
          <span class="sum-sub">${tier.capacityGB} GB Hardware • Engraving: "${engraving}"</span>
        </div>
        <span class="sum-price">$${drivePrice.toFixed(2)}</span>
      </div>

      <!-- Album Manifest Items -->
      <div class="sum-albums-list">
        ${selectedAlbumIds.map(id => {
          const alb = usbBuilder.getAlbumById ? usbBuilder.getAlbumById(id) : null;
          const title = alb ? alb.title : id;
          const price = alb ? alb.price : 19.99;
          const cover = alb ? alb.cover : '/riddim.jpg';
          const size = alb ? alb.sizeDisplay : '4.2 GB';
          return `
            <div class="sum-item-row">
              <img src="${cover}" alt="${title}" class="sum-album-thumb" onerror="this.src='/riddim.jpg'">
              <div class="sum-details">
                <span class="sum-title">${title}</span>
                <span class="sum-sub">${size} &bull; 320kbps MP3 & WAV</span>
              </div>
              <span class="sum-price">$${price.toFixed(2)}</span>
            </div>
          `;
        }).join('')}
      </div>

      <div class="sum-divider"></div>

      <!-- Pricing Breakdown -->
      <div class="sum-pricing">
        <div class="sum-price-row">
          <span>Metallic USB Drive (${tier.capacityGB}GB):</span>
          <span>$${drivePrice.toFixed(2)}</span>
        </div>
        <div class="sum-price-row">
          <span>Selected Albums (${selectedAlbumIds.length}):</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="sum-price-row">
          <span>Laser Engraving:</span>
          <span class="text-neon-cyan">FREE</span>
        </div>
        <div class="sum-price-row">
          <span>Express Worldwide Shipping:</span>
          <span class="text-green font-bold">FREE</span>
        </div>
        <div class="sum-price-row">
          <span>Estimated Sales Tax (10%):</span>
          <span>$${tax.toFixed(2)}</span>
        </div>
      </div>

      <div class="sum-divider thick"></div>

      <!-- Grand Total -->
      <div class="sum-total-row">
        <span>TOTAL TO PAY:</span>
        <span class="grand-total-amount">$${grandTotal.toFixed(2)}</span>
      </div>

      <!-- Submit Order Button -->
      <button type="submit" form="checkout-form" id="complete-order-btn" class="chk-cta-pay-btn">
        <span>🔒 COMPLETE ORDER & PAY $${grandTotal.toFixed(2)}</span>
      </button>

      <div class="chk-guarantee-note">
        🛡️ 30-Day Money-Back Guarantee &bull; Lifetime USB Drive Hardware Warranty
      </div>
    `;
  }

  // ── 4. Bind Events for Checkout Modal ────────────────────────────────────
  bindEvents() {
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    // Close button
    const closeBtn = document.getElementById('checkout-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.hide());

    // Same Billing Address Checkbox Toggle
    const sameBillingChk = document.getElementById('chk-same-billing');
    if (sameBillingChk) {
      sameBillingChk.addEventListener('change', (e) => {
        this.sameAsShipping = e.target.checked;
        const drawer = document.getElementById('chk-billing-fields');
        if (drawer) drawer.style.display = this.sameAsShipping ? 'none' : 'block';
      });
    }

    // Payment Method Selection Tabs
    const container = document.getElementById('payment-form-container');
    modal.addEventListener('click', (e) => {
      const payBtn = e.target.closest('[data-pay-method]');
      if (payBtn) {
        this.paymentMethod = payBtn.dataset.payMethod;
        const allPayBtns = modal.querySelectorAll('[data-pay-method]');
        allPayBtns.forEach(b => b.classList.toggle('active', b === payBtn));

        if (container) {
          container.innerHTML = this.renderPaymentForm(this.paymentMethod);
        }
      }
    });

    // Form Submit Handler -> Process Payment
    const form = document.getElementById('checkout-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.processPayment();
      });
    }
  }

  // ── 5. Payment Processing & Order Generation ─────────────────────────────
  processPayment() {
    // Read input fields
    const name = document.getElementById('chk-name').value.trim() || this.formData.fullName;
    const email = document.getElementById('chk-email').value.trim() || this.formData.email;
    const phone = document.getElementById('chk-phone').value.trim() || this.formData.phone;
    const address = document.getElementById('chk-address').value.trim() || this.formData.shippingAddress;
    const city = document.getElementById('chk-city').value.trim() || this.formData.city;
    const state = document.getElementById('chk-state').value.trim() || this.formData.state;
    const zip = document.getElementById('chk-zip').value.trim() || this.formData.zipCode;
    const country = document.getElementById('chk-country').value || this.formData.country;

    const tier = usbBuilder.selectedTier;
    const selectedAlbumIds = Array.from(usbBuilder.selectedAlbums);
    const subtotal = usbBuilder.calculateAlbumsSubtotal();
    const drivePrice = tier.price;
    const shipping = usbBuilder.calculateShipping();
    const tax = usbBuilder.calculateTax(subtotal + drivePrice);
    const grandTotal = subtotal + drivePrice + shipping + tax;
    const orderNum = this.generateOrderNumber();
    const txnId = this.generateTransactionId();
    const orderDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Store Order Object & Sync with Customer Account Dashboard (Prompt 12)
    this.currentOrder = {
      orderNumber: orderNum,
      transactionId: txnId,
      orderDate,
      customer: { name, email, phone },
      shippingAddress: { address, city, state, zip, country },
      billingAddress: this.sameAsShipping ? { address, city, state, zip, country } : {
        address: document.getElementById('chk-billing-address')?.value || address,
        city: document.getElementById('chk-billing-city')?.value || city,
        state: document.getElementById('chk-billing-state')?.value || state,
        zip: document.getElementById('chk-billing-zip')?.value || zip,
        country: document.getElementById('chk-country')?.value || country
      },
      paymentMethod: this.paymentMethod,
      tier,
      engravingText: usbBuilder.customEngravingText || 'ASSASSIN VIP 2026',
      albumIds: selectedAlbumIds,
      pricing: { subtotal, drivePrice, shipping, tax, grandTotal }
    };

    if (window.customerAccount) {
      window.customerAccount.addOrder(this.currentOrder);
    }

    // Hide Checkout Modal
    this.hide();

    // Show Order Confirmation Modal & Receipt
    this.showConfirmationModal(this.currentOrder);

    // Send Simulated Email Notification Toast
    this.sendConfirmationEmail(this.currentOrder);
  }

  // ── 6. Order Confirmation Page & Digital Printable Receipt ───────────────
  showConfirmationModal(order) {
    const confirmModal = document.getElementById('order-confirmation-modal');
    const container = document.getElementById('confirmation-container');
    if (!confirmModal || !container) return;

    const methodLabels = {
      'credit-card': '💳 Credit Card (Visa / Mastercard)',
      'stripe': '🟦 Stripe Direct Express',
      'paypal': '🟨 PayPal Buyer Protected',
      'apple-pay': '🍏 Apple Pay One-Touch',
      'google-pay': '🌐 Google Pay Express'
    };

    container.innerHTML = `
      <!-- CONFIRMATION HEADER -->
      <header class="confirm-header">
        <div class="confirm-success-icon">🎉</div>
        <span class="confirm-badge-granted">PAYMENT SUCCESSFUL &bull; VERIFIED VIP ORDER</span>
        <h2 class="confirm-title">THANK YOU FOR YOUR ORDER, ${order.customer.name.toUpperCase()}!</h2>
        <p class="confirm-sub">Your custom Chinese Assassin metallic USB drive is now entering custom laser engraving & high-speed preloading.</p>
      </header>

      <!-- ORDER HIGHLIGHTS BAR -->
      <div class="confirm-highlights-bar">
        <div class="conf-stat">
          <span class="conf-lbl">ORDER NUMBER</span>
          <span class="conf-val conf-order-num">${order.orderNumber}</span>
        </div>
        <div class="conf-stat">
          <span class="conf-lbl">TRANSACTION ID</span>
          <span class="conf-val conf-txn-id">${order.transactionId}</span>
        </div>
        <div class="conf-stat">
          <span class="conf-lbl">TOTAL AMOUNT PAID</span>
          <span class="conf-val conf-total">$${order.pricing.grandTotal.toFixed(2)}</span>
        </div>
        <div class="conf-stat">
          <span class="conf-lbl">ESTIMATED DELIVERY</span>
          <span class="conf-val conf-delivery">3 - 5 Business Days</span>
        </div>
      </div>

      <!-- PRODUCTION TRACKER PIPELINE -->
      <div class="production-tracker-box">
        <h4 class="tracker-title">⚙️ CUSTOM USB PRODUCTION & FULFILLMENT STATUS</h4>
        <div class="tracker-steps">
          <div class="t-step active">
            <span class="t-icon">✅</span>
            <span class="t-label">Order Confirmed</span>
          </div>
          <div class="t-step active">
            <span class="t-icon">⚡</span>
            <span class="t-label">Laser Engraving "${order.engravingText}"</span>
          </div>
          <div class="t-step active">
            <span class="t-icon">💾</span>
            <span class="t-label">320kbps WAV Pre-load</span>
          </div>
          <div class="t-step">
            <span class="t-icon">📦</span>
            <span class="t-label">DHL Express Shipment</span>
          </div>
        </div>
      </div>

      <!-- DIGITAL PRINTABLE RECEIPT CARD -->
      <div class="digital-receipt-card" id="printable-receipt-card">
        <header class="receipt-header">
          <div class="receipt-logo">
            <strong>CHINESE ASSASSIN</strong> <span>VIP UNIVERSE RECEIPT</span>
          </div>
          <div class="receipt-meta">
            <span>Date: ${order.orderDate}</span>
            <span>Order #: <strong>${order.orderNumber}</strong></span>
          </div>
        </header>

        <div class="receipt-section-grid">
          <div class="receipt-col">
            <strong>CUSTOMER INFO:</strong>
            <span>${order.customer.name}</span>
            <span>${order.customer.email}</span>
            <span>${order.customer.phone}</span>
          </div>

          <div class="receipt-col">
            <strong>SHIPPING ADDRESS:</strong>
            <span>${order.shippingAddress.address}</span>
            <span>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</span>
            <span>${order.shippingAddress.country}</span>
          </div>

          <div class="receipt-col">
            <strong>PAYMENT INFO:</strong>
            <span>${methodLabels[order.paymentMethod] || order.paymentMethod}</span>
            <span>Status: <strong style="color:#00d46a;">PAID & VERIFIED</strong></span>
            <span>Engraving: <strong>"${order.engravingText}"</strong></span>
          </div>
        </div>

        <table class="receipt-table">
          <thead>
            <tr>
              <th>ITEM DESCRIPTION</th>
              <th>QTY</th>
              <th>PRICE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${order.tier.name}</strong> (${order.tier.capacityGB} GB Metal Drive + Laser Engraving "${order.engravingText}")</td>
              <td>1</td>
              <td>$${order.tier.price.toFixed(2)}</td>
            </tr>
            ${order.albumIds.map(id => {
              const alb = usbBuilder.getAlbumById ? usbBuilder.getAlbumById(id) : null;
              const title = alb ? alb.title : id;
              const price = alb ? alb.price : 19.99;
              return `
                <tr>
                  <td>🎵 ${title} (Pre-loaded Uncompressed Audio Album)</td>
                  <td>1</td>
                  <td>$${price.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="receipt-totals-box">
          <div class="rc-row"><span>Subtotal:</span><span>$${(order.pricing.subtotal + order.pricing.drivePrice).toFixed(2)}</span></div>
          <div class="rc-row"><span>Shipping:</span><span style="color:#00d46a; font-weight:bold;">FREE</span></div>
          <div class="rc-row"><span>Tax (10%):</span><span>$${order.pricing.tax.toFixed(2)}</span></div>
          <div class="rc-row grand"><span>GRAND TOTAL PAID:</span><span>$${order.pricing.grandTotal.toFixed(2)}</span></div>
        </div>
      </div>

      <!-- CONFIRMATION ACTIONS -->
      <div class="confirm-actions-bar">
        <button id="print-receipt-btn" class="confirm-btn btn-secondary">🖨️ PRINT OFFICIAL RECEIPT</button>
        <button id="close-confirm-btn" class="confirm-btn btn-primary">RETURN TO VIP HOME</button>
      </div>
    `;

    confirmModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Print Receipt Event
    const printBtn = document.getElementById('print-receipt-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Close Confirmation Event
    const closeBtn = document.getElementById('close-confirm-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        confirmModal.style.display = 'none';
        document.body.style.overflow = '';
      });
    }
  }

  // ── 7. Send Simulated Confirmation Email Toast & Preview ────────────────
  sendConfirmationEmail(order) {
    const toast = document.getElementById('email-notification-toast');
    if (!toast) return;

    toast.innerHTML = `
      <div class="toast-card">
        <span class="toast-icon">📧</span>
        <div class="toast-body">
          <strong>CONFIRMATION EMAIL DISPATCHED</strong>
          <span>Order receipt #${order.orderNumber} sent to <strong>${order.customer.email}</strong></span>
        </div>
        <button id="toast-view-email-btn" class="toast-action-btn">VIEW EMAIL</button>
      </div>
    `;

    toast.style.display = 'block';

    if (window.gsap) {
      gsap.fromTo(toast,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }

    // View Email Action
    const viewEmailBtn = document.getElementById('toast-view-email-btn');
    if (viewEmailBtn) {
      viewEmailBtn.addEventListener('click', () => {
        alert(`📧 Simulated Email Sent to ${order.customer.email}\n\nSubject: Order Confirmation #${order.orderNumber} — Chinese Assassin VIP Universe\n\nDear ${order.customer.name},\nThank you for your order! Your metallic USB drive with laser engraving "${order.engravingText}" is being prepared.\n\nOrder Total: $${order.pricing.grandTotal.toFixed(2)}\nTracking: DHL Express (Notification SMS to ${order.customer.phone})\n\nOfficial Digital Receipt is attached to your account.`);
      });
    }

    // Auto hide toast after 8s
    setTimeout(() => {
      if (toast && window.gsap) {
        gsap.to(toast, {
          y: 50, opacity: 0, duration: 0.3, ease: 'power2.in',
          onComplete: () => { toast.style.display = 'none'; }
        });
      }
    }, 8000);
  }

  // ── Show / Hide Checkout Modal ───────────────────────────────────────────
  show() {
    this.initDOM();
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      const summaryPanel = document.getElementById('checkout-summary-panel');
      if (summaryPanel) summaryPanel.innerHTML = this.renderOrderSummaryPanel();
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  hide() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }
}

export const checkoutEngine = new CheckoutEngine();
window.checkoutEngine = checkoutEngine;
