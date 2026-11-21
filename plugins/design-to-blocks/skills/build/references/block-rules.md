# Block rules (read before writing any page script)

Each rule below fixed a real bug in Travel Royale. `<p>` is the theme's class prefix (Travel Royale: `tr`).

## Building

1. **Only through the kit.** `c(name, attrs, inner)` throws on an attribute the block does not register. That is how WordPress changes get caught (WP 7.0 moved text alignment; old markup silently lost it). Never write block markup by hand and never edit the generated .txt.
2. **Validate with both sets** (`check.sh`). Passing is necessary, not sufficient: the parser silently "recovers" some changes through block deprecations. When the page can be loaded on the site, open it once in the editor too.
3. **WordPress 7.0 attribute shapes**
   - Text alignment: `style.typography.textAlign: 'center'`, never an `align` or `textAlign` attribute on paragraphs and headings.
   - Cover height: `minHeight: 600, minHeightUnit: 'px'` attributes. Aspect ratio: `style.dimensions.aspectRatio: '4/5'`.
   - Grid children: `style.layout.columnSpan` / `rowSpan`. Flex children: `style.layout.selfStretch: 'fill'` (grow) or `'fixed'` with `flexSize: '96px'`.
   - Image fill: `scale: 'cover'` with `aspectRatio`. Image `width`/`height` are strings (`'52px'`).
4. **Palette slugs**: `primary`, `secondary`, `base`, `heading`, `subtle`, `subtle-two`, `body-text`, `primary-inverse`, `secondary-inverse`. Never `text` (renamed to `body-text` in Travelscape 1.0.22). Off-palette shades (muted text, card cream, dividers) come from the kit tokens (`K.muted`, `K.rule`...).
5. **Rich text content** is HTML: escape `&` as `&amp;` and `<` as `&lt;` in text; links, `<strong>`, `<em>`, `<br>` are fine.

## Layout traps

6. **Hero cover at the top of a Block Canvas page** (the header overlays it when the first block is a cover):
   - `align: 'full'`, `layout: { type: 'constrained', contentSize: '1344px' }` (the wide size), left/right padding `var(--wp--style--root--padding-left|right)`, top padding about the header height (128 to 140px).
   - **No `contentPosition`**, or exactly `'center center'`. Any other value ("center left", "bottom left") shrink-wraps the inner container, and on wide screens the text hugs the screen edge instead of lining up with the sections below.
   - Left-aligned hero text: put it in an inner stack with `layout: { type: 'constrained', contentSize: '860px', justifyContent: 'left' }`. Use `kit.heroCover()`.
   - `contentPosition: 'bottom left'` is fine for SMALL covers (image tiles, cards), where the shrink-wrap is wanted.
7. **Grid gap: one value only.** WordPress copies blockGap into the grid column formula. Two values (`{ top: '32px', left: '0' }` or `'32px 0px'`) make it invalid and the grid falls back to ONE column. The kit's `grid()` refuses two values. Need no column gap (a continuous timeline line)? Use `'0px'`. Also never a unitless `0`.
8. **Do not set `margin: { top: '0', bottom: '0' }` on blocks inside a container that spaces its children** (stack, wide group, column). The inline zero overrides the container's blockGap and the blocks touch. Only full-width sections (via `pad()`) get zero margins.
9. **Lists always get `className: 'is-style-ts-plain'`** (plus your own class). On Block Canvas pages the parent indents every other list and zeroes its top margin, which the editor does not show, so the list looks fine in the editor and broken on the site. Give the list an explicit `style.spacing.margin.top` when it needs space above.
10. **Images that fill a box** (half a row, card top): an Image block inside a group with `<p>-media-stat`, which positions it absolutely. The editor adds an inline `height:auto` to images; the component CSS overrides it with `!important`. Keep that rule.
11. **No text on top of content images.** Users must be able to replace every photo with the Image block's Replace button. Badges and stats that sit on a photo in the design go in a sibling block that CSS positions over the image (`<p>-stat-badge`). Covers with text are for hero and call-to-action backgrounds only.
12. **Covers without inner blocks** get an empty placeholder paragraph from the editor on first edit. Harmless; do not fight it.
13. **The editor is not the front end.** It pads every group that has a background color (core's `.wp-block-group.has-background { padding: 1.25em 2.375em }`), gives covers 1em padding, and puts a "Write title…" placeholder paragraph inside empty covers. A card whose image should touch the card edge therefore looks inset in the editor. Give such cards an explicit `style.spacing.padding` of 0 (or rely on the `<p>-media-card` CSS, which zeroes the card and cover padding and hides the empty cover's inner container). Check new card designs in the editor, not only on the site.
14. **Content images**: Image blocks with the bundled placeholders (`kit.placeholder('landscape'|'portrait'|'avatar')`) unless the interview said Pexels. Avatars and team photos are Image blocks, not initials in a circle.

## Tablet and phone (do this while building, not after review)

The design only shows desktop and phone. Tablets (601 to 1024px) are where layouts break. For every row of cards decide the tablet layout up front:
- 4 cards -> 2 x 2: add `<p>-grid-2x2` to the grid group.
- 6 small tiles -> 3 x 2: `<p>-grid-3`.
- 3 cards that cannot split evenly -> one centred column: `<p>-grid-stack-tablet`.
- Two-column sections with a form or a wide table -> stacked: `<p>-cols-stack-tablet` on the columns block.
- A horizontal timeline -> vertical below 1024px (component `<p>-timeline` already does this).
- Never leave a single card hanging alone on its own row.
Core Columns stack below 782px by themselves. Two-column rows where the image is on the right need `<p>-svc-row--img-last` so the image comes first on phones.

## Components and scripts

15. **FAQ**: `core/details` blocks inside a group with `<p>-faq` (or `<p>-faq <p>-faq--circle`). First item `showContent: true`. The FAQ page with live search uses the `<p>-faq-page` layout and the theme's faq.js (see components.md).
16. **Forms**: a `core/shortcode` block with a placeholder Contact Form 7 shortcode inside a group with `<p>-cf7`. The form itself is CF7 form-tab markup the user pastes (child-theme.md shows the structure).
17. **Search box**: `core/search` with `buttonPosition: 'no-button'`, `showLabel: false`, styled by `<p>-faq-search`.
18. **Whole-card links**: card group `<p>-card-link`, the main link's paragraph `<p>-card-link__target`. The overlay only applies on the site, so cards stay editable in the editor.
19. **Anchors** for in-page links: the `anchor` attribute (`svc-flights`). Scripts hook onto classes, not anchors.
20. **Dark sections**: `kit.darkSection()` (`is-style-ts-section-dark`, secondary background, base text). Eyebrows on dark use `K.darkEyebrow`, body text `K.darkText`.
21. **WP Travel Engine blocks** are server-rendered and self-closing. Always send the full `layoutFilters` object they expect (copy from the legacy home example), or the block renders with missing parts.

## Before calling a page done

- Both validators OK.
- Every grid of cards has a tablet class.
- Every list has `is-style-ts-plain`.
- No `contentPosition` on full-width covers.
- No made-up brand names, phone numbers or emails.
- Images are placeholders or allowed Pexels links, each with a real alt text.
