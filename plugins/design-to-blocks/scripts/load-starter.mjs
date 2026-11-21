// Load a starter template onto the Local test site: pages, images, patterns, menu, front page,
// Customizer settings and Additional CSS, the same way Demo Importer Plus will on a customer's
// site. Run it after every page build in starter mode (it is quick and safe to repeat).
//
// Usage: node load-starter.mjs [--activate] [--restore] [--path <wp folder>]
//
//   --activate  activate Travelscape first if another theme is active (the other theme keeps
//               its own settings: WordPress stores theme_mods per theme)
//   --restore   put back the Travelscape theme_mods, Additional CSS and front page saved
//               before the first load (.d2b/starter/theme-mods-backup.json), and stop
//
// Needs WP-CLI (site.method "wpcli" and site.path in .d2b/project.json): theme_mods and
// Additional CSS cannot be written over REST. On Local, start Claude Code from the site shell.
// Writes the page ids and links into project.json (pages[].pageId, pages[].link).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { argValue, readProject } from './lib/env.mjs';
import {
  ASSET_TOKEN, MENU_LOCATION, starterConfig, starterPages, starterAssets, starterThemeMods, readAdditionalCss, menuPages,
} from './lib/starter.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const project = readProject();
if (!project) { console.error('No .d2b/project.json here.'); process.exit(2); }
const site = project.site || {};
const wpPath = argValue('--path') || site.path;
if (!wpPath) {
  console.error('Starter templates load with WP-CLI: set site.method "wpcli" and site.path (the folder with wp-config.php) in .d2b/project.json. See references/site-loading.md.');
  process.exit(2);
}
const wp = (...a) => execFileSync('wp', [`--path=${wpPath}`, ...a], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();

const starterDir = path.join(project.root, '.d2b', 'starter');
fs.mkdirSync(starterDir, { recursive: true });
const manifestFile = path.join(starterDir, 'load-manifest.json');
const backupFile = path.join(starterDir, 'theme-mods-backup.json');
const php = path.join(HERE, 'php', 'load-starter.php');

if (process.argv.includes('--restore')) {
  fs.writeFileSync(manifestFile, JSON.stringify({ backupFile }));
  console.log(wp('eval-file', php, manifestFile, 'restore'));
  process.exit(0);
}

const active = wp('option', 'get', 'stylesheet');
if (active !== 'travelscape') {
  if (!process.argv.includes('--activate')) {
    console.error(`The active theme is "${active}". Starter templates run on the Travelscape parent alone. Re-run with --activate (the other theme keeps its settings) or activate Travelscape in Appearance > Themes.`);
    process.exit(3);
  }
  wp('theme', 'activate', 'travelscape');
}

const cfg = starterConfig(project);
const pages = starterPages(project);
if (!pages.length) { console.error('No built pages in .d2b/out yet.'); process.exit(2); }
const manifest = {
  name: cfg.name,
  demoSlug: cfg.demoSlug,
  assetToken: ASSET_TOKEN,
  backupFile,
  themeMods: starterThemeMods(project),
  css: readAdditionalCss(project),
  assets: starterAssets(project, pages),
  pages,
  patterns: pages.map((p) => ({ slug: `${cfg.demoSlug}-${p.slug}`, title: `${cfg.name}: ${p.title}`, content: p.content })),
  patternCategory: cfg.patternCategory,
  menu: cfg.menu,
  menuLocation: MENU_LOCATION,
  menuPages: menuPages(project, pages),
  frontPage: cfg.frontPage,
};
fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));

const raw = wp('eval-file', php, manifestFile);
const result = JSON.parse(raw.split('\n').filter((l) => l.startsWith('{')).pop());

// Save ids and links for screenshot.mjs and the review.
const pj = JSON.parse(fs.readFileSync(project.file, 'utf8'));
for (const p of pj.pages || []) {
  const r = result.pages[p.slug];
  if (r) { p.pageId = r.id; p.link = r.link; }
}
fs.writeFileSync(project.file, JSON.stringify(pj, null, 2) + '\n');

console.log(JSON.stringify(result, null, 2));
if (!/^supported/.test(result.blockSwitch)) {
  console.error(`WARNING: ${result.blockSwitch}. Dark sections, text color inheritance and the block font presets will be wrong until the parent is updated.`);
  process.exitCode = 3;
}
if (!result.proActive) {
  console.error('WARNING: Travelscape Pro is not active: the starter\'s fonts (Pro typography settings) will not apply.');
  process.exitCode = 3;
}
