# Interview

Ask with the AskUserQuestion tool (1 to 4 questions per call, multiple choice with an "Other" escape). At most three rounds. Never ask what the design, the folder or an earlier project already answers: read the extracted design first when the zip is already there, and pre-fill from it.

## Round 1: what are we building

1. **Mode**
   - Child theme for wordpress.org (free, reviewed: strict rules on images, licences, translation)
   - Premium child theme (sold on wptravelkit.com: same build, fewer review constraints)
   - Starter template on the parent only (no child theme; colors/fonts via the Customizer; see starter-template.md)
2. **Theme name** (offer one derived from the design file names, e.g. "Luxury Travel ..." -> "Travel Royale"). Slug = lowercase-hyphenated name. Class prefix = 2 letters from the name (Travel Royale -> `tr`), must not be `ts` (parent).
3. **Pages to build**: multi-select from the pages extract.mjs found. Ignore component sheets (Components, PropertyCard and similar canvases).
4. **Where the design zip is**, if not passed as the argument.

## Round 2: the site

5. **Local WordPress site**: themes folder path (e.g. `/Users/<me>/Local Sites/<site>/app/public/wp-content/themes`) and site URL (e.g. `http://travel.local`). Check the folder exists and has `travelscape/` in it.
6. **How to load pages**: WP-CLI (Claude Code started from Local's "Open site shell"), REST with an application password (user exports D2B_WP_USER and D2B_WP_APP_PASSWORD before starting Claude Code), or "I will paste the markup myself".
7. **Form plugin**: Contact Form 7 (default for WP Travel Kit) or none.

## Round 3: content decisions (only those the design raises)

8. **WP Travel Engine blocks**: for each design element that looks like trip search, a trip/journey grid, or destination cards, ask whether to use the WPTE block (live data, its own card layout) or build it static from the design. Default: trip search and trip grids -> WPTE blocks; destination "bento" tiles -> static covers.
9. **Images**: bundled placeholders the user replaces (default for wordpress.org), Pexels links from the design (fine for premium/demo work), or both (placeholders for content images, Pexels for hero/CTA backgrounds).
10. **Brand names in the design**: the design may use a made-up agency name. Confirm the neutral replacement.

## .d2b/project.json

Write it as answers come in. Shape:

```json
{
  "dataDir": "<CLAUDE_PLUGIN_DATA path>",
  "design": { "source": "/path/to/design.zip", "extracted": ".d2b/design" },
  "mode": "child-wporg | child-premium | starter-template",
  "themesDir": "/Users/me/Local Sites/travel/app/public/wp-content/themes",
  "parentDir": "/Users/me/Local Sites/travel/app/public/wp-content/themes/travelscape",
  "site": { "url": "http://travel.local", "method": "wpcli | rest | manual", "path": "/Users/me/Local Sites/travel/app/public" },
  "forms": "cf7 | none",
  "images": "placeholders | pexels | mixed",
  "theme": {
    "name": "Travel Royale",
    "slug": "travel-royale",
    "classPrefix": "tr",
    "wpteStyleKey": "royale",
    "description": "One paragraph for style.css and readme.txt (what it is, who it is for, what it includes).",
    "uri": "https://wptravelkit.com/wordpress-travel-themes/travel-royale/",
    "version": "1.0.0",
    "font": { "family": "Instrument Sans", "googleFamilyParam": "Instrument+Sans:ital,wght@0,400..700;1,400..700", "fallback": "sans-serif" },
    "colors": { "primary": "#2f5e46", "secondary": "#1f2427", "body": "#1c1b19", "heading": "#1c1b19", "subtle": "#f1ede6", "border": "#e6e1d8", "muted": "#625d55", "cream": "#faf8f4", "control": "#d6d0c5", "tint": "#e8efea", "heroSub": "#e9ecee", "darkEyebrow": "#bccdc2", "darkText": "#c9ced1", "darkMuted": "#c3c8cc" },
    "layout": { "contentSize": "1200px", "wideSize": "1344px" },
    "demoImporterId": ""
  },
  "brandReplacements": { "Northbound": "us" },
  "pages": [
    { "slug": "home", "title": "Home", "design": "luxury-travel-homepage", "status": "todo | built | in-review | approved", "pageId": null }
  ]
}
```

Color roles are explained in `templates/child-theme/template.json` ("colorNotes"). Take every value from the design's most-used colors (extract.mjs lists them). Anything the design does not define keeps the template value; mention which ones you kept.
