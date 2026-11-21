// Build the Demo Importer Plus package for a starter template.
//
// Usage: node starter-package.mjs [--out <folder>] [--extra-wxr <export.xml>] [--date "YYYY-MM-DD HH:MM:SS"]
//
// Output folder (default .d2b/package/<demoSlug>/):
//   <demoSlug>.xml          content: images (attachments), pages (Block Canvas), one unsynced
//                           pattern per page ("My patterns", in the template's category), the menu
//   images/                 the image files; upload them so they are reachable at starter.assetUrl
//   customizer-data.json    the record's "customizer-data": Travelscape colors, Travelscape Pro
//                           fonts, the block switch, header settings, and "custom-css" (Additional CSS)
//   site-option.json        the record's "site-option": front page (by title), menu location (by slug)
//   widgets-data.json       the record's "widgets-data" (empty: the Customizer footer is used)
//   screenshots/            full-page screenshots from the visual check, for the record's pages
//   record.md               which file goes in which field of the dipa-demos record, and checks
//
// --extra-wxr: add the terms and items of another export (e.g. the sample trips from
// Tools > Export > Trips) so WP Travel Engine blocks have trips to show after import.
//
// Formats follow Demo Importer Plus 2.0.12: the Customizer data replaces every theme_mod of the
// active theme and its "custom-css" key becomes the Additional CSS; site options map
// page_on_front by page title and nav_menu_locations by menu slug; image URLs in content are
// swapped for the imported uploads only when they look like upload URLs (contain
// "content/uploads" or a YYYY/MM folder), so starter.assetUrl must be one.
import fs from 'node:fs';
import path from 'node:path';
import { argValue, readProject } from './lib/env.mjs';
import {
  MENU_LOCATION, starterConfig, starterPages, starterAssets, starterThemeMods, readAdditionalCss, menuPages, swapAssets,
} from './lib/starter.mjs';
import { writeWxr, extractWxrParts } from './lib/wxr.mjs';

const project = readProject();
if (!project) { console.error('No .d2b/project.json here.'); process.exit(2); }
const cfg = starterConfig(project);
const pages = starterPages(project);
if (!pages.length) { console.error('No built pages in .d2b/out yet.'); process.exit(2); }
const assets = starterAssets(project, pages);
const css = readAdditionalCss(project);
const themeMods = starterThemeMods(project);
const outDir = path.resolve(argValue('--out') || path.join(project.root, '.d2b', 'package', cfg.demoSlug));
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, 'images'), { recursive: true });

const warnings = [];
if (!/content\/uploads|\/\d{4}\/\d{2}\//.test(cfg.assetUrl)) {
  warnings.push(`starter.assetUrl (${cfg.assetUrl}) does not look like an upload URL: Demo Importer Plus would import the images but leave the pages pointing at your server. Use a folder under wp-content/uploads.`);
}
const now = argValue('--date') || new Date().toISOString().slice(0, 19).replace('T', ' ');

// Extra content (sample trips): keep its ids, start ours above them.
let extra = { terms: [], items: [], ids: [], termIds: [] };
const extraFile = argValue('--extra-wxr') || project.starter?.extraWxr;
if (extraFile) {
  extra = extractWxrParts(fs.readFileSync(path.resolve(project.root, extraFile), 'utf8'));
  if (!extra.items.length) warnings.push(`${extraFile} has no <item> entries.`);
}
let nextId = Math.max(90000, ...extra.ids) + 1;
let nextTerm = Math.max(9000, ...extra.termIds) + 1;

const terms = [
  { id: nextTerm++, taxonomy: 'nav_menu', slug: cfg.menu.slug, name: cfg.menu.name },
  { id: nextTerm++, taxonomy: 'wp_pattern_category', slug: cfg.patternCategory.slug, name: cfg.patternCategory.name },
];

