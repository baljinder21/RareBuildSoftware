/* ============================================================
   RBS — Anonymous Like counter
   Hydrates any <div data-rbs-like="<slug>"> on the page with a
   button that increments a shared counter via /api/like.

   Why anonymous: most users won't write a review but happily click
   ❤. This is the lowest-friction signal we can offer them.

   Honesty rules (per project memory):
   - Empty state ("Be the first") never seeded with fake numbers.
   - Per-user localStorage flag prevents accidental double-clicks
     but doesn't claim to be anti-abuse — the server has rate
     limiting for that.
   ============================================================ */
(function () {
  'use strict';

  const ENDPOINT = '/api/like';
  const LS_LIKED = 'rbs_liked';   // { 'rbs-pdf-editor': true, ... }

  function loadLiked() {
    try { return JSON.parse(localStorage.getItem(LS_LIKED) || '{}'); }
    catch (_) { return {}; }
  }
  function saveLiked(map) {
    try { localStorage.setItem(LS_LIKED, JSON.stringify(map)); } catch (_) {}
  }
  function fmt(n) { return Number(n).toLocaleString(); }

  function render(host, slug, count, liked) {
    const isZero = !count || count <= 0;
    const heart = liked ? '❤️' : '🤍';
    const stateLabel = liked
      ? 'You liked this · thanks for the support'
      : isZero
        ? 'Be the first to like this — your click helps other Windows users notice this app.'
        : (count === 1
            ? '1 person liked this. Be #2 to second the recommendation.'
            : fmt(count) + ' people liked this. Be #' + fmt(count + 1) + '.');

    host.innerHTML = `
      <section class="rbs-like-wrap"
               style="margin:40px 0;padding:22px 24px;background:linear-gradient(135deg,rgba(51,212,170,0.06),rgba(77,148,255,0.06));
                      border:1px solid var(--border);border-radius:14px;">
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:18px;">
          <button type="button"
                  class="rbs-like-btn"
                  aria-pressed="${liked ? 'true' : 'false'}"
                  aria-label="${liked ? 'You already liked this' : 'Like this software'}"
                  ${liked ? 'disabled' : ''}
                  style="flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:10px;
                         padding:14px 22px;font-size:1rem;font-weight:700;line-height:1;cursor:${liked?'default':'pointer'};
                         background:${liked?'rgba(51,212,170,0.18)':'#33d4aa'};color:${liked?'#33d4aa':'#0a1628'};
                         border:1px solid ${liked?'rgba(51,212,170,0.4)':'transparent'};border-radius:999px;
                         transition:transform .12s, box-shadow .12s;box-shadow:0 4px 14px rgba(51,212,170,0.25);">
            <span style="font-size:1.3rem;line-height:1;">${heart}</span>
            <span>${liked ? 'Liked' : 'Like this app'}</span>
            ${count > 0 ? `<span style="background:rgba(0,0,0,0.18);padding:3px 9px;border-radius:999px;font-size:.78rem;font-weight:800;">${fmt(count)}</span>` : ''}
          </button>
          <div style="flex:1;min-width:200px;">
            <p style="margin:0 0 4px;font-weight:700;color:var(--text-primary);">Did this help you?</p>
            <p style="margin:0;color:var(--text-muted);font-size:.9rem;line-height:1.5;">${stateLabel}</p>
          </div>
        </div>
        <p style="margin:14px 0 0;color:var(--text-muted);font-size:.78rem;line-height:1.45;">
          No signup, no email, anonymous. One click per visit. Honest counter — starts at zero and only goes up when real people click. If you have time for a written review too,
          <a href="#reviews" style="color:var(--accent-light);text-decoration:underline;">scroll down to share your experience</a>.
        </p>
      </section>
    `;

    if (liked) return;
    const btn = host.querySelector('.rbs-like-btn');
    btn.addEventListener('mouseenter', () => { btn.style.transform = 'translateY(-1px)'; });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    btn.addEventListener('click', () => onClick(host, slug, btn));
  }

  function onClick(host, slug, btn) {
    btn.disabled = true;
    btn.style.opacity = '0.7';
    fetch(ENDPOINT + '?id=' + encodeURIComponent(slug), { method: 'POST' })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(({ count }) => {
        const map = loadLiked();
        map[slug] = true;
        saveLiked(map);
        render(host, slug, count, true);
        // Soft prompt: invite the user to leave a proper review now that
        // we know they're happy with the app. Only nudge, never block.
        showReviewPrompt(host);
      })
      .catch(err => {
        btn.disabled = false;
        btn.style.opacity = '';
        const msg = (err === 429)
          ? 'Whoa, slow down — try again in a minute.'
          : 'Could not save your like — check connection and try again.';
        const note = document.createElement('p');
        note.textContent = msg;
        note.style.cssText = 'margin:10px 0 0;color:#f59e0b;font-size:.85rem;';
        host.querySelector('.rbs-like-wrap').appendChild(note);
      });
  }

  // After a successful Like, gently invite the user to leave a proper
  // review. The review form (managed by ratings.js) is further down the
  // page — we scroll to it on click, never on auto.
  function showReviewPrompt(host) {
    const wrap = host.querySelector('.rbs-like-wrap');
    if (!wrap || wrap.querySelector('.rbs-review-nudge')) return;
    const nudge = document.createElement('div');
    nudge.className = 'rbs-review-nudge';
    nudge.style.cssText = 'margin-top:18px;padding:16px 18px;background:rgba(77,148,255,0.08);border:1px dashed rgba(77,148,255,0.30);border-radius:10px;display:flex;flex-wrap:wrap;align-items:center;gap:14px;animation:rbsFadeIn .35s ease-out;';
    nudge.innerHTML = `
      <span style="font-size:1.4rem;flex-shrink:0;line-height:1;">✍️</span>
      <div style="flex:1;min-width:200px;">
        <p style="margin:0 0 2px;font-weight:700;color:var(--text-primary);font-size:.95rem;">Thanks! Got 30 seconds for a quick review too?</p>
        <p style="margin:0;color:var(--text-muted);font-size:.85rem;line-height:1.5;">Even one line helps other people decide. No signup, no email needed.</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button type="button" class="rbs-review-yes btn btn-primary btn-sm" style="white-space:nowrap;">Yes — write a review</button>
        <button type="button" class="rbs-review-no" style="background:transparent;color:var(--text-muted);border:1px solid var(--border);padding:8px 14px;border-radius:6px;font-size:.88rem;cursor:pointer;white-space:nowrap;">Maybe later</button>
      </div>
    `;
    // Inject animation keyframes once
    if (!document.getElementById('rbs-fade-keyframes')) {
      const style = document.createElement('style');
      style.id = 'rbs-fade-keyframes';
      style.textContent = '@keyframes rbsFadeIn{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}';
      document.head.appendChild(style);
    }
    wrap.appendChild(nudge);

    nudge.querySelector('.rbs-review-yes').addEventListener('click', () => {
      // Scroll to whichever review-form anchor exists. ratings.js renders
      // the form lazily into #rbs-ratings-section — fall back to other
      // common IDs in case the file is loaded before ratings.js mounts.
      const target = document.getElementById('rbs-ratings-section')
                  || document.getElementById('rbs-rate-section')
                  || document.querySelector('[id*="rbs-rate"], [id*="rbs-review"]');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Focus the textarea if it's already in the DOM
        setTimeout(() => {
          const textarea = document.getElementById('rbs-review-text');
          if (textarea) textarea.focus();
        }, 600);
      } else {
        // ratings.js hasn't mounted yet — try once more after a short wait
        setTimeout(() => {
          const t = document.getElementById('rbs-ratings-section');
          if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
      }
    });

    nudge.querySelector('.rbs-review-no').addEventListener('click', () => {
      nudge.style.transition = 'opacity .25s, max-height .25s, padding .25s, margin .25s';
      nudge.style.maxHeight = nudge.offsetHeight + 'px';
      // Two-stage hide so the height collapse animates smoothly.
      requestAnimationFrame(() => {
        nudge.style.opacity = '0';
        nudge.style.maxHeight = '0';
        nudge.style.padding = '0 18px';
        nudge.style.margin = '0';
        setTimeout(() => nudge.remove(), 260);
      });
    });
  }

  function hydrate() {
    const hosts = document.querySelectorAll('[data-rbs-like]');
    if (!hosts.length) return;
    const liked = loadLiked();
    const slugs = Array.from(hosts).map(h => h.dataset.rbsLike).filter(Boolean);
    // Single batched GET for all visible like widgets on the page
    fetch(ENDPOINT + '?ids=' + encodeURIComponent(slugs.join(',')))
      .then(r => r.ok ? r.json() : { counts: {} })
      .then(({ counts }) => {
        hosts.forEach(host => {
          const slug = host.dataset.rbsLike;
          const count = (counts && counts[slug]) || 0;
          render(host, slug, count, !!liked[slug]);
        });
      })
      .catch(() => {
        // Network failure — render with 0 and let the user still click
        hosts.forEach(host => {
          const slug = host.dataset.rbsLike;
          render(host, slug, 0, !!liked[slug]);
        });
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrate);
  } else {
    hydrate();
  }
})();
