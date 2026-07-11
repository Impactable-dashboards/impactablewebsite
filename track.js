/* Impactable - custom event tracking for Vercel Web Analytics.
   Fires window.va('event', {...}). Safe to load on every page.
   Intent events carry a "value" weight for filtering/segmentation in the
   Vercel dashboard (Vercel counts events and filters by property; it does
   not sum value into revenue, monetary value lives in Google Ads via gtag). */
(function () {
  'use strict';

  /* Snappier link/button response: no 300ms tap delay, no transition lag on press */
  try {
    var snap = document.createElement('style');
    snap.textContent = 'a,button,.btn,.gnav-link,.gnav-trigger,.gnav-cta{touch-action:manipulation}.btn,.gnav .btn{transition:background-color .15s ease,color .15s ease,border-color .15s ease,box-shadow .15s ease,transform .15s ease!important}a:active,.btn:active,.gnav-link:active,.gnav-cta:active{transition-duration:0s!important}';
    document.head.appendChild(snap);
  } catch (e) {}

  /* Prefetch internal pages so cross-page navigation feels instant */
  var prefetched = {};
  function prefetchPath(path) {
    if (!path || path.charAt(0) !== '/' || prefetched[path]) return;
    prefetched[path] = 1;
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
  }
  function prefetchFromAnchor(a) {
    if (!a) return;
    var url = a.getAttribute('href');
    if (!url || url.charAt(0) !== '/' || url.indexOf('#') === 0) return;
    prefetchPath(url.split('#')[0]);
  }
  function onLinkIntent(e) {
    prefetchFromAnchor(e.target && e.target.closest ? e.target.closest('a[href^="/"]') : null);
  }
  document.addEventListener('mouseover', onLinkIntent, { passive: true });
  document.addEventListener('mousedown', onLinkIntent, { passive: true });
  document.addEventListener('touchstart', onLinkIntent, { passive: true });

  var warmPaths = ['/pricing', '/google', '/thought-leadership', '/intelligence-room', '/linkedin-launch', '/linkedin-scale', '/marketing-ecosystem', '/competitor-intel-report'];
  function warmNav() {
    warmPaths.forEach(prefetchPath);
    document.querySelectorAll('a[href^="/"]').forEach(function (a) { prefetchFromAnchor(a); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', warmNav);
  } else {
    warmNav();
  }

  function track(name, data) {
    try {
      if (typeof window.va === 'function') {
        window.va('event', data ? { name: name, data: data } : { name: name });
      }
    } catch (e) {}
  }

  var path = (location.pathname || '/').toLowerCase();

  function pageName() {
    var p = path.replace(/\/+$/, '');
    if (p === '' || p === '/index.html') return 'home';
    var m = p.match(/\/([^\/]+?)(?:\.html)?$/);
    return m ? m[1] : (p || 'home');
  }
  var PAGE = pageName();

  // Stable 50/50 A/B bucket (persists across the visitor's sessions), attached
  // to key events so CTA/offer variants can be compared in the dashboard.
  var AB = (function () {
    try {
      var k = 'imp-ab', v = localStorage.getItem(k);
      if (v !== 'a' && v !== 'b') { v = Math.random() < 0.5 ? 'a' : 'b'; localStorage.setItem(k, v); }
      return v;
    } catch (e) { return 'a'; }
  })();

  // Landbot calendar id -> destination label
  function bookingDest(href) {
    if (href.indexOf('H-2201441') !== -1) return 'google-ads';
    if (href.indexOf('H-2201417') !== -1) return 'scale';
    if (href.indexOf('H-2201411') !== -1) return 'general';
    return 'other';
  }

  /* ---- click tracking via delegation (covers both nav systems) ---- */
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a, button') : null;
    if (!el) return;

    // theme toggle (low-signal, namespaced so it reads as secondary)
    if (el.id === 'gnavTheme' || (el.classList && el.classList.contains('gnav-theme'))) {
      var cur = document.documentElement.getAttribute('data-theme');
      track('ui:theme_toggle', { to: cur === 'light' ? 'dark' : 'light', page: PAGE });
      return;
    }

    var href = el.getAttribute('href') || '';

    // which surface the click came from (hero/section = "page", vs the injected
    // sticky pill / mobile bar / exit modal). Lets us see where conversions come from.
    var srcEl = el.closest ? el.closest('[data-imp-src]') : null;
    var source = srcEl ? srcEl.getAttribute('data-imp-src') : 'page';

    if (href.indexOf('landbot.online') !== -1) {
      track('book_call_click', { page: PAGE, dest: bookingDest(href), source: source, ab: AB, value: 25 });
      return;
    }
    if (href.indexOf('ad-revenue-forecaster') !== -1) {
      track('forecaster_click', { page: PAGE, source: source, ab: AB, value: 15 });
      return;
    }
    if (href.indexOf('competitor-intel-report') !== -1) {
      track('offer_cta_click', { page: PAGE, source: source, ab: AB, value: 10 });
      return;
    }
  }, true);

  /* ---- pricing page view ---- */
  if (PAGE === 'pricing') {
    track('pricing_view', { ab: AB, value: 5 });
  }

  /* ---- lead submitted (thank-you redirect target) ----
     The ClickUp form is a cross-origin iframe, so the redirect page load is
     the reliable completion signal. Google Ads / LinkedIn conversions fire
     separately from thank-you.html's own script. */
  if (path.indexOf('thank-you') !== -1) {
    track('lead_submitted', { ab: AB, value: 50 });
  }

  /* ---- scroll depth: 50% and 90%, once each ---- */
  var scrolled = {};
  function onScroll() {
    var doc = document.documentElement;
    var range = doc.scrollHeight - window.innerHeight;
    if (range <= 0) return;
    var pct = ((window.scrollY || doc.scrollTop || 0) / range) * 100;
    if (pct >= 50 && !scrolled[50]) { scrolled[50] = 1; track('scroll_depth', { depth: 50, page: PAGE }); }
    if (pct >= 90 && !scrolled[90]) {
      scrolled[90] = 1;
      track('scroll_depth', { depth: 90, page: PAGE });
      window.removeEventListener('scroll', onScroll);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- engaged time: single 45s threshold, paused while tab hidden ---- */
  var timeFired = false, elapsed = 0, timer = null;
  function startTimer() {
    if (timeFired || timer) return;
    timer = window.setInterval(function () {
      elapsed += 1;
      if (elapsed >= 45 && !timeFired) {
        timeFired = true;
        window.clearInterval(timer); timer = null;
        track('engaged_time', { seconds: 45, page: PAGE });
      }
    }, 1000);
  }
  function stopTimer() { if (timer) { window.clearInterval(timer); timer = null; } }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') stopTimer(); else startTimer();
  });
  if (document.visibilityState !== 'hidden') startTimer();

  /* ---- session pageviews milestone: fires once on the 3rd view this session ---- */
  try {
    var KEY = 'imp-pv';
    var n = parseInt(sessionStorage.getItem(KEY) || '0', 10) + 1;
    sessionStorage.setItem(KEY, String(n));
    if (n === 3) track('session_pageviews', { count: 3 });
  } catch (e) {}

  /* ===== Conversion surfaces: mobile CTA bar, desktop scroll pill, exit-intent ===== */
  function bookingUrl() {
    if (PAGE === 'google') return 'https://landbot.online/v3/H-2201441-VY21PONAGDINLTVW/index.html';
    if (PAGE === 'linkedin-scale') return 'https://landbot.online/v3/H-2201417-SPMOARYH76NAHLP2/index.html';
    return 'https://landbot.online/v3/H-2201411-ZNNL8EM9RF7C2XAC/index.html';
  }
  var BOOK = bookingUrl();
  var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  var pillLabel = AB === 'b' ? 'Book a free strategy call &rarr;' : 'Book a call &rarr;';

  try {
    var cs = document.createElement('style');
    cs.textContent = [
      '.imp-cta-btn{box-sizing:border-box;font-family:"JetBrains Mono",monospace;font-weight:700;letter-spacing:.02em;text-decoration:none;border-radius:8px}',
      '.imp-mbar{position:fixed;left:0;right:0;bottom:0;z-index:120;display:none;gap:8px;align-items:center;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:rgba(7,26,56,0.97);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-top:1px solid rgba(190,214,246,0.16)}',
      '.imp-mbar .imp-mbar-primary{flex:1;min-width:0;text-align:center;background:#0099D1;color:#03121b;padding:14px 14px;font-size:15px;white-space:nowrap}',
      '.imp-mbar .imp-mbar-alt{flex:0 0 auto;color:#D8D4CB;font-size:13px;padding:11px 12px;border:1px solid rgba(190,214,246,0.22);white-space:nowrap}',
      '@media(max-width:820px){.imp-mbar{display:flex}body{padding-bottom:76px}}',
      '.imp-spill{position:fixed;right:22px;bottom:22px;z-index:110;background:#0099D1;color:#03121b;padding:14px 22px;font-size:14px;box-shadow:0 12px 34px rgba(0,0,0,.42);opacity:0;transform:translateY(14px);pointer-events:none;transition:opacity .25s ease,transform .25s ease}',
      '.imp-spill.show{opacity:1;transform:translateY(0);pointer-events:auto}',
      '@media(max-width:820px){.imp-spill{display:none!important}}',
      '.imp-exit{position:fixed;inset:0;z-index:300;display:none;align-items:center;justify-content:center;background:rgba(4,12,26,0.74);padding:24px}',
      '.imp-exit.show{display:flex}',
      '.imp-exit-card{position:relative;max-width:460px;background:#0E2A50;border:1px solid rgba(190,214,246,0.18);border-radius:16px;padding:36px 30px 30px;box-shadow:0 30px 80px rgba(0,0,0,.5)}',
      '.imp-exit-card h3{font-family:"Archivo Black","Inter",sans-serif;color:#F4F1EA;font-size:23px;line-height:1.16;margin:0 0 12px}',
      '.imp-exit-card p{color:#D8D4CB;font-size:15px;line-height:1.5;margin:0 0 22px}',
      '.imp-exit-cta{display:inline-block;background:#0099D1;color:#03121b;padding:13px 22px;font-size:14px}',
      '.imp-exit-x{position:absolute;top:12px;right:14px;background:none;border:0;color:#A8A49B;font-size:26px;line-height:1;cursor:pointer}',
      '.imp-exit-x:hover{color:#F4F1EA}'
    ].join('');
    document.head.appendChild(cs);
  } catch (e) {}

  function mkEl(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }

  var mbar = mkEl('<div class="imp-mbar"><a class="imp-cta-btn imp-mbar-primary" data-imp-src="mobile" href="' + BOOK + '">Book a call</a><a class="imp-cta-btn imp-mbar-alt" data-imp-src="mobile" href="/competitor-intel-report">Free competitor intel</a></div>');
  var spill = mkEl('<a class="imp-cta-btn imp-spill" data-imp-src="sticky" href="' + BOOK + '">' + pillLabel + '</a>');
  var exit = !isTouch ? mkEl('<div class="imp-exit" role="dialog" aria-modal="true" aria-label="Free competitor intel report"><div class="imp-exit-card"><button class="imp-exit-x" type="button" aria-label="Close">&times;</button><h3>Before you go &mdash; see your competitors&rsquo; playbook.</h3><p>Get the free Competitor Intel Report: exactly what your competitors run on LinkedIn, and the audience lanes they leave open. No call required.</p><a class="imp-cta-btn imp-exit-cta" data-imp-src="exit" href="/competitor-intel-report">Get your free competitor intel &rarr;</a></div></div>') : null;

  function mount() {
    try {
      document.body.appendChild(mbar);
      document.body.appendChild(spill);
      if (exit) document.body.appendChild(exit);
    } catch (e) {}
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);

  // desktop pill: appear past 45% scroll, hide near the footer so it never covers the final CTA
  function pillScroll() {
    var doc = document.documentElement, range = doc.scrollHeight - window.innerHeight;
    if (range <= 0) return;
    var y = window.scrollY || doc.scrollTop || 0, pct = (y / range) * 100;
    if (pct >= 45 && (range - y) > 640) spill.classList.add('show'); else spill.classList.remove('show');
  }
  window.addEventListener('scroll', pillScroll, { passive: true });

  // exit-intent: free-report offer, desktop only, once per session, not on the report page itself
  if (exit) {
    var exitDone = false;
    function exitSeen() { try { return sessionStorage.getItem('imp-exit') === '1'; } catch (e) { return false; } }
    function closeExit() { exit.classList.remove('show'); }
    function openExit() {
      if (exitDone || exitSeen() || path.indexOf('competitor-intel-report') !== -1) return;
      exitDone = true;
      try { sessionStorage.setItem('imp-exit', '1'); } catch (e) {}
      exit.classList.add('show');
      track('exit_offer_view', { page: PAGE, ab: AB });
    }
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 0) openExit(); });
    exit.addEventListener('click', function (e) {
      if (e.target === exit || (e.target.closest && e.target.closest('.imp-exit-x'))) closeExit();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeExit(); });
  }
})();
