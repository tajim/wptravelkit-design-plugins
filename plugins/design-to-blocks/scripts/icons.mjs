// Write .ts-icon--{name} CSS rules for Lucide icons (ISC licence), as CSS mask variables.
// The parent theme's .ts-icon / child components read var(--ts-icon).
//
// Usage:
//   node icons.mjs --names heart-handshake,eye,receipt [--skip <file.css> ...] [--out icons.css]
//   node icons.mjs --map ti-user-heart,ti-eye-check      (print the Lucide names for Tabler icons)
//
// --skip: CSS files whose existing .ts-icon--{name} rules should not be written again
// (for example the parent's blocks.css and the child's style.css).
import fs from 'node:fs';
import path from 'node:path';
import { dataDir, argValue } from './lib/env.mjs';

// Tabler (used by Claude Design) -> Lucide. Same name when not listed.
export const TABLER_TO_LUCIDE = {
  'map-2': 'map', 'building': 'building-2', 'building-community': 'landmark', 'plane-departure': 'plane-takeoff',
  'users-group': 'users', 'user-heart': 'heart-handshake', 'eye-check': 'eye', 'plant-2': 'sprout',
  'circle-check-filled': 'circle-check', 'calendar-event': 'calendar-check', 'calendar-time': 'calendar-clock',
  'news': 'newspaper', 'certificate': 'badge-check', 'brand-whatsapp': 'message-circle', 'message-question': 'message-circle-question',
  'arrow-up-right': 'arrow-up-right', 'chevron-right': 'chevron-right', 'menu-2': 'menu', 'clock-hour-4': 'clock-4',
  'headset': 'headset', 'list': 'list', 'send': 'send', 'route': 'route', 'sparkles': 'sparkles',
  'star-filled': 'star', 'currency-dollar': 'dollar-sign', 'world': 'globe', 'mountain': 'mountain', 'tent': 'tent',
};

const lucideDir = () => path.join(dataDir(), 'deps', 'wp-7.0', 'node_modules', 'lucide-static', 'icons');

export function iconUrl(name, color = 'black') {
  const file = path.join(lucideDir(), `${name}.svg`);
  if (!fs.existsSync(file)) return null;
  let svg = fs.readFileSync(file, 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/currentColor/g, color)
    .replace(/\s*class="[^"]*"/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Same encoding as the hand-made rules: keep spaces, slashes, = : . , - readable.
  svg = encodeURIComponent(svg).replace(/%20/g, ' ').replace(/%2F/g, '/').replace(/%3D/g, '=').replace(/%3A/g, ':').replace(/%2C/g, ',');
  return `url("data:image/svg+xml,${svg}")`;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isMain) {
  const map = argValue('--map');
  if (map) {
    for (const t of map.split(',')) {
      const name = t.trim().replace(/^ti-/, '');
      const lucide = TABLER_TO_LUCIDE[name] || name;
      const ok = fs.existsSync(path.join(lucideDir(), `${lucide}.svg`));
      console.log(`${t.trim()} -> ${lucide}${ok ? '' : '   (NOT IN LUCIDE: pick another)'}`);
    }
    process.exit(0);
  }
  const names = (argValue('--names') || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!names.length) {
    console.error('Usage: node icons.mjs --names a,b,c [--skip file.css ...] [--out icons.css]');
    process.exit(2);
  }
  const skipFiles = process.argv.flatMap((a, i, all) => (all[i - 1] === '--skip' ? [a] : []));
  const existing = new Set(skipFiles.flatMap((f) => [...fs.readFileSync(f, 'utf8').matchAll(/\.ts-icon--([a-z0-9-]+)\s*\{/g)].map((m) => m[1])));
  let css = '';
  const missing = [];
  for (const n of names) {
    if (existing.has(n)) continue;
    const url = iconUrl(n);
    if (!url) { missing.push(n); continue; }
    css += `\n.ts-icon--${n} {\n\t--ts-icon: ${url};\n}\n`;
  }
  if (missing.length) console.error(`Not in Lucide: ${missing.join(', ')} (run with --map to find names)`);
  const outFile = argValue('--out');
  if (outFile) {
    fs.writeFileSync(outFile, css);
    console.error(`wrote ${outFile}`);
  } else process.stdout.write(css);
}
