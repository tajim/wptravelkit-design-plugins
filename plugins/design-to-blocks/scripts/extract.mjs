// Read a Claude Design project export and write a compact brief for each page.
//
// Usage: node extract.mjs <design.zip | design-folder> <out-folder>
//
// For every *.dc.html page it writes, into <out-folder>:
//   <slug>.clean.html  the page with SVGs and long data: URIs removed (much smaller to read)
//   <slug>.data.js     the page's data script (lists of services, FAQs, tiers...), when present
//   <slug>.md          outline: artboards (desktop/mobile), section comments with line numbers,
//                      images, icons, colors, font sizes and fonts used
// and design.md, an index of all pages plus the project's own README/SKILL notes.
// No packages needed. Uses the system "unzip" for zip files.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [src, outArg] = process.argv.slice(2);
if (!src || !outArg) {
  console.error('Usage: node extract.mjs <design.zip | design-folder> <out-folder>');
  process.exit(2);
}
const out = path.resolve(outArg);
fs.mkdirSync(out, { recursive: true });

let dir = path.resolve(src);
if (dir.endsWith('.zip')) {
  const dest = path.join(out, 'source');
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  execFileSync('unzip', ['-q', '-o', dir, '-d', dest]);
  dir = dest;
  // A zip often wraps everything in one top folder.
  const entries = fs.readdirSync(dir).filter((f) => !f.startsWith('__MACOSX'));
  if (entries.length === 1 && fs.statSync(path.join(dir, entries[0])).isDirectory()) dir = path.join(dir, entries[0]);
}

