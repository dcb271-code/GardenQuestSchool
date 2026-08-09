import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Everything this app says to a child is in American English.
 *
 * The learners are in Louisville, Kentucky, and are five and seven —
 * the seven-year-old is learning to spell right now. A curriculum that
 * teaches her "practise" and "colour" while her schoolwork says
 * "practice" and "color" is actively working against her.
 *
 * This guards the CONTENT, which is what she reads. Prose in comments
 * is not checked, because she never sees it.
 */

const UK_TO_US: Record<string, string> = {
  practise: 'practice', practising: 'practicing', practised: 'practiced',
  colour: 'color', colours: 'colors', coloured: 'colored', colourful: 'colorful',
  favourite: 'favorite', realise: 'realize', realised: 'realized',
  recognise: 'recognize', recognised: 'recognized', organise: 'organize',
  analyse: 'analyze', centre: 'center', centres: 'centers',
  metre: 'meter', metres: 'meters', kilometres: 'kilometers',
  grey: 'gray', greyish: 'grayish',
  neighbour: 'neighbor', neighbours: 'neighbors', neighbourhood: 'neighborhood',
  behaviour: 'behavior', behaviours: 'behaviors',
  travelling: 'traveling', travelled: 'traveled',
  jewellery: 'jewelry', programme: 'program', catalogue: 'catalog',
  defence: 'defense', licence: 'license',
  whilst: 'while', amongst: 'among', learnt: 'learned', spelt: 'spelled',
  maths: 'math', aeroplane: 'airplane', sulphur: 'sulfur',
  fibre: 'fiber', litre: 'liter', theatre: 'theater',
  labour: 'labor', honour: 'honor', humour: 'humor', vapour: 'vapor',
  flavour: 'flavor', odour: 'odor', moustache: 'mustache',
  aluminium: 'aluminum', tyre: 'tire', kerb: 'curb', plough: 'plow',
  marvellous: 'marvelous', modelled: 'modeled', labelled: 'labeled',
  cancelled: 'canceled', fuelled: 'fueled',
  // idiom, not spelling — just as foreign to a child in Kentucky
  rubbish: 'junk or trash', fortnight: 'two weeks', queueing: 'lining up',
};

/** Files whose strings a child reads. */
const CONTENT_DIRS = ['lib/world', 'lib/packs', 'lib/birds', 'lib/music'];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith('.ts') || p.endsWith('.tsx')) out.push(p);
  }
  return out;
}

/**
 * Strip block comments and BOTH kinds of line comment — leading and
 * trailing. She never reads any of them, and policing only the trailing
 * ones (the first version of this) fails with a baffling message about
 * a code comment while the prose beside it goes unchecked.
 *
 * The `[^:]` guard keeps `https://` in a URL from being read as the
 * start of a comment.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

describe('child-facing text is American English', () => {
  const files = CONTENT_DIRS.flatMap(d => walk(d));

  it('checks a meaningful number of content files', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  for (const [uk, us] of Object.entries(UK_TO_US)) {
    it(`never says "${uk}" (use "${us}")`, () => {
      const offenders: string[] = [];
      for (const f of files) {
        const body = stripComments(readFileSync(f, 'utf8'));
        const re = new RegExp(`\\b${uk}\\b`, 'i');
        body.split('\n').forEach((line, i) => {
          if (re.test(line)) offenders.push(`${f}:${i + 1}  ${line.trim().slice(0, 90)}`);
        });
      }
      expect(offenders, `\n${offenders.join('\n')}\n`).toEqual([]);
    });
  }
});
