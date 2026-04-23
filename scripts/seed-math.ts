#!/usr/bin/env tsx
/**
 * Math pack seed — generates a LARGE diverse item pool.
 *
 * Item types used:
 *   NumberBonds, CountingTiles, EquationTap, NumberCompare, PlaceValueSplit
 *
 * Called from scripts/seed.ts after math strands + skills are upserted.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

type Row = {
  skill_id: string;
  type: string;
  content: any;
  answer: any;
  approved_at: string;
  generated_by: 'seed';
  difficulty_elo: number;
};

// Tiny helpers
const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
};
const shuffle = <T,>(arr: T[], r: () => number): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const THEMES = {
  ants: { noun: 'ants', emoji: '🐜' },
  bees: { noun: 'bees', emoji: '🐝' },
  butterflies: { noun: 'butterflies', emoji: '🦋' },
  flowers: { noun: 'flowers', emoji: '🌼' },
  ladybugs: { noun: 'ladybugs', emoji: '🐞' },
  acorns: { noun: 'acorns', emoji: '🌰' },
  carrots: { noun: 'carrots', emoji: '🥕' },
  berries: { noun: 'berries', emoji: '🫐' },
  frogs: { noun: 'frogs', emoji: '🐸' },
  mushrooms: { noun: 'mushrooms', emoji: '🍄' },
};
type Theme = keyof typeof THEMES;
const themeList = Object.keys(THEMES) as Theme[];

function mkDistractors(correct: number, r: () => number, width = 6): number[] {
  const pool = new Set<number>();
  let tries = 0;
  while (pool.size < 3 && tries++ < 40) {
    const delta = Math.floor(r() * width) - Math.floor(width / 2);
    const cand = correct + (delta === 0 ? (r() < 0.5 ? 1 : -1) : delta);
    if (cand > 0 && cand !== correct) pool.add(cand);
  }
  return Array.from(pool).slice(0, 3);
}

function mkChoices(correct: number, r: () => number, width = 6): number[] {
  const distractors = mkDistractors(correct, r, width);
  return shuffle([correct, ...distractors], r);
}

// ─── Item builders per skill ────────────────────────────────────────

export function buildMathItems(skillId: (code: string) => string | undefined): Row[] {
  const now = new Date().toISOString();
  const out: Row[] = [];
  const push = (skillCode: string, type: string, content: any, answer: any, elo: number) => {
    const id = skillId(skillCode);
    if (!id) return;
    out.push({ skill_id: id, type, content, answer, approved_at: now, generated_by: 'seed', difficulty_elo: elo });
  };

  // ═══════════ COUNTING ═══════════

  // count to 20 — CountingTiles (40 items, 3..20 each with 2 theme variants)
  {
    const r = rng(1);
    for (let pass = 0; pass < 2; pass++) {
      for (let n = 3; n <= 20; n++) {
        const theme = themeList[Math.floor(r() * themeList.length)];
        push('math.counting.to_20', 'CountingTiles', {
          type: 'CountingTiles', emoji: THEMES[theme].emoji, count: n,
          promptText: pass === 0 ? 'How many do you see?' : `Count the ${THEMES[theme].noun}.`,
        }, { count: n }, 900 + n * 8);
      }
    }
  }

  // count to 50 — CountingTiles, n = 21..50 stride 2 + stride 3 (~30 items)
  {
    const r = rng(2);
    const pool: number[] = [];
    for (let n = 21; n <= 50; n += 2) pool.push(n);
    for (let n = 24; n <= 48; n += 3) pool.push(n);
    for (const n of Array.from(new Set(pool))) {
      const theme = themeList[Math.floor(r() * themeList.length)];
      push('math.counting.to_50', 'CountingTiles', {
        type: 'CountingTiles', emoji: THEMES[theme].emoji, count: n,
        promptText: r() < 0.5 ? 'How many are there?' : `Count the ${THEMES[theme].noun}.`,
      }, { count: n }, 1000 + n * 3);
    }
  }

  // count to 120 — EquationTap "What number comes next?" 25 items across 60..120
  {
    const r = rng(3);
    for (let n = 51; n <= 119; n += Math.max(1, Math.floor(r() * 5))) {
      const seq = [n - 2, n - 1, 0, n + 1];
      const display = seq.map(x => (x === 0 ? '?' : x.toString())).join(', ');
      push('math.counting.to_120', 'EquationTap', {
        type: 'EquationTap',
        equation: display,
        choices: mkChoices(n, r, 6),
        promptText: 'What number comes next?',
      }, { correct: n }, 1100 + Math.floor(n / 10) * 3);
    }
  }

  // skip 2s — 25 sequence items + 10 fast-recall
  {
    const r = rng(4);
    for (let start = 2; start <= 30; start += 2) {
      const answer = start + 2;
      const seq = [start - 2, start, 0, start + 4];
      const display = seq.map(x => (x === 0 ? '?' : x.toString())).join(', ');
      push('math.counting.skip_2s', 'EquationTap', {
        type: 'EquationTap',
        equation: display,
        choices: mkChoices(answer, r, 4),
        promptText: 'What comes next, counting by 2s?',
      }, { correct: answer }, 1000 + start * 2);
    }
    // "What's next after" prompts
    const starts = [10, 14, 18, 22, 26, 30, 34, 38, 42, 46];
    for (const s of starts) {
      push('math.counting.skip_2s', 'EquationTap', {
        type: 'EquationTap',
        equation: `${s} + 2 = ?`,
        choices: mkChoices(s + 2, r, 4),
        promptText: `What's 2 more than ${s}?`,
      }, { correct: s + 2 }, 1050 + s);
    }
  }

  // skip 5s — sequences + fluency (25 items)
  {
    const r = rng(5);
    for (let start = 5; start <= 100; start += 5) {
      if (r() < 0.6) {
        const answer = start + 5;
        const seq = [start - 5, start, 0, start + 10];
        const display = seq.map(x => (x === 0 || x <= 0 ? '?' : x.toString())).join(', ');
        push('math.counting.skip_5s', 'EquationTap', {
          type: 'EquationTap',
          equation: display,
          choices: mkChoices(answer, r, 8),
          promptText: 'Skip counting by 5s — what comes next?',
        }, { correct: answer }, 1050 + Math.floor(start / 5));
      }
    }
  }

  // skip 10s — sequences + 10 more/less (20 items)
  {
    const r = rng(6);
    for (let start = 10; start <= 100; start += 10) {
      const answer = start + 10;
      const seq = [start - 10, start, 0, start + 20].map(x => x <= 0 ? '?' : x.toString());
      push('math.counting.skip_10s', 'EquationTap', {
        type: 'EquationTap',
        equation: seq.join(', '),
        choices: mkChoices(answer, r, 10),
        promptText: 'Skip counting by 10s — what comes next?',
      }, { correct: answer }, 1050 + Math.floor(start / 10) * 3);
    }
    for (const n of [14, 23, 37, 52, 66, 78, 81, 95]) {
      push('math.counting.skip_10s', 'EquationTap', {
        type: 'EquationTap',
        equation: `${n} + 10 = ?`,
        choices: mkChoices(n + 10, r, 6),
        promptText: `What is 10 more than ${n}?`,
      }, { correct: n + 10 }, 1100 + n);
    }
  }

  // ═══════════ ADDITION ═══════════

  // add within 10 — all unique pairs, mix of formats (45+ items)
  {
    const r = rng(10);
    for (let a = 0; a <= 9; a++) {
      for (let b = 0; b <= 9; b++) {
        if (a + b > 10 || a + b < 2) continue;
        const format = (a * 31 + b) % 4;
        const sum = a + b;
        const choices = mkChoices(sum, r, 6);
        let equation = `${a} + ${b} = ?`;
        let promptText = `${a} plus ${b} is?`;
        if (format === 1) promptText = `What is ${a} + ${b}?`;
        else if (format === 2) { equation = `? = ${a} + ${b}`; promptText = `Find the sum.`; }
        else if (format === 3) promptText = `${a} and ${b} make…?`;
        push('math.add.within_10', 'EquationTap', {
          type: 'EquationTap', equation, choices, promptText,
        }, { correct: sum }, 950 + sum * 3);
      }
    }
  }

  // add within 20 (no crossing) — 2-digit+1 or 1+2, units sum < 10
  {
    const r = rng(11);
    for (let a = 10; a <= 18; a++) {
      for (let b = 1; b <= 9; b++) {
        if ((a % 10) + b >= 10) continue;
        if (a + b > 20) continue;
        const sum = a + b;
        push('math.add.within_20.no_crossing', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} + ${b} = ?`,
          choices: mkChoices(sum, r, 6),
          promptText: r() < 0.5 ? `${a} plus ${b} is?` : `What's ${a} + ${b}?`,
        }, { correct: sum }, 1000 + sum * 3);
      }
    }
  }

  // add within 20 (crossing ten) — MAKE-10 strategy items + standard + word problems
  {
    const r = rng(12);
    // straightforward pairs where a + b > 10
    for (let a = 2; a <= 9; a++) {
      for (let b = 2; b <= 9; b++) {
        if (a + b <= 10) continue;
        if (a + b > 20) continue;
        const sum = a + b;
        push('math.add.within_20.crossing_ten', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} + ${b} = ?`,
          choices: mkChoices(sum, r, 6),
          promptText: `Try making 10: ${a} plus ${b}?`,
        }, { correct: sum }, 1100 + (sum - 10) * 5);
      }
    }
    // word problems
    const wordProblems = [
      (a: number, b: number, t: Theme) =>
        `A butterfly visited ${a} flowers, then ${b} more. How many flowers in all?`,
      (a: number, b: number, t: Theme) =>
        `You counted ${a} ${THEMES[t].noun}. Later you counted ${b} more. How many total ${THEMES[t].noun}?`,
      (a: number, b: number, t: Theme) =>
        `${a} ${THEMES[t].noun} met ${b} more ${THEMES[t].noun} in the garden. Total ${THEMES[t].noun}?`,
    ];
    for (let a = 4; a <= 9; a++) {
      for (let b = 4; b <= 9; b++) {
        if (a + b <= 10 || a + b > 18) continue;
        const sum = a + b;
        const theme = themeList[Math.floor(r() * themeList.length)];
        const fmt = wordProblems[Math.floor(r() * wordProblems.length)];
        push('math.add.within_20.crossing_ten', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} + ${b} = ?`,
          choices: mkChoices(sum, r, 6),
          promptText: fmt(a, b, theme),
        }, { correct: sum }, 1100 + (sum - 10) * 6);
      }
    }
  }

  // add fluency within 20 — all pairs summing 5..20, mixed presentation
  {
    const r = rng(13);
    for (let a = 0; a <= 10; a++) {
      for (let b = 0; b <= 10; b++) {
        if (a + b < 5 || a + b > 20) continue;
        const sum = a + b;
        push('math.add.fluency_within_20', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} + ${b} = ?`,
          choices: mkChoices(sum, r, 5),
          promptText: 'Quick — add them up.',
        }, { correct: sum }, 1100 + sum * 3);
      }
    }
  }

  // add within 100 (no regrouping) — 40 items
  {
    const r = rng(14);
    const pairs: Array<[number, number]> = [];
    for (let a = 10; a <= 89; a += 3) {
      for (let b = 10; b <= 89; b += 7) {
        if ((a % 10) + (b % 10) >= 10) continue;
        if (a + b > 99) continue;
        pairs.push([a, b]);
      }
    }
    for (const [a, b] of shuffle(pairs, r).slice(0, 40)) {
      push('math.add.within_100.no_regrouping', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} + ${b} = ?`,
        choices: mkChoices(a + b, r, 10),
        promptText: `${a} plus ${b} — stack the tens and ones.`,
      }, { correct: a + b }, 1200 + Math.floor((a + b) / 10) * 2);
    }
  }

  // add within 100 (with regrouping) — 40 items
  {
    const r = rng(15);
    const pairs: Array<[number, number]> = [];
    for (let a = 10; a <= 89; a += 3) {
      for (let b = 10; b <= 89; b += 5) {
        if ((a % 10) + (b % 10) < 10) continue;
        if (a + b > 99) continue;
        pairs.push([a, b]);
      }
    }
    for (const [a, b] of shuffle(pairs, r).slice(0, 40)) {
      push('math.add.within_100.with_regrouping', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} + ${b} = ?`,
        choices: mkChoices(a + b, r, 10),
        promptText: `${a} + ${b} — ones need to carry over.`,
      }, { correct: a + b }, 1300 + Math.floor((a + b) / 10) * 2);
    }
  }

  // ═══════════ SUBTRACTION ═══════════

  // subtract within 10 (40 items)
  {
    const r = rng(20);
    for (let a = 2; a <= 10; a++) {
      for (let b = 0; b <= a; b++) {
        if (b > 9 || a - b < 0) continue;
        const diff = a - b;
        const choices = mkChoices(diff, r, 5);
        const format = (a * 17 + b) % 3;
        let equation = `${a} − ${b} = ?`;
        let promptText = `${a} minus ${b} is?`;
        if (format === 1) promptText = `Take ${b} away from ${a}.`;
        else if (format === 2) promptText = `How many left when ${a} loses ${b}?`;
        push('math.subtract.within_10', 'EquationTap', {
          type: 'EquationTap', equation, choices, promptText,
        }, { correct: diff }, 1000 + diff * 3);
      }
    }
  }

  // subtract within 20 (no crossing) — tens digit stays
  {
    const r = rng(21);
    for (let a = 11; a <= 19; a++) {
      for (let b = 1; b <= (a % 10); b++) {
        const diff = a - b;
        push('math.subtract.within_20.no_crossing', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} − ${b} = ?`,
          choices: mkChoices(diff, r, 6),
          promptText: `${a} take away ${b} is?`,
        }, { correct: diff }, 1100 + diff * 2);
      }
    }
  }

  // subtract within 20 (crossing ten) — borrow required
  {
    const r = rng(22);
    for (let a = 11; a <= 20; a++) {
      for (let b = 1; b <= 9; b++) {
        if (b <= (a % 10)) continue;
        if (a - b < 0) continue;
        const diff = a - b;
        push('math.subtract.within_20.crossing_ten', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} − ${b} = ?`,
          choices: mkChoices(diff, r, 6),
          promptText: `${a} minus ${b} — you'll need to break a ten.`,
        }, { correct: diff }, 1200 + diff * 3);
      }
    }
  }

  // subtract within 100 (no regrouping) — 35 items
  {
    const r = rng(23);
    const pairs: Array<[number, number]> = [];
    for (let a = 20; a <= 99; a += 3) {
      for (let b = 10; b <= a - 10; b += 7) {
        if ((a % 10) < (b % 10)) continue;
        pairs.push([a, b]);
      }
    }
    for (const [a, b] of shuffle(pairs, r).slice(0, 35)) {
      push('math.subtract.within_100.no_regrouping', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} − ${b} = ?`,
        choices: mkChoices(a - b, r, 10),
        promptText: `${a} minus ${b}.`,
      }, { correct: a - b }, 1250 + Math.floor((a - b) / 10) * 2);
    }
  }

  // subtract within 100 (with regrouping) — 35 items
  {
    const r = rng(24);
    const pairs: Array<[number, number]> = [];
    for (let a = 20; a <= 99; a += 3) {
      for (let b = 10; b <= a - 5; b += 7) {
        if ((a % 10) >= (b % 10)) continue;
        pairs.push([a, b]);
      }
    }
    for (const [a, b] of shuffle(pairs, r).slice(0, 35)) {
      push('math.subtract.within_100.with_regrouping', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} − ${b} = ?`,
        choices: mkChoices(a - b, r, 10),
        promptText: `${a} − ${b} — you'll need to borrow from the tens.`,
      }, { correct: a - b }, 1350 + Math.floor((a - b) / 10) * 2);
    }
  }

  // ═══════════ NUMBER BONDS ═══════════
  {
    const r = rng(30);
    for (let k = 1; k <= 9; k++) {
      const missing = 10 - k;
      // two variations per pair: "k and ? make 10" / "10 = k + ?"
      push('math.number_bond.within_10', 'NumberBonds', {
        type: 'NumberBonds', whole: 10, knownPart: k,
        promptText: `${k} and what make 10?`,
      }, { missing }, 1000);
      push('math.number_bond.within_10', 'NumberBonds', {
        type: 'NumberBonds', whole: 10, knownPart: k,
        promptText: `10 is ${k} plus what?`,
      }, { missing }, 1000);
    }
    // additional subtract-style
    for (let k = 1; k <= 9; k++) {
      const missing = 10 - k;
      push('math.number_bond.within_10', 'EquationTap', {
        type: 'EquationTap',
        equation: `${k} + ? = 10`,
        choices: mkChoices(missing, r, 4),
        promptText: `${k} + what equals 10?`,
      }, { correct: missing }, 1000);
    }
  }

  // number bonds to 20
  {
    const r = rng(31);
    for (let k = 5; k <= 19; k++) {
      const missing = 20 - k;
      push('math.number_bond.within_20', 'NumberBonds', {
        type: 'NumberBonds', whole: 20, knownPart: k,
        promptText: `${k} and what make 20?`,
      }, { missing }, 1150);
    }
    for (let k = 5; k <= 19; k++) {
      const missing = 20 - k;
      push('math.number_bond.within_20', 'EquationTap', {
        type: 'EquationTap',
        equation: `${k} + ? = 20`,
        choices: mkChoices(missing, r, 6),
        promptText: `Fill the missing part of 20.`,
      }, { correct: missing }, 1150);
    }
  }

  // ═══════════ PLACE VALUE ═══════════

  // tens + ones (PlaceValueSplit) — 30 items
  {
    const r = rng(40);
    const nums = [12, 17, 23, 28, 31, 35, 42, 46, 49, 53, 58, 61, 67, 72, 76, 84, 89, 93, 98,
                  15, 24, 36, 45, 58, 67, 73, 82, 91, 99, 14];
    for (const n of nums) {
      push('math.placevalue.tens_ones', 'PlaceValueSplit', {
        type: 'PlaceValueSplit', number: n, showHundreds: false,
        promptText: `Split ${n} into tens and ones.`,
      }, { tens: Math.floor(n / 10), ones: n % 10 }, 1100 + n);
    }
    // also EquationTap-style:
    for (const n of [23, 45, 67, 89]) {
      const tens = Math.floor(n / 10);
      push('math.placevalue.tens_ones', 'EquationTap', {
        type: 'EquationTap',
        equation: `${n} has how many tens?`,
        choices: mkChoices(tens, r, 4),
        promptText: `How many TENS in ${n}?`,
      }, { correct: tens }, 1100);
    }
  }

  // hundreds + tens + ones — 20 items
  {
    const r = rng(41);
    const nums = [102, 134, 156, 203, 245, 278, 312, 356, 389, 421, 467, 498, 523, 567, 601, 645, 712, 789, 832, 945];
    for (const n of nums) {
      push('math.placevalue.hundreds_tens_ones', 'PlaceValueSplit', {
        type: 'PlaceValueSplit', number: n, showHundreds: true,
        promptText: `Break ${n} apart: hundreds, tens, ones.`,
      }, {
        hundreds: Math.floor(n / 100),
        tens: Math.floor((n % 100) / 10),
        ones: n % 10,
      }, 1300 + Math.floor(n / 100) * 20);
    }
  }

  // compare 2-digit — 30 items
  {
    const r = rng(42);
    for (let pass = 0; pass < 30; pass++) {
      const left = 10 + Math.floor(r() * 89);
      const right = 10 + Math.floor(r() * 89);
      const symbol: '<' | '>' | '=' = left < right ? '<' : left > right ? '>' : '=';
      push('math.placevalue.compare_2digit', 'NumberCompare', {
        type: 'NumberCompare', left, right,
        promptText: `Compare ${left} and ${right}.`,
      }, { symbol }, 1150 + Math.abs(left - right) < 5 ? 1200 : 1150);
    }
    // ensure at least a couple equals
    for (const n of [42, 57, 73]) {
      push('math.placevalue.compare_2digit', 'NumberCompare', {
        type: 'NumberCompare', left: n, right: n,
        promptText: 'Which symbol?',
      }, { symbol: '=' }, 1150);
    }
  }

  // compare 3-digit — 20 items
  {
    const r = rng(43);
    for (let pass = 0; pass < 20; pass++) {
      const left = 100 + Math.floor(r() * 900);
      const right = 100 + Math.floor(r() * 900);
      const symbol: '<' | '>' | '=' = left < right ? '<' : left > right ? '>' : '=';
      push('math.placevalue.compare_3digit', 'NumberCompare', {
        type: 'NumberCompare', left, right,
        promptText: `Compare ${left} and ${right}.`,
      }, { symbol }, 1400 + Math.floor(Math.abs(left - right) / 100));
    }
  }

  // 10 more / 10 less — 20 items
  {
    const r = rng(44);
    for (const n of [23, 45, 67, 89, 12, 38, 56, 74, 91, 15, 27, 48, 63, 82, 99, 33, 41, 58, 76, 84]) {
      const op = r() < 0.5 ? '+' : '−';
      const answer = op === '+' ? n + 10 : n - 10;
      push('math.placevalue.add_subtract_10', 'EquationTap', {
        type: 'EquationTap',
        equation: `${n} ${op} 10 = ?`,
        choices: mkChoices(answer, r, 6),
        promptText: op === '+' ? `What is 10 more than ${n}?` : `What is 10 less than ${n}?`,
      }, { correct: answer }, 1200 + n);
    }
  }

  // ═══════════ MULTIPLICATION FOUNDATIONS ═══════════

  // equal groups — "3 groups of 4 = ?" — 25 items
  {
    const r = rng(50);
    for (let g = 2; g <= 5; g++) {
      for (let each = 2; each <= 6; each++) {
        const total = g * each;
        const theme = themeList[Math.floor(r() * themeList.length)];
        const word = THEMES[theme];
        push('math.multiply.equal_groups', 'EquationTap', {
          type: 'EquationTap',
          equation: `${g} × ${each} = ?`,
          choices: mkChoices(total, r, 6),
          promptText: `${g} groups of ${each} ${word.noun} — how many total?`,
        }, { correct: total }, 1300 + total * 3);
      }
    }
  }

  // arrays (rows x cols) — 20 items
  {
    const r = rng(51);
    for (let rows = 2; rows <= 5; rows++) {
      for (let cols = 2; cols <= 6; cols++) {
        const total = rows * cols;
        push('math.multiply.arrays', 'EquationTap', {
          type: 'EquationTap',
          equation: `${rows} rows × ${cols} = ?`,
          choices: mkChoices(total, r, 6),
          promptText: `An array has ${rows} rows and ${cols} in each. How many total?`,
        }, { correct: total }, 1300 + total * 3);
      }
    }
  }

  // skip count → multiplication — "2+2+2 = 2 x ? " bridge
  {
    const r = rng(52);
    for (let base of [2, 5, 10]) {
      for (let times = 2; times <= 6; times++) {
        const total = base * times;
        const sum = Array(times).fill(base).join(' + ');
        push('math.multiply.skip_count_bridge', 'EquationTap', {
          type: 'EquationTap',
          equation: `${sum} = ?`,
          choices: mkChoices(total, r, 6),
          promptText: `Adding ${base} a total of ${times} times equals?`,
        }, { correct: total }, 1350 + total * 2);
      }
    }
  }

  // ═══════════ WORD PROBLEMS ═══════════

  // add within 20 word problems
  {
    const r = rng(60);
    const templates = [
      (a: number, b: number, t: Theme) => `A bee visited ${a} flowers. Then it visited ${b} more. How many flowers total?`,
      (a: number, b: number, t: Theme) => `Maya counted ${a} ${THEMES[t].noun} in the grass and ${b} on the log. How many ${THEMES[t].noun} in all?`,
      (a: number, b: number, t: Theme) => `The ant hill had ${a} ants. Then ${b} more came home. Total ants?`,
      (a: number, b: number, t: Theme) => `Our garden has ${a} red ${THEMES[t].noun} and ${b} yellow ones. How many altogether?`,
      (a: number, b: number, t: Theme) => `A butterfly laid ${a} eggs on a leaf, and ${b} more on another. Total eggs?`,
    ];
    let made = 0;
    for (let a = 3; a <= 12 && made < 25; a++) {
      for (let b = 2; b <= 9 && made < 25; b++) {
        if (a + b > 20) continue;
        const theme = themeList[Math.floor(r() * themeList.length)];
        const tmpl = templates[made % templates.length];
        push('math.word_problem.add_within_20', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} + ${b} = ?`,
          choices: mkChoices(a + b, r, 6),
          promptText: tmpl(a, b, theme),
        }, { correct: a + b }, 1150 + (a + b) * 2);
        made++;
      }
    }
  }

  // subtract within 20 word problems
  {
    const r = rng(61);
    const templates = [
      (a: number, b: number, t: Theme) => `There were ${a} ${THEMES[t].noun}. ${b} flew away. How many left?`,
      (a: number, b: number, t: Theme) => `Cecily had ${a} ${THEMES[t].noun} in her hand. She gave ${b} to Luna. How many left?`,
      (a: number, b: number, t: Theme) => `A flower had ${a} petals. ${b} fell. How many still on the flower?`,
      (a: number, b: number, t: Theme) => `${a} ants were marching. ${b} stopped to eat. How many kept marching?`,
      (a: number, b: number, t: Theme) => `The basket had ${a} ${THEMES[t].noun}. We ate ${b}. How many still in the basket?`,
    ];
    let made = 0;
    for (let a = 5; a <= 20 && made < 25; a++) {
      for (let b = 1; b <= 9 && made < 25; b++) {
        if (a - b < 0) continue;
        const theme = themeList[Math.floor(r() * themeList.length)];
        const tmpl = templates[made % templates.length];
        push('math.word_problem.subtract_within_20', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} − ${b} = ?`,
          choices: mkChoices(a - b, r, 6),
          promptText: tmpl(a, b, theme),
        }, { correct: a - b }, 1200 + (a - b) * 2);
        made++;
      }
    }
  }

  // two-step word problems
  {
    const r = rng(62);
    const templates = [
      (a: number, b: number, c: number, t: Theme) => `Maya counted ${a} ${THEMES[t].noun}. ${b} flew away, then ${c} more came. How many now?`,
      (a: number, b: number, c: number, t: Theme) => `There were ${a} ${THEMES[t].noun} on the bush. ${b} more arrived, then ${c} flew off. How many are on the bush now?`,
      (a: number, b: number, c: number, t: Theme) => `Cecily had ${a} ${THEMES[t].noun}. She gave ${b} to a friend, and picked ${c} more. How many does she have?`,
    ];
    for (let i = 0; i < 15; i++) {
      const a = 8 + Math.floor(r() * 10);
      const b = 2 + Math.floor(r() * 5);
      const c = 2 + Math.floor(r() * 6);
      const tmpl = templates[i % templates.length];
      const theme = themeList[Math.floor(r() * themeList.length)];
      let answer: number;
      if (i % 3 === 0) answer = a - b + c;
      else if (i % 3 === 1) answer = a + b - c;
      else answer = a - b + c;
      if (answer < 0 || answer > 25) continue;
      push('math.word_problem.two_step', 'EquationTap', {
        type: 'EquationTap',
        equation: i % 3 === 0 ? `${a} − ${b} + ${c} = ?` : `${a} + ${b} − ${c} = ?`,
        choices: mkChoices(answer, r, 6),
        promptText: tmpl(a, b, c, theme),
      }, { correct: answer }, 1400 + answer);
    }
  }

  return out;
}

export async function seedMath(
  sb: SupabaseClient,
  skillIdByCode: Map<string, string>
): Promise<void> {
  const rows = buildMathItems(code => skillIdByCode.get(code));
  // Delete prior seed items for math skills + their attempts
  const mathSkillIds = Array.from(skillIdByCode.entries())
    .filter(([c]) => c.startsWith('math.'))
    .map(([, id]) => id);
  if (mathSkillIds.length > 0) {
    const { data: prior } = await sb.from('item')
      .select('id').eq('generated_by', 'seed').in('skill_id', mathSkillIds);
    const priorIds = (prior ?? []).map(r => r.id);
    if (priorIds.length > 0) {
      await sb.from('attempt').delete().in('item_id', priorIds);
      await sb.from('item').delete().in('id', priorIds);
    }
  }

  if (rows.length === 0) return;
  // insert in batches to stay under any row-count limits
  const batchSize = 500;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await sb.from('item').insert(batch);
    if (error) throw error;
  }
  console.log(`  → math: inserted ${rows.length} items`);
}
