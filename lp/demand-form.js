(function () {
  var PORTAL_ID = '21999720';
  var FORM_ID = '9dd0378a-d1a8-40d2-8c6a-1755f3593186';
  var HS_ENDPOINT =
    'https://api.hsforms.com/submissions/v3/integration/submit/' +
    PORTAL_ID +
    '/' +
    FORM_ID;
  var CLICKUP_ENDPOINT = '/api/lp-demand-lead';
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

  function parseJsonResponse(res) {
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

  function postJson(url, payload) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Survives if another tag tries to navigate away mid-request
      keepalive: true
    }).then(parseJsonResponse);
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
      console.error('[demand-form] submit failed', err);
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

      var hsFields = [field('email', email), field('website', website)];
      if (competitors) {
        hsFields.push(field('top_competitors', competitors));
      }

      var hutk = cookie('hubspotutk');
      var hsPayload = {
        fields: hsFields,
        context: {
          pageUri: window.location.href,
          pageName: document.title
        }
      };
      if (hutk) hsPayload.context.hutk = hutk;

      var clickupPayload = {
        email: email,
        website: website,
        competitors: competitors,
        pageUri: window.location.href,
        pageName: document.title
      };

      sending = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.label = submitBtn.textContent;
        submitBtn.textContent = 'Sending…';
      }

      // HubSpot is required. ClickUp is best-effort so a missing token / API
      // hiccup never blocks the lead from landing in the CRM.
      Promise.all([
        postJson(HS_ENDPOINT, hsPayload),
        postJson(CLICKUP_ENDPOINT, clickupPayload).catch(function (err) {
          return { ok: false, error: err };
        })
      ])
        .then(function (results) {
          var hs = results[0];
          var cu = results[1];

          if (!isHubSpotSuccess(hs)) {
            var msg =
              (hs.data &&
                (hs.data.message ||
                  (hs.data.errors &&
                    hs.data.errors[0] &&
                    hs.data.errors[0].message))) ||
              'Something went wrong. Please try again.';
            throw new Error(msg);
          }

          if (!cu || !cu.ok) {
            console.warn('[demand-form] ClickUp task not created', cu);
          }

          var dest = (hs.data && hs.data.redirectUri) || THANK_YOU;
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
