---
name: build
description: Turn a Claude Design project export (zip or folder of .dc.html pages) into WordPress block-editor pages, page patterns and a Travelscape child theme for WP Travel Kit. Use when the user wants to convert a Claude Design design into a WordPress theme, block markup or patterns, or resume such a project (a folder with .d2b/project.json).
argument-hint: "[path to the Claude Design zip or folder]"
---

# Design to Blocks

You turn a Claude Design export into a working Travelscape child theme with tested pages and patterns. The user designs; you build and check; the user approves each page. Work in the current folder (the "project folder"). All state lives in `.d2b/` inside it, so a stopped session can be resumed.

Plugin files: `${CLAUDE_PLUGIN_ROOT}` (scripts, templates, references). Installed packages: `${CLAUDE_PLUGIN_DATA}`.
These two paths are only filled in inside this file: copy them literally into the commands you run. Where a reference file writes `${CLAUDE_PLUGIN_ROOT}`, it means this same path: `${CLAUDE_PLUGIN_ROOT}`.

Read these before the stage that needs them (they are short and they matter):
- `${CLAUDE_PLUGIN_ROOT}/skills/build/references/interview.md` before stage 1
- `${CLAUDE_PLUGIN_ROOT}/skills/build/references/claude-design-format.md` before stage 2
- `${CLAUDE_PLUGIN_ROOT}/skills/build/references/block-rules.md` before writing ANY page script (stage 4). These are bugs that already cost real review rounds: do not skip.
- `${CLAUDE_PLUGIN_ROOT}/skills/build/references/components.md` when a design element is not a plain core block
- `${CLAUDE_PLUGIN_ROOT}/skills/build/references/child-theme.md` before stage 3
- `${CLAUDE_PLUGIN_ROOT}/skills/build/references/site-loading.md` when loading pages onto the site
- `${CLAUDE_PLUGIN_ROOT}/skills/build/references/patterns.md` before stage 5
- `${CLAUDE_PLUGIN_ROOT}/skills/build/references/starter-template.md` if the user picks "starter template"
- Worked example of four finished pages: `${CLAUDE_PLUGIN_ROOT}/examples/travel-royale/` (about, services, faq, contact + tokens). Read one before writing your first page script.

## Resume first

If `.d2b/project.json` exists, read it, tell the user in two lines where the project stands (pages done / in review / to do), and continue from the first unfinished stage. Do not redo the interview.

## Stage 0: setup (once per machine, quick after the first time)

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup.sh" "${CLAUDE_PLUGIN_DATA}"
```
It installs two sets of WordPress block packages (the WordPress 7.0 ones and the latest Gutenberg) plus Lucide icons. Needs Node 20+. Then make sure `.d2b/project.json` has `"dataDir": "${CLAUDE_PLUGIN_DATA}"` (create the file if needed). Every script finds the packages through it.

## Stage 1: interview

Follow `references/interview.md`: ask with the AskUserQuestion tool, in at most three rounds, only what the design and the folder cannot tell you. Save every answer in `.d2b/project.json` as you go. Then show a short summary of the plan (theme name, slug, pages, site, mode) and wait for an OK.

If the mode is **starter template**, read `references/starter-template.md`: that mode is not automated yet. Say so plainly and offer to build the pages as block markup with the parent theme only (stages 2 and 4, no child theme, no patterns).

## Stage 2: extract and plan

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/extract.mjs" "<zip or folder>" .d2b/design
```
Then read `.d2b/design/design.md` and, for each page the user picked, its `<slug>.md`, `<slug>.clean.html` (desktop artboard AND mobile artboard) and `<slug>.data.js` (lists of services, FAQs, tiers: the real content lives there, not in the template markup).

Write `.d2b/plan.md`:
- **Tokens**: colors mapped to the template's color roles (see `templates/child-theme/template.json` "colorNotes"), font, radii, section padding. Every hex you will use, once.
- **Per page**: one line per section: what it is, which core blocks build it, which component classes it needs (components.md), which WPTE block (trip search, trips, destinations) replaces a design element, images (become placeholders or Pexels), icons (Tabler name -> Lucide name; check with `node "${CLAUDE_PLUGIN_ROOT}/scripts/icons.mjs" --map ti-a,ti-b`).
- **New components**: anything components.md does not cover. Keep this list short; prefer core blocks.
- **Brand names** in the design that must not ship (e.g. a made-up agency name): replace with neutral text.

Show the user the plan summary (not the whole file) and continue unless they object.

## Stage 3: theme (child mode)

