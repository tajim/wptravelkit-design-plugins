// Block-building kit: small helpers that create core blocks through @wordpress/blocks,
// so the markup is exactly what the editor itself would save.
//
//   import { loadWP } from './env.mjs';
//   import { createKit } from './kit.mjs';
//   const kit = createKit(loadWP('wp-7.0').B, tokens);   // tokens: see DEFAULT_TOKENS
//   const { c, P, H, stack, grid, section, write } = kit;
//
// Every block goes through c(), which refuses attributes the block does not register.
// That single guard catches most silent breakages (for example textAlign moving into
// style.typography in WP 7.0).
import fs from 'node:fs';
import { registerWpteBlocks } from './wpte.mjs';

export const DEFAULT_TOKENS = {
  prefix: 'tr', // class prefix for child-theme components, e.g. tr-icon-tile
  themeSlug: 'travel-royale', // used for theme image paths
  colors: {
    muted: '#625d55', // secondary text
    cream: '#faf8f4', // light card background
    rule: '#e6e1d8', // borders and dividers
    control: '#d6d0c5', // input and outline-button borders
    heroSub: '#e9ecee', // secondary text on dark images
    darkEyebrow: '#bccdc2', // eyebrow on dark sections
    darkText: '#c9ced1', // body text on dark sections
    darkMuted: '#c3c8cc', // small text on dark sections
  },
  fontSizes: {
    h2: 'clamp(2rem, 1.4rem + 1.6vw, 2.5rem)',
    h1: 'clamp(2.5rem, 1.5rem + 3.2vw, 4rem)',
    stat: 'clamp(1.75rem, 1.3rem + 1.2vw, 2.125rem)',
    sm: '0.875rem',
    xs: '0.8125rem',
    s15: '0.9375rem',
    s17: '1.0625rem',
    s18: '1.125rem',
    s19: '1.1875rem',
    s20: '1.25rem',
    s30: 'clamp(1.5rem, 1.1rem + 1.2vw, 1.875rem)',
    s44: 'clamp(2rem, 1.3rem + 2vw, 2.75rem)',
  },
  spacing: {
    s24: '24px',
    s36: 'clamp(1.75rem, 3vw, 2.25rem)',
    s72: 'clamp(3rem, 6vw, 4.5rem)',
    s88: 'clamp(3.5rem, 7vw, 5.5rem)',
    s96: 'clamp(3.5rem, 7.5vw, 6rem)',
  },
};

function merge(base, over = {}) {
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && typeof base[k] === 'object' ? { ...base[k], ...v } : v;
  }
  return out;
}

