/*
 * Pre-renders static fallback content into software.html for the two
 * software-listing sections (#rbs-sw-list quick-download list and
 * #rbs-software-list main grid).
 *
 * Why: both sections are filled client-side by site-data.js. Crawlers that
 * don't run JS were seeing a single placeholder card + "Loading software…",
 * which meant the listing page (and notably RBS PDF Editor) was invisible to
 * search engines. This bakes every visible app — name, version, size, short
 * description and a link to its canonical /software/<id>.html page — into the
 * HTML between AUTO markers. site-data.js still runs and replaces these with
 * the live/rich versions; this is purely the no-JS SEO fallback.
 *
 * Run after editing DEFAULT_SOFTWARE in site-data.js:
 *   node scripts/build-software-list.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGE = path.join(ROOT, 'software.html');

const src = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'site-data.js'), 'utf-8');
const m = src.match(/const DEFAULT_SOFTWARE = (\[[\s\S]+?\n  \]);/);
if (!m) throw new Error('DEFAULT_SOFTWARE not found');
const software = eval(m[1]).filter(s => s.visible !== false);

function decodeHtml(s){return String(s||'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");}
function escAttr(s){return decodeHtml(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function escText(s){return decodeHtml(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function shortDesc(sw){ let d = decodeHtml(sw.description||'').split(/\.\s/)[0].trim(); return d; }
function icon(sw){ return sw.iconImage ? '<img src="'+escAttr(sw.iconImage)+'" alt="'+escAttr(sw.name)+' icon" style="width:100%;height:100%;object-fit:contain;border-radius:inherit;" />' : (sw.icon || '📦'); }
function fmtDate(iso){ if(!iso) return ''; const M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; const [y,mm,d]=iso.split('-').map(Number); return M[mm-1]+' '+d+', '+y; }

// ── Quick-download list items ──
const listHtml = software.map(sw => `
        <div class="sw-list-item" data-id="${escAttr(sw.id)}">
          <div class="sw-list-icon">${icon(sw)}</div>
          <div class="sw-list-info">
            <div class="sw-list-name">${escText(sw.name)}</div>
            <div class="sw-list-meta">
              <span class="badge badge-teal" style="font-size:.72rem;padding:2px 8px;">v${escText(sw.version)}</span>
              ${sw.fileSize ? `<span class="sw-list-size">${escText(sw.fileSize)}</span>` : ''}
              <span class="virus-badge">✓ Virus Free</span>
              ${sw.released ? `<span class="updated-badge">📅 ${fmtDate(sw.released)}</span>` : ''}
            </div>
            <div class="sw-list-desc">${escText(shortDesc(sw))}</div>
          </div>
          <div class="sw-list-actions">
            ${sw.downloadUrl ? `<a href="${escAttr(sw.downloadUrl)}" class="btn btn-primary btn-sm">⬇ Download</a>` : ''}
            <a href="software/${escAttr(sw.id)}.html" class="btn btn-secondary btn-sm">Details →</a>
          </div>
        </div>`).join('');

// ── Main grid fallback cards (simple, SEO-focused: name + desc + features + link) ──
const gridHtml = software.map(sw => {
  const feats = (sw.features||[]).slice(0,4).map(f => `<li>${escText(f.title)}</li>`).join('');
  return `
        <div class="software-card-big" data-id="${escAttr(sw.id)}" data-category="${escAttr(sw.category||'')}" style="margin-bottom:28px;padding:24px;background:var(--bg-card,#111d2c);border:1px solid var(--border);border-radius:14px;">
          <h3 style="font-size:1.3rem;font-weight:800;margin:0 0 6px;"><a href="software/${escAttr(sw.id)}.html" style="color:var(--text-primary);text-decoration:none;">${escText(sw.name)}</a></h3>
          <div style="color:var(--text-muted);font-size:.85rem;margin-bottom:12px;">v${escText(sw.version)} · ${escText(sw.fileSize||'')} · Windows 10/11 · ${escText(sw.category||'')}</div>
          <p style="color:var(--text-secondary);line-height:1.6;margin:0 0 14px;">${escText(decodeHtml(sw.description||'').slice(0,220))}${(sw.description||'').length>220?'…':''}</p>
          ${feats ? `<ul style="color:var(--text-secondary);font-size:.9rem;margin:0 0 16px;padding-left:18px;">${feats}</ul>` : ''}
          <a href="software/${escAttr(sw.id)}.html" class="btn btn-primary btn-sm">View ${escText(sw.name)} →</a>
        </div>`;
}).join('');

function inject(html, startMark, endMark, content) {
  // Markers are COMPLETE comments; content goes BETWEEN them (never inside one).
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('(' + esc(startMark) + ')[\\s\\S]*?(' + esc(endMark) + ')');
  if (!re.test(html)) throw new Error('markers not found: ' + startMark);
  return html.replace(re, '$1\n' + content + '\n        $2');
}

let page = fs.readFileSync(PAGE, 'utf-8');
page = inject(page, '<!-- SW-LIST-AUTO:START -->', '<!-- SW-LIST-AUTO:END -->', listHtml);
page = inject(page, '<!-- SW-GRID-AUTO:START -->', '<!-- SW-GRID-AUTO:END -->', gridHtml);
fs.writeFileSync(PAGE, page);

console.log('Pre-rendered ' + software.length + ' apps into software.html (quick-list + main grid).');
software.forEach(s => console.log('  • ' + s.name));
