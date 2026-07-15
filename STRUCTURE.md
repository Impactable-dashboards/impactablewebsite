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

---

# Offer / lead-magnet landing pages

A different animal from a service page. A **service page** educates and sells a
service across a broad narrative with an offer ladder. An **offer page** exists
to convert one specific low-friction offer (a free audit, a gated asset, a lead
magnet) and nothing else. Reference implementation: `competitor-intel-report.html`.

## The one rule

**One page, one job, one primary CTA.** Every section drives to the same single
conversion (the form or the booking). Do not introduce competing offers or a
full offer ladder. Repeat the *same* primary CTA down the page.

## Canonical offer-page spine

| # | Section | Job |
|---|---------|-----|
| 1 | **Hero** | Who it's for (eyebrow) + the promise + the deliverable named, primary CTA, and an offer card that lists the parts of what they get. One or two proof stats. |
| 2 | **What you get** | Spell out the deliverable concretely (the N documents/parts). Lead with this, right after the hero, before any philosophy. |
| 3 | **Proof** | Stats, named results, trust badges. Stated plainly, placed *after* the offer to reinforce. No framing lecture, no competitor bashing. |
| 4 | **Why it's different / the mechanism** | The unique method, framed positively (what *we* do), not "every other agency…". |
| 5 | **Sample outputs** | Show the actual thing (specimens/screenshots) so the deliverable is tangible. |
| 6 | **Where it leads** (optional) | The paid next step after the free offer, kept clearly subordinate. CTAs still point to the free offer. |
| 7 | **Conversion section** | The on-page form (or booking). Minimal fields. Restate turnaround and "no pitch unless you ask." |
| 8 | **How it works** | 3 steps, the turnaround, zero obligation. |
| 9 | **FAQ** | Objection handling: is it free / what's the catch, what do you need from me, will you spam me, what happens after. |
| 10 | **Final CTA** | Restate the offer and repeat the primary CTA. |

## Best practice

**Do**
- Put the offer and the deliverable above the fold or one scroll down.
- Keep it free / low-commitment; state the turnaround and that a human handles it.
- Make proof concrete and named, and place it after the offer.
- Keep every claim one you can stand behind and scope it honestly (e.g. "a
  targeting worksheet composed from signals, filters and data," not "a named
  account list" if that isn't always what's delivered).
- Match the framing to reality (if a human builds it, say so; don't imply
  auto-generated, and don't claim hand-built if it isn't).

**Don't**
- Stack competing offers or a 5-rung ladder on a single-offer page.
- Bash "every other agency"; make the case positively.
- Bury the offer under philosophy or a long problem essay before saying what
  they get.
- Add mid-page CTAs that point somewhere other than the one conversion.

## Nav

These pages keep the shared `gnav` for brand consistency. For dedicated
paid-campaign traffic, a stripped-down nav (logo + single CTA, no menu) usually
converts better; consider a per-campaign variant if you run paid traffic to it.