Follow `references/child-theme.md`:
1. `node "${CLAUDE_PLUGIN_ROOT}/scripts/scaffold-child.mjs" --out "<themes folder>"` (reads `theme` from project.json). It refuses to overwrite an existing theme folder.
2. Write `.d2b/tokens.mjs` for the kit (copy `${CLAUDE_PLUGIN_ROOT}/examples/travel-royale/tokens.mjs`, change values and `prefix`/`themeSlug`; font-size and spacing tokens can be overridden the same way, see `DEFAULT_TOKENS` in `scripts/lib/kit.mjs`).
3. Icons the pages need and the parent/child do not have: `node "${CLAUDE_PLUGIN_ROOT}/scripts/icons.mjs" --names a,b,c --skip "<parent>/assets/css/blocks.css" --skip "<theme>/style.css"`, append the output to the child `style.css`.
4. **Activate the new theme** on the site before any page is reviewed: `wp theme activate <slug>` (WP-CLI) or ask the user to do it in Appearance > Themes. Every page's component classes (`<prefix>-*`) only have CSS in this theme; under another theme the pages load but look broken. load-page.mjs warns (exit code 3) when the active theme is not the project's theme: stop and fix that before asking for a review.
5. Rebuild `parts/header.html` and `parts/footer.html` from the design's header and footer with the kit (see `examples/travel-royale/legacy-home-header-footer.mjs`), validate them, keep the class names the header CSS expects (`<prefix>-header`, `<prefix>-header-nav`, `<prefix>-header-phone`, `<prefix>-header-cta`, `<prefix>-footer`).

## Stage 4: pages, one at a time

For each page, in the order the user gave (home first unless told otherwise):
1. Write `.d2b/pages/<slug>.mjs`: a module that exports `default function build(kit) { ...; return { slug: '<slug>', blocks: [...] }; }`, shaped exactly like the examples. The kit (`scripts/lib/kit.mjs`) gives you `c`, `P`, `H`, `stack`, `grid`, `section`, `darkSection`, `wide`, `heroCover`, `ctaBand`, `pillButton`, tokens `K`, `F`, `SP` and more: read its exports once. Section by section, follow the desktop artboard and check the mobile artboard for stacking order.
2. Build it (from the project folder; tokens come from `.d2b/tokens.mjs`):
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/build-page.mjs" .d2b/pages/<slug>.mjs` -> `.d2b/out/<slug>.txt`
3. Validate: `bash "${CLAUDE_PLUGIN_ROOT}/scripts/check.sh" .d2b/out/<slug>.txt`. Both package sets must say OK. Fix and re-run until they do. Never hand-edit the .txt; change the page script.
4. Any new component CSS goes at the end of the child `style.css` under a `/* --- <Page> page components --- */` heading, using the theme's class prefix and the theme's color tokens. Add the tablet rules from block-rules.md (2x2 grids etc.) in the same step, not later.
5. Load it onto the site (`references/site-loading.md`):
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/load-page.mjs" --file .d2b/out/<slug>.txt --slug <slug> --title "<Title>"`
   If the site is not reachable, give the user the .txt to paste into the Code editor of a page that uses the "Block Canvas" template.
6. Review gate (only with the project's theme active): ask the user to check the page at desktop, iPad (768 and 1024) and phone widths, and to say what differs from the design. Fix, re-validate, reload. Mark the page `"approved"` in project.json only when they say so. Then the next page.

Keep the user's attention cheap: report each page in a few lines (link, what to look at first, what you could not match and why).

## Stage 5: patterns

When every page is approved, follow `references/patterns.md`: one `make-pattern.py` run per page into `<theme>/patterns/page-<slug>.php`, the pattern category registered in `functions.php`, then confirm WordPress lists the patterns (bump or toggle the theme version if they do not appear: WordPress caches pattern files per theme version).

## Stage 6: finish

Run the release checklist in `references/child-theme.md` and report what is left for the user (images and their licences, screenshot.png, Demo Importer Plus ID, CF7 form IDs). Copy the final page markup files next to the theme or into the user's project folder if they asked.

## Rules that hold everywhere

- Never change the parent theme (Travelscape) yourself. It runs on hundreds of live sites. If the design needs something the parent lacks, put it in the child theme and tell the user; if it really belongs in the parent, write a short Cursor prompt for the user instead (what, why, backward-compatibility notes, test list).
- Build blocks only through the kit (`scripts/lib/kit.mjs`): its guard rejects attributes a block does not have, which is how WP 7.0 changes get caught.
- One page in review at a time. Do not build the next page while the user is reviewing one, unless they ask.
- Images: bundled placeholders for content images the user will replace; Pexels links only where the user allowed them, and flag them before release (wordpress.org rejects hotlinked images).
- Copy: keep the design's text, but replace made-up brand names, real-looking phone numbers and emails with neutral placeholders (`+1 (800) 555-0142`, `hello@example.com`).
- If something in the design cannot be done well with blocks (live calendars, interactive filters), say so, propose the closest honest version, and build that.
