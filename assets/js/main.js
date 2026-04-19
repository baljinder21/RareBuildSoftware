/* ============================================
   RBS - Main JavaScript
   Version: 1.0.0
   ============================================ */

/* ── Page Loader ── */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 400);
  }
});

/* ── Navbar: scroll state & active link ── */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    // Back-to-top button
    const btt = document.getElementById('back-to-top');
    if (btt) btt.classList.toggle('visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Highlight current page link
  const links = document.querySelectorAll('.nav-links a, .mobile-menu a');
  const page  = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── Hamburger / Mobile Menu ── */
(function initMobileMenu() {
  const btn    = document.querySelector('.hamburger');
  const menu   = document.querySelector('.mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    }
  });
})();

/* ── Back to Top ── */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── Scroll-triggered Animations ── */
(function initScrollAnimations() {
  const els = document.querySelectorAll('.animate-on-scroll');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Slight stagger for grouped elements
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => entry.target.classList.add('visible'), Number(delay));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  els.forEach(el => observer.observe(el));

  /* Expose so site-data.js can register dynamically injected elements */
  window._rbsObserver = observer;
})();

/* ── Copy-to-Clipboard ── */
function copyToClipboard(text, btnEl) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btnEl.textContent;
    btnEl.textContent = '✓ Copied!';
    btnEl.classList.add('copied');
    setTimeout(() => {
      btnEl.textContent = original;
      btnEl.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    // Fallback for older browsers / file:// protocol
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);

    const original = btnEl.textContent;
    btnEl.textContent = '✓ Copied!';
    btnEl.classList.add('copied');
    setTimeout(() => {
      btnEl.textContent = original;
      btnEl.classList.remove('copied');
    }, 2000);
  });
}

/* ── Animated Counter ── */
(function initCounter() {
  const el = document.getElementById('download-count');
  if (!el) return;

  /* Target is set by site-data.js after it reads localStorage.
     We watch for data-target mutations so counter fires with correct value. */
  function runAnimation() {
    const rawTarget = parseInt(el.dataset.target, 10);
    const target    = isNaN(rawTarget) ? 0 : rawTarget;
    if (target === 0) { el.textContent = '0'; return; }

    let current = 0;
    const duration = 1800; // ms
    const step     = Math.max(1, Math.ceil(target / (duration / 20)));
    const timer    = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 20);
  }

  let started = false;
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      /* Short delay to let site-data.js set the target first */
      setTimeout(runAnimation, 200);
    }
  }, { threshold: 0.3 });

  observer.observe(el);
  /* Expose for site-data.js to retrigger if needed */
  window._rbsCounterEl = el;
})();

