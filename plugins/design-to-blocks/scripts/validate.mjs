// Check block markup the way the editor does: parse it, re-save every block, compare.
// A block whose saved HTML differs is "invalid" (the editor shows "This block contains
// unexpected or invalid content"). A block the parser cannot match is "freeform/missing".
//
// Usage: node validate.mjs [--set wp-7.0|latest] [--data <dir>] <file> [file...]
// Exit code 1 when anything is invalid. Use check.sh to run both package sets.
import fs from 'node:fs';
import { loadWP, argValue } from './lib/env.mjs';
import { registerWpteBlocks } from './lib/wpte.mjs';

const set = argValue('--set') || 'wp-7.0';
const files = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !['--set', '--data'].includes(all[i - 1]));
if (!files.length) {
  console.error('Usage: node validate.mjs [--set wp-7.0|latest] <file> [file...]');
  process.exit(2);
}

const { B } = loadWP(set);
registerWpteBlocks(B, { strictAttributes: false });

let failed = false;
for (const file of files) {
  const parsed = B.parse(fs.readFileSync(file, 'utf8'));
  let total = 0, invalid = 0, freeform = 0;
  const walk = (list, trail) => list.forEach((b, i) => {
    total++;
    const where = `${trail}/${i}:${b.name}`;
    if (b.name === 'core/freeform' || b.name === 'core/missing') {
      freeform++;
      console.log(`  FREEFORM/MISSING ${where}`);
    }
    if (b.isValid === false) {
      invalid++;
      console.log(`  INVALID ${where}`);
      for (const issue of b.validationIssues || []) {
        const msg = issue.args ? issue.args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ') : JSON.stringify(issue);
        console.log(`    ${msg.slice(0, 600)}`);
      }
    }
    if (b.innerBlocks?.length) walk(b.innerBlocks, where);
  });
  walk(parsed, '');
  const ok = !invalid && !freeform;
  if (!ok) failed = true;
  console.log(`[${set}] ${ok ? 'OK  ' : 'FAIL'} ${file}: blocks=${total} invalid=${invalid} freeform=${freeform}`);
}
process.exit(failed ? 1 : 0);
