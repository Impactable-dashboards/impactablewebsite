# Form Setup: Competitor Intel Report

The landing page form (`competitor-intel-report.html`) captures four fields and is wired to go
live with **one switch**. Open the `<script>` near the bottom of the file and set `CONFIG.mode`.

Captured fields: `name`, `email`, `company`, `competitors` (plus `source`).

Default is `demo` (shows the success state, logs to console, sends nothing). Pick one option below.

---

## Recommended: HubSpot (no backend, lands in your CRM)

Best fit because you already run HubSpot for attribution. The lead becomes a contact the moment
the form is submitted, so it ties straight into the LinkedIn to site to CRM trail. No server needed.

**Steps:**
1. In HubSpot: Marketing > Forms > Create form (a non-HubSpot / embedded form is fine).
2. Add fields: First name, Email, Company, and a single-line text property for competitors.
   - Create a contact property named **`top_competitors`** (single-line text), or rename the
     field in the script to match an existing property.
3. Publish the form. From the embed code, grab the **Portal ID** and **Form GUID**.
4. In the page script set:
   ```js
   var CONFIG = {
     mode: 'hubspot',
     hubspot: { portalId: 'YOUR_PORTAL_ID', formGuid: 'YOUR_FORM_GUID' },
     webhookUrl: ''
   };
   ```
5. Optional: set up a HubSpot workflow on new submissions to notify the team and create a
   48-hour delivery task.

Nothing secret lives in the page. The submission endpoint is public by design.

---

## Option B: Google Sheet (free, simple)

Keeps the on-page form. A short Google Apps Script receives the POST and appends a row.

**Steps:**
1. Create a Google Sheet with header row: `timestamp | name | email | company | competitors`.
2. Extensions > Apps Script, paste:
   ```js
   function doPost(e) {
     var data = JSON.parse(e.postData.contents);
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
     sheet.appendRow([new Date(), data.name, data.email, data.company, data.competitors]);
     return ContentService.createTextOutput(JSON.stringify({ok: true}))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```
3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone. Copy the `/exec` URL.
4. In the page script set:
   ```js
   var CONFIG = { mode: 'webhook', hubspot: {portalId:'',formGuid:''}, webhookUrl: 'YOUR_EXEC_URL' };
   ```

Note: cross-origin POST to Apps Script works; the page does not need the response, so a follow-up
on the Sheet is the source of truth.

---

## Option C: ClickUp (trigger as a lead)

ClickUp does not accept an authenticated API POST safely from a public page, so use one of these:

- **Cleanest, keeps our design:** point the same webhook at a **Zapier / Make catch hook**, then
  the Zap creates a ClickUp task in your Leads list. Set `mode: 'webhook'` with the hook URL.
- **No-code, replaces our form:** build a native **ClickUp Form** view on a Leads list and link
  the page CTA buttons to that hosted form URL instead. You lose the on-page design but it is the
  fastest path with zero glue.

For the Zapier route:
```js
var CONFIG = { mode: 'webhook', hubspot: {portalId:'',formGuid:''}, webhookUrl: 'YOUR_ZAPIER_HOOK' };
```

---

## Which to choose

| Option | Backend? | Keeps page design? | Feeds CRM/attribution | Effort |
| --- | --- | --- | --- | --- |
| **HubSpot** (recommended) | No | Yes | Direct | Low |
| Google Sheet | Apps Script (free) | Yes | Manual / export | Low |
| ClickUp via Zapier | Zapier | Yes | Via Zap | Low-Med |
| ClickUp native form | No | No | Via ClickUp | Lowest |

The form fails open: if a send errors, the user still sees the confirmation and the payload is
logged, so a submission is never lost silently during testing.