const slugify = (s) => s.toLowerCase().replace(/\.dc\.html$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const count = (arr) => Object.entries(arr.reduce((m, x) => ((m[x] = (m[x] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1]);

const pages = fs.readdirSync(dir).filter((f) => f.endsWith('.dc.html')).sort();
if (!pages.length) {
  console.error(`No *.dc.html pages found in ${dir}`);
  process.exit(1);
}

const index = [`# Design index\n`, `Source: ${dir}\n`, `| Page | Slug | Artboards | Sections | Data script |`, `|---|---|---|---|---|`];

for (const file of pages) {
  const raw = fs.readFileSync(path.join(dir, file), 'utf8');
  const slug = slugify(file);
  const title = (raw.match(/<title>([^<]*)<\/title>/) || [])[1] || file;

  // Data script (Claude Design keeps page data in a DCLogic class).
  const data = (raw.match(/<script type="text\/x-dc" data-dc-script>([\s\S]*?)<\/script>/) || [])[1];
  if (data) fs.writeFileSync(path.join(out, `${slug}.data.js`), data.trim() + '\n');

  // Clean copy: drop inline SVG and big data URIs, collapse blank lines.
  const clean = raw
    .replace(/<script type="text\/x-dc" data-dc-script>[\s\S]*?<\/script>/, '<!-- data script: see ' + slug + '.data.js -->')
    .replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>')
    .replace(/data:[^"')\s]{80,}/g, 'DATA_URI')
    .replace(/\n\s*\n/g, '\n');
  fs.writeFileSync(path.join(out, `${slug}.clean.html`), clean);
  const lines = clean.split('\n');

  // Artboards: Claude Design canvases label each frame with an id and a caption like "Desktop · 1440".
  const artboards = [];
  lines.forEach((l, i) => {
    const m = l.match(/<div id="([^"]+)"[^>]*>/);
    if (!m) return;
    const caption = (lines.slice(i, i + 3).join(' ').match(/>([^<>]*?·\s*\d{3,4})</) || [])[1];
    const width = (lines.slice(i, i + 4).join(' ').match(/width:(\d{3,4})px/) || [])[1];
    if (caption || width) artboards.push({ id: m[1], caption: caption?.trim(), width: width ? Number(width) : undefined, line: i + 1 });
  });

  // Section outline from HTML comments (designers label sections: <!-- Hero -->).
  const sections = [];
  lines.forEach((l, i) => {
    const m = l.match(/<!--\s*(.+?)\s*-->/);
    if (m && !/data script/.test(m[1])) sections.push({ name: m[1].replace(/=+/g, '').trim(), line: i + 1 });
  });

  const images = [...new Set([...raw.matchAll(/https:\/\/images\.(?:pexels|unsplash)\.com\/[^"')\s]+/g)].map((m) => m[0].replace(/&amp;/g, '&')))];
  const pexelsIds = [...new Set([...(data || '').matchAll(/photo:\s*(\d{5,})/g), ...raw.matchAll(/photos\/(\d+)\//g)].map((m) => m[1]))];
  const icons = count([...raw.matchAll(/\bti-([a-z0-9-]+)/g)].map((m) => m[1]).filter((n) => n !== 'icons'));
  const colors = count([...raw.matchAll(/#[0-9A-Fa-f]{6}\b/g)].map((m) => m[0].toUpperCase())).slice(0, 24);
  const rgba = count([...raw.matchAll(/rgba\([^)]+\)/g)].map((m) => m[0].replace(/\s/g, ''))).slice(0, 12);
  const sizes = count([...raw.matchAll(/font-size:(\d+)px/g)].map((m) => Number(m[1]))).sort((a, b) => b[0] - a[0]);
  const radii = count([...raw.matchAll(/border-radius:(\d+)px/g)].map((m) => Number(m[1])));
  const fonts = [...new Set([...raw.matchAll(/fonts\.googleapis\.com\/css2\?family=([^"&]+)/g)].map((m) => decodeURIComponent(m[1]).replace(/\+/g, ' ')))];

  const md = [
    `# ${title}`,
    '',
    `File: ${file}  \nClean copy: ${slug}.clean.html (line numbers below refer to it)  \nData script: ${data ? slug + '.data.js' : 'none'}`,
    '',
    '## Artboards',
    ...(artboards.length ? artboards.map((a) => `- #${a.id}: ${a.caption || ''}${a.width ? ` (width ${a.width}px)` : ''}, line ${a.line}`) : ['- none detected']),
    '',
    '## Sections (from HTML comments)',
    ...sections.map((s) => `- line ${s.line}: ${s.name}`),
    '',
    '## Fonts',
    ...(fonts.length ? fonts.map((f) => `- ${f}`) : ['- none linked']),
    '',
    '## Colors (most used first)',
    colors.map(([c, n]) => `${c} ×${n}`).join(', '),
    '',
    rgba.length ? `Translucent: ${rgba.map(([c, n]) => `${c} ×${n}`).join(', ')}` : '',
    '',
    '## Font sizes (px, largest first)',
    sizes.map(([s, n]) => `${s} ×${n}`).join(', '),
    '',
    '## Border radii (px)',
    radii.map(([s, n]) => `${s} ×${n}`).join(', '),
    '',
    '## Icons (Tabler names in the design; map each to Lucide)',
    icons.map(([s, n]) => `${s} ×${n}`).join(', ') || 'none',
    '',
    '## Images',
    `Pexels ids: ${pexelsIds.join(', ') || 'none'}`,
    ...images.slice(0, 40).map((u) => `- ${u}`),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(out, `${slug}.md`), md);
  index.push(`| ${title} | ${slug} | ${artboards.map((a) => a.caption || a.id).join('; ')} | ${sections.length} | ${data ? 'yes' : 'no'} |`);
  console.log(`${file} -> ${slug}.md (${sections.length} sections, ${artboards.length} artboards)`);
}

for (const note of ['README.md', 'README-2.md', 'readme.md', 'SKILL.md']) {
  const f = path.join(dir, note);
  if (fs.existsSync(f)) index.push('', `## ${note} (from the design project)`, '', fs.readFileSync(f, 'utf8').slice(0, 6000));
}
const tokenDir = path.join(dir, 'tokens');
if (fs.existsSync(tokenDir)) index.push('', '## Token files', ...fs.readdirSync(tokenDir).map((f) => `- tokens/${f}`));
fs.writeFileSync(path.join(out, 'design.md'), index.join('\n') + '\n');
console.log(`Index: ${path.join(out, 'design.md')}`);
