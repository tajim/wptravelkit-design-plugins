// Example page script: the Travel Royale About page (approved and shipped as a pattern).
// Build it:  node <plugin>/scripts/build-page.mjs <plugin>/examples/travel-royale/about.mjs --out <folder>
// (tokens.mjs next to this file is picked up automatically). New pages follow the same shape.
export default function build(kit) {
const p = kit.prefix; // theme class prefix, e.g. tr-icon-tile
const { c, K, F, SP, pad, linkEl, P, muted, H, eyebrow, h2, stack, grid, section, wide, arrowLink, sectionHeader, ctaBand, pexels: PX } = kit;
const { muted: MUTED, cream: CREAM, rule: RULE, control: CONTROL, heroSub: HERO_SUB, darkEyebrow: DARK_EYEBROW, darkText: DARK_TEXT, darkMuted: DARK_MUTED } = kit.K;


const mutedP = (text, size = F.s17, lh = '1.6') => P(text, { style: { color: { text: MUTED }, typography: { fontSize: size, lineHeight: lh } } });
const twoCol = (left, right, opts = {}) => c('core/columns', {
  align: opts.align, verticalAlignment: opts.v || 'center',
  style: { spacing: { blockGap: { left: opts.gap || 'clamp(3rem, 6vw, 6rem)' } } },
}, [c('core/column', { width: opts.lw || '50%' }, left), c('core/column', { width: opts.rw || '50%' }, right)]);

// 1. Hero ----------------------------------------------------------------
const hero = c('core/cover', {
  url: PX(19737857, 2000), alt: '', dimRatio: 100, isUserOverlayColor: true, isDark: true,
  customGradient: 'linear-gradient(90deg,rgba(16,18,20,0.78) 0%,rgba(16,18,20,0.4) 60%,rgba(16,18,20,0.15) 100%),linear-gradient(180deg,rgba(16,18,20,0.45) 0%,rgba(16,18,20,0) 30%)',
  minHeight: 600, minHeightUnit: 'px', align: 'full',
  style: { spacing: { padding: { top: '128px', bottom: SP.s72, left: 'var(--wp--style--root--padding-left)', right: 'var(--wp--style--root--padding-right)' }, margin: { top: '0', bottom: '0' } } },
  layout: { type: 'constrained', contentSize: '1344px' },
}, [
  stack('20px', [
    P('<a href="/">Home</a> › About us', { style: { color: { text: HERO_SUB }, typography: { fontSize: F.sm }, ...linkEl(HERO_SUB) } }),
    H('We plan North America the way we’d want to travel it ourselves.', 1, { textColor: 'base', style: { typography: { fontSize: 'clamp(2.5rem, 1.5rem + 3vw, 3.75rem)', fontWeight: '700', letterSpacing: '-0.025em', lineHeight: '1.08' } } }),
    P('A small, independent team of travel designers. Over 20 years, we’ve stayed in the hotels, met the guides and driven the roads we recommend.', { style: { color: { text: HERO_SUB }, typography: { fontSize: F.s19, lineHeight: '1.55' } } }),
  ], { layout: { type: 'constrained', contentSize: '860px', justifyContent: 'left' } }),
]);

// 2. Our story -------------------------------------------------------------
const founder = c('core/group', {
  style: { border: { top: { color: RULE, width: '1px' } }, spacing: { padding: { top: '22px' }, margin: { top: '10px' }, blockGap: '14px' } },
  layout: { type: 'flex', flexWrap: 'nowrap', verticalAlignment: 'center' },
}, [
  c('core/image', { url: kit.placeholder('avatar'), alt: 'Founder Name', className: `${p}-avatar-img`, width: '52px', height: '52px', aspectRatio: '1', scale: 'cover', linkDestination: 'none', style: { border: { radius: '999px' } } }),
  stack('2px', [P('Founder Name', { style: { typography: { fontSize: '1rem', fontWeight: '600' } } }), muted('Founder &amp; Principal Travel Designer')]),
]);
const storyMedia = grid(2, '10rem', '16px', [
  c('core/cover', { url: PX(8828672), alt: 'Planning a route on a map', dimRatio: 0, isUserOverlayColor: true, isDark: false, minHeight: 240, minHeightUnit: 'px', style: { border: { radius: '16px' }, layout: { rowSpan: 2 } }, layout: { type: 'default' } }),
  c('core/image', { url: PX(2662086, 700), alt: 'Moraine Lake in Banff', aspectRatio: '1', scale: 'cover', sizeSlug: 'large', linkDestination: 'none', style: { border: { radius: '16px' } } }),
  c('core/cover', {
    customOverlayColor: '#f1ede6', isUserOverlayColor: true, dimRatio: 100, isDark: false, contentPosition: 'bottom left',
    style: { border: { radius: '16px' }, dimensions: { aspectRatio: '1' }, spacing: { padding: { top: '24px', bottom: '24px', left: '24px', right: '24px' } } },
    layout: { type: 'default' },
  }, [stack('6px', [
    P('2005', { textColor: 'primary', style: { typography: { fontSize: F.s44, fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1' } } }),
    P('Founded in Seattle. Still family-owned and independent.', { style: { color: { text: MUTED }, typography: { fontSize: F.s15, lineHeight: '1.45' } } }),
  ])]),
]);
const story = section([
  twoCol([stack('18px', [
    eyebrow('Our story'),
    h2('It started with one trip to Banff, and a phone that kept ringing.'),
    mutedP('In 2005, our founder planned a two-week Rockies trip for friends. Every hotel was hand-picked, every drive timed for the light, every dinner booked weeks ahead. The friends told their friends. Within a year, the phone didn’t stop.', F.s17, '1.65'),
    mutedP('Two decades later we’re a team of twelve, still independent and still focused on one continent. We don’t sell packaged tours or run call centers. Each trip is designed by one person who knows the places personally and stays with you until you’re home.', F.s17, '1.65'),
    founder,
  ])], [storyMedia], { align: 'wide' }),
], pad(SP.s96, SP.s96));

// 3. Stats band (dark) -----------------------------------------------------
const stats = [['20+ years', 'Planning North American travel'], ['3,400+', 'Private journeys arranged'], ['68%', 'Of travelers book with us again'], ['60+ nights', 'Spent inspecting hotels each year']];
const statsBand = c('core/group', {
  align: 'full', className: 'is-style-ts-section-dark', backgroundColor: 'secondary', textColor: 'base',
  style: pad('48px', '48px'), layout: { type: 'constrained' },
}, [wide([grid(4, '14rem', '32px', stats.map(([v, l]) => stack('4px', [
  P(v, { style: { typography: { fontSize: 'clamp(1.75rem, 1.3rem + 1.3vw, 2.25rem)', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.2' } } }),
  P(l, { style: { color: { text: DARK_TEXT }, typography: { fontSize: F.s15 } } }),
], { style: { border: { left: { color: DARK_EYEBROW, width: '2px' } }, spacing: { padding: { left: '20px' } } } })), { className: `${p}-grid-2x2` })])]);

// 4. Values ------------------------------------------------------------------
const values = [
  ['01', 'heart-handshake', 'One person, start to finish', 'The designer who plans your trip is the one you call from the road. No hand-offs.'],
  ['02', 'eye', 'Seen with our own eyes', 'We only recommend hotels, guides and experiences our team has tried in person.'],
  ['03', 'receipt', 'Clear, honest pricing', 'One itemized price. No hidden markups, and hotel rates that match booking direct.'],
  ['04', 'leaf', 'Travel that gives back', 'Local guides, locally owned lodges and a share of every trip to conservation.'],
];
const valueCard = ([n, icon, title, text]) => stack('12px', [
  P(n, { className: `${p}-icon-tile ${p}-icon-tile--row ts-icon--${icon}`, style: { color: { text: MUTED }, typography: { fontSize: F.sm, fontWeight: '600' } } }),
  P(title, { style: { typography: { fontSize: F.s19, fontWeight: '600' }, spacing: { margin: { top: '8px' } } } }),
  mutedP(text, F.s15, '1.55'),
], { style: { color: { background: CREAM }, border: { radius: '16px', width: '1px', color: RULE }, spacing: { padding: { top: '28px', bottom: '28px', left: '24px', right: '24px' } } } });
const valuesSection = section([
  wide([
    twoCol([stack('8px', [eyebrow('What we believe'), h2('Four promises behind every trip')])], [mutedP('Luxury is not a thread count. It’s the time you get back because someone else thought of everything.', F.s17, '1.55')], { v: 'bottom', gap: '64px', lw: '41.66%', rw: '58.33%' }),
    grid(4, '14rem', '20px', values.map(valueCard), { className: `${p}-grid-2x2` }),
  ], { style: { spacing: { blockGap: '40px' } } }),
], pad(SP.s96, SP.s96));

// 5. Team ----------------------------------------------------------------------
const team = [
  ['FN', 'Founder Name', 'Founder &amp; Principal Designer', ['Canadian Rockies', 'Rail'], 'Sunrise at Moraine Lake, before the first bus arrives.'],
  ['DN', 'Designer Name', 'Senior Travel Designer', ['Alaska', 'Wildlife'], 'Watching bears fish from a floatplane-only lodge.'],
  ['DN', 'Designer Name', 'Travel Designer', ['California', 'Wine'], 'A long lunch in Healdsburg, then the drive down Highway 1.'],
  ['DN', 'Designer Name', 'Travel Designer', ['New York', 'Québec'], 'Old Québec in the first snow of December.'],
];
const tag = (t) => P(t, { className: `${p}-pill`, style: { color: { background: '#e8efea' }, border: { radius: '999px' }, spacing: { padding: { top: '4px', bottom: '4px', left: '10px', right: '10px' } }, typography: { fontSize: F.xs, fontWeight: '500' } }, textColor: 'primary' });
const teamCard = ([, name, role, tags, fav]) => c('core/group', {
  backgroundColor: 'base', className: `${p}-media-card`,
  style: { border: { radius: '16px' }, spacing: { blockGap: '0' } },
  layout: { type: 'default' },
}, [
  c('core/image', { url: kit.placeholder('portrait'), alt: name, aspectRatio: '4/5', scale: 'cover', sizeSlug: 'large', linkDestination: 'none' }),
  stack('6px', [
    P(name, { style: { typography: { fontSize: F.s18, fontWeight: '600' } } }),
    muted(role),
    c('core/group', { style: { spacing: { blockGap: '6px', margin: { top: '8px' } } }, layout: { type: 'flex', flexWrap: 'wrap' } }, tags.map(tag)),
    P(`“${fav}”`, { style: { color: { text: MUTED }, typography: { fontSize: F.sm, lineHeight: '1.5' }, border: { top: { color: RULE, width: '1px' } }, spacing: { padding: { top: '12px' }, margin: { top: '8px' } } } }),
  ], { style: { spacing: { padding: { top: '20px', bottom: '20px', left: '20px', right: '20px' } } } }),
]);
const teamSection = section([
  wide([
    sectionHeader('Meet the travel designers', 'The people who will plan your trip', arrowLink('Meet the whole team'), 'Each designer specializes in a region and travels there at least twice a year. We match you with the one who knows your trip best.'),
    grid(4, '14rem', '20px', team.map(teamCard), { className: `${p}-grid-2x2` }),
  ], { style: { spacing: { blockGap: '32px' } } }),
], pad(SP.s96, SP.s96), { backgroundColor: 'subtle' });

// 6. Comparison ----------------------------------------------------------------
const compare = [
  ['Hotel rate', 'Public rate', 'Same rate, plus partner perks'],
  ['Upgrades &amp; credits', 'Luck of the day', 'Upgrade, breakfast, $100 credit'],
  ['Hard-to-get bookings', 'Sold out online', 'Held allocations and personal contacts'],
  ['Logistics', 'Dozens of bookings', 'One itinerary, one confirmation'],
  ['When plans change', 'Airline call queue', '24/7 line to your designer'],
  ['Local knowledge', 'Review sites', 'Places our team has stayed'],
];
const table = c('core/table', {
  className: `${p}-compare`,
  head: [{ cells: [{ content: '', tag: 'th' }, { content: 'Booking it yourself', tag: 'th' }, { content: 'With us', tag: 'th' }] }],
  body: compare.map(([a, b, d]) => ({ cells: [{ content: a, tag: 'td' }, { content: b, tag: 'td' }, { content: d, tag: 'td' }] })),
});
const compareSection = section([
  twoCol([stack('12px', [
    eyebrow('Why a travel designer'), h2('What changes when you book with us'),
    mutedP('The hotel rate is usually the same as booking direct. The difference is everything around it.', F.s17, '1.55'),
  ])], [table], { align: 'wide', v: 'top', gap: '64px', lw: '41.66%', rw: '58.33%' }),
], pad(SP.s96, SP.s96));

// 7. Timeline ----------------------------------------------------------------------
const timeline = [
  ['2005', 'The first trip', 'A two-week Rockies journey for friends becomes the first client trip.'],
  ['2010', 'Alaska &amp; the West', 'Expanded to Alaska, California and the national parks.'],
  ['2015', 'Vancouver office', 'Opened a second office to be closer to Western Canada.'],
  ['2020', 'Our impact fund', 'Began giving 1% of every trip to conservation partners.'],
  ['2026', '3,400 journeys', 'A team of twelve designers, still independent.'],
];
const timelineSection = section([
  wide([
    stack('8px', [eyebrow('Milestones'), H('Twenty years on one continent', 2, { style: { typography: { fontSize: 'clamp(1.625rem, 1.3rem + 1vw, 2rem)', fontWeight: '700', letterSpacing: '-0.015em', lineHeight: '1.2' } } })]),
    c('core/group', { className: `${p}-timeline`, style: { spacing: { blockGap: '0px' } }, layout: { type: 'grid', columnCount: 5, minimumColumnWidth: '11rem' } },
      timeline.map(([y, t, d]) => stack('8px', [
        P(y, { style: { typography: { fontSize: '1.5rem', fontWeight: '700' } } }),
        P(t, { style: { typography: { fontSize: '1rem', fontWeight: '600' } } }),
        muted(d, F.sm, { style: { color: { text: MUTED }, typography: { fontSize: F.sm, lineHeight: '1.5' } } }),
      ]))),
  ], { style: { spacing: { blockGap: '32px' } } }),
], pad('0', SP.s96));

// 8. On the ground (dark) -------------------------------------------------------------
const regions = [['Canadian Rockies', '42 hotels inspected', 2662086], ['Alaska', '18 lodges inspected', 6145279], ['California Coast &amp; Wine', '56 hotels inspected', 11109505], ['Québec &amp; the East', '34 hotels inspected', 14644822]];
const groundSection = c('core/group', {
  align: 'full', className: 'is-style-ts-section-dark', backgroundColor: 'secondary', textColor: 'base',
  style: pad(SP.s96, SP.s96), layout: { type: 'constrained' },
}, [wide([
  twoCol([stack('12px', [eyebrow('On the ground', DARK_EYEBROW), h2('We’ve slept in every hotel we recommend.')])],
    [P('Our team spends 60+ nights a year inspecting hotels, testing guides and finding new places. If it doesn’t meet our standard, we don’t sell it.', { style: { color: { text: DARK_TEXT }, typography: { fontSize: F.s18, lineHeight: '1.55' } } })],
    { v: 'bottom', gap: '64px' }),
  grid(4, '14rem', '16px', regions.map(([name, meta, id]) => stack('12px', [
    c('core/image', { url: PX(id), alt: name.replace(/&amp;/g, '&'), aspectRatio: '4/3', scale: 'cover', sizeSlug: 'large', linkDestination: 'none', style: { border: { radius: '14px' } } }),
    P(name, { style: { typography: { fontSize: F.s17, fontWeight: '600' } } }),
    P(meta, { className: 'ts-icon ts-icon--map-pin-check', style: { color: { text: DARK_MUTED }, typography: { fontSize: F.sm } } }),
  ])), { className: `${p}-grid-2x2` }),
], { style: { spacing: { blockGap: '36px' } } })]);

// 9. Affiliations ----------------------------------------------------------------------
const logos = [['badge-check', 'Affiliation logo'], ['shield-check', 'Accreditation'], ['award', 'Award logo'], ['newspaper', 'Press logo'], ['newspaper', 'Press logo'], ['landmark', 'Tourism board']];
const affiliations = section([
  wide([
    P('Memberships, accreditations &amp; press', { style: { color: { text: MUTED }, typography: { fontSize: F.sm, fontWeight: '600', textAlign: 'center' } } }),
    grid(6, '9rem', '16px', logos.map(([icon, label]) => c('core/group', {
      style: { border: { radius: '12px', width: '1px', style: 'dashed', color: CONTROL }, dimensions: { minHeight: '84px' }, spacing: { padding: { left: '12px', right: '12px' } } },
      layout: { type: 'flex', orientation: 'vertical', justifyContent: 'center', verticalAlignment: 'center' },
    }, [P(label, { className: `ts-icon ts-icon--${icon}`, style: { color: { text: MUTED }, typography: { fontSize: F.sm, fontWeight: '500', textAlign: 'center' } } })])), { className: `${p}-grid-3` }),
  ], { style: { spacing: { blockGap: '24px' } } }),
], { ...pad(SP.s72, SP.s72), border: { bottom: { color: RULE, width: '1px' } } });

// 10. Responsible travel ---------------------------------------------------------------
const impact = [
  ['trees', '1% for conservation', 'A share of every trip supports wilderness and wildlife partners across North America.'],
  ['users', 'Local guides and owners', 'We choose independent lodges and Indigenous-led experiences wherever we can.'],
  ['sprout', 'Lower-impact itineraries', 'Fewer flights, more rail and slower routes, without giving up comfort.'],
];
const responsible = section([
  twoCol([
    c('core/image', { url: PX(18058418, 1200), alt: 'Boardwalk between coastal rainforest and the sea', aspectRatio: '4/3', scale: 'cover', sizeSlug: 'large', linkDestination: 'none', style: { border: { radius: '16px' } } }),
  ], [stack('16px', [
    eyebrow('Responsible travel'), h2('Leaving places better than we found them'),
    mutedP('The wild places our travelers love need protecting. Giving back is built into how we work, not added at checkout.', F.s17, '1.6'),
    stack('18px', impact.map(([icon, title, text]) => stack('3px', [
      P(title, { style: { typography: { fontSize: F.s17, fontWeight: '600' } } }),
      mutedP(text, F.s15, '1.5'),
    ], { className: `${p}-icon-side ts-icon--${icon}` })), { style: { spacing: { margin: { top: '8px' } } } }),
  ])], { align: 'wide' }),
], pad(SP.s96, SP.s96));

// 11. Featured testimonial --------------------------------------------------------------
const featured = section([
  stack('24px', [
    P('We’ve used this team for eleven trips now. They know us so well that the first draft is usually the one we book.', {
      className: `${p}-quote-mark ts-icon--quote`, style: { typography: { fontSize: 'clamp(1.375rem, 1.1rem + 0.9vw, 1.75rem)', fontWeight: '500', lineHeight: '1.4', letterSpacing: '-0.01em', textAlign: 'center' } },
    }),
    P('<strong>Sample traveler</strong> · Client since 2014', { style: { color: { text: MUTED }, typography: { fontSize: F.s15, textAlign: 'center' } } }),
  ], { align: 'wide', backgroundColor: 'subtle', style: { border: { radius: '20px' }, spacing: { padding: { top: '64px', bottom: '64px', left: 'clamp(1.5rem, 5vw, 5rem)', right: 'clamp(1.5rem, 5vw, 5rem)' } } }, layout: { type: 'constrained', contentSize: '940px' } }),
], pad('0', SP.s96));

// 12. FAQ -------------------------------------------------------------------------------------
const faqs = [
  ['Do you charge a planning fee?', 'Trips under 7 nights carry a $350 planning fee, credited back when you book. For longer journeys there is no fee; we are paid by our hotel and lodge partners, and you pay the same rate as booking direct.'],
  ['How far in advance should we contact you?', 'Six to nine months is ideal, especially for summer in the Rockies and Alaska or fall in New England. We can often arrange shorter-notice trips too, and we will tell you honestly what is still available.'],
  ['Do you only plan trips in the US and Canada?', 'Yes. Focusing on one continent is how we know every hotel, guide and road personally. For trips elsewhere we are happy to refer you to specialists we trust.'],
  ['What happens if something goes wrong while we travel?', 'You get a 24/7 number that reaches someone on our team who knows your trip. Delayed flights, weather closures and changes of plan are handled for you, usually before you need to ask.'],
  ['Can you plan for families or larger groups?', 'Often. Multigenerational trips, milestone celebrations and private group journeys of up to 30 guests make up about a third of what we plan.'],
];
const faqSection = section([
  twoCol([stack('12px', [
    eyebrow('Working with us'), h2('Common questions'),
    P('Something else on your mind? <a href="#">Ask a travel designer</a>.', { style: { color: { text: MUTED }, typography: { fontSize: F.s17, lineHeight: '1.55' }, ...linkEl() } }),
  ])], [c('core/group', { className: `${p}-faq`, style: { spacing: { blockGap: '0' } }, layout: { type: 'default' } },
    faqs.map(([q, a], i) => c('core/details', { summary: q, showContent: i === 0 }, [mutedP(a, '1rem', '1.6')])))],
  { align: 'wide', v: 'top', gap: '64px', lw: '41.66%', rw: '58.33%' }),
], pad('0', SP.s96));

// 13. CTA -------------------------------------------------------------------------------------
const cta = ctaBand({
  img: PX(5326969, 2000),
  card: { title: 'Speak with a travel designer', primary: ['Book a consultation', '#'], secondary: ['+1 (800) 555-0142', 'tel:+18005550142'] },
  title: 'Let’s start with a conversation.',
  text: 'Tell us how you like to travel. We’ll match you with the right designer and send a draft itinerary within 48 hours.',
  note: 'Mon–Sat, 8am–8pm ET · Seattle &amp; Vancouver offices',
});

const page = [hero, story, statsBand, valuesSection, teamSection, compareSection, timelineSection, groundSection, affiliations, responsible, featured, faqSection, cta];
return { slug: 'travel-royale-about-blocks', blocks: page };
}
