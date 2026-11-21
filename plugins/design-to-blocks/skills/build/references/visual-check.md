# Visual check (screenshots against the design)

Run after every load of a page, before asking the user to review it.

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/screenshot.mjs" --page <slug> [--url <page link>]
```
(`${CLAUDE_PLUGIN_ROOT}` is the plugin path given at the top of SKILL.md.)

It needs Google Chrome (or Chromium, Edge, Brave) installed; it does not download a browser. Set `D2B_CHROME` to a browser binary to pick one. The page URL comes from `pages[].link` in project.json (load-page.mjs prints it; save it there), else `--url`. The design file comes from `pages[].design` (the slug extract.mjs gave the page).

What it does:
- Renders the design page with the Claude Design runtime served from local files (React, Babel, Tabler icons), finds the artboards (usually 1440 and 390), and screenshots every section.
- Opens the WordPress page at 1440, 1024, 768 and 390 (scroll animations off, lazy images forced), screenshots the page and each top-level block plus the footer.
- Pairs design sections with WordPress sections in order (the design's footer with the site footer) and writes one side-by-side image per pair.
- Finds problems by measuring: horizontal overflow, a card alone on the last row of a grid ("orphan"), images that failed to load, an invalid-block notice, and sections more than 20% taller or shorter than the design.

Outputs in `.d2b/shots/<slug>/`: `report.md` (read this first), `report.json`, `pairs/*.png`, `compare.html` (the sheet for the user), full-page images.

## Your loop

1. Read `report.md`. Check the theme line: if it is not the project's theme, stop: activate the theme first (the comparison is meaningless otherwise).
2. **Pairing**: if the report shows "pairing" findings, sections are out of step (the page has an extra or missing top-level block). Fix the page so every design section is one top-level block, in the design's order, or accept a known difference and note it.
3. Look at the pair images with the Read tool: every pair at 1440, every pair at 390, and at 1024 and 768 the pairs named in findings plus any section with a grid of cards or two columns. Compare, section by section:
   - layout: columns, order, alignment (left edges line up with the sections above and below), what stacks on phones
   - spacing: section padding, gaps between cards, space under headings
   - type: heading sizes relative to the design, weights, line breaks of headings
   - color: backgrounds, text on dark sections, button colors, borders
   - details: icons present, radius on cards and images, badges, dividers, arrows on buttons
   - Ignore: photos (placeholders), exact font rendering, 1 to 2px differences, text that wraps one word differently.
4. Height findings are hints, not errors: a section 25% taller is often bigger padding or a larger heading; open its pair and decide.
5. Tablet (1024, 768) has no design: judge by the block rules (no orphans, no overflow, readable line lengths, two columns that are too narrow should stack).
6. Fix in the page script or the theme CSS, rebuild, check.sh, reload, run screenshot.mjs again. At most **3 rounds** per page; then show the user what is left and why.
7. Hand over: tell the user the page link and open the sheet for them (`open .d2b/shots/<slug>/compare.html` on macOS, `xdg-open` on Linux). In your message, list what still differs on purpose (WPTE blocks replacing static cards, placeholders, things blocks cannot do).

## When the design page does not render

The runtime is served locally, but fonts and photos still come from the internet. With no network the design renders with fallback fonts and empty images: still good for layout, not for type. If the design cannot render at all (an export without `support.js`), run with `--widths ...` and judge WordPress against the design's `<slug>.clean.html` instead.
