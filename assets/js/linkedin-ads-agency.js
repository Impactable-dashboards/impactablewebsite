/* linkedin-ads-agency-new — page interactions */
(function () {
  'use strict';

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* Hero Foot in the door card */
  var offerCard = document.getElementById('laOfferCard');
  if (offerCard) {
    var offerAmt = offerCard.querySelector('.amt');
    var offerReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function playOffer() {
      offerCard.classList.add('is-on');
      if (!offerAmt || offerReduce || !offerAmt.hasAttribute('data-count')) return;
      var to = parseFloat(offerAmt.getAttribute('data-count') || '1500');
      window.setTimeout(function () {
        var start = performance.now();
        var dur = 1000;
        offerAmt.textContent = '$0';
        (function frame(now) {
          var t = Math.min(1, (now - start) / dur);
          var eased = 1 - Math.pow(1 - t, 2.4);
          offerAmt.textContent = '$' + Math.round(to * eased).toLocaleString('en-US');
          if (t < 1) requestAnimationFrame(frame);
        })(start);
      }, 380);
    }
    if (offerReduce || !('IntersectionObserver' in window)) {
      playOffer();
    } else {
      var offerIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          playOffer();
          offerIo.unobserve(e.target);
        });
      }, { threshold: 0.25 });
      offerIo.observe(offerCard);
    }
  }

  /* Hero stats counters */
  var heroStats = document.getElementById('laHeroStats');
  if (heroStats) {
    var statsReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function formatStat(n, fmt) {
      if (fmt === 'mplus') return '$' + Math.round(n) + 'M+';
      if (fmt === 'plus') return Math.round(n) + '+';
      if (fmt === 'k') return '$' + (Math.round(n * 10) / 10).toFixed(1) + 'K';
      return String(Math.round(n));
    }
    function countStat(el, to, fmt, dur) {
      var start = performance.now();
      el.textContent = formatStat(0, fmt);
      (function frame(now) {
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 2.3);
        el.textContent = formatStat(to * eased, fmt);
        if (t < 1) requestAnimationFrame(frame);
      })(start);
    }
    function playStats() {
      heroStats.classList.add('is-on');
      if (statsReduce) return;
      heroStats.querySelectorAll('.n[data-count]').forEach(function (el, i) {
        var to = parseFloat(el.getAttribute('data-count'));
        var fmt = el.getAttribute('data-format') || 'plus';
        if (isNaN(to)) return;
        window.setTimeout(function () { countStat(el, to, fmt, 1100); }, 80 + i * 140);
      });
    }
    if (statsReduce || !('IntersectionObserver' in window)) {
      playStats();
    } else {
      var statsIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          playStats();
          statsIo.unobserve(e.target);
        });
      }, { threshold: 0.35 });
      statsIo.observe(heroStats);
    }
  }

  /* Playbook: pillars in, then warm-first ladder */
  var playSec = document.getElementById('playbook');
  if (playSec) {
    var playReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function playPlaybook() { playSec.classList.add('is-on'); }
    if (playReduce || !('IntersectionObserver' in window)) {
      playPlaybook();
    } else {
      var playIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          playPlaybook();
          playIo.unobserve(e.target);
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
      playIo.observe(playSec);
    }
  }

  /* Accordion */
  var accRoot = document.getElementById('laAcc');
  if (accRoot) {
    var accBusy = false;
    accRoot.querySelectorAll('.la-acc-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (accBusy) return;
        accBusy = true;
        window.setTimeout(function () { accBusy = false; }, 420);
        var item = btn.closest('.la-acc-item');
        var open = item.classList.contains('is-open');
        accRoot.querySelectorAll('.la-acc-item').forEach(function (el) {
          el.classList.remove('is-open');
          var b = el.querySelector('.la-acc-btn');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!open) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* Reporting tabs — homepage Impactable specimens + animation */
  (function () {
    function prefersReduced() {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    }
    function formatCount(n, fmt) {
      if (fmt === 'pct1') return (Math.round(n * 10) / 10).toFixed(1);
      if (fmt === 'pct2') return (Math.round(n * 100) / 100).toFixed(2) + '%';
      if (fmt === 'money') return '$' + Math.round(n).toLocaleString('en-US');
      if (fmt === 'money2') return '$' + (Math.round(n * 100) / 100).toFixed(2);
      return Math.round(n).toLocaleString('en-US');
    }
    function animateCount(el, to, fmt, dur) {
      if (prefersReduced()) { el.textContent = formatCount(to, fmt); return; }
      var start = performance.now();
      el.textContent = formatCount(0, fmt);
      function frame(now) {
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 2.2);
        el.textContent = formatCount(to * eased, fmt);
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    function resetPanel(panel) {
      if (!panel) return;
      panel.classList.remove('is-enter');
      panel.querySelectorAll('.fun-fill').forEach(function (fill) {
        fill.style.transition = 'none';
        fill.style.width = '0%';
      });
      panel.querySelectorAll('.fun-delta,.facard').forEach(function (el) {
        el.classList.remove('is-pop');
        el.style.transition = 'none';
      });
      panel.querySelectorAll('.spark i').forEach(function (el) {
        el.style.transition = 'none';
        el.style.transform = 'scaleY(0)';
      });
      panel.querySelectorAll('[data-count]').forEach(function (el) {
        var fmt = el.getAttribute('data-format') || 'int';
        el.textContent = formatCount(0, fmt);
      });
      void panel.offsetWidth;
    }
    function animatePanel(panel) {
      if (!panel) return;
      resetPanel(panel);
      requestAnimationFrame(function () {
        panel.classList.add('is-enter');
        var bars = [].slice.call(panel.querySelectorAll('.fun-bar'));
        bars.forEach(function (bar, i) {
          var fill = bar.querySelector('.fun-fill');
          var pct = parseFloat(bar.getAttribute('data-fill') || '0');
          var color = bar.getAttribute('data-color') || '#0099d1';
          if (!fill) return;
          fill.style.background = color;
          fill.style.transition = 'width 1.35s cubic-bezier(.22,1,.36,1)';
          fill.style.transitionDelay = (320 + i * 220) + 'ms';
          fill.style.width = '0%';
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { fill.style.width = pct + '%'; });
          });
        });
        var countEls = [].slice.call(panel.querySelectorAll('[data-count]'));
        var many = countEls.length > 12;
        countEls.forEach(function (el, i) {
          var to = parseFloat(el.getAttribute('data-count'));
          var fmt = el.getAttribute('data-format') || 'int';
          if (isNaN(to)) return;
          var delay = many ? (380 + Math.floor(i / 5) * 180 + (i % 5) * 70) : (320 + i * 140);
          var dur = many ? 1450 : 1900;
          window.setTimeout(function () { animateCount(el, to, fmt, dur); }, delay);
        });
        panel.querySelectorAll('.fun-delta,.facard').forEach(function (el, i) {
          el.style.transition = '';
          el.style.transitionDelay = (480 + i * 160) + 'ms';
          requestAnimationFrame(function () { el.classList.add('is-pop'); });
        });
        panel.querySelectorAll('.spark i').forEach(function (el, i) {
          el.style.transition = 'transform 1.15s cubic-bezier(.16,1,.3,1)';
          el.style.transitionDelay = (280 + i * 85) + 'ms';
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { el.style.transform = ''; });
          });
        });
      });
    }
    function showPanel(panel) {
      if (!panel) return;
      panel.removeAttribute('hidden');
      animatePanel(panel);
    }
    var tabs = [].slice.call(document.querySelectorAll('#impactTabs .gal-tab'));
    function sel(t) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute('aria-selected', on ? 'true' : 'false');
        var p = document.getElementById(x.getAttribute('aria-controls'));
        if (!p) return;
        if (on) showPanel(p);
        else {
          p.setAttribute('hidden', '');
          resetPanel(p);
        }
      });
      if (t && t.scrollIntoView) {
        try { t.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' }); } catch (e) {}
      }
      if (window.__galUpdateTabFade) window.__galUpdateTabFade(document.getElementById('impactTabs'));
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { sel(t); });
    });
    function updateTabFade(el) {
      if (!el) return;
      var max = el.scrollWidth - el.clientWidth;
      var scrollable = max > 4;
      var atStart = !scrollable || el.scrollLeft <= 3;
      var atEnd = !scrollable || el.scrollLeft >= max - 3;
      el.classList.toggle('is-scrollable', scrollable);
      el.classList.toggle('is-at-start', atStart);
      el.classList.toggle('is-at-end', atEnd);
    }
    window.__galUpdateTabFade = updateTabFade;
    var list = document.getElementById('impactTabs');
    if (list) {
      list.addEventListener('scroll', function () { updateTabFade(list); }, { passive: true });
      window.addEventListener('resize', function () { updateTabFade(list); });
      updateTabFade(list);
    }
    var first = document.getElementById('galp-1');
    if (first) {
      if (!('IntersectionObserver' in window)) {
        showPanel(first);
      } else {
        var galIo = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            showPanel(first);
            galIo.disconnect();
          });
        }, { threshold: 0.2 });
        galIo.observe(first);
      }
    }
  })();

  /* Wrong-launch cards */
  var wrongSec = document.getElementById('laWrong');
  if (wrongSec) {
    var wrongReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function playWrong() { wrongSec.classList.add('is-on'); }
    if (wrongReduce || !('IntersectionObserver' in window)) {
      playWrong();
    } else {
      var wrongIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          playWrong();
          wrongIo.unobserve(e.target);
        });
      }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
      wrongIo.observe(wrongSec);
    }
  }

  /* Climb stages */
  var climbSec = document.getElementById('laClimb');
  if (climbSec) {
    var climbReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function playClimb() { climbSec.classList.add('is-on'); }
    if (climbReduce || !('IntersectionObserver' in window)) {
      playClimb();
    } else {
      var climbIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          playClimb();
          climbIo.unobserve(e.target);
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
      climbIo.observe(climbSec);
    }
  }

  /* Launch plan section */
  var planGrid = document.getElementById('laPlanGrid');
  if (planGrid) {
    var planAmt = planGrid.querySelector('.la-plan-amt');
    var planReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function playPlan() {
      planGrid.classList.add('is-on');
      if (!planAmt || planReduce || !planAmt.hasAttribute('data-count')) return;
      var to = parseFloat(planAmt.getAttribute('data-count') || '1500');
      window.setTimeout(function () {
        var start = performance.now();
        var dur = 1100;
        planAmt.textContent = '$0';
        (function frame(now) {
          var t = Math.min(1, (now - start) / dur);
          var eased = 1 - Math.pow(1 - t, 2.4);
          planAmt.textContent = '$' + Math.round(to * eased).toLocaleString('en-US');
          if (t < 1) requestAnimationFrame(frame);
        })(start);
      }, 180);
    }
    if (planReduce || !('IntersectionObserver' in window)) {
      playPlan();
    } else {
      var planIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          playPlan();
          planIo.unobserve(e.target);
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
      planIo.observe(planGrid);
    }
  }

  /* Compounding loop: line to each number, fill the circle, return, repeat */
  var loopFlow = document.getElementById('laLoopFlow');
  if (loopFlow) {
    var loopNodes = [].slice.call(loopFlow.querySelectorAll('.la-lnode'));
    var loopTrack = loopFlow.querySelector('.la-loop-track');
    var loopN = loopNodes.length;
    var loopI = 0;
    var loopTimer = null;
    var loopInView = false;
    var loopReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var loopStepMs = 320;
    var loopLeadMs = 700;
    var loopHoldMs = 1400;

    function loopProgress(activeCount) {
      var pct = 0;
      if (loopN > 1 && activeCount > 0) {
        pct = (Math.min(activeCount, loopN) - 1) / (loopN - 1) * 100;
      }
      if (loopTrack) loopTrack.style.setProperty('--loop-progress', pct + '%');
    }

    function later(fn, ms) {
      loopTimer = window.setTimeout(function () {
        loopTimer = null;
        fn();
      }, ms);
    }

    function loopReset(done) {
      loopFlow.classList.add('is-resetting');
      loopFlow.classList.remove('is-return');
      loopNodes.forEach(function (el) { el.classList.remove('is-on'); });
      loopProgress(0);
      loopI = 0;
      later(function () {
        loopFlow.classList.remove('is-resetting');
        if (done) done();
      }, 80);
    }

    function loopTick() {
      if (!loopInView) return;
      if (loopI < loopN) {
        var idx = loopI;
        loopProgress(idx + 1);
        later(function () {
          if (!loopInView) return;
          loopNodes[idx].classList.add('is-on');
          loopI += 1;
          later(loopTick, loopStepMs);
        }, idx === 0 ? 60 : loopLeadMs);
        return;
      }
      loopFlow.classList.add('is-return');
      later(function () {
        if (!loopInView) return;
        loopReset(function () {
          later(loopTick, 420);
        });
      }, loopHoldMs);
    }

    function loopStart() {
      if (loopReduce || loopInView) return;
      loopInView = true;
      loopI = 0;
      loopNodes.forEach(function (el) { el.classList.remove('is-on'); });
      loopProgress(0);
      loopFlow.classList.remove('is-return', 'is-resetting', 'is-on');
      void loopFlow.offsetWidth;
      loopFlow.classList.add('is-on');
      later(loopTick, 1180);
    }

    function loopStop() {
      loopInView = false;
      if (loopTimer) {
        window.clearTimeout(loopTimer);
        loopTimer = null;
      }
      loopI = 0;
      loopNodes.forEach(function (el) { el.classList.remove('is-on'); });
      loopProgress(0);
      loopFlow.classList.add('is-resetting');
      loopFlow.classList.remove('is-on', 'is-return');
      void loopFlow.offsetWidth;
      loopFlow.classList.remove('is-resetting');
    }

    if (loopReduce) {
      loopFlow.classList.add('is-on');
      loopNodes.forEach(function (el) { el.classList.add('is-on'); });
      loopProgress(loopN);
      loopFlow.classList.add('is-return');
    } else if (!('IntersectionObserver' in window)) {
      loopStart();
    } else {
      var loopIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) loopStart();
          else loopStop();
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });
      loopIo.observe(loopFlow);
    }
  }

  /* First 90 days graph */
  var climb = document.getElementById('laDaysClimb');
  if (climb) {
    var stroke = climb.querySelector('.la-days-stroke');
    if (stroke && typeof stroke.getTotalLength === 'function') {
      climb.style.setProperty('--la-days-len', String(stroke.getTotalLength()));
    }
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var daysInView = false;
    var daysRaf = 0;
    var daysTimer = null;
    var daysClip = climb.querySelector('.la-days-clip');
    function resetDays() {
      if (daysRaf) {
        window.cancelAnimationFrame(daysRaf);
        daysRaf = 0;
      }
      climb.classList.remove('is-on');
      if (daysClip) daysClip.setAttribute('width', '0');
      void climb.offsetWidth;
    }
    function drawDays() {
      if (daysInView) return;
      daysInView = true;
      resetDays();
      climb.classList.add('is-on');
      if (!daysClip) return;
      if (reduce) {
        daysClip.setAttribute('width', '1040');
        return;
      }
      var start = performance.now();
      var dur = 3800;
      (function frame(now) {
        if (!daysInView) return;
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 2.15);
        daysClip.setAttribute('width', String(1040 * eased));
        if (t < 1) daysRaf = requestAnimationFrame(frame);
        else daysRaf = 0;
      })(start);
    }
    function stopDays() {
      daysInView = false;
      if (daysTimer) {
        window.clearTimeout(daysTimer);
        daysTimer = null;
      }
      resetDays();
    }
    if (reduce || !('IntersectionObserver' in window)) {
      drawDays();
    } else {
      var daysSec = climb.closest('.la-days') || climb;
      var daysIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            if (daysTimer) window.clearTimeout(daysTimer);
            daysTimer = window.setTimeout(drawDays, 280);
          } else {
            stopDays();
          }
        });
      }, { threshold: 0.22, rootMargin: '0px 0px -12% 0px' });
      daysIo.observe(daysSec);
    }
  }

  /* FAQ smooth open/close */
  var faqList = document.querySelector('.la-faq-list');
  if (faqList) {
    var faqReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    faqList.querySelectorAll('details').forEach(function (item) {
      if (item.hasAttribute('open')) item.classList.add('is-open');
      var sum = item.querySelector('summary');
      if (!sum) return;
      sum.addEventListener('click', function (e) {
        e.preventDefault();
        var willOpen = !item.classList.contains('is-open');
        if (faqReduce) {
          item.open = willOpen;
          item.classList.toggle('is-open', willOpen);
          return;
        }
        if (willOpen) {
          item.open = true;
          item.offsetHeight;
          item.classList.add('is-open');
          return;
        }
        item.classList.remove('is-open');
        var closed = false;
        function finish() {
          if (closed) return;
          closed = true;
          if (!item.classList.contains('is-open')) item.open = false;
        }
        item.addEventListener('transitionend', function onEnd(ev) {
          if (ev.target !== item) return;
          item.removeEventListener('transitionend', onEnd);
          finish();
        });
        window.setTimeout(finish, 520);
      });
    });
  }
})();
