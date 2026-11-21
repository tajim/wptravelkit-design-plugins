# Starter template mode

A starter template is a demo built on the **Travelscape parent alone** (no child theme), sold or offered on wptravelkit.com and installed with Demo Importer Plus (DIP). Same design-to-blocks pipeline as a child theme; what changes is where things live:

| | Child theme | Starter template |
|---|---|---|
| Colors | child `functions.php` (`travelscape_style`) | Customizer theme_mod `travelscape_color_ed` |
| Fonts | child `theme.json` + Google Fonts enqueue | Travelscape Pro theme_mods `travelscape_typography_*` |
| Block system | `add_theme_support` in the child | theme_mod `travelscape_block_system` (Travelscape 1.0.24+) |
| Component CSS | child `style.css` | Additional CSS (DIP's `custom-css` key) |
| WPTE card styles | `is-style-<key>` + child trips.css | Group wrapper `<prefix>-wpte-*` (kit.wpte) |
| Header / footer | block template parts | the parent's Customizer header and footer |
| Images | theme files (`get_theme_file_uri`) | media library attachments in the demo content |
| Patterns | `patterns/page-*.php` | "My patterns" (unsynced `wp_block` posts) in the demo content |
| Output | the theme folder | a DIP package: WXR + customizer-data + site-option + widgets-data + images |

## Requirements (check in stage 1, say what is missing)

- Travelscape **1.0.26 or newer** on the test site. 1.0.24 added the `travelscape_block_system` switch (without it dark sections, text color inheritance and the font presets come out wrong), 1.0.25 the starter fonts and Additional CSS in the editor canvas, 1.0.26 the fix for the classic header and footer on Block Canvas pages (before it they lost their centered container). load-starter.mjs reports the parent version.
- **Travelscape Pro** active (fonts). Starter templates are "pro" demos.
- **WP-CLI** loading (`site.method: "wpcli"`, `site.path`): theme_mods and Additional CSS cannot be written over REST. On Local: start Claude Code from the site shell.
- WP Travel Engine, Contact Form 7 (if the design has a form).
- Travelscape must be the **active** theme on the test site while you work. `load-starter.mjs --activate` switches to it; the previous theme keeps its own settings (WordPress stores theme_mods per theme). Note the previous theme in project.json (`starter.previousTheme`) so you can switch back at the end.

## project.json: the `starter` section

The `theme` section is the same as in child mode (name, slug, classPrefix, colors, font); `slug` is only used for names. Add:

```json
"mode": "starter-template",
"starter": {
  "demoSlug": "northbound",
  "demoUrl": "https://preview.wptravelkit.com/northbound",
  "assetUrl": "https://preview.wptravelkit.com/wp-content/uploads/demos/northbound/",
  "siteType": "pro",
  "fonts": {
    "body": { "family": "Inter", "variant": "400" },
    "heading": { "family": "Inter", "variant": "700" }
  },
  "header": { "buttonText": "Plan my trip", "buttonUrl": "#contact", "phoneLabel": "", "phoneNumber": "", "email": "", "topbar": false },
  "containerWidth": "1344",
  "menuPages": ["home", "about", "services", "faq", "contact"],
  "frontPage": "home",
  "extraWxr": "",
  "previousTheme": "travel-northbound"
}
```

- `assetUrl` is where the user will upload the images. It **must contain `content/uploads`** (or a `YYYY/MM` folder): DIP only swaps image URLs in content when they look like uploads.
- Colors map onto the 7 Customizer slots: `primary` (buttons, links, icons), `secondary` (dark sections), `body`, `heading`, `subtle` (light section background), `border`, `base` (page background, default white). Other design colors stay as hex values in the markup through the kit tokens (`K.muted`, `K.cream`, ...), exactly as in child mode.
- `fonts`: Travelscape Pro loads any Google font by name. Heading falls back to the body font.
- `extraWxr`: an export of sample trips (Tools > Export > Trips on a site that has them), merged into the package so WPTE blocks show trips after import. Ask the user for it if the pages use WPTE blocks.

## Stage by stage

**Stage 2 (plan)**: as in child mode. Note the header and footer: they come from the Customizer, so list what of the design's header carries over (button text and link, phone, email, top bar on or off) and what does not (layout, transparent overlay).

**Stage 3 (no theme to scaffold)**:
1. `.d2b/tokens.mjs`: copy the example tokens, set `mode: 'starter'` and `prefix` (2 to 4 letters, never `ts`). `themeSlug` is unused.
2. Icons: `node "${CLAUDE_PLUGIN_ROOT}/scripts/icons.mjs" --names a,b,c --skip "<parent>/assets/css/blocks.css" --skip "${CLAUDE_PLUGIN_ROOT}/templates/child-theme/style.css" --skip .d2b/starter/custom.css` and append the output to `.d2b/starter/custom.css`.
3. First load: `node "${CLAUDE_PLUGIN_ROOT}/scripts/load-starter.mjs" --activate` after the first page is built (it needs at least one page).

**Stage 4 (pages)**: same loop, with these differences:
- Images: `kit.placeholder('landscape' | 'portrait' | 'avatar')` (JPEG placeholders bundled with the plugin) or `kit.themeImage('<file>')` for a file you put in `.d2b/starter/images/`. Never write `/wp-content/themes/...` paths. Pexels hotlinks do not belong in a sold demo: use placeholders unless the user gives you image files they have the rights to.
- Every WP Travel Engine block goes through `kit.wpte('trips' | 'search' | 'terms', block)`: in starter mode it wraps the block in a Group with the class `<prefix>-wpte-<kind>` that the starter CSS styles (in child mode it returns the block unchanged).
- Component CSS goes into `.d2b/starter/custom.css` (prefix classes, design colors), not into a theme. Then build the Additional CSS:
  `node "${CLAUDE_PLUGIN_ROOT}/scripts/starter-css.mjs"`
  It joins the template's component CSS (renamed to your prefix and colors), the re-scoped WPTE CSS and custom.css, and keeps only rules whose classes the built pages use. `classesWithoutCss` lists classes with no CSS: fix real gaps; JS hooks (`*-faq-pick` etc.) are expected.
- No JavaScript ships with a starter (no theme to enqueue it): the FAQ topic filter and search of child themes do not exist. Build FAQs as plain Details blocks (the accordion works without JS) and leave out filter UI, or tell the user what is missing.
- The Customizer header does not overlay the hero: give the hero a normal top padding (`heroCover({ top: SP.s72, ... })`), not the 128px meant for an overlay header.
- Load: `node "${CLAUDE_PLUGIN_ROOT}/scripts/load-starter.mjs"` (not load-page.mjs). It uploads the images once, swaps the image paths, creates or updates the pages (Block Canvas), the patterns, the menu, the front page, merges the theme_mods and writes the Additional CSS. It saves page ids and links in project.json, backs up the original Travelscape theme_mods once to `.d2b/starter/theme-mods-backup.json`, and warns if the parent is older than 1.0.26 or Pro is inactive.
- Visual check and review gate as in child mode. Ask the user to check the Customizer too (Appearance > Customize: colors, fonts, Additional CSS).

**Stage 5 (patterns)**: nothing to write: load-starter.mjs keeps one unsynced pattern per page under Patterns > My patterns > <template name>, and the package carries them. Check they show up in the inserter.

**Stage 6 (package)**:
1. Screenshots of every page must exist (`.d2b/shots/<slug>/wp-1440.png`).
2. `node "${CLAUDE_PLUGIN_ROOT}/scripts/starter-package.mjs"` (add `--extra-wxr <trips.xml>` or set `starter.extraWxr`). Output: `.d2b/package/<demoSlug>/`. Read its `record.md` and the warnings.
3. Give the user the folder and `record.md`: which file to upload where and which record field gets which file.
4. Put the test site back if the user wants: `node "${CLAUDE_PLUGIN_ROOT}/scripts/load-starter.mjs" --restore` (theme_mods, Additional CSS, front page) and `wp theme activate <previousTheme>`. The starter pages, images, patterns and menu stay; tell the user.

## How DIP imports it (why the package looks like this)

From Demo Importer Plus 2.0.12:
- `customizer-data` **replaces all theme_mods** of the active theme; its `custom-css` key becomes the Additional CSS. So the package never carries `nav_menu_locations` or `custom_css_post_id` (the ids would be the export site's).
- `site-option`: `page_on_front` is matched by **page title** (keep titles unique), `nav_menu_locations` by **menu slug**.
- Content image URLs are swapped for the new uploads only when the content has `src="...content/uploads..."` (or a `YYYY/MM` path). Hence the `assetUrl` rule.
- Every Customizer value containing `.jpg`, `.png`, `.svg` or `.gif` is treated as an image to download; starter-package.mjs warns if the CSS has one.
