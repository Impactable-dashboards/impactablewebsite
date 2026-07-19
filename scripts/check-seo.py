#!/usr/bin/env python3
"""Impactable SEO/AEO gate. Fails (exit 1) if any public page is missing required signals.
Run before publishing / in CI:  python3 scripts/check-seo.py"""
import re, sys, glob
NOINDEX = {"thank-you.html"}
EXCLUDE = {"pricing-table-embed.html", "googledc79b137a1cd7351.html"}
REQUIRED = [
    ("<title>", r"<title>.{10,70}</title>", "title 10-70 chars"),
    ("meta description", r'<meta name="description" content=".{50,170}"', "meta description 50-170 chars"),
    ("canonical", r'<link rel="canonical"', "canonical link"),
    ("robots meta", r'<meta name="robots"', "robots meta"),
    ("og:title", r'og:title', "Open Graph title"),
    ("og:image", r'og:image', "Open Graph image"),
    ("og:description", r'og:description', "Open Graph description"),
    ("twitter:card", r'twitter:card', "Twitter card"),
    ("JSON-LD", r'application/ld\+json', "JSON-LD structured data"),
]
# ── Content-lint: phrases we deliberately removed and must never reappear. ──
# Each entry: (regex, why). Case-insensitive, checked against body text (CSS
# comments stripped). See CLAUDE.md "Decisions log" for the reasoning behind each.
BANNED = [
    (r"account list", "account-list claim: we do competitor intel + audience targeting from signals/first-party/in-market, not 'engineer the account list'"),
    (r"we built our own", "DemandSense ownership: we are a top partner, we do not own/build it"),
    (r"our own intelligence layer", "DemandSense ownership: use 'a deeper signal layer' / 'we run on DemandSense'"),
    (r"proprietary", "DemandSense ownership: no 'proprietary' tooling/infrastructure claims"),
    (r"DemandSense thinking", "attribution: strategy/intelligence is Impactable; DemandSense provides signals"),
    (r"\bby hand\b", "voice: drop 'by hand' / 'done by hand' framing"),
    (r"Demand Plan Lite", "naming: free offer is 'Demand Plan' (not Lite)"),
    (r"Demand Plan Full", "naming: paid offer is 'Full Marketing Strategy' (not Demand Plan Full)"),
    (r"daily optimization", "positioning: say 'ongoing optimization'"),
    (r"two to three weeks|\b2\s*(?:-|to)\s*3\s*weeks\b", "no delivery-time estimate on strategy/impact-report offers"),
    (r"Facebook (?:&amp;|and|,) Instagram|Facebook, Instagram", "channel naming: say 'B2B Facebook', not 'Facebook and Instagram'"),
    # Price-format consistency: canonical prices use comma thousands.
    (r"\$1750\b", "price format: write $1,750"),
    (r"\$3000\b", "price format: write $3,000"),
    (r"\$4500\b", "price format: write $4,500"),
    (r"\$6000\b", "price format: write $6,000 (or the $6-12k range)"),
    (r"\$12000\b", "price format: write $12,000 (or the $6-12k range)"),
]
# Canonical pricing/packaging = single source of truth (also in CLAUDE.md).
# When any of these change: (1) edit here + CLAUDE.md, (2) run scripts/sweep.py
# to propagate, (3) add the OLD value to BANNED above so leftovers cannot ship.
CANON = {
    "Demand Plan": "free tier name",
    "Full Marketing Strategy": "one-time paid plan name",
    "Channel Check": "single-channel audit name",
    "$499": "Channel Check price", "$1,500": "Full Marketing Strategy price",
    "$1,750": "Pilot", "$3,000": "Core", "$4,500": "Growth", "$6-12k": "Scale",
}

fail = 0
for f in sorted(glob.glob("*.html")):
    if f in EXCLUDE: continue
    s = open(f, encoding="utf-8").read()
    problems = [msg for _, rx, msg in REQUIRED if not re.search(rx, s, re.S)]
    h1 = len(re.findall(r"<h1[ >]", s))
    if h1 != 1: problems.append(f"exactly one <h1> (found {h1})")
    # JSON-LD must parse
    import json
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
        try: json.loads(m.group(1))
        except Exception as e: problems.append(f"invalid JSON-LD ({e})")
    # em dashes are banned everywhere (Brand Bible + AI tell); ignore CSS comments
    body = re.sub(r"/\*.*?\*/", "", s, flags=re.S)
    if "—" in body or "&mdash;" in body: problems.append("contains an em dash (banned)")
    # banned/regressed phrases (see CLAUDE.md); check visible text, not <style>/<script>
    text = re.sub(r"<(style|script)\b.*?</\1>", "", body, flags=re.S | re.I)
    for rx, why in BANNED:
        if re.search(rx, text, re.I):
            problems.append(f"banned phrase /{rx}/ - {why}")
    if problems:
        fail = 1
        print(f"FAIL {f}:")
        for p in problems: print(f"   - missing/again: {p}")
    else:
        print(f"ok   {f}")
print("\nSEO gate:", "PASS" if not fail else "FAIL")
sys.exit(fail)
