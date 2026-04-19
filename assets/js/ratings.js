/* ============================================================
   RBS — Rating & Review System
   - Star display on software cards
   - Interactive rating form on detail pages
   - Reviews list on detail pages
   - localStorage-based submission (pending admin approval)
   - Merged with data/ratings.json (admin-approved reviews)
   ============================================================ */
(function () {
  'use strict';

  /* ── Constants ── */
  const LS_RATINGS    = 'rbs_ratings';       // all submitted reviews (localStorage)
  const LS_USER_RATED = 'rbs_user_rated';    // { softwareId: reviewId } — one per software
  const LS_HELPFUL    = 'rbs_helpful_votes'; // { reviewId: true }
  const LS_DOWNLOADS  = 'rbs_downloads';     // { softwareId: true } — set by download.js

  /* ── Utility ── */
  function esc(s) {
    return String(s||'')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function formatDate(str) {
    try { return new Date(str).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}); }
    catch(_) { return str; }
  }
  function genId() {
    return 'r_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
  }

  /* ── localStorage helpers ── */
  function loadLS(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch(_) { return fallback; }
  }
  function saveLS(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(_) {}
  }

  /* ── Get all localStorage reviews ── */
  function getLSReviews() { return loadLS(LS_RATINGS, []); }

  /* ── Merge JSON + localStorage reviews for a software ── */
  function getReviewsForSoftware(softwareId, jsonReviews) {
    const lsAll = getLSReviews();
    const lsApproved = lsAll.filter(r => r.softwareId === softwareId && r.approved === true);
    const jsonFiltered = (jsonReviews || []).filter(r => r.softwareId === softwareId && r.approved !== false);
    // Merge, deduplicate by id
    const seen = new Set();
    const merged = [...jsonFiltered, ...lsApproved].filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
    return merged;
  }

  /* ── Compute average rating ── */
  function computeStats(reviews) {
    if (!reviews.length) return { avg: 0, count: 0 };
    const sum = reviews.reduce((a, r) => a + (r.rating || 0), 0);
    return { avg: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
  }

  /* ── Render star HTML (supports half stars) ── */
  function starsHTML(rating, size) {
    const px = size || 16;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = rating >= i ? 1 : rating >= i - 0.5 ? 0.5 : 0;
      if (filled === 1) {
        stars.push(`<span class="rbs-star full" style="font-size:${px}px;">★</span>`);
      } else if (filled === 0.5) {
        stars.push(`<span class="rbs-star half" style="font-size:${px}px;position:relative;display:inline-block;">
          <span style="color:var(--rating-star-empty,#4a4a6a);">★</span>
          <span style="position:absolute;left:0;top:0;width:50%;overflow:hidden;color:var(--accent);">★</span>
        </span>`);
      } else {
        stars.push(`<span class="rbs-star empty" style="font-size:${px}px;">★</span>`);
      }
    }
    return stars.join('');
  }

  /* ══════════════════════════════════════════
     STAR DISPLAY ON SOFTWARE CARDS
  ══════════════════════════════════════════ */
  function injectCardRatings(jsonReviews) {
    document.querySelectorAll('.software-card-big[data-id]').forEach(card => {
      const swId = card.dataset.id;
      if (!swId) return;
      const reviews = getReviewsForSoftware(swId, jsonReviews);
      const stats = computeStats(reviews);
      // Inject after app-name if not already injected
      if (card.querySelector('.rbs-card-stars')) return;
      const nameEl = card.querySelector('.app-name');
      if (!nameEl) return;
      const wrap = document.createElement('div');
      wrap.className = 'rbs-card-stars';
      if (stats.count > 0) {
        wrap.innerHTML = `
          <div class="rbs-stars-row">
            ${starsHTML(stats.avg, 15)}
            <span class="rbs-stars-avg">${stats.avg}</span>
            <span class="rbs-stars-count">(${stats.count} rating${stats.count !== 1 ? 's' : ''})</span>
          </div>`;
      } else {
        wrap.innerHTML = `<div class="rbs-stars-row rbs-stars-empty">
          ${starsHTML(0, 15)}<span class="rbs-stars-count">No ratings yet</span>
        </div>`;
      }
      nameEl.after(wrap);
    });
  }

  /* Also inject into the quick software list (sw-list-item) */
  function injectListRatings(jsonReviews) {
    document.querySelectorAll('.sw-list-item[data-id]').forEach(item => {
      const swId = item.dataset.id;
      if (!swId || item.querySelector('.rbs-list-stars')) return;
      const reviews = getReviewsForSoftware(swId, jsonReviews);
      const stats = computeStats(reviews);
      const metaEl = item.querySelector('.sw-list-meta');
      if (!metaEl) return;
      const span = document.createElement('span');
      span.className = 'rbs-list-stars';
      span.innerHTML = starsHTML(stats.avg, 12) + (stats.count ? ` <span style="font-size:.72rem;color:var(--text-muted)">${stats.avg} (${stats.count})</span>` : '');
      metaEl.appendChild(span);
    });
  }

  /* ══════════════════════════════════════════
     DETAIL PAGE — RATING FORM + REVIEWS LIST
  ══════════════════════════════════════════ */
  function initDetailPage(jsonReviews) {
    const root = document.getElementById('rbs-detail-root');
    if (!root) return;

    // Wait for detail content to be rendered by site-data.js
    const checkReady = () => {
      const shareSection = root.querySelector('.share-section, .share-btns, [onclick*="shareOn"]');
      if (shareSection) {
        const swId = new URLSearchParams(location.search).get('id') || (window._rbsSoftware && window._rbsSoftware[0] && window._rbsSoftware[0].id) || '';
        if (swId) renderDetailRatings(root, swId, jsonReviews);
      } else {
        setTimeout(checkReady, 120);
      }
    };
    checkReady();
  }

  function renderDetailRatings(root, swId, jsonReviews) {
    if (root.querySelector('#rbs-ratings-section')) return;

    const allReviews   = getReviewsForSoftware(swId, jsonReviews);
    const stats        = computeStats(allReviews);
    const userRated    = loadLS(LS_USER_RATED, {})[swId];
    const isDetail     = location.pathname.includes('detail');

    /* Build injection target — insert before share section or at end */
    const shareEl = root.querySelector('.share-section, [class*="share"]');
    const wrapper  = document.createElement('div');
    wrapper.id     = 'rbs-ratings-section';
    wrapper.style.cssText = 'padding:0 40px 32px;';

    /* ── Average rating summary ── */
    const summaryHTML = `
    <div class="rbs-rating-summary">
      <div class="rbs-avg-block">
        <div class="rbs-avg-number">${stats.count ? stats.avg : '—'}</div>
        <div class="rbs-avg-stars">${starsHTML(stats.avg, 22)}</div>
        <div class="rbs-avg-label">${stats.count} review${stats.count !== 1 ? 's' : ''}</div>
      </div>
      <div class="rbs-rating-bars" id="rbs-rating-bars-${swId}">
        ${renderRatingBars(allReviews)}
      </div>
    </div>`;

    /* ── Rating form ── */
    const formHTML = userRated
      ? `<div class="rbs-already-rated">✅ You've already submitted a review for this software. Thank you!</div>`
      : `
    <div class="rbs-rate-section" id="rbs-rate-section">
      <h3 class="rbs-section-heading">Rate This Software</h3>
      <div class="rbs-interactive-stars" id="rbs-interactive-stars" data-selected="0">
        ${[1,2,3,4,5].map(i => `<span class="rbs-istar" data-val="${i}" title="${i} star${i>1?'s':''}">★</span>`).join('')}
      </div>
      <p class="rbs-star-hint" id="rbs-star-hint">Click a star to rate</p>
      <div class="rbs-review-form" id="rbs-review-form" style="display:none;">
        <input type="text" id="rbs-reviewer-name" class="rbs-input" placeholder="Your name (optional)" maxlength="60" />
        <textarea id="rbs-review-text" class="rbs-textarea" placeholder="Write your review… (optional)" maxlength="500" rows="4"></textarea>
        <div class="rbs-form-footer">
          <span class="rbs-char-count" id="rbs-char-count">500 characters left</span>
          <button class="btn btn-primary rbs-submit-btn" id="rbs-submit-btn">Submit Review</button>
        </div>
      </div>
    </div>`;

    /* ── Reviews list ── */
    const reviewsHTML = `
    <div class="rbs-reviews-section">
      <div class="rbs-reviews-header">
        <h3 class="rbs-section-heading">User Reviews</h3>
        <select class="rbs-sort-select" id="rbs-sort-select">
          <option value="newest">Newest First</option>
          <option value="highest">Highest Rated</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>
      <div id="rbs-reviews-list"></div>
      <button class="rbs-load-more" id="rbs-load-more" style="display:none;">Load More Reviews</button>
    </div>`;

    wrapper.innerHTML = `
      <div style="border-top:1px solid var(--border);padding-top:32px;margin-bottom:0;">
        ${summaryHTML}
        ${formHTML}
        ${reviewsHTML}
      </div>`;

    if (shareEl && shareEl.parentNode) {
      shareEl.parentNode.insertBefore(wrapper, shareEl);
    } else {
      root.appendChild(wrapper);
    }

    initInteractiveStars(swId, jsonReviews);
    renderReviewsList(swId, allReviews, 0);
    initSortSelect(swId, jsonReviews);
  }

  function renderRatingBars(reviews) {
    const counts = [0,0,0,0,0];
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) counts[r.rating-1]++; });
    const total = reviews.length || 1;
    return [5,4,3,2,1].map(star => {
      const count = counts[star-1];
      const pct   = Math.round((count / total) * 100);
      return `<div class="rbs-bar-row">
        <span class="rbs-bar-label">${star}★</span>
        <div class="rbs-bar-track"><div class="rbs-bar-fill" style="width:${pct}%"></div></div>
        <span class="rbs-bar-count">${count}</span>
      </div>`;
    }).join('');
  }

  /* ── Interactive stars ── */
  function initInteractiveStars(swId, jsonReviews) {
    const container = document.getElementById('rbs-interactive-stars');
    const hint      = document.getElementById('rbs-star-hint');
    const form      = document.getElementById('rbs-review-form');
    const submitBtn = document.getElementById('rbs-submit-btn');
    const textarea  = document.getElementById('rbs-review-text');
    const charCount = document.getElementById('rbs-char-count');
    if (!container) return;

    const labels = ['','Terrible','Poor','Average','Good','Excellent'];
    let selected = 0;

    container.querySelectorAll('.rbs-istar').forEach(star => {
      star.addEventListener('mouseenter', () => {
        const val = +star.dataset.val;
        highlightStars(container, val);
        if (hint) hint.textContent = labels[val];
      });
      star.addEventListener('mouseleave', () => {
        highlightStars(container, selected);
        if (hint) hint.textContent = selected ? labels[selected] : 'Click a star to rate';
      });
      star.addEventListener('click', () => {
        selected = +star.dataset.val;
        container.dataset.selected = selected;
        highlightStars(container, selected);
        if (hint) hint.textContent = labels[selected];
        if (form) form.style.display = 'block';
        if (submitBtn) submitBtn.dataset.rating = selected;
      });
    });

    if (textarea && charCount) {
      textarea.addEventListener('input', () => {
        charCount.textContent = (500 - textarea.value.length) + ' characters left';
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => submitReview(swId, jsonReviews));
    }
  }

  function highlightStars(container, val) {
    container.querySelectorAll('.rbs-istar').forEach(s => {
      s.classList.toggle('active', +s.dataset.val <= val);
    });
  }

  /* ── Submit review ── */
  function submitReview(swId, jsonReviews) {
    const rating   = +(document.getElementById('rbs-interactive-stars')?.dataset.selected || 0);
    const name     = (document.getElementById('rbs-reviewer-name')?.value || '').trim();
    const text     = (document.getElementById('rbs-review-text')?.value || '').trim();
    const submitBtn = document.getElementById('rbs-submit-btn');

    if (!rating) {
      shakeEl(document.getElementById('rbs-interactive-stars'));
      return;
    }

    /* Check verified download */
    const downloads = loadLS(LS_DOWNLOADS, {});
    const verified  = !!(downloads[swId] || localStorage.getItem('rbs_dl_count'));

    const review = {
      id: genId(),
      softwareId: swId,
      name: name || 'Anonymous',
      rating,
      review: text,
      date: new Date().toISOString().slice(0,10),
      approved: false,
      helpful: 0,
      helpfulBy: [],
      reply: null,
      verifiedDownload: verified
    };

    /* Save to localStorage */
    const all = getLSReviews();
    all.push(review);
    saveLS(LS_RATINGS, all);

    /* Record that this user rated this software */
    const userRated = loadLS(LS_USER_RATED, {});
    userRated[swId] = review.id;
    saveLS(LS_USER_RATED, userRated);

    /* Replace form with thank you */
    const section = document.getElementById('rbs-rate-section');
    if (section) {
      section.innerHTML = `
        <div class="rbs-thankyou">
          <div class="rbs-thankyou-icon">⭐</div>
          <h3>Thank you for your review!</h3>
          <p>Your ${rating}-star review has been submitted and will appear after approval.</p>
        </div>`;
    }
  }

  function shakeEl(el) {
    if (!el) return;
    el.style.animation = 'none';
    requestAnimationFrame(() => {
      el.style.animation = 'rbsShake 0.4s ease';
      setTimeout(() => { el.style.animation = ''; }, 400);
    });
  }

  /* ── Render reviews list ── */
  const PAGE_SIZE = 5;
  let currentPage = 0;
  let currentSort = 'newest';

  function getSortedReviews(reviews, sort) {
    const copy = [...reviews];
    if (sort === 'newest')  return copy.sort((a,b) => new Date(b.date) - new Date(a.date));
    if (sort === 'highest') return copy.sort((a,b) => b.rating - a.rating || new Date(b.date) - new Date(a.date));
    if (sort === 'helpful') return copy.sort((a,b) => (b.helpful||0) - (a.helpful||0) || new Date(b.date) - new Date(a.date));
    return copy;
  }

  function renderReviewsList(swId, reviews, page) {
    const list     = document.getElementById('rbs-reviews-list');
    const loadMore = document.getElementById('rbs-load-more');
    if (!list) return;

    const sorted = getSortedReviews(reviews, currentSort);
    const helpfulVotes = loadLS(LS_HELPFUL, {});

    if (!sorted.length) {
      list.innerHTML = `<div class="rbs-no-reviews">
        <div style="font-size:2rem;margin-bottom:10px;">💬</div>
        <p>Be the first to review this software!</p>
      </div>`;
      if (loadMore) loadMore.style.display = 'none';
      return;
    }

    const slice = sorted.slice(0, (page + 1) * PAGE_SIZE);
    list.innerHTML = slice.map(r => reviewCardHTML(r, helpfulVotes)).join('');

    /* Attach helpful vote buttons */
    list.querySelectorAll('.rbs-helpful-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rid = btn.dataset.rid;
        toggleHelpful(rid, btn, swId, reviews);
      });
    });

    if (loadMore) {
      loadMore.style.display = sorted.length > slice.length ? 'block' : 'none';
      loadMore.onclick = () => { currentPage++; renderReviewsList(swId, reviews, currentPage); };
    }
  }

  function reviewCardHTML(r, helpfulVotes) {
    const alreadyHelpful = helpfulVotes[r.id];
    const replyHTML = r.reply
      ? `<div class="rbs-reply">
           <div class="rbs-reply-label">💬 RBS replied:</div>
           <div class="rbs-reply-text">${esc(r.reply)}</div>
         </div>`
      : '';
    return `
    <div class="rbs-review-card" data-rid="${esc(r.id)}">
      <div class="rbs-review-header">
        <div class="rbs-review-meta">
          <span class="rbs-reviewer-name">${esc(r.name || 'Anonymous')}</span>
          ${r.verifiedDownload ? '<span class="rbs-verified-badge">✓ Verified User</span>' : ''}
        </div>
        <div class="rbs-review-right">
          <div class="rbs-review-stars">${starsHTML(r.rating, 14)}</div>
          <span class="rbs-review-date">${formatDate(r.date)}</span>
        </div>
      </div>
      ${r.review ? `<div class="rbs-review-text">${esc(r.review)}</div>` : ''}
      ${replyHTML}
      <div class="rbs-review-actions">
        <button class="rbs-helpful-btn${alreadyHelpful ? ' voted' : ''}" data-rid="${esc(r.id)}">
          👍 Helpful ${r.helpful > 0 ? `(${r.helpful})` : ''}
        </button>
      </div>
    </div>`;
  }

  function toggleHelpful(rid, btn, swId, reviews) {
    const helpfulVotes = loadLS(LS_HELPFUL, {});
    if (helpfulVotes[rid]) return; // already voted
    helpfulVotes[rid] = true;
    saveLS(LS_HELPFUL, helpfulVotes);

    /* Update in localStorage reviews */
    const lsAll = getLSReviews();
    const lsIdx = lsAll.findIndex(r => r.id === rid);
    if (lsIdx >= 0) {
      lsAll[lsIdx].helpful = (lsAll[lsIdx].helpful || 0) + 1;
      saveLS(LS_RATINGS, lsAll);
    }
    /* Update in jsonReviews array in memory */
    const rv = reviews.find(r => r.id === rid);
    if (rv) rv.helpful = (rv.helpful || 0) + 1;

    btn.classList.add('voted');
    btn.textContent = `👍 Helpful (${(rv && rv.helpful) || 1})`;
  }

  function initSortSelect(swId, jsonReviews) {
    const sel = document.getElementById('rbs-sort-select');
    if (!sel) return;
    sel.addEventListener('change', () => {
      currentSort = sel.value;
      currentPage = 0;
      renderReviewsList(swId, getReviewsForSoftware(swId, jsonReviews), 0);
    });
  }

  /* ══════════════════════════════════════════
     BOOT — fetch JSON then initialise
  ══════════════════════════════════════════ */
  let jsonReviews = [];

  function init() {
    const isDetail = document.getElementById('rbs-detail-root') !== null;

    /* Try to load ratings.json */
    const basePath = location.pathname.includes('/software/') ? '../' : '';
    fetch(basePath + 'data/ratings.json?' + Date.now())
      .then(r => r.ok ? r.json() : [])
      .then(data => { jsonReviews = Array.isArray(data) ? data : []; })
      .catch(() => { jsonReviews = []; })
      .finally(() => {
        if (isDetail) {
          initDetailPage(jsonReviews);
        }
        /* Card ratings are injected after site-data.js renders cards */
        waitForCards(jsonReviews);
      });
  }

  function waitForCards(json) {
    const check = () => {
      const cards = document.querySelectorAll('.software-card-big');
      if (cards.length) {
        injectCardRatings(json);
        injectListRatings(json);
      } else {
        setTimeout(() => waitForCards(json), 200);
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', check);
    } else {
      check();
    }
  }

  /* Track downloads for Verified User badge */
  function trackDownloads() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-download-trigger]');
      if (!btn) return;
      /* Try to get software id from nearest card or URL param */
      const card = btn.closest('[data-id]');
      const swId = (card && card.dataset.id)
        || new URLSearchParams(location.search).get('id')
        || (window._rbsSoftware && window._rbsSoftware[0] && window._rbsSoftware[0].id)
        || '';
      if (!swId) return;
      const downloads = loadLS(LS_DOWNLOADS, {});
      downloads[swId] = true;
      saveLS(LS_DOWNLOADS, downloads);
    }, true); /* capture phase so we record before download.js acts */
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { trackDownloads(); init(); });
  } else {
    trackDownloads();
    init();
  }

  /* Expose for admin panel */
  window._rbsRatings = {
    getLSReviews,
    saveLS: (reviews) => saveLS(LS_RATINGS, reviews),
    getReviewsForSoftware,
    computeStats,
    starsHTML,
    formatDate
  };

})();