const items = [];
// Images.
const urlFor = (file) => cfg.assetUrl + file;
for (const a of assets) {
  fs.copyFileSync(a.src, path.join(outDir, 'images', a.file));
  items.push({
    id: nextId++, type: 'attachment', status: 'inherit', title: a.file.replace(/\.[a-z]+$/, ''), slug: a.file.replace(/\.[a-z]+$/, ''),
    attachmentUrl: urlFor(a.file), link: urlFor(a.file), meta: { _d2b_asset: `${cfg.demoSlug}/${a.file}` },
  });
}
// Pages.
const pageIds = {};
pages.forEach((p, i) => {
  const id = nextId++;
  pageIds[p.slug] = id;
  items.push({
    id, type: 'page', title: p.title, slug: p.slug, menuOrder: i, link: `${cfg.demoUrl}/${p.slug}/`,
    content: swapAssets(p.content, urlFor), meta: { _wp_page_template: p.template },
  });
});
// Patterns (My patterns).
for (const p of pages) {
  items.push({
    id: nextId++, type: 'wp_block', title: `${cfg.name}: ${p.title}`, slug: `${cfg.demoSlug}-${p.slug}`,
    content: swapAssets(p.content, urlFor), meta: { wp_pattern_sync_status: 'unsynced' },
    terms: [{ taxonomy: 'wp_pattern_category', slug: cfg.patternCategory.slug, name: cfg.patternCategory.name }],
  });
}
// Menu.
const inMenu = menuPages(project, pages);
inMenu.forEach((slug, i) => {
  const id = nextId++;
  items.push({
    id, type: 'nav_menu_item', title: '', slug: String(id), menuOrder: i + 1,
    meta: {
      _menu_item_type: 'post_type',
      _menu_item_menu_item_parent: '0',
      _menu_item_object_id: String(pageIds[slug]),
      _menu_item_object: 'page',
      _menu_item_target: '',
      _menu_item_classes: 'a:1:{i:0;s:0:"";}',
      _menu_item_xfn: '',
      _menu_item_url: '',
    },
    terms: [{ taxonomy: 'nav_menu', slug: cfg.menu.slug, name: cfg.menu.name }],
  });
});

const siteUrl = new URL(cfg.demoUrl).origin;
let xml = writeWxr({ title: cfg.name, siteUrl, blogUrl: cfg.demoUrl, date: now, terms, items });
if (extra.items.length || extra.terms.length) {
  xml = xml.replace('\t<item>', `${extra.terms.map((t) => `\t${t}`).join('\n')}\n\t<item>`);
  xml = xml.replace('</channel>', `${extra.items.map((t) => `\t${t}`).join('\n')}\n</channel>`);
}
const xmlFile = path.join(outDir, `${cfg.demoSlug}.xml`);
fs.writeFileSync(xmlFile, xml);

// Customizer data: theme_mods + Additional CSS. No nav_menu_locations or custom_css_post_id:
// their ids would be the export site's; site options set the menu after the content import.
const customizer = { ...themeMods, 'custom-css': css };
fs.writeFileSync(path.join(outDir, 'customizer-data.json'), JSON.stringify(customizer, null, 2) + '\n');

// Demo Importer Plus tries to download every Customizer value that contains ".jpg", ".png",
// ".svg" or ".gif" (it takes them for image URLs). Harmless when the download fails, but say so.
for (const [k, v] of Object.entries(customizer)) {
  if (typeof v === 'string' && /\.(jpg|jpeg|svg|png|gif)/i.test(v) && !/^https?:\/\/\S+$/.test(v)) {
    warnings.push(`Customizer value "${k}" contains an image file extension; Demo Importer Plus will try to download it as an image (it fails and keeps the value, but slows the import).`);
  }
}

const front = pages.find((p) => p.slug === cfg.frontPage);
const siteOptions = {
  show_on_front: 'page',
  page_on_front: front ? front.title : '',
  nav_menu_locations: { [MENU_LOCATION]: cfg.menu.slug },
  ...(project.starter?.logoUrl ? { custom_logo: project.starter.logoUrl } : {}),
};
fs.writeFileSync(path.join(outDir, 'site-option.json'), JSON.stringify(siteOptions, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'widgets-data.json'), '{}\n');

// Screenshots from the visual check.
const shots = [];
for (const p of pages) {
  const f = path.join(project.root, '.d2b', 'shots', p.slug, 'wp-1440.png');
  if (fs.existsSync(f)) {
    fs.mkdirSync(path.join(outDir, 'screenshots'), { recursive: true });
    fs.copyFileSync(f, path.join(outDir, 'screenshots', `${p.slug}.png`));
    shots.push(p.slug);
  }
}
const noShot = pages.map((p) => p.slug).filter((s) => !shots.includes(s));
if (noShot.length) warnings.push(`No screenshot for: ${noShot.join(', ')} (run screenshot.mjs for those pages).`);
if (front && !front.title) warnings.push('The front page has no title: page_on_front is matched by title.');
const titles = pages.map((p) => p.title);
if (new Set(titles).size !== titles.length) warnings.push('Two pages share a title: Demo Importer Plus finds the front page by title, so make titles unique.');

