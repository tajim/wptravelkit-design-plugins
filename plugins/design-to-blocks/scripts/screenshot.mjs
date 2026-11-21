// Screenshot a built page next to its Claude Design artboards, section by section, and check
// the layout at tablet and phone widths.
//
// Usage:
//   node screenshot.mjs --page <slug> [--url <page url>] [--design <design .dc.html file>]
//                       [--widths 1440,1024,768,390] [--out <folder>]
//
// Defaults come from .d2b/project.json: the page entry with that slug ("link", "design"),
// the extracted design source, and site.url. Output folder: .d2b/shots/<slug>/
//   design-<w>.png, wp-<w>.png          full artboard / full page
//   pairs/<w>-<nn>-<name>.png            one image per section: design left, WordPress right
//   compare.html                         the review sheet for the user (open it in a browser)
//   report.md, report.json               measurements and automatic findings, for you
//
// Automatic findings at every width: horizontal overflow, a card left alone on the last row of a
// grid ("orphan"), images that failed to load, and sections whose height differs from the design
// by more than 20%.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { argValue, readProject } from './lib/env.mjs';
import { launch, routeDesignRuntime } from './lib/browser.mjs';

const project = readProject();
const slug = argValue('--page');
if (!slug) {
  console.error('Usage: node screenshot.mjs --page <slug> [--url <url>] [--design <file.dc.html>] [--widths 1440,1024,768,390] [--out <dir>]');
  process.exit(2);
}
const entry = project?.pages?.find((p) => p.slug === slug) || {};
const url = argValue('--url') || entry.link || (project?.site?.url && `${project.site.url.replace(/\/$/, '')}/${slug}/`);
if (!url) throw new Error('No page URL: pass --url or set pages[].link / site.url in .d2b/project.json');

function findDesignFile() {
  const given = argValue('--design');
  if (given) return path.resolve(given);
  if (!project || !entry.design) return null;
  const root = path.join(project.root, project.design?.extracted || '.d2b/design', 'source');
  if (!fs.existsSync(root)) return null;
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  const norm = (s) => s.toLowerCase().replace(/\.dc\.html$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return walk(root).find((f) => f.endsWith('.dc.html') && norm(path.basename(f)) === entry.design) || null;
}
const designFile = findDesignFile();
const widths = (argValue('--widths') || '1440,1024,768,390').split(',').map(Number);
const out = path.resolve(argValue('--out') || path.join(project?.root || '.', '.d2b', 'shots', slug));
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'pairs'), { recursive: true });

const fileSlug = (s) => (s || 'section').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'section';

// ---------------------------------------------------------------- page-side helpers (run in browser)
const settle = async (page) => {
  await page.evaluate(async () => {
    document.documentElement.classList.remove('ts-anim-on'); // Travelscape scroll animations
    const st = document.createElement('style');
    st.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';
    document.head.appendChild(st);
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; });
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
    await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 8000); }))));
    if (document.fonts) await document.fonts.ready;
  });
  await page.waitForTimeout(500);
};

// ---------------------------------------------------------------- design artboards
async function captureDesign(browser) {
  if (!designFile) return {};
  const page = await browser.newPage({ viewport: { width: 2400, height: 1200 } });
  await routeDesignRuntime(page);
  await page.goto(pathToFileURL(designFile).href, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => [...document.querySelectorAll('div[id] > div')].some((d) => /width:\s*\d{3,4}px/.test(d.getAttribute('style') || '') && d.getBoundingClientRect().height > 200), null, { timeout: 30000 })
    .catch(() => { throw new Error('The design page did not render (Claude Design runtime failed). Check the network or the export.'); });
  await settle(page);
  const frames = await page.evaluate(() => {
    const docY = (r) => r.top + window.scrollY;
    return [...document.querySelectorAll('div[id]')].map((d) => {
      const f = [...d.children].find((c) => /width:\s*\d{3,4}px/.test(c.getAttribute('style') || ''));
      if (!f) return null;
      const fr = f.getBoundingClientRect();
      const sections = [...f.children].map((k, i) => {
        let p = k.previousSibling; let name = '';
        while (p && p.nodeType !== 1) { if (p.nodeType === 8) { name = p.textContent.replace(/=+/g, '').trim(); break; } p = p.previousSibling; }
        const r = k.getBoundingClientRect();
        const heading = (k.querySelector('h1,h2,h3')?.textContent || '').trim().slice(0, 50);
        return { name: name || heading || `section ${i + 1}`, heading, copyright: /\u00a9/.test(k.textContent), x: r.left + window.scrollX, y: docY(r), w: r.width, h: r.height };
      }).filter((s) => s.h > 4);
      return { id: d.id, width: Math.round(fr.width), x: fr.left + window.scrollX, y: docY(fr), w: fr.width, h: fr.height, sections };
    }).filter(Boolean);
  });
  // The design runtime re-renders the page and drops the HTML comments that name each section,
  // so take the names from the source file: the comments inside each artboard, in order.
  const source = fs.readFileSync(designFile, 'utf8');
  const starts = frames.map((f) => source.indexOf(`<div id="${f.id}"`));
  frames.forEach((f, i) => {
    if (starts[i] < 0) return;
    const end = starts.slice(i + 1).find((x) => x > starts[i]) ?? source.length;
    const names = [...source.slice(starts[i], end).matchAll(/<!--\s*(.+?)\s*-->/g)].map((m) => m[1].replace(/=+/g, '').trim()).filter((n) => n && !/^(desktop|mobile|tablet)$/i.test(n));
    if (names.length === f.sections.length) f.sections.forEach((s, j) => { s.name = names[j]; });
  });
  const byWidth = {};
  for (const f of frames) {
    if (byWidth[f.width]) continue; // first artboard of each width
    await page.screenshot({ path: path.join(out, `design-${f.width}.png`), clip: { x: f.x, y: f.y, width: f.w, height: f.h }, fullPage: true });
    for (const [i, s] of f.sections.entries()) {
      s.file = `design-${f.width}-${String(i + 1).padStart(2, '0')}.png`;
      await page.screenshot({ path: path.join(out, s.file), clip: { x: s.x, y: s.y, width: s.w, height: Math.min(s.h, 6000) }, fullPage: true });
    }
    byWidth[f.width] = f;
  }
  await page.close();
  return byWidth;
}

