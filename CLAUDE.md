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
- **Offer naming — live/current:** free = **Demand Plan**; single-channel audit =
  **Channel Check** ($499); the one-time $1,500 plan is the **LinkedIn Ads Launch
  Plan**, shown **only on linkedin-launch**. On the general strategy pages
  (intelligence-room, marketing-ecosystem) the strategy offering is **"Strategy
  Foundations"** (scoped, not a fixed price). **"Full Marketing Strategy" is
  retired everywhere (linted) — never reintroduce it.** NEVER "Demand Plan Lite" /
  "Demand Plan Full" (old naming, abandoned).
- **Managed tiers (public):** lead with **Core $3,000**/mo · Growth **$4,500**/mo
  · Scale **$6-12k**/mo. Flat monthly fee, not a percent of spend. **Pilot
  ($1,750) is NOT shown on any public page** (scoping/backend option only, dropped
  2026-07-25). Do not re-add a Pilot price/card/rung to public pages.
- **DemandSense is NOT ours.** It is a signal platform Impactable is a **top
  partner** in / **runs on**. Never "we built our own", "our own intelligence
  layer", "proprietary" tooling/infrastructure. The strategy and intelligence
  are Impactable's; DemandSense provides signals and reporting. Link out with
  `https://demandsense.com/?utm_source=impactable&utm_medium=referral&utm_campaign=site`.
- **CRM framing:** we do NOT "wire signals/attribution into your CRM". We **sync
  the client's CRM with DemandSense** so reporting is anchored in real deals and
  pipeline. Say "CRM synced with DemandSense", never "wired to your CRM" (linted).
  (Exception: google.html's offline-conversion import genuinely wires the CRM
  into Google Ads, a different, correct claim.)
- **What we actually do:** competitor intel + audience targeting built from
  signals, first-party data, and in-market intent. NOT "engineer the account
  list before you spend." Never the phrase "account list."
- **Voice:** no em dashes (use commas/periods). Contractions on. No "by hand"
  framing. Banned words: unlock, disrupt, game-changing, synergy, cutting-edge,
  hustle. No delivery-time estimates on the strategy / Impact Report offers
  (e.g. "2-3 weeks"). A "90-day plan/roadmap" as a deliverable *horizon* is fine.
- **Channel naming:** the paid-social channel is **"B2B Facebook"**, never
  "Facebook and Instagram" / "Facebook & Instagram" (linted). Standalone
  "Facebook" in prose is fine.
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
- Services nav is a three-column mega-menu: "LinkedIn Ads" (agency, new,
  scaling, audit), "By industry" (SaaS, cybersecurity, financial services, all
  industries), "Everything else". Every content page's footer also carries a
  "By industry" column. How We Work has ONE "Strategy & Diagnostics" item
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
googledc79b137a1cd7351.html. Pages whose `robots` meta says **noindex** (paid
`/lp/*`, thank-you, redesign) still need the core hygiene (title, description,
canonical, robots, one `<h1>`, no em dash, no banned phrases) but are exempt
from OG/Twitter/JSON-LD. The gate scans **root `*.html`, `thought-leadership/*`,
and `lp/*`** — any new page in those trees is auto-gated. If you add a new
subdirectory of indexed pages, add its glob to the gate.

## New-page SEO + AEO checklist (non-negotiable; the gate enforces the starred items)
Every new indexed page must ship with:
- ⭐ **Title** 10-70 chars, unique, lead keyword first (e.g. "Thought Leadership for SaaS Founders | Impactable").
- ⭐ **Meta description** 50-170 chars (aim ~150 so it doesn't truncate in SERPs/AI answers); mirror it into `og:description` + `twitter:description`.
- ⭐ **Canonical** (self, absolute) + **robots** (`index, follow, max-image-preview:large`, or `noindex` for LPs).
- ⭐ **Open Graph + Twitter** card tags with a real `og:image`.
- ⭐ **Exactly one `<h1>`**, then a clean `<h2>`/`<h3>` hierarchy. No em dashes. No banned phrases.
- ⭐ **Valid JSON-LD** `@graph`. Include, in this order: a self-contained
  **Organization** node (id `#org`, with `sameAs` LinkedIn/YouTube + `founder`),
  a **WebPage** node with `datePublished` + **`dateModified`** (freshness is a
  top AEO citation signal) and `publisher` → `#org`, a **BreadcrumbList**, the
  page's primary type (**Service**, Article, etc.), and a **FAQPage** if the
  page has genuine Q&A (FAQPage produces the highest AI-citation lift).
- **AEO content shape** (not gated, but do it): phrase key `<h2>`/`<h3>` as real
  questions buyers ask; lead each section with a direct 40-80 word answer, then
  expand; keep claims specific and backed by a stat or named proof
  (Lacework 6X, HeyReach 20X, published CPL ranges) so answer engines can quote
  a self-contained, attributable sentence. Cite the real external source when
  one exists. Bump `dateModified` when copy changes materially.
- The persona pages are generated by `scripts/build_tl_personas.py`; its
  `head()` already emits all of the JSON-LD above. Reuse that pattern for new
  templated pages rather than hand-rolling schema.
- **llms.txt is intentionally NOT maintained** — as of 2026 the major AI
  crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) overwhelmingly
  ignore it and Google has said it won't support it. Don't add it as an SEO/AEO
  measure; on-page schema + content shape is what earns citations.

