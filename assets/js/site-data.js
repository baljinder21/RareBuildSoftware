/* ============================================
   RBS — Dynamic Site Data Engine v3
   Reads from localStorage (written by admin panel)
   Falls back to data/*.json files.
   Patches the DOM on every page load.
   ============================================ */
(function () {
  'use strict';

  /* ── Storage helpers ── */
  function loadLS(key, fallback) {
    try {
      const v = localStorage.getItem('rbs_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch (_) { return fallback; }
  }

  /* ── Defaults ── */
  const DEFAULT_SOFTWARE = [
    {
      id: 'rbs-optimizer-pro',
      name: 'RBS Optimizer Pro',
      icon: '🔧',
      version: '1.0.0',
      category: 'Optimization',
      categories: ['Optimization', 'System Tools'],
      description: 'The ultimate free Windows optimization suite. Clean junk files, manage startup programs, boost performance, and monitor your system in real time — all in one polished application.',
      fileSize: '~23 MB',
      downloadUrl: 'https://github.com/baljinder21/RBSsoftware/releases/download/v1.0.0/RBSOptimizerProRelease.zip',
      downloadType: 'external',
      screenshot: null,
      screenshotPath: '',
      visible: true,
      released: '2025-01-01',
      downloads: 0,
      features: [
        { icon: '🧹', title: 'Deep Junk Cleaner',   desc: 'Remove temporary files, cache, and old logs safely and automatically.' },
        { icon: '🚀', title: 'Startup Manager',      desc: 'Control which programs launch at startup to reduce boot time.' },
        { icon: '📊', title: 'Performance Monitor',  desc: 'Real-time graphs for CPU, RAM, and disk usage.' },
        { icon: '⚙️', title: 'One-Click Optimize',   desc: 'Single button runs a full system tune-up — clean, optimize, boost.' },
        { icon: '🛡️', title: 'Privacy First',        desc: 'No telemetry, no data collection, no internet required.' },
        { icon: '🎨', title: 'Modern Interface',     desc: 'Clean dark-themed UI, intuitive for beginners and advanced users.' }
      ],
      sysReqs: [
        'Windows 10 or Windows 11 (64-bit)',
        '50 MB free disk space',
        '2 GB RAM minimum (4 GB recommended)',
        '1 GHz or faster processor',
        'No internet required to run',
        'Administrator rights for full features'
      ],
      changelog: [
        { version: '1.0.0', date: '2025-01-01', notes: ['Initial release', 'Junk cleaner, startup manager, performance monitor', 'One-click optimize mode', 'Dark mode UI'] }
      ]
    },
    {
      id: 'rbs-voice-cloner',
      name: 'RBS Voice Cloner',
      icon: '🎤',
      version: '1.0.0',
      category: 'AI Tools',
      categories: ['AI Tools', 'Audio'],
      description: 'Clone any voice with just a 5-second audio sample. Powered by XTTS v2 AI engine, generate natural-sounding speech in 28+ languages — completely free, runs locally on your PC.',
      fileSize: '~248 MB',
      downloadUrl: 'https://github.com/baljinder21/RBSsoftware/releases/download/v1.0.0/RBSVoiceCloner_Setup.zip',
      downloadType: 'external',
      screenshot: null,
      screenshotPath: '',
      visible: true,
      released: '2026-04-12',
      downloads: 0,
      features: [
        { icon: '🎙️', title: 'Voice Cloning',    desc: 'Clone any voice from a 5-30 second audio sample with stunning realism using XTTS v2.' },
        { icon: '🌍', title: '28+ Languages',     desc: 'Generate speech in English, Spanish, French, German, Hindi, Japanese, Chinese, and many more.' },
        { icon: '📝', title: 'Text to Speech',    desc: 'Convert any text to natural speech using your cloned voice profiles.' },
        { icon: '🎚️', title: 'Audio Editor',      desc: 'Built-in audio editor with waveform view, trim, noise reduction and pitch control.' },
        { icon: '⚡', title: 'GPU Accelerated',   desc: 'Runs on your RTX GPU via CUDA for ultra-fast generation — CPU fallback for other PCs.' },
        { icon: '🔒', title: '100% Offline',      desc: 'After the first model download, everything runs locally. No cloud, no data sent anywhere.' }
      ],
      sysReqs: [
        'Windows 10 or Windows 11 (64-bit)',
        '8 GB RAM minimum (16 GB recommended)',
        '4 GB free disk space (10 GB recommended for models)',
        'Internet connection required for first-time model download (~2 GB)',
        'NVIDIA GPU with CUDA recommended (CPU works but slower)',
        'Administrator rights for installation'
      ],
      changelog: [
        { version: '1.0.0', date: '2026-04-12', notes: ['Initial release', 'XTTS v2 voice cloning engine', '28+ language support', 'Built-in audio editor', 'Batch processing', 'GPU acceleration via CUDA'] }
      ]
    },
    {
      id: 'life-dashboard',
      name: 'Life Dashboard',
      icon: '📅',
      version: '1.0.0',
      category: 'Productivity',
      categories: ['Productivity', 'Lifestyle'],
      description: 'Your all-in-one personal productivity command center. 16 powerful widgets — track habits, tasks, finances, weather, sleep, diet and more — all in one beautiful dashboard.',
      fileSize: '~104 MB',
      downloadUrl: 'https://github.com/baljinder21/RBSsoftware/releases/download/v1.0.0/Life.Dashboard.Setup.1.0.0.zip',
      downloadType: 'external',
      screenshot: null,
      screenshotPath: '',
      visible: true,
      released: '2026-04-14',
      downloads: 0,
      features: [
        { icon: '✅', title: 'Tasks & Habits',   desc: 'To-do list with priorities and a daily habit tracker with streak counter to keep you on track.' },
        { icon: '💰', title: 'Finance Tracker',  desc: 'Log income and expenses with visual charts to understand where your money goes.' },
        { icon: '🌤️', title: 'Live Weather',     desc: 'Real-time weather with a 3-day forecast for any city in the world.' },
        { icon: '🎯', title: 'Goals & Countdown','desc': 'Set long-term goals with progress bars and count down to important events.' },
        { icon: '🍎', title: 'Health Tracking',  desc: 'Track water intake, sleep quality, and diet plans with country-based meal templates.' },
        { icon: '🧩', title: '16 Widgets',       desc: 'Clock, calendar, notes, Pomodoro timer, RSS news, quick links, motivational quotes and more.' }
      ],
      sysReqs: [
        'Windows 10 or Windows 11 (64-bit)',
        '100 MB free disk space',
        '4 GB RAM minimum',
        'Internet connection for weather and news widgets',
        'No administrator rights required'
      ],
      changelog: [
        { version: '1.0.0', date: '2026-04-14', notes: ['Initial release', '16 widgets including tasks, habits, finance, weather, sleep, diet', 'Drag and resize widgets', 'All data saved locally'] }
      ]
    }
  ];

  const DEFAULT_CONTENT = {
    hero: {
      tag:         '3 Free Windows Apps — No Subscriptions, Ever',
      titleLine1:  'Free Windows Software',
      titleLine2:  'for Everyone',
      description: 'RBS builds free, powerful tools designed for everyone. No subscriptions, no paywalls — just high-quality software that gets the job done.'
    },
    about: {
      intro:   'RBS was founded on a simple frustration: too much software that should be free is locked behind subscriptions, trials, and paywalls.',
      body:    'We build practical Windows utilities — optimizers, cleaners, and productivity tools — that are completely free to download and use.',
      mission: 'Building free, powerful tools for everyone.'
    },
    contact: {
      email: 'support@rarebuildsoftware.com',
      github: '#', twitter: '#', youtube: '#'
    },
    downloadCounter: 0,
    announcement: { enabled: false, text: '', type: 'info', link: '', linkText: '' },
    donation: {
      kofiUrl:    'https://ko-fi.com/rbsshop/tip',
      ethAddress: '0x3C8D5bf5c5c78B73814B17d61d9b2b39D722132c',
      btcAddress: '36boft8xKukMQeTZpWNjJfVxGS2kA3uzjY',
      btcQR: null, ethQR: null
    }
  };

  /* ── Load data: localStorage first, then async JSON fetch ── */
  let software = loadLS('software', null);
  let content  = loadLS('content',  DEFAULT_CONTENT);

  /* Run immediately with what we have, then refetch from JSON if LS was empty */
  if (!software) software = DEFAULT_SOFTWARE;

  /* Always force icons from DEFAULT_SOFTWARE so stale localStorage can't override them */
  software = software.map(sw => {
    const def = DEFAULT_SOFTWARE.find(d => d.id === sw.id);
    return def ? Object.assign({}, sw, { icon: def.icon }) : sw;
  });

  /* Expose software array globally so header search (main.js) can read it */
  window._rbsSoftware = software;

  /* Async: fetch data/software.json and merge if localStorage is empty */
  function fetchAndMerge() {
    if (localStorage.getItem('rbs_software')) return; // LS has admin data, skip
    fetch('data/software.json?' + Date.now())
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!Array.isArray(data) || !data.length) return;
        software = data;
        window._rbsSoftware = software; /* keep global in sync */
        // Re-apply dynamic sections after fetch
        applySoftware();
        applySoftwareList();
        applyHomepage();
      })
      .catch(() => {}); // Silently fail — works fine on file:// protocol
  }

  /* ── Download counter ── */
  function getCounter() {
    // Use sum of all per-app downloads as the baseline total
    const appTotal = software.reduce((sum, sw) => sum + (parseInt(sw.downloads, 10) || 0), 0);
    const adminSet = parseInt((content.downloadCounter || 0), 10);
    return Math.max(appTotal, adminSet);
  }

  /* ── Utility ── */
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el && val != null) el.textContent = val;
  }
  function setAttr(id, attr, val) {
    const el = document.getElementById(id);
    if (el && val) el.setAttribute(attr, val);
  }
  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function formatDate(str) {
    if (!str) return '';
    try { return new Date(str).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }); }
    catch (_) { return str; }
  }

  /* ═══════════════════════════════════════
     ANNOUNCEMENT BANNER
  ═══════════════════════════════════════ */
  function applyAnnouncement() {
    const banner = document.getElementById('rbs-announcement');
    if (!banner) return;
    const ann = content.announcement || DEFAULT_CONTENT.announcement;
    if (!ann.enabled) { banner.style.display = 'none'; return; }
    const colors = {
      info:    ['rgba(0,200,150,.12)', 'rgba(0,200,150,.35)',  '#33d4aa'],
      success: ['rgba(0,208,132,.15)', 'rgba(0,208,132,.4)',   '#00d084'],
      warning: ['rgba(255,184,0,.15)', 'rgba(255,184,0,.4)',   '#ffb800']
    };
    const [bg, border, color] = colors[ann.type] || colors.info;
    banner.style.cssText = `
      display:block; position:relative; z-index:998;
      background:${bg}; border-bottom:1px solid ${border};
      padding:10px 52px 10px 24px; text-align:center;
      font-size:.88rem; color:${color}; font-weight:500; line-height:1.4;
    `;
    let html = esc(ann.text || '');
    if (ann.link && ann.linkText) {
      html += ` <a href="${esc(ann.link)}" style="color:inherit;font-weight:700;text-decoration:underline;margin-left:8px;">${esc(ann.linkText)} →</a>`;
    }
    html += `<button onclick="this.parentElement.style.display='none'" aria-label="Close"
      style="position:absolute;right:12px;top:50%;transform:translateY(-50%);
             background:none;border:none;color:inherit;cursor:pointer;
             font-size:1.1rem;opacity:.7;padding:4px 8px;line-height:1;">✕</button>`;
    banner.innerHTML = html;
  }

  /* ═══════════════════════════════════════
     HOMEPAGE
  ═══════════════════════════════════════ */
  function applyHomepage() {
    if (!document.getElementById('rbs-hero-tag')) return;

    /* Hero text */
    const h = content.hero || DEFAULT_CONTENT.hero;
    setText('rbs-hero-tag',    h.tag);
    setText('rbs-hero-title1', h.titleLine1);
    setText('rbs-hero-title2', h.titleLine2);
    setText('rbs-hero-desc',   h.description);

    /* Download counter */
    const cEl = document.getElementById('download-count');
    if (cEl) cEl.dataset.target = getCounter();

    /* Featured software: first visible */
    const firstSw = software.find(s => s.visible !== false);
    if (!firstSw) return;

    /* Version badge */
    const featBadge = document.getElementById('rbs-feat-version');
    if (featBadge) featBadge.textContent = 'v' + firstSw.version;

    /* Update download buttons */
    document.querySelectorAll('[data-download-trigger]').forEach(btn => {
      if (!btn.dataset.downloadUrl || btn.dataset.downloadUrl === '#') {
        btn.dataset.downloadUrl  = firstSw.downloadUrl || '#';
      }
      if (!btn.dataset.softwareName) btn.dataset.softwareName = firstSw.name;
      if (!btn.dataset.version)      btn.dataset.version      = firstSw.version;
    });

    /* Featured section: inject real screenshot if available */
    const screenshotWrap = document.getElementById('rbs-feat-screenshot');
    if (screenshotWrap) {
      if (firstSw.screenshot) {
        screenshotWrap.innerHTML = `<img src="${firstSw.screenshot}" alt="${esc(firstSw.name)} screenshot"
          style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
      } else if (firstSw.screenshotPath) {
        screenshotWrap.innerHTML = `<img src="${esc(firstSw.screenshotPath)}" alt="${esc(firstSw.name)} screenshot"
          style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"
          onerror="this.parentElement.innerHTML='<div style=\'display:flex;align-items:center;justify-content:center;flex-direction:column;height:100%;gap:12px;color:var(--text-muted)\'><span style=\'font-size:3rem\'>🖥️</span><span>Upload screenshot via Admin Panel</span></div>'">`;
      }
    }
  }

  /* ═══════════════════════════════════════
     HOMEPAGE SOFTWARE LIST (sidebar)
  ═══════════════════════════════════════ */
  function applySoftwareList() {
    const container = document.getElementById('rbs-sw-list');
    if (!container) return;

    const list = software.filter(s => s.visible !== false);
    if (!list.length) {
      container.innerHTML = '<p style="color:var(--text-muted);font-size:.9rem;padding:16px 0;">No software listed yet.</p>';
      return;
    }

    container.innerHTML = list.map(sw => {
      const url = resolveUrl(sw);
      const isReady = url && url !== '#';
      const released = sw.released ? formatDate(sw.released) : '';

      return `
      <div class="sw-list-item" data-id="${esc(sw.id)}">
        <div class="sw-list-icon">${sw.icon || '⚡'}</div>
        <div class="sw-list-info">
          <div class="sw-list-name">${esc(sw.name)}</div>
          <div class="sw-list-meta">
            <span class="badge badge-teal" style="font-size:.72rem;padding:2px 8px;">v${esc(sw.version)}</span>
            ${sw.fileSize ? `<span class="sw-list-size">${esc(sw.fileSize)}</span>` : ''}
            <span class="virus-badge" title="Scanned clean by VirusTotal">✓ Virus Free</span>
            ${released ? `<span class="updated-badge">📅 ${released}</span>` : ''}
          </div>
          <div class="sw-list-desc">${esc((sw.description||'').slice(0,80))}…</div>
        </div>
        <div class="sw-list-actions">
          ${isReady
            ? `<a href="${esc(url)}" class="btn btn-primary btn-sm"
                data-download-trigger
                data-download-url="${esc(url)}"
                data-software-name="${esc(sw.name)}"
                data-version="${esc(sw.version)}">⬇ Download</a>`
            : `<span class="btn btn-secondary btn-sm" style="opacity:.5;cursor:not-allowed;">Coming Soon</span>`
          }
          <a href="software/detail.html?id=${esc(sw.id)}" class="btn btn-secondary btn-sm">Details →</a>
        </div>
      </div>`;
    }).join('');

    /* Re-trigger animations */
    if (window._rbsObserver) {
      container.querySelectorAll('.animate-on-scroll').forEach(el => window._rbsObserver.observe(el));
    }
  }

  /* ═══════════════════════════════════════
     ABOUT PAGE
  ═══════════════════════════════════════ */
  function applyAbout() {
    if (!document.getElementById('rbs-about-intro')) return;
    const a = content.about || DEFAULT_CONTENT.about;
    setText('rbs-about-intro',   a.intro);
    setText('rbs-about-body',    a.body);
    setText('rbs-mission-quote', a.mission);
  }

  /* ═══════════════════════════════════════
     CONTACT PAGE
  ═══════════════════════════════════════ */
  function applyContact() {
    if (!document.getElementById('rbs-contact-email-link')) return;
    const c = content.contact || DEFAULT_CONTENT.contact;
    const emailEl = document.getElementById('rbs-contact-email-link');
    if (emailEl) { emailEl.href = 'mailto:' + c.email; emailEl.textContent = c.email; }
    setAttr('rbs-social-github',  'href', c.github  !== '#' ? c.github  : null);
    setAttr('rbs-social-twitter', 'href', c.twitter !== '#' ? c.twitter : null);
    setAttr('rbs-social-youtube', 'href', c.youtube !== '#' ? c.youtube : null);
  }

  /* ═══════════════════════════════════════
     DONATE PAGE — flexible dynamic render
  ═══════════════════════════════════════ */
  let donationData = null;

  function loadDonationData(cb) {
    // 1. Try localStorage
    try {
      const ls = localStorage.getItem('rbs_donation');
      if (ls) { donationData = JSON.parse(ls); cb(); return; }
    } catch (_) {}
    // 2. Fetch data/donation.json
    fetch('data/donation.json?' + Date.now())
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) donationData = d; cb(); })
      .catch(() => cb());
  }

  function applyDonate() {
    const btnContainer    = document.getElementById('rbs-donate-buttons');
    const cryptoContainer = document.getElementById('rbs-donate-crypto');
    if (!btnContainer && !cryptoContainer) return;

    loadDonationData(() => {
      const d = donationData || {};
      const buttons = (d.buttons || []).filter(b => b.visible !== false);
      const crypto  = (d.crypto  || []).filter(c => c.visible !== false);

      /* Payment buttons */
      if (btnContainer) {
        if (buttons.length) {
          btnContainer.innerHTML = buttons.map(b => `
            <div class="donate-btn-card animate-on-scroll">
              <a href="${esc(b.url)}" target="_blank" rel="noopener noreferrer"
                 class="donate-btn-preview"
                 style="background:${esc(b.color||'#00c896')};">
                ${esc(b.icon||'')} ${esc(b.label)}
              </a>
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:1rem;">${esc(b.label)}</div>
                <div class="donate-btn-desc">${esc(b.description || 'Support us to keep RBS free and regularly updated.')}</div>
              </div>
            </div>`).join('');
        } else {
          btnContainer.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:32px 0;">
            No payment buttons configured yet. Add them in the Admin Panel → Donation Manager.</p>`;
        }
      }

      /* Crypto cards */
      if (cryptoContainer) {
        if (crypto.length) {
          /* Resolve QR path: base64 data URIs used as-is; relative paths resolved from site root */
          function resolveQr(qr) {
            if (!qr) return null;
            if (qr.startsWith('data:') || qr.startsWith('http')) return qr;
            /* path is relative to site root — strip any leading slash */
            return qr.replace(/^\//, '');
          }
          cryptoContainer.innerHTML = `<div class="donate-crypto-grid">` + crypto.map(c => {
            const qrSrc = resolveQr(c.qr);
            return `
            <div class="crypto-card animate-on-scroll">
              <div class="crypto-name">${esc(c.coin)}</div>
              ${c.network ? `<p class="crypto-desc">Network: ${esc(c.network)}</p>` : ''}
              <div class="qr-wrapper">
                ${qrSrc
                  ? `<img src="${qrSrc}" alt="${esc(c.coin)} QR Code"
                       style="width:160px;height:160px;object-fit:contain;border-radius:var(--radius-sm);border:2px solid var(--border);background:#fff;padding:8px;"
                       onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                     <div class="qr-fallback" style="display:none;"><div class="qr-fallback-icon">📷</div>QR available on donate page</div>`
                  : `<div class="qr-fallback"><div class="qr-fallback-icon">📷</div>QR available on donate page</div>`
                }
              </div>
              <div class="crypto-address-box">
                <code class="crypto-address-text" id="crypto-addr-${esc(c.id)}">${esc(c.address)}</code>
                <button class="copy-btn" data-copy="${esc(c.address)}"
                        onclick="copyToClipboard('${esc(c.address.replace(/'/g,"\\'"))}',this)"
                        aria-label="Copy ${esc(c.coin)} address">Copy</button>
              </div>
              <div class="tip-note">
                <span class="tip-note-icon">ℹ️</span>
                <span>Double-check the address before sending. Crypto transactions are irreversible.</span>
              </div>
            </div>`;
          }).join('') + `</div>`;
        } else {
          cryptoContainer.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:32px 0;">
            No cryptocurrency addresses configured yet. Add them in the Admin Panel → Donation Manager.</p>`;
        }
        // Trigger animations
        if (window._rbsObserver) {
          cryptoContainer.querySelectorAll('.animate-on-scroll').forEach(el => window._rbsObserver.observe(el));
        }
      }
      if (btnContainer && window._rbsObserver) {
        btnContainer.querySelectorAll('.animate-on-scroll').forEach(el => window._rbsObserver.observe(el));
      }
    });
  }

  /* ═══════════════════════════════════════
     URL HELPERS
  ═══════════════════════════════════════ */
  function resolveUrl(sw) {
    if (!sw.downloadUrl || sw.downloadUrl === '#') return '#';
    if (sw.downloadType === 'local') {
      return sw.downloadUrl.startsWith('downloads/') ? sw.downloadUrl : 'downloads/' + sw.downloadUrl;
    }
    return sw.downloadUrl;
  }

  function dlBadge(sw) {
    if (!sw.downloadUrl || sw.downloadUrl === '#') return '<span style="color:var(--text-muted);font-size:.78rem;">Set download URL in Admin Panel</span>';
    const type = sw.downloadType || 'url';
    const labels = { url: '🌐 Direct URL', local: '💾 Local File', cdn: '☁ CDN' };
    return `<span class="badge badge-teal">${labels[type] || '🌐 URL'}</span>`;
  }

  /* ═══════════════════════════════════════
     SOFTWARE PAGE — full dynamic render
  ═══════════════════════════════════════ */
  function applySoftware() {
    const container = document.getElementById('rbs-software-list');
    if (!container) return;

    const list = software.filter(s => s.visible !== false);

    if (!list.length) {
      container.innerHTML = `
        <div class="coming-soon-card" style="margin-bottom:40px;">
          <div class="coming-soon-icon">📦</div>
          <h3>No Software Listed Yet</h3>
          <p>Check back soon, or visit the Admin Panel to add software.</p>
        </div>`;
      return;
    }

    const APP_PREVIEWS = {
      'rbs-optimizer-pro': `<div style="width:100%;height:100%;background:#0e1520;overflow:hidden;font-family:-apple-system,sans-serif;display:flex;flex-direction:column;"><div style="background:#080e18;padding:5px 10px;display:flex;align-items:center;gap:6px;border-bottom:1px solid #18273a;flex-shrink:0;"><div style="display:flex;gap:4px;"><div style="width:9px;height:9px;border-radius:50%;background:#ff5f57;"></div><div style="width:9px;height:9px;border-radius:50%;background:#ffbd2e;"></div><div style="width:9px;height:9px;border-radius:50%;background:#28c840;"></div></div><span style="color:#aabbcc;font-size:10px;margin-left:4px;">RBS Optimizer Pro</span></div><div style="display:flex;flex:1;overflow:hidden;"><div style="width:130px;background:#080e18;border-right:1px solid #18273a;padding:8px 5px;flex-shrink:0;"><div style="color:#fff;font-size:9px;padding:4px 6px;background:#0d3040;border-radius:3px;margin-bottom:1px;">📊 Dashboard</div><div style="color:#7a8899;font-size:9px;padding:4px 6px;margin-bottom:1px;">💾 RAM Manager</div><div style="color:#7a8899;font-size:9px;padding:4px 6px;margin-bottom:1px;">⚙ Services</div><div style="color:#7a8899;font-size:9px;padding:4px 6px;margin-bottom:1px;">🗑 Temp Cleaner</div><div style="color:#7a8899;font-size:9px;padding:4px 6px;margin-bottom:1px;">🚀 Startup</div><div style="color:#7a8899;font-size:9px;padding:4px 6px;margin-bottom:1px;">⚡ Power &amp; GPU</div><div style="color:#7a8899;font-size:9px;padding:4px 6px;">💿 Disk Manager</div></div><div style="flex:1;padding:10px;display:flex;flex-direction:column;gap:7px;overflow:hidden;"><div style="color:#fff;font-size:11px;font-weight:700;">System Overview</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;"><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:5px;padding:6px;text-align:center;"><div style="color:#4daaee;font-size:13px;font-weight:700;">45%</div><div style="color:#556677;font-size:7px;margin-top:2px;">RAM</div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:5px;padding:6px;text-align:center;"><div style="color:#4daaee;font-size:13px;font-weight:700;">6%</div><div style="color:#556677;font-size:7px;margin-top:2px;">CPU</div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:5px;padding:6px;text-align:center;"><div style="color:#4daaee;font-size:13px;font-weight:700;">44%</div><div style="color:#556677;font-size:7px;margin-top:2px;">Disk</div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:5px;padding:6px;text-align:center;"><div style="color:#4daaee;font-size:13px;font-weight:700;">100%</div><div style="color:#556677;font-size:7px;margin-top:2px;">Battery</div></div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:5px;padding:7px;"><div style="color:#ccd;font-size:9px;font-weight:600;margin-bottom:3px;">Temperature Monitor</div><div style="display:flex;justify-content:space-between;"><span style="color:#556677;font-size:9px;">CPU Temp: N/A</span><span style="color:#00d4a0;font-size:9px;">GPU Temp: 53°C</span></div></div><div style="background:#28a745;border-radius:4px;padding:7px;text-align:center;"><span style="color:#fff;font-weight:700;font-size:10px;">🔧 OPTIMIZE NOW</span></div></div></div><div style="background:#080e18;padding:2px 10px;border-top:1px solid #18273a;flex-shrink:0;"><span style="color:#445566;font-size:7px;">v1.0.0 • Windows 10/11</span></div></div>`,
      'rbs-voice-cloner': `<div style="width:100%;height:100%;background:#0e1520;overflow:hidden;font-family:-apple-system,sans-serif;display:flex;flex-direction:column;"><div style="background:#080e18;padding:5px 10px;display:flex;align-items:center;gap:6px;border-bottom:1px solid #18273a;flex-shrink:0;"><div style="display:flex;gap:4px;"><div style="width:9px;height:9px;border-radius:50%;background:#ff5f57;"></div><div style="width:9px;height:9px;border-radius:50%;background:#ffbd2e;"></div><div style="width:9px;height:9px;border-radius:50%;background:#28c840;"></div></div><span style="color:#aabbcc;font-size:10px;margin-left:4px;">RBS Voice Cloner</span></div><div style="display:flex;flex:1;overflow:hidden;"><div style="width:130px;background:#080e18;border-right:1px solid #18273a;padding:10px 7px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;"><div style="color:#00d4a0;font-size:18px;font-weight:900;line-height:1;">RBS</div><div style="color:#8899aa;font-size:9px;margin-bottom:10px;">Voice Cloner</div><div style="width:100%;"><div style="color:#fff;font-size:9px;padding:5px 7px;background:#0d2a2a;border-radius:3px;margin-bottom:2px;border-left:2px solid #00d4a0;">🎙 Clone Voice</div><div style="color:#7a8899;font-size:9px;padding:5px 7px;margin-bottom:2px;">📝 Text to Speech</div><div style="color:#7a8899;font-size:9px;padding:5px 7px;margin-bottom:2px;">👤 Voice Profiles</div><div style="color:#7a8899;font-size:9px;padding:5px 7px;margin-bottom:2px;">⚡ Batch Process</div><div style="color:#7a8899;font-size:9px;padding:5px 7px;margin-bottom:2px;">✂ Audio Editor</div><div style="color:#7a8899;font-size:9px;padding:5px 7px;">📋 History</div></div></div><div style="flex:1;padding:12px;display:flex;flex-direction:column;gap:8px;overflow:hidden;"><div style="color:#fff;font-size:11px;font-weight:700;">Clone Voice</div><div style="color:#556677;font-size:8px;">Upload or record an audio sample to clone.</div><div style="color:#aabbcc;font-size:9px;font-weight:600;">Audio Sample</div><div style="display:flex;gap:6px;"><div style="background:#00d4a0;border-radius:3px;padding:5px 12px;color:#0a1a1a;font-size:9px;font-weight:700;">Upload File</div><div style="border:1px solid #2a4a4a;border-radius:3px;padding:5px 12px;color:#aabbcc;font-size:9px;">Record Mic</div></div><div style="background:#111d2c;border:1px solid #1a2d3a;border-radius:4px;padding:8px;flex:1;display:flex;align-items:center;justify-content:center;"><span style="color:#445566;font-size:9px;">No sample loaded</span></div></div><div style="width:170px;padding:12px;display:flex;flex-direction:column;gap:8px;border-left:1px solid #18273a;overflow:hidden;"><div style="color:#aabbcc;font-size:10px;font-weight:700;">Profile Details</div><div><div style="color:#7a8899;font-size:8px;margin-bottom:2px;">Profile Name</div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:3px;padding:5px 8px;color:#445566;font-size:8px;">e.g. My Voice</div></div><div><div style="color:#7a8899;font-size:8px;margin-bottom:2px;">Language</div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:3px;padding:5px 8px;color:#aabbcc;font-size:8px;">English (en) ▼</div></div><div style="margin-top:auto;background:#00d4a0;border-radius:4px;padding:7px;text-align:center;"><span style="color:#0a1a1a;font-weight:700;font-size:9px;">Save Voice Profile</span></div></div></div><div style="background:#080e18;padding:2px 10px;border-top:1px solid #18273a;flex-shrink:0;"><span style="color:#00d4a0;font-size:7px;">Model loaded — ready</span></div></div>`,
      'life-dashboard': `<div style="width:100%;height:100%;background:#0e1520;overflow:hidden;font-family:-apple-system,sans-serif;display:flex;flex-direction:column;"><div style="background:#080e18;padding:5px 10px;display:flex;align-items:center;gap:6px;border-bottom:1px solid #18273a;flex-shrink:0;"><div style="display:flex;gap:4px;"><div style="width:9px;height:9px;border-radius:50%;background:#ff5f57;"></div><div style="width:9px;height:9px;border-radius:50%;background:#ffbd2e;"></div><div style="width:9px;height:9px;border-radius:50%;background:#28c840;"></div></div><span style="color:#fff;font-size:10px;font-weight:700;margin-left:4px;">Life Dashboard</span><span style="background:#00d4a0;color:#0a1a0a;font-size:7px;font-weight:800;padding:1px 4px;border-radius:2px;">RBS</span></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:5px;padding:6px;flex:1;overflow:hidden;"><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:5px;padding:7px;"><div style="color:#00d4a0;font-size:7px;font-weight:700;margin-bottom:3px;">🕐 CLOCK</div><div style="color:#00d4a0;font-size:16px;font-weight:700;text-align:center;line-height:1;">19:56:37</div><div style="color:#7a8899;font-size:6px;text-align:center;">Wed, April 15 2026</div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:5px;padding:7px;"><div style="color:#00d4a0;font-size:7px;font-weight:700;margin-bottom:3px;">🌤 WEATHER</div><div style="display:flex;align-items:center;gap:4px;"><span style="font-size:14px;">☀️</span><div><div style="color:#fff;font-size:13px;font-weight:700;line-height:1;">9°C</div><div style="color:#7a8899;font-size:7px;">Sunny</div></div></div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:5px;padding:7px;"><div style="color:#00d4a0;font-size:7px;font-weight:700;margin-bottom:3px;">📅 CALENDAR</div><div style="color:#fff;font-size:8px;font-weight:600;text-align:center;margin-bottom:2px;">April 2026</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center;font-size:6px;color:#556677;">Su Mo Tu We Th Fr Sa</div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:5px;padding:7px;"><div style="color:#00d4a0;font-size:7px;font-weight:700;margin-bottom:3px;">✅ TASKS</div><div style="color:#445566;font-size:8px;text-align:center;padding:4px 0;">No tasks yet</div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:5px;padding:7px;"><div style="color:#00d4a0;font-size:7px;font-weight:700;margin-bottom:3px;">🎯 HABITS</div><div style="display:flex;gap:3px;flex-wrap:wrap;"><div style="width:12px;height:12px;border-radius:50%;background:#6c5ce7;"></div><div style="width:12px;height:12px;border-radius:50%;background:#00d4a0;"></div><div style="width:12px;height:12px;border-radius:50%;background:#e17055;"></div><div style="width:12px;height:12px;border-radius:50%;background:#fdcb6e;"></div></div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:5px;padding:7px;overflow:hidden;"><div style="color:#00d4a0;font-size:7px;font-weight:700;margin-bottom:3px;">📰 NEWS</div><div style="color:#aabbcc;font-size:7px;line-height:1.3;">BBC: Legal advisers help migrants pose as gay to get asylum</div></div></div><div style="background:#080e18;padding:2px 10px;border-top:1px solid #18273a;flex-shrink:0;"><span style="color:#00d4a0;font-size:7px;font-weight:700;">RBS</span></div></div>`
    };

    function resolveScreenshot(sw) {
      if (sw.screenshot) return `<img src="${sw.screenshot}" alt="${esc(sw.name)} screenshot" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block;">`;
      if (sw.screenshotPath) return `<img src="${esc(sw.screenshotPath)}" alt="${esc(sw.name)} screenshot"
        onerror="this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;flex-direction:column;height:100%;gap:12px;color:var(--text-muted)\\'><span style=\\'font-size:3rem\\'>🖥️</span><span style=\\'font-size:.85rem\\'>Upload screenshot via Admin Panel</span></div>'"
        style="width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block;">`;
      if (APP_PREVIEWS[sw.id]) return APP_PREVIEWS[sw.id];
      return `<div class="screenshot-big">
        <div class="window-dots"><div class="window-dot red"></div><div class="window-dot amber"></div><div class="window-dot green"></div></div>
        <div class="screenshot-icon">🖥️</div>
        <span style="color:var(--text-muted);font-size:.85rem;">Upload screenshot via Admin Panel</span>
      </div>`;
    }

    container.innerHTML = list.map((sw, idx) => {
      const url     = resolveUrl(sw);
      const isReady = url && url !== '#';
      const released = sw.released ? formatDate(sw.released) : '';

      const featureHTML = (sw.features || []).map(f =>
        `<div class="feature-big-item">
           <div class="feature-big-icon">${esc(f.icon)}</div>
           <div class="feature-big-text"><h4>${esc(f.title)}</h4><p>${esc(f.desc)}</p></div>
         </div>`).join('');

      const reqHTML = (sw.sysReqs || []).map(r =>
        `<div class="sys-req-item"><span class="req-icon" style="color:var(--accent-light);">✔</span><span>${esc(r)}</span></div>`).join('');

      return `
      <div class="software-card-big animate-on-scroll" data-delay="${idx * 80}" style="margin-bottom:40px;"
           data-id="${esc(sw.id)}"
           data-category="${esc(sw.category||'Optimization')}"
           data-categories="${esc(JSON.stringify(sw.categories || [sw.category||'Optimization']))}"
           data-name="${esc((sw.name||'').toLowerCase())}"
           data-desc="${esc((sw.description||'').toLowerCase())}">

        <div class="software-card-header">
          <div class="app-icon" style="background:linear-gradient(135deg,rgba(0,200,150,0.2),rgba(0,200,150,0.05));border:2px solid rgba(0,200,150,0.3);box-shadow:0 4px 24px rgba(0,200,150,0.2);">${sw.icon || '⚡'}</div>
          <div class="app-header-info">
            <h2 class="app-name">${esc(sw.name)}</h2>
            <p style="color:var(--text-secondary);font-size:.95rem;line-height:1.6;max-width:600px;">${esc(sw.description)}</p>
            <div class="app-meta">
              <div class="meta-item">📦 <strong>Version:</strong>&nbsp;v${esc(sw.version)}</div>
              <div class="meta-item">💾 <strong>Size:</strong>&nbsp;${esc(sw.fileSize || '—')}</div>
              <div class="meta-item">🆓 <strong>Price:</strong>&nbsp;Free</div>
              ${released ? `<div class="meta-item">📅 <strong>Updated:</strong>&nbsp;${released}</div>` : ''}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;align-items:center;">
              <span class="badge badge-teal">v${esc(sw.version)}</span>
              <span class="badge badge-green">✓ Windows 10</span>
              <span class="badge badge-green">✓ Windows 11</span>
              <span class="badge badge-gold">${esc(sw.fileSize || '—')}</span>
              <span class="virus-badge" title="No malware detected — scanned clean">🛡️ Virus Free</span>
            </div>
          </div>
        </div>

        <div class="software-card-body">
          <div class="screenshot-area">
            <div style="width:100%;aspect-ratio:16/10;border-radius:var(--radius);border:1px solid var(--border);overflow:hidden;background:linear-gradient(135deg,var(--bg-card),#1a3a6b);">
              ${resolveScreenshot(sw)}
            </div>
            <h3 style="font-size:1.1rem;font-weight:700;margin-top:8px;">Key Features</h3>
            <div class="features-big">${featureHTML}</div>
          </div>

          <div class="download-sidebar">
            <div class="download-box">
              <h4>Download</h4>
              <div class="download-btn-wrap">
                ${isReady
                  ? `<a href="${esc(url)}"
                        class="btn btn-primary"
                        style="width:100%;justify-content:center;font-size:1rem;padding:16px;"
                        data-download-trigger
                        data-download-url="${esc(url)}"
                        data-software-name="${esc(sw.name)}"
                        data-version="${esc(sw.version)}">
                       ⬇ Download v${esc(sw.version)} — Free
                     </a>`
                  : `<button class="btn btn-secondary"
                             style="width:100%;justify-content:center;opacity:.6;cursor:not-allowed;padding:16px;"
                             disabled>
                       ⬇ Download — Coming Soon
                     </button>`
                }
              </div>
              <div class="file-info" style="margin-top:14px;">
                <div class="file-info-row"><span>Version</span><span>v${esc(sw.version)}</span></div>
                <div class="file-info-row"><span>File size</span><span>${esc(sw.fileSize || '—')}</span></div>
                <div class="file-info-row"><span>Source</span><span>${dlBadge(sw)}</span></div>
                <div class="file-info-row"><span>License</span><span>Freeware</span></div>
                ${released ? `<div class="file-info-row"><span>Released</span><span>${released}</span></div>` : ''}
              </div>
              <div data-sw-dl-wrap style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);text-align:center;${sw.downloads > 0 ? '' : 'display:none'}">
                <span style="font-size:.82rem;color:var(--text-muted);">
                  <span data-sw-download-count="${sw.id}" style="font-weight:700;color:var(--accent-light);">${sw.downloads > 0 ? sw.downloads.toLocaleString() : '0'}</span> downloads
                </span>
              </div>
            </div>

            <div class="download-box">
              <h4>Security</h4>
              <div style="display:flex;flex-direction:column;gap:8px;">
                <span class="virus-badge" style="font-size:.82rem;padding:6px 12px;justify-content:center;">🛡️ Scanned — No Malware Found</span>
                <p style="font-size:.78rem;color:var(--text-muted);line-height:1.5;margin-top:6px;">No adware, spyware, or bundled software. Only what it says on the tin.</p>
              </div>
            </div>

            <div class="download-box">
              <h4>System Requirements</h4>
              <div class="sys-req">${reqHTML}</div>
            </div>

            <div class="download-box" style="background:linear-gradient(135deg,rgba(0,200,150,0.08),rgba(0,200,150,0.02));border-color:rgba(0,200,150,0.25);">
              <h4>Love it? Support RBS</h4>
              <p style="font-size:.85rem;color:var(--text-muted);margin-bottom:14px;line-height:1.5;">All RBS software is 100% free. A small donation keeps development going.</p>
              <a href="donate.html" class="btn btn-outline btn-sm" style="width:100%;justify-content:center;">❤ Donate</a>
            </div>
          </div>
        </div>

        <!-- Share section -->
        <div style="padding:24px 40px;border-top:1px solid var(--border);">
          <div class="share-label">Share this software</div>
          <div class="share-btns">
            <button class="share-btn share-whatsapp" onclick="shareOn('whatsapp')">📱 WhatsApp</button>
            <button class="share-btn share-facebook" onclick="shareOn('facebook')">👍 Facebook</button>
            <button class="share-btn share-twitter" onclick="shareOn('twitter')">𝕏 Twitter</button>
          </div>
        </div>
      </div>`;
    }).join('');

    updateCounterDisplay();

    if (window._rbsObserver) {
      container.querySelectorAll('.animate-on-scroll').forEach(el => window._rbsObserver.observe(el));
    }
  }

  /* ═══════════════════════════════════════
     SOFTWARE PAGE — filter/sort
  ═══════════════════════════════════════ */
  function applyFilters() {
    const container = document.getElementById('rbs-software-list');
    if (!container) return;

    const searchInput = document.getElementById('sw-search');
    const searchClear = document.getElementById('sw-search-clear');

    /* Pre-fill search from URL ?q= param */
    const urlQ = new URLSearchParams(location.search).get('q') || '';
    if (searchInput && urlQ) {
      searchInput.value = urlQ;
      if (searchClear) searchClear.style.display = 'inline-flex';
    }

    function runFilter() {
      const q   = (searchInput ? searchInput.value.trim().toLowerCase() : '');
      const chip = document.querySelector('.filter-chip[data-cat].active');
      const cat  = chip ? chip.dataset.cat : 'all';

      let visible = 0;
      container.querySelectorAll('.software-card-big').forEach(card => {
        let cardCats;
        try { cardCats = JSON.parse(card.dataset.categories || '[]'); } catch(_) { cardCats = []; }
        if (!cardCats.length) cardCats = [card.dataset.category || ''];
        const matchCat = (cat === 'all' || cardCats.includes(cat));
        const matchQ   = !q ||
          (card.dataset.name     || '').includes(q) ||
          (card.dataset.desc     || '').includes(q) ||
          cardCats.join(' ').toLowerCase().includes(q);
        const show = matchCat && matchQ;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      /* Show / hide no-results message */
      let noEl = document.getElementById('sw-no-results');
      if (!visible) {
        if (!noEl) {
          noEl = document.createElement('div');
          noEl.id = 'sw-no-results';
          noEl.style.cssText = 'text-align:center;padding:60px 40px;color:var(--text-muted);';
          noEl.innerHTML = '<div style="font-size:2rem;margin-bottom:12px;">🔍</div>' +
            '<p>No software found matching your search.<br>' +
            '<a href="software.html" style="color:var(--accent-light);text-decoration:underline;margin-top:8px;display:inline-block;">Clear search</a></p>';
          container.appendChild(noEl);
        }
        noEl.style.display = '';
      } else {
        if (noEl) noEl.style.display = 'none';
      }

      /* Sync clear button visibility */
      if (searchClear) searchClear.style.display = q ? 'inline-flex' : 'none';
    }

    /* Category chips */
    document.querySelectorAll('.filter-chip[data-cat]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip[data-cat]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        runFilter();
      });
    });

    /* Search input */
    if (searchInput) {
      searchInput.addEventListener('input', runFilter);
      if (searchClear) {
        searchClear.addEventListener('click', () => {
          searchInput.value = '';
          searchClear.style.display = 'none';
          runFilter();
          searchInput.focus();
        });
      }
    }

    /* Sort — re-render then reattach filters */
    const sortSel = document.getElementById('sort-select');
    if (sortSel) {
      sortSel.addEventListener('change', () => {
        applySoftware();
        setTimeout(applyFilters, 0);
      });
    }

    /* Run immediately to handle ?q= pre-fill */
    runFilter();
  }

  /* ═══════════════════════════════════════
     SOFTWARE DETAIL PAGE
  ═══════════════════════════════════════ */
  function applyDetailPage() {
    const container = document.getElementById('rbs-detail-root');
    if (!container) return;

    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const sw = software.find(s => s.id === id) || software[0];
    if (!sw) { container.innerHTML = '<p>Software not found.</p>'; return; }

    document.title = `${sw.name} — RBS`;

    const url = resolveUrl(sw);
    const isReady = url && url !== '#';
    const released = sw.released ? formatDate(sw.released) : '';

    const featureHTML = (sw.features || []).map(f =>
      `<div class="feature-big-item">
        <div class="feature-big-icon">${esc(f.icon)}</div>
        <div class="feature-big-text"><h4>${esc(f.title)}</h4><p>${esc(f.desc)}</p></div>
      </div>`).join('');

    const reqHTML = (sw.sysReqs || []).map(r =>
      `<div class="sys-req-item"><span class="req-icon" style="color:var(--accent-light);">✔</span><span>${esc(r)}</span></div>`).join('');

    const changelogHTML = (sw.changelog || []).map(cl =>
      `<div class="changelog-item">
        <div class="changelog-version">
          <span class="changelog-version-num">v${esc(cl.version)}</span>
          <span class="badge badge-teal" style="font-size:.7rem;">Latest</span>
          ${cl.date ? `<span class="changelog-date">${formatDate(cl.date)}</span>` : ''}
        </div>
        <ul class="changelog-list">
          ${(cl.notes||[]).map(n=>`<li>${esc(n)}</li>`).join('')}
        </ul>
      </div>`).join('') || '<p style="color:var(--text-muted)">Changelog coming soon.</p>';

    let screenshotHTML = '';
    if (sw.screenshot) {
      screenshotHTML = `<img src="${sw.screenshot}" alt="${esc(sw.name)} screenshot" style="width:100%;border-radius:var(--radius);border:1px solid var(--border);display:block;">`;
    } else if (sw.screenshotPath) {
      screenshotHTML = `<img src="${esc(sw.screenshotPath)}" alt="${esc(sw.name)} screenshot" style="width:100%;border-radius:var(--radius);border:1px solid var(--border);display:block;" onerror="this.style.display='none'">`;
    } else {
      const appPreviews = {
        'rbs-optimizer-pro': `<div style="width:100%;aspect-ratio:16/10;background:#0e1520;border-radius:var(--radius);border:1px solid #1a2535;overflow:hidden;font-family:-apple-system,sans-serif;display:flex;flex-direction:column;"><div style="background:#080e18;padding:7px 10px;display:flex;align-items:center;gap:6px;border-bottom:1px solid #18273a;"><span style="color:#00d4a0;font-size:12px;font-weight:800;">⚡</span><span style="color:#aabbcc;font-size:11px;">RBS Optimizer Pro</span><div style="margin-left:auto;display:flex;gap:5px;"><span style="background:#0a1e0a;color:#3dba3d;font-size:9px;padding:2px 7px;border-radius:3px;border:1px solid #1a3a1a;">RAM 45%</span><span style="background:#0a1e0a;color:#3dba3d;font-size:9px;padding:2px 7px;border-radius:3px;border:1px solid #1a3a1a;">CPU 16%</span></div></div><div style="display:flex;flex:1;overflow:hidden;"><div style="width:150px;background:#080e18;border-right:1px solid #18273a;padding:10px 6px;flex-shrink:0;"><div style="display:flex;align-items:center;gap:5px;padding:4px 6px;margin-bottom:2px;"><span style="color:#00d4a0;font-size:14px;font-weight:800;">⚡</span><div><div style="color:#fff;font-size:9px;font-weight:700;line-height:1.2;">RBS Optimizer Pro</div><div style="color:#556677;font-size:8px;">RAM: 45% CPU: 16%</div></div></div><div style="height:1px;background:#18273a;margin:6px 0;"></div><div style="color:#fff;font-size:10px;padding:5px 7px;background:#0d3040;border-radius:4px;margin-bottom:1px;">📊 Dashboard</div><div style="color:#7a8899;font-size:10px;padding:5px 7px;margin-bottom:1px;">💾 RAM Manager</div><div style="color:#7a8899;font-size:10px;padding:5px 7px;margin-bottom:1px;">⚙ Services</div><div style="color:#7a8899;font-size:10px;padding:5px 7px;margin-bottom:1px;">🗑 Temp Cleaner</div><div style="color:#7a8899;font-size:10px;padding:5px 7px;margin-bottom:1px;">🚀 Startup</div><div style="color:#7a8899;font-size:10px;padding:5px 7px;margin-bottom:1px;">⚡ Power &amp; GPU</div><div style="color:#7a8899;font-size:10px;padding:5px 7px;">💿 Disk Manager</div></div><div style="flex:1;padding:12px;display:flex;flex-direction:column;gap:8px;"><div style="color:#fff;font-size:12px;font-weight:700;">System Overview</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;"><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:6px;padding:8px;text-align:center;"><div style="color:#4daaee;font-size:15px;font-weight:700;line-height:1;">45%</div><div style="color:#556677;font-size:8px;margin-top:3px;">RAM Used</div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:6px;padding:8px;text-align:center;"><div style="color:#4daaee;font-size:15px;font-weight:700;line-height:1;">6%</div><div style="color:#556677;font-size:8px;margin-top:3px;">CPU Load</div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:6px;padding:8px;text-align:center;"><div style="color:#4daaee;font-size:15px;font-weight:700;line-height:1;">44%</div><div style="color:#556677;font-size:8px;margin-top:3px;">Disk C:</div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:6px;padding:8px;text-align:center;"><div style="color:#4daaee;font-size:15px;font-weight:700;line-height:1;">100%</div><div style="color:#556677;font-size:8px;margin-top:3px;">Battery</div></div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:6px;padding:9px;"><div style="color:#ccd;font-size:10px;font-weight:600;margin-bottom:5px;">Temperature Monitor</div><div style="display:flex;justify-content:space-between;"><span style="color:#556677;font-size:10px;">CPU Temp: N/A</span><span style="color:#00d4a0;font-size:10px;">GPU Temp: 53°C</span></div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:6px;padding:9px;"><div style="color:#ccd;font-size:10px;font-weight:600;margin-bottom:7px;">⚡ One-Click Full Optimization</div><div style="background:#28a745;border-radius:5px;padding:8px;text-align:center;"><span style="color:#fff;font-weight:700;font-size:11px;">🔧 OPTIMIZE NOW</span></div><div style="color:#556677;font-size:9px;margin-top:4px;">Ready to optimize.</div></div></div></div><div style="background:#080e18;padding:3px 12px;border-top:1px solid #18273a;"><span style="color:#445566;font-size:8px;">v1.0.0 • Windows 10/11</span></div></div>`,
        'rbs-voice-cloner': `<div style="width:100%;aspect-ratio:16/10;background:#0e1520;border-radius:var(--radius);border:1px solid #1a2535;overflow:hidden;font-family:-apple-system,sans-serif;display:flex;flex-direction:column;"><div style="background:#080e18;padding:7px 10px;border-bottom:1px solid #18273a;"><span style="color:#aabbcc;font-size:11px;">RBS Voice Cloner</span></div><div style="display:flex;flex:1;overflow:hidden;"><div style="width:145px;background:#080e18;border-right:1px solid #18273a;padding:12px 8px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;"><div style="color:#00d4a0;font-size:22px;font-weight:900;line-height:1;">RBS</div><div style="color:#8899aa;font-size:10px;margin-bottom:2px;">Voice Cloner</div><div style="color:#445566;font-size:9px;margin-bottom:12px;">v1.0.0</div><div style="width:100%;"><div style="color:#fff;font-size:10px;padding:6px 8px;background:#0d2a2a;border-radius:4px;margin-bottom:2px;border-left:2px solid #00d4a0;">🎙 Clone Voice</div><div style="color:#7a8899;font-size:10px;padding:6px 8px;margin-bottom:2px;">📝 Text to Speech</div><div style="color:#7a8899;font-size:10px;padding:6px 8px;margin-bottom:2px;">👤 Voice Profiles</div><div style="color:#7a8899;font-size:10px;padding:6px 8px;margin-bottom:2px;">⚡ Batch Process</div><div style="color:#7a8899;font-size:10px;padding:6px 8px;margin-bottom:2px;">✂ Audio Editor</div><div style="color:#7a8899;font-size:10px;padding:6px 8px;">📋 History</div></div></div><div style="flex:1;display:flex;gap:0;"><div style="flex:1;padding:14px;display:flex;flex-direction:column;gap:10px;border-right:1px solid #18273a;"><div style="color:#fff;font-size:13px;font-weight:700;">Clone Voice</div><div style="color:#556677;font-size:9px;margin-top:-6px;">Upload or record an audio sample to create a voice profile.</div><div style="color:#aabbcc;font-size:10px;font-weight:600;">Audio Sample</div><div style="display:flex;gap:7px;"><div style="background:#00d4a0;border-radius:4px;padding:7px 14px;color:#0a1a1a;font-size:10px;font-weight:700;">Upload File</div><div style="border:1px solid #2a4a4a;border-radius:4px;padding:7px 14px;color:#aabbcc;font-size:10px;">Record Mic</div></div><div style="color:#445566;font-size:8px;">Supported: WAV, MP3, M4A | Min 5s, recommend 10-30s</div><div style="display:flex;align-items:center;gap:5px;"><div style="width:12px;height:12px;border:1px solid #2a4040;border-radius:2px;"></div><span style="color:#7a8899;font-size:9px;">Apply noise reduction to sample</span></div><div style="background:#111d2c;border:1px solid #1a2d3a;border-radius:5px;padding:10px;flex:1;display:flex;align-items:flex-end;justify-content:space-between;"><span style="color:#445566;font-size:9px;">No sample loaded</span><div style="border:1px solid #2a4040;border-radius:4px;padding:5px 10px;color:#aabbcc;font-size:9px;">► Play Sample</div></div></div><div style="width:200px;padding:14px;display:flex;flex-direction:column;gap:9px;"><div style="color:#aabbcc;font-size:11px;font-weight:700;">Profile Details</div><div><div style="color:#7a8899;font-size:9px;margin-bottom:3px;">Profile Name</div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:4px;padding:6px 9px;color:#445566;font-size:9px;">e.g. My Voice</div></div><div><div style="color:#7a8899;font-size:9px;margin-bottom:3px;">Primary Language</div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:4px;padding:6px 9px;color:#aabbcc;font-size:9px;display:flex;justify-content:space-between;"><span>English (en)</span><span style="color:#00d4a0;">▼</span></div></div><div><div style="color:#7a8899;font-size:9px;margin-bottom:5px;">Clone Quality</div><div style="background:#1e2d40;border-radius:3px;height:4px;position:relative;"><div style="background:#00d4a0;width:30%;height:100%;border-radius:3px;"></div><div style="width:10px;height:10px;background:#00d4a0;border-radius:50%;position:absolute;top:-3px;left:28%;"></div></div></div><div style="background:#00d4a0;border-radius:5px;padding:9px;text-align:center;margin-top:auto;"><span style="color:#0a1a1a;font-weight:700;font-size:10px;">Save Voice Profile</span></div></div></div></div><div style="background:#080e18;padding:3px 10px;border-top:1px solid #18273a;display:flex;justify-content:space-between;"><span style="color:#2a6a5a;font-size:8px;">GPU: NVIDIA GeForce RTX 3060 | CUDA 12.1 | VRAM: 6.0GB | Model: loaded</span><span style="color:#00d4a0;font-size:8px;">Model loaded — ready</span></div></div>`,
        'life-dashboard': `<div style="width:100%;aspect-ratio:16/10;background:#0e1520;border-radius:var(--radius);border:1px solid #1a2535;overflow:hidden;font-family:-apple-system,sans-serif;display:flex;flex-direction:column;"><div style="background:#080e18;padding:7px 12px;border-bottom:1px solid #18273a;display:flex;align-items:center;gap:8px;"><span style="color:#fff;font-size:11px;font-weight:700;">Life Dashboard</span><span style="background:#00d4a0;color:#0a1a0a;font-size:8px;font-weight:800;padding:1px 5px;border-radius:3px;">RBS</span><div style="display:flex;gap:6px;margin-left:4px;"><span style="color:#fff;font-size:10px;padding:3px 10px;background:#1a2a3a;border-radius:12px;border:1px solid #2a3a4a;">Widgets</span><span style="color:#7a8899;font-size:10px;padding:3px 10px;">Reminders</span></div><div style="margin-left:auto;background:#00d4a0;border-radius:12px;padding:4px 10px;display:flex;align-items:center;gap:4px;"><span style="color:#0a1a0a;font-size:9px;font-weight:700;">♥ Donate</span></div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:7px;padding:8px;flex:1;"><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:7px;padding:10px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><span style="color:#00d4a0;font-size:9px;font-weight:700;">🕐 CLOCK</span></div><div style="color:#00d4a0;font-size:22px;font-weight:700;letter-spacing:1px;text-align:center;line-height:1.1;">19:56:37</div><div style="color:#7a8899;font-size:8px;text-align:center;margin-bottom:6px;">Wednesday, April 15th 2026</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px;"><div style="text-align:center;"><div style="color:#445566;font-size:7px;">NYC</div><div style="color:#aabbcc;font-size:9px;font-weight:600;">07:56</div></div><div style="text-align:center;"><div style="color:#445566;font-size:7px;">LON</div><div style="color:#aabbcc;font-size:9px;font-weight:600;">12:56</div></div><div style="text-align:center;"><div style="color:#445566;font-size:7px;">TOK</div><div style="color:#aabbcc;font-size:9px;font-weight:600;">20:56</div></div><div style="text-align:center;"><div style="color:#445566;font-size:7px;">SYD</div><div style="color:#aabbcc;font-size:9px;font-weight:600;">21:56</div></div></div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:7px;padding:10px;"><div style="color:#00d4a0;font-size:9px;font-weight:700;margin-bottom:6px;">🌤 WEATHER</div><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><span style="font-size:20px;">☀️</span><div><div style="color:#fff;font-size:16px;font-weight:700;line-height:1;">9°C</div><div style="color:#7a8899;font-size:8px;">Sunny</div></div></div><div style="display:flex;gap:8px;color:#556677;font-size:8px;margin-bottom:6px;"><span>Feels 7°</span><span>💧 50%</span><span>💨 21 km/h</span></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;"><div style="text-align:center;background:#0a1520;border-radius:3px;padding:3px;"><div style="color:#445566;font-size:7px;">WED</div><div style="color:#aabbcc;font-size:8px;">0°/10°</div></div><div style="text-align:center;background:#0a1520;border-radius:3px;padding:3px;"><div style="color:#445566;font-size:7px;">THU</div><div style="color:#aabbcc;font-size:8px;">1°/11°</div></div><div style="text-align:center;background:#0a1520;border-radius:3px;padding:3px;"><div style="color:#445566;font-size:7px;">FRI</div><div style="color:#aabbcc;font-size:8px;">3°/13°</div></div></div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:7px;padding:10px;"><div style="color:#00d4a0;font-size:9px;font-weight:700;margin-bottom:5px;">📅 CALENDAR</div><div style="color:#fff;font-size:9px;font-weight:600;text-align:center;margin-bottom:4px;">April 2026</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center;"><div style="color:#445566;font-size:7px;">Su</div><div style="color:#445566;font-size:7px;">Mo</div><div style="color:#445566;font-size:7px;">Tu</div><div style="color:#445566;font-size:7px;">We</div><div style="color:#445566;font-size:7px;">Th</div><div style="color:#445566;font-size:7px;">Fr</div><div style="color:#445566;font-size:7px;">Sa</div><div style="color:#445566;font-size:8px;"></div><div style="color:#445566;font-size:8px;"></div><div style="color:#445566;font-size:8px;"></div><div style="color:#aabbcc;font-size:8px;">1</div><div style="color:#aabbcc;font-size:8px;">2</div><div style="color:#aabbcc;font-size:8px;">3</div><div style="color:#aabbcc;font-size:8px;">4</div><div style="color:#aabbcc;font-size:8px;">5</div><div style="color:#aabbcc;font-size:8px;">6</div><div style="color:#aabbcc;font-size:8px;">7</div><div style="color:#aabbcc;font-size:8px;">8</div><div style="color:#aabbcc;font-size:8px;">9</div><div style="color:#aabbcc;font-size:8px;">10</div><div style="color:#aabbcc;font-size:8px;">11</div><div style="color:#aabbcc;font-size:8px;">12</div><div style="color:#aabbcc;font-size:8px;">13</div><div style="color:#aabbcc;font-size:8px;">14</div><div style="background:#00d4a0;border-radius:50%;color:#0a1a0a;font-size:8px;font-weight:700;width:14px;height:14px;display:flex;align-items:center;justify-content:center;margin:0 auto;">15</div><div style="color:#aabbcc;font-size:8px;">16</div><div style="color:#aabbcc;font-size:8px;">17</div><div style="color:#aabbcc;font-size:8px;">18</div><div style="color:#aabbcc;font-size:8px;">19</div><div style="color:#aabbcc;font-size:8px;">20</div><div style="color:#aabbcc;font-size:8px;">21</div><div style="color:#aabbcc;font-size:8px;">22</div><div style="color:#aabbcc;font-size:8px;">23</div><div style="color:#aabbcc;font-size:8px;">24</div><div style="color:#aabbcc;font-size:8px;">25</div></div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:7px;padding:10px;"><div style="color:#00d4a0;font-size:9px;font-weight:700;margin-bottom:6px;">✅ TASKS</div><div style="background:#0a1520;border:1px solid #1e2d40;border-radius:4px;padding:5px 8px;color:#445566;font-size:9px;margin-bottom:5px;">Add a task...</div><div style="display:flex;gap:4px;margin-bottom:5px;"><div style="background:#0a1520;border:1px solid #1e2d40;border-radius:4px;padding:3px 7px;color:#7a8899;font-size:8px;">medium ▾</div><div style="background:#0a1520;border:1px solid #1e2d40;border-radius:4px;padding:3px 7px;color:#7a8899;font-size:8px;">General ▾</div><div style="background:#00d4a0;border-radius:4px;padding:3px 8px;color:#0a1a0a;font-size:9px;font-weight:700;">+</div></div><div style="color:#445566;font-size:9px;text-align:center;padding:4px;">No tasks yet. Add one above!</div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:7px;padding:10px;"><div style="color:#00d4a0;font-size:9px;font-weight:700;margin-bottom:6px;">🎯 HABITS</div><div style="background:#0a1520;border:1px solid #1e2d40;border-radius:4px;padding:5px 8px;color:#445566;font-size:9px;margin-bottom:5px;">New habit...</div><div style="display:flex;gap:4px;margin-bottom:4px;"><div style="width:16px;height:16px;border-radius:50%;background:#6c5ce7;"></div><div style="width:16px;height:16px;border-radius:50%;background:#00d4a0;"></div><div style="width:16px;height:16px;border-radius:50%;background:#e17055;"></div><div style="width:16px;height:16px;border-radius:50%;background:#fdcb6e;"></div><div style="width:16px;height:16px;border-radius:50%;background:#74b9ff;"></div><div style="width:16px;height:16px;border-radius:50%;background:#a29bfe;"></div><div style="width:16px;height:16px;border-radius:50%;background:#00d4a0;border:1px solid #2a4a3a;display:flex;align-items:center;justify-content:center;color:#0a1a0a;font-size:9px;font-weight:700;">+</div></div><div style="color:#445566;font-size:9px;text-align:center;padding:4px;">No habits yet. Start tracking!</div></div><div style="background:#111d2c;border:1px solid #1e2d40;border-radius:7px;padding:10px;overflow:hidden;"><div style="color:#00d4a0;font-size:9px;font-weight:700;margin-bottom:6px;">📰 NEWS</div><div style="margin-bottom:5px;padding-bottom:5px;border-bottom:1px solid #1e2d40;"><div style="color:#aabbcc;font-size:9px;line-height:1.3;margin-bottom:2px;">Legal advisers help migrants pose as gay to get asylum, BBC finds</div><div style="display:flex;gap:4px;align-items:center;"><span style="background:#1e2d40;color:#00d4a0;font-size:7px;padding:1px 5px;border-radius:2px;">BBC News</span><span style="color:#445566;font-size:7px;">2h ago</span></div></div><div><div style="color:#aabbcc;font-size:9px;line-height:1.3;margin-bottom:2px;">AA and BSM ordered to refund learner drivers for hidden fees</div><div style="display:flex;gap:4px;align-items:center;"><span style="background:#1e2d40;color:#00d4a0;font-size:7px;padding:1px 5px;border-radius:2px;">BBC News</span><span style="color:#445566;font-size:7px;">2h ago</span></div></div></div></div><div style="background:#080e18;padding:3px 12px;border-top:1px solid #18273a;"><span style="color:#2a5a4a;font-size:8px;">Powered by </span><span style="color:#00d4a0;font-size:8px;font-weight:700;">RBS</span></div></div>`
      };
      screenshotHTML = appPreviews[sw.id] || `<div style="width:100%;aspect-ratio:16/10;background:linear-gradient(135deg,var(--bg-card),#1a3a6b);border-radius:var(--radius);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:var(--text-muted)"><span style="font-size:3rem">🖥️</span><span style="font-size:.9rem">Preview coming soon</span></div>`;
    }

    container.innerHTML = `
      <!-- Hero -->
      <section class="software-detail-hero">
        <div class="container">
          <div style="font-size:.82rem;color:var(--text-muted);margin-bottom:16px;">
            <a href="../index.html" style="color:var(--accent-light);">Home</a> ›
            <a href="../software.html" style="color:var(--accent-light);">Software</a> › ${esc(sw.name)}
          </div>
          <div class="software-detail-header">
            <div class="software-detail-icon">${sw.icon || '⚡'}</div>
            <div style="flex:1;">
              <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;">
                <span class="badge badge-teal">v${esc(sw.version)}</span>
                <span class="badge badge-green">✓ Windows 10/11</span>
                ${sw.fileSize ? `<span class="badge badge-gold">${esc(sw.fileSize)}</span>` : ''}
                <span class="virus-badge">🛡️ Virus Free</span>
                ${released ? `<span class="updated-badge">📅 ${released}</span>` : ''}
              </div>
              <h1 style="font-size:clamp(2rem,4vw,3rem);font-weight:900;letter-spacing:-1px;margin-bottom:12px;">${esc(sw.name)}</h1>
              <p style="color:var(--text-secondary);font-size:1.05rem;line-height:1.7;max-width:640px;">${esc(sw.description)}</p>
              <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px;">
                ${isReady
                  ? `<a href="${esc(url)}" class="btn btn-primary btn-lg"
                       data-download-trigger data-download-url="${esc(url)}"
                       data-software-name="${esc(sw.name)}" data-version="${esc(sw.version)}">
                       ⬇ Download Free — v${esc(sw.version)}
                     </a>`
                  : `<button class="btn btn-secondary btn-lg" disabled style="opacity:.6;cursor:not-allowed;">⬇ Coming Soon</button>`
                }
                <a href="../software.html" class="btn btn-secondary btn-lg">← All Software</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Content -->
      <div class="section">
        <div class="container">
          <div style="display:grid;grid-template-columns:1fr 320px;gap:48px;" class="detail-layout">

            <!-- Left -->
            <div>
              <div class="animate-on-scroll">
                <h2 class="section-title" style="font-size:1.5rem;margin-bottom:24px;">Preview</h2>
                ${screenshotHTML}
              </div>

              <div class="animate-on-scroll" style="margin-top:48px;">
                <h2 class="section-title" style="font-size:1.5rem;margin-bottom:24px;">Key Features</h2>
                <div class="features-big">${featureHTML}</div>
              </div>

              <div class="animate-on-scroll" style="margin-top:48px;">
                <h2 class="section-title" style="font-size:1.5rem;margin-bottom:24px;">Version History</h2>
                <div>${changelogHTML}</div>
              </div>

              <!-- Share -->
              <div class="share-section animate-on-scroll" style="margin-top:48px;">
                <div class="share-label">Share this software</div>
                <div class="share-btns">
                  <button class="share-btn share-whatsapp" onclick="shareOn('whatsapp')">📱 WhatsApp</button>
                  <button class="share-btn share-facebook" onclick="shareOn('facebook')">👍 Facebook</button>
                  <button class="share-btn share-twitter" onclick="shareOn('twitter')">𝕏 Twitter</button>
                  <button class="share-btn share-copy" onclick="navigator.clipboard.writeText(location.href).then(()=>{this.textContent='✓ Copied!'})">🔗 Copy Link</button>
                </div>
              </div>
            </div>

            <!-- Right sidebar -->
            <div class="download-sidebar animate-on-scroll" data-delay="100">
              <div class="download-box">
                <h4>Download</h4>
                <div class="download-btn-wrap">
                  ${isReady
                    ? `<a href="${esc(url)}" class="btn btn-primary"
                         style="width:100%;justify-content:center;font-size:1rem;padding:16px;"
                         data-download-trigger data-download-url="${esc(url)}"
                         data-software-name="${esc(sw.name)}" data-version="${esc(sw.version)}">
                         ⬇ Download Free
                       </a>`
                    : `<button disabled class="btn btn-secondary" style="width:100%;justify-content:center;opacity:.6;cursor:not-allowed;padding:16px;">Coming Soon</button>`
                  }
                </div>
                <div class="file-info" style="margin-top:14px;">
                  <div class="file-info-row"><span>Version</span><span>v${esc(sw.version)}</span></div>
                  <div class="file-info-row"><span>Size</span><span>${esc(sw.fileSize||'—')}</span></div>
                  <div class="file-info-row"><span>License</span><span>Freeware</span></div>
                  <div class="file-info-row"><span>Platform</span><span>Windows 10/11</span></div>
                  ${released ? `<div class="file-info-row"><span>Released</span><span>${released}</span></div>` : ''}
                </div>
                <div data-sw-dl-wrap style="margin-top:12px;text-align:center;font-size:.82rem;color:var(--text-muted);${sw.downloads > 0 ? '' : 'display:none'}">
                  <span data-sw-download-count="${sw.id}" style="color:var(--accent-light);font-weight:700;">${sw.downloads > 0 ? sw.downloads.toLocaleString() : '0'}</span> downloads
                </div>
              </div>

              <div class="download-box">
                <h4>Security</h4>
                <span class="virus-badge" style="font-size:.85rem;padding:8px 14px;justify-content:center;display:flex;">🛡️ Scanned — No Malware</span>
                <p style="font-size:.78rem;color:var(--text-muted);margin-top:10px;line-height:1.5;">No adware, no spyware. Clean software you can trust.</p>
              </div>

              <div class="download-box">
                <h4>System Requirements</h4>
                <div class="sys-req">${reqHTML}</div>
              </div>

              <div class="download-box" style="background:linear-gradient(135deg,rgba(0,200,150,0.08),rgba(0,200,150,0.02));border-color:rgba(0,200,150,0.25);">
                <h4>Support RBS ❤</h4>
                <p style="font-size:.85rem;color:var(--text-muted);margin-bottom:14px;line-height:1.5;">Keep RBS software free by making a small donation.</p>
                <a href="../donate.html" class="btn btn-outline btn-sm" style="width:100%;justify-content:center;">❤ Donate</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    updateCounterDisplay();
    if (window._rbsObserver) {
      container.querySelectorAll('.animate-on-scroll').forEach(el => window._rbsObserver.observe(el));
    }
  }

  /* ═══════════════════════════════════════
     BLOG PAGE
  ═══════════════════════════════════════ */
  function applyBlog() {
    const container = document.getElementById('rbs-blog-list');
    if (!container) return;

    // Static sample articles + any admin-added ones
    const staticArticles = [
      {
        id: 'life-dashboard-launch',
        title: 'Life Dashboard v1.0.0 — Your All-in-One Productivity App',
        excerpt: 'Track your habits, finances, sleep, diet, tasks, and goals all in one beautiful dashboard. 16 customisable widgets, drag-and-drop layout, all data stored locally. Free forever.',
        emoji: '📊',
        tag: 'News',
        date: '2026-04-14',
        url: 'blog/life-dashboard-launch.html'
      },
      {
        id: 'rbs-voice-cloner-launch',
        title: 'RBS Voice Cloner v1.0.0 — Free AI Voice Cloning for Windows',
        excerpt: 'Clone any voice in seconds with just a 5-second audio sample. RBS Voice Cloner uses the XTTS v2 AI engine to generate natural speech in 28+ languages — completely free and runs offline.',
        emoji: '🎙️',
        tag: 'News',
        date: '2026-04-12',
        url: 'blog/rbs-voice-cloner-launch.html'
      },
      {
        id: 'speed-windows-11',
        title: 'How to Speed Up Windows 11 in 2025',
        excerpt: 'Windows 11 can slow down over time with junk files, startup bloat, and background processes. Here are the most effective steps to restore peak performance.',
        emoji: '🚀',
        tag: 'Guide',
        date: '2025-01-10',
        url: 'blog/speed-windows-11.html'
      },
      {
        id: 'best-free-tools-2025',
        title: 'Best Free PC Optimization Tools 2025',
        excerpt: 'We compare the top free Windows optimization tools available today. Find out which ones actually work and which to avoid.',
        emoji: '🛠️',
        tag: 'Review',
        date: '2025-01-15',
        url: 'blog/best-free-tools-2025.html'
      },
      {
        id: 'how-to-free-up-ram-windows-11',
        title: 'How to Free Up RAM on Windows 11 — Complete Guide (2025)',
        excerpt: 'Is your Windows 11 PC running slow with high RAM usage? 10 proven free methods to free up RAM — from closing background apps to one-click optimization.',
        emoji: '💾',
        tag: 'Guide',
        date: '2025-03-01',
        url: 'blog/how-to-free-up-ram-windows-11.html'
      },
      {
        id: 'remove-dell-bloatware-windows-11',
        title: 'How to Remove Dell Bloatware from Windows 11',
        excerpt: 'Step-by-step guide to uninstalling Dell pre-installed apps on Windows 11 — speed up your Dell laptop and reclaim RAM and storage for free.',
        emoji: '🖥️',
        tag: 'Guide',
        date: '2025-03-08',
        url: 'blog/remove-dell-bloatware-windows-11.html'
      },
      {
        id: 'windows-11-running-slow-fix',
        title: 'Windows 11 Running Slow? 12 Ways to Fix It (Free)',
        excerpt: 'Windows 11 running slow on your PC? 12 step-by-step free fixes — from quick wins to deep optimizations. No reinstall, no paid software needed.',
        emoji: '🐌',
        tag: 'Guide',
        date: '2025-03-15',
        url: 'blog/windows-11-running-slow-fix.html'
      }
    ];

    let adminArticles = [];
    try { adminArticles = JSON.parse(localStorage.getItem('rbs_blog') || '[]'); } catch (_) {}

    const allArticles = [...adminArticles, ...staticArticles];

    container.innerHTML = allArticles.map(a => `
      <div class="blog-card animate-on-scroll" data-tag="${esc(a.tag || 'Article')}">
        <div class="blog-card-thumb">${a.emoji || '📝'}</div>
        <div class="blog-card-body">
          <div class="blog-card-tag">${esc(a.tag || 'Article')}</div>
          <a href="${esc(a.url || '#')}" class="blog-card-title">${esc(a.title)}</a>
          <p class="blog-card-excerpt">${esc(a.excerpt || '')}</p>
          <div class="blog-card-footer">
            <span>📅 ${formatDate(a.date)}</span>
            <a href="${esc(a.url || '#')}" class="blog-read-more">Read more →</a>
          </div>
        </div>
      </div>`).join('');

    if (window._rbsObserver) {
      container.querySelectorAll('.animate-on-scroll').forEach(el => window._rbsObserver.observe(el));
    }
  }

  /* ═══════════════════════════════════════
     FAQ PAGE
  ═══════════════════════════════════════ */
  function applyFaq() {
    const container = document.getElementById('rbs-faq-list');
    if (!container) return;

    // Only prepend admin-added FAQs — never overwrite the static HTML entries
    // (the static HTML has full categorised FAQs for all 3 apps with data-cat attributes)
    let adminFaqs = [];
    try { adminFaqs = JSON.parse(localStorage.getItem('rbs_faq') || '[]'); } catch (_) {}

    if (adminFaqs.length > 0) {
      const adminHtml = adminFaqs.map((item, i) => `
        <div class="faq-item" data-cat="general" id="faq-admin-${i}">
          <div class="faq-q">
            <span>${esc(item.q)}</span>
            <span class="faq-arrow">▾</span>
          </div>
          <div class="faq-a">${esc(item.a)}</div>
        </div>`).join('');
      container.insertAdjacentHTML('afterbegin', adminHtml);

      // Only wire up the newly-inserted admin items
      // (static HTML items are handled by main.js — adding listeners twice breaks accordion)
      container.querySelectorAll('[id^="faq-admin-"]').forEach(faqItem => {
        faqItem.querySelector('.faq-q')?.addEventListener('click', () => {
          const isOpen = faqItem.classList.contains('open');
          container.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
          if (!isOpen) faqItem.classList.add('open');
        });
      });
    }
  }

  /* ═══════════════════════════════════════
     COUNTER DISPLAY (all pages)
  ═══════════════════════════════════════ */
  function updateCounterDisplay() {
    const count = getCounter();
    document.querySelectorAll('.rbs-dl-counter').forEach(el => {
      el.textContent = count.toLocaleString();
    });
    const animEl = document.getElementById('download-count');
    if (animEl) animEl.dataset.target = count;
  }

  /* ═══════════════════════════════════════
     GITHUB REAL DOWNLOAD COUNTS
     Fetches actual download counts from GitHub
     Releases API (free, no auth needed for
     public repos). Updates counters silently
     in the background after page load.
  ═══════════════════════════════════════ */
  function fetchGitHubDownloads() {
    const REPO = 'baljinder21/RBSsoftware';
    const CACHE_KEY = 'rbs_gh_counts';
    const CACHE_TTL = 60 * 60 * 1000; // 1 hour

    // Map GitHub asset filename patterns → software id
    const ASSET_MAP = {
      'RBSOptimizerPro': 'rbs-optimizer-pro',
      'RBSVoiceCloner':  'rbs-voice-cloner',
      'Life-Dashboard':  'life-dashboard'
    };

    // Try cache first
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && (Date.now() - cached.ts) < CACHE_TTL) {
        applyGitHubCounts(cached.counts);
        return;
      }
    } catch (_) {}

    fetch(`https://api.github.com/repos/${REPO}/releases`)
      .then(r => r.ok ? r.json() : null)
      .then(releases => {
        if (!Array.isArray(releases)) return;
        const counts = {};
        releases.forEach(release => {
          (release.assets || []).forEach(asset => {
            for (const [pattern, id] of Object.entries(ASSET_MAP)) {
              if (asset.name.includes(pattern)) {
                counts[id] = (counts[id] || 0) + (asset.download_count || 0);
              }
            }
          });
        });
        // Cache result
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), counts })); } catch (_) {}
        applyGitHubCounts(counts);
      })
      .catch(() => {}); // Silently fail — works fine offline
  }

  function applyGitHubCounts(counts) {
    // Update software array with real counts
    software.forEach(sw => {
      if (counts[sw.id] != null) sw.downloads = counts[sw.id];
    });
    // Update any visible download count spans on the page
    document.querySelectorAll('[data-sw-download-count]').forEach(el => {
      const id = el.dataset.swDownloadCount;
      if (counts[id] != null && counts[id] > 0) {
        el.textContent = counts[id].toLocaleString();
        el.closest('[data-sw-dl-wrap]')?.style.setProperty('display', '');
      }
    });
    // Update homepage total counter
    const total = software.reduce((s, sw) => s + (sw.downloads || 0), 0);
    const animEl = document.getElementById('download-count');
    if (animEl && total > 0) animEl.dataset.target = total;
  }

  /* ═══════════════════════════════════════
     BOOT
  ═══════════════════════════════════════ */
  function run() {
    applyAnnouncement();
    applyHomepage();
    applySoftwareList();
    applyAbout();
    applyContact();
    applyDonate();
    applySoftware();
    applyDetailPage();
    applyBlog();
    applyFaq();
    applyFilters();
    updateCounterDisplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  // Try JSON fetch after initial render
  fetchAndMerge();

  // Fetch real GitHub download counts in background (non-blocking)
  setTimeout(fetchGitHubDownloads, 800);

  /* Expose for download.js */
  window.rbsSiteData = { updateCounterDisplay, getCounter };

})();
