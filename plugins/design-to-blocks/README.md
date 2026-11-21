# Design to Blocks (WP Travel Kit)

A Claude Code plugin that turns a Claude Design project export into a Travelscape child theme: tested block-editor pages, page patterns, and the theme around them.

```
/design-to-blocks:build ~/Downloads/my-design.zip
```

Claude then interviews you (mode, theme name, pages, local site), extracts the design, scaffolds the child theme, builds each page with WordPress's own block packages, validates it against WordPress 7.0 and the latest Gutenberg, loads it onto your local site, screenshots it next to the design at 1440 / 1024 / 768 / 390, fixes what differs, and then hands you a side-by-side review sheet. When every page is approved it writes the page patterns.

## Install

1. In Claude Code (the repo must be reachable with your GitHub login if it is private):
   ```
   /plugin marketplace add tajim/wptravelkit-design-plugins
   /plugin install design-to-blocks@wptravelkit
   ```
2. Restart Claude Code (or run `/reload-plugins`). Update later with `/plugin marketplace update wptravelkit`.

Requirements: Node 20+ and npm (the first run installs the WordPress block packages and the screenshot tools into the plugin's data folder, about a minute). Google Chrome (or Chromium, Edge, Brave) for screenshots. Python 3 for the pattern step. Optional: WP-CLI (start Claude Code from Local's "Open site shell") or an application password, so pages load onto the site automatically.

## Use

1. Make a new empty folder for the project and start Claude Code in it.
2. Run `/design-to-blocks:build <path to the Claude Design zip>`.
3. Answer the interview. Review each page when Claude asks. Say "approved" to move on.
4. Stop any time. Running the command again in the same folder resumes from `.d2b/project.json`.

## What is in here

| Path | What |
|---|---|
| `skills/build/SKILL.md` | the workflow Claude follows |
| `skills/build/references/` | interview, Claude Design format, block rules (hard-won fixes), components, child theme, patterns, site loading, starter template (planned) |
| `scripts/lib/kit.mjs` | block-building helpers on top of `@wordpress/blocks` |
| `scripts/build-page.mjs` | runs a page script, writes the markup |
| `scripts/check.sh`, `validate.mjs` | editor-equivalent validation with two package sets |
| `scripts/extract.mjs` | reads a Claude Design zip into per-page briefs |
| `scripts/icons.mjs` | Lucide icon CSS, Tabler-to-Lucide name map |
| `scripts/scaffold-child.mjs` | new child theme from the template |
| `scripts/make-pattern.py` | translatable PHP pattern from validated markup |
| `scripts/load-page.mjs` | create or update a page via WP-CLI or REST |
| `scripts/screenshot.mjs` | design vs WordPress screenshots per section at 4 widths, automatic layout findings, review sheet |
| `templates/child-theme/` | Travel Royale 1.0.0, the template for new child themes |
| `examples/travel-royale/` | four approved page scripts, their output, and the Contact Form 7 forms |

## Status

Phase 1 (0.1): child-theme mode end to end.
Phase 2 (0.2): screenshots of the design artboards and the WordPress page at 1440 / 1024 / 768 / 390, side-by-side sheets, automatic findings (overflow, orphan cards, broken images, height drift), fix-and-recheck loop.
Phase 3 (next): starter-template mode (parent only, Customizer settings, Demo Importer Plus package), after the child components move into Travelscape as `ts-*` utilities.

Requires Travelscape 1.0.23 or newer on the site.
