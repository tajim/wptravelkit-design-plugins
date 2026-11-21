# Components

Two layers. Use the parent's first, then the child's, then core blocks styled by attributes. Add a new component only when none of these fits, and add it to the child `style.css` with the theme prefix.

`<p>` = the theme's class prefix. The CSS for every `<p>-*` class below ships in the template's `style.css` (from Travel Royale); the examples in `examples/travel-royale/` show each one in use.

## Parent (Travelscape 1.0.23+, `assets/css/blocks.css`)

| Class / style | Put it on | Does |
|---|---|---|
| `ts-icon ts-icon--{name}` | paragraph | inline Lucide icon before the text (current text color) |
| `ts-icon--lg` | with `ts-icon` | 2em icon on its own line above the text |
| `is-style-ts-arrow` | button | text link with an arrow (no pill) |
| `is-style-ts-plain` | list | no bullets, no indent (always use, see block-rules 9) |
| `is-style-ts-section-dark` / `-primary` / `-subtle` / `-base` | full-width group | section color scheme incl. text and links |
| `ts-auto-terms` | WPTE term blocks | fills empty term blocks automatically |

Parent icons (no need to generate): map-pin, calendar, clock, users, star, check, check-circle, plane, mountain, compass, phone, mail, arrow-right, arrow-up-right, shield-check, heart, globe, camera, bed, utensils, car, leaf, tent, award. Also the variables `--ts-icon-arrow-right` and `--ts-icon-check` for CSS.

## Child components (template style.css)

### Icons and labels
| Class | Block | Does |
|---|---|---|
| `<p>-icon-tile ts-icon--{name}` | paragraph (the title) | 36px tinted tile with the icon, above the text |
| `+ <p>-icon-tile--lg` | | 48px tile |
| `+ <p>-icon-tile--row` | | tile on the left, the paragraph text (e.g. "01") on the right |
| `+ <p>-icon-tile--outline` | | outlined tile for dark sections |
| `<p>-icon-side ts-icon--{name}` | group holding title + text | 44px tile to the left of the group |
| `+ <p>-icon-side--outline` / `--xl` | | outlined (dark) / 64px vertically centred |
| `<p>-icon-label ts-icon--{name}` (`--sm`) | paragraph or heading | 44px (40px) tile before a one-line label |
| `<p>-icon-primary` | with `ts-icon` | icon in the primary color |
| `<p>-num` (`--sm`) | paragraph | numbered square (dark sections) |
| `<p>-avatar` (`--md`, `--lg`) | paragraph | initials circle (prefer `<p>-avatar-img` with an Image block) |
| `<p>-avatar-img` | image (52px, radius 999) | round photo in a flex row |
| `<p>-pill` | paragraph | fit-content pill label |
| `<p>-badge` | paragraph inside `<p>-tier` | corner badge ("Most chosen") |
| `<p>-stars` | paragraph "5 out of 5 stars" | five filled stars (text stays for screen readers) |
| `<p>-quote-mark ts-icon--quote` | paragraph | big centred quote mark above a quote |
| `<p>-quote-card ts-icon--quote` | flex group | quote mark to the left of the quote |

### Links and buttons
| Class | Block | Does |
|---|---|---|
| `<p>-btn-arrow` | button | trailing arrow inside a pill button |
| `<p>-chip ts-icon--{name}` | button | leading icon inside a pill (hero service links, phone buttons) |
| `<p>-more-down` | paragraph with a link | "Learn more" with a down arrow |
| `<p>-link-after ts-icon--{name}` | paragraph with a link | link with a trailing icon (arrow-right, arrow-up-right) |
| `<p>-card-link` + `<p>-card-link__target` | card group + its main link paragraph | whole card clickable (site only) |

### Layout
| Class | Block | Does |
|---|---|---|
| `<p>-grid-2x2` / `<p>-grid-3` / `<p>-grid-stack-tablet` | grid group | tablet layouts (block-rules) |
| `<p>-cols-stack-tablet` | columns | stack between 782 and 1024px |
| `<p>-media-card` | card group | clips the first child (image) to the card radius |
| `<p>-svc-row` (+ `--img-last`) | columns, border + radius | image half + text half row; image first on phones |
| `<p>-media-stat` (+ `--sm`) | group around an Image block | image fills the column (480px / 340px min) |
| `<p>-stat-badge` | stack after the image inside `<p>-media-stat` | white stat card over the image corner |
| `<p>-timeline` | grid group, blockGap `'0px'` | top line with dots; vertical list below 1024px |
| `<p>-tier` (+ `--dark`) | flex column card | pricing tier card (badge, ticks, button at bottom) |

### Lists and tables
| Class | Block | Does |
|---|---|---|
| `is-style-ts-plain <p>-checks` | list | two columns of filled check circles (one column on tablets) |
| `is-style-ts-plain <p>-ticks` | list | single column of check marks (pricing) |
| `<p>-compare` | table | comparison table: cream header, check in the last column, scrolls on phones |

### FAQ
| Class | Block | Does |
|---|---|---|
| `<p>-faq` | group of `core/details` | bordered accordion with +/- icon |
| `+ <p>-faq--circle` | | +/- inside round buttons |
| `<p>-faq-page` (on the columns), `<p>-faq-group` (each category, with `anchor: faq-<id>`), `<p>-topics` / `<p>-topic` (+ `is-active`) / `<p>-topic__label` / `<p>-topic__count`, `<p>-faq-aside`, `<p>-faq-empty`, `<p>-faq-search` (search block), `<p>-faq-pick` (popular buttons), `<p>-faq-clear` | FAQ page | live search + topic filter, driven by `assets/js/faq.js`, which loads only on pages containing `<p>-faq-page`. Copy the structure from `examples/travel-royale/faq.mjs` exactly. |

### Forms (Contact Form 7)
`<p>-cf7` on the group around the shortcode block (`<p>-cf7--consult` for a compact form). Inside the CF7 form markup: `<p>-cf7-fieldset`, `<p>-cf7-grid--2` / `--4`, `<p>-field`, `<p>-cf7-label`, `<p>-opt`, `<p>-pills` (+ `--method`, `--check`, `--tiles`, `--slots`, `--call`), `<p>-cf7-head`, `<p>-cf7-footer`, `<p>-cf7-consent`, `<p>-cf7-note`, `<p>-cf7-submit` (+ `--send`, `--arrow`). See child-theme.md for a complete form.

### Header and footer
`<p>-header`, `<p>-header-nav` (navigation block), `<p>-header-phone` (paragraph with `ts-hide-mobile`), `<p>-header-cta` (buttons), `<p>-footer`. The header CSS handles: transparent header over a first-block cover (body class `<slug>-overlay-header`), hamburger below 1200px with the button before it, white logo on the transparent header through an SVG filter. Keep these class names when rebuilding the parts.

## Adding a component

1. Check this list and the examples first.
2. Build it from core blocks with one class on the outer block; style children through that class.
3. CSS at the end of the child `style.css` under a `/* --- <Page> page components --- */` heading. Use the token colors (`#625d55` style hex of the theme, the parent's `var(--wp--preset--color--primary)` etc.), not new colors.
4. Include its tablet and phone rules in the same edit.
5. If it needs an icon, generate it with icons.mjs.
6. Interactive behavior: a small vanilla JS file in `assets/js/`, enqueued only when the page content contains the component's class (see the faq.js enqueue in `inc/theme-setup.php`). Without JS the markup must still make sense.
