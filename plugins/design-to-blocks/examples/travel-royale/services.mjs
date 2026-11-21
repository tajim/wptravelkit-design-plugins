// Example page script: the Travel Royale Services page (approved and shipped as a pattern).
// Build it:  node <plugin>/scripts/build-page.mjs <plugin>/examples/travel-royale/services.mjs --out <folder>
// (tokens.mjs next to this file is picked up automatically). New pages follow the same shape.
export default function build(kit) {
const p = kit.prefix; // theme class prefix, e.g. tr-icon-tile
const { c, F, SP, pad, linkEl, P, muted, H, eyebrow, h2, stack, grid, section, wide, pillButton, ctaBand, pexels: PX } = kit;
const { muted: MUTED, cream: CREAM, rule: RULE, control: CONTROL, heroSub: HERO_SUB, darkEyebrow: DARK_EYEBROW, darkText: DARK_TEXT, darkMuted: DARK_MUTED } = kit.K;



const mutedP = (text, size = F.s17, lh = '1.6', extra = {}) => P(text, { ...extra, style: { color: { text: MUTED }, typography: { fontSize: size, lineHeight: lh } } });
const twoCol = (left, right, opts = {}) => c('core/columns', {
  align: opts.align, verticalAlignment: opts.v || 'center',
  style: { spacing: { blockGap: { left: opts.gap || '64px' } } },
}, [c('core/column', { width: opts.lw || '41.66%' }, left), c('core/column', { width: opts.rw || '58.33%' }, right)]);
const list = (items, className, style) => c('core/list', { className: `is-style-ts-plain ${className}`, ...(style ? { style } : {}) }, items.map((t) => c('core/list-item', { content: t })));
const arrowBtn = (text, href = '#', kind = 'primary', extra = {}) => c('core/buttons', extra.wrap || {}, [
  pillButton(text, href, kind, { size: F.s15, py: '13px', px: '22px', attrs: { className: `${p}-btn-arrow`, ...(extra.attrs || {}) } }),
]);

// Data --------------------------------------------------------------------------
const services = [
  { id: 'flights', icon: 'plane-takeoff', name: 'Flights', alt: 'Leather seats in a private jet cabin',
    short: 'First and business class, private jets and seaplanes, booked around your plans.',
    headline: 'The right seat, on the right flight, every time.',
    body: 'We compare fares across airlines and private operators, hold premium seats before they sell out, and connect every flight to the rest of your trip. If a flight changes, we know before you do.',
    points: ['First &amp; business class on all major carriers', 'Private jet and charter quotes within hours', 'Floatplanes and helicopter transfers', 'Lounge access and fast-track security', 'Seat selection and special meals', 'Live flight monitoring and rebooking'],
    statValue: '2 hrs', statLabel: 'average charter quote time', cta: 'Request flights', note: 'Domestic, transborder and international departures.' },
  { id: 'hotels', icon: 'building-2', name: 'Hotels', alt: 'A luxury hotel suite',
    short: 'Suites, lodges and private villas we have stayed in, with perks you can’t get booking direct.',
    headline: 'Hotels we know, with perks you won’t get online.',
    body: 'From grand city hotels to fly-in wilderness lodges, we only book places our team has inspected. Partner rates come with upgrades, breakfast and credits, and we choose the room, not just the hotel.',
    points: ['900+ partner hotels and lodges', 'Room upgrade on arrival when available', 'Daily breakfast for two', '$100 hotel credit per stay', 'Early check-in and late checkout', 'Private villas and whole-lodge buyouts'],
    statValue: '900+', statLabel: 'partner hotels across North America', cta: 'Find the right hotel', note: 'Same rate as booking direct, with more included.' },
  { id: 'cars', icon: 'car', name: 'Car rental', alt: 'A luxury SUV on a mountain road',
    short: 'Premium cars, SUVs and convertibles, delivered where you need them.',
    headline: 'Premium cars, ready when you land.',
    body: 'A convertible for Highway 1, a 4x4 for the Rockies in winter, or an electric SUV for New England. We arrange premium rentals with full insurance, delivered to your hotel or waiting at the airport.',
    points: ['Luxury sedans, SUVs and convertibles', 'Delivery to your hotel or airport', 'Winter tires and 4x4 in snow season', 'One-way and cross-border rentals', 'Full coverage included', 'Scenic route notes for every drive'],
    statValue: '40+', statLabel: 'pickup locations in the US &amp; Canada', cta: 'Arrange a car', note: 'Chauffeur alternatives available on every route.' },
  { id: 'insurance', icon: 'shield-check', name: 'Travel insurance', alt: 'A couple sitting by a mountain lake',
    short: 'Cover for cancellation, medical care and delays, chosen for your trip.',
    headline: 'Travel with complete peace of mind.',
    body: 'We recommend cover that fits your trip and your health, explain it in plain words, and help you claim if something goes wrong. Cancel-for-any-reason and premium medical plans are available.',
    points: ['Trip cancellation and interruption', 'Emergency medical and evacuation', 'Cancel-for-any-reason options', 'Baggage and delay cover', 'Pre-existing condition waivers', 'Help filing any claim'],
    statValue: '100%', statLabel: 'claims support from our team', cta: 'Get an insurance quote', note: 'Policies issued by licensed third-party insurers.' },
  { id: 'experiences', icon: 'sparkles', name: 'Curated experiences', alt: 'A helicopter flying near rocky mountains',
    short: 'Private guides, heli-tours, chef’s tables and access that is hard to book alone.',
    headline: 'Moments you couldn’t book on your own.',
    body: 'A glacier landing at sunrise, a winemaker’s private cellar, a naturalist who knows where the bears are this week. We design experiences around your interests and book them with people we trust.',
    points: ['Helicopter and floatplane tours', 'Private guides and naturalists', 'Wine, food and chef’s tables', 'After-hours museum and park access', 'Wildlife viewing with experts', 'Proposals and celebrations'],
    statValue: '350+', statLabel: 'vetted guides and partners', cta: 'Explore experiences', note: 'Add to any trip, or book on their own.' },
  { id: 'logistics', icon: 'route', name: 'Travel logistics', alt: 'A chauffeur opening a car door',
    short: 'Transfers, rail, luggage, timing and paperwork, all planned and connected.',
    headline: 'Every connection, planned and timed.',
    body: 'The parts that make a trip tiring are the ones we handle best. Chauffeured transfers, luxury rail, luggage forwarding, border paperwork and timing between every stop, all on one itinerary.',
    points: ['Chauffeured transfers and meet &amp; greet', 'Luxury rail and ferry bookings', 'Luggage forwarding between hotels', 'ETA, eTA and border guidance', 'Printed travel book and mobile app', 'Group and family coordination'],
    statValue: '1', statLabel: 'itinerary for your whole trip', cta: 'Plan the logistics', note: 'Works for trips you have partly booked yourself.' },
  { id: 'concierge', icon: 'headset', name: '24/7 Concierge', alt: 'A concierge at a luxury hotel desk',
    short: 'A real person who knows your trip, day or night, before and during travel.',
    headline: 'A real person, any hour, who knows your trip.',
    body: 'From the day you book until you are home, one call or message reaches our concierge team. Last-minute tables, a changed flight, a forgotten passport: we fix it, often before you notice.',
    points: ['24/7 phone, text and WhatsApp', 'Restaurant and event reservations', 'Real-time rebooking when plans change', 'Weather and closure alerts', 'Gifts, flowers and special requests', 'Average reply under 10 minutes'],
    statValue: '&lt; 10 min', statLabel: 'average response, day or night', cta: 'Meet the concierge', note: 'Included with every trip we plan.' },
];

// 1. Hero ----------------------------------------------------------------------
const chip = (s) => c('core/button', {
  text: s.name, url: `#svc-${s.id}`, className: `${p}-chip ts-icon--${s.icon}`, textColor: 'base',
  style: {
    color: { background: 'rgba(0,0,0,0.25)' },
    border: { radius: '999px', width: '1px', color: 'rgba(255,255,255,0.6)' },
    spacing: { padding: { top: '10px', bottom: '10px', left: '16px', right: '16px' } },
    typography: { fontSize: F.s15, fontWeight: '500' },
  },
});
const hero = c('core/cover', {
  url: PX(31753574, 2000), alt: '', dimRatio: 100, isUserOverlayColor: true, isDark: true,
  customGradient: 'linear-gradient(90deg,rgba(16,18,20,0.8) 0%,rgba(16,18,20,0.45) 60%,rgba(16,18,20,0.15) 100%),linear-gradient(180deg,rgba(16,18,20,0.45) 0%,rgba(16,18,20,0) 30%,rgba(16,18,20,0.35) 100%)',
  minHeight: 640, minHeightUnit: 'px', align: 'full',
  style: { spacing: { padding: { top: '136px', bottom: SP.s72, left: 'var(--wp--style--root--padding-left)', right: 'var(--wp--style--root--padding-right)' }, margin: { top: '0', bottom: '0' } } },
  layout: { type: 'constrained', contentSize: '1344px' },
}, [
  stack('20px', [
    P('<a href="/">Home</a> › Services', { style: { color: { text: HERO_SUB }, typography: { fontSize: F.sm }, ...linkEl(HERO_SUB) } }),
    H('Everything your trip needs, handled by one team.', 1, { textColor: 'base', style: { typography: { fontSize: 'clamp(2.5rem, 1.5rem + 3vw, 3.75rem)', fontWeight: '700', letterSpacing: '-0.025em', lineHeight: '1.08' } } }),
    P('Flights, hotels, cars, insurance, experiences and every transfer in between, joined into one itinerary and looked after around the clock.', { style: { color: { text: HERO_SUB }, typography: { fontSize: F.s19, lineHeight: '1.55' } } }),
    c('core/buttons', { style: { spacing: { blockGap: '8px', margin: { top: '10px' } } }, layout: { type: 'flex', flexWrap: 'wrap' } }, services.map(chip)),
  ], { layout: { type: 'constrained', contentSize: '980px', justifyContent: 'left' } }),
]);

// 2. Overview grid --------------------------------------------------------------
const overviewCard = (s) => c('core/group', {
  style: { color: { background: CREAM }, border: { radius: '16px', width: '1px', color: RULE }, spacing: { padding: { top: '24px', bottom: '24px', left: '24px', right: '24px' }, blockGap: '12px' } },
  layout: { type: 'flex', orientation: 'vertical', flexWrap: 'nowrap' },
}, [
  P(s.name, { className: `${p}-icon-tile ${p}-icon-tile--lg ts-icon--${s.icon}`, style: { typography: { fontSize: F.s19, fontWeight: '600' } } }),
  mutedP(s.short, F.s15, '1.5', { style: { layout: { selfStretch: 'fill' } } }),
  P(`<a href="#svc-${s.id}">Learn more</a>`, { className: `${p}-more-down`, style: { typography: { fontSize: F.s15, fontWeight: '500' }, ...linkEl() } }),
]);
// mutedP spreads extra before style, so set the flex-grow directly.
const fixGrow = (card) => { card.innerBlocks[1].attributes.style.layout = { selfStretch: 'fill' }; return card; };
const helpCard = c('core/group', {
  backgroundColor: 'secondary', textColor: 'base',
  style: { border: { radius: '16px' }, spacing: { padding: { top: '24px', bottom: '24px', left: '24px', right: '24px' }, blockGap: '16px' } },
  layout: { type: 'flex', orientation: 'vertical', justifyContent: 'stretch', flexWrap: 'nowrap' },
}, [
  stack('8px', [
    P('Not sure what you need?', { style: { typography: { fontSize: F.s19, fontWeight: '600' } } }),
    P('Tell us about the trip. We’ll suggest the right mix of services.', { style: { color: { text: DARK_MUTED }, typography: { fontSize: F.s15, lineHeight: '1.5' } } }),
  ], { style: { layout: { selfStretch: 'fill' } } }),
  c('core/buttons', {}, [pillButton('Talk to a designer', '#', 'white', { size: F.s15, py: '13px', attrs: { width: 100, className: `${p}-btn-arrow` } })]),
]);
const overview = section([
  wide([
    twoCol([stack('8px', [eyebrow('What we take care of'), h2('Seven services, one point of contact')])],
      [mutedP('Book a single service or the whole journey. Either way, your travel designer coordinates every piece so nothing falls between the gaps.', F.s17, '1.55')], { v: 'bottom' }),
    grid(4, '14rem', '16px', [...services.map((s) => fixGrow(overviewCard(s))), helpCard], { className: `${p}-grid-2x2` }),
  ], { style: { spacing: { blockGap: '36px' } } }),
], pad(SP.s96, SP.s72));

// 3. Service detail rows ----------------------------------------------------------
const mediaCol = (s) => c('core/column', { width: '50%', className: `${p}-svc-media` }, [
  c('core/group', { className: `${p}-media-stat`, layout: { type: 'default' } }, [
    c('core/image', { url: kit.placeholder('landscape'), alt: s.alt, scale: 'cover', sizeSlug: 'large', linkDestination: 'none' }),
    stack('2px', [
      P(s.statValue, { textColor: 'primary', style: { typography: { fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.2' } } }),
      muted(s.statLabel),
    ], { className: `${p}-stat-badge`, backgroundColor: 'base', style: { border: { radius: '14px' }, shadow: 'var:preset|shadow|md', spacing: { padding: { top: '16px', bottom: '16px', left: '20px', right: '20px' } } } }),
  ]),
]);
const textCol = (s, i) => c('core/column', {
  width: '50%', verticalAlignment: 'center',
  style: { spacing: { padding: { top: 'clamp(1.5rem, 4vw, 3.5rem)', bottom: 'clamp(1.5rem, 4vw, 3.5rem)', left: 'clamp(1.25rem, 4vw, 3.5rem)', right: 'clamp(1.25rem, 4vw, 3.5rem)' }, blockGap: '16px' } },
}, [
  P(`0${i + 1} · ${s.name}`, { className: `${p}-icon-label ts-icon--${s.icon}`, style: { color: { text: MUTED }, typography: { fontSize: F.sm, fontWeight: '600' } } }),
  H(s.headline, 3, { style: { typography: { fontSize: 'clamp(1.5rem, 1.2rem + 1vw, 2rem)', fontWeight: '700', letterSpacing: '-0.015em', lineHeight: '1.2' } } }),
  mutedP(s.body, F.s17, '1.6'),
  list(s.points, `${p}-checks`, { spacing: { margin: { top: '24px' } } }),
  c('core/group', {
    style: { border: { top: { color: RULE, width: '1px' } }, spacing: { padding: { top: '20px' }, margin: { top: '12px' }, blockGap: '20px' } },
    layout: { type: 'flex', flexWrap: 'wrap', verticalAlignment: 'center' },
  }, [arrowBtn(s.cta), muted(s.note)]),
]);
const svcRow = (s, i) => c('core/columns', {
  anchor: `svc-${s.id}`, className: `${p}-svc-row${i % 2 ? ` ${p}-svc-row--img-last` : ''}`, backgroundColor: 'base',
  style: { border: { radius: '20px', width: '1px', color: RULE }, spacing: { blockGap: { left: '0px' } } },
}, i % 2 ? [textCol(s, i), mediaCol(s)] : [mediaCol(s), textCol(s, i)]);
const details = section([wide(services.map(svcRow), { style: { spacing: { blockGap: '24px' } } })], pad('24px', SP.s96));

// 4. One day, seven services (dark) -------------------------------------------------
const day = [
  ['7:40', 'route', 'Travel logistics', 'Driver at your door', 'A chauffeur collects you and your luggage for the airport. Bags are tagged straight through.'],
  ['9:10', 'plane-takeoff', 'Flights', 'Business class to Calgary', 'Seats chosen on the mountain side. Lounge and fast-track security included.'],
  ['12:30', 'car', 'Car rental', 'Your SUV is waiting', 'Winter tires fitted, route to Banff loaded, picnic stop marked on the map.'],
  ['15:00', 'building-2', 'Hotels', 'Early check-in, upgraded suite', 'Lake-view suite ready early. Breakfast and a $100 credit added to your stay.'],
  ['17:30', 'sparkles', 'Curated experiences', 'Heli-picnic on a ridge', 'A private 45-minute flight to a ridge picnic above the Bow Valley.'],
  ['20:15', 'headset', '24/7 Concierge', 'Dinner moved, no fuss', 'Rain on the patio. The concierge moves your table inside and lets you know by text.'],
  ['All day', 'shield-check', 'Travel insurance', 'Covered from door to door', 'Cancellation, medical and delay cover active throughout, with claims support if needed.'],
];
const dayRow = ([time, icon, svc, title, text]) => c('core/group', {
  style: { border: { top: { color: 'rgba(255,255,255,0.14)', width: '1px' } }, spacing: { padding: { top: '18px', bottom: '18px' }, blockGap: '16px' } },
  layout: { type: 'flex', flexWrap: 'nowrap', verticalAlignment: 'top' },
}, [
  P(time, { style: { layout: { selfStretch: 'fixed', flexSize: '80px' }, spacing: { padding: { top: '10px' } }, typography: { fontSize: '1rem', fontWeight: '600' } } }),
  stack('4px', [
    P(svc, { style: { color: { text: DARK_EYEBROW }, typography: { fontSize: F.xs, fontWeight: '600' } } }),
    P(title, { style: { typography: { fontSize: F.s17, fontWeight: '600' } } }),
    P(text, { style: { color: { text: DARK_MUTED }, typography: { fontSize: F.s15, lineHeight: '1.5' } } }),
  ], { className: `${p}-icon-side ${p}-icon-side--outline ts-icon--${icon}`, style: { layout: { selfStretch: 'fill' } } }),
]);
const tag = (s) => P(s.name, {
  className: `ts-icon ts-icon--${s.icon}`,
  style: { color: { text: HERO_SUB }, border: { radius: '999px', width: '1px', color: 'rgba(255,255,255,0.25)' }, spacing: { padding: { top: '6px', bottom: '6px', left: '12px', right: '12px' } }, typography: { fontSize: F.xs, fontWeight: '500' } },
});
const daySection = c('core/group', {
  align: 'full', className: 'is-style-ts-section-dark', backgroundColor: 'secondary', textColor: 'base',
  style: pad(SP.s96, SP.s96), layout: { type: 'constrained' },
}, [
  twoCol([stack('16px', [
    eyebrow('How it fits together', DARK_EYEBROW),
    h2('One day in the Rockies, seven services at work.'),
    P('A sample first day from our Canadian Rockies journey. You see a smooth day. Behind it, every service is lined up and watched in real time.', { style: { color: { text: DARK_TEXT }, typography: { fontSize: F.s18, lineHeight: '1.55' } } }),
    c('core/group', { style: { spacing: { blockGap: '8px', margin: { top: '16px' } } }, layout: { type: 'flex', flexWrap: 'wrap' } }, services.map(tag)),
  ])], [c('core/group', { style: { spacing: { blockGap: '0' } }, layout: { type: 'default' } }, day.map(dayRow))],
  { align: 'wide', v: 'top', gap: 'clamp(3rem, 6vw, 6rem)' }),
]);

// 5. Service levels ------------------------------------------------------------------
const tiers = [
  { name: 'Essentials', for: 'For travelers who know where they’re going and want it booked well.', price: 'No planning fee', note: 'Hotels, cars and insurance at partner rates', items: ['Hotel booking with partner perks', 'Car rental and transfers', 'Travel insurance quotes', '24/7 concierge during travel'], cta: 'Start with Essentials' },
  { name: 'Signature Journey', for: 'A fully designed trip, planned day by day with your travel designer.', price: 'From $500', note: 'Planning fee, credited back when you book', items: ['Everything in Essentials', 'Custom day-by-day itinerary', 'Flights, rail and private transfers', 'Curated experiences and private guides', 'Printed travel book and mobile app'], cta: 'Plan a Signature Journey', featured: true },
  { name: 'Private Client', for: 'For families and frequent travelers who want a dedicated designer all year.', price: 'By membership', note: 'Annual, limited places', items: ['Everything in Signature Journey', 'Named designer, all year round', 'Priority access to sold-out dates', 'Private jet and villa sourcing', 'Home-to-home logistics'], cta: 'Ask about membership' },
];
const tierCard = (t) => {
  const dark = !!t.featured;
  const line = dark ? 'rgba(255,255,255,0.14)' : RULE;
  const sub = dark ? DARK_MUTED : MUTED;
  return c('core/group', {
    className: `${p}-tier${dark ? ` ${p}-tier--dark` : ''}`,
    ...(dark ? { backgroundColor: 'secondary', textColor: 'base' } : { backgroundColor: 'base' }),
    style: {
      border: dark ? { radius: '20px' } : { radius: '20px', width: '1px', color: RULE },
      ...(dark ? { shadow: 'var:preset|shadow|lg' } : {}),
      spacing: { padding: { top: '36px', bottom: '36px', left: '32px', right: '32px' }, blockGap: '16px' },
    },
    layout: { type: 'flex', orientation: 'vertical', justifyContent: 'stretch', flexWrap: 'nowrap' },
  }, [
    ...(dark ? [P('Most chosen', { className: `${p}-badge`, backgroundColor: 'base', textColor: 'heading', style: { border: { radius: '999px' }, spacing: { padding: { top: '5px', bottom: '5px', left: '12px', right: '12px' } }, typography: { fontSize: F.xs, fontWeight: '600' } } })] : []),
    P(t.name, { style: { typography: { fontSize: '1.375rem', fontWeight: '700' } } }),
    P(t.for, { style: { color: { text: sub }, typography: { fontSize: F.s15, lineHeight: '1.5' } } }),
    stack('2px', [
      P(t.price, { style: { typography: { fontSize: '1.875rem', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.2' } } }),
      P(t.note, { style: { color: { text: sub }, typography: { fontSize: F.sm } } }),
    ], { style: { border: { top: { color: line, width: '1px' }, bottom: { color: line, width: '1px' } }, spacing: { padding: { top: '16px', bottom: '16px' } } } }),
    c('core/list', { className: `is-style-ts-plain ${p}-ticks`, style: { layout: { selfStretch: 'fill' } } }, t.items.map((x) => c('core/list-item', { content: x }))),
    c('core/buttons', { style: { spacing: { margin: { top: '8px' } } } }, [pillButton(t.cta, '#', dark ? 'white' : 'outline', { py: '15px', attrs: { width: 100 } })]),
  ]);
};
const levels = section([
  wide([
    stack('8px', [
      P('Ways to work with us', { textColor: 'primary', style: { typography: { fontSize: F.sm, fontWeight: '600', textAlign: 'center' } } }),
      H('Choose the level of care that suits you', 2, { style: { typography: { fontSize: F.h2, fontWeight: '700', letterSpacing: '-0.015em', lineHeight: '1.15', textAlign: 'center' } } }),
      P('Every level includes partner hotel perks and 24/7 support while you travel.', { style: { color: { text: MUTED }, typography: { fontSize: F.s17, lineHeight: '1.55', textAlign: 'center' } } }),
    ], { layout: { type: 'constrained', contentSize: '680px' } }),
    grid(3, '16rem', '20px', tiers.map(tierCard), { className: `${p}-grid-stack-tablet` }),
  ], { style: { spacing: { blockGap: '36px' } } }),
], pad(SP.s96, SP.s96), { backgroundColor: 'subtle' });

// 6. Getting started --------------------------------------------------------------------
const steps = [
  ['1', 'Tell us what you need', 'A short call or form. One service or the whole trip, it starts the same way.'],
  ['2', 'Get a clear proposal', 'Options and prices within 48 hours, with every inclusion spelled out.'],
  ['3', 'We book and confirm', 'All services on one itinerary and one confirmation, with a single payment schedule.'],
  ['4', 'Travel, fully supported', 'Your travel book, app and 24/7 concierge line from departure to return.'],
];
const started = section([
  wide([
    c('core/group', { style: { spacing: { blockGap: '32px' } }, layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', verticalAlignment: 'bottom' } }, [
      stack('8px', [eyebrow('Getting started'), h2('From first call to boarding pass')]),
      arrowBtn('Book a free consultation'),
    ]),
    grid(4, '14rem', '20px', steps.map(([n, t, d]) => stack('10px', [
      P(`Step ${n}`, { textColor: 'primary', style: { typography: { fontSize: F.sm, fontWeight: '600' } } }),
      P(t, { style: { typography: { fontSize: F.s19, fontWeight: '600' } } }),
      mutedP(d, F.s15, '1.55'),
    ], { style: { border: { top: { color: 'var:preset|color|primary', width: '2px' } }, spacing: { padding: { top: '20px' } } } })), { className: `${p}-grid-2x2` }),
  ], { style: { spacing: { blockGap: '36px' } } }),
], pad(SP.s96, SP.s96));

// 7. Testimonial ----------------------------------------------------------------------------
const testimonial = section([
  c('core/group', {
    align: 'wide', className: `${p}-quote-card ts-icon--quote`,
    style: { color: { background: CREAM }, border: { radius: '20px', width: '1px', color: RULE }, spacing: { padding: { top: 'clamp(2rem, 4vw, 3.5rem)', bottom: 'clamp(2rem, 4vw, 3.5rem)', left: 'clamp(1.5rem, 5vw, 4.5rem)', right: 'clamp(1.5rem, 5vw, 4.5rem)' }, blockGap: '40px' } },
    layout: { type: 'flex', flexWrap: 'nowrap', verticalAlignment: 'center' },
  }, [stack('16px', [
    P('A storm closed the Icefields Parkway on our second day. By the time we’d finished breakfast, the concierge had moved our hotel, rebooked the heli-tour and sent a new driver.', { style: { typography: { fontSize: 'clamp(1.25rem, 1rem + 0.8vw, 1.625rem)', fontWeight: '500', lineHeight: '1.4', letterSpacing: '-0.01em' } } }),
    P('<strong>Sample traveler</strong> · Canadian Rockies by Private Rail', { style: { color: { text: MUTED }, typography: { fontSize: F.s15 } } }),
  ], { style: { layout: { selfStretch: 'fill' } } })]),
], pad('0', SP.s96));

// 8. FAQ -----------------------------------------------------------------------------------------
const faqs = [
  ['Can I book just one service, like flights or a car?', 'Yes. Many clients start with a single booking. You still get your travel designer and the 24/7 concierge line for that part of your trip.'],
  ['Will I pay more than booking directly?', 'Hotel rates match what you would pay direct, and partner perks are added on top. Flights and cars are quoted at published or negotiated fares. Any planning fee is shown up front.'],
  ['Can you help with a trip I have already partly booked?', 'Often. Send us what you have. We can add hotels, transfers, experiences and concierge support around your existing bookings.'],
  ['How does the 24/7 concierge work?', 'Your itinerary includes a phone number, text and WhatsApp line staffed around the clock by our team. They can see your full trip and make changes on the spot.'],
  ['Which travel insurance do you use?', 'We work with several licensed insurers and recommend a policy based on your trip, age and needs. We explain the cover clearly before you buy.'],
];
const faqSection = section([
  twoCol([stack('12px', [
    eyebrow('Service questions'), h2('Before you book'),
    P('Something else? <a href="#">Ask a travel designer</a>.', { style: { color: { text: MUTED }, typography: { fontSize: F.s17, lineHeight: '1.55' }, ...linkEl() } }),
  ])], [c('core/group', { className: `${p}-faq`, style: { spacing: { blockGap: '0' } }, layout: { type: 'default' } },
    faqs.map(([q, a], i) => c('core/details', { summary: q, showContent: i === 0 }, [mutedP(a, '1rem', '1.6')])))],
  { align: 'wide', v: 'top' }),
], pad('0', SP.s96));

// 9. CTA ------------------------------------------------------------------------------------------
const cta = ctaBand({
  img: PX(2479615, 2000),
  card: { title: 'Speak with a travel designer', primary: ['Book a consultation', '#'], secondary: ['+1 (800) 555-0142', 'tel:+18005550142'] },
  title: 'One call. Every detail handled.',
  text: 'Tell us what you need, from a single flight to a three-week journey. A travel designer will reply within one business day.',
  note: 'Already traveling? Call the 24/7 concierge line on your itinerary.',
});

const page = [hero, overview, details, daySection, levels, started, testimonial, faqSection, cta];
return { slug: 'travel-royale-services-blocks', blocks: page };
}
