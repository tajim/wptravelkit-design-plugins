// Example page script: the Travel Royale Faq page (approved and shipped as a pattern).
// Build it:  node <plugin>/scripts/build-page.mjs <plugin>/examples/travel-royale/faq.mjs --out <folder>
// (tokens.mjs next to this file is picked up automatically). New pages follow the same shape.
export default function build(kit) {
const p = kit.prefix; // theme class prefix, e.g. tr-icon-tile
const { c, F, SP, pad, linkEl, P, muted, H, eyebrow, h2, stack, grid, section, wide, pillButton, pexels: PX } = kit;
const { muted: MUTED, cream: CREAM, rule: RULE, control: CONTROL, heroSub: HERO_SUB, darkEyebrow: DARK_EYEBROW, darkText: DARK_TEXT, darkMuted: DARK_MUTED } = kit.K;



const mutedP = (text, size = F.s17, lh = '1.6') => P(text, { style: { color: { text: MUTED }, typography: { fontSize: size, lineHeight: lh } } });

// Data -----------------------------------------------------------------------------
const cats = [
  { id: 'planning', name: 'Planning &amp; booking', icon: 'map' },
  { id: 'pricing', name: 'Pricing &amp; payments', icon: 'credit-card' },
  { id: 'documents', name: 'Flights &amp; travel documents', icon: 'plane' },
  { id: 'hotels', name: 'Hotels &amp; experiences', icon: 'building-2' },
  { id: 'cancellations', name: 'Insurance &amp; cancellations', icon: 'shield-check' },
  { id: 'trip', name: 'During your trip', icon: 'headset' },
  { id: 'groups', name: 'Families, groups &amp; occasions', icon: 'users' },
];
const qa = {
  planning: [
    ['How does planning a trip with you work?', 'It starts with a free 30-minute call with a travel designer. Within 48 hours you get a draft itinerary with hotel options, a map and a clear price. We refine it together until it feels right, then book everything on one confirmation.'],
    ['How far in advance should I contact you?', 'Six to nine months ahead is ideal, and up to a year for summer in the Rockies and Alaska, fall foliage in New England, or holiday weeks. Shorter-notice trips are often possible; we will tell you honestly what is still available.'],
    ['Do you only plan trips in the US and Canada?', 'Yes. Focusing on one continent means our team has personally visited the hotels, guides and routes we recommend. For trips elsewhere we are happy to refer you to specialists we trust.'],
    ['Can I book a single service, like just a hotel or a car?', 'Absolutely. Many clients start with one booking. You still get partner hotel perks where they apply and access to our 24/7 concierge for that part of your trip.'],
    ['Can you work around flights or hotels I have already booked?', 'Usually, yes. Send us your existing confirmations and we will plan transfers, experiences and the rest of the trip around them.'],
  ],
  pricing: [
    ['Do you charge a planning fee?', 'Trips shorter than 7 nights carry a $500 planning fee, credited back in full when you book. Longer journeys have no planning fee. Private Client membership is priced separately.'],
    ['Will I pay more than booking directly?', 'No. Hotel rates match what you would pay booking direct, and partner perks like upgrades, breakfast and hotel credits are added on top. Every price we quote is itemized, with no hidden markups.'],
    ['What deposit is required and when is the balance due?', 'A 25% deposit confirms your trip. The balance is due 60 days before departure. Some hotels, lodges and rail journeys have their own deposit rules, which we show clearly before you book.'],
    ['Which payment methods do you accept?', 'All major credit cards, bank transfer and ACH. Paying by card can also earn your usual rewards points. Prices are quoted in US dollars, or Canadian dollars on request.'],
  ],
  documents: [
    ['Do you book first class, business class and private jets?', 'Yes. We book premium cabins on all major airlines and source private jet, floatplane and helicopter charters. Charter quotes usually arrive within a few hours.'],
    ['What documents do I need to travel between the US and Canada?', 'It depends on your citizenship. Most travelers need a valid passport, and many visitors also need an eTA for Canada or an ESTA for the US. We check the current requirements for every traveler on your booking and remind you well before departure.'],
    ['Can you help with airport meet-and-greet and fast-track?', 'Yes. Where available we arrange VIP meet-and-greet, fast-track security, lounge access and a driver waiting at arrivals with your name.'],
  ],
  hotels: [
    ['Have you really visited the hotels you recommend?', 'Yes. Our team spends 60+ nights a year inspecting hotels and lodges. If we have not stayed there or seen it in person, we tell you.'],
    ['What perks do I get at partner hotels?', 'Typically a room upgrade on arrival when available, daily breakfast for two, a $100 credit to use at the hotel, and early check-in or late checkout when possible. Exact perks vary by hotel and are listed in your proposal.'],
    ['Can you book private guides and exclusive experiences?', 'Yes. Helicopter tours, private naturalists, chef’s tables, winery cellars and after-hours access are all arranged with partners we have worked with for years.'],
  ],
  cancellations: [
    ['What is your cancellation policy?', 'Your deposit is refundable up to 90 days before departure, minus any non-refundable supplier costs, which we always flag before you book. Closer to departure, each hotel and operator’s own terms apply.'],
    ['Should I buy travel insurance?', 'We strongly recommend it. We help you choose cover for cancellation, medical care, evacuation and delays from licensed third-party insurers, including cancel-for-any-reason options.'],
    ['What happens if weather or a closure affects my trip?', 'We watch your route in real time. If a road, park or flight is affected, the concierge team rebooks hotels, transfers and experiences, usually before you need to ask.'],
  ],
  trip: [
    ['How do I reach you while I am traveling?', 'Your itinerary includes a 24/7 number with phone, text and WhatsApp, answered by our own team. The average reply time is under 10 minutes, day or night.'],
    ['Will I get a printed itinerary?', 'Yes. You receive a printed travel book a couple of weeks before departure, plus a mobile app with your full itinerary, confirmations, maps and contacts, which also works offline.'],
    ['Can the concierge book restaurants and change plans on the go?', 'Of course. Dinner reservations, extra nights, a different activity, gifts or flowers. Just message us.'],
  ],
  groups: [
    ['Do you plan multigenerational and family trips?', 'Often. We plan for grandparents through toddlers, with connecting rooms, kids’ activities, sensible pacing and private vehicles big enough for everyone.'],
    ['Can you plan honeymoons, proposals and anniversaries?', 'Yes, and quietly. We coordinate surprises with hotels and guides and keep every detail private until the moment.'],
    ['What is the largest group you can arrange?', 'We regularly plan private group journeys of up to 30 guests, including whole-lodge buyouts and private rail cars.'],
  ],
};
const total = Object.values(qa).reduce((n, l) => n + l.length, 0);

// 1. Hero with search ------------------------------------------------------------------
const pick = (t) => c('core/button', {
  text: t, url: '#faq-questions', className: `${p}-faq-pick`, textColor: 'base',
  style: {
    color: { background: 'rgba(0,0,0,0.25)' },
    border: { radius: '999px', width: '1px', color: 'rgba(255,255,255,0.6)' },
    spacing: { padding: { top: '7px', bottom: '7px', left: '14px', right: '14px' } },
    typography: { fontSize: F.sm, fontWeight: '500' },
  },
});
const hero = c('core/cover', {
  url: PX(7005517, 2000), alt: '', dimRatio: 100, isUserOverlayColor: true, isDark: true,
  customGradient: 'linear-gradient(180deg,rgba(16,18,20,0.65) 0%,rgba(16,18,20,0.55) 50%,rgba(16,18,20,0.75) 100%)',
  minHeight: 520, minHeightUnit: 'px', align: 'full', focalPoint: { x: 0.5, y: 0.6 },
  style: { spacing: { padding: { top: '128px', bottom: SP.s72, left: 'var(--wp--style--root--padding-left)', right: 'var(--wp--style--root--padding-right)' }, margin: { top: '0', bottom: '0' } } },
  layout: { type: 'constrained', contentSize: '820px' },
}, [
  stack('18px', [
    P('<a href="/">Home</a> › FAQ', { style: { color: { text: HERO_SUB }, typography: { fontSize: F.sm, textAlign: 'center' }, ...linkEl(HERO_SUB) } }),
    H('How can we help?', 1, { textColor: 'base', style: { typography: { fontSize: 'clamp(2.25rem, 1.4rem + 2.8vw, 3.5rem)', fontWeight: '700', letterSpacing: '-0.025em', lineHeight: '1.08', textAlign: 'center' } } }),
    P('Answers about planning, pricing, travel documents and what happens while you travel.', { style: { color: { text: HERO_SUB }, typography: { fontSize: F.s19, lineHeight: '1.55', textAlign: 'center' } } }),
    c('core/group', { style: { spacing: { margin: { top: '10px' } } }, layout: { type: 'constrained', contentSize: '720px' } }, [
      c('core/search', {
        className: `${p}-faq-search`, label: 'Search questions', showLabel: false,
        placeholder: 'Search, e.g. deposit, eTA, cancellation', buttonText: 'Search', buttonPosition: 'no-button',
        width: 100, widthUnit: '%',
      }),
    ]),
    c('core/group', {
      style: { spacing: { blockGap: '8px' } },
      layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'center' },
    }, [
      P('Popular:', { style: { color: { text: HERO_SUB }, typography: { fontSize: F.sm } } }),
      c('core/buttons', { style: { spacing: { blockGap: '8px' } }, layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'center' } }, ['Planning fee', 'Deposit', 'eTA', 'Cancellation'].map(pick)),
    ]),
  ]),
]);

