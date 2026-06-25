/* ============================================================
   RBS — Auto-updating AI news feed renderer
   Hydrates two optional containers from a single /api/ai-news call:
     • #rbs-ai-news       → full feed, single column (the /ai-news page)
     • #rbs-ai-news-home  → compact 2-column grid, limited (homepage)
   The endpoint is a Netlify function aggregating reputable AI-news RSS
   feeds, cached in Netlify Blobs. Every item links out to its source.
   ============================================================ */
(function () {
  'use strict';

  const full    = document.getElementById('rbs-ai-news');
  const compact = document.getElementById('rbs-ai-news-home');
  if (!full && !compact) return;

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function timeAgo(iso) {
    if (!iso) return '';
    const then = Date.parse(iso);
    if (isNaN(then)) return '';
    const mins = Math.floor((Date.now() - then) / 60000);
    if (mins < 60)  return mins <= 1 ? 'just now' : mins + ' min ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return hrs + (hrs === 1 ? ' hour ago' : ' hours ago');
    const days = Math.floor(hrs / 24);
    if (days < 7)   return days + (days === 1 ? ' day ago' : ' days ago');
    const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const d = new Date(then);
    return M[d.getMonth()] + ' ' + d.getDate();
  }

  function srcColor(source) {
    const map = {
      'The Verge': '#fa4d56', 'TechCrunch': '#33d4aa',
      'VentureBeat': '#4d94ff', 'MIT Tech Review': '#a855f7'
    };
    return map[source] || 'var(--accent-light)';
  }

  function item(it) {
    return `
      <a href="${esc(it.link)}" target="_blank" rel="noopener noreferrer"
         class="ai-news-item"
         style="display:flex;gap:14px;align-items:flex-start;padding:16px 18px;background:var(--bg-secondary);border:1px solid var(--border);border-left:3px solid ${srcColor(it.source)};border-radius:10px;text-decoration:none;color:inherit;transition:transform .15s, border-color .15s;"
         onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='${srcColor(it.source)}';this.style.borderLeftColor='${srcColor(it.source)}'"
         onmouseout="this.style.transform='';this.style.borderColor='var(--border)';this.style.borderLeftColor='${srcColor(it.source)}'">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;color:var(--text-primary);font-size:.98rem;line-height:1.4;margin-bottom:6px;">${esc(it.title)}</div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <span style="color:${srcColor(it.source)};font-weight:700;font-size:.78rem;">${esc(it.source)}</span>
            <span style="color:var(--text-muted);font-size:.78rem;">${timeAgo(it.date)}</span>
          </div>
        </div>
        <span style="color:var(--text-muted);font-size:1.1rem;flex-shrink:0;line-height:1.4;">↗</span>
      </a>`;
  }

  function renderFull(items, updatedAt) {
    if (!items || !items.length) {
      full.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px 0;">AI news feed is taking a breather — check back shortly.</p>';
      return;
    }
    full.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;">${items.map(item).join('')}</div>
      <p style="text-align:center;color:var(--text-muted);font-size:.8rem;margin-top:20px;">
        Auto-updated from public news feeds${updatedAt ? ' · refreshed ' + timeAgo(updatedAt) : ''}. Headlines link to their original sources.
      </p>`;
  }

  function renderCompact(items) {
    if (!items || !items.length) { compact.closest('section')?.style.setProperty('display', 'none'); return; }
    const limit = parseInt(compact.dataset.limit || '6', 10);
    compact.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:12px;">
        ${items.slice(0, limit).map(item).join('')}
      </div>`;
  }

  if (full)    full.innerHTML    = '<p style="color:var(--text-muted);text-align:center;padding:40px 0;">Loading the latest AI news…</p>';
  if (compact) compact.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:24px 0;">Loading the latest AI news…</p>';

  fetch('/api/ai-news')
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(data => {
      if (full)    renderFull(data.items, data.updatedAt);
      if (compact) renderCompact(data.items);
    })
    .catch(() => {
      if (full)    full.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px 0;">Couldn\'t load the news feed right now — please try again later.</p>';
      if (compact) compact.closest('section')?.style.setProperty('display', 'none');  // hide the homepage section if the feed fails
    });
})();
