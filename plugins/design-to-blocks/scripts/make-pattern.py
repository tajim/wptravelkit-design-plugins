#!/usr/bin/env python3
"""Turn validated block markup into a translatable PHP pattern file for a theme's patterns/ folder.

- Text inside p, h1-h6, li, summary, th, td and button links is wrapped in
  esc_html_e() or, when it holds HTML, entities or quotes, wp_kses_post( __() ).
- Image alt text is wrapped in esc_attr_e().
- Theme image paths (/wp-content/themes/<slug>/...) become get_theme_file_uri() calls,
  so the pattern works on any domain and in any install folder.
- Block comment delimiters are never changed (apart from theme image URLs).

A round trip (unwrap every PHP call again) must give back the exact input, or the script stops.

Usage:
  python3 make-pattern.py --markup about.txt --out patterns/page-about.php \
      --domain travel-royale --theme-slug travel-royale \
      --title "About page" --slug travel-royale/page-about --category travel-royale-pages \
      [--keywords "about, team"] [--description "..."] \
      [--block-types core/post-content] [--post-types page] [--viewport 1440] [--package Travel_Royale]
"""
import argparse
import re
import sys

COMMENT = re.compile(r'<!--.*?-->', re.S)
TEXT_EL = re.compile(r'<(p|h[1-6]|li|summary|th|td|figcaption)(\s[^>]*)?>(.*?)</\1>', re.S)
BUTTON = re.compile(r'(<a class="wp-block-button__link[^"]*"[^>]*>)(.*?)(</a>)', re.S)
ALT = re.compile(r'alt="([^"]+)"')


def php_str(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


def make_converter(domain, theme_path):
    theme_url = re.compile(re.escape(theme_path) + r'([A-Za-z0-9_./-]+)')

    def wrap_text(inner):
        if not re.search(r'[A-Za-z]', inner):
            return inner  # numbers and symbols only: nothing to translate
        if any(ch in inner for ch in '<&"\''):
            return "<?php echo wp_kses_post( __( %s, '%s' ) ); ?>" % (php_str(inner), domain)
        return "<?php esc_html_e( %s, '%s' ); ?>" % (php_str(inner), domain)

    def convert_html(chunk):
        chunk = BUTTON.sub(lambda m: m.group(1) + wrap_text(m.group(2)) + m.group(3), chunk)
        chunk = TEXT_EL.sub(lambda m: '<%s%s>%s</%s>' % (m.group(1), m.group(2) or '', wrap_text(m.group(3)), m.group(1)), chunk)
        chunk = ALT.sub(lambda m: 'alt="<?php esc_attr_e( %s, \'%s\' ); ?>"' % (php_str(m.group(1)), domain), chunk)
        return chunk

    def convert(markup):
        out, pos = [], 0
        for m in COMMENT.finditer(markup):
            out.append(convert_html(markup[pos:m.start()]))
            out.append(m.group(0))
            pos = m.end()
        out.append(convert_html(markup[pos:]))
        body = ''.join(out)
        return theme_url.sub(lambda m: "<?php echo esc_url( get_theme_file_uri( '%s' ) ); ?>" % m.group(1), body)

    def unwrap(php):
        def unq(s):
            return s[1:-1].replace("\\'", "'").replace('\\\\', '\\')
        q = r"('(?:[^'\\]|\\.)*')"
        php = re.sub(r"<\?php echo esc_url\( get_theme_file_uri\( '([^']*)' \) \); \?>", lambda m: theme_path + m.group(1), php)
        php = re.sub(r"<\?php echo wp_kses_post\( __\( %s, '%s' \) \); \?>" % (q, re.escape(domain)), lambda m: unq(m.group(1)), php)
        php = re.sub(r"<\?php esc_html_e\( %s, '%s' \); \?>" % (q, re.escape(domain)), lambda m: unq(m.group(1)), php)
        php = re.sub(r"<\?php esc_attr_e\( %s, '%s' \); \?>" % (q, re.escape(domain)), lambda m: unq(m.group(1)), php)
        return php

    return convert, unwrap


def header(a):
    lines = ['<?php', '/**', ' * Title: %s' % a.title, ' * Slug: %s' % a.slug, ' * Categories: %s' % a.category]
    if a.keywords:
        lines.append(' * Keywords: %s' % a.keywords)
    if a.block_types:
        lines.append(' * Block Types: %s' % a.block_types)
    if a.post_types:
        lines.append(' * Post Types: %s' % a.post_types)
    lines.append(' * Viewport Width: %s' % a.viewport)
    if a.description:
        lines.append(' * Description: %s' % a.description)
    lines += [' *', ' * Use with the "Block Canvas" page template.', ' *', ' * @package %s' % a.package, ' */', '', '?>', '']
    return '\n'.join(lines)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--markup', required=True)
    p.add_argument('--out', required=True)
    p.add_argument('--domain', required=True)
    p.add_argument('--theme-slug', required=True)
    p.add_argument('--title', required=True)
    p.add_argument('--slug', required=True)
    p.add_argument('--category', required=True)
    p.add_argument('--keywords', default='')
    p.add_argument('--description', default='')
    p.add_argument('--block-types', default='core/post-content')
    p.add_argument('--post-types', default='page')
    p.add_argument('--viewport', default='1440')
    p.add_argument('--package', default='')
    a = p.parse_args()
    if not a.package:
        a.package = '_'.join(w.capitalize() for w in a.theme_slug.split('-'))

    convert, unwrap = make_converter(a.domain, '/wp-content/themes/%s/' % a.theme_slug)
    markup = open(a.markup, encoding='utf-8').read()
    body = convert(markup)
    if unwrap(body) != markup:
        sys.exit('Round trip failed: the converter changed something it should not have. Pattern not written.')
    with open(a.out, 'w', encoding='utf-8') as f:
        f.write(header(a) + body)
    print('%s: %d translatable strings and theme URLs' % (a.out, body.count('<?php')))


if __name__ == '__main__':
    main()
