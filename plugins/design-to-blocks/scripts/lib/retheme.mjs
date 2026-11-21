// Swap the template's identity (Travel Royale) for a new theme's: names, prefixes, WPTE style
// key, font and colors. Used by scaffold-child.mjs (child themes) and starter-css.mjs (the
// Additional CSS of a starter template), so both modes start from the same component CSS.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const TEMPLATE_DIR = path.join(HERE, '..', '..', 'templates', 'child-theme');
export const STARTER_DIR = path.join(HERE, '..', '..', 'templates', 'starter');

export function readTemplate() {
  return JSON.parse(fs.readFileSync(path.join(TEMPLATE_DIR, 'template.json'), 'utf8'));
}

/** Names derived from the project's "theme" section (see references/interview.md). */
export function themeNames(theme) {
  const fnPrefix = theme.slug.replace(/-/g, '_');
  const key = theme.wpteStyleKey || theme.slug.split('-').pop();
  return {
    name: theme.name,
    slug: theme.slug,
    functionPrefix: fnPrefix,
    constantPrefix: fnPrefix.toUpperCase(),
    package: fnPrefix.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join('_'),
    classPrefix: theme.classPrefix,
    wpteStyleKey: key,
    wpteStyleLabel: theme.wpteStyleLabel || key.replace(/^./, (c) => c.toUpperCase()),
  };
}

export function themeFont(theme, tpl = readTemplate()) {
  return { family: tpl.font.family, googleFamilyParam: tpl.font.googleFamilyParam, ...(theme.font || {}) };
}

export function themeColors(theme, tpl = readTemplate()) {
  return { ...tpl.colors, ...(theme.colors || {}) };
}

/**
 * Returns a function text -> text that applies every replacement.
 * Two passes with \u0001 markers, so a new value can never be caught by a later rule.
 */
export function makeRetheme(theme, tpl = readTemplate()) {
  const names = themeNames(theme);
  const font = themeFont(theme, tpl);
  const colors = themeColors(theme, tpl);
  const old = tpl.names;
  const steps = [
    [/Travel Royale/g, '\u0001NAME\u0001'],
    [/TRAVEL_ROYALE/g, '\u0001CONST\u0001'],
    [/Travel_Royale/g, '\u0001PKG\u0001'],
    [/travel_royale/g, '\u0001FN\u0001'],
    [/travel-royale/g, '\u0001SLUG\u0001'],
    [/--tr-(?=[a-z])/g, '--\u0001CLS\u0001-'],
    [/(?<![A-Za-z0-9_-])tr-(?=[a-z])/g, '\u0001CLS\u0001-'],
    [new RegExp(`is-style-${old.wpteStyleKey}\\b`, 'g'), 'is-style-\u0001KEY\u0001'],
    [new RegExp(`'${old.wpteStyleKey}'`, 'g'), "'\u0001KEY\u0001'"],
    [new RegExp(`'${old.wpteStyleLabel}'`, 'g'), "'\u0001LABEL\u0001'"],
    [new RegExp(tpl.font.googleFamilyParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '\u0001FONTPARAM\u0001'],
    [/Instrument\\\\ Sans/g, '\u0001FONTCSS\u0001'],
    [new RegExp(tpl.font.family, 'g'), '\u0001FONT\u0001'],
  ];
  const finals = {
    NAME: names.name, CONST: names.constantPrefix, PKG: names.package, FN: names.functionPrefix, SLUG: names.slug,
    CLS: names.classPrefix, KEY: names.wpteStyleKey, LABEL: names.wpteStyleLabel,
    FONTPARAM: font.googleFamilyParam, FONTCSS: font.family.replace(/ /g, '\\\\ '), FONT: font.family,
  };
  // The child's heading color line in functions.php: the template's heading equals its body
  // color, so it needs its own marker or it would take the body color.
  const headingLine = /(\$defaults\['heading-color'\]\s*=\s*')#[0-9a-f]{6}(')/;

  const apply = (text) => {
    let s = text;
    if (colors.heading) s = s.replace(headingLine, `$1\u0001COLOR:heading\u0001$2`);
    for (const [re, rep] of steps) s = s.replace(re, rep);
    for (const [token, value] of Object.entries(tpl.colors)) {
      const hex = value.slice(1);
      s = s.replace(new RegExp(`#${hex}\\b`, 'gi'), `\u0001COLOR:${token}\u0001`);
      s = s.replace(new RegExp(`%23${hex}\\b`, 'gi'), `\u0001ENC:${token}\u0001`);
    }
    s = s.replace(/\u0001COLOR:([a-zA-Z]+)\u0001/g, (_, t) => (colors[t] || tpl.colors[t]).toLowerCase());
    s = s.replace(/\u0001ENC:([a-zA-Z]+)\u0001/g, (_, t) => '%23' + (colors[t] || tpl.colors[t]).slice(1).toLowerCase());
    s = s.replace(/\u0001([A-Z]+)\u0001/g, (_, t) => finals[t]);
    return s;
  };
  return { apply, names, font, colors };
}
