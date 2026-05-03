/*
 * Generates /feed.xml — RSS 2.0 feed of every blog post in STATIC_BLOG_ARTICLES.
 *
 * Why: lets readers follow the blog in feed readers, gives Google another
 * signal of fresh content, and is a one-click syndication endpoint for
 * Mastodon / Bluesky / IFTTT / Feedly subscribers.
 *
 * Run after editing posts or STATIC_BLOG_ARTICLES:
 *   node scripts/build-rss-feed.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://rarebuildsoftware.com';
const OUT = path.join(ROOT, 'feed.xml');

const src = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'site-data.js'), 'utf-8');
const m = src.match(/const STATIC_BLOG_ARTICLES = (\[[\s\S]+?\]);/);
if (!m) throw new Error('STATIC_BLOG_ARTICLES not found');
const articles = eval(m[1]).slice().sort((a, b) => (b.date||'').localeCompare(a.date||''));

function escXml(s) {
  return String(s||'')
    .replace(/&amp;/g,'&')           // first decode any HTML entities
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/&/g,'&amp;')           // then re-encode for XML
    .replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}

function rfc822(iso) {
  if (!iso) return '';
  // Treat as midnight UTC on the given date.
  return new Date(iso + 'T00:00:00Z').toUTCString();
}

const lastBuild = articles.length ? rfc822(articles[0].date) : new Date().toUTCString();

const items = articles.map(a => {
  const url = SITE + '/' + a.url;
  return `    <item>
      <title>${escXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(a.date)}</pubDate>
      <category>${escXml(a.tag||'Article')}</category>
      <description>${escXml(a.excerpt||'')}</description>
      <author>noreply@rarebuildsoftware.com (Rai)</author>
    </item>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>RBS — Rare Build Software</title>
    <link>${SITE}</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Free Windows software and honest guides — voice cloning, optimization, cleaner, dashboard. By Rai, solo dev, Singapore.</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <generator>scripts/build-rss-feed.js</generator>
${items}
  </channel>
</rss>
`;

fs.writeFileSync(OUT, xml);
const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
console.log('Wrote ' + OUT + ' — ' + articles.length + ' items, ' + kb + ' KB');
