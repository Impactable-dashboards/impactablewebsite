/* Shared site chrome: event banner + nav mega-menu */
(function () {
  'use strict';

  try {
    var savedTheme = localStorage.getItem('imp-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  } catch (e) { /* ignore */ }

  /* Event banner dismiss (localStorage key: imp-evt-abmreport) */
  try {
    if (localStorage.getItem('imp-evt-abmreport')) {
      var banner = document.getElementById('evtBanner');
      if (banner) banner.classList.add('hide');
    }
  } catch (e) { /* ignore */ }

  var dismiss = document.querySelector('.evt-x');
  if (dismiss && !dismiss.getAttribute('data-chrome-bound')) {
    dismiss.setAttribute('data-chrome-bound', '1');
    dismiss.addEventListener('click', function () {
      try { localStorage.setItem('imp-evt-abmreport', '1'); } catch (err) { /* ignore */ }
      var b = document.getElementById('evtBanner');
      if (b) b.classList.add('hide');
    });
  }

  var toggle = document.getElementById('rdToggle');
  var menu = document.getElementById('rdMenu');

  function isMobileNav() {
    return window.matchMedia('(max-width:1024px)').matches;
  }

  function closeServices() {
    document.querySelectorAll('.rd-item.open').forEach(function (i) {
      i.classList.remove('open');
      var t = i.querySelector('.rd-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  function setMenuOpen(open) {
    if (!menu || !toggle) return;
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.innerHTML = open ? '&times;' : '&#9776;';
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    document.documentElement.classList.toggle('rd-nav-open', open);
    if (!open) closeServices();
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setMenuOpen(!menu.classList.contains('open'));
    });
  }

  /* Services accordion: click-to-toggle (desktop hover still via CSS) */
  document.querySelectorAll('.rd-item .rd-trigger').forEach(function (btn) {
    btn.addEventListener('mousedown', function (e) {
      if (isMobileNav()) e.preventDefault();
    });

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var item = btn.closest('.rd-item');
      if (!item) return;
      var willOpen = !item.classList.contains('open');
      var pageY = window.scrollY || window.pageYOffset || 0;

      document.querySelectorAll('.rd-item.open').forEach(function (i) {
        if (i !== item) {
          i.classList.remove('open');
          var ot = i.querySelector('.rd-trigger');
          if (ot) ot.setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      try { btn.blur(); } catch (err) { /* ignore */ }

      /* Keep page still; scroll the Services panel itself from the top */
      if (isMobileNav()) {
        window.scrollTo(0, pageY);
        var mega = item.querySelector('.rd-mega');
        if (willOpen && mega) mega.scrollTop = 0;
        requestAnimationFrame(function () {
          window.scrollTo(0, pageY);
          if (willOpen && mega) mega.scrollTop = 0;
        });
      }
    });
  });

  document.addEventListener('click', function (e) {
    var inItem = e.target.closest('.rd-item');
    var inMenu = e.target.closest('#rdMenu');
    var inToggle = e.target.closest('#rdToggle');

    if (!inItem) closeServices();

    if (menu && menu.classList.contains('open') && !inMenu && !inToggle) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeServices();
      if (menu && menu.classList.contains('open')) setMenuOpen(false);
    }
  });

  window.addEventListener('resize', function () {
    if (window.matchMedia('(min-width:1025px)').matches) {
      if (menu && menu.classList.contains('open')) setMenuOpen(false);
    }
  });
})();

/* Theme toggle (light / dark) — shared across rd-nav pages */
(function () {
  'use strict';

  var SUN =
    '<svg class="rd-theme-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.75"/>' +
    '<path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>' +
    '</svg>';
  var MOON =
    '<svg class="rd-theme-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5 7 7 0 1 0 20.5 14.3Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>' +
    '</svg>';

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function syncThemeBtn(btn) {
    if (!btn) return;
    var dark = currentTheme() === 'dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title', dark ? 'Light mode' : 'Dark mode');
  }

  function setTheme(next) {
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('imp-theme', next); } catch (e) { /* ignore */ }
    document.querySelectorAll('.rd-theme').forEach(syncThemeBtn);
  }

  function ensureActionsWrap() {
    var nav = document.querySelector('.rd-nav-inner');
    if (!nav) return null;

    var existing = nav.querySelector('.rd-actions');
    if (existing) return existing;

    var wrap = document.createElement('div');
    wrap.className = 'rd-actions';

    var desk = nav.querySelector('.rd-cta-desk');
    var toggle = nav.querySelector('.rd-toggle');

    if (desk) {
      desk.parentNode.insertBefore(wrap, desk);
      wrap.appendChild(desk);
    } else if (toggle) {
      toggle.parentNode.insertBefore(wrap, toggle);
    } else {
      nav.appendChild(wrap);
    }

    if (toggle && toggle.parentNode !== wrap) wrap.appendChild(toggle);
    return wrap;
  }

  function ensureThemeButton() {
    var btn = document.getElementById('rdTheme');
    if (btn) return btn;

    var wrap = ensureActionsWrap();
    if (!wrap) return null;

    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rd-theme';
    btn.id = 'rdTheme';
    btn.innerHTML = SUN + MOON;

    var desk = wrap.querySelector('.rd-cta-desk');
    if (desk) wrap.insertBefore(btn, desk);
    else wrap.insertBefore(btn, wrap.firstChild);

    return btn;
  }

  var themeBtn = ensureThemeButton();
  syncThemeBtn(themeBtn);

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('.rd-theme') : null;
    if (!btn) return;
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
})();

/* Ask launcher: inject the button from chrome.js so it shows locally even if
   chat-widget.js is blocked or 404s. Panel logic still lives in chat-widget.js. */
(function () {
  'use strict';
  try {
    if (document.getElementById('impactable-chat-launcher')) return;
    var host = document.body;
    if (!host) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'impactable-chat-launcher';
    btn.className = 'open-impactable-chat';
    btn.setAttribute('aria-label', 'Open chat');
    btn.innerHTML = '<svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="68" height="68" rx="34" fill="url(#impAskBg)"/><path d="M55 17.6813C55 23.5804 45.8218 19.8175 34.5 19.8175C23.1782 19.8175 14 23.5804 14 17.6813C14 11.7822 23.1782 7 34.5 7C45.8218 7 55 11.7822 55 17.6813Z" fill="white" fill-opacity="0.35"/><path fill-rule="evenodd" clip-rule="evenodd" d="M28.9025 18.677C30.5168 17.9835 32.2488 17.626 33.9991 17.626C35.7493 17.626 37.4813 17.9835 39.0956 18.677C40.7097 19.3703 42.1732 20.3853 43.4037 21.6613C44.6341 22.9373 45.6077 24.4495 46.271 26.1104C46.4349 26.5208 46.5792 26.9384 46.7034 27.3617C47.7506 27.3621 48.5797 27.3795 49.2946 27.6243C50.718 28.1116 51.836 29.2297 52.3233 30.653C52.5876 31.4249 52.5868 32.3299 52.5859 33.4987V36.2714C52.5868 37.4402 52.5876 38.3452 52.3233 39.1171C51.836 40.5404 50.718 41.6585 49.2946 42.1458C48.5247 42.4094 47.6225 42.4093 46.458 42.4084C46.4175 42.5144 46.3756 42.6198 46.3321 42.7247C45.7094 44.2281 44.7966 45.5941 43.646 46.7447C42.4954 47.8954 41.1294 48.8081 39.626 49.4308C38.1227 50.0535 36.5114 50.374 34.8841 50.374C34.1509 50.374 33.5565 49.7796 33.5565 49.0464C33.5565 48.3132 34.1509 47.7188 34.8841 47.7188C36.1627 47.7188 37.4287 47.467 38.6099 46.9777C39.7911 46.4884 40.8644 45.7712 41.7685 44.8672C42.6725 43.9632 43.3896 42.8899 43.879 41.7086C44.3655 40.5339 44.6173 39.2752 44.62 38.0038V31.3246C44.6175 29.872 44.3403 28.435 43.8052 27.0953C43.2677 25.7495 42.481 24.5297 41.4923 23.5044C40.5037 22.4793 39.3328 21.6687 38.0476 21.1167C36.7625 20.5647 35.387 20.2812 33.9991 20.2812C32.6111 20.2812 31.2356 20.5647 29.9505 21.1167C28.6653 21.6687 27.4944 22.4793 26.5058 23.5044C25.5171 24.5297 24.7304 25.7495 24.1929 27.0953C23.6579 28.4348 23.3807 29.8716 23.3781 31.324V41.0807C23.3781 41.8139 22.7837 42.4083 22.0504 42.4083L21.5492 42.4084C20.3804 42.4093 19.4754 42.4101 18.7035 42.1458C17.2802 41.6585 16.1621 40.5404 15.6748 39.1171C15.4105 38.3452 15.4113 37.4402 15.4122 36.2714V33.4987C15.4113 32.3299 15.4105 31.4249 15.6748 30.653C16.1621 29.2297 17.2802 28.1116 18.7035 27.6243C19.4184 27.3795 20.2475 27.3621 21.2947 27.3617C21.4189 26.9384 21.5632 26.5208 21.7271 26.1104C22.3904 24.4495 23.364 22.9373 24.5944 21.6613C25.8249 20.3853 27.2884 19.3703 28.9025 18.677ZM47.2753 37.9756C47.2753 37.978 47.2753 37.9804 47.2753 37.9829C47.2753 37.9902 47.2753 37.9975 47.2753 38.0048V39.747C47.9529 39.7357 48.224 39.7058 48.4345 39.6337C49.0815 39.4122 49.5897 38.904 49.8112 38.257C49.9125 37.9613 49.9305 37.5463 49.9305 36.0534V33.7168C49.9305 32.2239 49.9125 31.8088 49.8112 31.5131C49.5897 30.8661 49.0815 30.3579 48.4345 30.1364C48.224 30.0643 47.9529 30.0344 47.2753 30.0231V37.9756ZM20.7228 30.0231C20.0452 30.0344 19.7741 30.0643 19.5636 30.1364C18.9166 30.3579 18.4084 30.8661 18.1869 31.5131C18.0856 31.8088 18.0676 32.2239 18.0676 33.7168V36.0534C18.0676 37.5463 18.0856 37.9613 18.1869 38.257C18.4084 38.904 18.9166 39.4122 19.5636 39.6337C19.7741 39.7058 20.0452 39.7357 20.7228 39.747V30.0231Z" fill="white"/><path d="M27.2542 36.002C26.2174 35.6183 26.2174 34.1519 27.2542 33.7682C29.8619 32.8033 31.918 30.7472 32.8829 28.1395C33.2666 27.1027 34.733 27.1027 35.1166 28.1395C36.0816 30.7472 38.1376 32.8033 40.7454 33.7682C41.7822 34.1519 41.7822 35.6183 40.7454 36.002C38.1376 36.9669 36.0816 39.0229 35.1166 41.6307C34.733 42.6675 33.2666 42.6675 32.8829 41.6307C31.918 39.0229 29.8619 36.9669 27.2542 36.002Z" fill="white"/><defs><linearGradient id="impAskBg" x1="8.2" y1="8.5" x2="65.7" y2="73.7" gradientUnits="userSpaceOnUse"><stop stop-color="#0099D1"/><stop offset="0.58" stop-color="#002E5C"/><stop offset="1" stop-color="#00172E"/></linearGradient></defs></svg>';
    host.appendChild(btn);

    var src = 'assets/js/chat-widget.js';
    if (document.currentScript && document.currentScript.src) {
      src = document.currentScript.src.replace(/chrome\.js(\?.*)?$/, 'chat-widget.js');
    }
    var s = document.createElement('script');
    s.src = src;
    host.appendChild(s);
  } catch (err) {
    console.error('[Impactable Ask] launcher error', err);
  }
})();
