/* linkedin-ads-agency-new — page interactions */
(function () {
  'use strict';

  /* Scroll reveal */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* Sys rail animation (hero card) */
  var rail = document.getElementById('laSysRail');
  if (rail) {
    var nodes = [].slice.call(rail.querySelectorAll('.sys-node'));
    if (nodes.length) {
      var stepMs = 920;
      var holdMs = 1800;
      var railLeadMs = 200;
      var i = 0;
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function setOn(node, on) {
        node.classList.toggle('is-on', !!on);
        var img = node.querySelector('.sys-ico');
        if (!img) return;
        var onSrc = node.getAttribute('data-ico-on') || '';
        var offSrc = node.getAttribute('data-ico-off') || '';
        img.src = on ? onSrc : offSrc;
      }

      function setRailProgress(activeCount) {
        var segments = Math.max(1, nodes.length - 1);
        var progress = Math.max(0, Math.min(1, (activeCount - 1) / segments));
        rail.style.setProperty('--rail-progress', String(progress));
      }

      function reset(done) {
        rail.classList.add('is-resetting');
        nodes.forEach(function (n) { setOn(n, false); });
        setRailProgress(0);
        i = 0;
        window.setTimeout(function () {
          rail.classList.remove('is-resetting');
          if (done) done();
        }, 560);
      }

      if (reduce) {
        nodes.forEach(function (n) { setOn(n, true); });
        setRailProgress(nodes.length);
      } else {
        reset(function () { window.setTimeout(tick, 320); });

        function tick() {
          if (i < nodes.length) {
            var idx = i;
            setRailProgress(idx + 1);
            window.setTimeout(function () {
              setOn(nodes[idx], true);
              i += 1;
              window.setTimeout(tick, stepMs);
            }, railLeadMs);
            return;
          }
          window.setTimeout(function () {
            reset(function () { window.setTimeout(tick, 360); });
          }, holdMs);
        }
      }
    }
  }

  /* Case carousel */
  (function () {
    var root = document.getElementById('laCaseCarousel');
    if (!root) return;
    var slides = [].slice.call(root.querySelectorAll('.case-slide'));
    var prev = root.querySelector('.case-prev');
    var next = root.querySelector('.case-next');
    var i = 0;
    var busy = false;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function stopVideos(slide) {
      if (!slide) return;
      slide.querySelectorAll('.case-media iframe').forEach(function (frame) {
        var p = frame.closest('.case-poster');
        if (!p) return;
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

    function bindPlay(btn) {
      if (!btn || btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var poster = btn.closest('.case-poster');
        if (!poster || poster.classList.contains('is-playing')) return;
        poster.setAttribute('data-play-html', poster.innerHTML);
        var yt = btn.getAttribute('data-yt');
        var embed = btn.getAttribute('data-embed');
        var frame = document.createElement('iframe');
        frame.setAttribute('allowfullscreen', '');
        frame.setAttribute('frameborder', '0');
        frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
        if (yt) {
          frame.setAttribute('src', 'https://www.youtube.com/embed/' + yt + '?autoplay=1&rel=0');
          frame.setAttribute('title', 'Client interview');
        } else if (embed) {
          frame.setAttribute('src', embed);
          frame.setAttribute('title', 'Client testimonial');
        }
        poster.classList.add('is-playing');
        poster.innerHTML = '';
        poster.appendChild(frame);
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
      stopVideos(from);
      if (reduce) {
        i = n;
        slides.forEach(function (s, idx) {
          var on = idx === i;
          s.classList.toggle('is-active', on);
          s.setAttribute('aria-hidden', on ? 'false' : 'true');
          if (on) s.removeAttribute('hidden'); else s.setAttribute('hidden', '');
        });
        syncNav();
        return;
      }
      busy = true;
      from.classList.remove('is-active');
      from.setAttribute('aria-hidden', 'true');
      from.setAttribute('hidden', '');
      to.removeAttribute('hidden');
      to.classList.add('is-active');
      to.setAttribute('aria-hidden', 'false');
      i = n;
      window.setTimeout(function () { busy = false; syncNav(); }, 480);
    }

    if (prev) prev.addEventListener('click', function () { if (i > 0) show(i - 1); });
    if (next) next.addEventListener('click', function () { if (i < slides.length - 1) show(i + 1); });
    syncNav();
    root.querySelectorAll('.case-play').forEach(bindPlay);
    root.querySelectorAll('.case-watch').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var btn = a.closest('.case-media') && a.closest('.case-media').querySelector('.case-play');
        if (!btn) return;
        e.preventDefault();
        btn.click();
      });
    });
  })();

  /* Lacework inline video */
  var csvBtn = document.querySelector('.la-csv-play');
  if (csvBtn) {
    csvBtn.addEventListener('click', function () {
      var wrap = csvBtn.closest('.la-csv-wrap');
      if (!wrap) return;
      var yt = csvBtn.getAttribute('data-yt');
      var frame = document.createElement('iframe');
      frame.className = 'la-csv-iframe';
      frame.setAttribute('src', 'https://www.youtube.com/embed/' + yt + '?autoplay=1&rel=0');
      frame.setAttribute('title', 'Lacework client interview');
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('frameborder', '0');
      csvBtn.replaceWith(frame);
    });
  }
})();