## Canonical values (single source of truth)
These are the only correct spellings. They also live in `check-seo.py` (`CANON`)
and the gate enforces their formatting.

| Offer | Name | Price |
|---|---|---|
| Free | Demand Plan | free |
| Single-channel audit | Channel Check | $499 |
| One-time plan (launch page only) | LinkedIn Ads Launch Plan | $1,500 |
| Strategy offering (intelligence-room, ecosystem) | Strategy Foundations | scoped on a call |
| Managed, one channel | Core | $3,000/mo |
| Managed, two channels | Growth | $4,500/mo |
| Managed, full system | Scale | $6-12k/mo (detail pages: $6,000 to $12,000) |

## When you change pricing / packaging / language (SWEEP — do not edit one spot)
A change in one place must be swept everywhere. Process:
1. Update the canonical table above **and** `CANON` in `scripts/check-seo.py`.
2. Propagate site-wide: `python3 scripts/sweep.py "old" "new"`
   (preview first with `--dry`; find with `--find "text"`).
3. Add the **old** value to `BANNED` in `check-seo.py` so a leftover can never ship.
4. Run `python3 scripts/check-seo.py` (must PASS) before pushing.

## LinkedIn cluster status
**All LIVE:** `/linkedin-ads-agency` (flagship hub), `/linkedin-ads-audit`,
`/linkedin-ads-by-industry` (verticals hub), `/linkedin-ads-for-saas`,
`/linkedin-ads-for-cybersecurity`, `/linkedin-ads-for-financial-services`
(system-led, keyword-focused, no named accounts; drop a real FinServ case into
its Proof section when one exists). Nav, flagship hub cards, footer "By industry"
group, and sitemap are all wired. `/programmatic` (B2B Programmatic money page)
is LIVE and wired (nav "Programmatic" repointed from /marketing-ecosystem in all
files, footer, sitemap). Future/optional: a dedicated B2B Facebook money page,
and a 4th vertical (healthtech or pro services).

## /programmatic conventions (compliance-sensitive)
- **No vendor names.** Never name the DSP or any data provider. Reference every
  capability by its job.
- **First-party wording.** Never imply we take/extract/export audiences from
  LinkedIn. Frame as the client's OWN first-party signal (companies/people
  engaging with them on LinkedIn + visiting their site), built into an audience
  reached across the open web. Compliance-sensitive.
- **No "account list"** (site-wide lint). The targeting section is "Your
  audience, built from signal" (not "the programmatic account list").
- **Honest expectations.** Programmatic = reach/trust/incremental lift, measured
  on awareness + engagement, best run alongside a capture channel. No direct or
  last-click ROI promises. No fabricated programmatic metrics (Lacework/HeyReach
  are agency proof only; drop a real awareness/engagement case in when cleared).
- Open items for Justin (not yet resolved): publisher names/logos to show, how
  boldly to feature emerging AI placements + geofencing.

## Decisions log (newest first)
- **2026-07-25** Display font aligned to the homepage: headlines now use **Anton**
  (`--font-display`), not Archivo Black. Swapped `'Archivo Black'` -> `'Anton'`
  across all content pages (the `.display` rule uses Anton tracking:
  `letter-spacing:.01em;line-height:.98;font-weight:400;text-transform:uppercase`).
  Google (on Mona Sans) got a targeted `h1,h2,.hero h1,.final h2` Anton override.
  Anton is loaded via the Google Fonts link on every page. Do not reintroduce
  Archivo Black. (Remaining homepage-only visual: organic hero background +
  animated system rail; Google body text is still Mona Sans, others are Inter.)
- **2026-07-25** Palette realigned to the redesigned homepage across all content
  pages (money pages first). Warm navy -> redesign navy (`#071A38`->`#001122`,
  `#0E2A50`->`#0D2744`, `#173B66`->`#002245`) and **amber/canopy -> teal**
  (`#FFB627`/`#A66A00`->`#00C4B3`), moss->lime (`#7BAA3E`->`#C6FF3D`); hero
  headline pop (`.hero h1 .em`) is now teal to match the homepage's `.em`.
  IMPORTANT: the `--canopy`/`--clay` variables still exist by NAME but now render
  **teal**, not amber. The brand accent is **teal `#00C4B3`** (+ blue `#0099D1`,
  lime `#C6FF3D`); do not reintroduce amber `#FFB627`. Still on the old visual
  system (not migrated to redesign.css): organic hero background, Anton display
  font, and exact section rhythm are homepage-only for now.
