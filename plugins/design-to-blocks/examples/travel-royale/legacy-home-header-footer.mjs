// REFERENCE ONLY (does not run as-is): the original Travel Royale home page and header/footer
// generator, written before the kit existed. Read it for how the hero with trip search, the WPTE
// trips block, the bento destination grid, and parts/header.html + parts/footer.html were built.
// Travel Royale: homepage + header/footer parts, serialized with WordPress' own block save() code (WP 7.0 packages).
import 'global-jsdom/register';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
globalThis.window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
globalThis.matchMedia = globalThis.window.matchMedia;
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);

const B = require('@wordpress/blocks');
require('@wordpress/block-editor');
require('@wordpress/block-library').registerCoreBlocks();
const dyn = (name, attributes) => B.registerBlockType(name, { apiVersion: 3, title: name, category: 'widgets', attributes, save: () => null, edit: () => null });
dyn('wptravelengine/trip-search', { searchButtonLabel: { type: 'string' }, searchFormOrientation: { type: 'boolean' }, searchFilters: { type: 'object' }, layoutFilters: { type: 'object' } });
dyn('wptravelengine/trips', {
  showSectionHeading: { type: 'boolean' }, showSectionDescription: { type: 'boolean' }, layout: { type: 'string' }, tripsCountPerRow: { type: 'number' },
  cardlayout: { type: 'number' }, viewMoreButtonText: { type: 'string' }, excerptLength: { type: 'number' }, tripTitleHeadingLevel: { type: 'number' },
  filters: { type: 'object' }, layoutFilters: { type: 'object' },
});

const c = (name, attrs = {}, inner = []) => {
  const known = B.getBlockType(name)?.attributes || {};
  for (const k of Object.keys(attrs)) if (!(k in known)) throw new Error(`Unknown attribute "${k}" on ${name}`);
  return B.createBlock(name, attrs, inner);
};

// ---- Tokens ----
const MUTED = '#625d55';
const CREAM = '#faf8f4';
const RULE = '#e6e1d8';
const CONTROL = '#d6d0c5';
const HERO_SUB = '#e9ecee';
const DARK_EYEBROW = '#bccdc2';
const DARK_TEXT = '#c9ced1';
const DARK_MUTED = '#c3c8cc';
const PX = (id, w = 900) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
const F = { h2: 'clamp(2rem, 1.4rem + 1.6vw, 2.5rem)', h1: 'clamp(2.5rem, 1.5rem + 3.2vw, 4rem)', stat: 'clamp(1.75rem, 1.3rem + 1.2vw, 2.125rem)', sm: '0.875rem', xs: '0.8125rem', s15: '0.9375rem', s17: '1.0625rem', s18: '1.125rem', s19: '1.1875rem', s20: '1.25rem', s30: 'clamp(1.5rem, 1.1rem + 1.2vw, 1.875rem)', s44: 'clamp(2rem, 1.3rem + 2vw, 2.75rem)' };
const SP = { s24: '24px', s36: 'clamp(1.75rem, 3vw, 2.25rem)', s72: 'clamp(3rem, 6vw, 4.5rem)', s88: 'clamp(3.5rem, 7vw, 5.5rem)', s96: 'clamp(3.5rem, 7.5vw, 6rem)' };

const pad = (top, bottom, extra = {}) => ({ spacing: { padding: { top, bottom }, margin: { top: '0', bottom: '0' }, ...extra } });
const linkEl = (color = 'var:preset|color|primary') => ({ elements: { link: { color: { text: color }, typography: { textDecoration: 'none' } } } });

