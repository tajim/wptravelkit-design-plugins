// Keep only the CSS a set of pages uses.
//
// A starter template has no child theme: its component CSS ships as the site's Additional CSS,
// so it should carry only the rules the pages need. A rule is dropped when one of its "managed"
// classes (the project's <prefix>-* classes and ts-icon--* icons) never appears in the markup.
// Other classes (wp-block-*, is-style-*, has-*) are WordPress's own and are assumed present.
//
// Small, purpose-built parser: rules, block at-rules (@media, @supports, @container, @layer)
// with rules inside, and other at-rules kept whole (@keyframes, @font-face, @import).
// No CSS nesting (the template does not use it).

function skipString(css, i) {
  const q = css[i];
  for (let j = i + 1; j < css.length; j++) {
    if (css[j] === '\\') { j++; continue; }
    if (css[j] === q) return j;
  }
  return css.length - 1;
}

/** Index of the "}" that closes the block opened at css[open] === "{". */
function matchBrace(css, open) {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    const ch = css[i];
    if (ch === '"' || ch === "'") { i = skipString(css, i); continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return i; }
  }
  throw new Error('Unbalanced braces in CSS');
}

const GROUPING = /^@(media|supports|container|layer|document)\b/i;

export function parseCss(input) {
  const css = input.replace(/\/\*[\s\S]*?\*\//g, '');
  const nodes = [];
  let i = 0;
  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i])) i++;
    if (i >= css.length) break;
    // Find the next "{" or ";" at this level (outside strings and parentheses).
    let j = i; let paren = 0;
    for (; j < css.length; j++) {
      const ch = css[j];
      if (ch === '"' || ch === "'") { j = skipString(css, j); continue; }
      if (ch === '(') paren++;
      else if (ch === ')') paren--;
      else if (paren === 0 && (ch === '{' || ch === ';' || ch === '}')) break;
    }
    if (j >= css.length) break;
    const prelude = css.slice(i, j).trim();
    if (css[j] === ';') { if (prelude) nodes.push({ type: 'statement', text: prelude + ';' }); i = j + 1; continue; }
    if (css[j] === '}') { i = j + 1; continue; } // stray brace
    const close = matchBrace(css, j);
    const body = css.slice(j + 1, close);
    if (prelude.startsWith('@')) {
      if (GROUPING.test(prelude)) nodes.push({ type: 'group', prelude, children: parseCss(body) });
      else nodes.push({ type: 'raw', text: `${prelude}{${body.trim()}}` });
    } else {
      nodes.push({ type: 'rule', selector: prelude, body: body.trim() });
    }
    i = close + 1;
  }
  return nodes;
}

function splitSelectors(sel) {
  const out = []; let depth = 0; let cur = '';
  for (let i = 0; i < sel.length; i++) {
    const ch = sel[i];
    if (ch === '"' || ch === "'") { const e = skipString(sel, i); cur += sel.slice(i, e + 1); i = e; continue; }
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Remove :not(...) arguments: a class inside :not() does not need to be present. */
function withoutNot(sel) {
  let out = ''; let i = 0;
  while (i < sel.length) {
    if (sel.startsWith(':not(', i)) {
      let depth = 0; let j = i + 4;
      for (; j < sel.length; j++) { if (sel[j] === '(') depth++; else if (sel[j] === ')') { depth--; if (depth === 0) break; } }
      i = j + 1; continue;
    }
    out += sel[i++];
  }
  return out;
}

/**
 * @param {string} css
 * @param {Set<string>} used    class names found in the markup
 * @param {(cls: string) => boolean} isManaged  which classes must be present
 */
export function pruneCss(css, used, isManaged) {
  const keepSelector = (sel) => {
    const classes = withoutNot(sel).match(/\.(-?[_a-zA-Z][\w-]*)/g) || [];
    return classes.every((c) => { const name = c.slice(1); return !isManaged(name) || used.has(name); });
  };
  const stats = { rules: 0, kept: 0 };
  const walk = (nodes) => {
    const out = [];
    for (const n of nodes) {
      if (n.type === 'rule') {
        stats.rules++;
        const parts = splitSelectors(n.selector).filter(keepSelector);
        if (parts.length) { stats.kept++; out.push(`${parts.join(',\n')} {\n\t${n.body.replace(/\n\s*/g, '\n\t')}\n}`); }
      } else if (n.type === 'group') {
        const inner = walk(n.children);
        if (inner.length) out.push(`${n.prelude} {\n${inner.join('\n').replace(/^/gm, '\t')}\n}`);
      } else {
        out.push(n.text);
      }
    }
    return out;
  };
  const text = walk(parseCss(css)).join('\n\n') + '\n';
  return { css: text, stats };
}

/** Every token in the markup that could be a class name. */
export function classesIn(markup) {
  return new Set(markup.match(/[A-Za-z_][\w-]*/g) || []);
}
