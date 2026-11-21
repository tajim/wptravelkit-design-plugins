# Reading a Claude Design export

An export ("download project") is a zip with:

- `*.dc.html`: one file per design document. Each is a **canvas** holding several **artboards** side by side: usually a desktop frame (`Desktop · 1440`) and a mobile frame (`Mobile · 390`), sometimes tablet. extract.mjs lists them with their line numbers.
- `support.js`, `_ds_bundle.js`: the runtime that renders the canvas in a browser. Not needed to read the design; Phase 2 screenshots will use them.
- `README*.md`, `SKILL.md`, `tokens/`, `guidelines/`, `components/`: the design system the project was made with. Often from an OLDER project (the Travel Royale zip carried a NepalAccommodation design system). Use the page files as the truth; use the design system only to fill gaps.
- `uploads/`, `assets/`: logos and images the designer uploaded.

## Inside a .dc.html page

- Plain HTML with inline styles. Sizes are real pixels at the artboard width: `font-size:40px` on the 1440 artboard is the desktop size. Turn desktop sizes into `clamp()` values whose minimum matches the mobile artboard (the kit's font-size tokens already do this for the common sizes).
- Section boundaries are HTML comments: `<!-- Hero -->`, `<!-- Stats band -->`. extract.mjs turns them into the outline. Each section usually appears twice: once in the desktop artboard, once in the mobile one.
- **The content is often NOT in the markup.** Repeated items are templated: `<sc-for list="{{ services }}" as="s">` ... `{{ s.name }}`, and `<sc-if value="{{ s.imgFirst }}">` for alternating layouts. The real lists (names, text, icons, photo ids, stats, FAQ questions and answers) are in the page's data script, which extract.mjs saves as `<slug>.data.js`. Read it and copy the content from there, item by item.
- Interactive state (open FAQ, selected tab, chosen date) is in the data script's `state`. Build the default state (first FAQ open, first tab active).
- `hint-placeholder-count`, `hint-placeholder-val` only drive the design preview. Ignore them.
- Header and footer are drawn inside every page's artboards. Build them once as template parts, not per page.
- Icons are Tabler webfont classes (`<i class="ti ti-phone">`). Map them to Lucide (`icons.mjs --map`). The design's `ti-brand-*` logos (WhatsApp, Instagram) have no Lucide equivalent: use a generic icon (message-circle) or the Social Icons block.
- Images: Pexels URLs, sometimes built by a helper in the data script: `px(id, width)` -> `https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?...`. extract.mjs lists the ids.
- The canvas page also has a caption frame at the top ("Luxury travel agency · Turn 2", notes about placeholders). Read it: it says what is placeholder content.

## What to take from where

| Need | Where |
|---|---|
| Section order and structure | desktop artboard, section comments |
| Stacking order on phones, what is hidden on mobile | mobile artboard |
| Text, lists, icons per item, image ids | `<slug>.data.js` |
| Colors, font sizes, radii | `<slug>.md` (counted from the page) |
| Font family | the Google Fonts link in `<helmet>` |
| Brand voice, logo | `README*.md`, `assets/`, `uploads/` |