// ---------------------------------------------------------------- WordPress page
async function captureSite(browser, width) {
  const ctx = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  if (!res || res.status() >= 400) throw new Error(`${url} answered ${res ? res.status() : 'nothing'}`);
  await settle(page);
  const data = await page.evaluate(() => {
    const vw = window.innerWidth;
    const docY = (r) => r.top + window.scrollY;
    const label = (el, i) => (el.querySelector('h1,h2,h3')?.textContent || el.querySelector('p')?.textContent || `section ${i + 1}`).replace(/\s+/g, ' ').trim().slice(0, 50);
    const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + window.scrollX, y: docY(r), w: r.width, h: r.height }; };
    // .travelscape-block-canvas is also a BODY class on Block Canvas pages: always go through .entry-content
    const root = document.querySelector('.entry-content');
    const header = document.querySelector('.travelscape-block-header, header#masthead');
    const footer = document.querySelector('.travelscape-block-footer, footer#colophon');
    const sections = root ? [...root.children].filter((k) => k.getBoundingClientRect().height > 4).map((k, i) => ({ name: label(k, i), ...box(k), index: i })) : [];
    const cls = (el) => [...el.classList].filter((c) => !/^wp-container-|^wp-elements-/.test(c)).slice(0, 4).join('.');
    const sectionOf = (el) => sections.findIndex((s) => { const r = el.getBoundingClientRect(); const y = docY(r); return y >= s.y - 1 && y < s.y + s.h; });

    // Findings
    const findings = [];
    if (document.documentElement.scrollWidth > vw + 1) {
      const wide = [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > vw + 1 && e.parentElement.getBoundingClientRect().right <= vw + 1; }).slice(0, 5);
      findings.push({ type: 'overflow', detail: `page is ${document.documentElement.scrollWidth}px wide at a ${vw}px viewport`, elements: wide.map((e) => `${e.tagName.toLowerCase()}.${cls(e)} (section ${sectionOf(e) + 1})`) });
    }
    for (const el of document.querySelectorAll('.entry-content *')) {
      const cs = getComputedStyle(el);
      const isGrid = cs.display.includes('grid');
      const isWrapFlex = cs.display.includes('flex') && cs.flexWrap === 'wrap' && cs.flexDirection.startsWith('row');
      if (!isGrid && !isWrapFlex) continue;
      const kids = [...el.children].filter((k) => k.getBoundingClientRect().width > 0 && getComputedStyle(k).position !== 'absolute');
      if (kids.length < 3) continue;
      const cw = el.getBoundingClientRect().width;
      if (kids.some((k) => k.getBoundingClientRect().width > cw * 0.7)) continue; // already one column
      const rows = [];
      for (const k of kids) {
        const top = Math.round(k.getBoundingClientRect().top);
        const row = rows.find((r) => Math.abs(r.top - top) < 6);
        if (row) row.n++; else rows.push({ top, n: 1 });
      }
      if (rows.length >= 2 && rows[rows.length - 1].n === 1 && rows[0].n >= 2 && !el.closest('nav')) {
        findings.push({ type: 'orphan', detail: `${kids.length} items in rows of ${rows.map((r) => r.n).join('+')}: one item alone on the last row`, elements: [`${el.tagName.toLowerCase()}.${cls(el)} (section ${sectionOf(el) + 1}: ${sections[sectionOf(el)]?.name || '?'})`] });
      }
    }
    const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getBoundingClientRect().width > 0);
    if (broken.length) findings.push({ type: 'broken-images', detail: `${broken.length} image(s) did not load`, elements: broken.slice(0, 5).map((i) => (i.getAttribute('src') || '').slice(0, 120)) });
    const invalid = document.body.innerText.match(/This block contains unexpected or invalid content/);
    if (invalid) findings.push({ type: 'invalid-block', detail: 'an invalid block notice is on the page' });
    return {
      sections,
      header: header ? box(header) : null,
      footer: footer ? { name: 'Footer', ...box(footer) } : null,
      pageHeight: document.documentElement.scrollHeight,
      theme: (document.body.className.match(/wp-child-theme-([a-z0-9-]+)/) || [])[1] || (document.body.className.match(/wp-theme-([a-z0-9-]+)/) || [])[1],
      findings,
    };
  });
  await page.screenshot({ path: path.join(out, `wp-${width}.png`), fullPage: true });
  const all = [...data.sections, ...(data.footer ? [data.footer] : [])];
  for (const [i, s] of all.entries()) {
    s.file = `wp-${width}-${String(i + 1).padStart(2, '0')}.png`;
    await page.screenshot({ path: path.join(out, s.file), clip: { x: s.x, y: s.y, width: Math.min(s.w, width), height: Math.min(s.h, 6000) }, fullPage: true });
  }
  await ctx.close();
  return { width, ...data, all };
}

