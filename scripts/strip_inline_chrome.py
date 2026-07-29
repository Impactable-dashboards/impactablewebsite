#!/usr/bin/env python3
"""
Strip inline gnav + footer CSS blocks from all HTML files.

Strategy: inside every <style> block, remove lines from the marker comment
  /* ════ GLOBAL NAV  (or  /* ════ THEME TOGGLE)
to the closing </style>, then re-attach only the page-specific CSS before it.

We identify the cut point as the first occurrence of one of these markers:
  - /* ════ GLOBAL NAV
  - /* NAV (legacy page styles
  - .gnav{  /  .gnav {
  
Also strip any inline footer CSS (lines matching .foot-top, .foot-col, etc.)
that appear AFTER the nav block is removed (they're typically part of the same
big block).

Safe guards:
  - Skips files that already DON'T have the inline gnav.
  - Dry-run mode (--dry) prints what would change without writing.
  - Backs up original to <file>.bak if --backup flag is set.
"""

import re
import sys
import os
import shutil

SKIP = {'pricing-table-embed.html', 'googledc79b137a1cd7351.html', 'redesign.html'}

# Markers that signal "here begins shared chrome CSS — cut from here to </style>"
CUT_MARKERS = [
    re.compile(r'/\*\s*[═=]{2,}\s*GLOBAL NAV', re.IGNORECASE),
    re.compile(r'/\*\s*NAV\s*\(legacy page styles', re.IGNORECASE),
    # bare .gnav{ at start of line (not inside another rule)
    re.compile(r'^\.gnav\s*\{', re.MULTILINE),
]

# Also strip stray inline footer CSS blocks that may appear after nav removal
FOOTER_CSS_PATTERNS = [
    re.compile(r'^\.gnav[-\w]*\s*[\{,]', re.MULTILINE),
    re.compile(r'^\.foot-top\s*\{', re.MULTILINE),
    re.compile(r'^\.foot-col\s+', re.MULTILINE),
    re.compile(r'^html\[data-theme', re.MULTILINE),
    re.compile(r'^/\*\s*[═=]{2,}\s*THEME TOGGLE', re.MULTILINE),
    re.compile(r'^/\*\s*-+\s*LIGHT THEME', re.MULTILINE),
    re.compile(r'^/\*\s*[═=]{2,}\s*LIGHT', re.MULTILINE),
]


def find_cut_pos(css_text):
    """Return the character position where inline chrome CSS begins, or -1."""
    best = -1
    for pat in CUT_MARKERS:
        m = pat.search(css_text)
        if m:
            pos = m.start()
            if best == -1 or pos < best:
                best = pos
    return best


def strip_file(path, dry=False, backup=False):
    with open(path, encoding='utf-8') as f:
        html = f.read()

    # Find all <style> ... </style> blocks
    style_pat = re.compile(r'(<style[^>]*>)(.*?)(</style>)', re.DOTALL | re.IGNORECASE)

    changed = False
    new_html = html

    def replace_style(m):
        nonlocal changed
        open_tag, css, close_tag = m.group(1), m.group(2), m.group(3)
        cut = find_cut_pos(css)
        if cut == -1:
            return m.group(0)  # nothing to strip
        
        kept = css[:cut].rstrip()
        # Remove trailing comment lines that were just a section divider
        kept = re.sub(r'\n\s*/\*\s*[─═=\-]{3,}.*?\*/\s*$', '', kept, flags=re.DOTALL)
        kept = kept.rstrip()
        changed = True
        # Keep a blank line before close tag for readability
        return open_tag + kept + '\n' + close_tag

    new_html = style_pat.sub(replace_style, html)

    if not changed:
        print(f'  skip  {os.path.basename(path)}  (no inline chrome CSS found)')
        return False

    if dry:
        orig_lines = len(html.splitlines())
        new_lines = len(new_html.splitlines())
        print(f'  [dry]  {os.path.basename(path)}  {orig_lines} → {new_lines} lines  (-{orig_lines-new_lines})')
        return True

    if backup:
        shutil.copy2(path, path + '.bak')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_html)

    orig_lines = len(html.splitlines())
    new_lines = len(new_html.splitlines())
    print(f'  done  {os.path.basename(path)}  {orig_lines} → {new_lines} lines  (-{orig_lines-new_lines})')
    return True


def main():
    dry = '--dry' in sys.argv
    backup = '--backup' in sys.argv
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    html_files = [
        os.path.join(root, f)
        for f in os.listdir(root)
        if f.endswith('.html') and f not in SKIP
    ]
    html_files.sort()

    print(f"{'DRY RUN — ' if dry else ''}Stripping inline gnav/footer CSS from {len(html_files)} files\n")
    touched = 0
    for path in html_files:
        if strip_file(path, dry=dry, backup=backup):
            touched += 1

    print(f'\n{"Would touch" if dry else "Touched"} {touched}/{len(html_files)} files.')


if __name__ == '__main__':
    main()
