# Child theme

## What scaffold-child.mjs makes

A copy of Travel Royale 1.0.0 with every identifier renamed (name, slug and text domain, PHP prefixes, class prefix, WPTE style key), the color tokens and font swapped, and a fresh `style.css` header, `readme.txt` and `theme.json` font list. It never overwrites an existing theme folder unless `--force`.

```
<slug>/
  style.css            header + ALL component CSS (header, footer, components, page sections, CF7, icons)
  theme.json           layout sizes, font families, root padding, template part areas
  functions.php        opts into the parent's block system, block header/footer, WPTE styles;
                       registers the "<Name> Pages" pattern category; overlay-header body class;
                       Demo Importer Plus id (pluggable)
  inc/theme-setup.php  enqueues, editor style, Google font via the parent's webfont loader,
                       colors and typography through the travelscape_style filter, faq.js enqueue,
                       the logo SVG filter for the transparent header
  inc/tgmpa-override.php  recommends WP Travel Engine, Demo Importer Plus, Contact Form 7
  parts/header.html, parts/footer.html   block template parts (REBUILD from the design)
  assets/css/trips.css, trip-search.css, terms.css   the theme's WP Travel Engine block style
  assets/js/faq.js     FAQ search + topic filter
  assets/images/placeholder-{landscape,portrait,avatar}.svg
  patterns/            filled in stage 5
```
Requires Travelscape 1.0.23 or newer (block header wrapper fix). Say so in the release notes.

## After scaffolding

1. **Typography beyond the font**: `inc/theme-setup.php` `<fn>_override_styles()` sets base font size, line heights and heading weights. Match the design.
2. **WP Travel Engine styles**: `assets/css/trips.css`, `trip-search.css`, `terms.css` style the WPTE blocks under `is-style-<key>`. They use the parent's CSS variables, so the new colors flow through. Adjust radii and spacing if the design differs. The block markup must use `className: 'is-style-<key>'` on WPTE blocks.
3. **Header and footer parts**: rebuild from the design with the kit, validate, write to `parts/`. Keep: logo block, navigation block with `<p>-header-nav` (menu is the site's own, not hard-coded links), phone paragraph `ts-icon ts-icon--phone ts-hide-mobile <p>-header-phone`, CTA buttons `<p>-header-cta`. The footer is a full-width group `<p>-footer` with columns of lists (lists need `is-style-ts-plain`).
   - If the user already edited a template part in the Site Editor, WordPress uses the database copy and ignores the file. Tell them to reset it (Site Editor > Patterns > Template parts > Reset) to see file changes.
4. **Transparent header**: automatic on Block Canvas pages whose first block is a Cover. Header text and the CTA turn white; the logo goes through the `#<prefix>-logo-light` SVG filter (dark parts white, bright colors kept), so users upload one logo.
5. **Responsive header**: full menu from 1200px up; below that logo, button, hamburger. If the design's menu is longer than about 6 items, raise the 1199px breakpoint in style.css.

## Contact Form 7

Pages get a `core/shortcode` block with a placeholder (`[contact-form-7 id="REPLACE-WITH-<FORM>-ID" title="<Form>"]`) inside a `<p>-cf7` group. Write a companion markdown file for the user with, per form: the Form-tab markup, Mail subject, Reply-To header, mail body, and success message. Rules for the form markup:
- Keep every field on one line inside a `<div>`: CF7 adds `<p>` and `<br>` around loose lines (the CSS hides stray ones, but one line per field avoids them).
- `use_label_element` on radio and checkbox tags (the pill CSS needs `<label><input><span>`).
- `[acceptance name optional] text with <a href>link</a> [/acceptance]` for an optional consent checkbox.
- `[submit class:<p>-cf7-submit class:<p>-cf7-submit--send "Label"]` (or `--arrow`).
- Live calendars, payments and multi-step wizards are not CF7: build the closest honest form and say what changed.
`examples/travel-royale/contact-form-7.md` is a complete, tested pair of forms to copy from (change `tr-` to the theme prefix).

## Versions and caches

- WordPress caches a theme's pattern file list per theme **version**. New or renamed pattern files do not show until the version changes. For development, tell the user to add `define( 'WP_DEVELOPMENT_MODE', 'theme' );` to wp-config.php, or toggle the version (e.g. `1.0.0` -> `1.0.0-dev` -> back) and load any admin page in between.
- Bump the version when CSS changes and the user sees old styles (it is the cache-busting query string).

## Release checklist

For every mode:
- [ ] Every page approved by the user, patterns registered (stage 5), both validators OK on the final markup.
- [ ] No made-up brand names; demo phone numbers and emails are placeholders.
- [ ] `<Name> Pages` pattern category registered; each pattern says "Use with the Block Canvas page template".
- [ ] CF7 form ids replaced or documented; Demo Importer Plus id set in functions.php.
- [ ] Requires Travelscape 1.0.23+ noted in readme.txt.

wordpress.org (mode child-wporg) adds:
- [ ] **No hotlinked images**: no `images.pexels.com` or other remote URLs in patterns or parts. Replace with bundled CC0 images in `assets/images/` (pattern image paths go through `get_theme_file_uri()`), each listed with its licence under `== Resources ==` in readme.txt.
- [ ] `screenshot.png` (1200 x 900) in the theme root, licence listed.
- [ ] All pattern text translatable (make-pattern.py does it) and the text domain equals the slug.
- [ ] No `.cursor/`, `.DS_Store`, `.d2b/` or node files in the zip.
- [ ] Run the Theme Check plugin on a clean install with the parent active.
