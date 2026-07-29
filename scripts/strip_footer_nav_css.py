#!/usr/bin/env python3
"""
Precisely strip only .foot-* and .gnav-* CSS rules from inline <style> blocks.
Does NOT touch HTML, JS, or any other CSS rules.
"""
import re, os, sys

SKIP = {'pricing-table-embed.html', 'googledc79b137a1cd7351.html', 'redesign.html'}

# Match a CSS rule whose selector contains only .foot-* or .gnav-* or html[...] .foot-* / .gnav-*
# Also matches their comment headers and @media blocks that contain only these rules
REMOVE_SELECTORS = re.compile(
    r'^(?:html\[[^\]]*\]\s+)?'
    r'(?:\.foot[\w-]*|\.gnav[\w-]*)'
    r'(?:\s*[\{,\s])',
    re.MULTILINE
)

COMMENT_HEADER = re.compile(
    r'/\*[\s─═\-]*(footer|FOOTER|nav|NAV|GLOBAL NAV|THEME TOGGLE|LIGHT THEME|LIGHT.DARK)[\s─═\-]*\*/',
    re.IGNORECASE
)

GNAV_BLOCK_START = re.compile(r'/\*\s*[═=]{2,}\s*GLOBAL NAV', re.IGNORECASE)
THEME_BLOCK_START = re.compile(r'/\*\s*[═=]{2,}\s*THEME TOGGLE', re.IGNORECASE)
LIGHT_THEME_START = re.compile(r'/\*\s*-+\s*LIGHT THEME', re.IGNORECASE)
LIGHT_DARK_START  = re.compile(r'/\*\s*[═=]{2,}\s*LIGHT.*DARK', re.IGNORECASE)

STYLE_RE = re.compile(r'(<style[^>]*>)(.*?)(</style>)', re.DOTALL | re.IGNORECASE)


def clean_css(css):
    # 1. Cut from gnav block comment onwards (gnav + theme toggle + light-dark all follow)
    for pat in [GNAV_BLOCK_START, THEME_BLOCK_START, LIGHT_THEME_START, LIGHT_DARK_START]:
        m = pat.search(css)
        if m:
            css = css[:m.start()].rstrip()
            break

    # 2. Remove individual .foot-* lines
    # Parse line by line, skip lines that start a .foot-* rule
    result = []
    i = 0
    lines = css.split('\n')
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Skip comment headers for footer/nav sections
        if COMMENT_HEADER.match(stripped):
            i += 1
            continue

        # Skip .foot-* CSS lines (single-line rules)
        if re.match(r'^(html\[[^\]]*\]\s+)?\.foot[\w-]*[\s\{,:]', stripped):
            i += 1
            continue

        result.append(line)
        i += 1

    return '\n'.join(result).rstrip()


def process(path, dry=False):
    with open(path, encoding='utf-8') as f:
        html = f.read()

    changed = False

    def sub(m):
        nonlocal changed
        open_tag, css, close_tag = m.group(1), m.group(2), m.group(3)
        new_css = clean_css(css)
        if new_css == css.rstrip():
            return m.group(0)
        changed = True
        return open_tag + new_css + '\n' + close_tag

    new_html = STYLE_RE.sub(sub, html)

    if not changed:
        print(f'  skip  {os.path.basename(path)}')
        return False

    a, b = len(html.splitlines()), len(new_html.splitlines())
    if dry:
        print(f'  [dry]  {os.path.basename(path)}  -{a-b} lines')
        return True

    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_html)
    print(f'  done  {os.path.basename(path)}  -{a-b} lines')
    return True


def main():
    dry = '--dry' in sys.argv
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    files = sorted(f for f in os.listdir(root) if f.endswith('.html') and f not in SKIP)
    print(f"{'DRY RUN — ' if dry else ''}Removing .foot-* and .gnav-* inline CSS\n")
    n = sum(process(os.path.join(root, f), dry=dry) for f in files)
    print(f'\n{"Would touch" if dry else "Touched"} {n}/{len(files)} files.')

if __name__ == '__main__':
    main()
