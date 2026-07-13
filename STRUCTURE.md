# Impactable site structure

The canonical layout every **service page** should follow. Use this as the
reference when building a new page or reworking an existing one. The goal is a
predictable narrative arc and predictable anchor IDs across the whole site, so
navigation, deep-links, and "jump to pricing / book a call" behave the same
everywhere.

## Two design families

The site has two visual systems. **Family A is the template to build on.**

- **Family A — `.sec` system** (`linkedin-launch`, `linkedin-scale`,
  `marketing-ecosystem`, `activation`). Sections are
  `<section class="sec" style="border-top:1px solid var(--line-soft)">` with a
  `<div class="wrap">` inside, an `.eyebrow` kicker, then an `h2`. Shared
  components: `.wedge`, `.offerwrap`, `.steps`, `.cadence`, `.gal` /
  `.report-gal`, `.testi`, `.diff` (pricing), `.ladder-sec`, `.xfit`,
  `.vid-testi`, `.final`. Tighter and easier to keep consistent, because the
  four pages share one component library.
- **Family B — `.band` system** (`google`, `thought-leadership`; `intelligence-room`
  is a hybrid). Alternating `.band` / `.band alt` / `.band dark` sections with a
  `.hero`. More bespoke per page, so more expensive to keep in sync. Existing
  Family B pages are fine to leave, but **new service pages should use Family A.**

## Canonical section order (the 10-step spine)

| # | Purpose | Anchor ID | Notes |
|---|---------|-----------|-------|
| 1 | Hero (audience + promise) | `#top` | |
| 2 | Tension / the problem | (page-specific) | e.g. `#problem`, `#reality`, `#plateau` |
| 3 | The offer / how it works | (page-specific) | e.g. `#offer`, `#how`, `#build` |
| 4 | Process / mechanism | (page-specific) | e.g. `#process`, `#foundation` |
| 5 | Proof | `#proof` | primary testimonial / results block |
| 6 | Pricing | `#pricing` | |
| 7 | Start (entry offer) | `#start` | |
| 8 | Where this fits (cross-links) | `#fits` | `.xfit` trio |
| 9 | Video / peer proof | `#video-proof` | optional, if a video exists |
| 10 | FAQ | `#faq` | **required on every page**, sits just above the final CTA |
| — | Final CTA | `#book` | always the last section |

Steps 2 to 4 keep page-specific IDs (the tension/offer/process naming is part of
each page's story). **Steps 5 to 10 plus the final CTA use the fixed anchor IDs
above so they are identical site-wide.**

## Fixed anchor IDs (must match everywhere)

- `#proof` — primary proof / testimonials section
- `#pricing` — pricing section
- `#start` — entry-offer block
- `#faq` — FAQ (required on every page)
- `#book` — final CTA section

## The "Start" block

Two variants:

- **2-option `start2`** (free door + book a call) — the default on service /
  landing pages: `linkedin-launch`, `linkedin-scale`, `google`, `activation`,
  `thought-leadership`.
- **Full 5-rung `cro-ladder`** — only on the pages whose job is to explain the
  whole offer ladder: `pricing`, `marketing-ecosystem`, `intelligence-room`.

## FAQ

Every service page ends with an `#faq` section (3 to 4 questions) directly above
the final `#book` CTA, so the page still closes on a call to action. The FAQ
uses one shared, family-agnostic component (`.faqx`) built on native
`<details>/<summary>`, with CSS-variable fallbacks so the same markup adapts to
both families:

```
var(--line, var(--border, ...))   /* borders  */
var(--bone, var(--text, ...))     /* headings */
var(--blue, var(--accent, ...))   /* accent   */
var(--chalk, var(--text-muted,...))/* body     */
```

## House rules

- **No em dashes** anywhere (`scripts/check-seo.py` fails the build on `—` and
  `&mdash;`). Use commas or periods.
- Title 10 to 70 chars, meta description 50 to 170, one `<h1>`, a canonical tag,
  valid JSON-LD. Run `python3 scripts/check-seo.py` before committing.
- One free-first primary CTA per hero.
