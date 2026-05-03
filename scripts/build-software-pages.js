/*
 * Generates a static HTML page per software product at /software/<slug>.html.
 *
 * Why: the existing /software/detail.html?id=<slug> URL renders the entire
 * page client-side from DEFAULT_SOFTWARE. Crawlers without JS execution
 * (Bing, Twitter share scrapers, the first Googlebot pass) see only a
 * "Loading software details…" placeholder. This script bakes the full
 * content into static HTML that's visible to every crawler immediately,
 * with proper per-app <title>, <meta description>, OpenGraph and
 * SoftwareApplication JSON-LD.
 *
 * The dynamic detail.html?id= URLs continue to work as a fallback. Netlify
 * is configured to 301-redirect them to the new canonical URLs.
 *
 * Run after editing DEFAULT_SOFTWARE in site-data.js:
 *   node scripts/build-software-pages.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'software');
const SITE = 'https://rarebuildsoftware.com';

const src = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'site-data.js'), 'utf-8');
const m = src.match(/const DEFAULT_SOFTWARE = (\[[\s\S]+?\n  \]);/);
if (!m) throw new Error('DEFAULT_SOFTWARE not found');
const software = eval(m[1]);

// ── Helpers ──
function decodeHtml(s) {
  return String(s||'')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'");
}
function escAttr(s) { return decodeHtml(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escText(s) { return decodeHtml(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function fmtDate(iso) {
  if (!iso) return '';
  const M = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const [y, mm, d] = iso.split('-').map(Number);
  return M[mm-1] + ' ' + d + ', ' + y;
}

// ── Per-app rendering ──
function renderIcon(sw) {
  if (sw.iconImage) {
    return '<img src="' + escAttr('..' + sw.iconImage) + '" alt="' + escAttr(sw.name) + ' icon" style="width:100%;height:100%;object-fit:contain;display:block;border-radius:inherit;" />';
  }
  return sw.icon || '📦';
}

function renderScreenshot(sw) {
  if (sw.screenshotPath) {
    return '<img src="' + escAttr('..' + sw.screenshotPath) + '" alt="' + escAttr(sw.name) + ' screenshot" style="width:100%;border-radius:var(--radius);border:1px solid var(--border);display:block;" />';
  }
  // Fallback: plain branded panel (mirrors the JS fallback for apps without a real screenshot)
  return '<div style="width:100%;aspect-ratio:16/10;background:linear-gradient(135deg,var(--bg-card),#1a3a6b);border-radius:var(--radius);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:var(--text-muted);"><span style="font-size:3rem">' + (sw.icon||'🖥️') + '</span><span style="font-size:.95rem;font-weight:600;color:var(--text-secondary);">' + escText(sw.name) + '</span><span style="font-size:.78rem;">v' + escText(sw.version) + '</span></div>';
}

function renderFeatures(sw) {
  return (sw.features||[]).map(f =>
    '            <div class="feature-big-item">\n' +
    '              <div class="feature-big-icon">' + (f.icon||'•') + '</div>\n' +
    '              <div class="feature-big-text"><h4>' + escText(f.title) + '</h4><p>' + escText(f.desc) + '</p></div>\n' +
    '            </div>'
  ).join('\n');
}

function renderSysReqs(sw) {
  return (sw.sysReqs||[]).map(r =>
    '              <div class="sys-req-item"><span class="req-icon" style="color:var(--accent-light);">✔</span><span>' + escText(r) + '</span></div>'
  ).join('\n');
}

function renderChangelog(sw) {
  if (!sw.changelog || !sw.changelog.length) return '<p style="color:var(--text-muted);">Changelog coming soon.</p>';
  return sw.changelog.map(cl =>
    '            <div class="changelog-item">\n' +
    '              <div class="changelog-version">\n' +
    '                <span class="changelog-version-num">v' + escText(cl.version) + '</span>\n' +
    '                <span class="badge badge-teal" style="font-size:.7rem;">Latest</span>\n' +
    (cl.date ? '                <span class="changelog-date">' + fmtDate(cl.date) + '</span>\n' : '') +
    '              </div>\n' +
    '              <ul class="changelog-list">\n' +
    (cl.notes||[]).map(n => '                <li>' + escText(n) + '</li>').join('\n') + '\n' +
    '              </ul>\n' +
    '            </div>'
  ).join('\n');
}

function renderRelatedApps(sw) {
  const others = software.filter(o => o.id !== sw.id && o.visible !== false);
  return others.map(o =>
    '            <a href="' + escAttr(o.id) + '.html" style="display:block;padding:16px;background:var(--bg-card,#111d2c);border:1px solid var(--border,#1e2d40);border-radius:10px;text-decoration:none;transition:transform .15s, border-color .15s;" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.borderColor=\'var(--accent-light)\'" onmouseout="this.style.transform=\'\';this.style.borderColor=\'var(--border, #1e2d40)\'">\n' +
    '              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">\n' +
    '                <span style="font-size:1.6rem;line-height:1;">' + (o.icon||'📦') + '</span>\n' +
    '                <span style="color:var(--text-primary,#fff);font-weight:700;font-size:.98rem;line-height:1.2;">' + escText(o.name) + '</span>\n' +
    '              </div>\n' +
    '              <p style="color:var(--text-muted);font-size:.82rem;line-height:1.5;margin:0 0 10px;">' + escText((o.description||'').slice(0,110)) + ((o.description||'').length>110?'…':'') + '</p>\n' +
    '              <span style="color:var(--accent-light);font-size:.82rem;font-weight:600;">View details →</span>\n' +
    '            </a>'
  ).join('\n');
}

function buildJsonLd(sw) {
  const url = SITE + '/software/' + sw.id + '.html';
  const screenshotUrl = sw.screenshotPath ? SITE + sw.screenshotPath : SITE + '/assets/images/og/software.svg';
  const swSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': decodeHtml(sw.name),
    'operatingSystem': 'Windows 10, Windows 11',
    'applicationCategory': sw.category === 'AI Tools' ? 'MultimediaApplication' : 'UtilitiesApplication',
    'softwareVersion': sw.version,
    'fileSize': sw.fileSize || '',
    'description': decodeHtml(sw.description),
    'url': url,
    'downloadUrl': sw.downloadUrl || '',
    'image': screenshotUrl,
    'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD', 'availability': 'https://schema.org/InStock' },
    'author':    { '@type': 'Person',       'name': 'Rai', 'url': SITE + '/about.html' },
    'publisher': { '@type': 'Organization', 'name': 'RBS', 'url': SITE, 'logo': { '@type': 'ImageObject', 'url': SITE + '/assets/images/favicon.svg' } }
  };
  if (sw.released) swSchema.datePublished = sw.released;
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home',     'item': SITE + '/' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Software', 'item': SITE + '/software.html' },
      { '@type': 'ListItem', 'position': 3, 'name': decodeHtml(sw.name), 'item': url }
    ]
  };
  return '<script type="application/ld+json">' + JSON.stringify(swSchema) + '</script>\n' +
         '  <script type="application/ld+json">' + JSON.stringify(breadcrumb) + '</script>';
}

// ── Page builder ──
function buildPage(sw) {
  const url = SITE + '/software/' + sw.id + '.html';
  const title = decodeHtml(sw.name) + ' v' + sw.version + ' — Free for Windows | RBS';
  const desc = (decodeHtml(sw.description) + ' Free download for Windows 10/11, version ' + sw.version + ', ' + (sw.fileSize||'') + '.').replace(/\s+/g,' ').trim();
  const ogImage = sw.screenshotPath ? SITE + sw.screenshotPath : SITE + '/assets/images/og/software.svg';
  const released = sw.released ? fmtDate(sw.released) : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escAttr(desc)}" />
  <meta name="keywords" content="${escAttr(sw.name)}, free ${escAttr(sw.category||'Windows software')}, ${escAttr(sw.name)} download, free windows software, ${escAttr(sw.name)} v${escAttr(sw.version)}, no subscription windows app" />
  <title>${escText(title)}</title>

  <link rel="icon" type="image/svg+xml" href="../assets/images/favicon.svg" />

  <meta property="og:type"        content="website" />
  <meta property="og:site_name"   content="RBS" />
  <meta property="og:title"       content="${escAttr(decodeHtml(sw.name))} — Free for Windows" />
  <meta property="og:description" content="${escAttr(desc)}" />
  <meta property="og:url"         content="${url}" />
  <meta property="og:image"       content="${escAttr(ogImage)}" />
  <meta name="twitter:card"       content="summary_large_image" />
  <link rel="canonical"           href="${url}" />

  ${buildJsonLd(sw)}

  <link rel="preload" href="../assets/css/style.css" as="style" />
  <link rel="stylesheet" href="../assets/css/style.css" />
</head>
<body>

  <a href="#main-content" class="skip-link">Skip to main content</a>
  <div id="page-loader"><div class="loader-ring"></div></div>

  <nav class="navbar">
    <div class="nav-container">
      <a href="../index.html" class="nav-logo"><div class="logo-icon">RBS</div>RBS</a>
      <ul class="nav-links">
        <li><a href="../index.html">Home</a></li>
        <li><a href="../software.html" class="active">Software</a></li>
        <li><a href="../blog.html">Blog</a></li>
        <li><a href="../faq.html">FAQ</a></li>
        <li><a href="../about.html">About</a></li>
        <li><a href="../contact.html">Contact</a></li>
        <li><button class="theme-toggle" id="theme-toggle" title="Toggle theme">☀️</button></li>
        <li><a href="../software.html" class="nav-cta">⬇ Download Free</a></li>
      </ul>
      <button class="hamburger" aria-label="Toggle menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </nav>

  <div class="mobile-menu">
    <a href="../index.html">Home</a>
    <a href="../software.html" class="active">Software</a>
    <a href="../blog.html">Blog</a>
    <a href="../faq.html">FAQ</a>
    <a href="../about.html">About</a>
    <a href="../contact.html">Contact</a>
    <a href="../software.html" class="nav-cta">⬇ Download Free</a>
  </div>

  <div id="rbs-announcement" style="display:none;"></div>

  <main id="main-content">

    <!-- Hero -->
    <section class="software-detail-hero">
      <div class="container">
        <div style="font-size:.82rem;color:var(--text-muted);margin-bottom:16px;">
          <a href="../index.html" style="color:var(--accent-light);">Home</a> ›
          <a href="../software.html" style="color:var(--accent-light);">Software</a> › ${escText(sw.name)}
        </div>
        <div class="software-detail-header">
          <div class="software-detail-icon">${renderIcon(sw)}</div>
          <div style="flex:1;">
            <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;">
              <span class="badge badge-teal">v${escText(sw.version)}</span>
              <span class="badge badge-green">✓ Windows 10/11</span>
              ${sw.fileSize ? `<span class="badge badge-gold">${escText(sw.fileSize)}</span>` : ''}
              <span class="virus-badge">🛡️ Virus Free</span>
              ${released ? `<span class="updated-badge">📅 ${released}</span>` : ''}
            </div>
            <h1 style="font-size:clamp(2rem,4vw,3rem);font-weight:900;letter-spacing:-1px;margin-bottom:12px;">${escText(sw.name)}</h1>
            <p style="color:var(--text-secondary);font-size:1.05rem;line-height:1.7;max-width:640px;">${escText(sw.description)}</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px;">
              <a href="${escAttr(sw.downloadUrl)}" class="btn btn-primary btn-lg"
                 data-download-trigger data-download-url="${escAttr(sw.downloadUrl)}"
                 data-software-name="${escAttr(sw.name)}" data-version="${escAttr(sw.version)}">
                ⬇ Download Free — v${escText(sw.version)}
              </a>
              <a href="../software.html" class="btn btn-secondary btn-lg">← All Software</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Content -->
    <div class="section">
      <div class="container">
        <div class="detail-layout">

          <!-- Left -->
          <div>
            <div class="animate-on-scroll">
              <h2 class="section-title" style="font-size:1.5rem;margin-bottom:24px;">Preview</h2>
              ${renderScreenshot(sw)}
            </div>

            <div class="animate-on-scroll" style="margin-top:48px;">
              <h2 class="section-title" style="font-size:1.5rem;margin-bottom:24px;">Key Features</h2>
              <div class="features-big">
${renderFeatures(sw)}
              </div>
            </div>

            <div class="animate-on-scroll" style="margin-top:48px;">
              <h2 class="section-title" style="font-size:1.5rem;margin-bottom:24px;">Version History</h2>
              <div>
${renderChangelog(sw)}
              </div>
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

            <!-- More from RBS — cross-link to other free apps -->
            <div class="animate-on-scroll" style="margin-top:48px;">
              <h2 class="section-title" style="font-size:1.5rem;margin-bottom:8px;">More free apps from RBS</h2>
              <p style="color:var(--text-muted);font-size:.92rem;margin-bottom:24px;">Other tools by Rai — all free, all offline, no subscriptions.</p>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;">
${renderRelatedApps(sw)}
              </div>
            </div>
          </div>

          <!-- Right sidebar -->
          <div class="download-sidebar animate-on-scroll" data-delay="100">
            <div class="download-box">
              <h4>Download</h4>
              <div class="download-btn-wrap">
                <a href="${escAttr(sw.downloadUrl)}" class="btn btn-primary"
                   style="width:100%;justify-content:center;font-size:1rem;padding:16px;"
                   data-download-trigger data-download-url="${escAttr(sw.downloadUrl)}"
                   data-software-name="${escAttr(sw.name)}" data-version="${escAttr(sw.version)}">
                  ⬇ Download Free
                </a>
              </div>
              <div class="file-info" style="margin-top:14px;">
                <div class="file-info-row"><span>Version</span><span>v${escText(sw.version)}</span></div>
                <div class="file-info-row"><span>Size</span><span>${escText(sw.fileSize||'—')}</span></div>
                <div class="file-info-row"><span>License</span><span>Freeware</span></div>
                <div class="file-info-row"><span>Platform</span><span>Windows 10/11</span></div>
                ${released ? `<div class="file-info-row"><span>Released</span><span>${released}</span></div>` : ''}
              </div>
              ${(sw.sha256 || sw.virustotal) ? `
              <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);font-size:.72rem;color:var(--text-muted);line-height:1.55;word-break:break-all;">
                ${sw.sha256 ? `<div style="margin-bottom:6px;"><span style="color:var(--text-secondary);font-weight:600;">SHA-256:</span><br><code style="color:var(--accent-light);font-size:.66rem;font-family:var(--font-mono,monospace);">${escText(sw.sha256)}</code></div>` : ''}
                ${sw.virustotal ? `<div><span style="color:var(--text-secondary);font-weight:600;">VirusTotal:</span> <a href="${escAttr(sw.virustotal)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-light);">View scan →</a></div>` : ''}
              </div>` : ''}
              <div data-sw-dl-wrap style="margin-top:12px;text-align:center;font-size:.82rem;color:var(--text-muted);${sw.downloads > 0 ? '' : 'display:none'}">
                <span data-sw-download-count="${escAttr(sw.id)}" style="color:var(--accent-light);font-weight:700;">${sw.downloads > 0 ? sw.downloads.toLocaleString() : '0'}</span> downloads
              </div>
            </div>

            <div class="download-box">
              <h4>Security</h4>
              <span class="virus-badge" style="font-size:.85rem;padding:8px 14px;justify-content:center;display:flex;">🛡️ Scanned — No Malware</span>
              <p style="font-size:.78rem;color:var(--text-muted);margin-top:10px;line-height:1.5;">No adware, no spyware. Clean software you can trust.</p>
            </div>

            <div class="download-box">
              <h4>System Requirements</h4>
              <div class="sys-req">
${renderSysReqs(sw)}
              </div>
            </div>

            <div class="download-box" style="background:linear-gradient(135deg,rgba(0,200,150,0.08),rgba(0,200,150,0.02));border-color:rgba(0,200,150,0.25);">
              <h4>Support RBS ❤</h4>
              <p style="font-size:.85rem;color:var(--text-muted);margin-bottom:14px;line-height:1.5;">Keep Rare Build Software free by making a small donation.</p>
              <a href="../donate.html" class="btn btn-outline btn-sm" style="width:100%;justify-content:center;">❤ Donate</a>
            </div>
          </div>
        </div>
      </div>
    </div>

  <!-- Newsletter -->
  <section class="section" style="background:var(--bg-secondary);">
    <div class="container">
      <div class="newsletter-section animate-on-scroll">
        <div class="newsletter-icon">📬</div>
        <h2 class="newsletter-title">Stay <span class="accent">Updated</span></h2>
        <p class="newsletter-subtitle">Get notified when we release updates or new software. No spam.</p>
        <form class="newsletter-form" onsubmit="return false;">
          <input type="email" class="newsletter-input" placeholder="Your email address…" autocomplete="email" />
          <button type="submit" class="btn btn-primary">Subscribe →</button>
        </form>
        <div class="newsletter-success">✅ You're subscribed!</div>
        <p class="newsletter-privacy">No spam. <a href="../privacy.html">Privacy Policy</a></p>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="../index.html" class="footer-logo"><div class="logo-icon">RBS</div>RBS</a>
          <p class="footer-tagline">Building free, useful tools for everyone.</p>
        </div>
        <div>
          <p class="footer-heading">Navigation</p>
          <ul class="footer-links">
            <li><a href="../index.html">Home</a></li>
            <li><a href="../software.html">Software</a></li>
            <li><a href="../blog.html">Blog</a></li>
            <li><a href="../faq.html">FAQ</a></li>
            <li><a href="../about.html">About</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-heading">Software</p>
          <ul class="footer-links">
${software.map(s => '            <li><a href="' + escAttr(s.id) + '.html">' + escText(s.name) + '</a></li>').join('\n')}
          </ul>
        </div>
        <div>
          <p class="footer-heading">Legal</p>
          <ul class="footer-links">
            <li><a href="../privacy.html">Privacy Policy</a></li>
            <li><a href="../terms.html">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copy">© 2025–2026 RBS (Rare Build Software). All rights reserved.</p>
        <div class="footer-bottom-links">
          <a href="../privacy.html">Privacy</a>
          <a href="../terms.html">Terms</a>
          <a href="../about.html">About</a>
        </div>
      </div>
    </div>
  </footer>
  </main>

  <div id="cookie-banner">
    <p class="cookie-text">🍪 We use cookies. <a href="../privacy.html">Privacy Policy</a></p>
    <div class="cookie-btns">
      <button class="btn-cookie-accept" id="cookie-accept">Accept</button>
      <button class="btn-cookie-decline" id="cookie-decline">Decline</button>
    </div>
  </div>

  <button id="back-to-top" aria-label="Back to top">↑</button>

  <script src="../assets/js/main.js"></script>
  <script src="../assets/js/site-data.js?v=26"></script>
  <script src="../assets/js/download.js"></script>
  <script src="../assets/js/ratings.js"></script>
</body>
</html>
`;
}

// ── Run ──
let count = 0;
software.forEach(sw => {
  if (sw.visible === false) return;
  const html = buildPage(sw);
  const out = path.join(OUT_DIR, sw.id + '.html');
  fs.writeFileSync(out, html);
  console.log('  wrote ' + out + ' (' + (html.length/1024).toFixed(1) + ' KB)');
  count++;
});
console.log('\nGenerated ' + count + ' static software pages.');
