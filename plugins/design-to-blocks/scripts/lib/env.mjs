// Loads the WordPress block packages from the plugin's data folder into a fake browser (jsdom).
//
// Where the data folder comes from, first match wins:
//   1. --data <dir> on the command line
//   2. the D2B_DATA environment variable
//   3. "dataDir" in .d2b/project.json, searched upward from the current folder
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

export function argValue(name) {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : undefined;
}

export function findProjectFile(start = process.cwd()) {
  let dir = path.resolve(start);
  for (;;) {
    const f = path.join(dir, '.d2b', 'project.json');
    if (fs.existsSync(f)) return f;
    const up = path.dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

export function readProject() {
  const f = findProjectFile();
  return f ? { file: f, root: path.dirname(path.dirname(f)), ...JSON.parse(fs.readFileSync(f, 'utf8')) } : null;
}

export function dataDir() {
  const fromArg = argValue('--data');
  if (fromArg) return path.resolve(fromArg);
  if (process.env.D2B_DATA) return path.resolve(process.env.D2B_DATA);
  const project = readProject();
  if (project?.dataDir) return project.dataDir;
  throw new Error('Data folder unknown. Pass --data <dir>, set D2B_DATA, or add "dataDir" to .d2b/project.json.');
}

function installBrowserGlobals(req) {
  if (globalThis.window?.document) return;
  const { JSDOM } = req('jsdom');
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url: 'http://localhost/', pretendToBeVisual: true });
  const win = dom.window;
  globalThis.window = win;
  for (const key of Object.getOwnPropertyNames(win)) {
    if (key in globalThis) continue;
    try { globalThis[key] = win[key]; } catch { /* read-only in Node, skip */ }
  }
  const noop = () => {};
  win.matchMedia = win.matchMedia || (() => ({ matches: false, addListener: noop, removeListener: noop, addEventListener: noop, removeEventListener: noop }));
  globalThis.matchMedia = win.matchMedia;
  globalThis.requestAnimationFrame = globalThis.requestAnimationFrame || ((cb) => setTimeout(cb, 0));
  globalThis.cancelAnimationFrame = globalThis.cancelAnimationFrame || ((id) => clearTimeout(id));
  globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
  globalThis.IntersectionObserver = globalThis.IntersectionObserver || class { observe() {} unobserve() {} disconnect() {} };
  if (!globalThis.CSS) globalThis.CSS = { supports: () => false, escape: (s) => s };
}

/**
 * Load @wordpress/blocks with every core block registered.
 * @param {'wp-7.0'|'latest'} set Which package set to use.
 */
export function loadWP(set = 'wp-7.0') {
  const deps = path.join(dataDir(), 'deps', set);
  if (!fs.existsSync(path.join(deps, 'node_modules'))) {
    throw new Error(`Packages for "${set}" are not installed in ${deps}. Run scripts/setup.sh first.`);
  }
  const req = createRequire(path.join(deps, 'package.json'));
  installBrowserGlobals(req);
  // Silence noisy deprecation warnings from the packages themselves.
  const warn = console.warn;
  console.warn = (...a) => { if (!/deprecated|API version/i.test(String(a[0]))) warn(...a); };
  const B = req('@wordpress/blocks');
  req('@wordpress/block-editor');
  req('@wordpress/block-library').registerCoreBlocks();
  return { B, req, deps };
}
