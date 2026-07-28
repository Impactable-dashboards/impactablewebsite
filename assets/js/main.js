/* Shared tracking — load once in <head><link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/chrome.css">:
   <script src="/assets/js/main.js"></script>
   GTM noscript iframes still need to stay in <body> (HTML only). */
(function () {
  'use strict';

  function injectScript(src, attrs) {
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    }
    var first = document.getElementsByTagName('script')[0];
    if (first && first.parentNode) first.parentNode.insertBefore(s, first);
    else (document.head || document.documentElement).appendChild(s);
    return s;
  }

  function injectInline(code) {
    var s = document.createElement('script');
    s.text = code;
    (document.head || document.documentElement).appendChild(s);
  }

  /* Google Tag Manager — GTM-MK45VGG */
  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0];
    var j = d.createElement(s);
    var dl = l !== 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', 'GTM-MK45VGG');

  /* Google Ads gtag — AW-722461102 */
  injectScript('https://www.googletagmanager.com/gtag/js?id=AW-722461102');
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'AW-722461102');

  /* LinkedIn Insight Tag — partner ids 3483338, 3986860 */
  window._linkedin_partner_id = '3483338';
  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push('3483338');
  window._linkedin_data_partner_ids.push('3986860');
  (function (l) {
    if (!l) {
      window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); };
      window.lintrk.q = [];
    }
    var s = document.getElementsByTagName('script')[0];
    var b = document.createElement('script');
    b.type = 'text/javascript';
    b.async = true;
    b.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
    s.parentNode.insertBefore(b, s);
  })(window.lintrk);

  /* Lassoo / Trialfire */
  (function () {
    var s = document.createElement('script');
    var tf = {
      $q: [],
      do: function () { tf.$q.push([].slice.call(arguments)); }
    };
    ['init', 'ready', 'identify', 'property', 'logout', 'track', 'optout'].forEach(function (t) {
      tf[t] = function () { tf.do.apply(null, [t].concat([].slice.call(arguments))); };
    });
    window.Trialfire = tf;
    s.src = '//cdn.xperrab2b.com/tf.js';
    document.head.appendChild(s);
    Trialfire.init('9d94aa3e-1b87-4d05-8f85-1cbbb06ee959');
    window.Lassoo = window.Trialfire;
  })();

  /* DemandSense Website Visitor ID */
  injectScript('https://insightcdn.net/js/a400e6c5f5ecf708b9215326b8e2347f.js', { type: 'text/javascript' });

  /* StackAdapt */
  (function (s, a, e, v, n, t, z) {
    if (s.saq) return;
    n = s.saq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!s._saq) s._saq = n;
    n.push = n;
    n.loaded = true;
    n.version = '1.0';
    n.queue = [];
    t = a.createElement(e);
    t.async = true;
    t.src = v;
    z = a.getElementsByTagName(e)[0];
    z.parentNode.insertBefore(t, z);
  })(window, document, 'script', 'https://tags.srv.stackadapt.com/events.js');
  window.saq('ts', '5AgGhKLUA0YA3K2L1GlFqQ');
})();