export function createKit(B, tokens = {}) {
  const T = merge(DEFAULT_TOKENS, tokens);
  const { colors: K, fontSizes: F, spacing: SP, prefix } = T;
  registerWpteBlocks(B);

  const c = (name, attrs = {}, inner = []) => {
    const type = B.getBlockType(name);
    if (!type) throw new Error(`Unknown block "${name}"`);
    for (const k of Object.keys(attrs)) {
      if (!(k in type.attributes)) throw new Error(`Unknown attribute "${k}" on ${name}`);
    }
    return B.createBlock(name, attrs, inner);
  };

  // Images
  const pexels = (id, w = 900) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
  const themeImage = (file) => `/wp-content/themes/${T.themeSlug}/assets/images/${file}`;
  const placeholder = (kind = 'landscape') => themeImage(`placeholder-${kind}.svg`);

  // Style fragments
  const pad = (top, bottom, extra = {}) => ({ spacing: { padding: { top, bottom }, margin: { top: '0', bottom: '0' }, ...extra } });
  const linkEl = (color = 'var:preset|color|primary') => ({ elements: { link: { color: { text: color }, typography: { textDecoration: 'none' } } } });

  // Text
  const P = (content, attrs = {}) => c('core/paragraph', { content, ...attrs });
  const muted = (content, size = F.sm, extra = {}) => P(content, { style: { color: { text: K.muted }, typography: { fontSize: size } }, ...extra });
  const H = (content, level, attrs = {}) => c('core/heading', { content, level, ...attrs });
  const eyebrow = (text, color = 'primary') => P(text, { textColor: color === 'primary' ? 'primary' : undefined, style: { ...(color !== 'primary' ? { color: { text: color } } : {}), typography: { fontSize: F.sm, fontWeight: '600' } } });
  const h2 = (text, extra = {}) => H(text, 2, { style: { typography: { fontSize: F.h2, fontWeight: '700', letterSpacing: '-0.015em', lineHeight: '1.15' } }, ...extra });

  // Layout
  const group = (inner, attrs = {}) => c('core/group', { layout: { type: 'default' }, ...attrs }, inner);
  const stack = (gap, inner, attrs = {}) => group(inner, { ...attrs, style: { ...(attrs.style || {}), spacing: { ...((attrs.style || {}).spacing || {}), blockGap: gap } } });
  const row = (inner, opts = {}) => c('core/group', {
    style: { spacing: { blockGap: opts.gap || '16px' } },
    layout: { type: 'flex', flexWrap: opts.wrap || 'wrap', justifyContent: opts.justify || 'space-between', verticalAlignment: opts.align || 'center' },
    ...(opts.attrs || {}),
  }, inner);
  // Grid: ONE gap value only. WordPress puts the gap into its column formula, and a
  // two-value gap ("32px 0px") makes that formula invalid, so the grid falls back to 1 column.
  const grid = (cols, minW, gap, inner, attrs = {}) => {
    if (typeof gap !== 'string' || /\s/.test(gap.trim())) throw new Error('grid(): use a single gap value');
    return c('core/group', { ...attrs, style: { ...(attrs.style || {}), spacing: { blockGap: gap } }, layout: { type: 'grid', columnCount: cols, minimumColumnWidth: minW } }, inner);
  };
  const section = (inner, style, attrs = {}) => c('core/group', { align: 'full', backgroundColor: 'base', style, layout: { type: 'constrained' }, ...attrs }, inner);
  const darkSection = (inner, style, attrs = {}) => c('core/group', { align: 'full', className: 'is-style-ts-section-dark', backgroundColor: 'secondary', textColor: 'base', style, layout: { type: 'constrained' }, ...attrs }, inner);
  const wide = (inner, attrs = {}) => c('core/group', { align: 'wide', layout: { type: 'default' }, ...attrs }, inner);

  // Buttons
  const arrowLink = (text, href = '#', color = 'primary') => c('core/buttons', {}, [
    c('core/button', { text, url: href, className: 'is-style-ts-arrow', textColor: color, style: { typography: { fontSize: F.s15, fontWeight: '500' } } }),
  ]);
  const pillButton = (text, href, kind = 'primary', extra = {}) => {
    const looks = {
      primary: { backgroundColor: 'primary', textColor: 'primary-inverse' },
      white: { backgroundColor: 'base', textColor: 'heading' },
      outline: { backgroundColor: 'base', textColor: 'heading', border: { width: '1px', color: K.control } },
    }[kind];
    const { border, ...colorAttrs } = looks;
    return c('core/button', {
      text, url: href, ...colorAttrs, ...extra.attrs,
      style: {
        border: { radius: '999px', ...(border || {}) },
        spacing: { padding: { top: extra.py || '14px', bottom: extra.py || '14px', left: extra.px || '24px', right: extra.px || '24px' } },
        typography: { fontSize: extra.size || '1rem', fontWeight: kind === 'outline' ? '500' : '600' },
      },
    });
  };

  // Components (need the matching CSS from the child theme's components.css)
  const iconTile = (icon, title, size = F.s17) => P(title, { className: `${prefix}-icon-tile ts-icon--${icon}`, style: { typography: { fontSize: size, fontWeight: '600' } } });

  const sectionHeader = (eb, title, right, sub) => c('core/group', {
    style: { spacing: { blockGap: '32px' } },
    layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', verticalAlignment: 'bottom' },
  }, [
    stack('8px', [eyebrow(eb), h2(title), ...(sub ? [muted(sub, F.s17, { style: { color: { text: K.muted }, typography: { fontSize: F.s17, lineHeight: '1.55' } } })] : [])], { layout: { type: 'constrained', contentSize: '640px', justifyContent: 'left' } }),
    ...(right ? [right] : []),
  ]);

  /**
   * Image call-to-action band with a white contact card.
   * card: { title, primary: [text, href], secondary: [text, href] }
   */
  const ctaBand = ({ img, title, text, note, card }) => {
    const ctaCard = stack('14px', [
      P(card.title, { style: { typography: { fontSize: F.s18, fontWeight: '600' } } }),
      c('core/buttons', { style: { spacing: { blockGap: '10px' } }, layout: { type: 'flex', orientation: 'vertical', justifyContent: 'stretch' } }, [
        pillButton(card.primary[0], card.primary[1], 'primary', { attrs: { width: 100 } }),
        pillButton(card.secondary[0], card.secondary[1], 'outline', { attrs: { width: 100 } }),
      ]),
      P(note, { style: { color: { text: K.muted }, typography: { fontSize: F.sm, textAlign: 'center' } } }),
    ], { backgroundColor: 'base', textColor: 'heading', style: { border: { radius: '16px' }, spacing: { padding: { top: '28px', bottom: '28px', left: '28px', right: '28px' } } } });
    return section([
      c('core/cover', {
        url: img, alt: '', dimRatio: 100, isUserOverlayColor: true, isDark: true, align: 'wide',
        customGradient: 'linear-gradient(90deg,rgba(16,18,20,0.8) 0%,rgba(16,18,20,0.45) 60%,rgba(16,18,20,0.2) 100%)',
        style: { border: { radius: '20px' }, spacing: { padding: { top: SP.s72, bottom: SP.s72, left: 'clamp(1.5rem, 4.5vw, 4rem)', right: 'clamp(1.5rem, 4.5vw, 4rem)' } } },
        layout: { type: 'default' },
      }, [
        c('core/columns', { verticalAlignment: 'center', style: { spacing: { blockGap: { left: '48px' } } } }, [
          c('core/column', { width: '58.33%' }, [stack('14px', [
            H(title, 2, { textColor: 'base', style: { typography: { fontSize: F.s44, fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.12' } } }),
            P(text, { style: { color: { text: K.heroSub }, typography: { fontSize: F.s18, lineHeight: '1.55' } } }),
          ])]),
          c('core/column', { width: '41.66%' }, [ctaCard]),
        ]),
      ]),
    ], pad('0', SP.s96));
  };

  /**
   * Full-width hero cover for the top of a Block Canvas page (the header overlays it).
   * Never give it a contentPosition other than center: that shrink-wraps the inner
   * container and pushes the text to the screen edge on wide screens.
   */
  const heroCover = ({ img, gradient, minHeight = 600, top = '128px', contentSize = '1344px', innerSize = '860px', center = false }, inner) => c('core/cover', {
    url: img, alt: '', dimRatio: 100, isUserOverlayColor: true, isDark: true,
    customGradient: gradient,
    minHeight, minHeightUnit: 'px', align: 'full',
    style: { spacing: { padding: { top, bottom: SP.s72, left: 'var(--wp--style--root--padding-left)', right: 'var(--wp--style--root--padding-right)' }, margin: { top: '0', bottom: '0' } } },
    layout: { type: 'constrained', contentSize: center ? innerSize : contentSize },
  }, center ? inner : [stack('20px', inner, { layout: { type: 'constrained', contentSize: innerSize, justifyContent: 'left' } })]);

  const serialize = (blocks) => blocks.map((b) => B.serialize(b)).join('\n\n') + '\n';
  const write = (file, blocks) => {
    fs.writeFileSync(file, serialize(blocks));
    console.log(`wrote ${file}`);
  };

  return {
    B, T, K, F, SP, prefix,
    c, pexels, themeImage, placeholder, pad, linkEl,
    P, muted, H, eyebrow, h2,
    group, stack, row, grid, section, darkSection, wide,
    arrowLink, pillButton, iconTile, sectionHeader, ctaBand, heroCover,
    serialize, write,
  };
}