const plugins = [
  { name: 'WP Travel Engine - Travel and Tour Booking Plugin', slug: 'wp-travel-engine', init: 'wp-travel-engine/wp-travel-engine.php' },
  ...(project.forms === 'cf7' ? [{ name: 'Contact Form 7', slug: 'contact-form-7', init: 'contact-form-7/wp-contact-form-7.php' }] : []),
];
const xmlName = path.basename(xmlFile);
const record = `# ${cfg.name}: Demo Importer Plus record

Built ${now} from ${pages.length} page(s): ${pages.map((p) => p.title).join(', ')}.

## 1. Upload the files

| File | Upload to | Becomes |
|---|---|---|
| \`${xmlName}\` | your demos folder, e.g. \`https://preview.wptravelkit.com/demos/${xmlName}\` | the record's **wxr-path** |
| \`images/*\` (${assets.length}) | exactly \`${cfg.assetUrl}\` | downloaded by the importer; must be reachable before anyone imports |
| \`screenshots/*.png\` | the media library of preview.wptravelkit.com | the pages' **fullpage-screenshot** and the **site_featured_image** |

Check one image in a browser: ${assets[0] ? `${cfg.assetUrl}${assets[0].file}` : '(no images)'}

## 2. Fill the dipa-demos record

| Field | Value |
|---|---|
| theme_slug | \`travelscape\` (the parent: starter templates have no child theme) |
| theme_name | Travelscape |
| site_title | ${cfg.name} |
| site_url | ${cfg.demoUrl} |
| site_type | ${project.starter?.siteType || 'pro'} (needs Travelscape Pro for the fonts) |
| site_page_builder | gutenberg |
| is_onepage_demo | no |
| wxr-path | URL of \`${xmlName}\` |
| customizer-data | contents of \`customizer-data.json\` |
| site-option | contents of \`site-option.json\` |
| widgets-data | contents of \`widgets-data.json\` |
| required_plugins | see below |
| pages | one entry per page: ${pages.map((p) => `${p.title} (\`${cfg.demoUrl}/${p.slug}/\`)`).join(', ')} |

required_plugins:

\`\`\`json
${JSON.stringify(plugins, null, 2)}
\`\`\`

## 3. What the import sets up

- Travelscape theme_mods: colors (\`travelscape_color_ed\`), Travelscape Pro fonts (\`travelscape_typography_*\`), \`travelscape_block_system\` = on, header settings, and the Additional CSS (${Buffer.byteLength(css)} bytes, key \`custom-css\`). Demo Importer Plus **replaces** all theme_mods with these.
- ${pages.length} page(s) on the Block Canvas template, ${pages.length} pattern(s) under Patterns > My patterns > ${cfg.patternCategory.name}, the menu "${cfg.menu.name}" in the primary location, the front page "${front ? front.title : '(none)'}".
- Requires Travelscape 1.0.26 or newer: 1.0.24 adds the block switch (older: dark sections and fonts are wrong), 1.0.26 keeps the Customizer header and footer centered on Block Canvas pages.
${extraFile ? `- Extra content from \`${extraFile}\`: ${extra.items.length} item(s), ${extra.terms.length} term(s).` : '- No trips are included. If the pages use WP Travel Engine blocks, add your sample trips export with --extra-wxr, or the trip grids will be empty after import.'}

## 4. Test before you publish the record

Import it on a fresh site (Travelscape + Travelscape Pro + Demo Importer Plus) and check: front page, menu, images load from that site's uploads (not from ${new URL(cfg.assetUrl).host}), Patterns > My patterns, Appearance > Customize > Additional CSS.
${warnings.length ? `\n## Warnings\n\n${warnings.map((w) => `- ${w}`).join('\n')}\n` : ''}`;
fs.writeFileSync(path.join(outDir, 'record.md'), record);

console.log(JSON.stringify({
  package: outDir,
  xml: xmlName,
  items: items.length + extra.items.length,
  pages: pages.map((p) => p.slug),
  images: assets.map((a) => a.file),
  cssBytes: Buffer.byteLength(css),
  screenshots: shots,
  warnings,
}, null, 2));
if (warnings.length) process.exitCode = 3;