/* ── Contact Form ── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const errEl = document.getElementById('form-error');

  function showErr(msg) {
    if (!errEl) return;
    errEl.textContent = msg;
    errEl.style.display = 'block';
    errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function hideErr() {
    if (errEl) errEl.style.display = 'none';
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    hideErr();

    // Validate
    const name    = (document.getElementById('contact-name')?.value    || '').trim();
    const email   = (document.getElementById('contact-email')?.value   || '').trim();
    const message = (document.getElementById('contact-message')?.value || '').trim();

    if (!name)    { showErr('Please enter your name.'); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showErr('Please enter a valid email address.'); return;
    }
    if (!message || message.length < 10) {
      showErr('Please enter a message (at least 10 characters).'); return;
    }

    const btn = form.querySelector('[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;
    form.querySelectorAll('input, textarea, select').forEach(el => el.disabled = true);

    // Get Formspree endpoint from admin settings (if configured), fallback to hardcoded default
    const DEFAULT_ENDPOINT = 'https://formspree.io/f/xykljzbr';
    let endpoint = DEFAULT_ENDPOINT;
    try {
      const c = JSON.parse(localStorage.getItem('rbs_content') || '{}');
      endpoint = (c.contact && c.contact.formEndpoint) || DEFAULT_ENDPOINT;
    } catch (_) {}

    if (endpoint) {
      // Real submission via Formspree (or any AJAX endpoint)
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name, email, message,
            subject: document.getElementById('contact-subject')?.value || 'General' })
        });
        if (res.ok) {
          form.style.display = 'none';
          const success = document.getElementById('form-success');
          if (success) success.style.display = 'block';
        } else {
          throw new Error('Server error ' + res.status);
        }
      } catch (err) {
        showErr('Failed to send your message. Please email us directly at support@rarebuildsoftware.com');
        btn.textContent = original;
        btn.disabled = false;
        form.querySelectorAll('input, textarea, select').forEach(el => el.disabled = false);
      }
    } else {
      // No endpoint configured — show success after short delay (demo mode)
      setTimeout(() => {
        form.style.display = 'none';
        const success = document.getElementById('form-success');
        if (success) success.style.display = 'block';
      }, 900);
    }
  });
})();

/* ── Smooth scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Theme Preferences: Apply saved values immediately ── */
(function applyThemePrefs() {
  const theme  = localStorage.getItem('rbs_theme');
  const accent = localStorage.getItem('rbs_accent_color');
  const fsVal  = localStorage.getItem('rbs_font_size') || '16px';
  const isLight = theme === 'light';

  if (isLight) document.body.classList.add('light-mode');

  function hexToRgba(hex, a) {
    if (!hex || hex.length < 4) return null;
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1]+hex[1], 16); g = parseInt(hex[2]+hex[2], 16); b = parseInt(hex[3]+hex[3], 16);
    } else {
      r = parseInt(hex.slice(1,3), 16); g = parseInt(hex.slice(3,5), 16); b = parseInt(hex.slice(5,7), 16);
    }
    return `rgba(${r},${g},${b},${a})`;
  }
  function shiftHex(hex, amt) {
    if (!hex || hex.length < 4) return hex;
    let r = parseInt(hex.slice(1,3), 16);
    let g = parseInt(hex.slice(3,5), 16);
    let b = parseInt(hex.slice(5,7), 16);
    r = Math.min(255, Math.max(0, r + amt));
    g = Math.min(255, Math.max(0, g + amt));
    b = Math.min(255, Math.max(0, b + amt));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  if (accent) {
    const root = document.documentElement;
    root.style.setProperty('--accent',        accent);
    root.style.setProperty('--accent-hover',  shiftHex(accent, -20));
    root.style.setProperty('--accent-light',  shiftHex(accent, 40));
    const b15 = hexToRgba(accent, 0.15); if (b15) root.style.setProperty('--border', b15);
    const b45 = hexToRgba(accent, 0.45); if (b45) root.style.setProperty('--border-hover', b45);
    const sh  = hexToRgba(accent, 0.22); if (sh)  root.style.setProperty('--shadow-accent', `0 4px 32px ${sh}`);
  }

  /* Restore bg from mode-specific storage (set by theme presets) */
  const bgColLight = localStorage.getItem('rbs_light_bg') || localStorage.getItem('rbs_bg_color');
  const bgColDark  = localStorage.getItem('rbs_dark_bg');
  const bgRestore  = isLight ? bgColLight : bgColDark;
  if (bgRestore) {
    document.documentElement.style.setProperty('--bg-primary', bgRestore);
    document.addEventListener('DOMContentLoaded', () => {
      document.body.style.setProperty('--bg-primary', bgRestore);
    });
  }

  /* Always apply content font size via CSS variable (headings/nav stay fixed) */
  const fsRem = fsVal === '18px' ? '1.125rem' : fsVal === '14px' ? '0.875rem' : '1rem';
  document.documentElement.style.setProperty('--content-font-size', fsRem);
  document.body.style.fontSize = fsVal; /* fallback for elements that inherit */
})();

/* ── Dark / Light Mode (basic toggle on theme-toggle button) ── */
(function initThemeToggle() {
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    function updateIcon() {
      const isLight = document.body.classList.contains('light-mode');
      btn.textContent = isLight ? '🌙' : '☀️';
      btn.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
    }
    updateIcon();
    btn.addEventListener('click', () => {
      const willBeLight = !document.body.classList.contains('light-mode');
      document.body.classList.toggle('light-mode', willBeLight);

      if (willBeLight) {
        /* Going light: restore light bg if set */
        const lightBg = localStorage.getItem('rbs_light_bg') || localStorage.getItem('rbs_bg_color');
        if (lightBg) {
          document.documentElement.style.setProperty('--bg-primary', lightBg);
          document.body.style.setProperty('--bg-primary', lightBg);
        }
      } else {
        /* Going dark: restore dark preset bg if set, else CSS default takes over */
        const darkBg = localStorage.getItem('rbs_dark_bg');
        if (darkBg) {
          document.documentElement.style.setProperty('--bg-primary', darkBg);
          document.body.style.setProperty('--bg-primary', darkBg);
        } else {
          document.documentElement.style.removeProperty('--bg-primary');
          document.body.style.removeProperty('--bg-primary');
        }
      }

      localStorage.setItem('rbs_theme', willBeLight ? 'light' : 'dark');
      updateIcon();
      const sw = document.getElementById('panel-mode-switch');
      if (sw) sw.classList.toggle('dark', !willBeLight);
      if (typeof window._rbsUpdateBgSection === 'function') window._rbsUpdateBgSection();
    });
  });
})();

