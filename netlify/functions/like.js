/*
 * Anonymous "Like" counter for each piece of software.
 *
 * Why: most users won't write a full review but happily click ❤. This gives
 * them a one-click engagement signal that's:
 *   • shared across all visitors (unlike pure localStorage)
 *   • anonymous (no email, no account)
 *   • honest (starts at 0, never seeded with fake numbers)
 *   • free to run (Netlify Functions free tier: 125k req/month, Blobs free
 *     tier: 1 GB — counters will use less than a kilobyte total)
 *
 * Endpoints (mounted at /.netlify/functions/like):
 *   GET  ?id=<slug>           → { count: number }
 *   GET  ?ids=a,b,c           → { counts: { a: N, b: N, c: N } }
 *   POST ?id=<slug>           → { count: number }   // increments by 1
 *
 * Spam protection:
 *   • Client-side localStorage flag prevents same-user double-click.
 *   • Per-IP soft rate limit: 10 POSTs per minute per IP (rolling counter
 *     stored in the same blob store). Lightweight, not bulletproof — anyone
 *     determined to skew counts can rotate IPs, but that's not our threat
 *     model for a feel-good engagement counter.
 *   • Whitelist of valid software slugs prevents the counter store from
 *     filling up with junk keys submitted by crawlers.
 */
import { getStore } from '@netlify/blobs';

// Keep in sync with DEFAULT_SOFTWARE in assets/js/site-data.js. Anything not
// in this set returns 400 — no random keys allowed in the blob.
const VALID_IDS = new Set([
  'rbs-pdf-editor',
  'rbs-optimizer-pro',
  'rbs-voice-cloner',
  'rbs-voice-cloner-v2',
  'life-dashboard',
  'rbs-pc-cleaner'
]);

const RATE_LIMIT_PER_MIN = 10;

function corsHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, max-age=0',
    'Access-Control-Allow-Origin': 'https://rarebuildsoftware.com',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders() });
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response('', { status: 204, headers: corsHeaders() });
  }

  const url = new URL(req.url);
  const counts = getStore('like-counts');

  // ── GET: read one or many counts ──
  if (req.method === 'GET') {
    const ids = url.searchParams.get('ids');
    if (ids) {
      const list = ids.split(',').map(s => s.trim()).filter(s => VALID_IDS.has(s));
      const out = {};
      await Promise.all(list.map(async id => {
        const raw = await counts.get(id, { consistency: 'strong' });
        out[id] = raw ? parseInt(raw, 10) || 0 : 0;
      }));
      return json(200, { counts: out });
    }
    const id = url.searchParams.get('id');
    if (!id || !VALID_IDS.has(id)) return json(400, { error: 'invalid id' });
    const raw = await counts.get(id);
    return json(200, { count: raw ? parseInt(raw, 10) || 0 : 0 });
  }

  // ── POST: increment by 1 ──
  if (req.method === 'POST') {
    const id = url.searchParams.get('id');
    if (!id || !VALID_IDS.has(id)) return json(400, { error: 'invalid id' });

    // Soft per-IP rate limit
    const ip = req.headers.get('x-nf-client-connection-ip')
            || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || 'unknown';
    const rateKey = 'rl:' + ip + ':' + Math.floor(Date.now() / 60000);
    const rlRaw = await counts.get(rateKey);
    const used = rlRaw ? parseInt(rlRaw, 10) || 0 : 0;
    if (used >= RATE_LIMIT_PER_MIN) {
      return json(429, { error: 'too many requests, slow down' });
    }
    await counts.set(rateKey, String(used + 1));

    // Increment the actual count
    const raw = await counts.get(id);
    const current = raw ? parseInt(raw, 10) || 0 : 0;
    const next = current + 1;
    await counts.set(id, String(next));
    return json(200, { count: next });
  }

  return json(405, { error: 'method not allowed' });
}

export const config = { path: '/api/like' };
