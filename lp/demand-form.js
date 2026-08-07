(function () {
  var PORTAL_ID = '21999720';
  var FORM_ID = '9dd0378a-d1a8-40d2-8c6a-1755f3593186';
  var ENDPOINT =
    'https://api.hsforms.com/submissions/v3/integration/submit/' +
    PORTAL_ID +
    '/' +
    FORM_ID;
  var FALLBACK_THANK_YOU = '/thank-you';

  function cookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  function setStatus(el, msg, isError) {
    if (!el) return;
    el.hidden = !msg;
    el.textContent = msg || '';
    el.classList.toggle('is-error', !!isError);
  }

  function bind(form) {
    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';

    var status = form.querySelector('[data-form-status]');
    var submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus(status, '', false);

      var email = (form.email && form.email.value || '').trim();
      var website = (form.website && form.website.value || '').trim();
      var competitors = (form.competitors && form.competitors.value || '').trim();

      if (!email) {
        setStatus(status, 'Please enter your work email.', true);
        form.email && form.email.focus();
        return;
      }
      if (!website) {
        setStatus(status, 'Please enter your company website.', true);
        form.website && form.website.focus();
        return;
      }

      var fields = [
        { name: 'email', value: email },
        { name: 'website', value: website }
      ];
      if (competitors) {
        fields.push({
          objectTypeId: '0-1',
          name: 'your_top_competitors',
          value: competitors
        });
      }

      var hutk = cookie('hubspotutk');
      var payload = {
        fields: fields,
        context: {
          pageUri: window.location.href,
          pageName: document.title
        }
      };
      if (hutk) payload.context.hutk = hutk;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.label = submitBtn.textContent;
        submitBtn.textContent = 'Sending…';
      }

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (!result.ok) {
            var msg =
              (result.data && result.data.message) ||
              'Something went wrong. Please try again.';
            throw new Error(msg);
          }
          var dest =
            (result.data && result.data.redirectUri) || FALLBACK_THANK_YOU;
          window.location.assign(dest);
        })
        .catch(function (err) {
          setStatus(
            status,
            (err && err.message) || 'Something went wrong. Please try again.',
            true
          );
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.label || 'Get My Free Demand Plan';
          }
        });
    });
  }

  function init() {
    document.querySelectorAll('form[data-hs-demand-form]').forEach(bind);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