/* ── Theme Customizer Panel ── */
(function initThemePanel() {
  /* Full theme presets — each sets mode + bg + accent */
  const THEMES = [
    { id: 'midnight-blue', name: 'Midnight Blue', dark: true,  bg: '#0d1b2e', accent: '#00c896' },
    { id: 'pure-black',    name: 'Pure Black',    dark: true,  bg: '#000000', accent: '#00c896' },
    { id: 'dark-purple',   name: 'Dark Purple',   dark: true,  bg: '#1a0a2e', accent: '#7c3aed' },
    { id: 'dark-forest',   name: 'Dark Forest',   dark: true,  bg: '#0a1f14', accent: '#22c55e' },
    { id: 'dark-red',      name: 'Dark Red',      dark: true,  bg: '#1f0a0a', accent: '#ef4444' },
    { id: 'sky-light',     name: 'Sky Light',     dark: false, bg: '#f0f4ff', accent: '#0066ff' },
    { id: 'pure-white',    name: 'Pure White',    dark: false, bg: '#ffffff', accent: '#00c896' },
    { id: 'warm-cream',    name: 'Warm Cream',    dark: false, bg: '#fef9f0', accent: '#f97316' },
    { id: 'mint-fresh',    name: 'Mint Fresh',    dark: false, bg: '#f0fff4', accent: '#22c55e' },
    { id: 'lavender',      name: 'Lavender',      dark: false, bg: '#f5f0ff', accent: '#7c3aed' },
    { id: 'rose',          name: 'Rose',          dark: false, bg: '#fff0f5', accent: '#ec4899' },
    { id: 'sunset',        name: 'Sunset',        dark: false, bg: '#fff5f0', accent: '#f97316' },
  ];

  /* Accent-only quick presets */
  const ACCENT_PRESETS = [
    { name: 'Teal Green',    color: '#00c896' },
    { name: 'Electric Blue', color: '#0066ff' },
    { name: 'Purple',        color: '#7c3aed' },
    { name: 'Pink',          color: '#ec4899' },
    { name: 'Orange',        color: '#f97316' },
    { name: 'Red',           color: '#ef4444' },
    { name: 'Yellow',        color: '#eab308' },
    { name: 'Cyan',          color: '#06b6d4' },
    { name: 'Lime Green',    color: '#84cc16' },
    { name: 'White',         color: '#f8fafc' }
  ];


  function hexToRgba(hex, a) {
    if (!hex || hex.length < 4) return null;
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  function shiftHex(hex, amt) {
    if (!hex || hex.length < 4) return hex;
    let r = parseInt(hex.slice(1,3), 16);
    let g = parseInt(hex.slice(3,5), 16);
    let b = parseInt(hex.slice(5,7), 16);
    r = Math.min(255, Math.max(0, r + amt));
    g = Math.min(255, Math.max(0, g + amt));
    b = Math.min(255, Math.max(0, b + amt));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  function applyAccent(color, save) {
    if (!color || color.length < 4) return;
    const root = document.documentElement;
    root.style.setProperty('--accent',        color);
    root.style.setProperty('--accent-hover',  shiftHex(color, -20));
    root.style.setProperty('--accent-light',  shiftHex(color, 40));
    const b15 = hexToRgba(color, 0.15); if (b15) root.style.setProperty('--border', b15);
    const b45 = hexToRgba(color, 0.45); if (b45) root.style.setProperty('--border-hover', b45);
    const sh  = hexToRgba(color, 0.22); if (sh)  root.style.setProperty('--shadow-accent', `0 4px 32px ${sh}`);
    if (save) localStorage.setItem('rbs_accent_color', color);
  }

  /* Exposed globally so nav toggle can call it after mode change */
  window._rbsUpdateBgSection = function() {
    const savedPreset = localStorage.getItem('rbs_theme_preset') || '';
    document.querySelectorAll('.theme-preset-card').forEach(card => {
      card.classList.toggle('active', card.dataset.themeId === savedPreset);
    });
  };

  /* Apply a full theme preset */
  function applyTheme(id) {
    const t = THEMES.find(th => th.id === id);
    if (!t) return;
    const isCurrentlyLight = document.body.classList.contains('light-mode');
    if (t.dark && isCurrentlyLight) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('rbs_theme', 'dark');
      const panelSw = document.getElementById('panel-mode-switch');
      if (panelSw) panelSw.classList.add('dark');
      const navBtn = document.getElementById('theme-toggle');
      if (navBtn) { navBtn.textContent = '☀️'; navBtn.title = 'Switch to light mode'; }
    } else if (!t.dark && !isCurrentlyLight) {
      document.body.classList.add('light-mode');
      localStorage.setItem('rbs_theme', 'light');
      const panelSw = document.getElementById('panel-mode-switch');
      if (panelSw) panelSw.classList.remove('dark');
      const navBtn = document.getElementById('theme-toggle');
      if (navBtn) { navBtn.textContent = '🌙'; navBtn.title = 'Switch to dark mode'; }
    }
    document.documentElement.style.setProperty('--bg-primary', t.bg);
    document.body.style.setProperty('--bg-primary', t.bg);
    localStorage.setItem('rbs_bg_color', t.bg);
    if (t.dark) localStorage.setItem('rbs_dark_bg', t.bg);
    else        localStorage.setItem('rbs_light_bg', t.bg);
    applyAccent(t.accent, true);
    localStorage.setItem('rbs_theme_preset', id);
    document.querySelectorAll('.theme-preset-card').forEach(card =>
      card.classList.toggle('active', card.dataset.themeId === id));
    document.querySelectorAll('.color-swatch').forEach(s =>
      s.classList.toggle('active', s.dataset.color === t.accent));
    const accentPicker = document.getElementById('custom-accent-picker');
    if (accentPicker) accentPicker.value = t.accent.length === 7 ? t.accent : '#00c896';
  }
  window._rbsApplyTheme = applyTheme;

  document.addEventListener('DOMContentLoaded', () => {
    /* Inject palette button next to theme-toggle in nav */
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn && toggleBtn.closest('li')) {
      const li = document.createElement('li');
      li.innerHTML = `<button class="theme-palette-btn" id="theme-palette-btn" title="Theme settings" aria-label="Customize theme">🎨</button>`;
      toggleBtn.closest('li').after(li);
    }

    const savedAccent   = localStorage.getItem('rbs_accent_color') || '#00c896';
    const savedFontSize = localStorage.getItem('rbs_font_size') || '16px';
    const savedPreset   = localStorage.getItem('rbs_theme_preset') || '';
    const isLight       = document.body.classList.contains('light-mode');

    const swatchesHTML = ACCENT_PRESETS.map(p =>
      `<div class="color-swatch${savedAccent === p.color ? ' active' : ''}"
           style="background:${p.color}" title="${p.name}"
           data-color="${p.color}"
           onmouseenter="window._rbsPreviewAccent('${p.color}')"
           onmouseleave="window._rbsPreviewAccent(null)"
           onclick="window._rbsSetAccent('${p.color}')"></div>`
    ).join('');

    function themeCard(t) {
      const border = t.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
      return `<div class="theme-preset-card${savedPreset === t.id ? ' active' : ''}"
           data-theme-id="${t.id}" onclick="window._rbsApplyTheme('${t.id}')" title="${t.name}">
         <div class="theme-card-preview" style="background:${t.bg};border:1px solid ${border};">
           <div class="theme-card-accent-bar" style="background:${t.accent};"></div>
         </div>
         <div class="theme-card-name">${t.name}</div>
         <div class="theme-card-check">✓</div>
       </div>`;
    }
    const darkThemesHTML  = THEMES.filter(t =>  t.dark).map(themeCard).join('');
    const lightThemesHTML = THEMES.filter(t => !t.dark).map(themeCard).join('');

    const fontHTML = [
      {label:'S', size:'14px'}, {label:'M', size:'16px'}, {label:'L', size:'18px'}
    ].map(f =>
      `<button class="font-size-btn${savedFontSize===f.size?' active':''}"
               data-size="${f.size}" onclick="window._rbsSetFont(this)"
               style="font-size:${f.label==='S'?'.8rem':f.label==='L'?'1.05rem':'.95rem'}">${f.label}</button>`
    ).join('');

    const panelHTML = `
    <div id="theme-panel" role="dialog" aria-label="Theme settings">
      <div class="theme-panel-header">
        <strong style="font-size:.95rem;">🎨 Theme Settings</strong>
        <button class="theme-panel-close" id="theme-panel-close" aria-label="Close theme panel">✕</button>
      </div>

      <div class="theme-panel-row">
        <span>🌙 Dark mode</span>
        <div class="panel-mode-switch${isLight ? '' : ' dark'}" id="panel-mode-switch" role="switch" aria-checked="${!isLight}" tabindex="0"></div>
      </div>

      <div class="theme-panel-label">Accent Color</div>
      <div class="color-swatches" id="accent-swatches">${swatchesHTML}</div>
      <div class="custom-color-row">
        <label for="custom-accent-picker">Custom:</label>
        <input type="color" id="custom-accent-picker" value="${savedAccent}"
               title="Pick any accent color"
               oninput="window._rbsSetAccent(this.value)">
      </div>

      <div class="theme-panel-label">Theme Presets</div>
      <div class="theme-group-label">🌙 Dark</div>
      <div class="theme-preset-grid">${darkThemesHTML}</div>
      <div class="theme-group-label" style="margin-top:10px;">☀️ Light</div>
      <div class="theme-preset-grid">${lightThemesHTML}</div>

      <div class="theme-panel-label">Font Size</div>
      <div class="font-size-btns">${fontHTML}</div>

      <button class="theme-reset-btn" onclick="window._rbsResetTheme()">↺ Reset to Default</button>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', panelHTML);

    /* Mode switch click */
    const sw = document.getElementById('panel-mode-switch');
    if (sw) {
      const toggleMode = () => {
        const willBeDark = !sw.classList.contains('dark');
        sw.classList.toggle('dark', willBeDark);
        document.body.classList.toggle('light-mode', !willBeDark);

        if (willBeDark) {
          /* Going dark: restore dark preset bg if any, else CSS default */
          const darkBg = localStorage.getItem('rbs_dark_bg');
          if (darkBg) {
            document.documentElement.style.setProperty('--bg-primary', darkBg);
            document.body.style.setProperty('--bg-primary', darkBg);
          } else {
            document.documentElement.style.removeProperty('--bg-primary');
            document.body.style.removeProperty('--bg-primary');
          }
        } else {
          /* Going light: restore light preset bg if any */
          const lightBg = localStorage.getItem('rbs_light_bg') || localStorage.getItem('rbs_bg_color');
          if (lightBg) {
            document.documentElement.style.setProperty('--bg-primary', lightBg);
            document.body.style.setProperty('--bg-primary', lightBg);
          }
        }

        localStorage.setItem('rbs_theme', willBeDark ? 'dark' : 'light');
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.textContent = willBeDark ? '☀️' : '🌙';
      };
      sw.addEventListener('click', toggleMode);
      sw.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') toggleMode(); });
    }

    /* Palette button toggle */
    document.addEventListener('click', e => {
      const palBtn = document.getElementById('theme-palette-btn');
      const panel  = document.getElementById('theme-panel');
      if (!panel) return;
      if (palBtn && palBtn.contains(e.target)) {
        panel.classList.toggle('open');
      } else if (panel.classList.contains('open') && !panel.contains(e.target)) {
        panel.classList.remove('open');
      }
    });

    /* Close button */
    document.getElementById('theme-panel-close')?.addEventListener('click', () => {
      document.getElementById('theme-panel')?.classList.remove('open');
    });

    /* Expose globals */
    let _previewActive = false;
    window._rbsPreviewAccent = function(color) {
      if (color) {
        _previewActive = true;
        document.documentElement.style.setProperty('--accent', color);
        document.documentElement.style.setProperty('--accent-light', shiftHex(color, 40));
      } else if (_previewActive) {
        _previewActive = false;
        const saved2 = localStorage.getItem('rbs_accent_color') || '#00c896';
        applyAccent(saved2, false);
      }
    };

    window._rbsSetAccent = function(color) {
      applyAccent(color, true);
      document.querySelectorAll('.color-swatch').forEach(s =>
        s.classList.toggle('active', s.dataset.color === color));
      const picker = document.getElementById('custom-accent-picker');
      if (picker) picker.value = color.length === 7 ? color : '#00c896';
    };

    window._rbsSetFont = function(el) {
      const size = el.dataset.size;
      /* Set CSS variable — applied only to content selectors in CSS, never headings or nav */
      const sizeRem = size === '18px' ? '1.125rem' : size === '14px' ? '0.875rem' : '1rem';
      document.documentElement.style.setProperty('--content-font-size', sizeRem);
      document.body.style.fontSize = size; /* fallback for elements that inherit from body */
      localStorage.setItem('rbs_font_size', size);
      document.querySelectorAll('.font-size-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
    };

    window._rbsResetTheme = function() {
      const DEFAULT_ACCENT = '#00c896';
      const DEFAULT_FS     = '16px';

      /* 1. Clear all saved theme preferences */
      ['rbs_accent_color','rbs_font_size','rbs_bg_color','rbs_light_bg','rbs_dark_bg','rbs_theme','rbs_theme_preset'].forEach(k => localStorage.removeItem(k));

      /* 2. Restore dark mode — clear any inline bg override */
      document.body.classList.remove('light-mode');
      document.documentElement.style.removeProperty('--bg-primary');
      document.body.style.removeProperty('--bg-primary');

      /* 3. Restore default accent color */
      applyAccent(DEFAULT_ACCENT, false);

      /* 4. Restore default font size */
      document.documentElement.style.setProperty('--content-font-size', '1rem');
      document.body.style.fontSize = DEFAULT_FS;

      /* 5. Sync panel mode switch → dark (switch shows "on" for dark) */
      const panelSw = document.getElementById('panel-mode-switch');
      if (panelSw) panelSw.classList.add('dark');

      /* 6. Sync nav theme-toggle icon → sun (☀️ = currently dark, click to go light) */
      const navBtn = document.getElementById('theme-toggle');
      if (navBtn) { navBtn.textContent = '☀️'; navBtn.title = 'Switch to light mode'; }

      /* 7. Reset accent swatches */
      document.querySelectorAll('.color-swatch').forEach(s =>
        s.classList.toggle('active', s.dataset.color === DEFAULT_ACCENT));
      const accentPicker = document.getElementById('custom-accent-picker');
      if (accentPicker) accentPicker.value = DEFAULT_ACCENT;

      /* 8. Reset theme preset cards */
      document.querySelectorAll('.theme-preset-card').forEach(o => o.classList.remove('active'));

      /* 9. Reset font size buttons */
      document.querySelectorAll('.font-size-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.size === DEFAULT_FS));
    };
  });
})();

/* ── Cookie Consent Banner ── */
(function initCookieBanner() {
  if (localStorage.getItem('rbs_cookies_accepted')) return;
  document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    banner.classList.add('show');
    banner.querySelector('#cookie-accept')?.addEventListener('click', () => {
      localStorage.setItem('rbs_cookies_accepted', '1');
      banner.classList.remove('show');
    });
    banner.querySelector('#cookie-decline')?.addEventListener('click', () => {
      localStorage.setItem('rbs_cookies_accepted', '0');
      banner.classList.remove('show');
    });
  });
})();

/* ── Header Search ── */
(function initSearch() {
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('nav-search');
    const dropdown = document.getElementById('search-results');
    if (!input || !dropdown) return;

    function getSoftware() {
      try {
        if (window._rbsSoftware && window._rbsSoftware.length) return window._rbsSoftware;
        const v = localStorage.getItem('rbs_software');
        if (v) return JSON.parse(v);
      } catch (_) {}
      return [];
    }

    /* Inject X clear button into search bar */
    const clearBtn = document.createElement('button');
    clearBtn.id = 'nav-search-clear';
    clearBtn.innerHTML = '✕';
    clearBtn.setAttribute('aria-label', 'Clear search');
    clearBtn.style.cssText = 'display:none;position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:.85rem;padding:2px 6px;line-height:1;';
    const searchWrap = input.parentElement;
    searchWrap.style.position = 'relative';
    searchWrap.appendChild(clearBtn);
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      dropdown.classList.remove('show');
      input.focus();
    });

    function renderResults(q) {
      const ql = q.toLowerCase();
      const sw = getSoftware().filter(s => s.visible !== false);
      const matches = q.length < 2 ? [] : sw.filter(s =>
        s.name.toLowerCase().includes(ql) ||
        (s.description || '').toLowerCase().includes(ql) ||
        (s.category || '').toLowerCase().includes(ql)
      );

      // Also search blog and FAQ from localStorage
      const extraPages = [
        { icon: '❓', name: 'FAQ', desc: 'Common questions answered', url: 'faq.html' },
        { icon: '📝', name: 'Blog', desc: 'Tips and guides', url: 'blog.html' },
      ].filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.desc.toLowerCase().includes(q.toLowerCase()));

      const all = [
        ...matches.map(s => ({ icon: '⚡', name: s.name, desc: (s.description||'').slice(0,60)+'…', url: `software/detail.html?id=${s.id}` })),
        ...extraPages
      ];

      if (!all.length) {
        dropdown.innerHTML = `<div class="search-result-item" style="pointer-events:none;color:var(--text-muted);">No results for "${q}"</div>`;
        dropdown.classList.add('show');
        return;
      }
      dropdown.innerHTML = all.map(r =>
        `<a class="search-result-item" href="${r.url}">
          <span class="search-result-icon">${r.icon}</span>
          <div><div class="search-result-name">${r.name}</div><div class="search-result-desc">${r.desc}</div></div>
        </a>`
      ).join('');
      dropdown.classList.add('show');
    }

    input.addEventListener('input', () => {
      const q = input.value.trim();
      clearBtn.style.display = q ? 'block' : 'none';
      if (!q) { dropdown.classList.remove('show'); return; }
      renderResults(q);
    });

    document.addEventListener('click', e => {
      if (!input.contains(e.target) && !dropdown.contains(e.target) && e.target !== clearBtn) {
        dropdown.classList.remove('show');
      }
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { dropdown.classList.remove('show'); input.blur(); }
      if (e.key === 'Enter' && input.value.trim()) {
        window.location.href = 'software.html?q=' + encodeURIComponent(input.value.trim());
      }
    });
  });
})();

/* ── FAQ Accordion ── */
(function initFaq() {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-item').forEach(item => {
      const q = item.querySelector('.faq-q');
      if (!q) return;
      q.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  });
})();

/* ── Newsletter Form ── */
(function initNewsletter() {
  function subscribeEmail(email, name) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    const subs = JSON.parse(localStorage.getItem('rbs_subscribers') || '[]');
    if (!subs.find(s => s.email === email)) {
      subs.push({ email, name: name || '', date: new Date().toISOString() });
      localStorage.setItem('rbs_subscribers', JSON.stringify(subs));
    }
    return true;
  }
  window.rbsSubscribeEmail = subscribeEmail; // expose for popup use

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.newsletter-form').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const emailInput = form.querySelector('.newsletter-input');
        const nameInput  = form.querySelector('.newsletter-name-input');
        if (!emailInput) return;
        const email = emailInput.value.trim();
        const name  = nameInput ? nameInput.value.trim() : '';
        if (!subscribeEmail(email, name)) {
          emailInput.style.borderColor = '#ff4d4d';
          setTimeout(() => emailInput.style.borderColor = '', 2000);
          return;
        }
        emailInput.value = '';
        if (nameInput) nameInput.value = '';
        const successEl = form.parentElement.querySelector('.newsletter-success');
        if (successEl) successEl.style.display = 'block';
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = '✓ Subscribed!';
      });
    });
  });
})();

/* ── Social Share Buttons ── */
function shareOn(platform, url, title) {
  url = url || location.href;
  title = title || document.title;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const links = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    facebook:  `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter:   `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
  };
  if (links[platform]) window.open(links[platform], '_blank', 'width=600,height=400');
}

/* ── Copy Data Buttons ── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => copyToClipboard(btn.dataset.copy, btn));
  });
});

/* Download popup + donation popup: see assets/js/download.js */
