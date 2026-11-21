// Headless Chrome for screenshots, through playwright-core (no browser download: it drives the
// Chrome, Chromium or Edge already installed). Set D2B_CHROME to a browser binary to choose one.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { dataDir } from './env.mjs';

const CANDIDATES = [
  process.env.D2B_CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].filter(Boolean);

export function toolsDir() {
  const dir = path.join(dataDir(), 'deps', 'tools');
  if (!fs.existsSync(path.join(dir, 'node_modules', 'playwright-core'))) {
    throw new Error(`Screenshot tools are not installed in ${dir}. Run scripts/setup.sh again.`);
  }
  return dir;
}

export async function launch() {
  const req = createRequire(path.join(toolsDir(), 'package.json'));
  const { chromium } = req('playwright-core');
  let executablePath = CANDIDATES.find((p) => fs.existsSync(p));
  if (!executablePath) {
    try { const own = chromium.executablePath(); if (own && fs.existsSync(own)) executablePath = own; } catch { /* none */ }
  }
  if (!executablePath) {
    throw new Error('No Chrome found. Install Google Chrome, or set D2B_CHROME to a Chromium-based browser binary.');
  }
  return chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--hide-scrollbars', '--font-render-hinting=none'] });
}

/**
 * Serve the Claude Design runtime (React, ReactDOM, Babel, Tabler icon font) from the local
 * packages instead of unpkg/jsdelivr: design pages then render offline and the same every time.
 */
export async function routeDesignRuntime(page) {
  const modules = path.join(toolsDir(), 'node_modules');
  const types = { '.js': 'application/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.eot': 'application/vnd.ms-fontobject', '.svg': 'image/svg+xml' };
  await page.route(/^https:\/\/(unpkg\.com|cdn\.jsdelivr\.net)\//, (route) => {
    const u = new URL(route.request().url());
    const m = u.pathname.replace(/^\/npm\//, '/').match(/^\/((?:@[^/]+\/)?[^@/]+)@[^/]+\/(.+)$/);
    const file = m && path.join(modules, m[1], m[2]);
    if (file && fs.existsSync(file)) {
      return route.fulfill({ path: file, contentType: types[path.extname(file)] || 'application/octet-stream' });
    }
    return route.continue();
  });
}
