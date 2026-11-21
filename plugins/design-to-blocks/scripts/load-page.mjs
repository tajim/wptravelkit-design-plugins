// Create or update a WordPress page from a block markup file and set its page template.
//
// Two ways to reach the site (the project's .d2b/project.json says which):
//
//   WP-CLI  { "site": { "method": "wpcli", "path": "/Users/me/Local Sites/travel/app/public" } }
//           Needs the "wp" command with a working database connection. On Local, start
//           Claude Code from Local's "Open site shell" so wp, php and mysql are set up.
//
//   REST    { "site": { "method": "rest", "url": "http://travel.local" } }
//           Needs an application password (Users > Profile > Application Passwords) given
//           as environment variables D2B_WP_USER and D2B_WP_APP_PASSWORD. Never write the
//           password into project.json.
//
// Usage: node load-page.mjs --file about.txt --slug about --title "About" [--status draft|publish]
//                           [--template page-templates/template-block-canvas.php]
// Prints the page id and link. Pages are matched by slug, so running it again updates the page.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { argValue, readProject } from './lib/env.mjs';

const file = argValue('--file');
const slug = argValue('--slug');
const title = argValue('--title') || slug;
const status = argValue('--status') || 'draft';
const template = argValue('--template') || 'page-templates/template-block-canvas.php';
if (!file || !slug) {
  console.error('Usage: node load-page.mjs --file <markup> --slug <slug> [--title <title>] [--status draft|publish] [--template <file>]');
  process.exit(2);
}
const content = fs.readFileSync(file, 'utf8');
const expectedTheme = readProject()?.theme?.slug;

// The page's component classes only have CSS in the project's own theme. If another theme is
// active, the page loads but looks broken (no rounded cards, no icons, no stars...).
function warnTheme(activeTheme) {
  if (!expectedTheme || !activeTheme || activeTheme === expectedTheme) return;
  console.error(`WARNING: the active theme is "${activeTheme}", not "${expectedTheme}". The page's ${expectedTheme} component CSS is not loaded, so it will not look like the design. Activate ${expectedTheme} (Appearance > Themes, or: wp theme activate ${expectedTheme}) before reviewing.`);
  process.exitCode = 3;
}
const site = readProject()?.site || {};
const method = argValue('--method') || site.method || (site.path ? 'wpcli' : 'rest');

if (method === 'wpcli') {
  const wpPath = argValue('--path') || site.path;
  if (!wpPath) throw new Error('WP-CLI needs the site folder: "site.path" in .d2b/project.json or --path.');
  const wp = (...args) => execFileSync('wp', [`--path=${wpPath}`, ...args], { encoding: 'utf8' }).trim();
  let id = wp('post', 'list', '--post_type=page', `--name=${slug}`, '--post_status=any', '--field=ID', '--format=ids');
  id = id.split(/\s+/).filter(Boolean)[0];
  if (id) {
    wp('post', 'update', id, file, `--post_title=${title}`);
  } else {
    id = wp('post', 'create', file, '--post_type=page', `--post_title=${title}`, `--post_name=${slug}`, `--post_status=${status}`, '--porcelain');
  }
  wp('post', 'meta', 'update', id, '_wp_page_template', template);
  const link = wp('post', 'url', id).split('\n').pop();
  const activeTheme = wp('option', 'get', 'stylesheet');
  console.log(JSON.stringify({ id: Number(id), link, method, activeTheme }));
  warnTheme(activeTheme);
} else {
  const base = (argValue('--url') || site.url || '').replace(/\/$/, '');
  const user = process.env.D2B_WP_USER;
  const pass = process.env.D2B_WP_APP_PASSWORD;
  if (!base || !user || !pass) {
    throw new Error('REST needs "site.url" in .d2b/project.json and D2B_WP_USER + D2B_WP_APP_PASSWORD in the environment.');
  }
  const headers = { Authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64'), 'Content-Type': 'application/json' };
  const api = async (path, opts = {}) => {
    const r = await fetch(`${base}/wp-json/wp/v2${path}`, { headers, ...opts });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`${r.status} ${body.code || ''} ${body.message || ''}`.trim());
    return body;
  };
  const found = await api(`/pages?slug=${encodeURIComponent(slug)}&status=any&context=edit&_fields=id`);
  const data = { title, slug, content, template, ...(found.length ? {} : { status }) };
  const page = found.length
    ? await api(`/pages/${found[0].id}`, { method: 'POST', body: JSON.stringify(data) })
    : await api('/pages', { method: 'POST', body: JSON.stringify(data) });
  const active = await api('/themes?status=active&_fields=stylesheet').catch(() => []);
  const activeTheme = active[0]?.stylesheet;
  console.log(JSON.stringify({ id: page.id, link: page.link, method, activeTheme }));
  warnTheme(activeTheme);
}