const P = (content, attrs = {}) => c('core/paragraph', { content, ...attrs });
const muted = (content, size = F.sm, extra = {}) => P(content, { style: { color: { text: MUTED }, typography: { fontSize: size } }, ...extra });
const H = (content, level, attrs = {}) => c('core/heading', { content, level, ...attrs });
const eyebrow = (text, color = 'primary') => P(text, { textColor: color === 'primary' ? 'primary' : undefined, style: { ...(color !== 'primary' ? { color: { text: color } } : {}), typography: { fontSize: F.sm, fontWeight: '600' } } });
const h2 = (text, extra = {}) => H(text, 2, { style: { typography: { fontSize: F.h2, fontWeight: '700', letterSpacing: '-0.015em', lineHeight: '1.15' } }, ...extra });
const group = (inner, attrs = {}) => c('core/group', { layout: { type: 'default' }, ...attrs }, inner);
const stack = (gap, inner, attrs = {}) => group(inner, { ...attrs, style: { ...(attrs.style || {}), spacing: { ...((attrs.style || {}).spacing || {}), blockGap: gap } } });
const row = (inner, opts = {}) => c('core/group', {
  style: { spacing: { blockGap: opts.gap || '16px' } },
  layout: { type: 'flex', flexWrap: opts.wrap || 'wrap', justifyContent: opts.justify || 'space-between', verticalAlignment: opts.align || 'center' },
  ...(opts.attrs || {}),
}, inner);
const grid = (cols, minW, gap, inner, attrs = {}) => c('core/group', { ...attrs, style: { ...(attrs.style || {}), spacing: { blockGap: gap } }, layout: { type: 'grid', columnCount: cols, minimumColumnWidth: minW } }, inner);
const section = (inner, style, attrs = {}) => c('core/group', { align: 'full', backgroundColor: 'base', style, layout: { type: 'constrained' }, ...attrs }, inner);
const wide = (inner, attrs = {}) => c('core/group', { align: 'wide', layout: { type: 'default' }, ...attrs }, inner);
const arrowLink = (text, href = '#', color = 'primary') => c('core/buttons', {}, [
  c('core/button', { text, url: href, className: 'is-style-ts-arrow', textColor: color, style: { typography: { fontSize: F.s15, fontWeight: '500' } } }),
]);
const pillButton = (text, href, kind = 'primary', extra = {}) => {
  const looks = {
    primary: { backgroundColor: 'primary', textColor: 'primary-inverse' },
    white: { backgroundColor: 'base', textColor: 'heading' },
    outline: { backgroundColor: 'base', textColor: 'heading', border: { width: '1px', color: CONTROL } },
  }[kind];
  const { border, ...colors } = looks;
  return c('core/button', {
    text, url: href, ...colors, ...extra.attrs,
    style: {
      border: { radius: '999px', ...(border || {}) },
      spacing: { padding: { top: extra.py || '14px', bottom: extra.py || '14px', left: extra.px || '24px', right: extra.px || '24px' } },
      typography: { fontSize: extra.size || '1rem', fontWeight: kind === 'outline' ? '500' : '600' },
    },
  });
};
const iconTile = (icon, title, size = F.s17) => P(title, { className: `tr-icon-tile ts-icon--${icon}`, style: { typography: { fontSize: size, fontWeight: '600' } } });

// =====================================================================
// 1. Hero
// =====================================================================
const searchFilters = {
  destination: { label: 'Destination', default: 'Rockies, Alaska, New York…', show: true, order: 1, icon: 'marker' },
  trip_types: { label: 'Travel style', default: 'Any', show: true, order: 2, icon: 'cycle' },
  activities: { label: 'Activity', default: 'Activity', show: false, order: 3, icon: 'cycle' },
  duration: { label: 'Length', default: 'Any length', show: true, order: 4, icon: 'duration' },
  price: { label: 'Budget', default: 'Any budget', show: true, order: 5, icon: 'money' },
};
const searchLayout = {
  showDropdownIcon: true, showIcons: true, showFilterLabels: true, showDestinations: true, showDateSelector: false,
  showActivities: false, showDurationRange: true, showPriceRange: true, showTitle: false, showSubtitle: false,
};
const trust = [
  ['star-filled', '<strong>4.9</strong> from 640+ traveler reviews'],
  ['shield-check', 'Licensed &amp; bonded seller of travel'],
  ['headset', '24/7 on-trip concierge'],
];
const hero = c('core/cover', {
  url: PX(2662116, 2000), alt: '',
  dimRatio: 100,
  customGradient: 'linear-gradient(90deg,rgba(16,18,20,0.72) 0%,rgba(16,18,20,0.35) 55%,rgba(16,18,20,0.1) 100%),linear-gradient(180deg,rgba(16,18,20,0.45) 0%,rgba(16,18,20,0) 30%,rgba(16,18,20,0.55) 100%)',
  isUserOverlayColor: true, isDark: true,
  minHeight: 760, minHeightUnit: 'px', contentPosition: 'center center',
  align: 'full',
  style: { spacing: { padding: { top: '140px', bottom: SP.s72, left: 'var(--wp--style--root--padding-left)', right: 'var(--wp--style--root--padding-right)' }, margin: { top: '0', bottom: '0' } } },
  layout: { type: 'constrained', contentSize: '1344px' },
}, [
  stack('22px', [
    P('Private journeys across the United States &amp; Canada', { className: 'ts-icon ts-icon--map', style: { color: { text: DARK_EYEBROW }, typography: { fontSize: F.s15, fontWeight: '500' } } }),
    H('North America, planned to the last detail.', 1, { textColor: 'base', style: { typography: { fontSize: F.h1, fontWeight: '700', letterSpacing: '-0.025em', lineHeight: '1.06' } } }),
    P('Tailor-made luxury trips from the Canadian Rockies to the Pacific Coast. One travel designer, every hotel, transfer and private guide arranged for you.', {
      style: { color: { text: HERO_SUB }, typography: { fontSize: F.s19, lineHeight: '1.55' } },
    }),
    group([c('wptravelengine/trip-search', { searchButtonLabel: 'Start planning', searchFormOrientation: true, searchFilters, layoutFilters: searchLayout })], {
      style: { spacing: { margin: { top: '14px' } } }, layout: { type: 'constrained', contentSize: '960px', justifyContent: 'left' },
    }),
    row(trust.map(([icon, text]) => P(text, { className: `ts-icon ts-icon--${icon}`, style: { color: { text: HERO_SUB }, typography: { fontSize: F.s15 } } })), { gap: '28px', justify: 'left', attrs: { style: { spacing: { blockGap: '28px', margin: { top: '6px' } } } } }),
  ], { layout: { type: 'constrained', contentSize: '820px', justifyContent: 'left' } }),
]);
// fix: the trust row helper overwrote style; rebuild explicitly
hero.innerBlocks[0].innerBlocks[4] = c('core/group', {
  style: { spacing: { blockGap: '28px', margin: { top: '6px' } } },
  layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'left', verticalAlignment: 'center' },
}, trust.map(([icon, text]) => P(text, { className: `ts-icon ts-icon--${icon}`, style: { color: { text: HERO_SUB }, typography: { fontSize: F.s15 } } })));

