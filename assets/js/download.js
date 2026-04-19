/* ============================================
   RBS — Download Flow & Donation Popup
   v4.0
   - Intercepts download button clicks
   - Shows animated progress overlay
   - Triggers actual file download
   - Shows post-download popup: donate + newsletter (every download)
   - Increments download counter
   ============================================ */

(function () {
  'use strict';

  /* ── Popup settings ── */
  function getPopupSettings() {
    try {
      const s = JSON.parse(localStorage.getItem('rbs_popup_settings') || 'null');
      if (s) return s;
    } catch (_) {}
    return {
      enabled: true,
      title: 'Download Started!',
      subtitle: 'Rare Build Software is 100% free — no strings attached.\nIf this tool helped you, consider supporting development ❤',
      showDonation: true,
      showNewsletter: true,
      newsletterTitle: 'Stay Updated',
      newsletterSubtitle: 'Get notified about new Rare Build Software releases. No spam.'
    };
  }

  /* ── QR generator URL from address ── */
  function qrFromAddress(address) {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(address);
  }

  /* ── Donation data ── */
  function getDonation() {
    try {
      const d = JSON.parse(localStorage.getItem('rbs_donation') || 'null');
      if (d && (Array.isArray(d.buttons) || Array.isArray(d.crypto))) return d;
    } catch (_) {}
    const btcAddress = '36boft8xKukMQeTZpWNjJfVxGS2kA3uzjY';
    const ethAddress = '0x3C8D5bf5c5c78B73814B17d61d9b2b39D722132c';
    return {
      buttons: [
        { id: 'kofi', label: 'Buy Me a Coffee on Ko-fi', url: 'https://ko-fi.com/rbsshop/tip',
          icon: '☕', color: '#ff5e5b', visible: true }
      ],
      crypto: [
        { id: 'btc', coin: 'Bitcoin', symbol: 'BTC', network: 'Bitcoin Mainnet',
          address: btcAddress,
          qr: qrFromAddress(btcAddress), visible: true },
        { id: 'eth', coin: 'Ethereum', symbol: 'ETH', network: 'ERC-20',
          address: ethAddress,
          qr: qrFromAddress(ethAddress), visible: true }
      ]
    };
  }

  /* ── Resolve QR image path ── */
  function resolveQr(qr) {
    if (!qr) return null;
    if (qr.startsWith('data:') || qr.startsWith('http')) return qr;
    /* If on detail page (under /software/) adjust path */
    if (location.pathname.includes('/software/')) {
      return '../' + qr.replace(/^\//, '');
    }
    return qr.replace(/^\//, '');
  }

  /* ── Counter ── */
  function incrementCounter() {
    const n = parseInt(localStorage.getItem('rbs_dl_count') || '0', 10) + 1;
    localStorage.setItem('rbs_dl_count', n);
    document.querySelectorAll('.rbs-dl-counter').forEach(el => { el.textContent = n.toLocaleString(); });
    const hc = document.getElementById('download-count');
    if (hc) { hc.dataset.target = n; }
    if (window.rbsSiteData) window.rbsSiteData.updateCounterDisplay();
    return n;
  }

  /* ── Copy to clipboard ── */
  function copyText(text, btn) {
    const orig = btn.textContent;
    const doFallback = () => {
      const ta = Object.assign(document.createElement('textarea'), {
        value: text, style: 'position:fixed;left:-9999px'
      });
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    };
    (navigator.clipboard ? navigator.clipboard.writeText(text).catch(doFallback) : Promise.resolve(doFallback()))
      .finally(() => {
        btn.textContent = '✓ Copied!';
        btn.style.background = 'rgba(0,208,132,.2)';
        btn.style.color = '#00d084';
        setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.style.color = ''; }, 2200);
      });
  }

  /* ══════════════════════════════════════════════════
     INJECT STYLES + HTML
  ══════════════════════════════════════════════════ */
  function inject() {
    const style = document.createElement('style');
    style.textContent = `
      /* ─── Overlay backdrop ─── */
      .rbs-modal-backdrop {
        position: fixed; inset: 0; z-index: 9000;
        background: rgba(0,0,0,.78); backdrop-filter: blur(10px);
        display: flex; align-items: center; justify-content: center;
        padding: 16px; opacity: 0; visibility: hidden;
        transition: opacity .35s ease, visibility .35s ease;
      }
      .rbs-modal-backdrop.rbs-open { opacity: 1; visibility: visible; }

      /* ─── Download progress box ─── */
      .rbs-dl-box {
        background: #16213e; border: 1px solid rgba(0,102,255,.3);
        border-radius: 20px; padding: 48px 40px; width: 100%; max-width: 460px;
        text-align: center; box-shadow: 0 24px 80px rgba(0,0,0,.6);
        transform: translateY(24px) scale(.96);
        transition: transform .4s cubic-bezier(.34,1.56,.64,1);
      }
      .rbs-modal-backdrop.rbs-open .rbs-dl-box { transform: translateY(0) scale(1); }
      .rbs-dl-icon-wrap {
        width: 72px; height: 72px; border-radius: 20px; margin: 0 auto 20px;
        background: linear-gradient(135deg,#0066ff,#4d94ff);
        display: flex; align-items: center; justify-content: center;
        font-size: 2rem; box-shadow: 0 4px 24px rgba(0,102,255,.4);
        animation: rbs-bounce .6s ease infinite alternate;
      }
      @keyframes rbs-bounce { from { transform: translateY(0); } to { transform: translateY(-6px); } }
      .rbs-dl-title  { font-size: 1.35rem; font-weight: 800; color: #fff; margin-bottom: 6px; }
      .rbs-dl-subtitle { font-size: .9rem; color: #b0b8c8; margin-bottom: 28px; }
      .rbs-progress-track {
        background: rgba(255,255,255,.08); border-radius: 8px;
        height: 10px; overflow: hidden; margin-bottom: 12px;
      }
      .rbs-progress-fill {
        height: 100%; width: 0%; border-radius: 8px;
        background: linear-gradient(90deg,#0066ff,#4d94ff);
        transition: width .4s ease; box-shadow: 0 0 12px rgba(0,102,255,.5);
      }
      .rbs-progress-label { font-size: .82rem; color: #6b7a99; margin-bottom: 24px; }
      .rbs-dl-cancel {
        background: none; border: none; color: #6b7a99; font-size: .82rem;
        cursor: pointer; padding: 6px 12px; border-radius: 6px;
        transition: color .2s, background .2s; font-family: inherit;
      }
      .rbs-dl-cancel:hover { color: #b0b8c8; background: rgba(255,255,255,.05); }

      /* ─── Main popup box ─── */
      .rbs-popup-box {
        background: #16213e; border: 1px solid rgba(0,102,255,.2);
        border-radius: 20px; width: 100%; max-width: 600px;
        box-shadow: 0 28px 90px rgba(0,0,0,.7);
        transform: translateY(24px) scale(.96);
        transition: transform .4s cubic-bezier(.34,1.56,.64,1);
        max-height: 92vh; overflow-y: auto; position: relative;
      }
      .rbs-modal-backdrop.rbs-open .rbs-popup-box { transform: translateY(0) scale(1); }
      .rbs-popup-box::-webkit-scrollbar { width: 4px; }
      .rbs-popup-box::-webkit-scrollbar-track { background: transparent; }
      .rbs-popup-box::-webkit-scrollbar-thumb { background: rgba(0,102,255,.35); border-radius: 2px; }

      /* X close button */
      .rbs-popup-close {
        position: absolute; top: 14px; right: 14px;
        width: 34px; height: 34px; border-radius: 50%;
        background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1);
        color: #8896aa; font-size: 1.1rem; line-height: 1;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all .2s; z-index: 10;
        font-family: inherit;
      }
      .rbs-popup-close:hover { background: rgba(255,255,255,.14); color: #fff; }

      /* ─── Header section ─── */
      .rbs-popup-head {
        padding: 40px 40px 28px;
        background: linear-gradient(180deg, rgba(0,102,255,.08) 0%, transparent 100%);
        text-align: center;
      }
      .rbs-popup-check {
        width: 68px; height: 68px;
        background: linear-gradient(135deg,#00d084,#00a866);
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        font-size: 2rem; margin: 0 auto 18px;
        box-shadow: 0 6px 24px rgba(0,208,132,.35);
        animation: rbs-pop .5s cubic-bezier(.34,1.56,.64,1) both;
      }
      @keyframes rbs-pop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      .rbs-popup-title {
        font-size: 1.3rem; font-weight: 800; color: #fff;
        margin: 0 0 10px; letter-spacing: -.3px;
      }
      .rbs-popup-subtitle { font-size: .92rem; color: #b0b8c8; line-height: 1.65; margin: 0; }

      /* ─── Divider ─── */
      .rbs-popup-divider {
        border: none; border-top: 1px solid rgba(255,255,255,.07); margin: 0;
      }

      /* ─── Section wrapper ─── */
      .rbs-popup-section { padding: 28px 36px; }
      .rbs-popup-section + .rbs-popup-divider + .rbs-popup-section { padding-top: 28px; }

      /* Section label */
      .rbs-section-label {
        font-size: .72rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 1.4px; color: #6b7a99; text-align: center;
        margin: 0 0 18px;
      }

      /* ─── Donate buttons ─── */
      .rbs-donate-btns-wrap {
        display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;
      }
      .rbs-donate-btn-item {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 12px 22px; border-radius: 10px; font-size: .9rem;
        font-weight: 700; color: #fff; text-decoration: none;
        cursor: pointer; transition: opacity .2s, transform .2s;
        font-family: inherit; border: none; width: 100%; justify-content: center;
        box-sizing: border-box;
      }
      .rbs-donate-btn-item:hover { opacity: .88; transform: translateY(-2px); }

      /* ─── Crypto cards ─── */
      .rbs-crypto-grid {
        display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        margin-top: 4px;
      }
      @media (max-width: 480px) { .rbs-crypto-grid { grid-template-columns: 1fr; } }

      .rbs-crypto-card {
        background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09);
        border-radius: 12px; padding: 20px 16px 16px;
        display: flex; flex-direction: column; align-items: center; gap: 0;
        transition: border-color .25s, box-shadow .25s, transform .25s;
        text-align: center;
      }
      .rbs-crypto-card:hover {
        border-color: rgba(0,102,255,.4);
        box-shadow: 0 6px 24px rgba(0,102,255,.15);
        transform: translateY(-2px);
      }

      .rbs-cc-icon {
        width: 40px; height: 40px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.3rem; font-weight: 900; margin-bottom: 10px;
      }
      .rbs-cc-icon.btc { background: rgba(247,147,26,.15); color: #f7931a; }
      .rbs-cc-icon.eth { background: rgba(98,126,234,.15); color: #627eea; }
      .rbs-cc-icon.default { background: rgba(255,255,255,.08); color: #b0b8c8; }

      .rbs-cc-coin  { font-size: .9rem; font-weight: 700; color: #fff; margin-bottom: 2px; }
      .rbs-cc-net   { font-size: .72rem; color: #6b7a99; margin-bottom: 14px; }

      .rbs-cc-qr-label { font-size: .7rem; color: #6b7a99; margin-bottom: 6px; letter-spacing: .4px; }
      .rbs-cc-qr {
        width: 120px; height: 120px; object-fit: contain;
        border-radius: 8px; background: #fff; padding: 6px;
        display: block; margin-bottom: 14px; box-shadow: 0 2px 12px rgba(0,0,0,.3);
      }
      .rbs-cc-qr-placeholder {
        width: 120px; height: 120px; border-radius: 8px;
        background: rgba(255,255,255,.06); border: 1px dashed rgba(255,255,255,.15);
        display: flex; align-items: center; justify-content: center;
        color: #6b7a99; font-size: .7rem; text-align: center; padding: 10px;
        box-sizing: border-box; margin-bottom: 14px; line-height: 1.4;
      }
      .rbs-cc-addr {
        font-family: 'Cascadia Code','Consolas','Courier New',monospace;
        font-size: .62rem; color: #8896aa; word-break: break-all;
        background: rgba(0,0,0,.25); border-radius: 6px; padding: 7px 9px;
        line-height: 1.55; width: 100%; box-sizing: border-box; margin-bottom: 10px;
        text-align: center;
      }
      .rbs-cc-btn {
        width: 100%; padding: 9px 14px; border-radius: 8px;
        font-size: .8rem; font-weight: 700; cursor: pointer;
        border: 1px solid rgba(0,102,255,.3); font-family: inherit;
        background: rgba(0,102,255,.12); color: #4d94ff;
        transition: background .2s, border-color .2s;
      }
      .rbs-cc-btn:hover { background: rgba(0,102,255,.22); border-color: rgba(0,102,255,.5); }

      /* ─── Newsletter section ─── */
      .rbs-nl-title { font-size: 1rem; font-weight: 700; color: #fff; text-align: center; margin: 0 0 6px; }
      .rbs-nl-sub   { font-size: .88rem; color: #b0b8c8; text-align: center; margin: 0 0 18px; line-height: 1.55; }
      .rbs-nl-fields { display: flex; flex-direction: column; gap: 10px; }
      .rbs-nl-input {
        background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.11);
        border-radius: 9px; padding: 11px 15px; font-size: .9rem; color: #fff;
        font-family: inherit; width: 100%; box-sizing: border-box;
        transition: border-color .2s;
      }
      .rbs-nl-input::placeholder { color: #6b7a99; }
      .rbs-nl-input:focus { outline: none; border-color: rgba(0,102,255,.5); }
      .rbs-nl-btn {
        background: linear-gradient(135deg,#0066ff,#4d94ff); color: #fff;
        border: none; border-radius: 9px; padding: 12px 20px;
        font-size: .92rem; font-weight: 700; cursor: pointer;
        font-family: inherit; transition: opacity .2s, transform .2s;
      }
      .rbs-nl-btn:hover { opacity: .88; transform: translateY(-1px); }
      .rbs-nl-success {
        display: none; text-align: center; color: #00d084;
        font-size: .9rem; font-weight: 600; padding: 10px 0;
      }

      /* ─── Skip / bottom ─── */
      .rbs-popup-skip-wrap { padding: 0 36px 28px; text-align: center; }
      .rbs-popup-skip {
        background: none; border: none; color: #6b7a99; font-size: .82rem;
        cursor: pointer; padding: 6px 14px; border-radius: 6px;
        font-family: inherit; transition: color .2s;
      }
      .rbs-popup-skip:hover { color: #b0b8c8; }
    `;
    document.head.appendChild(style);

    /* ── Download Progress Overlay ── */
    const dlOverlay = document.createElement('div');
    dlOverlay.id = 'rbs-dl-overlay';
    dlOverlay.className = 'rbs-modal-backdrop';
    dlOverlay.setAttribute('role', 'dialog');
    dlOverlay.setAttribute('aria-modal', 'true');
    dlOverlay.setAttribute('aria-label', 'Downloading');
    dlOverlay.innerHTML = `
      <div class="rbs-dl-box">
        <div class="rbs-dl-icon-wrap">⬇</div>
        <h2 class="rbs-dl-title" id="rbs-dl-title-text">Starting Download…</h2>
        <p class="rbs-dl-subtitle" id="rbs-dl-subtitle-text">Preparing your file…</p>
        <div class="rbs-progress-track">
          <div class="rbs-progress-fill" id="rbs-prog-fill"></div>
        </div>
        <p class="rbs-progress-label" id="rbs-prog-label">0%</p>
        <button class="rbs-dl-cancel" id="rbs-dl-cancel-btn">Cancel</button>
      </div>`;
    document.body.appendChild(dlOverlay);

    /* ── Donation + Newsletter Popup ── */
    const donateOverlay = document.createElement('div');
    donateOverlay.id = 'rbs-donate-overlay';
    donateOverlay.className = 'rbs-modal-backdrop';
    donateOverlay.setAttribute('role', 'dialog');
    donateOverlay.setAttribute('aria-modal', 'true');
    donateOverlay.setAttribute('aria-label', 'Support RBS');
    const ps = getPopupSettings();
    const subtitleLines = (ps.subtitle || '').split('\n').join('<br>');

    donateOverlay.innerHTML = `
      <div class="rbs-popup-box">

        <!-- X close -->
        <button class="rbs-popup-close" id="rbs-popup-close-btn" aria-label="Close">✕</button>

        <!-- Header -->
        <div class="rbs-popup-head">
          <div class="rbs-popup-check">✓</div>
          <h2 class="rbs-popup-title" id="rbs-popup-sw-title">${ps.title || 'Download Started!'}</h2>
          <p class="rbs-popup-subtitle" id="rbs-popup-subtitle-text">${subtitleLines}</p>
        </div>

        <hr class="rbs-popup-divider">

        <!-- Donation section (dynamically filled) -->
        <div id="rbs-popup-donate-section" style="${ps.showDonation === false ? 'display:none' : ''}">
          <!-- filled by renderDonateSection() -->
        </div>

        <hr class="rbs-popup-divider" id="rbs-nl-divider" style="${ps.showNewsletter === false || ps.showDonation === false ? 'display:none' : ''}">

        <!-- Newsletter section -->
        <div class="rbs-popup-section" id="rbs-popup-nl-section" style="${ps.showNewsletter === false ? 'display:none' : ''}">
          <p class="rbs-section-label">📬 Stay Updated</p>
          <p class="rbs-nl-title" id="rbs-nl-title-el">${ps.newsletterTitle || 'Stay Updated'}</p>
          <p class="rbs-nl-sub"   id="rbs-nl-sub-el">${ps.newsletterSubtitle || 'Get notified about new Rare Build Software releases. No spam.'}</p>
          <div class="rbs-nl-fields" id="rbs-nl-fields">
            <input type="text"  class="rbs-nl-input" id="rbs-nl-name"  placeholder="Your name (optional)" autocomplete="name">
            <input type="email" class="rbs-nl-input" id="rbs-nl-email" placeholder="Email address *" autocomplete="email">
            <button class="rbs-nl-btn" id="rbs-nl-btn">Subscribe →</button>
          </div>
          <div class="rbs-nl-success" id="rbs-nl-success">✅ Subscribed! We'll keep you updated.</div>
        </div>

        <!-- Skip link -->
        <div class="rbs-popup-skip-wrap">
          <button class="rbs-popup-skip" id="rbs-popup-skip">Skip for now</button>
        </div>

      </div>`;
    document.body.appendChild(donateOverlay);

    /* ── Wire up buttons ── */
    document.getElementById('rbs-dl-cancel-btn').addEventListener('click', closeDownloadOverlay);
    document.getElementById('rbs-popup-close-btn').addEventListener('click', closeDonatePopup);
    document.getElementById('rbs-popup-skip').addEventListener('click', closeDonatePopup);

    /* Newsletter subscribe */
    document.getElementById('rbs-nl-btn').addEventListener('click', function () {
      const emailEl = document.getElementById('rbs-nl-email');
      const nameEl  = document.getElementById('rbs-nl-name');
      const email   = emailEl ? emailEl.value.trim() : '';
      const name    = nameEl  ? nameEl.value.trim()  : '';
      if (window.rbsSubscribeEmail && window.rbsSubscribeEmail(email, name)) {
        document.getElementById('rbs-nl-fields').style.display  = 'none';
        document.getElementById('rbs-nl-success').style.display = 'block';
        const skip = document.getElementById('rbs-popup-skip');
        if (skip) skip.textContent = 'Close';
      } else {
        if (emailEl) {
          emailEl.style.borderColor = '#ff4d4d';
          setTimeout(() => { emailEl.style.borderColor = ''; }, 2000);
        }
      }
    });

    /* Close on backdrop click */
    donateOverlay.addEventListener('click', e => { if (e.target === donateOverlay) closeDonatePopup(); });

    /* Expose copy helper */
    window._rbsDlCopy = function (btn) { copyText(btn.dataset.copy, btn); };
  }

  /* ── Build QR block ── */
  function buildQrBlock(qrSrc, coinName, address) {
    if (!qrSrc) {
      /* Generate from address as last resort */
      if (address) qrSrc = qrFromAddress(address);
      else return `<div class="rbs-cc-qr-placeholder">QR Code</div>`;
    }
    /* onerror: try generating from address before giving up */
    const fallbackSrc = address ? qrFromAddress(address) : '';
    const onerrorAttr = fallbackSrc
      ? `onerror="if(this.src!=='${fallbackSrc}'){this.src='${fallbackSrc}'}else{this.outerHTML='<div class=\\'rbs-cc-qr-placeholder\\'>QR Code</div>'}"`
      : `onerror="this.outerHTML='<div class=\\'rbs-cc-qr-placeholder\\'>QR Code</div>'"`;
    return `
      <p class="rbs-cc-qr-label">Scan to send</p>
      <img src="${qrSrc}" alt="${coinName} QR code" class="rbs-cc-qr" ${onerrorAttr}>`;
  }

  /* ── Fill donate section ── */
  function renderDonateSection() {
    const wrapper = document.getElementById('rbs-popup-donate-section');
    if (!wrapper) return;

    const ps = getPopupSettings();
    if (ps.showDonation === false) { wrapper.style.display = 'none'; return; }
    wrapper.style.display = '';

    const data         = getDonation();
    const visibleBtns  = (data.buttons || []).filter(b => b.visible !== false);
    const visibleCrypto = (data.crypto  || []).filter(c => c.visible !== false);

    if (!visibleBtns.length && !visibleCrypto.length) { wrapper.innerHTML = ''; return; }

    let html = '<div class="rbs-popup-section">';
    html += '<p class="rbs-section-label">Support Us</p>';

    /* Donation buttons */
    if (visibleBtns.length) {
      html += '<div class="rbs-donate-btns-wrap">';
      html += visibleBtns.map(b =>
        `<a href="${b.url}" target="_blank" rel="noopener" class="rbs-donate-btn-item"
           style="background:${b.color || '#00c896'};">${b.icon || '❤'} ${b.label}</a>`
      ).join('');
      html += '</div>';
    }

    /* Crypto cards */
    if (visibleCrypto.length) {
      if (visibleBtns.length) html += '<div style="margin-top:22px;"></div>';
      html += '<p class="rbs-section-label" style="margin-bottom:14px;">Crypto Donations</p>';
      html += '<div class="rbs-crypto-grid">';
      html += visibleCrypto.map(c => {
        const isBtc = /bitcoin/i.test(c.coin);
        const isEth = /ethereum|ether/i.test(c.coin);
        const iconClass = isBtc ? 'btc' : isEth ? 'eth' : 'default';
        const iconChar  = isBtc ? '₿' : isEth ? 'Ξ' : '🪙';
        const qrSrc     = resolveQr(c.qr);
        const symbol    = c.symbol || '';
        const network   = c.network || '';

        return `
          <div class="rbs-crypto-card">
            <div class="rbs-cc-icon ${iconClass}">${iconChar}</div>
            <div class="rbs-cc-coin">${c.coin}${symbol ? ' ' + symbol : ''}</div>
            <div class="rbs-cc-net">${network}</div>
            ${buildQrBlock(qrSrc, c.coin, c.address)}
            <div class="rbs-cc-addr">${c.address}</div>
            <button class="rbs-cc-btn" data-copy="${c.address}" onclick="window._rbsDlCopy(this)">Copy Address</button>
          </div>`;
      }).join('');
      html += '</div>';
    }

    html += '</div>'; /* end .rbs-popup-section */
    wrapper.innerHTML = html;

    /* Sync newsletter visibility */
    const nlSection = document.getElementById('rbs-popup-nl-section');
    const nlDivider = document.getElementById('rbs-nl-divider');
    const nlTitle   = document.getElementById('rbs-nl-title-el');
    const nlSub     = document.getElementById('rbs-nl-sub-el');
    if (nlSection) nlSection.style.display = (ps.showNewsletter === false) ? 'none' : '';
    if (nlDivider) nlDivider.style.display = (ps.showNewsletter === false || ps.showDonation === false) ? 'none' : '';
    if (nlTitle && ps.newsletterTitle)    nlTitle.textContent = ps.newsletterTitle;
    if (nlSub   && ps.newsletterSubtitle) nlSub.textContent   = ps.newsletterSubtitle;
  }

  /* ── Overlay helpers ── */
  function openOverlay(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('rbs-open'); document.body.style.overflow = 'hidden'; }
  }
  function closeOverlay(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('rbs-open'); document.body.style.overflow = ''; }
  }

  let _cancelDownload = false;

  function closeDownloadOverlay() {
    _cancelDownload = true;
    closeOverlay('rbs-dl-overlay');
  }
  function closeDonatePopup() {
    closeOverlay('rbs-donate-overlay');
  }

  /* ── Reset newsletter for fresh show ── */
  function resetNewsletter() {
    const fields  = document.getElementById('rbs-nl-fields');
    const success = document.getElementById('rbs-nl-success');
    const skip    = document.getElementById('rbs-popup-skip');
    const email   = document.getElementById('rbs-nl-email');
    const name    = document.getElementById('rbs-nl-name');
    if (fields)  fields.style.display  = 'flex';
    if (success) success.style.display = 'none';
    if (skip)    skip.textContent      = 'Skip for now';
    if (email)   email.value           = '';
    if (name)    name.value            = '';
  }

  /* ══════════════════════════════════════════════════
     DOWNLOAD FLOW
  ══════════════════════════════════════════════════ */
  function handleDownload(url, softwareName, version) {
    _cancelDownload = false;

    /* Update popup title */
    const titleEl = document.getElementById('rbs-popup-sw-title');
    if (titleEl) titleEl.textContent = `Thank you for downloading ${softwareName}!`;

    /* Render fresh donation data */
    renderDonateSection();

    /* Increment counter */
    incrementCounter();

    /* Show progress overlay */
    const titleTxt = document.getElementById('rbs-dl-title-text');
    const subTxt   = document.getElementById('rbs-dl-subtitle-text');
    const fill     = document.getElementById('rbs-prog-fill');
    const label    = document.getElementById('rbs-prog-label');
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (titleTxt) titleTxt.textContent = `Downloading ${softwareName}`;
    if (subTxt)   subTxt.textContent   = isIos ? `v${version} — tap the file to save it` : `v${version} — please wait…`;
    if (fill)     fill.style.width     = '0%';
    if (label)    label.textContent    = '0%';
    openOverlay('rbs-dl-overlay');

    /* Trigger actual file download */
    if (url && url !== '#') {
      /* iOS Safari ignores 'download' attr for cross-origin URLs — detect and open in tab instead */
      const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const isCrossOrigin = (() => { try { return new URL(url).origin !== location.origin; } catch(_) { return false; } })();
      if (isIos && isCrossOrigin) {
        /* Open GitHub release page — user taps the asset to download */
        window.open(url, '_blank', 'noopener');
      } else {
        const a = Object.assign(document.createElement('a'), {
          href: url, download: '', style: 'display:none'
        });
        document.body.appendChild(a); a.click();
        setTimeout(() => document.body.removeChild(a), 200);
      }
    }

    /* Animate progress bar */
    const steps = [
      { pct: 12,  delay:    0, msg: 'Connecting…'   },
      { pct: 28,  delay:  500, msg: 'Downloading…'  },
      { pct: 45,  delay: 1200, msg: 'Downloading…'  },
      { pct: 63,  delay: 2000, msg: 'Almost there…' },
      { pct: 80,  delay: 3000, msg: 'Finishing up…' },
      { pct: 94,  delay: 3800, msg: 'Almost done…'  },
      { pct: 100, delay: 4600, msg: 'Complete!'     }
    ];
    steps.forEach(({ pct, delay, msg }) => {
      setTimeout(() => {
        if (_cancelDownload) return;
        if (fill)  fill.style.width  = pct + '%';
        if (label) label.textContent = pct + '%';
        if (subTxt && msg) subTxt.textContent = msg;
      }, delay);
    });

    /* At 5.2s: close progress → show donation+newsletter popup */
    setTimeout(() => {
      if (_cancelDownload) return;
      closeOverlay('rbs-dl-overlay');
      const ps = getPopupSettings();
      if (ps.enabled !== false) {
        resetNewsletter();
        setTimeout(() => openOverlay('rbs-donate-overlay'), 300);
      }
    }, 5200);
  }

  /* ══════════════════════════════════════════════════
     EVENT DELEGATION — intercept all download buttons
  ══════════════════════════════════════════════════ */
  function bindClicks() {
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-download-trigger]');
      if (!btn) return;
      const url  = btn.dataset.downloadUrl  || btn.getAttribute('href') || '#';
      const name = btn.dataset.softwareName || 'RBS';
      const ver  = btn.dataset.version      || '1.0.0';
      e.preventDefault();
      handleDownload(url, name, ver);
    }, true);
  }

  /* ── Keyboard: Escape to close ── */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('rbs-dl-overlay')?.classList.contains('rbs-open')) {
      closeDownloadOverlay();
    } else if (document.getElementById('rbs-donate-overlay')?.classList.contains('rbs-open')) {
      closeDonatePopup();
    }
  });

  /* ── Init ── */
  function init() { inject(); bindClicks(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