// 2. Quick facts ------------------------------------------------------------------------------
const facts = [
  ['receipt', 'No hidden markups', 'Hotel rates match booking direct'],
  ['calendar-clock', '48 hours', 'From first call to draft itinerary'],
  ['wallet', '25% deposit', 'Balance due 60 days before travel'],
  ['headset', '&lt; 10 min', 'Average 24/7 concierge reply'],
];
const factsBand = section([
  wide([grid(4, '14rem', '32px', facts.map(([icon, v, l]) => stack('2px', [
    P(v, { style: { typography: { fontSize: F.s20, fontWeight: '700', letterSpacing: '-0.01em' } } }),
    P(l, { style: { color: { text: MUTED }, typography: { fontSize: F.sm, lineHeight: '1.45' } } }),
  ], { className: `${p}-icon-side ts-icon--${icon}` })), { className: `${p}-grid-2x2` })]),
], { ...pad('36px', '36px'), border: { bottom: { color: RULE, width: '1px' } } });

// 3. Topics + questions -------------------------------------------------------------------------
const topic = (id, name, icon, count, active = false) => c('core/group', {
  className: `${p}-topic${active ? ' is-active' : ''} ts-icon--${icon}`,
  style: { spacing: { blockGap: '12px' } },
  layout: { type: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between' },
}, [
  P(`<a href="#${id}">${name}</a>`, { className: `${p}-topic__label` }),
  P(String(count), { className: `${p}-topic__count` }),
]);
const topics = c('core/group', {
  className: `${p}-topics`, tagName: 'nav', ariaLabel: 'Question topics',
  style: { spacing: { blockGap: '4px' } }, layout: { type: 'flex', orientation: 'vertical', justifyContent: 'stretch' },
}, [
  P('Topics', { className: `${p}-topics__title`, style: { color: { text: MUTED }, typography: { fontSize: F.sm, fontWeight: '600' }, spacing: { padding: { left: '14px', right: '14px', bottom: '8px' } } } }),
  topic('faq-questions', 'All questions', 'list', total, true),
  ...cats.map((k) => topic(`faq-${k.id}`, k.name, k.icon, qa[k.id].length)),
]);
const travelingCard = stack('10px', [
  P('Already traveling?', { style: { typography: { fontSize: '1rem', fontWeight: '600' } } }),
  mutedP('Use the 24/7 concierge number on your itinerary for anything urgent.', F.sm, '1.5'),
  P('<a href="#">Contact concierge</a>', { className: 'ts-icon ts-icon--headset', textColor: 'primary', style: { typography: { fontSize: F.s15, fontWeight: '600' }, ...linkEl() } }),
], { backgroundColor: 'subtle', className: `${p}-faq-aside`, style: { border: { radius: '16px' }, spacing: { padding: { top: '22px', bottom: '22px', left: '22px', right: '22px' } } } });

let first = true;
const faqGroup = (k) => c('core/group', {
  anchor: `faq-${k.id}`, className: `${p}-faq-group`, style: { spacing: { blockGap: '16px' } }, layout: { type: 'default' },
}, [
  H(k.name, 2, { className: `${p}-icon-label ${p}-icon-label--sm ts-icon--${k.icon}`, style: { typography: { fontSize: 'clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)', fontWeight: '600' } } }),
  c('core/group', { className: `${p}-faq ${p}-faq--circle`, style: { spacing: { blockGap: '0' } }, layout: { type: 'default' } },
    qa[k.id].map(([q, a]) => { const open = first; first = false; return c('core/details', { summary: q, showContent: open }, [mutedP(a, '1rem', '1.65')]); })),
]);
const emptyBox = stack('12px', [
  P('No answers match that search', { className: 'ts-icon ts-icon--lg ts-icon--message-circle-question', style: { typography: { fontSize: F.s20, fontWeight: '600', textAlign: 'center' } } }),
  P('Try a different word, or ask us directly. A travel designer replies within one business day.', { style: { color: { text: MUTED }, typography: { fontSize: F.s15, textAlign: 'center' } } }),
  c('core/buttons', { style: { spacing: { margin: { top: '8px' }, blockGap: '12px' } }, layout: { type: 'flex', justifyContent: 'center' } }, [
    pillButton('Clear search', '#faq-questions', 'outline', { size: F.s15, py: '11px', px: '18px', attrs: { className: `${p}-faq-clear` } }),
    pillButton('Ask a question', '/contact/', 'primary', { size: F.s15, py: '11px', px: '18px' }),
  ]),
], { className: `${p}-faq-empty`, style: { border: { radius: '16px', width: '1px', style: 'dashed', color: CONTROL }, spacing: { padding: { top: '48px', bottom: '48px', left: '24px', right: '24px' } } }, layout: { type: 'constrained', contentSize: '420px' } });

const questions = section([
  c('core/columns', { align: 'wide', anchor: 'faq-questions', className: `${p}-faq-page`, style: { spacing: { blockGap: { left: '64px' } } } }, [
    c('core/column', { width: '320px', className: `${p}-faq-side` }, [stack('20px', [topics, travelingCard])]),
    c('core/column', {}, [stack('48px', [...cats.map(faqGroup), emptyBox])]),
  ]),
], pad(SP.s72, SP.s96));

// 4. Still have questions (dark) ---------------------------------------------------------------------
const contacts = [
  ['phone', 'Call us', '<a href="tel:+18005550142">+1 (800) 555-0142</a>', 'Mon–Sat, 8am–8pm ET'],
  ['mail', 'Email', '<a href="mailto:hello@example.com">hello@example.com</a>', 'Reply within one business day'],
  ['message-circle', 'WhatsApp', '<a href="#">Message a designer</a>', 'Great for quick questions'],
  ['calendar-check', 'Book a call', '<a href="#">Free 30-minute consultation</a>', 'Pick a time that suits you'],
];
const contactCard = ([icon, title, detail, note]) => stack('10px', [
  P(title, { className: `${p}-icon-tile ${p}-icon-tile--outline ts-icon--${icon}`, style: { typography: { fontSize: F.s18, fontWeight: '600' } } }),
  P(detail, { className: `${p}-card-link__target`, style: { color: { text: HERO_SUB }, typography: { fontSize: F.s15 }, ...linkEl(HERO_SUB) } }),
  P(note, { style: { color: { text: DARK_MUTED }, typography: { fontSize: F.sm } } }),
], { className: `${p}-card-link`, style: { border: { radius: '16px', width: '1px', color: 'rgba(255,255,255,0.18)' }, spacing: { padding: { top: '24px', bottom: '24px', left: '24px', right: '24px' } } } });
const stillSection = c('core/group', {
  align: 'full', className: 'is-style-ts-section-dark', backgroundColor: 'secondary', textColor: 'base',
  style: pad(SP.s96, SP.s96), layout: { type: 'constrained' },
}, [wide([
  c('core/columns', { verticalAlignment: 'bottom', style: { spacing: { blockGap: { left: '64px' } } } }, [
    c('core/column', { width: '50%' }, [stack('12px', [eyebrow('Still have questions?', DARK_EYEBROW), h2('Talk to a real person, however you like.')])]),
    c('core/column', { width: '50%' }, [P('Every message goes to our own team in Seattle and Vancouver, never an outsourced call center.', { style: { color: { text: DARK_TEXT }, typography: { fontSize: F.s18, lineHeight: '1.55' } } })]),
  ]),
  grid(4, '14rem', '16px', contacts.map(contactCard), { className: `${p}-grid-2x2` }),
], { style: { spacing: { blockGap: '36px' } } })]);

// 5. Helpful guides ----------------------------------------------------------------------------------
const guides = [
  ['Entry requirements for the US and Canada, explained', 'Travel documents · 6 min read', 'Border crossing between the US and Canada'],
  ['What to pack for the Canadian Rockies in every season', 'Packing guide · 5 min read', 'Turquoise lake in the Canadian Rockies'],
  ['Choosing travel insurance for a luxury trip', 'Planning guide · 7 min read', 'Couple sitting by a mountain lake'],
];
const guidesSection = section([
  wide([
    c('core/group', { style: { spacing: { blockGap: '16px' } }, layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', verticalAlignment: 'bottom' } }, [
      H('Helpful before you go', 2, { style: { typography: { fontSize: 'clamp(1.25rem, 1.1rem + 0.5vw, 1.375rem)', fontWeight: '600' } } }),
      P('<a href="#">All travel guides</a>', { style: { typography: { fontSize: F.s15, fontWeight: '500' }, ...linkEl() } }),
    ]),
    grid(3, '15rem', '24px', guides.map(([t, meta, alt]) => stack('12px', [
      c('core/image', { url: kit.placeholder('landscape'), alt, aspectRatio: '16/9', scale: 'cover', sizeSlug: 'large', linkDestination: 'none', style: { border: { radius: '14px' } } }),
      P(`<a href="#">${t}</a>`, { className: `${p}-card-link__target`, style: { typography: { fontSize: F.s17, fontWeight: '600', lineHeight: '1.35' }, ...linkEl('var:preset|color|heading') } }),
      muted(meta),
    ], { className: `${p}-card-link` })), { className: `${p}-grid-3` }),
  ], { style: { spacing: { blockGap: '20px' } } }),
], pad(SP.s96, SP.s96));

// 6. CTA ------------------------------------------------------------------------------------------------
const cta = section([
  c('core/group', {
    align: 'wide', backgroundColor: 'subtle',
    style: { border: { radius: '20px' }, spacing: { padding: { top: '48px', bottom: '48px', left: 'clamp(1.5rem, 4vw, 3.5rem)', right: 'clamp(1.5rem, 4vw, 3.5rem)' }, blockGap: '32px' } },
    layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', verticalAlignment: 'center' },
  }, [
    stack('8px', [
      H('Ready to start planning?', 2, { style: { typography: { fontSize: F.s30, fontWeight: '700', letterSpacing: '-0.015em', lineHeight: '1.2' } } }),
      mutedP('A free 30-minute call with a travel designer. Draft itinerary within 48 hours.', F.s17, '1.5'),
    ]),
    c('core/buttons', { style: { spacing: { blockGap: '12px' } } }, [
      pillButton('+1 (800) 555-0142', 'tel:+18005550142', 'outline', { attrs: { className: `${p}-chip ts-icon--phone` } }),
      pillButton('Book a consultation', '#', 'primary', { attrs: { className: `${p}-btn-arrow` } }),
    ]),
  ]),
], pad('0', SP.s96));

const page = [hero, factsBand, questions, stillSection, guidesSection, cta];
return { slug: 'travel-royale-faq-blocks', blocks: page };
}
