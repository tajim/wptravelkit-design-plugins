// Everything a starter template consists of, collected once from the project, so the Local
// loader (load-starter.mjs) and the Demo Importer Plus package (starter-package.mjs) can never
// disagree about what the demo contains.
//
// project.json fields used (see references/starter-template.md for the full shape):
//   theme.name / slug / classPrefix / colors / font        as in child mode
//   starter.demoSlug, demoUrl, assetUrl, fonts, header, containerWidth, menuPages, frontPage,
//   starter.themeMods (extra raw theme_mods), starter.patternCategory
//   pages[]: slug, title (order = menu order unless starter.menuPages says otherwise)
import fs from 'node:fs';
import path from 'node:path';
import { STARTER_DIR } from './retheme.mjs';

export const ASSET_TOKEN = '/d2b-assets/';
export const MENU_LOCATION = 'menu-1'; // Travelscape's primary menu location
export const BLOCK_CANVAS = 'page-templates/template-block-canvas.php';

const TYPO_KEYS = ['base', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'navigation_links'];
// Travelscape Pro 1.0.4 defaults (inc/customizer/travelscape-customizer-defaults.php): sizes per
// level, desktop / tablet / mobile. Block pages set their own sizes, so these only reach
// headings and text that have no size in the markup.
const PRO_SIZES = {
  base: ['18px', '18px', '18px'], h1: ['30px', '24px', '18px'], h2: ['26px', '22px', '17px'], h3: ['24px', '20px', '16px'],
  h4: ['24px', '20px', '16px'], h5: ['24px', '20px', '16px'], h6: ['24px', '20px', '16px'], navigation_links: ['18px', '18px', '16px'],
};

function proTypography(font, variant, sizes, lineHeight) {
  const [d, t, m] = sizes;
  return JSON.stringify({
    font,
    variant: String(variant),
    fontsize_desktop: d, fontsize_tablet: t, fontsize_mobile: m,
    lineheight_desktop: lineHeight, lineheight_tablet: lineHeight, lineheight_mobile: lineHeight,
    texttransform_desktop: 'none', texttransform_tablet: 'none', texttransform_mobile: 'none',
    textalign_desktop: 'left', textalign_tablet: 'left', textalign_mobile: 'left',
  });
}

export function starterConfig(project) {
  const theme = project.theme || {};
  const st = project.starter || {};
  const demoSlug = st.demoSlug || theme.slug;
  if (!demoSlug) throw new Error('starter.demoSlug (or theme.slug) is missing in .d2b/project.json');
  return {
    demoSlug,
    name: theme.name || demoSlug,
    prefix: theme.classPrefix,
    demoUrl: (st.demoUrl || `https://preview.wptravelkit.com/${demoSlug}`).replace(/\/$/, ''),
    // Must look like an upload URL (contains content/uploads) or the importer will not swap it.
    assetUrl: (st.assetUrl || `https://preview.wptravelkit.com/wp-content/uploads/demos/${demoSlug}/`).replace(/\/?$/, '/'),
    patternCategory: st.patternCategory || { slug: demoSlug, name: theme.name || demoSlug },
    menu: { slug: `${demoSlug}-primary`, name: `${theme.name || demoSlug} Menu` },
    frontPage: st.frontPage || (project.pages || [])[0]?.slug,
    st,
    theme,
  };
}

/** Pages that have built markup, in project order. */
export function starterPages(project) {
  const outDir = path.join(project.root, '.d2b', 'out');
  return (project.pages || [])
    .map((p) => ({ ...p, file: path.join(outDir, `${p.slug}.txt`) }))
    .filter((p) => fs.existsSync(p.file))
    .map((p) => ({ slug: p.slug, title: p.title || p.slug, content: fs.readFileSync(p.file, 'utf8'), template: BLOCK_CANVAS }));
}

/** Image files the pages use, with where each one comes from on this machine. */
export function starterAssets(project, pages) {
  const re = new RegExp(`${ASSET_TOKEN.replace(/\//g, '\\/')}([A-Za-z0-9._-]+)`, 'g');
  const files = new Set();
  for (const p of pages) for (const m of p.content.matchAll(re)) files.add(m[1]);
  const projectImages = path.join(project.root, '.d2b', 'starter', 'images');
  return [...files].sort().map((file) => {
    const candidates = [path.join(projectImages, file), path.join(STARTER_DIR, 'images', file)];
    const src = candidates.find((f) => fs.existsSync(f));
    if (!src) throw new Error(`Image "${file}" is used on a page but is not in .d2b/starter/images/ or the plugin's starter images.`);
    return { file, src };
  });
}