// =====================================================================
// 2. Stats band
// =====================================================================
const stats = [['20+ years', 'Planning North American travel'], ['3,400+', 'Private journeys arranged'], ['900+', 'Partner hotels and lodges'], ['24/7', 'Concierge while you travel']];
const statsBand = section([
  wide([grid(4, '14rem', '32px', stats.map(([v, l]) => stack('4px', [
    P(v, { style: { typography: { fontSize: F.stat, fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.2' } } }),
    muted(l, F.s15),
  ], { style: { border: { left: { color: 'var:preset|color|primary', width: '2px' } }, spacing: { padding: { left: '20px' } } } })), { className: 'tr-grid-2x2' })]),
], { ...pad(SP.s36, SP.s36), border: { bottom: { color: RULE, width: '1px' } } });

// =====================================================================
// 3. Signature destinations (bento)
// =====================================================================
const sectionHeader = (eb, title, right, sub) => c('core/group', {
  style: { spacing: { blockGap: '32px' } },
  layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', verticalAlignment: 'bottom' },
}, [
  stack('8px', [eyebrow(eb), h2(title), ...(sub ? [muted(sub, F.s17, { style: { color: { text: MUTED }, typography: { fontSize: F.s17, lineHeight: '1.55' } } })] : [])], { layout: { type: 'constrained', contentSize: '640px', justifyContent: 'left' } }),
  ...(right ? [right] : []),
]);

const destGradient = 'linear-gradient(180deg,rgba(16,18,20,0) 40%,rgba(16,18,20,0.78) 100%)';
const dests = [
  ['Napa &amp; Sonoma', 'California, USA', 11109505], ['Alaska', 'Inside Passage &amp; Denali', 6145279],
  ['New York City', 'New York, USA', 20847307], ['Maui', 'Hawaii, USA', 31181038],
  ['Québec City', 'Québec, Canada', 14644822], ['Big Sur', 'California, USA', 2479615],
  ['Whistler', 'British Columbia, Canada', 31753574], ['Jackson Hole', 'Wyoming, USA', 7005517],
];
const destTile = ([name, region, id]) => c('core/cover', {
  url: PX(id), alt: name.replace(/&amp;/g, '&'), dimRatio: 100, customGradient: destGradient, isUserOverlayColor: true, isDark: true,
  minHeight: 280, minHeightUnit: 'px', contentPosition: 'bottom left',
  style: { border: { radius: '16px' }, spacing: { padding: { top: '18px', bottom: '18px', left: '20px', right: '20px' } } },
  layout: { type: 'default' },
}, [stack('2px', [
  P(`<a href="#">${name}</a>`, { style: { typography: { fontSize: F.s19, fontWeight: '600' }, ...linkEl('var:preset|color|base') } }),
  P(region, { style: { color: { text: HERO_SUB }, typography: { fontSize: F.sm } } }),
])]);

const bigTile = c('core/cover', {
  url: PX(2662086, 1400), alt: 'Banff and Lake Louise, Alberta', dimRatio: 100, customGradient: 'linear-gradient(180deg,rgba(16,18,20,0) 45%,rgba(16,18,20,0.78) 100%)',
  isUserOverlayColor: true, isDark: true, minHeight: 280, minHeightUnit: 'px', contentPosition: 'bottom left',
  style: { border: { radius: '16px' }, spacing: { padding: { top: '26px', bottom: '26px', left: '28px', right: '28px' } }, layout: { columnSpan: 2, rowSpan: 2 } },
  layout: { type: 'default' },
}, [c('core/group', { style: { spacing: { blockGap: '16px' } }, layout: { type: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', verticalAlignment: 'bottom' } }, [
  stack('6px', [
    P('Most requested', { className: 'tr-pill', style: { color: { background: 'rgba(255,255,255,0.18)' }, border: { radius: '999px', width: '1px', color: 'rgba(255,255,255,0.4)' }, spacing: { padding: { top: '4px', bottom: '4px', left: '10px', right: '10px' } }, typography: { fontSize: F.xs, fontWeight: '600' } } }),
    P('<a href="#">Banff &amp; Lake Louise</a>', { style: { typography: { fontSize: F.s30, fontWeight: '700', letterSpacing: '-0.015em', lineHeight: '1.2' }, ...linkEl('var:preset|color|base') } }),
    P('Alberta, Canada · Glacier lakes, castle hotels, heli-hiking', { style: { color: { text: HERO_SUB }, typography: { fontSize: '1rem' } } }),
  ]),
  P('14 journeys', { style: { color: { text: HERO_SUB }, typography: { fontSize: F.s15 } } }),
])]);

const destinations = section([
  wide([
    sectionHeader('Signature destinations', 'Where our travelers go', arrowLink('All destinations')),
    grid(4, '14rem', '16px', [bigTile, ...dests.map(destTile)]),
  ], { style: { spacing: { blockGap: '28px' } } }),
], pad(SP.s88, SP.s24));

// =====================================================================
// 4. Curated journeys (WP Travel Engine trips)
// =====================================================================
const tripsBlock = c('wptravelengine/trips', {
  showSectionHeading: false, showSectionDescription: false, layout: 'grid', tripsCountPerRow: 3, cardlayout: 1, viewMoreButtonText: 'View journey', excerptLength: 20,
  filters: { tripsCount: 6, listby: 'latest', tax_relation: 'AND', terms: [], tripsToDisplay: [] },
  layoutFilters: {
    showFeaturedRibbon: true, showDescription: true, showFeaturedImage: true, showTitle: true, showPrice: true, showStrikedPrice: true,
    showPricingTypeLabel: true, showDuration: true, showLocation: true, showReviews: false, showDiscount: true, showActivities: false,
    showTripType: false, showGroupSize: false, showTripAvailableTime: false, showViewMoreButton: true, showViewAll: false,
  },
});
const journeys = section([
  wide([
    sectionHeader('Curated journeys', 'Start with an itinerary, then make it yours', null, 'Every journey is a starting point. Change the dates, hotels, pace and length with your travel designer.'),
    tripsBlock,
    c('core/buttons', { style: { spacing: { margin: { top: '8px' } } }, layout: { type: 'flex', justifyContent: 'center' } }, [pillButton('Browse all journeys', '#', 'outline', { size: F.s15, py: '13px' })]),
  ], { style: { spacing: { blockGap: '28px' } } }),
], pad(SP.s72, SP.s96));

// =====================================================================
// 5. Experiences
// =====================================================================
const experiences = [
  ['helicopter', 'Helicopters &amp; floatplanes', 'Glacier landings, heli-picnics and seaplane hops between islands.', 9334618],
  ['wine', 'Wine &amp; culinary', 'Private tastings in Napa and the Okanagan, chef’s tables, foraging.', 34723813],
  ['paw-print', 'Wildlife with experts', 'Grizzly viewing in BC, whale watching, wolf tracking in Yellowstone.', 1328414],
  ['house', 'Wilderness lodges', 'Fly-in and remote lodges with every meal and guide included.', 19737857],
  ['building-2', 'City suites &amp; culture', 'Top-floor suites, private museum hours, Broadway house seats.', 18285946],
  ['heart', 'Honeymoons &amp; milestones', 'Proposals, anniversaries and surprises we plan in quiet.', 5326969],
];
const expCard = ([icon, title, text, id]) => c('core/group', {
  backgroundColor: 'base',
  style: { border: { radius: '16px' }, spacing: { blockGap: '0' } },
  className: 'tr-media-card',
  layout: { type: 'flex', flexWrap: 'nowrap', verticalAlignment: 'stretch' },
}, [
  c('core/cover', { url: PX(id, 500), alt: '', dimRatio: 0, isUserOverlayColor: true, minHeight: 160, minHeightUnit: 'px', isDark: false, style: { layout: { selfStretch: 'fixed', flexSize: '160px' } }, layout: { type: 'default' } }),
  stack('8px', [iconTile(icon, title), muted(text, F.sm, { style: { color: { text: MUTED }, typography: { fontSize: F.sm, lineHeight: '1.5' } } })], {
    style: { spacing: { padding: { top: '20px', bottom: '20px', left: '20px', right: '20px' } }, layout: { selfStretch: 'fill' } },
  }),
]);
const experiencesSection = section([
  wide([
    c('core/columns', { verticalAlignment: 'bottom', style: { spacing: { blockGap: { left: '64px' } } } }, [
      c('core/column', { width: '41.66%' }, [stack('8px', [eyebrow('Ways to travel'), h2('Experiences we arrange every week')])]),
      c('core/column', { width: '58.33%' }, [muted('Private guides, after-hours access and the small things that are hard to book on your own. Add any of these to a journey.', F.s17, { style: { color: { text: MUTED }, typography: { fontSize: F.s17, lineHeight: '1.55' } } })]),
    ]),
    grid(3, '20rem', '20px', experiences.map(expCard)),
  ], { style: { spacing: { blockGap: '32px' } } }),
], pad(SP.s96, SP.s96), { backgroundColor: 'subtle' });

// =====================================================================
// 6. How we plan (dark)
// =====================================================================
const steps = [
  ['1', 'A conversation, not a form', 'A 30-minute call about how you like to travel, who is coming and what the trip is for.'],
  ['2', 'Your draft itinerary in 48 hours', 'Day-by-day plan with hotel options, a map and a clear price. Change anything you like.'],
  ['3', 'We book everything', 'Flights, suites, private transfers, guides and restaurant tables, all on one confirmation.'],
  ['4', 'Looked after on the road', 'A printed travel book, a mobile app and a 24/7 line to someone who knows your trip.'],
];
const stepRow = ([n, title, text]) => c('core/group', {
  style: { border: { top: { color: 'rgba(255,255,255,0.14)', width: '1px' } }, spacing: { padding: { top: '22px', bottom: '22px' }, blockGap: '20px' } },
  layout: { type: 'flex', flexWrap: 'nowrap', verticalAlignment: 'top' },
}, [
  P(n, { className: 'tr-num', style: { typography: { fontSize: '1rem', fontWeight: '600' } } }),
  stack('6px', [P(title, { style: { typography: { fontSize: F.s18, fontWeight: '600' } } }), P(text, { style: { color: { text: DARK_MUTED }, typography: { fontSize: F.s15, lineHeight: '1.55' } } })]),
]);
const designerCard = c('core/group', {
  backgroundColor: 'base', textColor: 'heading',
  style: { border: { radius: '14px' }, spacing: { padding: { top: '18px', bottom: '18px', left: '20px', right: '20px' }, blockGap: '14px' }, shadow: 'var:preset|shadow|lg' },
  layout: { type: 'flex', flexWrap: 'nowrap', verticalAlignment: 'center' },
}, [
  P('SM', { className: 'tr-avatar', backgroundColor: 'primary', textColor: 'primary-inverse', style: { typography: { fontWeight: '600' } } }),
  stack('2px', [P('Your own travel designer', { style: { typography: { fontSize: '1rem', fontWeight: '600' } } }), muted('One person plans, books and looks after your trip from first call to flight home.')]),
]);
const planSection = c('core/group', {
  align: 'full', className: 'is-style-ts-section-dark', backgroundColor: 'secondary', textColor: 'base',
  style: pad(SP.s96, SP.s96), layout: { type: 'constrained' },
}, [
  c('core/columns', { align: 'wide', verticalAlignment: 'center', style: { spacing: { blockGap: { left: 'clamp(3rem, 6vw, 6rem)' } } } }, [
    c('core/column', { width: '50%' }, [
      c('core/cover', {
        url: PX(7368300, 1200), alt: 'A travel designer planning a route on a map', dimRatio: 0, isUserOverlayColor: true, isDark: false, contentPosition: 'bottom center',
        style: { border: { radius: '16px' }, dimensions: { aspectRatio: '5/6' }, spacing: { padding: { top: '24px', bottom: '24px', left: '24px', right: '24px' } } },
        layout: { type: 'default' },
      }, [designerCard]),
    ]),
    c('core/column', { width: '50%' }, [
      stack('16px', [
        eyebrow('How we plan', DARK_EYEBROW),
        h2('From first call to safe return, in four steps.'),
        P('No call centers, no off-the-shelf tours. You talk to the same person the whole way through.', { style: { color: { text: DARK_TEXT }, typography: { fontSize: F.s18, lineHeight: '1.55' }, spacing: { margin: { bottom: '16px' } } } }),
        stack('0', steps.map(stepRow)),
        c('core/buttons', { style: { spacing: { margin: { top: '12px' } } } }, [pillButton('Book a free consultation', '#', 'white', { attrs: { className: 'is-style-ts-arrow-filled' } })]),
      ]),
    ]),
  ]),
]);
// is-style-ts-arrow-filled is not a registered style; keep the button plain
planSection.innerBlocks[0].innerBlocks[1].innerBlocks[0].innerBlocks[4] = c('core/buttons', { style: { spacing: { margin: { top: '12px' } } } }, [pillButton('Book a free consultation', '#', 'white')]);

// =====================================================================
// 7. Member perks
// =====================================================================
const perks = [
  ['arrow-big-up-dash', 'Room upgrade', 'On arrival, subject to availability.'],
  ['coffee', 'Daily breakfast for two', 'Included at most partner hotels.'],
  ['gift', '$100 hotel credit', 'For spa, dining or the bar, per stay.'],
  ['clock-4', 'Early in, late out', 'Early check-in and late checkout when possible.'],
  ['car', 'Private transfers', 'Met at arrivals by name, every time.'],
  ['headset', '24/7 on-trip help', 'A real person if plans change mid-trip.'],
];
const perkCard = ([icon, title, text]) => stack('10px', [iconTile(icon, title), muted(text, F.sm, { style: { color: { text: MUTED }, typography: { fontSize: F.sm, lineHeight: '1.5' } } })], {
  style: { color: { background: CREAM }, border: { radius: '16px', width: '1px', color: RULE }, spacing: { padding: { top: '22px', bottom: '22px', left: '22px', right: '22px' } } },
});
const perksSection = section([
  c('core/columns', { align: 'wide', style: { spacing: { blockGap: { left: '64px' } } } }, [
    c('core/column', { width: '41.66%' }, [stack('12px', [
      eyebrow('Booked through us'), h2('Same hotel. More included.'),
      muted('Our partnerships with 900+ luxury hotels and lodges across North America add perks you won’t get booking direct, at the same rate.', F.s17, { style: { color: { text: MUTED }, typography: { fontSize: F.s17, lineHeight: '1.55' } } }),
      arrowLink('See partner hotels'),
    ])]),
    c('core/column', { width: '58.33%' }, [grid(3, '12rem', '16px', perks.map(perkCard))]),
  ]),
], pad(SP.s96, '0'));

// =====================================================================
// 8. Testimonials
// =====================================================================
const reviews = [
  ['Every hotel, every driver, every dinner was exactly right. Lake Louise at sunrise from our balcony is something we will never forget.', 'Canadian Rockies by Private Rail'],
  ['Our flight was cancelled in Juneau and we had a new plan before we had even left the gate. That is what you pay for.', 'Alaska Glaciers &amp; Wilderness Lodges'],
  ['Three generations, eleven people, nine days, and not one thing we had to sort out ourselves.', 'Family trip, Maui &amp; Big Island'],
];
const reviewCard = ([quote, trip]) => stack('18px', [
  P('Rated 5 out of 5', { className: 'tr-stars', textColor: 'primary' }),
  P(`“${quote}”`, { style: { typography: { fontSize: F.s18, lineHeight: '1.55' } } }),
  c('core/group', {
    style: { border: { top: { color: RULE, width: '1px' } }, spacing: { padding: { top: '16px' }, blockGap: '12px' } },
    layout: { type: 'flex', flexWrap: 'nowrap', verticalAlignment: 'center' },
  }, [
    P('ST', { className: 'tr-avatar', backgroundColor: 'secondary', textColor: 'base', style: { typography: { fontSize: F.s15, fontWeight: '600' } } }),
    stack('2px', [P('Sample traveler', { style: { typography: { fontSize: F.s15, fontWeight: '600' } } }), muted(trip)]),
  ]),
], { style: { color: { background: CREAM }, border: { radius: '16px', width: '1px', color: RULE }, spacing: { padding: { top: '28px', bottom: '28px', left: '28px', right: '28px' } } } });
const testimonials = section([
  wide([
    sectionHeader('Traveler stories', 'What our travelers say', P('<strong>4.9 / 5</strong> average from 640+ reviews', { className: 'ts-icon ts-icon--star-filled', style: { color: { text: MUTED }, typography: { fontSize: F.s15 } } })),
    grid(3, '18rem', '24px', reviews.map(reviewCard)),
  ], { style: { spacing: { blockGap: '28px' } } }),
], pad(SP.s96, SP.s96));

// =====================================================================
// 9. Journal (latest posts)
// =====================================================================
const journal = section([
  wide([
    c('core/group', { layout: { type: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', verticalAlignment: 'bottom' } }, [
      H('From the journal', 2, { style: { typography: { fontSize: '1.375rem', fontWeight: '600' } } }),
      P('<a href="#">All articles</a>', { style: { typography: { fontSize: F.s15, fontWeight: '500' }, ...linkEl() } }),
    ]),
    c('core/query', { queryId: 1, query: { perPage: 3, pages: 0, offset: 0, postType: 'post', order: 'desc', orderBy: 'date', author: '', search: '', exclude: [], sticky: 'exclude', inherit: false } }, [
      c('core/post-template', { style: { spacing: { blockGap: '24px' } }, layout: { type: 'grid', columnCount: 3, minimumColumnWidth: '18rem' } }, [
        c('core/post-featured-image', { isLink: true, aspectRatio: '16/9', style: { border: { radius: '14px' } } }),
        c('core/post-title', { isLink: true, level: 3, style: { typography: { fontSize: F.s17, fontWeight: '600', lineHeight: '1.35' }, spacing: { margin: { top: '12px' } }, ...linkEl('var:preset|color|heading') } }),
        c('core/post-date', { style: { color: { text: MUTED }, typography: { fontSize: F.sm }, spacing: { margin: { top: '6px' } } } }),
      ]),
      c('core/query-no-results', {}, [muted('Journal posts will appear here once you publish them.')]),
    ]),
  ], { style: { spacing: { blockGap: '20px' } } }),
], pad('0', SP.s96));

// =====================================================================
// 10. Consultation CTA
// =====================================================================
const ctaCard = stack('14px', [
  P('Speak with a travel designer', { style: { typography: { fontSize: F.s18, fontWeight: '600' } } }),
  c('core/buttons', { style: { spacing: { blockGap: '10px' } }, layout: { type: 'flex', orientation: 'vertical', justifyContent: 'stretch' } }, [
    pillButton('Book a consultation', '#', 'primary', { attrs: { width: 100 } }),
    pillButton('+1 (800) 555-0142', 'tel:+18005550142', 'outline', { attrs: { width: 100 } }),
  ]),
  P('Mon–Sat, 8am–8pm ET · Replies within one business day', { style: { color: { text: MUTED }, typography: { fontSize: F.sm, textAlign: 'center' } } }),
], { backgroundColor: 'base', textColor: 'heading', style: { border: { radius: '16px' }, spacing: { padding: { top: '28px', bottom: '28px', left: '28px', right: '28px' } } } });
const cta = section([
  c('core/cover', {
    url: PX(7005517, 2000), alt: '', dimRatio: 100, isUserOverlayColor: true, isDark: true, align: 'wide',
    customGradient: 'linear-gradient(90deg,rgba(16,18,20,0.8) 0%,rgba(16,18,20,0.45) 60%,rgba(16,18,20,0.2) 100%)',
    style: { border: { radius: '20px' }, spacing: { padding: { top: SP.s72, bottom: SP.s72, left: 'clamp(1.5rem, 4.5vw, 4rem)', right: 'clamp(1.5rem, 4.5vw, 4rem)' } } },
    layout: { type: 'default' },
  }, [
    c('core/columns', { verticalAlignment: 'center', style: { spacing: { blockGap: { left: '48px' } } } }, [
      c('core/column', { width: '58.33%' }, [stack('14px', [
        H('Tell us where you’re dreaming of. We’ll handle the rest.', 2, { textColor: 'base', style: { typography: { fontSize: F.s44, fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.12' } } }),
        P('A 30-minute call with a travel designer. No cost, no obligation. You’ll get a draft itinerary within 48 hours.', { style: { color: { text: HERO_SUB }, typography: { fontSize: F.s18, lineHeight: '1.55' } } }),
      ])]),
      c('core/column', { width: '41.66%' }, [ctaCard]),
    ]),
  ]),
], pad('0', SP.s96));

// =====================================================================
// Header + footer template parts
// =====================================================================
const header = c('core/group', {
  align: 'full', className: 'tr-header',
  style: { spacing: { padding: { top: '20px', bottom: '20px' } } },
  layout: { type: 'constrained' },
}, [
  c('core/group', { align: 'wide', style: { spacing: { blockGap: '24px' } }, layout: { type: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', verticalAlignment: 'center' } }, [
    c('core/group', { style: { spacing: { blockGap: '10px' } }, layout: { type: 'flex', flexWrap: 'nowrap', verticalAlignment: 'center' } }, [
      c('core/site-logo', { width: 32, shouldSyncIcon: true }),
      c('core/site-title', { level: 0, style: { typography: { fontSize: F.s18, fontWeight: '700', letterSpacing: '-0.01em' }, elements: { link: { typography: { textDecoration: 'none' } } } } }),
    ]),
    c('core/navigation', { overlayMenu: 'mobile', className: 'tr-header-nav', style: { typography: { fontSize: F.s15, fontWeight: '500' }, spacing: { blockGap: '32px' } }, layout: { type: 'flex', justifyContent: 'center' } }),
    c('core/group', { style: { spacing: { blockGap: '20px' } }, layout: { type: 'flex', flexWrap: 'nowrap', verticalAlignment: 'center' } }, [
      P('<a href="tel:+18005550142">+1 (800) 555-0142</a>', { className: 'ts-icon ts-icon--phone ts-hide-mobile tr-header-phone', style: { typography: { fontSize: F.s15, fontWeight: '500' } } }),
      c('core/buttons', { className: 'tr-header-cta' }, [pillButton('Plan my trip', '#', 'primary', { size: F.s15, py: '11px', px: '20px' })]),
    ]),
  ]),
]);

const footerCols = [
  ['Destinations', ['Canadian Rockies', 'Alaska', 'California', 'New York City', 'Hawaii', 'Québec &amp; Maritimes']],
  ['Journeys', ['Rail journeys', 'Road trips', 'Honeymoons', 'Family travel', 'Winter &amp; ski']],
  ['Plan', ['Book a consultation', 'How we plan', 'Partner hotels', 'Travel insurance', 'FAQs']],
  ['Company', ['About us', 'Our travel designers', 'Journal', 'Contact', 'Privacy', 'Terms']],
];
const footerList = (items) => c('core/list', { className: 'is-style-ts-plain', style: { spacing: { blockGap: '10px' }, typography: { fontSize: F.sm } } }, items.map((t) => c('core/list-item', { content: `<a href="#">${t}</a>` })));
const footer = c('core/group', {
  align: 'full', className: 'tr-footer',
  style: { color: { background: '#f7f7f7' }, border: { top: { color: RULE, width: '1px' } }, spacing: { padding: { top: '56px', bottom: '32px' }, margin: { top: '0' } } },
  layout: { type: 'constrained' },
}, [
  c('core/columns', { align: 'wide', style: { spacing: { blockGap: { left: '32px' } } } }, [
    c('core/column', { width: '30%' }, [stack('14px', [
      c('core/group', { style: { spacing: { blockGap: '10px' } }, layout: { type: 'flex', flexWrap: 'nowrap', verticalAlignment: 'center' } }, [
        c('core/site-logo', { width: 28 }),
        c('core/site-title', { level: 0, style: { typography: { fontSize: '1rem', fontWeight: '700' }, elements: { link: { color: { text: 'var:preset|color|heading' }, typography: { textDecoration: 'none' } } } } }),
      ]),
      c('core/site-tagline', { style: { color: { text: MUTED }, typography: { fontSize: F.sm, lineHeight: '1.5' } } }),
    ])]),
    ...footerCols.map(([title, links]) => c('core/column', {}, [stack('10px', [P(title, { style: { typography: { fontSize: F.sm, fontWeight: '600' } } }), footerList(links)])])),
  ]),
  c('core/group', {
    align: 'wide',
    style: { border: { top: { color: RULE, width: '1px' } }, spacing: { padding: { top: '24px' }, margin: { top: '48px' }, blockGap: '24px' } },
    layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', verticalAlignment: 'center' },
  }, [
    c('core/group', { style: { spacing: { blockGap: '24px' } }, layout: { type: 'flex', flexWrap: 'wrap', verticalAlignment: 'center' } }, [
      c('core/group', { style: { spacing: { blockGap: '6px' } }, layout: { type: 'flex', flexWrap: 'nowrap', verticalAlignment: 'center' } }, [
        muted('©'),
        c('core/site-title', { level: 0, isLink: false, style: { color: { text: MUTED }, typography: { fontSize: F.sm, fontWeight: '400' } } }),
      ]),
      muted('Licensed &amp; bonded seller of travel'),
    ]),
    c('core/social-links', { iconColor: 'heading', iconColorValue: '#1c1b19', size: 'has-small-icon-size', className: 'is-style-logos-only tr-social', layout: { type: 'flex', flexWrap: 'nowrap' } }, [
      c('core/social-link', { url: '#', service: 'instagram' }),
      c('core/social-link', { url: '#', service: 'facebook' }),
      c('core/social-link', { url: '#', service: 'pinterest' }),
    ]),
  ]),
]);

// ---- Serialize ----
const outDir = process.argv[2] || '.';
const home = [hero, statsBand, destinations, journeys, experiencesSection, planSection, perksSection, testimonials, journal, cta];
fs.writeFileSync(`${outDir}/travel-royale-home-blocks.txt`, home.map((b) => B.serialize(b)).join('\n\n') + '\n');
fs.writeFileSync(`${outDir}/header.html`, B.serialize(header) + '\n');
fs.writeFileSync(`${outDir}/footer.html`, B.serialize(footer) + '\n');
console.log('ok');
