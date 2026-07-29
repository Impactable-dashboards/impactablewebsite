#!/usr/bin/env python3
"""
Strip ONLY the shared footer + gnav CSS lines from inline <style> blocks.
Leaves all page-specific CSS untouched. HTML is never modified.

Targets (inside <style> only):
  1. Lines belonging to .foot{}, .foot-top{}, .foot-logo{}, .foot-tag{},
     .foot-cols{}, .foot-col{}, .foot-bottom{} and their comment header
  2. The entire gnav block from its comment marker to end of <style>
     (/* ════ GLOBAL NAV  …  </style>)
"""

import re, sys, os, shutil

SKIP = {'pricing-table-embed.html', 'googledc79b137a1cd7351.html', 'redesign.html'}

# Regex patterns that match ONLY footer/gnav CSS lines (applied line-by-line inside <style>)
FOOTER_LINE_RE = re.compile(
    r'^(\.foot[\w-]*|html\[data-theme[^\]]*\]\s+\.foot[\w-]*)\s*[\{,:]'
)
FOOTER_COMMENT_RE = re.compile(r'^/\*[\s─═\-]*footer[\s─═\-]*\*/', re.IGNORECASE)

# Marker that starts the gnav block — everything from here to </style> is gnav
GNAV_START_RE = re.compile(r'/\*\s*[═=]{2,}\s*GLOBAL NAV', re.IGNORECASE)

STYLE_RE = re.compile(r'(<style[^>]*>)(.*?)(</style>)', re.DOTALL | re.IGNORECASE)


def strip_style_block(css):
    """Return cleaned CSS with footer + gnav lines removed."""
    # First: find gnav start position and cut from there
    gnav_m = GNAV_START_RE.search(css)
    if gnav_m:
        css = css[:gnav_m.start()].rstrip()

    # Second: remove footer CSS lines (line by line)
    lines = css.split('\n')
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        # Skip the footer comment header
        if FOOTER_COMMENT_RE.match(stripped):
            i += 1
            continue
        # Skip footer CSS rules
        if FOOTER_LINE_RE.match(stripped):
            i += 1
            continue
        out.append(line)
        i += 1

    return '\n'.join(out).rstrip()


def process_file(path, dry=False):
    with open(path, encoding='utf-8') as f:
        html = f.read()

    changed = False

    def replace_style(m):
        nonlocal changed
        open_tag, css, close_tag = m.group(1), m.group(2), m.group(3)
        new_css = strip_style_block(css)
        if new_css == css.rstrip():
            return m.group(0)
        changed = True
        return open_tag + new_css + '\n' + close_tag

    new_html = STYLE_RE.sub(replace_style, html)

    if not changed:
        print(f'  skip  {os.path.basename(path)}')
        return False

    orig = len(html.splitlines())
    new  = len(new_html.splitlines())
    if dry:
        print(f'  [dry]  {os.path.basename(path)}  {orig} → {new}  (-{orig-new})')
        return True

    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_html)
    print(f'  done  {os.path.basename(path)}  {orig} → {new}  (-{orig-new})')
    return True


def main():
    dry = '--dry' in sys.argv
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    files = sorted(f for f in os.listdir(root) if f.endswith('.html') and f not in SKIP)
    print(f"{'DRY RUN — ' if dry else ''}Stripping footer+gnav CSS from {len(files)} files\n")
    touched = sum(process_file(os.path.join(root, f), dry=dry) for f in files)
    print(f'\n{"Would touch" if dry else "Touched"} {touched}/{len(files)} files.')

if __name__ == '__main__':
    main()
