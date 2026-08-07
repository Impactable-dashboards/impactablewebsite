(function () {
  var PORTAL_ID = '21999720';
  var FORM_ID = '9dd0378a-d1a8-40d2-8c6a-1755f3593186';
  var ENDPOINT =
    'https://api.hsforms.com/submissions/v3/integration/submit/' +
    PORTAL_ID +
    '/' +
    FORM_ID;
  var THANK_YOU = '/lp/thank-you';

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

  function field(name, value) {
    return { objectTypeId: '0-1', name: name, value: value };
  }

  function bind(form) {
    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';

    var status = form.querySelector('[data-form-status]');
    var submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus(status, '', false);

      var email = ((form.elements.email && form.elements.email.value) || '').trim();
      var website = ((form.elements.website && form.elements.website.value) || '').trim();
      var competitors = ((form.elements.competitors && form.elements.competitors.value) || '').trim();

      if (!email) {
        setStatus(status, 'Please enter your work email.', true);
        form.elements.email && form.elements.email.focus();
        return;
      }
      if (!website) {
        setStatus(status, 'Please enter your company website.', true);
        form.elements.website && form.elements.website.focus();
        return;
      }

      // Normalize bare domains so HubSpot website field accepts them
      if (website && !/^https?:\/\//i.test(website)) {
        website = 'https://' + website;
      }

      var fields = [field('email', email), field('website', website)];
      if (competitors) {
        fields.push(field('your_top_competitors', competitors));
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
          return res.text().then(function (text) {
            var data = null;
            if (text) {
              try {
                data = JSON.parse(text);
              } catch (err) {
                data = { message: text };
              }
            }
            return { ok: res.ok, status: res.status, data: data };
          });
        })
        .then(function (result) {
          if (!result.ok) {
            var msg =
              (result.data && (result.data.message || (result.data.errors && result.data.errors[0] && result.data.errors[0].message))) ||
              'Something went wrong. Please try again.';
            throw new Error(msg);
          }
          window.location.assign(THANK_YOU);
        })
        .catch(function (err) {
          console.error('[demand-form] HubSpot submit failed', err);
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