- **2026-07-25** Enriched the vertical spokes (saas/cybersecurity/financial-services)
  to scale-level depth: added scale's account-coverage **reporting waterfall**
  (`.fun` specimen, "The reporting big accounts actually need") above the existing
  named-accounts grid, and a **"how pricing works" + custom ($25k-$500k+) note**
  under the Core/Growth/Scale ladder. Proof was already at parity (award image +
  summit thumbs + CAPI + Lacework + HeyReach). Spokes differ from scale only in
  hero/message now.
- **2026-07-25** Pricing/offer consistency pass. Pilot dropped from every public
  page; managed pricing leads and is **Core $3,000 / Growth $4,500 / Scale $6-12k
  + Custom** consistently across pricing, spokes, scale, launch, and google
  (google's $3k Google+LinkedIn card folded into the standard Growth tier). The
  one-time $1,500 offer is renamed **"LinkedIn Ads Launch Plan" and shown only on
  linkedin-launch**; "Full Marketing Strategy" removed as a priced offer elsewhere
  (strategy work still described). scale leads with Demand Plan + Book a call (paid
  offer demoted to "Account Diagnostic"). LP `/lp/*` forms capture via the ClickUp
  embed. STILL PENDING: FMS on intelligence-room + marketing-ecosystem; add FMS to
  BANNED once fully cleared.

- **2026-07-25** Built and shipped `/programmatic` (B2B Programmatic money page)
  from the deep-build spec: hero + Everywhere Effect placements + full-channel
  (not retargeting) + first-party-vs-rented wedge + reachability + targeting +
  specialty plays + awareness/engagement measurement + who-it's-for + ecosystem
  cross-links + proof (Lacework/HeyReach/Clutch, agency-level) + FAQ (FAQPage
  schema) + final CTA. Cloned from linkedin-launch (gnav/footer/components).
  Reconciled spec vs. gate: "Demand Plan Lite" -> Demand Plan; "the programmatic
  account list" -> "Your audience, built from signal" (account-list is banned).
  Nav "Programmatic" repointed to /programmatic in all files; footer + sitemap
  wired. See /programmatic conventions above.
- **2026-07-25** CRM framing corrected site-wide: we **sync the client's CRM with
  DemandSense** so reporting is anchored in real deals and pipeline. Removed
  "wired to your CRM" / "attribution wired into your CRM" from index, verticals
  hub, audit, marketing-ecosystem, and pricing; added the phrase to `BANNED`.
  Also removed the "Led by founder Justin Rowe" line from the pricing team
  section (kept the LinkedIn Partner + Lacework/HeyReach proof).
- **2026-07-25** Dropped **Pilot ($1,750) from every public page** and made
  managed pricing lead. `pricing.html` reordered so the Core/Growth/Scale + Custom
  block sits directly under the hero and the free/low-commitment offers (Demand
  Plan, Channel Check) move below it (visitors expect the management fee first).
  Spoke/flagship cro-ladders went 4->3 rungs (Core/Growth/Scale); launch and
  google pricing grids dropped the Pilot card and lead with Core; flagship FAQ +
  index + intelligence-room copy now reference Core, not a $1,750 Pilot. Pilot
  remains a scoping/backend option, just not shown publicly.
- **2026-07-25** `pricing.html` is intentionally scoped to managed **Core /
  Growth / Scale + a Custom band** ($25k-$500k+). Pilot ($1,750) and the $1,500
  Full Marketing Strategy / Impact Report are deliberately NOT shown on this page
  (they still exist as offers and appear on other pages, e.g. the flagship /
  scale). Do not "restore" them here as if it were a regression. Web ID is a
  **Growth-tier ($4,500) inclusion** (and above), not a Core feature. Page anchors
  on Book a call. Added a "Who runs your account" senior-pod section (4 role cards
  + pod-by-tier row + founder credibility line) to show the team and justify the
  flat fee.
- **2026-07-19** Verticals surfaced best-practice: Services mega-menu is now
  three columns with a dedicated "By industry" column (SaaS, cybersecurity,
  financial services, all industries), and every content page's footer carries
  a "By industry" column.
- **2026-07-19** Every LinkedIn-cluster page (audit, hub, all spokes) carries the
  LinkedIn partnership sections (certified-agency award + summit photos + CAPI)
  and the managed pricing grid, structured like /linkedin-scale. Only hero
  language and references differ by industry. Audit's "what it covers" mirrors
  the real 35-point inspection: 6 diagnostic layers (7/6/7/6/5/4).
- **2026-07-19** Built the full LinkedIn cluster (audit, verticals hub, SaaS,
  cybersecurity, financial-services) and wired nav/hub/footer/sitemap.
- **2026-07-19** Channel naming: "B2B Facebook", never "Facebook and Instagram"
  (linted). FinServ built system-led, keyword-focused, no named accounts.
- **2026-07-19** Consistency mechanism: added `scripts/sweep.py` and a canonical
  values table + `CANON`/price-format checks in the gate. Rule: never change a
  price/name/phrase in one spot — sweep it everywhere (process above).
- **2026-07-19** FinServ spoke = system-led, keyword-focused, no named accounts.
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
