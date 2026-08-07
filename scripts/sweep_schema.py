#!/usr/bin/env python3
"""Site-wide schema normalization for SEO/AEO.

For every indexed root page:
  - ensure a self-contained Organization node (#org) with sameAs + founder
    exists in the JSON-LD @graph (AI answer engines use it to verify who
    published the page),
  - add datePublished (from sitemap lastmod) + dateModified to the page node
    (WebPage/CollectionPage) as a freshness signal.

Idempotent: only ADDS missing keys/nodes, never overwrites existing values, so
re-running is safe. Bump MODIFIED (and re-run) when you want to refresh the
freshness date after a real content change.

Run from repo root: python3 scripts/sweep_schema.py
"""
import re, glob, json, sys

MODIFIED = "2026-07-30"
DEFAULT_PUBLISHED = "2026-07-09"
EXCLUDE = {"pricing-table-embed.html", "googledc79b137a1cd7351.html"}

ORG = {
    "@type": "Organization", "@id": "https://impactable.marketing/#org",
    "name": "Impactable", "alternateName": "Impactable B2B",
    "url": "https://impactable.marketing/",
    "logo": "https://impactable.marketing/assets/img/logo-dark.svg",
    "description": "Impactable is the B2B Demand Intelligence System: a certified LinkedIn Marketing Partner that targets your best-fit buyers from real signal, discovers who your buyers actually are, and proves revenue with a continuous quarterly diagnostic.",
    "sameAs": [
        "https://www.linkedin.com/company/impactableb2b/",
        "https://www.youtube.com/@Impactable-B2B-Agency",
        "https://www.linkedin.com/in/justin-rowe-4043339b/",
    ],
    "founder": {"@type": "Person", "name": "Justin Rowe", "jobTitle": "CEO & Founder",
                "sameAs": "https://www.linkedin.com/in/justin-rowe-4043339b/"},
    "award": "LinkedIn Indie Agency Awards 2026: Thought Leader of the Year",
    "knowsAbout": ["B2B LinkedIn Ads", "B2B thought leadership", "B2B demand generation", "account-based marketing"],
}
ORG_FILL = ("sameAs", "founder", "award", "knowsAbout", "alternateName", "logo")
PAGE_TYPES = {"WebPage", "CollectionPage", "AboutPage", "ContactPage", "ProfilePage", "ItemPage", "Service"}

# sitemap lastmod -> datePublished
sm = open("sitemap.xml", encoding="utf-8").read()
LASTMOD = {}
for loc, lm in re.findall(r"<loc>(.*?)</loc>\s*<lastmod>(.*?)</lastmod>", sm):
    LASTMOD[loc.rstrip("/")] = lm


def is_type(node, t):
    nt = node.get("@type")
    return nt == t or (isinstance(nt, list) and t in nt)


def sweep(path):
    s = open(path, encoding="utf-8").read()
    if re.search(r'name="robots"[^>]*content="[^"]*noindex', s, re.I):
        return "skip-noindex"
    m = re.search(r'(<script type="application/ld\+json">)(.*?)(</script>)', s, re.S)
    if not m:
        return "no-jsonld"
    obj = json.loads(m.group(2))
    graph = obj.get("@graph")
    if not isinstance(graph, list):
        return "no-graph"

    canon = None
    mc = re.search(r'rel="canonical" href="(.*?)"', s)
    if mc:
        canon = mc.group(1).rstrip("/")
    published = LASTMOD.get(canon, DEFAULT_PUBLISHED)

    changed = []
    # 1) Organization: fill missing keys, or inject full node if absent.
    org = next((n for n in graph if isinstance(n, dict) and is_type(n, "Organization")), None)
    if org is None:
        graph.insert(0, dict(ORG))
        changed.append("org+")
    else:
        for k in ORG_FILL:
            if k not in org:
                org[k] = ORG[k]
                changed.append(f"org.{k}")

    # 2) Page node: add datePublished / dateModified / publisher if missing.
    page = next((n for n in graph if isinstance(n, dict) and (
        any(is_type(n, t) for t in PAGE_TYPES) or str(n.get("@id", "")).endswith("#webpage"))), None)
    if page is not None:
        if "datePublished" not in page:
            page["datePublished"] = published; changed.append("datePublished")
        if "dateModified" not in page:
            page["dateModified"] = MODIFIED; changed.append("dateModified")
        if "publisher" not in page:
            page["publisher"] = {"@id": "https://impactable.marketing/#org"}; changed.append("publisher")

    if not changed:
        return "unchanged"
    new_ld = json.dumps(obj, ensure_ascii=False)
    out = s[:m.start()] + m.group(1) + new_ld + m.group(3) + s[m.end():]
    json.loads(new_ld)  # sanity
    open(path, "w", encoding="utf-8").write(out)
    return ",".join(changed)


if __name__ == "__main__":
    for f in sorted(glob.glob("*.html")):
        if f in EXCLUDE:
            continue
        print(f"{f:44} {sweep(f)}")
