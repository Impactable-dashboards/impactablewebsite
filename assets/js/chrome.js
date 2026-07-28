/* Shared site chrome: event banner + nav mega-menu */
(function () {
  'use strict';

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