// ---------------------------------------------------------------- pairing and sheets
function pairSections(design, site) {
  // Design: page sections (its header usually sits inside the hero) then a footer.
  const dAll = design ? design.sections : [];
  const isFooter = (s, i, all) => /footer/i.test(s.name) || (i === all.length - 1 && s.copyright);
  const dBody = dAll.filter((s, i, all) => !isFooter(s, i, all));
  const dFooter = dAll.find((s, i, all) => isFooter(s, i, all));
  const pairs = [];
  const n = Math.max(dBody.length, site.sections.length);
  for (let i = 0; i < n; i++) pairs.push({ design: dBody[i] || null, wp: site.sections[i] || null });
  if (dFooter || site.footer) pairs.push({ design: dFooter || null, wp: site.footer || null });
  return pairs;
}

async function renderPair(browser, pair, width, index) {
  const name = pair.design?.name || pair.wp?.name || `section ${index + 1}`;
  const img = (s) => (s ? `<img src="${s.file}">` : '<div class="none">not in the design</div>');
  const colW = width >= 1000 ? 700 : width >= 700 ? 600 : 390;
  const html = `<!doctype html><html><head><style>
    body{margin:0;font:14px/1.4 system-ui,sans-serif;background:#f3f3f3;color:#222}
    .row{display:flex;gap:16px;padding:16px;align-items:flex-start}
    .col{width:${colW}px}.col h3{margin:0 0 6px;font-size:13px;color:#555}
    img{width:100%;display:block;outline:1px solid #ccc}
    .none{height:120px;display:flex;align-items:center;justify-content:center;outline:1px dashed #aaa;color:#888}
    h2{margin:0;padding:12px 16px 0;font-size:16px}</style></head><body>
    <h2>${width}px · ${String(index + 1).padStart(2, '0')} · ${name.replace(/</g, '&lt;')}</h2>
    <div class="row"><div class="col"><h3>Design</h3>${img(pair.design)}</div><div class="col"><h3>WordPress</h3>${img(pair.wp)}</div></div></body></html>`;
  const page = await browser.newPage({ viewport: { width: colW * 2 + 48, height: 120 } });
  // Load from a file next to the screenshots: a page set from memory may not read local files.
  const tmp = path.join(out, '_pair.html');
  fs.writeFileSync(tmp, html);
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  const file = `pairs/${width}-${String(index + 1).padStart(2, '0')}-${fileSlug(name)}.png`;
  await page.screenshot({ path: path.join(out, file), fullPage: true });
  await page.close();
  fs.rmSync(tmp, { force: true });
  return file;
}

