# Impactable website — working guide

Static, hand-coded HTML marketing site for Impactable (B2B LinkedIn/Google ads
agency; founder Justin Rowe). Every page is a standalone `.html` file with its
own inline `<style>`. Deploys on Vercel from `main` to **impactable.marketing**.

**Read this before editing. It exists so past fixes are not re-fixed.** The
"Decisions log" at the bottom records what changed and the rule learned. The
content-lint in `scripts/check-seo.py` enforces the non-negotiables below and
fails the build on a regression.

## Deploy flow
- Develop on branch `claude/sweet-faraday-7rl8wn`.
- **Run `python3 scripts/check-seo.py` before every push. It must PASS.**
- `git config user.email noreply@anthropic.com && git config user.name Claude`
  (a stop-hook flags commits otherwise; amend --reset-author if reminded).
- Push branch, then `git checkout main && git merge --ff-only <branch> && git push origin main`, then check back out the branch.
- Commit trailers: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` and the `Claude-Session:` line.
- **Never ship dead links to `main`.** If a page links to something not built
  yet, neutralize the link (or build the target first). Cross-linked page sets
  merge to `main` together.

## Non-negotiable content conventions (enforced by the gate)
- **Offer naming — live/current:** free = **Demand Plan**; one-time paid = **Full
  Marketing Strategy** ($1,500); single-channel audit = **Channel Check** ($499).
  NEVER "Demand Plan Lite" / "Demand Plan Full" (old naming, abandoned).
- **Managed tiers:** Pilot **$1,750**/mo · Core **$3,000**/mo · Growth **$4,500**/mo
  · Scale **$6-12k**/mo. Flat monthly fee, not a percent of spend.
- **DemandSense is NOT ours.** It is a signal platform Impactable is a **top
  partner** in / **runs on**. Never "we built our own", "our own intelligence
  layer", "proprietary" tooling/infrastructure. The strategy and intelligence
  are Impactable's; DemandSense provides signals and reporting. Link out with
  `https://demandsense.com/?utm_source=impactable&utm_medium=referral&utm_campaign=site`.
- **What we actually do:** competitor intel + audience targeting built from
  signals, first-party data, and in-market intent. NOT "engineer the account
  list before you spend." Never the phrase "account list."
- **Voice:** no em dashes (use commas/periods). Contractions on. No "by hand"
  framing. Banned words: unlock, disrupt, game-changing, synergy, cutting-edge,
  hustle. No delivery-time estimates on the strategy / Impact Report offers
  (e.g. "2-3 weeks"). A "90-day plan/roadmap" as a deliverable *horizon* is fine.
- **Five signal sources:** CRM, LinkedIn paid, LinkedIn organic, companies on
  site, people on site. CAPI is Impactable's certified integration (not a
  DemandSense feature).
- **Proof — real only.** Lacework 6X (cybersecurity, published by LinkedIn),
  HeyReach 20X (SaaS, on camera), Clutch 4.5-5.0. Never fabricate a case
  (esp. Financial Services — no named case yet).

## Hero conventions (keep heroes clean)
- Partner badge = single line "LinkedIn Marketing Partner" (no "· suffix").
- One short eyebrow line. No stacked double eyebrows.
- No small reassurance line under the CTAs (the old `.cta-reassure` line — removed everywhere).
- Highlight pops: blue (`.em`/`.hl`) + a second canopy pop (`.em2`/`.text-canopy`/inline `var(--canopy)`). Two pops max; do not over-highlight.
- Long headlines must be sized down to fit (see `competitor-intel-report.html`
  `.hero h1` and its `.em2` canopy rule). Never let a headline overflow.

## Design system
- Two families: **A** = `.sec` + `--canopy` (#FFB627) + `.hl` (blue) + `.em`
  (blue-soft); **B** = `.band` + `--accent` + `.text-accent` / `.text-canopy`.
- The `gnav` mega-menu and the head tracking block are **duplicated in every
  HTML file** — edit them consistently across all pages (script it).
- Services nav is LinkedIn-anchored (two columns: "LinkedIn Ads" first, then
  "Everything else"). How We Work has ONE "Strategy & Diagnostics" item
  (the duplicate "Diagnostic Reporting" was removed — both pointed to /intelligence-room).
- `.reveal` elements fade in on scroll, so they look dim/blank in static
  screenshots — that is a render artifact, not a bug. Verify layout in a real browser.
- Images live in `/img/`. In local `file://` renders `/img/...` shows as broken;
  they load fine on the live server. Key assets: linkedin-award.jpg,
  linkedin-summit-1/2/3.jpg, capi-certification.png, attribution*.png, lacework-*.jpg.

## SEO gate (`scripts/check-seo.py`)
Requires per public page: title 10-70, meta description 50-170, canonical,
robots, OG + Twitter tags, valid JSON-LD, exactly one `<h1>`, no em dashes, and
none of the banned phrases above. `EXCLUDE`: pricing-table-embed.html,
googledc79b137a1cd7351.html. `NOINDEX`: thank-you.html.

## LinkedIn cluster status
LIVE: `/linkedin-ads-agency` (flagship hub). **Still to build** (copy is final
in the spec files; build all on impactable.marketing, cross-link, then merge
together): `/linkedin-ads-audit`, `/linkedin-ads-by-industry` (verticals hub),
`/linkedin-ads-for-saas`, `/linkedin-ads-for-cybersecurity`,
`/linkedin-ads-for-financial-services`. When they exist, re-wire: nav (add
LinkedIn Ads Audit + LinkedIn Ads by Industry), Channel Audits → /linkedin-ads-audit,
flagship hub cards (audit + by-industry), footer "By industry" group, sitemap.

## Decisions log (newest first)
- **2026-07-19** Removed "Two to three weeks" from the launch/scale offer subs.
  Rule: no delivery-time estimates on strategy/audit offers (now linted).
- **2026-07-19** Added LinkedIn partnership visuals to the flagship (certified
  agency award + summit photos + CAPI listing) in place of a plain text strip.
  Rule: LinkedIn relationship is core proof on LinkedIn-centric pages.
- **2026-07-19** Flagship pricing shows the four managed packages
  (1,750 / 3,000 / 4,500 / 6-12k).
- **2026-07-19** Hero cleanup: single badge line, one short eyebrow, removed the
  small `.cta-reassure` line, tighter two-tone headline pops. Homepage was too busy.
- **2026-07-19** Corrected the "engineer the account list before you spend"
  claim everywhere → competitor intel + audience targeting from signals,
  first-party data, in-market intent. (Linted: "account list".)
- **2026-07-19** Built flagship `/linkedin-ads-agency`; restructured Services
  nav LinkedIn-anchored; removed duplicate "Diagnostic Reporting" nav item.
- **2026-07-19** DemandSense repositioned from owned ("we built our own",
  "proprietary", "our own intelligence layer") to a partner platform we run on.
  Scrubbed "by hand" framing. (All linted.)
- **2026-07-19** Naming standardized to Demand Plan (free) / Full Marketing
  Strategy ($1,500); "Lite/Full" abandoned. (Linted.)
- **2026-07-19** "Daily optimization" → "ongoing optimization". (Linted.)
