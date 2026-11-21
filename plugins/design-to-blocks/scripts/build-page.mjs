// Run a page script and write its block markup.
//
// Usage: node build-page.mjs <page-script.mjs> [--out <folder>] [--tokens <tokens.mjs>] [--set wp-7.0|latest]
//
// A page script lives in the project (.d2b/pages/<slug>.mjs) and exports one function:
//
//   export default function build(kit) {
//     const { c, P, H, stack, grid, section } = kit;
//     ...
//     return { slug: 'about', blocks: [hero, story, cta] };   // or just the array of blocks
//   }
//
// Tokens: --tokens, else .d2b/tokens.mjs in the project, else tokens.mjs next to the page script,
// else the kit defaults. Output: <out>/<slug>.txt (default out: .d2b/out).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadWP, argValue, readProject } from './lib/env.mjs';
import { createKit } from './lib/kit.mjs';

const script = process.argv[2];
if (!script || script.startsWith('--')) {
  console.error('Usage: node build-page.mjs <page-script.mjs> [--out <folder>] [--tokens <tokens.mjs>]');
  process.exit(2);
}
const project = readProject();
const candidates = [
  argValue('--tokens'),
  project && path.join(project.root, '.d2b', 'tokens.mjs'),
  path.join(path.dirname(path.resolve(script)), 'tokens.mjs'),
].filter(Boolean);
const tokensFile = candidates.find((f) => fs.existsSync(f));
const tokens = tokensFile ? (await import(pathToFileURL(path.resolve(tokensFile)).href)).default : {};

const kit = createKit(loadWP(argValue('--set') || 'wp-7.0').B, tokens);
const mod = await import(pathToFileURL(path.resolve(script)).href);
if (typeof mod.default !== 'function') throw new Error(`${script} must export a default function (kit) => blocks`);
const result = mod.default(kit);
const blocks = Array.isArray(result) ? result : result.blocks;
const slug = (!Array.isArray(result) && result.slug) || path.basename(script).replace(/\.m?js$/, '');

const outDir = path.resolve(argValue('--out') || (project ? path.join(project.root, '.d2b', 'out') : '.'));
fs.mkdirSync(outDir, { recursive: true });
kit.write(path.join(outDir, `${slug}.txt`), blocks);
console.log(`tokens: ${tokensFile || 'kit defaults'}  blocks: ${blocks.length} top-level`);
