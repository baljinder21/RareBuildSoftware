/*
 * Pre-injects TOC + prev/next nav + "Try [RBS app] - Free" recommendation card
 * into every static blog post HTML file. Mirrors the runtime applyBlogPostPage()
 * logic in assets/js/site-data.js so:
 *
 *   - Crawlers without JS execution see the TOC, the inter-post links and
 *     the conversion CTA in the static HTML.
 *   - The runtime JS still runs, but its guards (`if (!content.querySelector(...))`)
 *     detect the pre-injected elements and skip duplicate injection.
 *
 * Idempotent — safe to re-run after editing any post. Checks for the marker
 * classes (.blog-toc, .blog-post-nav, .blog-app-reco) and removes/regenerates.
 *
 * Run after editing posts or STATIC_BLOG_ARTICLES:
 *   node scripts/build-blog-enhancements.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');

// ── Load STATIC_BLOG_ARTICLES (source of truth for prev/next + tag) ──
const src = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'site-data.js'), 'utf-8');
const m = src.match(/const STATIC_BLOG_ARTICLES = (\[[\s\S]+?\]);/);
if (!m) throw new Error('STATIC_BLOG_ARTICLES not found in site-data.js');
const articles = eval(m[1]).slice().sort((a, b) => (b.date||'').localeCompare(a.date||''));

// ── Helpers ──
function decodeHtml(s) {
  return String(s||'')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'");
}
function escAttr(s) { return decodeHtml(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escText(s) { return decodeHtml(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function slugify(s) {
  return String(s||'').toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

// ── App recommendation map (mirror of site-data.js APP_RECOS) ──
const APP_RECOS = {
  'rbs-optimizer-pro': {
    icon: '🔧',
    name: 'RBS Optimizer Pro',
    pitch: 'If you want a one-click way to do most of what this post covers — junk cleaner, startup manager, RAM trim, real-time CPU/GPU monitoring — Optimizer Pro is the free Windows tool I built for it.',
    detail: '../software/detail.html?id=rbs-optimizer-pro',
    download: 'https://github.com/baljinder21/RBSsoftware/releases/download/v1.0.0/RBSOptimizerProRelease.zip',
    size: '~23 MB'
  },
  'rbs-pc-cleaner': {
    icon: '🧹',
    name: 'RBS PC Cleaner',
    pitch: 'If you want to actually run the cleanup steps in this post safely — every action is reversible, rated Safe / Caution / Risky before you click, and the registry is never touched.',
    detail: '../software/detail.html?id=rbs-pc-cleaner',
    download: 'https://github.com/baljinder21/RBSsoftware/releases/download/v1.0.0/RBS.PC.Cleaner.zip',
    size: '~61 MB'
  },
  'rbs-voice-cloner-v2': {
    icon: '🎙️',
    iconImg: '../assets/images/software/rbs-voice-cloner-v2-icon.png',
    name: 'RBS Voice Cloner V2',
    pitch: '16 built-in voices plus unlimited custom clones from a 30-second sample, 17 languages with auto-translate, 7-band EQ tuned for voice. Runs locally, no monthly cap, no cloud.',
    detail: '../software/detail.html?id=rbs-voice-cloner-v2',
    download: 'https://github.com/baljinder21/RBS-RareBuildSoftware-V2/releases/download/VoiceCloner/RBSVoiceCloner_Setup.V2.zip',
    size: '~2.0 GB'
  },
  'life-dashboard': {
    icon: '📅',
    name: 'Life Dashboard',
    pitch: 'One window for habits, tasks, finance, weather, sleep, news and 11 more widgets. Drag-and-drop layout, all data stays on your PC, free forever.',
    detail: '../software/detail.html?id=life-dashboard',
    download: 'https://github.com/baljinder21/RBSsoftware/releases/download/v1.0.0/Life.Dashboard.Setup.1.0.0.zip',
    size: '~104 MB'
  }
};

function pickReco(slug, tag) {
  const s = (slug||'').toLowerCase();
  const t = decodeHtml(tag||'').toLowerCase();
  if (/voice|cloner|tts|elevenlabs|murf|speechify|xtts|cloning|eq-guide/.test(s)) return 'rbs-voice-cloner-v2';
  if (t === 'ai' || t === 'ai news') return 'rbs-voice-cloner-v2';
  if (/habit|dashboard|notion|obsidian/.test(s)) return 'life-dashboard';
  if (t === 'productivity') return 'life-dashboard';
  if (/cleaner|ccleaner|bleachbit|cache|duplicate|discord|spotify|teams|uninstall|disk-space|stardock|themes|how-to-clean/.test(s)) return 'rbs-pc-cleaner';
  return 'rbs-optimizer-pro';
}

// ── HTML generators ──

function buildTocHTML(headings) {
  if (headings.length === 0) return '';
  const items = headings.map(h => {
    const padding = h.tag === 'H3' ? 'padding-left:18px;font-size:.9em;' : '';
    return '<li style="' + padding + '"><a href="#' + escAttr(h.id) + '" style="color:var(--accent-light);text-decoration:none;">' + escText(h.text) + '</a></li>';
  }).join('');
  return [
    '        <nav class="blog-toc" aria-label="Table of contents" style="margin:0 0 32px;padding:18px 22px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;">',
    '          <div style="font-size:.78rem;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;">📑 In this post</div>',
    '          <ul style="list-style:none;padding:0;margin:0;line-height:1.8;font-size:.95rem;">' + items + '</ul>',
    '        </nav>'
  ].join('\n');
}

function buildRecoHTML(reco) {
  const iconHTML = reco.iconImg
    ? '<div style="width:64px;height:64px;border-radius:14px;overflow:hidden;flex-shrink:0;background:#0a1628;"><img src="' + escAttr(reco.iconImg) + '" alt="' + escAttr(reco.name) + ' logo" style="width:100%;height:100%;object-fit:contain;display:block;" /></div>'
    : '<div style="width:64px;height:64px;border-radius:14px;background:linear-gradient(135deg,rgba(0,200,150,0.20),rgba(77,148,255,0.20));border:1px solid rgba(0,200,150,0.30);display:flex;align-items:center;justify-content:center;font-size:1.9rem;flex-shrink:0;">' + reco.icon + '</div>';
  return [
    '      <aside class="blog-app-reco" style="margin-top:48px;padding:24px;background:linear-gradient(135deg,rgba(0,200,150,0.06),rgba(77,148,255,0.06));border:1px solid rgba(0,200,150,0.25);border-radius:14px;">',
    '        <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start;margin-bottom:18px;">',
    '          ' + iconHTML,
    '          <div style="flex:1;min-width:220px;">',
    '            <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--accent-light);margin-bottom:6px;">From the maker of this blog</div>',
    '            <h3 style="font-size:1.3rem;font-weight:800;margin:0 0 10px;color:var(--text-primary);line-height:1.25;">Try ' + escText(reco.name) + ' &mdash; Free</h3>',
    '            <p style="font-size:.95rem;line-height:1.6;color:var(--text-secondary);margin:0;">' + escText(reco.pitch) + '</p>',
    '          </div>',
    '        </div>',
    '        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">',
    '          <a href="' + escAttr(reco.download) + '" class="btn btn-primary btn-sm">⬇ Download Free</a>',
    '          <a href="' + escAttr(reco.detail) + '" class="btn btn-secondary btn-sm">App details →</a>',
    '          <span style="color:var(--text-muted);font-size:.78rem;margin-left:4px;">Windows 10 / 11 · ' + escText(reco.size) + '</span>',
    '        </div>',
    '        <p style="margin:14px 0 0;font-size:.78rem;color:var(--text-muted);">Free forever · No sign-up · No telemetry · Built by Rai in Singapore</p>',
    '      </aside>'
  ].join('\n');
}

function buildPrevNextHTML(newer, older) {
  if (!newer && !older) return '';
  const sibUrl = a => escAttr((a.url||'').replace(/^blog\//,''));
  const card = (a, label, align) => a
    ? '<a href="' + sibUrl(a) + '" style="flex:1;min-width:240px;display:block;padding:18px 20px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;text-decoration:none;text-align:' + align + ';transition:border-color .15s, transform .15s;" onmouseover="this.style.borderColor=\'var(--accent-light)\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.transform=\'\'"><div style="font-size:.72rem;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--text-muted);margin-bottom:6px;">' + label + '</div><div style="color:var(--text-primary);font-size:1rem;font-weight:600;line-height:1.4;">' + escText(a.title) + '</div></a>'
    : '<div style="flex:1;min-width:240px;"></div>';
  return [
    '      <nav class="blog-post-nav" aria-label="Blog post navigation" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:48px;padding-top:32px;border-top:1px solid var(--border);">',
    '        ' + card(newer, '← Newer Post', 'left'),
    '        ' + card(older, 'Older Post →', 'right'),
    '      </nav>'
  ].join('\n');
}

// ── HTML processing ──

function stripExistingInjections(html) {
  return html
    .replace(/\n?\s*<nav class="blog-toc"[\s\S]*?<\/nav>/g, '')
    .replace(/\n?\s*<aside class="blog-app-reco"[\s\S]*?<\/aside>/g, '')
    .replace(/\n?\s*<nav class="blog-post-nav"[\s\S]*?<\/nav>/g, '');
}

function extractHeadings(contentHtml) {
  // Match h2 and h3, capture inner HTML, strip tags to get text.
  const headings = [];
  const usedIds = new Set();
  const re = /<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;
  let mm;
  while ((mm = re.exec(contentHtml)) !== null) {
    const tag = 'H' + mm[1];
    const innerHtml = mm[3];
    const text = innerHtml.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
    if (!text) continue;
    let id = slugify(text) || 'section';
    let n = 2;
    while (usedIds.has(id)) { id = slugify(text) + '-' + (n++); }
    usedIds.add(id);
    headings.push({ tag, id, text });
  }
  return headings;
}

function ensureHeadingIds(html, headings) {
  // Add id="..." to each <h2>/<h3> that doesn't already have one.
  // We only add the first len(headings) matches to keep them aligned.
  let i = 0;
  return html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi, (full, lvl, attrs, inner) => {
    if (i >= headings.length) return full;
    const h = headings[i++];
    const attrStr = attrs || '';
    if (/\sid\s*=/.test(attrStr)) return full; // already has an id
    return '<h' + lvl + attrStr + ' id="' + h.id + '">' + inner + '</h' + lvl + '>';
  });
}

// ── Process one post file ──
function processFile(filename) {
  const filePath = path.join(BLOG_DIR, filename);
  const slug = filename.replace(/\.html$/,'');
  let html = fs.readFileSync(filePath, 'utf-8');

  // Two structural patterns exist on this site:
  //   modern posts: <article class="blog-post-layout"> ... <div class="blog-post-content"> ... </article>
  //   older posts:  <section> ... <div class="article-body"> ... </section>  (no <article>)
  //
  // Modern posts get all three injections (TOC, reco, prev/next).
  // Older posts have their own hand-written CTA + related-articles block already,
  // so we only add the TOC for them — the other two would be redundant duplicates.
  const modernRe = /<div\s+class="blog-post-content"[^>]*>([\s\S]+?)<\/article>/;
  const olderRe  = /<div\s+class="article-body"[^>]*>([\s\S]+?)<\/div>\s*<\/div>\s*<\/section>/;

  let mode, wrapperOpenRe, bodyInner;
  let wm = html.match(modernRe);
  if (wm) {
    mode = 'modern';
    wrapperOpenRe = /<div\s+class="blog-post-content"[^>]*>/;
    bodyInner = wm[1];
  } else {
    wm = html.match(olderRe);
    if (!wm) return { skipped: true, reason: 'no body wrapper' };
    mode = 'older';
    wrapperOpenRe = /<div\s+class="article-body"[^>]*>/;
    bodyInner = wm[1];
  }

  // Idempotency: strip any prior auto-injected blocks
  html = stripExistingInjections(html);

  // Re-find body content after stripping (offsets shifted)
  const wm2 = mode === 'modern' ? html.match(modernRe) : html.match(olderRe);
  bodyInner = wm2[1];

  // Build the injections (older posts skip reco + prev/next — they have hand-written equivalents)
  const headings = extractHeadings(bodyInner);
  const idx = articles.findIndex(a => (a.url||'').replace(/^blog\//,'').replace(/\.html$/,'') === slug);
  const tag = idx >= 0 ? articles[idx].tag : '';
  const newer = idx > 0 ? articles[idx - 1] : null;
  const olderArt = idx >= 0 && idx < articles.length - 1 ? articles[idx + 1] : null;

  const tocHTML = headings.length >= 3 ? buildTocHTML(headings) : '';
  const reco = (mode === 'modern') ? APP_RECOS[pickReco(slug, tag)] : null;
  const recoHTML = reco ? buildRecoHTML(reco) : '';
  const navHTML = (mode === 'modern' && idx >= 0) ? buildPrevNextHTML(newer, olderArt) : '';

  // Make sure heading IDs are in the file (so TOC anchors work).
  // Walk only headings inside the wrapper body.
  if (tocHTML) {
    const wrapperEnd = mode === 'modern' ? '</article>' : '</section>';
    const startIdx = html.search(wrapperOpenRe);
    const endIdx = html.indexOf(wrapperEnd, startIdx);
    if (startIdx >= 0 && endIdx > startIdx) {
      const before = html.slice(0, startIdx);
      const wrapperSection = html.slice(startIdx, endIdx);
      const after = html.slice(endIdx);
      let consumed = 0;
      const patched = wrapperSection.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi, (full, lvl, attrs, inner) => {
        if (consumed >= headings.length) return full;
        const text = inner.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
        if (!text) return full;
        const h = headings[consumed++];
        const attrStr = attrs || '';
        if (/\sid\s*=/.test(attrStr)) return full;
        return '<h' + lvl + attrStr + ' id="' + h.id + '">' + inner + '</h' + lvl + '>';
      });
      html = before + patched + after;
    }
  }

  // Inject TOC at the very start of the wrapper body
  if (tocHTML) {
    html = html.replace(wrapperOpenRe, (full) => full + '\n' + tocHTML + '\n');
  }

  // Modern posts: inject reco + prev/next right before </article>
  // Older posts: skip — they have hand-written CTA + related-articles already.
  if (mode === 'modern') {
    const injection = (recoHTML ? '\n' + recoHTML : '') + (navHTML ? '\n' + navHTML : '');
    if (injection) {
      const closing = /(\s*<\/div>\s*<\/article>)/;
      if (closing.test(html)) {
        html = html.replace(closing, injection + '\n$1');
      } else {
        html = html.replace(/<\/article>/, injection + '\n  </article>');
      }
    }
  }

  fs.writeFileSync(filePath, html);
  return {
    headings: headings.length,
    toc: tocHTML ? 1 : 0,
    reco: reco ? reco.name : null,
    nav: idx >= 0 ? 1 : 0
  };
}

// ── Run ──
const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html'));
let totalToc = 0, totalNav = 0, totalReco = 0, totalSkipped = 0;
const recoCounts = {};

files.forEach(f => {
  const r = processFile(f);
  if (r.skipped) {
    totalSkipped++;
    console.log('  skip ' + f + ' (' + r.reason + ')');
    return;
  }
  totalToc += r.toc;
  totalNav += r.nav;
  if (r.reco) {
    totalReco++;
    recoCounts[r.reco] = (recoCounts[r.reco] || 0) + 1;
  }
});

console.log('\nProcessed ' + (files.length - totalSkipped) + ' / ' + files.length + ' posts');
console.log('  TOCs injected: ' + totalToc + ' (posts with <3 h2s skip TOC)');
console.log('  Prev/next nav injected: ' + totalNav);
console.log('  Reco cards injected: ' + totalReco);
Object.entries(recoCounts).forEach(([app, n]) => console.log('    ' + app + ': ' + n));
