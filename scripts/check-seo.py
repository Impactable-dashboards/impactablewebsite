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
    if problems:
        fail = 1
        print(f"FAIL {f}:")
        for p in problems: print(f"   - missing/again: {p}")
    else:
        print(f"ok   {f}")
print("\nSEO gate:", "PASS" if not fail else "FAIL")
sys.exit(fail)
