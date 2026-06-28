# Form Setup: Competitor Intel Report

**Live method: ClickUp form embed.** The landing page (`competitor-intel-report.html`) embeds the
ClickUp form directly in the hero offer card, so submissions land straight in the ClickUp Leads
list. No backend, no glue, nothing to wire.

- **Embedded form:** `https://forms.clickup.com/9010022008/f/8cgm1kr-522071/7B7WZY38TOKDXBRDOF`
- The page loads `https://app-cdn.clickup.com/assets/js/forms-embed/v1.js`, which auto-resizes the
  iframe (the `clickup-dynamic-height` class).
- A fallback "open the form in a new tab" link sits under the embed in case the iframe is blocked.

## To change the form
1. Edit or rebuild the form in ClickUp.
2. Copy the new embed URL (the `forms.clickup.com/.../f/...` link).
3. In `competitor-intel-report.html`, replace the URL in BOTH places: the `<iframe src="...">` in the
   offer card and the fallback `<a href="...">` link beside it.

## Keep the fields short
The offer promise is low friction. Keep the ClickUp form to a few fields: name, work email,
company, and top 3 competitors. More than that and the no-brainer feeling goes away.

## After a submission lands
Set up a ClickUp automation on the Leads list: new task from form to notify the team and create a
48-hour delivery task, so the "built by hand in 48 hours" promise is met.

---

## Alternatives (not in use, kept for reference)

If you ever move off ClickUp, the page can also capture leads these ways. Each keeps the on-page
design and needs a small code swap back to a custom form:

- **HubSpot** (no backend, lands in CRM): submit to the public Forms endpoint
  `https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}`.
- **Google Sheet** (free): a Google Apps Script web app `doPost` that appends a row; the form POSTs
  JSON to the `/exec` URL.
- **Zapier / Make**: POST JSON to a catch hook that routes anywhere.

The earlier config-driven custom form (demo / hubspot / webhook) was replaced by the ClickUp embed.
Pull it from git history if you need to restore it.