/** Replace the asset token with real URLs: urlFor(file) -> url. */
export function swapAssets(content, urlFor) {
  return content.replace(new RegExp(`${ASSET_TOKEN.replace(/\//g, '\\/')}([A-Za-z0-9._-]+)`, 'g'), (_, f) => urlFor(f));
}

/** The theme_mods the demo's Customizer data sets (Additional CSS is added separately). */
export function starterThemeMods(project) {
  const { theme, st } = starterConfig(project);
  const c = theme.colors || {};
  const need = ['primary', 'secondary', 'body', 'subtle', 'border'];
  const missing = need.filter((k) => !c[k]);
  if (missing.length) throw new Error(`theme.colors is missing: ${missing.join(', ')}`);
  const mods = {
    // Travelscape 1.0.24+: turns the block system on for this parent-only site.
    travelscape_block_system: true,
    travelscape_color_ed: JSON.stringify({
      'primary-color': c.primary,
      'secondary-color': c.secondary,
      'body-color': c.body,
      'heading-color': c.heading || c.body,
      'subtle-color': c.subtle,
      'border-color': c.border,
      'base-color': c.base || '#ffffff',
    }),
  };

  // Fonts: Travelscape Pro's typography settings. Headings fall back to the body font.
  const body = st.fonts?.body || { family: theme.font?.family, variant: '400' };
  const heading = st.fonts?.heading || null;
  if (!body.family) throw new Error('starter.fonts.body.family (or theme.font.family) is missing');
  const lh = st.fonts?.lineHeight || '1.6';
  for (const level of TYPO_KEYS) {
    const isHeading = /^h\d$/.test(level);
    // Headings always name a font (the body font when the design has one font): Travelscape
    // 1.0.24 takes the heading weight from the H1 setting only when its font is not "inherit".
    const font = level === 'base' ? body.family : isHeading ? (heading?.family || body.family) : 'inherit';
    const variant = level === 'base' ? (body.variant || '400') : isHeading ? (heading?.variant || (level === 'h1' ? '700' : '600')) : '500';
    const sizes = st.fonts?.sizes?.[level] || PRO_SIZES[level];
    mods[`travelscape_typography_${level}`] = proTypography(font, variant, sizes, level === 'base' ? (st.fonts?.bodyLineHeight || '1.6') : lh);
  }

  const h = st.header || {};
  if (h.buttonText !== undefined) mods.travelscape_header_element_button_text = h.buttonText;
  if (h.buttonUrl !== undefined) mods.travelscape_header_element_button_url = h.buttonUrl;
  if (h.phoneLabel !== undefined) mods.travelscape_header_phone_label = h.phoneLabel;
  if (h.phoneNumber !== undefined) mods.travelscape_header_phone_number = h.phoneNumber;
  if (h.email !== undefined) mods.travelscape_header_email = h.email;
  if (h.topbar !== undefined) mods.travelscape_layout_site_header_topbar_ed = h.topbar ? '1' : '';
  if (h.sticky !== undefined) mods.travelscape_layout_site_header_sticky_ed = h.sticky ? '1' : '';
  if (st.containerWidth) mods.travelscape_layout_default_container_width = String(st.containerWidth).replace(/px$/, '');

  return { ...mods, ...(st.themeMods || {}) };
}

export function readAdditionalCss(project) {
  const f = path.join(project.root, '.d2b', 'starter', 'additional.css');
  if (!fs.existsSync(f)) throw new Error('.d2b/starter/additional.css is missing: run starter-css.mjs first.');
  return fs.readFileSync(f, 'utf8');
}

/** Menu pages in order: starter.menuPages, else every built page. */
export function menuPages(project, pages) {
  const order = project.starter?.menuPages;
  if (!order) return pages.map((p) => p.slug);
  const known = new Set(pages.map((p) => p.slug));
  return order.filter((s) => known.has(s));
}
