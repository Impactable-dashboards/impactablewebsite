#!/usr/bin/env python3
"""Site-wide consistency sweep. Change a price, package name, or phrase in ONE
command so it stays consistent across every page.

Usage:
  python3 scripts/sweep.py --find "text"          # list every page containing text
  python3 scripts/sweep.py --dry  "old" "new"     # preview the replacement, no writes
  python3 scripts/sweep.py         "old" "new"     # apply across all public *.html

After applying, ALWAYS run:  python3 scripts/check-seo.py
When you change a price/name, add the OLD value to BANNED in check-seo.py so any
leftover can never ship. See CLAUDE.md "When you change pricing/packaging/language".
"""
import sys, glob

EXCLUDE = {"pricing-table-embed.html", "googledc79b137a1cd7351.html"}
pages = [f for f in sorted(glob.glob("*.html")) if f not in EXCLUDE]

def find(text):
    total = 0
    for f in pages:
        n = open(f, encoding="utf-8").read().count(text)
        if n:
            print(f"  {n:>3}  {f}")
            total += n
    print(f"total: {total} occurrence(s) of {text!r}")
    return total

def replace(old, new, dry):
    total = 0
    for f in pages:
        s = open(f, encoding="utf-8").read()
        n = s.count(old)
        if not n:
            continue
        total += n
        print(f"  {n:>3}  {f}")
        if not dry:
            open(f, "w", encoding="utf-8").write(s.replace(old, new))
    verb = "would replace" if dry else "replaced"
    print(f"{verb} {total} occurrence(s): {old!r} -> {new!r}")
    if total and not dry:
        print("Now run: python3 scripts/check-seo.py")
    return total

def main(a):
    if len(a) == 2 and a[0] == "--find":
        find(a[1]); return 0
    if len(a) == 3 and a[0] == "--dry":
        replace(a[1], a[2], dry=True); return 0
    if len(a) == 2:
        replace(a[0], a[1], dry=False); return 0
    print(__doc__); return 1

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