// ---------------------------------------------------------------- run
const browser = await launch();
const report = { page: slug, url, design: designFile, out, widths: [], generated: new Date().toISOString() };
try {
  const design = await captureDesign(browser);
  for (const w of widths) {
    const site = await captureSite(browser, w);
    const frame = design[w] || null;
    const pairs = frame ? pairSections(frame, site) : site.all.map((s) => ({ design: null, wp: s }));
    const rows = [];
    for (const [i, p] of pairs.entries()) {
      const file = await renderPair(browser, p, w, i);
      const ratio = p.design && p.wp ? p.wp.h / p.design.h : null;
      rows.push({ index: i + 1, design: p.design?.name || null, wp: p.wp?.name || null, designHeight: p.design ? Math.round(p.design.h) : null, wpHeight: p.wp ? Math.round(p.wp.h) : null, heightRatio: ratio ? Number(ratio.toFixed(2)) : null, pair: file });
    }
    const findings = [...site.findings];
    for (const r of rows) {
      if (r.heightRatio && (r.heightRatio > 1.2 || r.heightRatio < 0.8)) findings.push({ type: 'height', detail: `section ${r.index} (${r.design}) is ${Math.round((r.heightRatio - 1) * 100)}% ${r.heightRatio > 1 ? 'taller' : 'shorter'} than the design (${r.wpHeight}px vs ${r.designHeight}px)`, elements: [r.pair] });
      if ((r.design && !r.wp) || (!r.design && r.wp && frame)) findings.push({ type: 'pairing', detail: `section ${r.index}: ${r.design ? `design "${r.design}" has no WordPress section` : `WordPress section "${r.wp}" has no design section`} (sections may be out of order from here on)`, elements: [r.pair] });
    }
    report.widths.push({ width: w, designArtboard: frame ? `#${frame.id} (${frame.width}px)` : null, theme: site.theme, pageHeight: site.pageHeight, sections: rows, findings });
  }
} finally {
  await browser.close();
}

// report.json + report.md (for Claude) and compare.html (for the user)
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
const md = [`# Screenshots: ${slug}`, '', `Page: ${url}  `, `Design: ${report.design || 'none found (WordPress only)'}  `, `Theme on the site: ${report.widths[0]?.theme || '?'}`, ''];
for (const w of report.widths) {
  md.push(`## ${w.width}px ${w.designArtboard ? `vs design ${w.designArtboard}` : '(no design artboard at this width: check layout only)'}`, '');
  md.push(w.findings.length ? w.findings.map((f) => `- **${f.type}**: ${f.detail}${f.elements?.length ? `\n  - ${f.elements.join('\n  - ')}` : ''}`).join('\n') : '- no automatic findings', '');
  md.push('| # | design | WordPress | heights | pair image |', '|---|---|---|---|---|');
  for (const r of w.sections) md.push(`| ${r.index} | ${r.design || '-'} | ${r.wp || '-'} | ${r.designHeight ?? '-'} / ${r.wpHeight ?? '-'} | ${r.pair} |`);
  md.push('');
}
fs.writeFileSync(path.join(out, 'report.md'), md.join('\n'));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const sheet = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(slug)}: design vs WordPress</title><style>
body{margin:0;font:15px/1.5 system-ui,sans-serif;background:#f5f5f4;color:#1c1b19}header{padding:24px 32px;background:#fff;border-bottom:1px solid #ddd;position:sticky;top:0;z-index:2}
h1{margin:0;font-size:22px}nav a{margin-right:14px}section{padding:24px 32px}h2{font-size:18px}.f{background:#fff4e5;border-left:4px solid #e8a33d;padding:8px 12px;margin:6px 0}
.ok{color:#2f5e46}figure{margin:0 0 28px}figure img{max-width:100%;border:1px solid #ddd;background:#fff}figcaption{color:#625d55;font-size:13px}</style></head><body>
<header><h1>${esc(slug)}: design vs WordPress</h1><div>${esc(url)}</div><nav>${report.widths.map((w) => `<a href="#w${w.width}">${w.width}px</a>`).join('')}</nav></header>
${report.widths.map((w) => `<section id="w${w.width}"><h2>${w.width}px ${w.designArtboard ? `· design ${esc(w.designArtboard)}` : '· no design artboard (layout check only)'}</h2>
${w.findings.length ? w.findings.map((f) => `<div class="f"><b>${esc(f.type)}</b>: ${esc(f.detail)}</div>`).join('') : '<p class="ok">No automatic findings.</p>'}
${w.sections.map((r) => `<figure><img loading="lazy" src="${esc(r.pair)}"><figcaption>${r.index}. ${esc(r.design || r.wp)} · heights ${r.designHeight ?? '-'} / ${r.wpHeight ?? '-'}</figcaption></figure>`).join('')}</section>`).join('')}
</body></html>`;
fs.writeFileSync(path.join(out, 'compare.html'), sheet);
const total = report.widths.reduce((n, w) => n + w.findings.length, 0);
console.log(JSON.stringify({ out, report: path.join(out, 'report.md'), sheet: path.join(out, 'compare.html'), findings: total, theme: report.widths[0]?.theme }, null, 2));
