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
