/*
 * Auto-updating AI news feed.
 *
 * GET /api/ai-news  →  { items: [...], updatedAt: <iso> }
 *
 * Aggregates headlines from a handful of reputable AI-news RSS feeds,
 * caches the merged result in Netlify Blobs, and refreshes at most once
 * every REFRESH_MS. This means:
 *   - The page is always "fresh" with no manual work and no git pushes.
 *   - At most one visitor every few hours triggers a live refetch; everyone
 *     else gets the instant cached copy.
 *   - If every feed fails, we serve the last good cache (stale) rather than
 *     an empty page.
 *
 * No API keys required — these are public RSS endpoints.
 *
 * SEO note: this is a curated *outbound* feed (every item links to the
 * original source). It exists for freshness / return visits, not to rank.
 * The original blog posts are the search-traffic engine.
 */
import { getStore } from '@netlify/blobs';

const REFRESH_MS = 3 * 60 * 60 * 1000; // 3 hours
const MAX_ITEMS = 14;

// Reputable, AI-focused public RSS feeds. If one dies, the others carry it.
const FEEDS = [
  { source: 'The Verge',        url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
  { source: 'TechCrunch',       url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { source: 'VentureBeat',      url: 'https://venturebeat.com/category/ai/feed/' },
  { source: 'MIT Tech Review',  url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed' }
];

function corsHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=900', // browsers may cache 15 min
    'Access-Control-Allow-Origin': 'https://rarebuildsoftware.com',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };
}
function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders() });
}

function decodeEntities(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#8217;/g, "’").replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“").replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, '–').replace(/&#8212;/g, '—')
    .replace(/<[^>]+>/g, '')        // strip any leftover tags from titles
    .replace(/\s+/g, ' ').trim();
}

function tag(block, name) {
  // Handles <name>..</name> and <name ..>..</name>, CDATA inside.
  // Note: uses [^] (any char incl. newlines) and [^>]* instead of \s/\S so the
  // pattern survives RegExp-from-string without backslash-escaping pitfalls.
  const m = block.match(new RegExp('<' + name + '[^>]*>([^]*?)</' + name + '>', 'i'));
  return m ? m[1] : '';
}

// Image URLs in feeds come HTML-entity-encoded (&amp;, &#038;). Decode to a
// plain URL so the browser fetches the real asset; the renderer re-escapes it.
function decodeImgUrl(u) {
  return String(u || '')
    .replace(/&amp;/g, '&').replace(/&#0?3[48];/g, '&').replace(/&#x26;/gi, '&')
    .trim();
}

// Pull a usable image out of one RSS/Atom <item> block, preferring the
// publisher's declared media over a stray inline <img>. Skips chrome (favicons,
// avatars, theme assets). Returns '' if the block carries no real image.
function extractImage(block) {
  let m = block.match(/<media:(?:content|thumbnail)[^>]*\burl="([^"]+)"/i);
  if (m && /^https?:/i.test(m[1])) return decodeImgUrl(m[1]);
  m = block.match(/<enclosure[^>]*\burl="([^"]+)"[^>]*\btype="image\//i)
   || block.match(/<enclosure[^>]*\btype="image\/[^"]*"[^>]*\burl="([^"]+)"/i);
  if (m && /^https?:/i.test(m[1])) return decodeImgUrl(m[1]);
  m = block.match(/<img[^>]*\bsrc="([^"]+)"/i);
  if (m && /^https?:/i.test(m[1]) &&
      !/favicon|gravatar|feedburner|\/themes\/|\/plugins\/|\/emoji\//i.test(m[1])) {
    return decodeImgUrl(m[1]);
  }
  return '';
}

// Fetch an article's social-preview image (og:image / twitter:image). Only
// called for items whose feed gave us no image — runs once per refresh cycle.
async function ogImage(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RBSNewsBot/1.0; +https://rarebuildsoftware.com)' },
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return '';
    const head = (await res.text()).slice(0, 80000); // og tags live in <head>
    const m = head.match(/<meta[^>]+property="og:image(?::secure_url)?"[^>]*content="([^"]+)"/i)
           || head.match(/<meta[^>]+content="([^"]+)"[^>]*property="og:image"/i)
           || head.match(/<meta[^>]+name="twitter:image(?::src)?"[^>]*content="([^"]+)"/i);
    return m && /^https?:\/\//i.test(decodeImgUrl(m[1])) ? decodeImgUrl(m[1]) : '';
  } catch (_) { return ''; }
}

function parseFeed(xml, source) {
  const items = [];
  // RSS uses <item>, Atom uses <entry>
  const blocks = xml.match(/<(item|entry)[^]*?<\/(item|entry)>/gi) || [];
  for (const b of blocks) {
    const title = decodeEntities(tag(b, 'title'));
    if (!title) continue;
    // link: RSS <link>url</link>, Atom <link href="url"/>
    let link = decodeEntities(tag(b, 'link'));
    if (!link || link.startsWith('<')) {
      const hm = b.match(/<link[^>]*href="([^"]+)"[^>]*\/?>(?:<\/link>)?/i);
      if (hm) link = hm[1];
    }
    if (!link) continue;
    const dateRaw = tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated') || tag(b, 'dc:date');
    let ts = Date.parse(decodeEntities(dateRaw));
    if (isNaN(ts)) ts = 0;
    items.push({ title, link: link.trim(), source, ts, image: extractImage(b) });
  }
  return items;
}

async function fetchFeed(feed) {
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RBSNewsBot/1.0; +https://rarebuildsoftware.com)' },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseFeed(xml, feed.source);
  } catch (_) {
    return [];
  }
}

async function buildFresh() {
  const all = (await Promise.all(FEEDS.map(fetchFeed))).flat();
  // Dedupe by normalized title
  const seen = new Set();
  const deduped = [];
  for (const it of all) {
    const key = it.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(it);
  }
  deduped.sort((a, b) => b.ts - a.ts);
  const top = deduped.slice(0, MAX_ITEMS);

  // Backfill images for items whose feed gave us none, via the article's
  // og:image. Parallel + per-fetch timeout, so worst case adds ~5s once per
  // 3-hour refresh (not per visitor). Failures just leave image empty.
  await Promise.allSettled(top.map(async (it) => {
    if (!it.image) it.image = await ogImage(it.link);
  }));

  return top.map(({ title, link, source, ts, image }) => ({
    title, link, source,
    image: image || null,
    date: ts ? new Date(ts).toISOString() : null
  }));
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: corsHeaders() });
  if (req.method !== 'GET') return json(405, { error: 'method not allowed' });

  const store = getStore('ai-news');
  let cached = null;
  try { cached = JSON.parse((await store.get('latest')) || 'null'); } catch (_) {}

  const fresh = cached && cached.updatedAt && (Date.now() - Date.parse(cached.updatedAt) < REFRESH_MS);
  if (fresh && Array.isArray(cached.items) && cached.items.length) {
    return json(200, cached);
  }

  // Stale or empty — try to refresh.
  let items = [];
  try { items = await buildFresh(); } catch (_) {}

  if (items.length) {
    const payload = { items, updatedAt: new Date().toISOString() };
    try { await store.set('latest', JSON.stringify(payload)); } catch (_) {}
    return json(200, payload);
  }

  // Refresh failed — serve last good cache if we have one.
  if (cached && Array.isArray(cached.items) && cached.items.length) {
    return json(200, { ...cached, stale: true });
  }
  return json(200, { items: [], updatedAt: new Date().toISOString(), error: 'no feeds available' });
}

export const config = { path: '/api/ai-news' };
