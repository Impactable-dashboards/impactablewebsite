# Campaign Brief: Competitor Intel Report (VP / Exec)

**Status:** Ready for setup
**Owner:** Impactable Growth
**Date:** June 2026
**Anchored to:** Brand-core docs (June 24, 2026): 00-snapshot, 01-positioning, 02-competitors, 03-audience, 04-messaging-offer, 05-brand-voice. These are the governing source of truth.

---

## 1. Strategy at a glance

| Element | Decision |
| --- | --- |
| Position | Impactable is the B2B Demand Intelligence System. Lead with the system and the signal stack. |
| Lead persona | VP / Exec Economic Buyer (CMO, VP Marketing/Growth, CRO; 200 to 1,000 employees) |
| Lead pillar | The Demand Intelligence System + Named-Account & Revenue Proof |
| Support pillar | Signal Composition (the "how") |
| Primary offer | Competitor Intel Report + Targeting Worksheet (free, three documents) |
| Conversion mechanism | "Reply with your top competitors" then landing page form (4 fields) |
| Landing page | `/competitor-intel-report.html` |
| Booking fallback | `https://landbot.online/v3/H-2201411-ZNNL8EM9RF7C2XAC/index.html` |
| Tone | Confident. Specific. Honest. No em-dashes. No ban-list phrases. Proof inventory only. |

**Thesis:** Exec buyers own the board narrative and cannot defend LinkedIn spend they
cannot trace. Lead with the system and named-account proof (6.7x on our own spend, 5x
multi-signal close), then offer the free three-document Competitor Intel bundle as a
low-friction, board-relevant hand-raise that proves how we think before money changes hands.

---

## 2. The offer (renamed for clarity)

**Competitor Intel Report + Targeting Worksheet.** Three documents, built for you, 48-hour
turnaround. "White space" was insider jargon, so the customer-facing language is now plain.

| # | Document | What it is |
| --- | --- | --- |
| 01 | **Competitor Intel** | What your top rivals run on LinkedIn: angles, offers, positioning. The saturated claims to avoid. |
| 02 | **Open Lanes Report** | The gaps competitors leave open: angles nobody occupies that you can own. (Formerly "white space.") |
| 03 | **Audience Targeting Worksheet** | Signal-composed account-list logic, signal sources, persona splits. |

**Offer test (passes all):** would they pay for it (yes), deliverable in 48h (yes), 4 form
fields (yes), starts a conversation rather than closes a deal (yes).

**Form fields:** First name | Work email | Company | Top 3 competitors.

---

## 3. Audience & targeting

**Persona:** VP / Exec Economic Buyer. CMO, VP Marketing, VP Growth, CRO. 200 to 1,000
employees. Owns the budget and the board narrative. Needs board-ready ROI, not tactics.

| Dimension | Spec |
| --- | --- |
| Seniority | VP / C-Suite (Marketing, Growth, Revenue) |
| Industries | B2B SaaS / tech, IT services, financial services, consulting |
| Geography | US (primary), then UK, Australia, Canada |
| Spend band | ~$10K to $100K / month on paid |
| Signal layer | Compose 8 signals into a qualified account list before launch. Multi-signal accounts close at 5x. |

**Targeting backbone (from 03-audience.md), budget feel 60 / 25 / 15:**
- **Tier 1 (warm, lead here):** site visitors 90d, event attendees, newsletter (~28.8K), ad engagers / video viewers 50%+, page followers, CRM. Filter every pool to buyer-ICP.
- **Tier 2 (signal-composed ABM):** in-market SaaS/tech, 2+ stacked signals, built in DemandSense + Clay, uploaded as Matched Audience.
- **Tier 3 (selective cold):** one persona at a time, tied to one open-lane gap. Awareness only.

**Exclusions (protect spend and message):** agencies, marketing services, consultants,
current clients, sub-50 headcount. About half the engaged audience are peers, not buyers.
Route them to the LinkedIn Ads Council, not this funnel.

---

## 4. Funnel structure (governing rule: no BOF ask without demonstrated MOF engagement)

| Stage | Job | Formats | Message | Avoid |
| --- | --- | --- | --- | --- |
| **Unaware to Aware (cold)** | Earn attention, reframe | Thought Leader Ads, video, single image | "Your agency reports clicks. Your CEO asks about pipeline." | Case studies, demo CTAs |
| **Aware to Engaged (warm)** | Build credibility, proof-first | Document ads, case-study image, video testimonial | "6.7x on our own spend. The named accounts behind it." | Hard sells, vague invites |
| **Engaged to Converting (high intent)** | One specific low-friction ask | Lead Gen Forms, conversation ads, landing page | "Reply with your competitors. Free three-document intel bundle." | Awareness content |
| **In-Pipeline to Closed (acceleration)** | Stay visible, remove friction | Spotlight, text ads, reassurance | "Onboarding, the Impact Report, 90-day no-lock-in." | More awareness |

---

## 5. Proof (cite ONLY these, never invent)

- 6.7x return on our own LinkedIn spend
- 5x close rate on multi-signal accounts
- $50M+ managed across 200+ campaigns (supporting, never the lead anchor)
- Named clients: Lacework 6x ROI, HeyReach 20x ROAS, Databox, GetAccept
- Testimonials: Jason Vana / SHFT, Christian Chapman, Amy Appleton; Clutch 4.5/5
- LinkedIn Marketing Partner (Agency + Tech)
- Justin Rowe founder content: 40K+ followers, 28.8K newsletter

**Honesty rule:** state attribution plainly. "LinkedIn-sourced" and "on our own spend,"
never "we drove $X." Do not claim the named-account journey case study or Impact Report
specimen as existing yet (they are on the to-build list).

---

## 6. KPIs & guardrails

- **North-star:** qualified deals sourced (not leads, not clicks).
- **Funnel metrics:** cost per report request, report-to-call rate, call-to-qualified-deal rate, revenue sourced.
- **Guardrail:** kill ABM Spotlight to cold lists. No BOF ask to anyone without MOF engagement.

---

## 7. Pre-launch checklist

- [ ] `competitor-intel-report.html` deployed
- [ ] **Wire the form** to HubSpot / Zapier / Formspree (currently a front-end demo stub, see `<script>` TODO)
- [ ] HubSpot workflow: new request to notify + 48h delivery SLA task
- [ ] Build signal-composed VP/Exec account list in Clay (8 signals)
- [ ] Load creative (`competitor-intel-ads.md`) into Campaign Manager, mapped to stages
- [ ] Retargeting audiences (site, video 50%+, engaged, newsletter), filtered to buyer-ICP, agencies excluded
- [ ] UTM: `utm_source=linkedin&utm_campaign=competitor-intel&utm_content={ad-id}`
- [ ] Attribution check: LinkedIn to site to HubSpot deal source stitched
- [ ] QA landing page on mobile

---

## 8. Deliverables in this set

1. `campaigns/competitor-intel-brief.md` (this file)
2. `campaigns/competitor-intel-ads.md` (ad copy, TOF/MOF/BOF)
3. `competitor-intel-report.html` (landing page, design-system native, brand-voice compliant)
