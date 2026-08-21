/* Homepage case carousel — play inline + prev/next. Safe no-op without #caseCarousel. */
(function () {
  'use strict';
  var root = document.getElementById('caseCarousel');
  if (!root) return;
  var slides = [].slice.call(root.querySelectorAll('.case-slide'));
  var i = 0;
  var busy = false;
  var prev = root.querySelector('.case-prev');
  var next = root.querySelector('.case-next');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function bindPlay(b) {
    if (!b || b.getAttribute('data-bound') === '1') return;
    b.setAttribute('data-bound', '1');
    b.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var poster = b.closest('.case-poster');
      if (!poster || poster.classList.contains('is-playing')) return;
      var yt = b.getAttribute('data-yt');
      var emb = b.getAttribute('data-embed');
      if (!yt && !emb) return;

      poster.setAttribute('data-play-html', b.outerHTML);
      var f = document.createElement('iframe');
      f.className = 'case-iframe';
      if (emb) {
        f.src = emb + (emb.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1';
      } else {
        var qs = '?autoplay=1&rel=0&playsinline=1&modestbranding=1';
        if (location.protocol !== 'file:') {
          qs += '&enablejsapi=1&origin=' + encodeURIComponent(location.origin || 'https://impactable.com');
        }
        f.src = 'https://www.youtube.com/embed/' + encodeURIComponent(yt) + qs;
      }
      f.title = b.getAttribute('aria-label') || 'Case study video';
      f.setAttribute('frameborder', '0');
      f.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      f.setAttribute('allowfullscreen', '');
      f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      poster.classList.add('is-playing');
      b.replaceWith(f);
    });
  }

  function stopVideos(slide) {
    slide.querySelectorAll('.case-poster').forEach(function (p) {
      var frame = p.querySelector('iframe.case-iframe');
      if (!frame) return;
      var saved = p.getAttribute('data-play-html');
      frame.remove();
      p.classList.remove('is-playing');
      if (saved) {
        var tmp = document.createElement('div');
        tmp.innerHTML = saved;
        var btn = tmp.firstElementChild;
        if (btn) {
          btn.removeAttribute('data-bound');
          p.insertBefore(btn, p.firstChild);
          bindPlay(btn);
        }
      }
    });
  }

  function syncNav() {
    var atStart = i <= 0;
    var atEnd = i >= slides.length - 1;
    if (prev) {
      prev.disabled = atStart;
      prev.setAttribute('aria-disabled', atStart ? 'true' : 'false');
    }
    if (next) {
      next.disabled = atEnd;
      next.setAttribute('aria-disabled', atEnd ? 'true' : 'false');
    }
  }

  function show(n) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === i || busy) return;
    var from = slides[i];
    var to = slides[n];
    var dir = n > i ? 'next' : 'prev';
    stopVideos(from);

    if (reduce) {
      i = n;
      slides.forEach(function (s, idx) {
        var on = idx === i;
        s.classList.toggle('is-active', on);
        s.classList.remove('is-leaving', 'is-dir-next', 'is-dir-prev');
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
        if (on) s.removeAttribute('hidden');
        else s.setAttribute('hidden', '');
      });
      syncNav();
      return;
    }

    busy = true;
    root.style.minHeight = root.offsetHeight + 'px';
    from.classList.remove('is-dir-next', 'is-dir-prev');
    to.classList.remove('is-dir-next', 'is-dir-prev');
    from.classList.add('is-leaving', 'is-dir-' + dir);
    from.classList.remove('is-active');
    to.removeAttribute('hidden');
    to.classList.add('is-active', 'is-dir-' + dir);
    to.setAttribute('aria-hidden', 'false');
    from.setAttribute('aria-hidden', 'true');
    i = n;

    window.setTimeout(function () {
      from.classList.remove('is-leaving', 'is-dir-next', 'is-dir-prev');
      from.setAttribute('hidden', '');
      slides.forEach(function (s, idx) {
        if (idx !== i) {
          s.classList.remove('is-active', 'is-dir-next', 'is-dir-prev');
          s.setAttribute('hidden', '');
        }
      });
      root.style.minHeight = '';
      busy = false;
      syncNav();
    }, 480);
  }

  if (prev) prev.addEventListener('click', function () { if (i > 0) show(i - 1); });
  if (next) next.addEventListener('click', function () { if (i < slides.length - 1) show(i + 1); });
  syncNav();

  root.querySelectorAll('.case-play').forEach(bindPlay);

  root.querySelectorAll('.case-watch').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var media = a.closest('.case-media');
      var btn = media && media.querySelector('.case-play');
      if (!btn) return;
      e.preventDefault();
      btn.click();
    });
  });
})();
