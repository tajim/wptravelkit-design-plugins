# Page patterns

One pattern per approved page, in `<theme>/patterns/page-<slug>.php`. WordPress registers every file in a theme's `patterns/` folder automatically (parent and child).

## Make one

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/scripts/make-pattern.py" \
  --markup .d2b/out/<slug>.txt --out "<theme>/patterns/page-<slug>.php" \
  --domain <theme-slug> --theme-slug <theme-slug> \
  --title "<Page> page" --slug <theme-slug>/page-<slug> --category <theme-slug>-pages \
  --keywords "<5 to 8 words people would search>" \
  --description "<one sentence listing the sections>"
```
(`${CLAUDE_PLUGIN_ROOT}` is the plugin root path given at the top of SKILL.md.)

The script:
- wraps all visible text (paragraphs, headings, list items, table cells, FAQ summaries, buttons) and image alt text in translation functions with the theme's text domain;
- turns `/wp-content/themes/<slug>/...` image paths into `get_theme_file_uri()`;
- refuses to write if converting back does not give the exact input (so the pattern is the validated markup).

Defaults: `Block Types: core/post-content` and `Post Types: page`, so the patterns appear in the "Choose a pattern" window for new pages; `Viewport Width: 1440`.

## Check

1. The category is registered in `functions.php` (the template does it: `<slug>-pages`, label "<Name> Pages").
2. With PHP available (`php -v`): `php -l` each pattern file.
3. Confirm WordPress lists them. WP-CLI: `wp eval 'echo count(array_filter(WP_Block_Patterns_Registry::get_instance()->get_all_registered(), fn($p) => str_starts_with($p["name"], "<slug>/")));'`. REST: `GET /wp-json/wp/v2/block-patterns/patterns` (logged-in) and filter by name. Zero patterns: the per-version cache, see child-theme.md.
4. Insert one into a new page once (or parse each pattern's content in the editor's console with `wp.blocks.parse` and check `isValid` on every block). The pattern must produce exactly the approved page.

## What not to put in patterns

- Remote images for wordpress.org themes (see the release checklist).
- Real form ids: keep the placeholder shortcode and document it.
- Site-specific links (page URLs of the demo site): use relative links like `/contact/` or `#`.
