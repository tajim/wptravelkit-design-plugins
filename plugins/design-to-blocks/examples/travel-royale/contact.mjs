// Example page script: the Travel Royale Contact page (approved and shipped as a pattern).
// Build it:  node <plugin>/scripts/build-page.mjs <plugin>/examples/travel-royale/contact.mjs --out <folder>
// (tokens.mjs next to this file is picked up automatically). New pages follow the same shape.
export default function build(kit) {
const p = kit.prefix; // theme class prefix, e.g. tr-icon-tile
const { c, F, SP, pad, linkEl, P, muted, H, eyebrow, h2, stack, grid, section, wide, pillButton, pexels: PX } = kit;
const { muted: MUTED, cream: CREAM, rule: RULE, control: CONTROL, heroSub: HERO_SUB, darkEyebrow: DARK_EYEBROW, darkText: DARK_TEXT, darkMuted: DARK_MUTED } = kit.K;



const PH = kit.themeImage('');
const mutedP = (text, size = F.s17, lh = '1.6') => P(text, { style: { color: { text: MUTED }, typography: { fontSize: size, lineHeight: lh } } });
const twoCol = (left, right, opts = {}) => c('core/columns', {
  align: opts.align, verticalAlignment: opts.v || 'center', className: opts.className,
  style: { spacing: { blockGap: { left: opts.gap || '64px' } } },
}, [c('core/column', { width: opts.lw || '41.66%', className: opts.lc }, left), c('core/column', { width: opts.rw || '58.33%', className: opts.rc }, right)]);
const iconText = (text, icon, extra = {}) => P(text, { className: `ts-icon ts-icon--${icon}${extra.primary ? ` ${p}-icon-primary` : ''}`, style: { color: extra.color ? { text: extra.color } : undefined, typography: { fontSize: extra.size || F.s15, lineHeight: '1.5' } } });

// 1. Hero ---------------------------------------------------------------------------------
const hero = c('core/cover', {
  url: PX(18033385, 2000), alt: '', dimRatio: 100, isUserOverlayColor: true, isDark: true,
  customGradient: 'linear-gradient(90deg,rgba(16,18,20,0.8) 0%,rgba(16,18,20,0.45) 60%,rgba(16,18,20,0.2) 100%),linear-gradient(180deg,rgba(16,18,20,0.45) 0%,rgba(16,18,20,0) 30%)',
  minHeight: 500, minHeightUnit: 'px', align: 'full',
  style: { spacing: { padding: { top: '128px', bottom: SP.s72, left: 'var(--wp--style--root--padding-left)', right: 'var(--wp--style--root--padding-right)' }, margin: { top: '0', bottom: '0' } } },
  layout: { type: 'constrained', contentSize: '1344px' },
}, [
  stack('18px', [
    P('<a href="/">Home</a> › Contact', { style: { color: { text: HERO_SUB }, typography: { fontSize: F.sm }, ...linkEl(HERO_SUB) } }),
    H('Let’s plan something unforgettable.', 1, { textColor: 'base', style: { typography: { fontSize: 'clamp(2.5rem, 1.5rem + 3vw, 3.625rem)', fontWeight: '700', letterSpacing: '-0.025em', lineHeight: '1.08' } } }),
    P('Tell us a little about your trip. A travel designer, not a call center, will reply within one business day.', { style: { color: { text: HERO_SUB }, typography: { fontSize: F.s19, lineHeight: '1.55' } } }),
    c('core/group', { style: { spacing: { blockGap: '12px 28px', margin: { top: '6px' } } }, layout: { type: 'flex', flexWrap: 'wrap' } }, [
      iconText('Reply within 1 business day', 'clock', { color: HERO_SUB }),
      iconText('Free consultation, no obligation', 'gift', { color: HERO_SUB }),
      iconText('Your details stay private', 'lock', { color: HERO_SUB }),
    ]),
  ], { layout: { type: 'constrained', contentSize: '780px', justifyContent: 'left' } }),
]);

// 2. Contact channels ------------------------------------------------------------------------
const channels = [
  ['phone', 'Call a travel designer', '<a href="tel:+18005550142">+1 (800) 555-0142</a>', 'Mon–Sat, 8am–8pm ET'],
  ['mail', 'Email', '<a href="mailto:hello@example.com">hello@example.com</a>', 'Reply within one business day'],
  ['message-circle', 'WhatsApp', '<a href="#">Message us</a>', 'Quick questions, any time'],
  ['calendar-check', 'Book a call', '<a href="#consult">Free 30-minute call</a>', 'Phone or video'],
];
const channelsBand = section([
  wide([grid(4, '14rem', '16px', channels.map(([icon, title, detail, note]) => c('core/group', {
    className: `${p}-card-link`,
    style: { color: { background: CREAM }, border: { radius: '16px', width: '1px', color: RULE }, spacing: { padding: { top: '20px', bottom: '20px', left: '20px', right: '20px' } } },
    layout: { type: 'default' },
  }, [stack('2px', [
    P(title, { style: { color: { text: MUTED }, typography: { fontSize: F.sm } } }),
    P(detail, { className: `${p}-card-link__target`, style: { typography: { fontSize: F.s17, fontWeight: '600', lineHeight: '1.4' }, ...linkEl('var:preset|color|heading') } }),
    P(note, { style: { color: { text: MUTED }, typography: { fontSize: F.xs } } }),
  ], { className: `${p}-icon-side ts-icon--${icon}` })])), { className: `${p}-grid-2x2` })]),
], { ...pad('32px', '32px'), border: { bottom: { color: RULE, width: '1px' } } });

// 3. Enquiry form + sidebar ------------------------------------------------------------------
const formCard = c('core/group', {
  className: `${p}-cf7`, backgroundColor: 'base',
  style: { border: { radius: '20px', width: '1px', color: RULE }, spacing: { padding: { top: 'clamp(1.5rem, 3vw, 2.5rem)', bottom: 'clamp(1.5rem, 3vw, 2.5rem)', left: 'clamp(1.25rem, 3vw, 2.5rem)', right: 'clamp(1.25rem, 3vw, 2.5rem)' } } },
  layout: { type: 'default' },
}, [c('core/shortcode', { text: '[contact-form-7 id="REPLACE-WITH-TRIP-ENQUIRY-FORM-ID" title="Trip enquiry"]' })]);

const nextSteps = [
  ['1', 'We read every word', 'Your enquiry goes to the designer who knows your destination best.'],
  ['2', 'A conversation, within a day', 'We call or email to ask a few questions about how you like to travel.'],
  ['3', 'Your draft itinerary in 48 hours', 'Hotels, routes and a clear price. Change anything until it is right.'],
];
const nextCard = stack('0', [
  P('What happens next', { style: { color: { text: DARK_EYEBROW }, typography: { fontSize: F.sm, fontWeight: '500' }, spacing: { padding: { bottom: '6px' } } } }),
  ...nextSteps.map(([n, t, d], i) => c('core/group', {
    style: { ...(i < 2 ? { border: { bottom: { color: 'rgba(255,255,255,0.14)', width: '1px' } } } : {}), spacing: { padding: { top: '16px', bottom: '16px' }, blockGap: '14px' } },
    layout: { type: 'flex', flexWrap: 'nowrap', verticalAlignment: 'top' },
  }, [
    P(n, { className: `${p}-num ${p}-num--sm`, style: { typography: { fontSize: F.s15, fontWeight: '600' } } }),
    stack('4px', [
      P(t, { style: { typography: { fontSize: '1rem', fontWeight: '600' } } }),
      P(d, { style: { color: { text: DARK_MUTED }, typography: { fontSize: F.sm, lineHeight: '1.5' } } }),
    ]),
  ])),
], { backgroundColor: 'secondary', textColor: 'base', style: { border: { radius: '20px' }, spacing: { padding: { top: '32px', bottom: '16px', left: '32px', right: '32px' } } } });

const hours = [['Monday – Friday', '8am – 8pm ET'], ['Saturday', '9am – 5pm ET'], ['Sunday', 'Closed']];
const hoursCard = stack('14px', [
  P('Office hours', { style: { typography: { fontSize: F.s17, fontWeight: '600' } } }),
  ...hours.map(([d, t]) => c('core/group', {
    style: { border: { bottom: { color: RULE, width: '1px' } }, spacing: { padding: { bottom: '10px' }, blockGap: '16px' } },
    layout: { type: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between' },
  }, [P(d, { style: { color: { text: MUTED }, typography: { fontSize: F.s15 } } }), P(t, { style: { typography: { fontSize: F.s15, fontWeight: '600' } } })])),
  iconText('Clients currently traveling can reach the concierge 24/7.', 'headset', { primary: true, color: MUTED, size: F.sm }),
], { style: { color: { background: CREAM }, border: { radius: '20px', width: '1px', color: RULE }, spacing: { padding: { top: '28px', bottom: '28px', left: '28px', right: '28px' } } } });

const reviewCard = stack('12px', [
  P('5 out of 5 stars', { className: `${p}-stars`, textColor: 'primary' }),
  P('“I sent a two-line email. Two days later we had an itinerary that felt like it had been written for us.”', { style: { typography: { fontSize: '1rem', lineHeight: '1.55' } } }),
  P('<strong>Sample traveler</strong> · Pacific Coast Grand Drive', { style: { color: { text: MUTED }, typography: { fontSize: F.sm } } }),
], { style: { border: { radius: '20px', width: '1px', color: RULE }, spacing: { padding: { top: '28px', bottom: '28px', left: '28px', right: '28px' } } } });

const enquiry = section([
  twoCol(
    [stack('28px', [
      stack('8px', [eyebrow('Trip enquiry'), h2('Tell us about your trip'), mutedP('Rough ideas are fine. The more we know, the better our first proposal.', F.s17, '1.55')]),
      formCard,
    ])],
    [stack('20px', [nextCard, hoursCard, reviewCard])],
    { align: 'wide', v: 'top', gap: '56px', lw: '62%', rw: '38%', className: `${p}-cols-stack-tablet`, rc: `${p}-enquiry-aside` },
  ),
], pad(SP.s88, SP.s88), { anchor: 'enquiry' });

// 4. Book a consultation ----------------------------------------------------------------------
const consultCard = c('core/group', {
  className: `${p}-cf7 ${p}-cf7--consult`, backgroundColor: 'base',
  style: { border: { radius: '20px' }, shadow: 'var:preset|shadow|sm', spacing: { padding: { top: 'clamp(1.5rem, 3vw, 2rem)', bottom: 'clamp(1.5rem, 3vw, 2rem)', left: 'clamp(1.25rem, 3vw, 2rem)', right: 'clamp(1.25rem, 3vw, 2rem)' } } },
  layout: { type: 'default' },
}, [c('core/shortcode', { text: '[contact-form-7 id="REPLACE-WITH-CONSULTATION-FORM-ID" title="Consultation request"]' })]);
const consult = section([
  twoCol([stack('12px', [
    eyebrow('Prefer to talk?'),
    h2('Book a free 30-minute consultation'),
    mutedP('Pick a time for a phone or video call with a travel designer. Times are shown in Eastern Time.', F.s17, '1.55'),
    stack('10px', [
      iconText('Phone or video, your choice', 'video', { primary: true }),
      iconText('Matched to a destination specialist', 'user-check', { primary: true }),
      iconText('Draft itinerary within 48 hours of the call', 'file-text', { primary: true }),
    ], { style: { spacing: { margin: { top: '12px' } } } }),
  ])], [consultCard], { align: 'wide', v: 'top', className: `${p}-cols-stack-tablet` }),
], pad(SP.s96, SP.s96), { backgroundColor: 'subtle', anchor: 'consult' });

// 5. Offices ---------------------------------------------------------------------------------------
const offices = [
  ['Head office · United States', 'Seattle', '1200 Example Avenue, Suite 400<br>Seattle, WA 98101', '+1 (800) 555-0142', 'Seattle city skyline'],
  ['Canada office', 'Vancouver', '800 Example Street, Suite 1500<br>Vancouver, BC V6C 0A0', '+1 (800) 555-0143', 'Vancouver harbour and city skyline'],
];
const officeCard = ([tag, city, address, phone, alt]) => c('core/columns', {
  className: `${p}-svc-row`, backgroundColor: 'base',
  style: { border: { radius: '20px', width: '1px', color: RULE }, spacing: { blockGap: { left: '0px' } } },
}, [
  c('core/column', { width: '50%' }, [
    c('core/group', { className: `${p}-media-stat ${p}-media-stat--sm`, layout: { type: 'default' } }, [
      c('core/image', { url: PH + 'placeholder-landscape.svg', alt, scale: 'cover', sizeSlug: 'large', linkDestination: 'none' }),
    ]),
  ]),
  c('core/column', { width: '50%', style: { spacing: { padding: { top: '32px', bottom: '32px', left: '32px', right: '32px' }, blockGap: '14px' } } }, [
    P(tag, { textColor: 'primary', style: { typography: { fontSize: F.xs, fontWeight: '600' } } }),
    P(city, { style: { typography: { fontSize: '1.625rem', fontWeight: '700', letterSpacing: '-0.01em', lineHeight: '1.2' } } }),
    mutedP(address, F.s15, '1.55'),
    iconText(phone, 'phone', { primary: true }),
    iconText('Mon–Fri 9am–6pm PT', 'clock', { primary: true }),
    P('<a href="#">Get directions</a>', { className: `${p}-link-after ts-icon--arrow-up-right`, style: { typography: { fontSize: F.s15, fontWeight: '600' }, spacing: { margin: { top: '8px' } }, ...linkEl() } }),
  ]),
]);
const officesSection = section([
  wide([
    stack('8px', [eyebrow('Our offices'), h2('Visit us, by appointment')]),
    grid(2, '28rem', '24px', offices.map(officeCard), { className: `${p}-grid-stack-tablet` }),
  ], { style: { spacing: { blockGap: '32px' } } }),
], pad(SP.s96, SP.s96));

// 6. Already traveling -----------------------------------------------------------------------------
const traveling = section([
  c('core/group', {
    align: 'wide', backgroundColor: 'secondary', textColor: 'base', className: 'is-style-ts-section-dark',
    style: { border: { radius: '20px' }, spacing: { padding: { top: '48px', bottom: '48px', left: 'clamp(1.5rem, 4vw, 3.5rem)', right: 'clamp(1.5rem, 4vw, 3.5rem)' }, blockGap: '32px' } },
    layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', verticalAlignment: 'center' },
  }, [
    stack('6px', [
      P('Already traveling with us?', { style: { typography: { fontSize: 'clamp(1.375rem, 1.2rem + 0.6vw, 1.625rem)', fontWeight: '700', lineHeight: '1.25' } } }),
      P('Use the 24/7 concierge line on your itinerary. Average reply under 10 minutes, any hour.', { style: { color: { text: DARK_MUTED }, typography: { fontSize: '1rem', lineHeight: '1.5' } } }),
    ], { className: `${p}-icon-side ${p}-icon-side--outline ${p}-icon-side--xl ts-icon--headset`, style: { layout: { selfStretch: 'fill' } } }),
    c('core/buttons', { style: { spacing: { blockGap: '12px' } } }, [
      c('core/button', {
        text: 'WhatsApp', url: '#', className: `${p}-chip ts-icon--message-circle`, textColor: 'base',
        style: { color: { background: 'transparent' }, border: { radius: '999px', width: '1px', color: 'rgba(255,255,255,0.4)' }, spacing: { padding: { top: '14px', bottom: '14px', left: '22px', right: '22px' } }, typography: { fontSize: '1rem', fontWeight: '500' } },
      }),
      pillButton('+1 (800) 555-0199', 'tel:+18005550199', 'white', { attrs: { className: `${p}-chip ts-icon--phone` } }),
    ]),
  ]),
], pad('0', SP.s96));

// 7. Quick answers ---------------------------------------------------------------------------------
const faqs = [
  ['Is the consultation really free?', 'Yes. The first call and your draft itinerary carry no cost and no obligation. A planning fee only applies to some shorter trips, and it is credited back when you book.'],
  ['How quickly will I hear back?', 'Within one business day for enquiries, and usually the same day. If you are already traveling, the 24/7 concierge replies in under 10 minutes on average.'],
  ['Can I visit your office?', 'Yes, by appointment at our Seattle and Vancouver offices. Most clients prefer phone or video, which works just as well.'],
];
const quickFaq = section([
  twoCol([stack('12px', [
    eyebrow('Before you get in touch'),
    H('Quick answers', 2, { style: { typography: { fontSize: 'clamp(1.625rem, 1.3rem + 1vw, 2rem)', fontWeight: '700', letterSpacing: '-0.015em', lineHeight: '1.2' } } }),
    P('<a href="/faq/">See all FAQs</a>', { className: `${p}-link-after ts-icon--arrow-right`, style: { typography: { fontSize: F.s15, fontWeight: '500' }, ...linkEl() } }),
  ])], [c('core/group', { className: `${p}-faq`, style: { spacing: { blockGap: '0' } }, layout: { type: 'default' } },
    faqs.map(([q, a], i) => c('core/details', { summary: q, showContent: i === 0 }, [mutedP(a, '1rem', '1.6')])))],
  { align: 'wide', v: 'top' }),
], pad('0', SP.s96));

const page = [hero, channelsBand, enquiry, consult, officesSection, traveling, quickFaq];
return { slug: 'travel-royale-contact-blocks', blocks: page };
}
