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

  // HubSpot success bodies are usually {redirectUri} or {inlineMessage} or {}.
  // Reject HTML/challenge pages that still come back as HTTP 200.
  function isHubSpotSuccess(result) {
    if (!result || !result.ok) return false;
    var data = result.data;
    if (data == null) return true;
    if (typeof data !== 'object') return false;
    if (data.status === 'error' || data.errors) return false;
    if (data.redirectUri || data.inlineMessage) return true;
    return !data.message;
  }

  function bind(form) {
    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';

    var status = form.querySelector('[data-form-status]');
    var submitBtn =
      form.querySelector('[data-hs-submit]') ||
      form.querySelector('[type="submit"]');
    var sending = false;

    function fail(err) {
      console.error('[demand-form] HubSpot submit failed', err);
      setStatus(
        status,
        (err && err.message) || 'Something went wrong. Please try again.',
        true
      );
      sending = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.label || 'Get My Free Demand Plan';
      }
    }

    function submit() {
      if (sending) return;
      setStatus(status, '', false);

      var email = ((form.elements.email && form.elements.email.value) || '').trim();
      var website = ((form.elements.website && form.elements.website.value) || '').trim();
      var competitors =
        ((form.elements.competitors && form.elements.competitors.value) || '').trim();

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
        fields.push(field('top_competitors', competitors));
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

      sending = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.label = submitBtn.textContent;
        submitBtn.textContent = 'Sending…';
      }

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // Survives if another tag tries to navigate away mid-request
        keepalive: true
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
          if (!isHubSpotSuccess(result)) {
            var msg =
              (result.data &&
                (result.data.message ||
                  (result.data.errors &&
                    result.data.errors[0] &&
                    result.data.errors[0].message))) ||
              'Something went wrong. Please try again.';
            throw new Error(msg);
          }
          var dest =
            (result.data && result.data.redirectUri) || THANK_YOU;
          window.location.assign(dest);
        })
        .catch(fail);
    }

    // Do NOT rely on the form "submit" event. GTM / other tags often listen for
    // it and navigate to the thank-you URL immediately, aborting the HubSpot
    // fetch. Drive the flow from the button (+ Enter) instead.
    if (submitBtn) {
      submitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        submit();
      });
    }

    form.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.keyCode !== 13) return;
      if (e.target && e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
      e.stopPropagation();
      submit();
    });

    // Belt-and-suspenders: if anything still fires submit, kill it before GTM.
    form.addEventListener(
      'submit',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        submit();
      },
      true
    );
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
