// Create a new Travelscape child theme from the bundled template (Travel Royale 1.0.0).
//
// Usage: node scaffold-child.mjs --out "<wp-content/themes folder>" [--force]
// Reads the "theme" section of .d2b/project.json (see references/interview.md for every field).
//
// What it does:
//   1. copies templates/child-theme to <out>/<slug> (never over an existing folder unless --force)
//   2. renames every Travel Royale identifier: theme name, slug/text domain, PHP function and
//      constant prefixes, @package, CSS class prefix (tr-), WP Travel Engine style key (royale)
//   3. swaps the color tokens and the Google font
//   4. writes a fresh style.css header, readme.txt and theme.json font families
// Page CSS for every component stays in style.css; the header and footer parts are Travel
// Royale's and are meant to be rebuilt from the design afterwards.
import fs from 'node:fs';
import path from 'node:path';
import { argValue, readProject } from './lib/env.mjs';
import { TEMPLATE_DIR as TEMPLATE, readTemplate, makeRetheme } from './lib/retheme.mjs';

const tpl = readTemplate();

const project = readProject();
const theme = project?.theme;
if (!theme) {
  console.error('No "theme" section in .d2b/project.json. Run the interview first.');
  process.exit(2);
}
for (const k of ['name', 'slug', 'classPrefix', 'description']) {
  if (!theme[k]) { console.error(`theme.${k} is missing in .d2b/project.json`); process.exit(2); }
}
if (!/^[a-z][a-z0-9-]*$/.test(theme.slug)) { console.error('theme.slug must be lowercase letters, digits and hyphens'); process.exit(2); }
if (!/^[a-z]{2,4}$/.test(theme.classPrefix)) { console.error('theme.classPrefix must be 2 to 4 lowercase letters, e.g. "tc"'); process.exit(2); }

const outRoot = argValue('--out') || project.themesDir;
if (!outRoot) { console.error('Pass --out <themes folder> or set "themesDir" in .d2b/project.json'); process.exit(2); }
const dest = path.join(path.resolve(outRoot), theme.slug);
if (fs.existsSync(dest) && !process.argv.includes('--force')) {
  console.error(`${dest} already exists. Use --force to overwrite the template files in it.`);
  process.exit(1);
}

const { apply: retheme, names, font } = makeRetheme(theme, tpl);

fs.mkdirSync(dest, { recursive: true });
fs.cpSync(TEMPLATE, dest, { recursive: true, force: true, filter: (src) => !src.endsWith('template.json') });

// 2 + 3. replace identifiers through placeholders, so new values can never be hit by a later rule.
const textExt = new Set(['.php', '.css', '.js', '.html', '.json', '.txt', '.md']);
const files = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else if (textExt.has(path.extname(e.name))) files.push(p);
});
walk(dest);

let changed = 0;
for (const f of files) {
  const before = fs.readFileSync(f, 'utf8');
  const s = retheme(before);
  if (s !== before) { fs.writeFileSync(f, s); changed++; }
}

// 4a. style.css header
const css = path.join(dest, 'style.css');
const header = `/*
Theme Name: ${names.name}
Theme URI: ${theme.uri || 'https://wptravelkit.com/'}
Author: ${theme.author || 'WP Travel Kit'}
Author URI: ${theme.authorUri || 'https://wptravelkit.com/'}
Description: ${theme.description}
Template: travelscape
Version: ${theme.version || '1.0.0'}
Requires at least: 6.6
Tested up to: ${theme.testedUpTo || '7.1'}
Requires PHP: 7.4
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Tags: ${theme.tags || 'one-column, two-columns, custom-logo, custom-menu, featured-images, full-width-template, block-patterns, translation-ready, wide-blocks, blog'}
Text Domain: ${names.slug}
*/`;
fs.writeFileSync(css, fs.readFileSync(css, 'utf8').replace(/^\/\*[\s\S]*?\*\//, header));

// 4b. theme.json fonts and layout
const tjFile = path.join(dest, 'theme.json');
const tj = JSON.parse(fs.readFileSync(tjFile, 'utf8'));
const stack = `"${font.family}", ${font.fallback || 'sans-serif'}`;
tj.settings.typography.fontFamilies = tj.settings.typography.fontFamilies.map((f) => (f.slug === 'monospace' ? f : { ...f, fontFamily: stack, name: font.family }));
if (theme.layout) tj.settings.layout = { ...tj.settings.layout, ...theme.layout };
fs.writeFileSync(tjFile, JSON.stringify(tj, null, '\t') + '\n');

// 4c. readme.txt
const readme = `=== ${names.name} ===
Contributors: ${theme.contributors || 'wptravelkit'}
Requires at least: 6.6
Tested up to: ${theme.testedUpTo || '7.1'}
Requires PHP: 7.4
Stable tag: ${theme.version || '1.0.0'}
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

${theme.shortDescription || theme.description.split('. ')[0] + '.'}

== Description ==

${theme.description}

Requires the Travelscape parent theme (${tpl.requiresParent} or newer). Recommended plugins: WP Travel Engine, Contact Form 7 and Demo Importer Plus.

== Installation ==

1. Install and activate the Travelscape parent theme.
2. Upload ${names.name}, then go to Appearance > Themes and activate it.
3. For the full demo, install Demo Importer Plus and import the ${names.name} demo.

== Frequently Asked Questions ==

= How do I make a page look like the demo? =

Create a page, choose the "Block Canvas" template, then insert one of the ${names.name} page patterns.

== Changelog ==

= ${theme.version || '1.0.0'} =
* Initial release.

== Resources ==

${names.name} is based on Travelscape, (C) WP Travel Kit, GPLv2 or later.

Lucide Icons
License: ISC License, https://lucide.dev/license
Source: https://lucide.dev/

${font.family} font
License: ${font.license || 'SIL Open Font License, 1.1, https://openfontlicense.org'}
Source: ${font.source || 'https://fonts.google.com/specimen/' + font.family.replace(/ /g, '+')}

Screenshot and pattern images
To be listed here with their licenses before release.
`;
fs.writeFileSync(path.join(dest, 'readme.txt'), readme);

if (theme.demoImporterId) {
  const fn = path.join(dest, 'functions.php');
  fs.writeFileSync(fn, fs.readFileSync(fn, 'utf8').replace('REPLACE_WITH_DEMO_ID', theme.demoImporterId));
}

// Leftover check: nothing of the template's identity should remain.
const leftovers = [];
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  for (const needle of ['Travel Royale', 'travel-royale', 'travel_royale', 'TRAVEL_ROYALE', 'Royale']) {
    if (names.name.includes('Royale')) break;
    if (s.includes(needle)) leftovers.push(`${path.relative(dest, f)}: ${needle}`);
  }
}
console.log(JSON.stringify({ theme: dest, filesChanged: changed, names, font: font.family, leftovers }, null, 2));
console.log('Next: rebuild parts/header.html and parts/footer.html from the design, add icons, then build the pages.');
