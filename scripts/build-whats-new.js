/*
 * Generates /whats-new.html — a unified, time-ordered feed of every blog
 * post AND every software release, all on one page.
 *
 * Why: gives return visitors a single "is this site still alive?" answer,
 * shows search engines maintenance/freshness signals, and is the natural
 * landing page for "what's new at RBS" queries.
 *
 * Run after editing posts, DEFAULT_SOFTWARE, or its changelog:
 *   node scripts/build-whats-new.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://rarebuildsoftware.com';
const OUT = path.join(ROOT, 'whats-new.html');

const src = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'site-data.js'), 'utf-8');
const aMatch = src.match(/const STATIC_BLOG_ARTICLES = (\[[\s\S]+?\]);/);
const sMatch = src.match(/const DEFAULT_SOFTWARE = (\[[\s\S]+?\n  \]);/);
if (!aMatch || !sMatch) throw new Error('site-data.js parse error');
const articles = eval(aMatch[1]);
const software = eval(sMatch[1]);

function decodeHtml(s) { return String(s||'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'"); }
function escAttr(s)    { return decodeHtml(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escText(s)    { return decodeHtml(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function fmtDate(iso) {
  if (!iso) return '';
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const [y,m,d] = iso.split('-').map(Number);
  return M[m-1] + ' ' + d + ', ' + y;
}

// Build a unified timeline: blog posts + every changelog entry per app.
const events = [];
articles.forEach(a => {
  events.push({
    type: 'post',
    date: a.date,
    emoji: a.emoji || '📝',
    label: 'Blog',
    title: a.title,
    desc: a.excerpt || '',
    href: a.url,
    tag: decodeHtml(a.tag || 'Article')
  });
});
software.forEach(sw => {
  (sw.changelog || []).forEach(cl => {
    events.push({
      type: 'release',
      date: cl.date,
      emoji: sw.icon || '📦',
      label: 'Release',
      title: sw.name + ' v' + cl.version,
      desc: (cl.notes || []).slice(0, 3).join(' · '),
      href: 'software/' + sw.id + '.html',
      tag: 'Release · ' + sw.name
    });
  });
});

events.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

function eventCard(e) {
  const isRelease = e.type === 'release';
  const accent = isRelease ? '#33d4aa' : '#4d94ff';
  const labelBg = isRelease ? 'rgba(0,200,150,0.15)' : 'rgba(77,148,255,0.15)';
  return [
    '      <a href="' + escAttr(e.href) + '" class="wn-item" style="display:block;padding:22px 24px;background:var(--bg-secondary);border:1px solid var(--border);border-left:3px solid ' + accent + ';border-radius:10px;text-decoration:none;color:inherit;transition:transform .15s, border-color .15s;" onmouseover="this.style.transform=\'translateX(4px)\';this.style.borderColor=\'' + accent + '\';this.style.borderLeftColor=\'' + accent + '\'" onmouseout="this.style.transform=\'\';this.style.borderColor=\'var(--border)\';this.style.borderLeftColor=\'' + accent + '\'">',
    '        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-bottom:10px;">',
    '          <span style="font-size:1.5rem;line-height:1;">' + e.emoji + '</span>',
    '          <span style="background:' + labelBg + ';color:' + accent + ';font-size:.72rem;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;border-radius:20px;">' + e.label + '</span>',
    '          <span style="color:var(--text-muted);font-size:.85rem;font-weight:500;">' + escText(e.tag) + '</span>',
    '          <span style="color:var(--text-muted);font-size:.85rem;margin-left:auto;">📅 ' + fmtDate(e.date) + '</span>',
    '        </div>',
    '        <h3 style="font-size:1.15rem;font-weight:700;margin:0 0 8px;color:var(--text-primary);line-height:1.35;">' + escText(e.title) + '</h3>',
    e.desc ? '        <p style="font-size:.92rem;color:var(--text-secondary);line-height:1.55;margin:0;">' + escText(e.desc) + '</p>' : '',
    '      </a>'
  ].filter(Boolean).join('\n');
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="What's new at RBS — every blog post and every software release in one timeline. Honest, free Windows software by Rai (Singapore solo dev)." />
  <meta name="keywords" content="RBS changelog, Rare Build Software news, what's new, free Windows software updates, RBS blog feed, RBS releases" />
  <title>What's New at RBS — Releases &amp; Blog Posts | Rare Build Software</title>

  <link rel="icon" type="image/svg+xml" href="assets/images/favicon.svg" />

  <meta property="og:type"        content="website" />
  <meta property="og:site_name"   content="RBS" />
  <meta property="og:title"       content="What's New at RBS — Releases &amp; Blog Posts" />
  <meta property="og:description" content="Every blog post and software release in one timeline. Free Windows software by Rai." />
  <meta property="og:url"         content="${SITE}/whats-new.html" />
  <meta property="og:image"       content="${SITE}/assets/images/og/home.svg" />
  <meta name="twitter:card"       content="summary_large_image" />
  <link rel="canonical"           href="${SITE}/whats-new.html" />

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",        "item": "${SITE}/" },
      { "@type": "ListItem", "position": 2, "name": "What's New",  "item": "${SITE}/whats-new.html" }
    ]
  }
  </script>

  <link rel="alternate" type="application/rss+xml" title="RBS Blog RSS" href="${SITE}/feed.xml" />
  <link rel="preload" href="assets/css/style.css" as="style" />
  <link rel="stylesheet" href="assets/css/style.css" />
</head>
<body>

  <a href="#main-content" class="skip-link">Skip to main content</a>
  <div id="page-loader"><div class="loader-ring"></div></div>

  <nav class="navbar">
    <div class="nav-container">
      <a href="index.html" class="nav-logo"><div class="logo-icon">RBS</div>RBS</a>
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="software.html">Software</a></li>
        <li><a href="blog.html">Blog</a></li>
        <li><a href="faq.html">FAQ</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><button class="theme-toggle" id="theme-toggle" title="Toggle theme">☀️</button></li>
        <li><a href="software.html" class="nav-cta">⬇ Download Free</a></li>
      </ul>
      <button class="hamburger" aria-label="Toggle menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </nav>

  <div class="mobile-menu">
    <a href="index.html">Home</a>
    <a href="software.html">Software</a>
    <a href="blog.html">Blog</a>
    <a href="faq.html">FAQ</a>
    <a href="about.html">About</a>
    <a href="contact.html">Contact</a>
    <a href="software.html" class="nav-cta">⬇ Download Free</a>
  </div>

  <div id="rbs-announcement" style="display:none;"></div>

  <main id="main-content">

    <section class="page-hero">
      <div class="container">
        <div class="section-tag">Updates</div>
        <h1 class="page-hero-title">What's <span class="accent">New</span> at RBS</h1>
        <p class="page-hero-subtitle">
          Every blog post and software release in one timeline. ${articles.length} posts and ${software.reduce((n, s) => n + (s.changelog||[]).length, 0)} releases — newest first. Subscribe via <a href="feed.xml" style="color:var(--accent-light);">RSS</a>.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container" style="max-width:820px;">
        <div style="display:flex;flex-direction:column;gap:14px;">
${events.map(eventCard).join('\n\n')}
        </div>

        <div style="margin-top:48px;text-align:center;">
          <p style="color:var(--text-muted);font-size:.92rem;margin-bottom:16px;">Want only one of these?</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
            <a href="blog.html" class="btn btn-secondary btn-sm">📖 All blog posts</a>
            <a href="software.html" class="btn btn-secondary btn-sm">⬇ All software</a>
            <a href="feed.xml" class="btn btn-secondary btn-sm">📡 RSS feed</a>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="footer-logo"><div class="logo-icon">RBS</div>RBS</a>
          <p class="footer-tagline">Building free, useful tools for everyone.</p>
        </div>
        <div>
          <p class="footer-heading">Navigation</p>
          <ul class="footer-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="software.html">Software</a></li>
            <li><a href="blog.html">Blog</a></li>
            <li><a href="whats-new.html">What's New</a></li>
            <li><a href="faq.html">FAQ</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-heading">Software</p>
          <ul class="footer-links">
${software.map(s => '            <li><a href="software/' + escAttr(s.id) + '.html">' + escText(s.name) + '</a></li>').join('\n')}
          </ul>
        </div>
        <div>
          <p class="footer-heading">Legal</p>
          <ul class="footer-links">
            <li><a href="privacy.html">Privacy Policy</a></li>
            <li><a href="terms.html">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copy">© 2025–2026 RBS (Rare Build Software). All rights reserved.</p>
      </div>
    </div>
  </footer>

  <button id="back-to-top" aria-label="Back to top">↑</button>
  <script src="assets/js/main.js"></script>
</body>
</html>
`;

fs.writeFileSync(OUT, html);
const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
console.log('Wrote ' + OUT + ' — ' + events.length + ' events, ' + kb + ' KB');
