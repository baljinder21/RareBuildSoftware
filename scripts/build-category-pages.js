/*
 * Pre-renders the article list inside every /blog/tag/<slug>.html file.
 *
 * Each category page has a container <div id="rbs-category-list" data-tag="AI">
 * with a "Loading articles…" placeholder. The site-data.js applyCategoryPage()
 * function filters STATIC_BLOG_ARTICLES by the data-tag at runtime and renders
 * the same cards client-side.
 *
 * Problem: crawlers without JS (Bing, Twitter share scraper, etc.) and the
 * first Googlebot pass see only the placeholder. This script bakes the
 * matching cards directly into the static HTML so they're visible to every
 * crawler immediately. The runtime JS still runs as a fallback for any admin-
 * added articles.
 *
 * Run after editing posts or STATIC_BLOG_ARTICLES:
 *   node scripts/build-category-pages.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TAG_DIR = path.join(ROOT, 'blog', 'tag');

// ── Load STATIC_BLOG_ARTICLES via regex-eval (we control site-data.js) ──
const src = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'site-data.js'), 'utf-8');
const m = src.match(/const STATIC_BLOG_ARTICLES = (\[[\s\S]+?\]);/);
if (!m) throw new Error('STATIC_BLOG_ARTICLES not found in site-data.js');
const articles = eval(m[1]);

// ── Helpers ──
// STATIC_BLOG_ARTICLES already stores some strings HTML-encoded (e.g. 'AI &amp; Law').
// Decode first, then encode, so we don't double-encode into 'AI &amp;amp; Law'.
function decodeHtml(s) {
  return String(s||'')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
function escAttr(s) { return decodeHtml(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escText(s) { return decodeHtml(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function fmtDate(iso) {
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const [y, mm, d] = (iso||'').split('-').map(Number);
  return M[mm-1] + ' ' + d + ', ' + y;
}
function decodeTag(t) { return String(t||'Article').replace(/&amp;/g,'&'); }

// Word-count → read-time map (from search index, if present)
let readTimeBySlug = {};
try {
  const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'blog-search-index.json'), 'utf-8'));
  idx.forEach(x => {
    const w = x.body.split(/\s+/).length;
    readTimeBySlug[x.slug] = Math.max(3, Math.round(w / 200)) + ' min read';
  });
} catch (_) { /* index optional */ }

// Render a single card — the path from /blog/tag/X.html back to a post
// is `../<slug>.html` (the post lives in /blog/<slug>.html, the tag page
// in /blog/tag/<slug>.html, so up one dir).
function renderCard(a, delay) {
  const slug = (a.url || '').replace(/^blog\//, '').replace(/\.html$/, '');
  const href = '../' + slug + '.html';
  const tag = decodeTag(a.tag);
  const readTime = readTimeBySlug[slug] || '6 min read';
  return [
    '          <div class="blog-card animate-on-scroll" data-delay="' + delay + '" data-tag="' + escAttr(tag) + '">',
    '            <div class="blog-card-thumb">' + (a.emoji || '📝') + '</div>',
    '            <div class="blog-card-body">',
    '              <div class="blog-card-tag">' + escText(tag) + '</div>',
    '              <a href="' + escAttr(href) + '" class="blog-card-title">' + escText(a.title) + '</a>',
    '              <p class="blog-card-excerpt">' + escText(a.excerpt || '') + '</p>',
    '              <div class="blog-card-footer">',
    '                <span>📅 ' + fmtDate(a.date) + ' · ' + readTime + '</span>',
    '                <a href="' + escAttr(href) + '" class="blog-read-more">Read more →</a>',
    '              </div>',
    '            </div>',
    '          </div>'
  ].join('\n');
}

// ── Process every tag page ──
const tagFiles = fs.readdirSync(TAG_DIR).filter(f => f.endsWith('.html'));
let totalRendered = 0;

tagFiles.forEach(file => {
  const filePath = path.join(TAG_DIR, file);
  let html = fs.readFileSync(filePath, 'utf-8');

  // Pull the data-tag attribute off the container
  const tagMatch = html.match(/<div\s+class="blog-grid"\s+id="rbs-category-list"\s+data-tag="([^"]+)"\s*>/);
  if (!tagMatch) {
    console.warn('  skip (no rbs-category-list container): ' + file);
    return;
  }
  const targetTag = tagMatch[1];

  // Filter articles by tag (case-insensitive, decoded)
  const matches = articles
    .filter(a => decodeTag(a.tag).toLowerCase() === decodeTag(targetTag).toLowerCase())
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // Generate the new container body
  let body;
  if (matches.length === 0) {
    body = '\n          <p style="color:var(--text-muted);padding:32px;text-align:center;">No articles in this category yet.</p>\n        ';
  } else {
    body = '\n' + matches.map((a, i) => renderCard(a, (i % 5) * 30)).join('\n\n') + '\n        ';
  }

  // Replace the entire container contents (idempotent — works on first run
  // when content is "Loading articles…", and on re-runs when content is
  // already pre-rendered cards).
  const containerOpen = '<div class="blog-grid" id="rbs-category-list" data-tag="' + targetTag + '">';
  const containerStart = html.indexOf(containerOpen);
  if (containerStart < 0) { console.warn('  skip ' + file); return; }
  // Find the matching </div> by depth-counting
  let depth = 0;
  let i = containerStart + containerOpen.length;
  let closeAt = -1;
  while (i < html.length) {
    const openIdx = html.indexOf('<div', i);
    const closeIdx = html.indexOf('</div>', i);
    if (closeIdx < 0) break;
    if (openIdx >= 0 && openIdx < closeIdx) {
      depth++;
      i = openIdx + 4;
    } else {
      if (depth === 0) { closeAt = closeIdx; break; }
      depth--;
      i = closeIdx + 6;
    }
  }
  if (closeAt < 0) { console.warn('  skip (no matching </div>): ' + file); return; }

  const before = html.slice(0, containerStart + containerOpen.length);
  const after = html.slice(closeAt);
  const newHtml = before + body + after;
  fs.writeFileSync(filePath, newHtml);

  console.log('  ' + file + ' → ' + matches.length + ' card(s) [' + targetTag + ']');
  totalRendered += matches.length;
});

console.log('\nPre-rendered ' + totalRendered + ' article cards across ' + tagFiles.length + ' category pages.');
