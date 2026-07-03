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

    if (href.indexOf('landbot.online') !== -1) {
      track('book_call_click', { page: PAGE, dest: bookingDest(href), value: 25 });
      return;
    }
    if (href.indexOf('competitor-intel-report') !== -1) {
      track('offer_cta_click', { page: PAGE, value: 10 });
      return;
    }
  }, true);

  /* ---- pricing page view ---- */
  if (PAGE === 'pricing') {
    track('pricing_view', { value: 5 });
  }

  /* ---- lead submitted (thank-you redirect target) ----
     The ClickUp form is a cross-origin iframe, so the redirect page load is
     the reliable completion signal. Google Ads / LinkedIn conversions fire
     separately from thank-you.html's own script. */
  if (path.indexOf('thank-you') !== -1) {
    track('lead_submitted', { value: 50 });
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
})();
