/**
 * Creates a ClickUp task in Sales HQ / Offer Testing MQLs for LP Demand Plan leads.
 *
 * Env (Vercel project settings):
 *   CLICKUP_API_TOKEN  – personal or workspace API token (required)
 *   CLICKUP_LIST_ID    – defaults to 901114027039 (Offer Testing MQLs)
 *
 * Custom fields are resolved by name from the list (case-insensitive):
 *   Contact Email | Company Website | List top competitor website url's
 */

const DEFAULT_LIST_ID = '901114027039';

const FIELD_ALIASES = {
  email: ['contact email', 'contactemail', 'email'],
  website: ['company website', 'companywebsite', 'website'],
  competitors: [
    "list top competitor website url's.",
    "list top competitor website url's",
    'list top competitor website urls',
    'list top competitor website url',
    'top competitors',
    'competitors'
  ]
};

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function allowOrigin(req) {
  var origin = req.headers.origin || '';
  if (
    origin === 'https://impactable.com' ||
    origin === 'https://www.impactable.com' ||
    origin === 'https://impactable.marketing' ||
    origin === 'https://www.impactable.marketing' ||
    /^https:\/\/impactablewebsite[a-z0-9-]*\.vercel\.app$/.test(origin) ||
    /^http:\/\/localhost(:\d+)?$/.test(origin)
  ) {
    return origin;
  }
  return 'https://impactable.com';
}

function normalizeWebsite(website) {
  var w = String(website || '').trim();
  if (w && !/^https?:\/\//i.test(w)) w = 'https://' + w;
  return w;
}

function normName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.\u2026]+$/g, '') // trailing period(s), e.g. "url's."
    .replace(/\s+/g, ' ')
    .trim();
}

function findFieldId(fields, aliases) {
  var byName = {};
  (fields || []).forEach(function (f) {
    if (f && f.id && f.name) byName[normName(f.name)] = f.id;
  });
  for (var i = 0; i < aliases.length; i++) {
    var id = byName[normName(aliases[i])];
    if (id) return id;
  }
  // Fuzzy fallback: any field whose normalized name contains every alias token
  // (helps when ClickUp adds punctuation / slight wording drift).
  var keys = Object.keys(byName);
  for (var a = 0; a < aliases.length; a++) {
    var alias = normName(aliases[a]);
    if (!alias || alias.indexOf(' ') === -1) continue;
    for (var k = 0; k < keys.length; k++) {
      if (keys[k] === alias || keys[k].indexOf(alias) !== -1) {
        return byName[keys[k]];
      }
    }
  }
  return null;
}

async function clickup(path, token, options) {
  var res = await fetch('https://api.clickup.com/api/v2' + path, {
    method: (options && options.method) || 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    },
    body: options && options.body ? JSON.stringify(options.body) : undefined
  });
  var text = await res.text();
  var data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      data = { message: text };
    }
  }
  return { ok: res.ok, status: res.status, data: data };
}

function readBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === 'string') {
    try {
      return Promise.resolve(JSON.parse(req.body || '{}'));
    } catch (err) {
      return Promise.reject(new Error('Invalid JSON'));
    }
  }
  return new Promise(function (resolve, reject) {
    var chunks = [];
    req.on('data', function (chunk) {
      chunks.push(chunk);
    });
    req.on('end', function () {
      var raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  var origin = allowOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  var token = process.env.CLICKUP_API_TOKEN;
  var listId = process.env.CLICKUP_LIST_ID || DEFAULT_LIST_ID;
  if (!token) {
    console.error('[lp-demand-lead] CLICKUP_API_TOKEN is not set');
    return json(res, 500, { ok: false, error: 'ClickUp is not configured' });
  }

  var body;
  try {
    body = await readBody(req);
  } catch (err) {
    return json(res, 400, { ok: false, error: 'Invalid JSON' });
  }
  body = body || {};

  var email = String(body.email || '').trim();
  var website = normalizeWebsite(body.website);
  var competitors = String(body.competitors || '').trim();
  var pageUri = String(body.pageUri || '').trim();

  if (!email || !website) {
    return json(res, 400, { ok: false, error: 'email and website are required' });
  }

  try {
    var fieldsRes = await clickup('/list/' + listId + '/field', token);
    if (!fieldsRes.ok) {
      console.error('[lp-demand-lead] field lookup failed', fieldsRes.status, fieldsRes.data);
      return json(res, 502, {
        ok: false,
        error: 'Could not load ClickUp fields',
        detail: fieldsRes.data
      });
    }

    var fields = fieldsRes.data && fieldsRes.data.fields;
    var emailField = findFieldId(fields, FIELD_ALIASES.email);
    var websiteField = findFieldId(fields, FIELD_ALIASES.website);
    var competitorsField = findFieldId(fields, FIELD_ALIASES.competitors);

    var custom_fields = [];
    if (emailField) custom_fields.push({ id: emailField, value: email });
    if (websiteField) custom_fields.push({ id: websiteField, value: website });
    if (competitors && competitorsField) {
      custom_fields.push({ id: competitorsField, value: competitors });
    }

    var stamp = new Date().toISOString();
    var taskName = website.replace(/\/$/, '') + ' - #' + stamp;
    var description = [
      'LP Demand Plan lead',
      'Email: ' + email,
      'Website: ' + website,
      competitors ? 'Competitors: ' + competitors : null,
      pageUri ? 'Page: ' + pageUri : null
    ]
      .filter(Boolean)
      .join('\n');

    var createRes = await clickup('/list/' + listId + '/task', token, {
      method: 'POST',
      body: {
        name: taskName,
        description: description,
        status: 'TO DO',
        custom_fields: custom_fields
      }
    });

    // Some workspaces reject unknown status labels — retry without status.
    if (!createRes.ok && createRes.data && /status/i.test(JSON.stringify(createRes.data))) {
      createRes = await clickup('/list/' + listId + '/task', token, {
        method: 'POST',
        body: {
          name: taskName,
          description: description,
          custom_fields: custom_fields
        }
      });
    }

    if (!createRes.ok) {
      console.error('[lp-demand-lead] create task failed', createRes.status, createRes.data);
      return json(res, 502, {
        ok: false,
        error: 'ClickUp task create failed',
        detail: createRes.data
      });
    }

    // Set custom fields individually if create ignored them (common for some types).
    var taskId = createRes.data && createRes.data.id;
    if (taskId && custom_fields.length) {
      await Promise.all(
        custom_fields.map(function (cf) {
          return clickup('/task/' + taskId + '/field/' + cf.id, token, {
            method: 'POST',
            body: { value: cf.value }
          });
        })
      );
    }

    return json(res, 200, {
      ok: true,
      taskId: taskId || null,
      taskUrl: createRes.data && createRes.data.url ? createRes.data.url : null,
      mapped: {
        email: !!emailField,
        website: !!websiteField,
        competitors: !!competitorsField
      }
    });
  } catch (err) {
    console.error('[lp-demand-lead] unexpected error', err);
    return json(res, 500, {
      ok: false,
      error: (err && err.message) || 'Unexpected error'
    });
  }
};
