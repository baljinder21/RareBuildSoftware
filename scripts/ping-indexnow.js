/*
 * Pings IndexNow API to instantly notify Bing / DuckDuckGo / Yandex / Yep
 * about every URL in sitemap.xml. Same submission propagates to ChatGPT
 * search + Microsoft Copilot (both pull from Bing's index).
 *
 * Why: Bing's traditional crawler can take days. IndexNow indexes within
 * minutes-to-hours. One HTTP POST = all participating search engines
 * notified at once.
 *
 * Run after publishing new content (or as final step in build chain):
 *   node scripts/ping-indexnow.js
 *
 * The key file at /<KEY>.txt MUST stay live — IndexNow re-checks it on
 * every API call. If the file 404s, submissions are rejected (HTTP 403).
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT     = path.resolve(__dirname, '..');
const HOST     = 'rarebuildsoftware.com';
const KEY      = '50eadf9c41374ba08c7c3e6c483df9be';
const KEY_URL  = `https://${HOST}/${KEY}.txt`;
const SITEMAP  = path.join(ROOT, 'sitemap.xml');

// Pull every <loc> from sitemap.xml — single source of truth.
const xml  = fs.readFileSync(SITEMAP, 'utf-8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());

if (!urls.length) {
  console.error('No <loc> entries found in sitemap.xml — aborting.');
  process.exit(1);
}

// IndexNow caps at 10,000 URLs per request. We're far under that, but
// keep a safety chunk just in case the sitemap balloons later.
const CHUNK = 10000;
const batches = [];
for (let i = 0; i < urls.length; i += CHUNK) batches.push(urls.slice(i, i + CHUNK));

function submit(urlList) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_URL,
      urlList
    });
    const req = https.request({
      hostname: 'api.indexnow.org',
      path: '/IndexNow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log(`Pinging IndexNow with ${urls.length} URL(s) in ${batches.length} batch(es)...`);
  for (let i = 0; i < batches.length; i++) {
    const r = await submit(batches[i]);
    const ok = r.status === 200 || r.status === 202;
    const tag = ok ? 'OK' : 'FAIL';
    console.log(`  [${tag}] batch ${i + 1}/${batches.length} — HTTP ${r.status} (${batches[i].length} URLs)`);
    if (!ok) {
      console.log(`         response: ${r.body || '(empty)'}`);
      // 200 = old success, 202 = accepted+queued, 403 = key not found,
      // 422 = host mismatch. Anything else, surface it but keep going.
    }
  }
  console.log('Done.');
})();
