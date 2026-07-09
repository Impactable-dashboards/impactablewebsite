# Impactable SEO / AEO / AI-Visibility Standard

Every page on this site — current and future — must pass these rules. They cover
classic SEO (get indexed and ranked), AEO (get cited by AI answer engines like
ChatGPT, Perplexity, Gemini, Google AI Overviews), and AI visibility (be the
quotable, verifiable source about ourselves).

**Enforced by `scripts/check-seo.py`** — run it before publishing; CI runs it on
every push (`.github/workflows/seo-check.yml`). A page that fails the gate does not ship.

**Canonical host:** `https://impactable.marketing`. It lives in the injector, the
sitemap, robots.txt, and llms.txt. If the production domain changes, update it in
those four places (one find-replace) and re-run the gate.

---

## 1. Required `<head>` on every indexable page (the gate checks these)

```html
<title>…</title>                              <!-- unique, 10–70 chars, primary keyword + | Impactable -->
<meta name="description" content="…">         <!-- unique, 50–160 chars, outcome + keyword, no truncation -->
<link rel="canonical" href="https://impactable.marketing/{path}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Impactable">
<meta property="og:title" content="…">
<meta property="og:description" content="…">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="https://impactable.marketing/img/…(1200×630 ideal)">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="…">
<meta name="twitter:description" content="…">
<meta name="twitter:image" content="…">
<script type="application/ld+json">…</script> <!-- see §2 -->
```

Plus: exactly **one `<h1>`**, semantic headings in order, `lang="en"` on `<html>`,
descriptive `alt` on every image, and internal links to related pages.

- **Non-public pages** (thank-you, embeds): `content="noindex, follow"`, keep out of
  the sitemap. Utility fragments go in `robots.txt` `Disallow`.

## 2. Structured data (JSON-LD) — the AEO backbone

Schema must describe **visible** content (never fabricate). Required by page type:

- **Every page:** `WebPage` (linked to the site + org via `@id`).
- **Home:** `Organization` (name, logo, `sameAs` socials, `founder`, `award`,
  `knowsAbout`) + `WebSite`. This is our entity definition — keep it accurate; it is
  how LLMs learn who Impactable is.
- **Non-home:** `BreadcrumbList` (Home → Page).
- **Service pages:** `Service` (only when the offer is visible on the page).
- **Pages with a visible FAQ:** `FAQPage` (question/answer must match the page).
- **When we publish articles/case studies:** `Article` + `Person` (author) with real
  `datePublished`.

## 3. AEO / content rules (how to get cited by AI)

- **Answer first.** Put the direct, extractable answer in the first sentence of a
  section; elaborate after. AI engines lift concise, self-contained answers.
- **Be specific and quantitative.** Named numbers, named clients, concrete steps.
  "6.7x on our own spend," "$20k/mo waste at $100k spend," "Built by hand in 48 hours."
  Vague claims never get cited.
- **Entity consistency.** Describe Impactable the same way everywhere (site, llms.txt,
  schema, LinkedIn): "the B2B Demand Intelligence System," certified LinkedIn Marketing
  Partner, 2026 Thought Leader of the Year, founder Justin Rowe. Consistency is what
  makes an LLM treat us as the authority on our own category.
- **E-E-A-T.** Show proof of experience (case studies, awards, named results) near the
  claim it backs.
- **Structure for extraction.** Real headings, short paragraphs, lists, tables. One
  idea per section (mirrors the copy standard).
- Follow `COPY-GUIDELINES.md` for voice — clarity and specificity are also what wins AEO.

## 4. Site-level files (keep in sync when pages change)

- **`robots.txt`** — permissive, explicitly allows AI crawlers (GPTBot, OAI-SearchBot,
  PerplexityBot, ClaudeBot, Google-Extended, Applebot-Extended), points to the sitemap.
- **`sitemap.xml`** — every public, indexable page. **Add a new page here when you ship it.**
- **`llms.txt`** — the plain-language map for AI: what we are, our proof, our pages.
  **Update it when a page or a core fact changes.**

## 5. Pre-publish checklist (every new page)

1. Unique title (≤70) and description (≤160), both keyword + outcome led.
2. Canonical, robots, OG, Twitter, JSON-LD present (run the gate).
3. One `<h1>`; headings in order; every image has `alt`.
4. `WebPage` schema + `BreadcrumbList`; add `Service`/`FAQPage`/`Article` if applicable.
5. Add the URL to `sitemap.xml`; update `llms.txt` if it changes what we are.
6. `python3 scripts/check-seo.py` → **PASS**.
7. No em dashes; passes `COPY-GUIDELINES.md`.

---

*Grounded in 2026 AEO/AI-visibility best practice (Answer Engine Optimization: put the
question at the center, structured data, entity clarity, extractable specific answers,
E-E-A-T) and classic SEO fundamentals.*
