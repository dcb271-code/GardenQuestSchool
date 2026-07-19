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

  // count to 20 — CountingTiles. Two themed passes for n=10..20 (the
  // "Just right" 1st-grade range) and a single pass for n=3..9 (which
  // is pre-K/early-K and only surfaces in "easier" mode). The Elo
  // formula gives n<10 a low rating so it drops out of the normal
  // band; n>=10 sits in the 1st-grade band.
  {
    const r = rng(1);
    // Pre-K / early K material (one pass only)
    for (let n = 3; n <= 9; n++) {
      const theme = themeList[Math.floor(r() * themeList.length)];
      push('math.counting.to_20', 'CountingTiles', {
        type: 'CountingTiles', emoji: THEMES[theme].emoji, count: n,
        promptText: 'How many do you see?',
      }, { count: n }, 800 + n * 6);     // 818..854 → easier mode only
    }
    // Late-K / 1st grade material (two themed passes)
    for (let pass = 0; pass < 2; pass++) {
      for (let n = 10; n <= 20; n++) {
        const theme = themeList[Math.floor(r() * themeList.length)];
        push('math.counting.to_20', 'CountingTiles', {
          type: 'CountingTiles', emoji: THEMES[theme].emoji, count: n,
          // Re-priced to sit in the K range (was 950-1030 which made
          // counting-to-20 land in a Grade-1's working band). Grade-2+
          // shouldn't see these unless they bumped to "easier".
          promptText: pass === 0 ? 'How many do you see?' : `Count the ${THEMES[theme].noun}.`,
        }, { count: n }, 800 + (n - 10) * 6);   // 800..860, K range
      }
    }
  }

  // count to 50 — CountingTiles, n = 21..50 stride 2 + stride 3 (~30 items)
  // Re-priced down to K/early-Grade-1 (was 1000-1150 which made it a
  // Grade-2 working-band item).
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
      }, { count: n }, 870 + n);   // 891..920, late K / early 1st
    }
  }

  // count to 120 — sequence-completion items.
  // Re-priced down to late Grade 1 (was 1100-1135).
  {
    const r = rng(3);
    for (let n = 51; n <= 119; n += Math.max(1, Math.floor(r() * 5))) {
      const seq: (number | null)[] = [n - 2, n - 1, null, n + 1];
      const display = seq.map(x => (x === null ? '?' : x.toString())).join(', ');
      push('math.counting.to_120', 'EquationTap', {
        type: 'EquationTap',
        equation: display,
        choices: mkChoices(n, r, 6),
        promptText: 'What number comes next?',
      }, { correct: n }, 950 + Math.floor(n / 15) * 4);   // 950..980
    }
  }

  // skip 2s — re-priced to late Grade 1 (was 1000-1110, making it a
  // Grade 2 working-band item which made testdad's first sessions
  // feel kindergarten-easy).
  {
    const r = rng(4);
    for (let start = 4; start <= 30; start += 2) {
      const answer = start + 2;
      const seq: (number | null)[] = [start - 2, start, null, start + 4];
      const display = seq.map(x => (x === null ? '?' : x.toString())).join(', ');
      push('math.counting.skip_2s', 'EquationTap', {
        type: 'EquationTap',
        equation: display,
        choices: mkChoices(answer, r, 4),
        promptText: 'What comes next, counting by 2s?',
      }, { correct: answer }, 940 + start);   // 944..970
    }
    // "What's next after" prompts — slightly harder than the sequence
    // version because there's no visual scaffold.
    const starts = [10, 14, 18, 22, 26, 30, 34, 38, 42, 46];
    for (const s of starts) {
      push('math.counting.skip_2s', 'EquationTap', {
        type: 'EquationTap',
        equation: `${s} + 2 = ?`,
        choices: mkChoices(s + 2, r, 4),
        promptText: `What's 2 more than ${s}?`,
      }, { correct: s + 2 }, 980 + Math.floor(s / 4));
    }
  }

  // skip 5s — sequences + fluency (25 items)
  // Same null-sentinel fix as skip_2s; iteration starts at 10 so the
  // leading slot is always visible.
  {
    const r = rng(5);
    for (let start = 10; start <= 100; start += 5) {
      if (r() < 0.6) {
        const answer = start + 5;
        const seq: (number | null)[] = [start - 5, start, null, start + 10];
        const display = seq.map(x => (x === null ? '?' : x.toString())).join(', ');
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
  // Same null-sentinel fix as skip_2s; iteration starts at 20 so the
  // leading slot is always visible.
  {
    const r = rng(6);
    for (let start = 20; start <= 100; start += 10) {
      const answer = start + 10;
      const seq: (number | null)[] = [start - 10, start, null, start + 20];
      const display = seq.map(x => (x === null ? '?' : x.toString())).join(', ');
      push('math.counting.skip_10s', 'EquationTap', {
        type: 'EquationTap',
        equation: display,
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

  // add within 10 — all unique pairs, mix of formats.
  // Cognitive difficulty proxy = min(a, b): adding by 0 or 1 is
  // trivial, so those drop into the "easier" band only. Larger
  // smaller-addend pairs sit at 1st-grade default.
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
        const small = Math.min(a, b);
        // small=0 → 850, small=1 → 920, small=2 → 990, small=3 → 1060,
        // small=4 → 1130, small=5 → 1200. Adding by 0/1 is easier-only.
        const elo = 850 + small * 70;
        push('math.add.within_10', 'EquationTap', {
          type: 'EquationTap', equation, choices, promptText,
        }, { correct: sum }, elo);
      }
    }
  }

  // add within 20 (no crossing) — 2-digit + 1 or 1 + 2-digit, units
  // sum < 10. b is the cognitive load proxy here too — adding by 1
  // is easier than adding by 8.
  {
    const r = rng(11);
    for (let a = 10; a <= 18; a++) {
      for (let b = 1; b <= 9; b++) {
        if ((a % 10) + b >= 10) continue;
        if (a + b > 20) continue;
        const sum = a + b;
        // b=1 → 1000, b=2 → 1030, ... b=9 → 1240
        const elo = 970 + b * 30;
        push('math.add.within_20.no_crossing', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} + ${b} = ?`,
          choices: mkChoices(sum, r, 6),
          promptText: r() < 0.5 ? `${a} plus ${b} is?` : `What's ${a} + ${b}?`,
        }, { correct: sum }, elo);
      }
    }
  }

  // doubles + near-doubles drilled into add.within_20.no_crossing
  // (1+1, 2+2, ... 5+5 are easy; 5+6, 6+7 are "near doubles" and a
  // separate cognitive strategy worth practicing on its own).
  {
    const r = rng(11.5);
    // Doubles 1+1 .. 9+9 (the 5+5 .. 9+9 ones cross 10 so they live
    // in the crossing_ten skill instead — only push the no-crossing
    // doubles here).
    for (let n = 1; n <= 4; n++) {
      push('math.add.within_20.no_crossing', 'EquationTap', {
        type: 'EquationTap',
        equation: `${n} + ${n} = ?`,
        choices: mkChoices(n + n, r, 5),
        promptText: `${n} doubled is…?`,
      }, { correct: n + n }, 990 + n * 8);
    }
    // Near-doubles n + (n+1) where the sum still doesn't cross 10
    for (let n = 1; n <= 4; n++) {
      push('math.add.within_20.no_crossing', 'EquationTap', {
        type: 'EquationTap',
        equation: `${n} + ${n + 1} = ?`,
        choices: mkChoices(n + n + 1, r, 5),
        promptText: `${n} plus one more than ${n}?`,
      }, { correct: n + n + 1 }, 1010 + n * 8);
    }
    // "+10" and "+9" mental moves — anchor sums for Grade-2 fluency
    for (let a = 1; a <= 9; a++) {
      push('math.add.within_20.no_crossing', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} + 10 = ?`,
        choices: mkChoices(a + 10, r, 6),
        promptText: `${a} plus a ten — what's the total?`,
      }, { correct: a + 10 }, 1050 + a * 3);
    }
  }

  // add within 20 (crossing ten) — MAKE-10 strategy items + standard + word problems
  // The make-10 mental model is a TEACHING strategy ("decompose b
  // to fill a to 10, then add the rest") — but the literal prompt
  // must not say "make 10," because the *answer* isn't 10. Saying
  // "Try making 10: 6 plus 8?" reads as if 10 is the target, when
  // the sum is 14. Phrasings here vary the framing without ever
  // naming a wrong target.
  {
    const r = rng(12);
    // Pool of neutral prompt phrasings for the same "a + b = sum" item.
    const promptPhrasings = [
      (a: number, b: number) => `What is ${a} plus ${b}?`,
      (a: number, b: number) => `${a} plus ${b} — what's the sum?`,
      (a: number, b: number) => `Add it up: ${a} plus ${b}.`,
      (a: number, b: number) => `${a} and ${b} together make…?`,
      (a: number, b: number) => `Find the total of ${a} and ${b}.`,
    ];
    // straightforward pairs where a + b > 10
    for (let a = 2; a <= 9; a++) {
      for (let b = 2; b <= 9; b++) {
        if (a + b <= 10) continue;
        if (a + b > 20) continue;
        const sum = a + b;
        const phrase = promptPhrasings[(a * 7 + b) % promptPhrasings.length];
        push('math.add.within_20.crossing_ten', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} + ${b} = ?`,
          choices: mkChoices(sum, r, 6),
          promptText: phrase(a, b),
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

  // add within 100 (no regrouping) — 80 items at varied Elo so the
  // skill spans an actual band, not a single price. Two-digit + 1
  // sits at the bottom of the band (Grade-1.5), two-digit + two-digit
  // sits at the top (Grade-2 working band).
  {
    const r = rng(14);
    // Subset 1: 2-digit + 1-digit (easier of the no-regrouping items)
    for (let a = 11; a <= 90; a += 4) {
      for (let b = 1; b <= 8; b += 2) {
        if ((a % 10) + b >= 10) continue;
        push('math.add.within_100.no_regrouping', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} + ${b} = ?`,
          choices: mkChoices(a + b, r, 8),
          promptText: `${a} plus ${b}.`,
        }, { correct: a + b }, 1090 + Math.floor(a / 20) * 4);   // 1090..1110
      }
    }
    // Subset 2: 2-digit + 2-digit, no regrouping (proper Grade-2)
    const pairs: Array<[number, number]> = [];
    for (let a = 12; a <= 80; a += 4) {
      for (let b = 11; b <= 80; b += 6) {
        if ((a % 10) + (b % 10) >= 10) continue;
        if (a + b > 99) continue;
        pairs.push([a, b]);
      }
    }
    for (const [a, b] of shuffle(pairs, r).slice(0, 50)) {
      push('math.add.within_100.no_regrouping', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} + ${b} = ?`,
        choices: mkChoices(a + b, r, 10),
        promptText: `${a} plus ${b} — stack the tens and ones.`,
      }, { correct: a + b }, 1200 + Math.floor((a + b) / 10) * 3);   // 1230..1260
    }
  }

  // add within 100 (with regrouping) — 50 items at Grade-2 working
  // band. Spread by sum size so smaller sums (~30) sit lower than
  // larger ones (~90). Includes some 2-digit-plus-1-digit borrowing
  // which is genuine Grade-2 mental work.
  {
    const r = rng(15);
    // 2-digit + 1-digit, ones cross 10 (e.g. 27+5)
    for (let a = 12; a <= 90; a += 3) {
      for (let b = 4; b <= 9; b += 2) {
        if ((a % 10) + b < 10) continue;
        if (a + b > 99) continue;
        push('math.add.within_100.with_regrouping', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} + ${b} = ?`,
          choices: mkChoices(a + b, r, 8),
          promptText: `${a} plus ${b} — the ones spill over the ten.`,
        }, { correct: a + b }, 1240 + Math.floor((a + b) / 20) * 5);
      }
    }
    // 2-digit + 2-digit with carry
    const pairs: Array<[number, number]> = [];
    for (let a = 12; a <= 80; a += 3) {
      for (let b = 11; b <= 80; b += 5) {
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
      }, { correct: a + b }, 1330 + Math.floor((a + b) / 10) * 3);
    }
    // Story-flavoured 2-digit add-with-carry (5 word problems)
    const stories = [
      (a: number, b: number) => `Cecily collected ${a} acorns. Esme found ${b} more. How many acorns altogether?`,
      (a: number, b: number) => `${a} bees were in the hive. ${b} more flew home. How many bees in all?`,
      (a: number, b: number) => `A garden has ${a} red tulips and ${b} yellow ones. How many tulips total?`,
      (a: number, b: number) => `The ant hill had ${a} ants on Sunday and ${b} new ones on Monday. Total ants?`,
      (a: number, b: number) => `Sam read ${a} pages this week and ${b} pages last week. How many pages so far?`,
    ];
    for (let i = 0; i < stories.length; i++) {
      const a = 18 + i * 7;
      const b = 14 + i * 5;
      push('math.add.within_100.with_regrouping', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} + ${b} = ?`,
        choices: mkChoices(a + b, r, 8),
        promptText: stories[i](a, b),
      }, { correct: a + b }, 1380 + i * 5);
    }
  }

  // ═══════════ SUBTRACTION ═══════════

  // subtract within 10 (Petal Falls).
  // Cognitive difficulty proxy = b (the subtrahend): subtracting 0 or
  // 1 is trivial regardless of a, so those drop into the "easier"
  // band. b = a (returns 0) is also trivial. The previous formula
  // used `diff = a - b` which inverted the actual difficulty —
  // "10 − 9 = 1" was rated easier than "5 − 0 = 5".
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
        // b=0 → 850, b=1 → 880, b=2 → 910, b=3 → 940, b=4 → 970,
        // b=5 → 1000, ... b=9 → 1120. Anything subtracting 3 or
        // larger lands in the default band.
        // b == a (returns 0) is trivial — clamp to easier-only.
        const elo = (b === a) ? 850 : 850 + b * 30;
        push('math.subtract.within_10', 'EquationTap', {
          type: 'EquationTap', equation, choices, promptText,
        }, { correct: diff }, elo);
      }
    }
  }

  // subtract within 20 (no crossing) — tens digit stays. b is the
  // cognitive load proxy — subtracting 1 is trivial regardless of a.
  {
    const r = rng(21);
    for (let a = 11; a <= 19; a++) {
      for (let b = 1; b <= (a % 10); b++) {
        const diff = a - b;
        // b=1 → 1010, b=2 → 1050, ... b=9 → 1330
        const elo = 970 + b * 40;
        push('math.subtract.within_20.no_crossing', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} − ${b} = ?`,
          choices: mkChoices(diff, r, 6),
          promptText: `${a} take away ${b} is?`,
        }, { correct: diff }, elo);
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

  // subtract within 100 (no regrouping) — 70 items.
  // Lower band: 2-digit minus 1-digit. Upper band: 2-digit minus 2-digit.
  {
    const r = rng(23);
    // 2-digit minus 1-digit (no regrouping)
    for (let a = 13; a <= 99; a += 3) {
      for (let b = 1; b <= 8; b += 2) {
        if ((a % 10) < b) continue;
        push('math.subtract.within_100.no_regrouping', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} − ${b} = ?`,
          choices: mkChoices(a - b, r, 8),
          promptText: `${a} take away ${b}.`,
        }, { correct: a - b }, 1100 + Math.floor(a / 25) * 4);
      }
    }
    // 2-digit minus 2-digit
    const pairs: Array<[number, number]> = [];
    for (let a = 22; a <= 99; a += 3) {
      for (let b = 11; b <= a - 10; b += 6) {
        if ((a % 10) < (b % 10)) continue;
        pairs.push([a, b]);
      }
    }
    for (const [a, b] of shuffle(pairs, r).slice(0, 50)) {
      push('math.subtract.within_100.no_regrouping', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} − ${b} = ?`,
        choices: mkChoices(a - b, r, 10),
        promptText: `${a} minus ${b} — line up the tens and ones.`,
      }, { correct: a - b }, 1250 + Math.floor((a - b) / 10) * 3);
    }
  }

  // subtract within 100 (with regrouping) — 50 items + word problems.
  {
    const r = rng(24);
    // 2-digit minus 1-digit, ones cross 10 (need to borrow, e.g. 32-5)
    for (let a = 12; a <= 99; a += 3) {
      for (let b = 4; b <= 9; b += 2) {
        if ((a % 10) >= b) continue;
        if (a - b < 0) continue;
        push('math.subtract.within_100.with_regrouping', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} − ${b} = ?`,
          choices: mkChoices(a - b, r, 8),
          promptText: `${a} minus ${b} — borrow from the tens.`,
        }, { correct: a - b }, 1310 + Math.floor((a - b) / 20) * 4);
      }
    }
    // 2-digit minus 2-digit with borrowing
    const pairs: Array<[number, number]> = [];
    for (let a = 22; a <= 99; a += 3) {
      for (let b = 13; b <= a - 5; b += 5) {
        if ((a % 10) >= (b % 10)) continue;
        pairs.push([a, b]);
      }
    }
    for (const [a, b] of shuffle(pairs, r).slice(0, 40)) {
      push('math.subtract.within_100.with_regrouping', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} − ${b} = ?`,
        choices: mkChoices(a - b, r, 10),
        promptText: `${a} − ${b} — you'll need to borrow from the tens.`,
      }, { correct: a - b }, 1390 + Math.floor((a - b) / 10) * 3);
    }
    // Story-flavoured 2-digit subtract with borrow (5 items)
    const stories = [
      (a: number, b: number) => `There were ${a} berries on the bush. The birds ate ${b}. How many berries left?`,
      (a: number, b: number) => `Cecily had ${a} stickers. She gave ${b} to her sister. How many does Cecily have now?`,
      (a: number, b: number) => `The pond had ${a} tadpoles in spring. By summer, ${b} had become frogs. How many tadpoles left?`,
      (a: number, b: number) => `${a} ants started marching. ${b} stopped at a leaf. How many kept going?`,
      (a: number, b: number) => `A book has ${a} pages. Sam has read ${b}. How many pages left to read?`,
    ];
    for (let i = 0; i < stories.length; i++) {
      const a = 30 + i * 8;
      const b = 12 + i * 3;
      push('math.subtract.within_100.with_regrouping', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} − ${b} = ?`,
        choices: mkChoices(a - b, r, 8),
        promptText: stories[i](a, b),
      }, { correct: a - b }, 1430 + i * 5);
    }
  }

  // ═══════════ EVEN / ODD ═══════════
  // 2.OA.C.3 — recognize even or odd numbers up to 20.
  // Uses EquationTap as a binary choice between the two strings, and
  // a complementary CountingTiles-friendly format.
  {
    const r = rng(46);
    for (let n = 2; n <= 20; n++) {
      const correct = n % 2 === 0 ? 'even' : 'odd';
      const distractor = n % 2 === 0 ? 'odd' : 'even';
      push('math.even_odd.recognize', 'EquationTap', {
        type: 'EquationTap',
        equation: String(n),
        // Strings instead of numbers — EquationTap will show them as
        // tiles. The score check is by `correct` value, which uses
        // strict equality, so this works as long as the renderer
        // doesn't number-coerce.
        choices: [correct, distractor],
        promptText: `Is ${n} even or odd?`,
      }, { correct }, 1080 + (n - 2) * 4);
    }
    // a few "what's the next even number after N?" items at higher Elo
    for (const n of [11, 17, 23, 29, 35, 41, 49, 57]) {
      const next = n + (n % 2 === 0 ? 2 : 1);
      push('math.even_odd.recognize', 'EquationTap', {
        type: 'EquationTap',
        equation: `next even after ${n}?`,
        choices: mkChoices(next, r, 4),
        promptText: `What's the next even number after ${n}?`,
      }, { correct: next }, 1180 + Math.floor(n / 5));
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
      }, { symbol }, Math.abs(left - right) < 5 ? 1200 : 1150);
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

  // equal groups — text version (EquationTap), now FOLLOWED by visual
  // versions so the planner has both presentations to choose from.
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
  // VISUAL equal groups — same skill, drawn version. Lower Elo than
  // the text version because the picture acts as a scaffold.
  {
    const r = rng(50.5);
    for (let g = 2; g <= 5; g++) {
      for (let each = 2; each <= 6; each++) {
        const total = g * each;
        const theme = themeList[Math.floor(r() * themeList.length)];
        const word = THEMES[theme];
        push('math.multiply.equal_groups', 'EqualGroupsVisual', {
          type: 'EqualGroupsVisual',
          groups: g, each, emoji: word.emoji,
          choices: mkChoices(total, r, 6),
          promptText: `Look at the ${g} rings of ${word.noun} — how many in all?`,
        }, { total }, 1240 + total * 3);
      }
    }
  }

  // arrays (rows x cols) — text version, then visual.
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
  // VISUAL arrays — same skill, drawn rows × cols grid.
  {
    const r = rng(51.5);
    for (let rows = 2; rows <= 5; rows++) {
      for (let cols = 2; cols <= 6; cols++) {
        const total = rows * cols;
        const theme = themeList[Math.floor(r() * themeList.length)];
        const word = THEMES[theme];
        push('math.multiply.arrays', 'ArrayGridVisual', {
          type: 'ArrayGridVisual',
          rows, cols, emoji: word.emoji,
          choices: mkChoices(total, r, 6),
          promptText: `${rows} rows of ${word.noun} with ${cols} in each row.`,
        }, { total }, 1240 + total * 3);
      }
    }
  }

  // ═══════════ TIME (Grade 2) ═══════════
  // Easier skill: hour + half-hour only (e.g. 3:00, 7:30). 24 items.
  {
    const r = rng(70);
    const fmt = (h: number, m: number) => `${h}:${m.toString().padStart(2, '0')}`;
    for (let h = 1; h <= 12; h++) {
      for (const m of [0, 30]) {
        // Distractors: same hour different minute, neighbouring hour
        // same minute, randomly off by an hour.
        const correct = fmt(h, m);
        const distractors = new Set<string>();
        distractors.add(fmt(h, m === 0 ? 30 : 0));
        distractors.add(fmt(((h + 1) % 12) || 12, m));
        distractors.add(fmt(((h + 6) % 12) || 12, m === 0 ? 30 : 0));
        const choices = [correct, ...Array.from(distractors)].slice(0, 4);
        push('math.time.read_hour_half', 'ClockRead', {
          type: 'ClockRead',
          hour: h, minute: m, choices,
          promptText: 'What time is it?',
        }, { time: correct }, 1080 + (m === 0 ? 0 : 12));
      }
    }
  }
  // Harder skill: nearest 5 minutes. 36 items spread across the hour.
  {
    const r = rng(71);
    const fmt = (h: number, m: number) => `${h}:${m.toString().padStart(2, '0')}`;
    const fiveMinTimes: Array<[number, number, number]> = [];
    // For each interesting hour, sample a few minute values
    for (let h = 1; h <= 12; h++) {
      // Quarter past (15) and quarter to (45) feel "anchored"; 5/10/20/25/35/40/50/55 are the harder ones
      const minutes = [15, 45, 10, 20, 35, 50];
      for (const m of minutes) {
        // Difficulty: 15 / 45 → easier (1180), 10/20 → mid (1250),
        // 35/50 → hardest (1330)
        const elo =
          m === 15 || m === 45 ? 1180 :
          m === 10 || m === 20 ? 1250 :
          1330;
        fiveMinTimes.push([h, m, elo]);
      }
    }
    for (const [h, m, elo] of fiveMinTimes) {
      const correct = fmt(h, m);
      const distractors = new Set<string>();
      // Same hour ±5 minutes (very near)
      distractors.add(fmt(h, (m + 5) % 60));
      distractors.add(fmt(h, (m - 5 + 60) % 60));
      // Different hour same minute (read the hour wrong)
      distractors.add(fmt(((h % 12) + 1), m));
      // Trim to a unique set of 3 distractors
      const distArr = Array.from(distractors).filter(d => d !== correct).slice(0, 3);
      const choices = [correct, ...distArr];
      push('math.time.read_to_5_min', 'ClockRead', {
        type: 'ClockRead',
        hour: h, minute: m, choices,
        promptText: 'What time does this clock show?',
      }, { time: correct }, elo);
    }
  }

  // ═══════════ MONEY (Grade 2) ═══════════
  // Coin counting — pennies, nickels, dimes, quarters. Easy items
  // are single-denomination piles; harder ones mix two or three.
  {
    const r = rng(72);
    type CoinKind = 'penny' | 'nickel' | 'dime' | 'quarter';
    const VALUE: Record<CoinKind, number> = { penny: 1, nickel: 5, dime: 10, quarter: 25 };
    const coinSetup = (coins: CoinKind[]): { coins: CoinKind[]; cents: number } => ({
      coins, cents: coins.reduce((sum, c) => sum + VALUE[c], 0),
    });
    const distractorsFor = (cents: number): number[] => {
      // Common confusions: forgot a coin (off by 1, 5, or 10), counted
      // a nickel as 1¢, etc. Mix near-misses with a far miss.
      const opts = [
        cents - 1, cents + 1, cents - 5, cents + 5, cents - 10, cents + 10,
      ].filter(v => v > 0 && v !== cents);
      return shuffle(opts, r).slice(0, 3);
    };
    const pushCoin = (skill: 'math.money.coin_count', items: CoinKind[], elo: number, prompt = 'How much money is this?') => {
      const { coins, cents } = coinSetup(items);
      const choices = [cents, ...distractorsFor(cents)];
      push(skill, 'CoinSum', {
        type: 'CoinSum', coins, choices, promptText: prompt,
      }, { cents }, elo);
    };
    // Tier 1: just pennies (skip count by 1) — 1100
    for (let n = 3; n <= 9; n++) {
      pushCoin('math.money.coin_count', Array(n).fill('penny'), 1100 + n * 2);
    }
    // Tier 2: just nickels (skip count by 5) — 1180
    for (let n = 2; n <= 6; n++) {
      pushCoin('math.money.coin_count', Array(n).fill('nickel'), 1180 + n * 3);
    }
    // Tier 3: just dimes (skip count by 10) — 1200
    for (let n = 2; n <= 7; n++) {
      pushCoin('math.money.coin_count', Array(n).fill('dime'), 1200 + n * 3);
    }
    // Tier 4: nickels + pennies — 1280
    pushCoin('math.money.coin_count', ['nickel', 'penny', 'penny'], 1270);                            // 7
    pushCoin('math.money.coin_count', ['nickel', 'nickel', 'penny'], 1280);                            // 11
    pushCoin('math.money.coin_count', ['nickel', 'nickel', 'penny', 'penny', 'penny'], 1300);          // 13
    pushCoin('math.money.coin_count', ['nickel', 'nickel', 'nickel', 'penny', 'penny'], 1310);         // 17
    // Tier 5: dimes + pennies — 1290
    pushCoin('math.money.coin_count', ['dime', 'penny'], 1270);                                        // 11
    pushCoin('math.money.coin_count', ['dime', 'penny', 'penny', 'penny'], 1290);                      // 13
    pushCoin('math.money.coin_count', ['dime', 'dime', 'penny'], 1300);                                // 21
    pushCoin('math.money.coin_count', ['dime', 'dime', 'penny', 'penny'], 1310);                       // 22
    // Tier 6: dimes + nickels — 1320
    pushCoin('math.money.coin_count', ['dime', 'nickel'], 1300);                                       // 15
    pushCoin('math.money.coin_count', ['dime', 'dime', 'nickel'], 1320);                               // 25
    pushCoin('math.money.coin_count', ['dime', 'nickel', 'nickel'], 1330);                             // 20
    pushCoin('math.money.coin_count', ['dime', 'dime', 'dime', 'nickel'], 1350);                       // 35
    // Tier 7: quarters added — 1370
    pushCoin('math.money.coin_count', ['quarter'], 1280);                                              // 25
    pushCoin('math.money.coin_count', ['quarter', 'penny'], 1300);                                     // 26
    pushCoin('math.money.coin_count', ['quarter', 'nickel'], 1340);                                    // 30
    pushCoin('math.money.coin_count', ['quarter', 'dime'], 1360);                                      // 35
    pushCoin('math.money.coin_count', ['quarter', 'quarter'], 1380);                                   // 50
    pushCoin('math.money.coin_count', ['quarter', 'quarter', 'dime'], 1400);                           // 60
    pushCoin('math.money.coin_count', ['quarter', 'quarter', 'dime', 'nickel'], 1410);                 // 65
    pushCoin('math.money.coin_count', ['quarter', 'dime', 'dime', 'nickel', 'penny'], 1420);           // 51
    pushCoin('math.money.coin_count', ['quarter', 'quarter', 'quarter'], 1420);                        // 75
    pushCoin('math.money.coin_count', ['quarter', 'quarter', 'dime', 'dime', 'nickel', 'penny'], 1450);// 76
    // Story-flavoured (price match)
    pushCoin('math.money.coin_count',
      ['dime', 'dime', 'nickel'], 1330, 'You have these coins. How much can you spend?');             // 25
    pushCoin('math.money.coin_count',
      ['quarter', 'dime', 'penny'], 1370, 'A pencil costs 36¢. Do you have enough? Count up.');        // 36
  }

  // ═══════════ FRACTIONS (Grade 3, first push) ═══════════
  // Two related skills: identify (pick the matching n/d for the
  // shaded picture) and compare_visual (which of two fractions is
  // bigger). Items use both 'pie' and 'bar' shapes — same skill,
  // different visualisations, so the picker can rotate.
  {
    const r = rng(80);
    type Pair = { num: number; den: number };
    const fmt = (p: Pair) => `${p.num}/${p.den}`;
    const sameFamily = (p: Pair, others: Pair[]) =>
      others.filter(o => o.den === p.den).map(fmt);
    // Build a pool of "true" fractions n/d where 1<=n<=d-1 and 2<=d<=8.
    const pool: Pair[] = [];
    for (let d = 2; d <= 8; d++) {
      for (let n = 1; n < d; n++) pool.push({ num: n, den: d });
    }

    // ── identify ──
    // Distractors (in order of preference):
    //   1. swap num/den  (3/4 → 4/3) — common confusion
    //   2. neighbour numerator (3/4 → 2/4)  — off-by-one
    //   3. same numerator different denominator (3/4 → 3/8)
    //   4. plausible random fraction
    for (const target of pool) {
      const correct = fmt(target);
      const distractors: string[] = [];
      const swap = `${target.den}/${target.num + target.den}`;   // never duplicates correct
      // swapped (only sometimes makes sense — only if num<den-1)
      if (target.num !== target.den - 1) distractors.push(`${target.den}/${target.num}`);
      // off-by-one numerator
      const nbr = target.num === 1 ? target.num + 1 : target.num - 1;
      if (nbr >= 1 && nbr <= target.den - 1) distractors.push(`${nbr}/${target.den}`);
      // same numerator, different denominator
      const altDen = target.den === 8 ? 4 : target.den + 1;
      if (target.num <= altDen - 1) distractors.push(`${target.num}/${altDen}`);
      // unique top-3
      const distArr = Array.from(new Set(distractors.filter(d => d !== correct))).slice(0, 3);
      // Pad with a generic if we ran short
      while (distArr.length < 3) {
        const p = pool[Math.floor(r() * pool.length)];
        const f = fmt(p);
        if (f !== correct && !distArr.includes(f)) distArr.push(f);
      }
      // BOTH pie + bar versions — pie at slightly easier Elo, bar a touch harder
      const baseElo = 1450 + target.den * 8 + target.num * 2;
      push('math.fractions.identify', 'FractionIdentify', {
        type: 'FractionIdentify',
        numerator: target.num, denominator: target.den, shape: 'pie',
        choices: [correct, ...distArr],
        promptText: 'What fraction is shaded?',
      }, { fraction: correct }, baseElo);
      push('math.fractions.identify', 'FractionIdentify', {
        type: 'FractionIdentify',
        numerator: target.num, denominator: target.den, shape: 'bar',
        choices: [correct, ...distArr],
        promptText: 'What fraction of the bar is shaded?',
      }, { fraction: correct }, baseElo + 20);
    }

    // ── compare visual ──
    // Curated comparison pairs: same-denominator (easier — just
    // compare numerators), then same-numerator different-denominator
    // (harder — bigger denominator means smaller fraction!), then
    // mixed.
    const cmp = (l: Pair, r: Pair): '<' | '>' | '=' => {
      const a = l.num / l.den; const b = r.num / r.den;
      if (Math.abs(a - b) < 1e-9) return '=';
      return a < b ? '<' : '>';
    };
    const pushCompare = (l: Pair, right: Pair, shape: 'pie' | 'bar', elo: number, prompt = 'Which fraction is bigger?') => {
      push('math.fractions.compare_visual', 'FractionCompareVisual', {
        type: 'FractionCompareVisual',
        left: { numerator: l.num, denominator: l.den },
        right: { numerator: right.num, denominator: right.den },
        shape,
        promptText: prompt,
      }, { symbol: cmp(l, right) }, elo);
    };

    // Same denominator (easier — purely numerator comparison)
    const sameDenSet: Array<[Pair, Pair]> = [
      [{ num: 1, den: 4 }, { num: 3, den: 4 }],
      [{ num: 2, den: 4 }, { num: 3, den: 4 }],
      [{ num: 1, den: 6 }, { num: 4, den: 6 }],
      [{ num: 2, den: 8 }, { num: 5, den: 8 }],
      [{ num: 3, den: 6 }, { num: 5, den: 6 }],
      [{ num: 1, den: 3 }, { num: 2, den: 3 }],
      [{ num: 4, den: 8 }, { num: 7, den: 8 }],
    ];
    for (const [l, right] of sameDenSet) {
      pushCompare(l, right, 'pie', 1500);
      pushCompare(l, right, 'bar', 1510);
    }
    // Same numerator (counter-intuitive — bigger denominator = smaller piece)
    const sameNumSet: Array<[Pair, Pair]> = [
      [{ num: 1, den: 2 }, { num: 1, den: 4 }],
      [{ num: 1, den: 3 }, { num: 1, den: 6 }],
      [{ num: 1, den: 4 }, { num: 1, den: 8 }],
      [{ num: 2, den: 3 }, { num: 2, den: 6 }],
      [{ num: 3, den: 4 }, { num: 3, den: 8 }],
      [{ num: 1, den: 2 }, { num: 1, den: 8 }],
    ];
    for (const [l, right] of sameNumSet) {
      pushCompare(l, right, 'pie', 1580, 'Look carefully — bigger or smaller?');
      pushCompare(l, right, 'bar', 1590, 'Look carefully — bigger or smaller?');
    }
    // Equivalent fractions (= sign — visually obvious, conceptually rich)
    const equivSet: Array<[Pair, Pair]> = [
      [{ num: 1, den: 2 }, { num: 2, den: 4 }],
      [{ num: 1, den: 2 }, { num: 4, den: 8 }],
      [{ num: 1, den: 3 }, { num: 2, den: 6 }],
      [{ num: 2, den: 4 }, { num: 4, den: 8 }],
      [{ num: 3, den: 4 }, { num: 6, den: 8 }],
    ];
    for (const [l, right] of equivSet) {
      pushCompare(l, right, 'pie', 1620, 'Are these the same, or is one bigger?');
      pushCompare(l, right, 'bar', 1630, 'Are these the same, or is one bigger?');
    }
  }

  // ═══════════ GRADE 3 — multiplication facts (3.OA.C.7) ═══════════
  // facts_to_5 — every pair (a × b) where 0..5 × 0..5. We seed BOTH
  // the text version (EquationTap) and a visual version
  // (ArrayGridVisual) for the smaller arrays so the picker can
  // rotate presentation. Visual items priced lower because the
  // picture is a scaffold.
  {
    const r = rng(53);
    for (let a = 0; a <= 5; a++) {
      for (let b = 0; b <= 5; b++) {
        const total = a * b;
        // ×0 facts: the old hand-picked distractors collapsed to
        // duplicates when a or b was 0/1 (e.g. [0,1,0,0]). Build a
        // distinct set instead: 1 and a+b ("added instead of
        // multiplied") plus small pads.
        let choices: number[];
        if (total === 0) {
          const pool = new Set([0, 1, a + b, Math.max(a, b) + 2]);
          for (let pad = 2; pool.size < 4; pad++) pool.add(pad);
          choices = shuffle(Array.from(pool).slice(0, 4), r);
        } else {
          choices = mkChoices(total, r, 6);
        }
        // Difficulty proxy: the larger of the two factors. ×0 / ×1 are
        // trivial (Elo 1300), then climb steadily.
        const big = Math.max(a, b);
        const elo = big <= 1 ? 1300 : 1340 + big * 25;
        push('math.multiply.facts_to_5', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} × ${b} = ?`,
          choices,
          promptText: `${a} times ${b}.`,
        }, { correct: total }, elo);
      }
    }
    // Visual scaffold variants — only for non-zero pairs where rows + cols are 2..5
    for (let rows = 2; rows <= 5; rows++) {
      for (let cols = 2; cols <= 5; cols++) {
        const total = rows * cols;
        const theme = themeList[Math.floor(r() * themeList.length)];
        push('math.multiply.facts_to_5', 'ArrayGridVisual', {
          type: 'ArrayGridVisual',
          rows, cols, emoji: THEMES[theme].emoji,
          choices: mkChoices(total, r, 6),
          promptText: `Count: ${rows} rows of ${cols}.`,
        }, { total }, 1280 + total * 4);
      }
    }
  }

  // facts_to_10 — climbs into ×6..×10 territory (the harder facts)
  {
    const r = rng(54);
    for (let a = 0; a <= 10; a++) {
      for (let b = 0; b <= 10; b++) {
        const total = a * b;
        // Don't double-seed the ×0..×5 facts (those live in facts_to_5).
        if (a <= 5 && b <= 5) continue;
        const choices = mkChoices(total, r, 8);
        const big = Math.max(a, b);
        // 6×6=36 lands at 1480; 9×9=81 at 1640; 10×10=100 at 1660.
        const elo = 1400 + big * 25 + Math.floor(total / 8);
        push('math.multiply.facts_to_10', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} × ${b} = ?`,
          choices,
          promptText: `${a} times ${b}.`,
        }, { correct: total }, elo);
      }
    }
    // A handful of word problems mixed in so it's not all bare facts
    const stories = [
      (a: number, b: number) => `Each tray has ${a} muffins. There are ${b} trays. How many muffins?`,
      (a: number, b: number) => `${a} bird nests with ${b} eggs in each. How many eggs altogether?`,
      (a: number, b: number) => `A garden has ${a} rows of ${b} carrots. How many carrots?`,
    ];
    const fa = [4, 6, 7, 8];
    const fb = [6, 7, 8, 9];
    for (let i = 0; i < stories.length; i++) {
      const a = fa[i]; const b = fb[i];
      const total = a * b;
      push('math.multiply.facts_to_10', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} × ${b} = ?`,
        choices: mkChoices(total, r, 8),
        promptText: stories[i](a, b),
      }, { correct: total }, 1500 + total);
    }
  }

  // ═══════════ GRADE 3 — division (3.OA.A.2 / B.6 / C.7) ═══════════
  // equal_share — VISUAL division. "12 acorns shared among 3 plates"
  {
    const r = rng(55);
    type Pair = { total: number; groups: number };
    const pairs: Pair[] = [
      { total: 4, groups: 2 }, { total: 6, groups: 2 }, { total: 8, groups: 2 },
      { total: 6, groups: 3 }, { total: 9, groups: 3 }, { total: 12, groups: 3 }, { total: 15, groups: 3 },
      { total: 8, groups: 4 }, { total: 12, groups: 4 }, { total: 16, groups: 4 }, { total: 20, groups: 4 },
      { total: 10, groups: 5 }, { total: 15, groups: 5 }, { total: 20, groups: 5 }, { total: 25, groups: 5 },
      { total: 12, groups: 6 }, { total: 18, groups: 6 }, { total: 24, groups: 6 }, { total: 30, groups: 6 },
    ];
    const themeMap: Array<[string, string]> = [
      ['🌰', '🐿️'],   // acorns / squirrels
      ['🍎', '🧺'],    // apples / baskets
      ['🐝', '🌼'],    // bees / flowers
      ['🥕', '🐰'],    // carrots / bunnies
      ['🐜', '🪨'],    // ants / rocks
    ];
    for (let i = 0; i < pairs.length; i++) {
      const { total, groups } = pairs[i];
      const each = total / groups;
      const [emoji, groupEmoji] = themeMap[i % themeMap.length];
      const distractors = new Set<number>();
      distractors.add(each + 1);
      if (each > 1) distractors.add(each - 1);
      distractors.add(total - groups);
      const choices = [each, ...Array.from(distractors).filter(d => d !== each).slice(0, 3)];
      // Easier when each is small (2-3) and groups few; harder for bigger total
      const elo = 1380 + groups * 12 + each * 8;
      push('math.divide.equal_share', 'EqualShareVisual', {
        type: 'EqualShareVisual',
        total, groups, emoji, groupEmoji,
        choices,
        promptText: `${total} shared equally among ${groups}.`,
      }, { each }, elo);
    }
  }

  // facts_to_10 — 30 division facts derived from the multiplication
  // table, including some written as "missing factor" word problems.
  {
    const r = rng(56);
    // Derived from the ×0..×10 table where divisor 1..10 and quotient 1..10
    type DivFact = { dividend: number; divisor: number; quotient: number };
    const facts: DivFact[] = [];
    for (let q = 2; q <= 10; q++) {
      for (let d = 2; d <= 10; d++) {
        facts.push({ dividend: q * d, divisor: d, quotient: q });
      }
    }
    // Sample a fixed subset so the seed pool is bounded but varied.
    const sampled = shuffle(facts, r).slice(0, 50);
    for (const f of sampled) {
      // Difficulty proxy: max(divisor, quotient). The 10× and 5× facts
      // are easier than the 7× and 8×.
      const big = Math.max(f.divisor, f.quotient);
      const elo = 1450 + big * 18;
      push('math.divide.facts_to_10', 'EquationTap', {
        type: 'EquationTap',
        equation: `${f.dividend} ÷ ${f.divisor} = ?`,
        choices: mkChoices(f.quotient, r, 6),
        promptText: `${f.dividend} divided by ${f.divisor}.`,
      }, { correct: f.quotient }, elo);
    }
    // 5 word problems
    const wp = [
      { d: 24, n: 4, story: '24 cookies on 4 plates. Each plate gets…?' },
      { d: 30, n: 5, story: '30 children on 5 buses. How many on each bus?' },
      { d: 18, n: 6, story: '18 marbles, 6 friends. How many marbles each?' },
      { d: 28, n: 7, story: '28 stickers across 7 pages. Each page has…?' },
      { d: 40, n: 8, story: '40 acorns hidden in 8 nests. Each nest has…?' },
    ];
    for (const x of wp) {
      const q = x.d / x.n;
      push('math.divide.facts_to_10', 'EquationTap', {
        type: 'EquationTap',
        equation: `${x.d} ÷ ${x.n} = ?`,
        choices: mkChoices(q, r, 6),
        promptText: x.story,
      }, { correct: q }, 1530);
    }
  }

  // unknown_factor — "8 × ? = 56" (the algebraic flip of division)
  {
    const r = rng(57);
    const facts: Array<[number, number]> = [
      [3, 4], [3, 6], [3, 8], [4, 5], [4, 6], [4, 7], [4, 8],
      [5, 6], [5, 7], [5, 8], [6, 6], [6, 7], [6, 8], [7, 7],
      [7, 8], [8, 8], [8, 9], [9, 9], [6, 9], [7, 9],
    ];
    for (const [a, b] of facts) {
      const total = a * b;
      const elo = 1480 + Math.max(a, b) * 18;
      push('math.divide.unknown_factor', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} × ? = ${total}`,
        choices: mkChoices(b, r, 5),
        promptText: `${a} times what equals ${total}?`,
      }, { correct: b }, elo);
    }
  }

  // ═══════════ GRADE 3 — 3-digit add/subtract (3.NBT.A.2) ═══════════
  // add within 1000 — ~50 items, two tiers (no/with regrouping)
  {
    const r = rng(80);
    // No regrouping: 3-digit + 3-digit where each column sums < 10
    const nrPairs: Array<[number, number]> = [];
    for (let a = 110; a <= 800; a += 25) {
      for (let b = 110; b <= 999 - a; b += 35) {
        const aH = Math.floor(a / 100), aT = Math.floor((a % 100) / 10), aO = a % 10;
        const bH = Math.floor(b / 100), bT = Math.floor((b % 100) / 10), bO = b % 10;
        if (aH + bH > 9 || aT + bT > 9 || aO + bO > 9) continue;
        nrPairs.push([a, b]);
      }
    }
    for (const [a, b] of shuffle(nrPairs, r).slice(0, 25)) {
      push('math.add.within_1000', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} + ${b} = ?`,
        choices: mkChoices(a + b, r, 10),
        promptText: `${a} plus ${b}.`,
      }, { correct: a + b }, 1450 + Math.floor((a + b) / 100) * 5);
    }
    // With regrouping in any column
    const rgPairs: Array<[number, number]> = [];
    for (let a = 110; a <= 700; a += 18) {
      for (let b = 130; b <= 999 - a; b += 22) {
        const aT = Math.floor((a % 100) / 10), aO = a % 10;
        const bT = Math.floor((b % 100) / 10), bO = b % 10;
        if (aO + bO < 10 && aT + bT < 10) continue;  // need at least one regroup
        rgPairs.push([a, b]);
      }
    }
    for (const [a, b] of shuffle(rgPairs, r).slice(0, 30)) {
      push('math.add.within_1000', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} + ${b} = ?`,
        choices: mkChoices(a + b, r, 10),
        promptText: `${a} + ${b} — watch the carry.`,
      }, { correct: a + b }, 1560 + Math.floor((a + b) / 100) * 4);
    }
  }

  // subtract within 1000
  {
    const r = rng(81);
    // No-borrow 3-digit subtract
    const nbPairs: Array<[number, number]> = [];
    for (let a = 250; a <= 999; a += 22) {
      for (let b = 110; b < a; b += 27) {
        const aH = Math.floor(a / 100), aT = Math.floor((a % 100) / 10), aO = a % 10;
        const bH = Math.floor(b / 100), bT = Math.floor((b % 100) / 10), bO = b % 10;
        if (aH < bH || aT < bT || aO < bO) continue;
        nbPairs.push([a, b]);
      }
    }
    for (const [a, b] of shuffle(nbPairs, r).slice(0, 25)) {
      push('math.subtract.within_1000', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} − ${b} = ?`,
        choices: mkChoices(a - b, r, 10),
        promptText: `${a} minus ${b}.`,
      }, { correct: a - b }, 1480 + Math.floor((a - b) / 100) * 5);
    }
    // With-borrow 3-digit subtract
    const wbPairs: Array<[number, number]> = [];
    for (let a = 230; a <= 980; a += 17) {
      for (let b = 130; b < a - 50; b += 23) {
        const aT = Math.floor((a % 100) / 10), aO = a % 10;
        const bT = Math.floor((b % 100) / 10), bO = b % 10;
        if (aO >= bO && aT >= bT) continue;  // need at least one borrow
        wbPairs.push([a, b]);
      }
    }
    for (const [a, b] of shuffle(wbPairs, r).slice(0, 30)) {
      push('math.subtract.within_1000', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} − ${b} = ?`,
        choices: mkChoices(a - b, r, 10),
        promptText: `${a} − ${b} — borrow when you need to.`,
      }, { correct: a - b }, 1600 + Math.floor((a - b) / 100) * 4);
    }
  }

  // ═══════════ GRADE 3 — rounding (3.NBT.A.1) ═══════════
  // Round to nearest 10
  {
    const r = rng(82);
    for (let n = 12; n <= 99; n += 1) {
      // Sample by skipping exact multiples of 10 (no rounding needed)
      if (n % 10 === 0) continue;
      // 1 in 4 sample — keeps the pool tractable
      if (n % 4 !== 0) continue;
      const rounded = Math.round(n / 10) * 10;
      const distractors = [rounded + 10, rounded - 10, n].filter(d => d !== rounded);
      push('math.placevalue.round_nearest_10', 'EquationTap', {
        type: 'EquationTap',
        equation: `${n} → nearest 10`,
        choices: mkChoices(rounded, r, 4),
        promptText: `Round ${n} to the nearest ten.`,
      }, { correct: rounded }, 1430 + Math.floor(n / 20) * 4);
    }
  }
  // Round to nearest 100
  {
    const r = rng(83);
    for (let n = 110; n <= 990; n += 13) {
      if (n % 100 === 0) continue;
      const rounded = Math.round(n / 100) * 100;
      push('math.placevalue.round_nearest_100', 'EquationTap', {
        type: 'EquationTap',
        equation: `${n} → nearest 100`,
        choices: mkChoices(rounded, r, 6),
        promptText: `Round ${n} to the nearest hundred.`,
      }, { correct: rounded }, 1530 + Math.floor(n / 100) * 4);
    }
  }

  // ═══════════ GRADE 3 — elapsed time intervals (3.MD.A.1) ═══════════
  {
    const r = rng(84);
    const fmt = (h: number, m: number) => `${h}:${m.toString().padStart(2, '0')}`;
    const fmtInterval = (mins: number): string => {
      if (mins < 60) return `${mins} minutes`;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      if (m === 0) return h === 1 ? '1 hour' : `${h} hours`;
      return `${h} hour${h === 1 ? '' : 's'} ${m} min`;
    };
    type Interval = { sH: number; sM: number; eH: number; eM: number; mins: number };
    const items: Interval[] = [];
    // Easy: same hour, only minute hand moves (5..55 min spans)
    for (const span of [10, 15, 20, 25, 30, 35, 40]) {
      const sM = (span < 30) ? 0 : 15;
      const eM = (sM + span) % 60;
      const eH = sM + span >= 60 ? 4 : 3;
      items.push({ sH: 3, sM, eH, eM, mins: span });
    }
    // Medium: cross-hour spans
    items.push({ sH: 2, sM: 45, eH: 3, eM: 30, mins: 45 });
    items.push({ sH: 9, sM: 50, eH: 10, eM: 20, mins: 30 });
    items.push({ sH: 1, sM: 30, eH: 2, eM: 15, mins: 45 });
    items.push({ sH: 7, sM: 25, eH: 8, eM: 5, mins: 40 });
    items.push({ sH: 11, sM: 40, eH: 12, eM: 25, mins: 45 });
    // Harder: full-hour or 1+ hour spans
    items.push({ sH: 2, sM: 0, eH: 3, eM: 0, mins: 60 });
    items.push({ sH: 9, sM: 15, eH: 10, eM: 30, mins: 75 });
    items.push({ sH: 4, sM: 30, eH: 6, eM: 0, mins: 90 });
    items.push({ sH: 11, sM: 0, eH: 12, eM: 45, mins: 105 });

    for (const it of items) {
      const correct = fmtInterval(it.mins);
      // Distractors: ±5, ±15, the wrong-hand answer
      const distractors = new Set<string>([
        fmtInterval(Math.max(5, it.mins - 5)),
        fmtInterval(it.mins + 5),
        fmtInterval(it.mins + 15),
      ]);
      const distArr = Array.from(distractors).filter(d => d !== correct).slice(0, 3);
      const elo = it.mins < 30 ? 1500
              : it.mins < 60 ? 1560
              :                1620;
      push('math.time.elapsed_intervals', 'ClockInterval', {
        type: 'ClockInterval',
        startHour: it.sH, startMinute: it.sM,
        endHour: it.eH, endMinute: it.eM,
        choices: [correct, ...distArr],
        promptText: `It's ${fmt(it.sH, it.sM)} now. Then it's ${fmt(it.eH, it.eM)}. How much time has passed?`,
      }, { interval: correct }, elo);
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

  // ════════════════════════════════════════════════════════════════
  // ═══ LEVEL 4 (CCSS grade 4) — Elo band ≈ 1550–1950 ═══
  // ════════════════════════════════════════════════════════════════

  // Shared helpers for the grade 4/5 blocks.
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  // True iff n1/d1 and n2/d2 are the same value (exact, cross-multiplied).
  const fracEq = (n1: number, d1: number, n2: number, d2: number) => n1 * d2 === n2 * d1;
  // Shuffle a correct string answer with unique distractors, dropping
  // any distractor that equals the correct string.
  const strChoices = (correct: string, distractors: string[], r: () => number): string[] =>
    shuffle([correct, ...Array.from(new Set(distractors.filter(d => d !== correct))).slice(0, 3)], r);
  // Shuffle a correct number with unique positive-integer candidates.
  const numChoices = (correct: number, cands: number[], r: () => number): number[] =>
    shuffle([correct, ...Array.from(new Set(
      cands.filter(c => Number.isInteger(c) && c > 0 && c !== correct)
    )).slice(0, 3)], r);
  const comma = (n: number) => n.toLocaleString('en-US');
  // Format an integer v scaled by 10^dp as a decimal string:
  // fmtDec(345, 2) → "3.45"; fmtDec(42, 1) → "4.2"; dp <= 0 → integer.
  const fmtDec = (v: number, dp: number): string => {
    if (dp <= 0) return String(v * Math.pow(10, -dp));
    const s = String(v).padStart(dp + 1, '0');
    return `${s.slice(0, -dp)}.${s.slice(-dp)}`;
  };

  // ── math.placevalue.to_1_000_000 (4.NBT.A.2) ─────────────────────
  {
    const r = rng(90);
    // "What is the value of the digit d in n?"
    const dvNums = [47203, 83156, 129478, 305672, 561930, 742815, 918264, 36597, 254081, 670943, 485217, 803654];
    for (let i = 0; i < dvNums.length; i++) {
      const n = dvNums[i];
      const digits = String(n).split('').map(Number);
      // pick a non-zero, non-ones-place digit (place >= 10 keeps the
      // distractor set clean)
      let pos = Math.floor(r() * (digits.length - 1));
      while (digits[pos] === 0) pos = (pos + 1) % (digits.length - 1);
      const place = Math.pow(10, digits.length - 1 - pos);
      const d = digits[pos];
      const correct = d * place;
      push('math.placevalue.to_1_000_000', 'EquationTap', {
        type: 'EquationTap',
        equation: comma(n),
        choices: numChoices(correct, [d, correct * 10, correct / 10, d + place], r),
        promptText: `What is the value of the ${d} in ${comma(n)}?`,
      }, { correct }, 1550 + (digits.length - 5) * 40 + i * 4);
    }
    // "Which digit is in the ___ place?"
    const placeNames: Array<[string, number]> = [
      ['ten-thousands', 10000], ['thousands', 1000], ['hundred-thousands', 100000],
    ];
    const wdNums = [147203, 583927, 260148, 731590, 895036, 412675, 968214, 350982];
    for (let i = 0; i < wdNums.length; i++) {
      const n = wdNums[i];
      const [pname, pval] = placeNames[i % placeNames.length];
      const correct = Math.floor(n / pval) % 10;
      const otherDigits = Array.from(new Set(String(n).split('').map(Number)))
        .filter(d => d !== correct);
      push('math.placevalue.to_1_000_000', 'EquationTap', {
        type: 'EquationTap',
        equation: comma(n),
        choices: shuffle([correct, ...otherDigits.slice(0, 3)], r),
        promptText: `In ${comma(n)}, which digit is in the ${pname} place?`,
      }, { correct }, 1580 + i * 6);
    }
    // Expanded form → standard form
    for (let i = 0; i < 6; i++) {
      const parts = [
        (2 + Math.floor(r() * 7)) * 100000,
        (1 + Math.floor(r() * 9)) * 10000,
        (1 + Math.floor(r() * 9)) * 1000,
        (1 + Math.floor(r() * 9)) * 100,
        (1 + Math.floor(r() * 9)) * 10,
        1 + Math.floor(r() * 9),
      ].slice(i % 2 === 0 ? 1 : 0);   // half 5-digit, half 6-digit
      const total = parts.reduce((a, b) => a + b, 0);
      push('math.placevalue.to_1_000_000', 'EquationTap', {
        type: 'EquationTap',
        equation: parts.map(comma).join(' + '),
        choices: numChoices(total, [total + 100, total - 10, total + 1000, total - 100], r),
        promptText: 'Write this in standard form.',
      }, { correct: total }, 1600 + i * 8);
    }
    // Compare large numbers
    const cmpPairs: Array<[number, number]> = [
      [45210, 45120], [130456, 103456], [89999, 90001], [560340, 560430],
      [712005, 712050], [99999, 100000], [284700, 284700], [430256, 43999],
    ];
    for (let i = 0; i < cmpPairs.length; i++) {
      const [left, right] = cmpPairs[i];
      const symbol: '<' | '>' | '=' = left < right ? '<' : left > right ? '>' : '=';
      push('math.placevalue.to_1_000_000', 'NumberCompare', {
        type: 'NumberCompare', left, right,
        promptText: `Compare ${comma(left)} and ${comma(right)}.`,
      }, { symbol }, 1560 + i * 8);
    }
  }

  // ── math.multiply.by_10s_100s (4.NBT.A.1) ────────────────────────
  {
    const r = rng(91);
    // single digit × 10 / × 100
    for (let a = 2; a <= 9; a++) {
      for (const p of [10, 100]) {
        const correct = a * p;
        push('math.multiply.by_10s_100s', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a} × ${p} = ?`,
          choices: numChoices(correct, [correct * 10, correct / 10, correct + p, a + p], r),
          promptText: `${a} times ${p}.`,
        }, { correct }, (p === 10 ? 1560 : 1590) + a * 3);
      }
    }
    // tens × tens and tens × hundreds
    const pairs: Array<[number, number]> = [
      [40, 10], [30, 10], [70, 10], [20, 30], [40, 20], [60, 30], [50, 40],
      [30, 200], [20, 400], [50, 300], [40, 500], [60, 200],
    ];
    for (let i = 0; i < pairs.length; i++) {
      const [a, b] = pairs[i];
      const correct = a * b;
      push('math.multiply.by_10s_100s', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} × ${b} = ?`,
        choices: numChoices(correct, [correct * 10, correct / 10, correct / 100, correct + b], r),
        promptText: `${a} times ${b} — count the zeros.`,
      }, { correct }, 1620 + i * 6);
    }
    // pattern questions
    const patterns: Array<[number, number, number]> = [
      [6, 10, 100], [7, 10, 100], [4, 100, 1000], [8, 10, 1000], [9, 100, 1000],
    ];
    for (let i = 0; i < patterns.length; i++) {
      const [a, small, big] = patterns[i];
      const correct = a * big;
      push('math.multiply.by_10s_100s', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} × ${small} = ${a * small}.  ${a} × ${comma(big)} = ?`,
        choices: numChoices(correct, [correct / 10, correct * 10, a * small, correct + big], r),
        promptText: `Use the pattern: what is ${a} × ${comma(big)}?`,
      }, { correct }, 1650 + i * 8);
    }
  }

  // ── math.multiply.2digit_by_1digit (4.NBT.B.5) ───────────────────
  {
    const r = rng(92);
    const as = [13, 17, 21, 24, 26, 32, 34, 38, 43, 47, 52, 56, 63, 68, 74, 79, 83, 87, 92, 96];
    const bs = [3, 4, 6, 7, 8, 9, 5, 6, 7, 3, 4, 8, 9, 6, 3, 7, 4, 6, 8, 9];
    for (let i = 0; i < as.length; i++) {
      const a = as[i], b = bs[i];
      const correct = a * b;
      const tens = Math.floor(a / 10), ones = a % 10;
      const noCarry = tens * b * 10 + ((ones * b) % 10);   // dropped the carry
      push('math.multiply.2digit_by_1digit', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} × ${b} = ?`,
        choices: numChoices(correct, [noCarry, correct + 10, correct - 10, a + b, correct + b], r),
        promptText: `${a} times ${b}.`,
      }, { correct }, 1600 + Math.floor(correct / 60) * 12);
    }
    // garden word problems
    const wpAs = [24, 36, 45, 28, 52, 64, 75, 83];
    const wpBs = [6, 4, 3, 7, 5, 8, 4, 6];
    const wpTemplates = [
      (a: number, b: number) => `Each row has ${a} carrots. There are ${b} rows. How many carrots in all?`,
      (a: number, b: number) => `A seed packet holds ${a} seeds. Nana bought ${b} packets. How many seeds?`,
      (a: number, b: number) => `Each apple tree gives ${a} apples. The orchard has ${b} trees. Total apples?`,
      (a: number, b: number) => `${b} flower beds with ${a} tulips in each. How many tulips altogether?`,
    ];
    for (let i = 0; i < wpAs.length; i++) {
      const a = wpAs[i], b = wpBs[i];
      const correct = a * b;
      push('math.multiply.2digit_by_1digit', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} × ${b} = ?`,
        choices: numChoices(correct, [correct + a, correct - a, a + b, correct + 10], r),
        promptText: wpTemplates[i % wpTemplates.length](a, b),
      }, { correct }, 1650 + i * 10);
    }
  }

  // ── math.factors.find (4.OA.B.4) ─────────────────────────────────
  {
    const r = rng(93);
    // "Which of these is a factor of N?"
    const comps = [12, 18, 24, 36, 48, 60, 30, 42, 56, 72];
    for (let i = 0; i < comps.length; i++) {
      const n = comps[i];
      const factors: number[] = [];
      for (let f = 2; f < n; f++) if (n % f === 0) factors.push(f);
      const correct = factors[Math.floor(r() * factors.length)];
      const nonFactors: number[] = [];
      for (let c = 2; c < n; c++) if (n % c !== 0) nonFactors.push(c);
      const near = nonFactors
        .sort((x, y) => Math.abs(x - correct) - Math.abs(y - correct))
        .slice(0, 3);
      push('math.factors.find', 'EquationTap', {
        type: 'EquationTap',
        equation: `factors of ${n}`,
        choices: shuffle([correct, ...near], r),
        promptText: `Which of these is a factor of ${n}?`,
      }, { correct }, 1620 + i * 8);
    }
    // "Which is a multiple of k?"
    const ks = [3, 4, 6, 7, 8, 9, 6, 12];
    for (let i = 0; i < ks.length; i++) {
      const k = ks[i];
      const m = 3 + ((i * 2) % 6);
      const correct = k * m;
      const cands = [correct + 1, correct - 1, correct + k - 1, correct + 2]
        .filter(c => c % k !== 0);
      push('math.factors.find', 'EquationTap', {
        type: 'EquationTap',
        equation: `multiples of ${k}`,
        choices: numChoices(correct, cands, r),
        promptText: `Which of these is a multiple of ${k}?`,
      }, { correct }, 1680 + i * 8);
    }
    // "Which number is prime?"
    const isPrime = (n: number) => {
      if (n < 2) return false;
      for (let f = 2; f * f <= n; f++) if (n % f === 0) return false;
      return true;
    };
    const primeSets: Array<[number, number[]]> = [
      [7, [4, 6, 9]], [13, [9, 15, 21]], [11, [8, 12, 15]], [17, [14, 15, 21]],
      [23, [21, 25, 27]], [19, [18, 20, 21]], [29, [26, 27, 33]], [31, [30, 33, 35]],
    ];
    for (let i = 0; i < primeSets.length; i++) {
      const [p, others] = primeSets[i];
      // guard: the "correct" must actually be prime, the rest composite
      if (!isPrime(p) || others.some(isPrime)) continue;
      push('math.factors.find', 'EquationTap', {
        type: 'EquationTap',
        equation: 'prime?',
        choices: shuffle<number | string>([p, ...others], r),
        promptText: 'Which number is prime?',
      }, { correct: p }, 1700 + i * 10);
    }
  }

  // ── math.fractions.equivalent (4.NF.A.1) ─────────────────────────
  {
    const r = rng(94);
    // Visual '=' pairs (denominators ≤ 8), plus non-equivalent near
    // pairs so '=' isn't always the answer.
    const vPairs: Array<[[number, number], [number, number]]> = [
      [[1, 2], [2, 4]], [[1, 3], [2, 6]], [[2, 3], [4, 6]], [[1, 2], [3, 6]],
      [[1, 4], [2, 8]], [[3, 4], [6, 8]], [[1, 2], [4, 8]], [[2, 4], [4, 8]],
      // near-miss non-equivalents
      [[1, 2], [3, 8]], [[2, 3], [3, 6]], [[1, 3], [3, 8]], [[3, 4], [5, 8]],
    ];
    for (let i = 0; i < vPairs.length; i++) {
      const [[ln, ld], [rn, rd]] = vPairs[i];
      const symbol: '<' | '>' | '=' = ln * rd === rn * ld ? '=' : ln * rd > rn * ld ? '>' : '<';
      push('math.fractions.equivalent', 'FractionCompareVisual', {
        type: 'FractionCompareVisual',
        left: { numerator: ln, denominator: ld },
        right: { numerator: rn, denominator: rd },
        shape: i % 2 === 0 ? 'pie' : 'bar',
        promptText: 'Are these equal, or is one bigger?',
      }, { symbol }, 1620 + i * 6);
    }
    // EquationTap: "Which fraction is equivalent to n/d?"
    const targets: Array<[number, number, number]> = [   // [n, d, multiplier]
      [1, 2, 2], [1, 2, 3], [1, 2, 4], [1, 3, 2], [1, 3, 3], [2, 3, 2],
      [1, 4, 2], [3, 4, 2], [2, 5, 2], [1, 5, 3], [3, 5, 2], [2, 3, 4],
      [3, 4, 3], [1, 4, 3], [4, 5, 2], [5, 6, 2],
    ];
    for (let i = 0; i < targets.length; i++) {
      const [n, d, k] = targets[i];
      const correct = `${n * k}/${d * k}`;
      // every distractor checked to be numerically ≠ n/d
      const cands = [
        `${n * k}/${d * k + k}`, `${n * k + 1}/${d * k}`, `${n}/${d * k}`,
        `${n * k}/${d}`, `${n + 1}/${d + 1}`,
      ].filter(f => {
        const [fn, fd] = f.split('/').map(Number);
        return !fracEq(fn, fd, n, d);
      });
      push('math.fractions.equivalent', 'EquationTap', {
        type: 'EquationTap',
        equation: `${n}/${d} = ?`,
        choices: strChoices(correct, cands, r),
        promptText: `Which fraction is equivalent to ${n}/${d}?`,
      }, { correct }, 1660 + i * 7);
    }
  }

  // ── math.divide.with_remainders (4.NBT.B.6) ──────────────────────
  {
    const r = rng(95);
    const combos: Array<[number, number, number]> = [];  // divisor, quotient, remainder
    for (const d of [3, 4, 5, 6, 7, 8, 9]) {
      for (const q of [3, 5, 7, 9]) {
        const rem = 1 + ((d + q) % (d - 1));   // always 1..d-1
        combos.push([d, q, rem]);
      }
    }
    for (let i = 0; i < combos.length; i++) {
      const [d, q, rem] = combos[i];
      const dividend = d * q + rem;
      const correct = `${q} R${rem}`;
      const cands = [
        `${q} R${rem === 1 ? 2 : rem - 1}`,
        `${q + 1} R${rem}`,
        `${q - 1} R${rem}`,
        `${q}`,
      ];
      push('math.divide.with_remainders', 'EquationTap', {
        type: 'EquationTap',
        equation: `${dividend} ÷ ${d} = ?`,
        choices: strChoices(correct, cands, r),
        promptText: `${dividend} divided by ${d} — quotient and remainder.`,
      }, { correct }, 1650 + d * 8 + q * 4);
    }
    // word problems — leftover / full-groups flavors
    const wps: Array<[number, number]> = [[17, 5], [23, 4], [31, 6], [38, 5], [44, 7], [50, 8], [29, 3], [61, 9]];
    const wpNouns = ['seeds', 'acorns', 'berries', 'bulbs', 'seedlings', 'apples', 'pinecones', 'strawberries'];
    for (let i = 0; i < wps.length; i++) {
      const [total, per] = wps[i];
      const q = Math.floor(total / per), rem = total % per;
      const noun = wpNouns[i];
      if (i % 2 === 0) {
        push('math.divide.with_remainders', 'EquationTap', {
          type: 'EquationTap',
          equation: `${total} ÷ ${per} = ?`,
          choices: numChoices(rem, [rem + 1, rem + 2, q, per - rem, rem + 3], r),
          promptText: `${total} ${noun} go into bags of ${per}. How many ${noun} are left over?`,
        }, { correct: rem }, 1720 + i * 8);
      } else {
        push('math.divide.with_remainders', 'EquationTap', {
          type: 'EquationTap',
          equation: `${total} ÷ ${per} = ?`,
          choices: numChoices(q, [q + 1, q - 1, rem, total - per], r),
          promptText: `${total} ${noun} go into bags of ${per}. How many FULL bags can you make?`,
        }, { correct: q }, 1720 + i * 8);
      }
    }
  }

  // ── math.operations.multi_digit_add_subtract (4.NBT.B.4) ─────────
  {
    const r = rng(96);
    // digit-by-digit sum that ignores carries (classic error)
    const digitwiseAdd = (a: number, b: number): number => {
      let outV = 0, mul = 1;
      while (a > 0 || b > 0) {
        outV += ((a % 10 + b % 10) % 10) * mul;
        a = Math.floor(a / 10); b = Math.floor(b / 10); mul *= 10;
      }
      return outV;
    };
    // digit-by-digit "always subtract smaller from larger" (ignores borrows)
    const digitwiseSubAbs = (a: number, b: number): number => {
      let outV = 0, mul = 1;
      while (a > 0 || b > 0) {
        outV += Math.abs(a % 10 - b % 10) * mul;
        a = Math.floor(a / 10); b = Math.floor(b / 10); mul *= 10;
      }
      return outV;
    };
    // 4-digit addition with regrouping
    const addPairs: Array<[number, number]> = [];
    for (let i = 0; i < 200 && addPairs.length < 18; i++) {
      const a = 1200 + Math.floor(r() * 7000);
      const b = 1100 + Math.floor(r() * Math.max(200, 9800 - a));
      if (a + b > 9999) continue;
      if ((a % 10) + (b % 10) < 10 && (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) < 10) continue;
      addPairs.push([a, b]);
    }
    for (let i = 0; i < addPairs.length; i++) {
      const [a, b] = addPairs[i];
      const correct = a + b;
      push('math.operations.multi_digit_add_subtract', 'EquationTap', {
        type: 'EquationTap',
        equation: `${comma(a)} + ${comma(b)} = ?`,
        choices: numChoices(correct, [digitwiseAdd(a, b), correct + 100, correct - 10, correct + 1000], r),
        promptText: `${comma(a)} plus ${comma(b)} — watch the carries.`,
      }, { correct }, 1650 + Math.floor(correct / 2000) * 15);
    }
    // 4-digit subtraction with borrowing
    const subPairs: Array<[number, number]> = [];
    for (let i = 0; i < 200 && subPairs.length < 17; i++) {
      const a = 3000 + Math.floor(r() * 6500);
      const b = 1100 + Math.floor(r() * (a - 1600));
      if ((a % 10) >= (b % 10) && (Math.floor(a / 10) % 10) >= (Math.floor(b / 10) % 10)) continue;
      subPairs.push([a, b]);
    }
    for (let i = 0; i < subPairs.length; i++) {
      const [a, b] = subPairs[i];
      const correct = a - b;
      push('math.operations.multi_digit_add_subtract', 'EquationTap', {
        type: 'EquationTap',
        equation: `${comma(a)} − ${comma(b)} = ?`,
        choices: numChoices(correct, [digitwiseSubAbs(a, b), correct + 10, correct - 100, correct + 100], r),
        promptText: `${comma(a)} minus ${comma(b)} — borrow when you need to.`,
      }, { correct }, 1700 + Math.floor(correct / 2000) * 15);
    }
    // word problems
    const wpData: Array<[number, number, boolean]> = [
      [4257, 2868, true], [5003, 1247, false], [3641, 2789, true], [8120, 4356, false], [2975, 3468, true],
    ];
    const wpAdd = [
      (a: number, b: number) => `The orchard harvested ${comma(a)} apples in September and ${comma(b)} in October. How many in all?`,
      (a: number, b: number) => `The meadow had ${comma(a)} wildflowers last year and grew ${comma(b)} more this year. Total wildflowers?`,
      (a: number, b: number) => `The nursery sold ${comma(a)} seed packets in spring and ${comma(b)} in summer. How many packets total?`,
    ];
    const wpSub = [
      (a: number, b: number) => `The hive held ${comma(a)} bees. ${comma(b)} flew off with a new queen. How many bees stayed?`,
      (a: number, b: number) => `The farm grew ${comma(a)} pumpkin seeds, but only ${comma(b)} sprouted. How many did not sprout?`,
    ];
    for (let i = 0; i < wpData.length; i++) {
      const [a, b, isAdd] = wpData[i];
      const correct = isAdd ? a + b : a - b;
      const wrong = isAdd ? digitwiseAdd(a, b) : digitwiseSubAbs(a, b);
      push('math.operations.multi_digit_add_subtract', 'EquationTap', {
        type: 'EquationTap',
        equation: `${comma(a)} ${isAdd ? '+' : '−'} ${comma(b)} = ?`,
        choices: numChoices(correct, [wrong, correct + 100, correct - 10, correct + 1000], r),
        promptText: isAdd ? wpAdd[i % wpAdd.length](a, b) : wpSub[i % wpSub.length](a, b),
      }, { correct }, 1780 + i * 10);
    }
  }

  // ── math.placevalue.round_large (4.NBT.A.3) ──────────────────────
  {
    const r = rng(97);
    const nums = [34721, 68459, 12385, 90276, 45612, 78938, 23164, 56807, 81543, 17296];
    const places: Array<[number, string]> = [[1000, 'thousand'], [100, 'hundred'], [10000, 'ten-thousand']];
    for (let i = 0; i < nums.length; i++) {
      for (let j = 0; j < places.length; j++) {
        const n = nums[i];
        const [p, pname] = places[j];
        const correct = Math.round(n / p) * p;
        const cands = [
          correct + p, correct - p,
          Math.floor(n / p) * p, Math.ceil(n / p) * p,   // truncation errors
          Math.round(n / (p / 10)) * (p / 10),           // rounded to the smaller place
          correct + 2 * p,
        ];
        push('math.placevalue.round_large', 'EquationTap', {
          type: 'EquationTap',
          equation: `${comma(n)} → nearest ${pname}`,
          choices: numChoices(correct, cands, r),
          promptText: `Round ${comma(n)} to the nearest ${pname}.`,
        }, { correct }, 1660 + j * 40 + i * 5);
      }
    }
  }

  // ── math.fractions.add_subtract_like (4.NF.B.3) ──────────────────
  {
    const r = rng(98);
    const dens = [4, 5, 6, 8, 10, 12];
    let idx = 0;
    for (const den of dens) {
      // addition: a/den + b/den, sum stays proper; answer left unsimplified
      const seenAdd = new Set<string>();
      for (const [a, b] of [[1, 2], [2, 3], [3, den - 4], [2, den - 3]]) {
        if (a < 1 || b < 1 || a + b >= den) continue;
        const key = `${a}+${b}`;
        if (seenAdd.has(key)) continue;
        seenAdd.add(key);
        const sum = a + b;
        const correct = `${sum}/${den}`;
        const cands = [`${sum}/${den * 2}`, `${sum + 1}/${den}`, `${sum - 1}/${den}`, `${a * b}/${den}`]
          .filter(f => {
            const [fn, fd] = f.split('/').map(Number);
            return fn >= 1 && !fracEq(fn, fd, sum, den);
          });
        push('math.fractions.add_subtract_like', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a}/${den} + ${b}/${den} = ?`,
          choices: strChoices(correct, cands, r),
          promptText: `Add the fractions: ${a}/${den} + ${b}/${den}.`,
        }, { correct }, 1680 + den * 8 + idx++);
      }
      // subtraction: a/den − b/den, a > b
      const seenSub = new Set<string>();
      for (const [a, b] of [[den - 1, 2], [den - 2, 3], [den - 1, den - 3]]) {
        if (b < 1 || a <= b || a >= den) continue;
        const key = `${a}-${b}`;
        if (seenSub.has(key)) continue;
        seenSub.add(key);
        const diff = a - b;
        const correct = `${diff}/${den}`;
        const cands = [`${a + b}/${den}`, `${diff + 1}/${den}`, `${diff - 1}/${den}`, `${diff}/${den * 2}`]
          .filter(f => {
            const [fn, fd] = f.split('/').map(Number);
            return fn >= 1 && !fracEq(fn, fd, diff, den);
          });
        push('math.fractions.add_subtract_like', 'EquationTap', {
          type: 'EquationTap',
          equation: `${a}/${den} − ${b}/${den} = ?`,
          choices: strChoices(correct, cands, r),
          promptText: `Subtract the fractions: ${a}/${den} − ${b}/${den}.`,
        }, { correct }, 1700 + den * 8 + idx++);
      }
    }
    // word problems
    const wpData: Array<[number, number, number, boolean]> = [   // [a, b, den, isAdd]
      [3, 2, 8, true], [2, 1, 6, false], [4, 3, 10, true], [5, 2, 12, false],
      [1, 2, 5, true], [3, 4, 12, true], [2, 3, 10, true], [5, 1, 8, false],
    ];
    const wpAddT = [
      (a: number, b: number, den: number) => `Cecily watered ${a}/${den} of the garden before lunch and ${b}/${den} after. How much of the garden is watered?`,
      (a: number, b: number, den: number) => `Nana's pie has ${den} slices. Esme ate ${a}/${den} and Luna ate ${b}/${den}. What fraction was eaten?`,
    ];
    const wpSubT = [
      (a: number, b: number, den: number) => `A pitcher was ${a}/${den} full. Cecily poured out ${b}/${den}. How full is it now?`,
      (a: number, b: number, den: number) => `${a}/${den} of the bed had sprouts; ${b}/${den} got eaten by slugs. What fraction of sprouts is left?`,
    ];
    for (let i = 0; i < wpData.length; i++) {
      const [a, b, den, isAdd] = wpData[i];
      const res = isAdd ? a + b : a - b;
      const correct = `${res}/${den}`;
      const cands = [`${res}/${den * 2}`, `${res + 1}/${den}`, `${isAdd ? Math.abs(a - b) : a + b}/${den}`]
        .filter(f => {
          const [fn, fd] = f.split('/').map(Number);
          return fn >= 1 && !fracEq(fn, fd, res, den);
        });
      push('math.fractions.add_subtract_like', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a}/${den} ${isAdd ? '+' : '−'} ${b}/${den} = ?`,
        choices: strChoices(correct, cands, r),
        promptText: (isAdd ? wpAddT[i % 2] : wpSubT[i % 2])(a, b, den),
      }, { correct }, 1780 + i * 8);
    }
  }

  // ── math.time.elapsed_across_hours (4.MD.A.2) ────────────────────
  {
    const r = rng(99);
    const fmtT = (h: number, m: number) => `${h}:${m.toString().padStart(2, '0')}`;
    const fmtSpan = (mins: number): string => {
      const h = Math.floor(mins / 60), m = mins % 60;
      if (h === 0) return `${m} minutes`;
      const hs = h === 1 ? '1 hour' : `${h} hours`;
      return m === 0 ? hs : `${hs} ${m} minutes`;
    };
    const spans: Array<[number, number, number]> = [  // startHour, startMinute, minutes elapsed
      [9, 45, 215], [8, 30, 150], [10, 15, 185], [7, 50, 145], [11, 20, 160],
      [1, 35, 205], [2, 10, 170], [3, 55, 130], [4, 40, 195], [6, 25, 155],
      [9, 5, 250], [10, 50, 140], [5, 15, 230], [8, 5, 175], [12, 35, 120],
      [1, 10, 275], [2, 45, 190], [6, 55, 125], [7, 20, 220], [3, 30, 240],
      [4, 5, 135], [5, 40, 245], [11, 45, 210], [12, 20, 165],
      [8, 55, 200], [10, 30, 255], [6, 15, 180], [9, 25, 235],
    ];
    for (let i = 0; i < spans.length; i++) {
      const [sH, sM, mins] = spans[i];
      const startAbs = (sH % 12) * 60 + sM;
      const endAbs = (startAbs + mins) % 720;
      const eH = Math.floor(endAbs / 60) === 0 ? 12 : Math.floor(endAbs / 60);
      const eM = endAbs % 60;
      const correct = fmtSpan(mins);
      const cands = [fmtSpan(mins + 60), fmtSpan(mins - 60), fmtSpan(mins + 5), fmtSpan(mins - 5)];
      push('math.time.elapsed_across_hours', 'ClockInterval', {
        type: 'ClockInterval',
        startHour: sH, startMinute: sM,
        endHour: eH, endMinute: eM,
        choices: strChoices(correct, cands, r),
        promptText: `The garden walk started at ${fmtT(sH, sM)} and ended at ${fmtT(eH, eM)}. How long was it?`,
      }, { interval: correct }, 1690 + Math.floor(mins / 30) * 18 + (sM === 0 ? 0 : 8));
    }
  }

  // ── math.decimals.tenths_hundredths (4.NF.C.6) ───────────────────
  {
    const r = rng(100);
    // tenths → decimal
    for (let n = 1; n <= 9; n++) {
      const correct = fmtDec(n, 1);           // "0.7"
      const cands = [fmtDec(n, 2), `${n}.0`, fmtDec(n * 10 + 1, 2), fmtDec(n + 1, 1)];
      push('math.decimals.tenths_hundredths', 'EquationTap', {
        type: 'EquationTap',
        equation: `${n}/10 = ?`,
        choices: strChoices(correct, cands, r),
        promptText: `Write ${n}/10 as a decimal.`,
      }, { correct }, 1720 + n * 4);
    }
    // hundredths → decimal
    const hns = [35, 42, 7, 60, 18, 93, 5, 76, 21, 59];
    for (let i = 0; i < hns.length; i++) {
      const n = hns[i];
      const rev = Number(String(n).split('').reverse().join(''));
      const correct = fmtDec(n, 2);
      const cands = [fmtDec(n, 1), fmtDec(n, 3), fmtDec(rev, 2), fmtDec(n + 1, 2)];
      push('math.decimals.tenths_hundredths', 'EquationTap', {
        type: 'EquationTap',
        equation: `${n}/100 = ?`,
        choices: strChoices(correct, cands, r),
        promptText: `Write ${n}/100 as a decimal.`,
      }, { correct }, 1760 + i * 6);
    }
    // decimal → fraction
    const dfs = [35, 7, 62, 9, 88, 15, 41, 73];
    for (let i = 0; i < dfs.length; i++) {
      const n = dfs[i];
      const rev = Number(String(n).split('').reverse().join(''));
      const correct = `${n}/100`;
      const cands = [`${n}/10`, `${n + 1}/100`, `${rev}/100`, `${n}/1000`]
        .filter(f => {
          const [fn, fd] = f.split('/').map(Number);
          return !fracEq(fn, fd, n, 100);
        });
      push('math.decimals.tenths_hundredths', 'EquationTap', {
        type: 'EquationTap',
        equation: `${fmtDec(n, 2)} = ?`,
        choices: strChoices(correct, cands, r),
        promptText: `Which fraction equals ${fmtDec(n, 2)}?`,
      }, { correct }, 1800 + i * 6);
    }
    // money contexts
    const cents = [45, 30, 72, 5, 99, 60, 25, 81];
    for (let i = 0; i < cents.length; i++) {
      const c = cents[i];
      const correct = `$${fmtDec(c, 2)}`;
      const cands = [`$${fmtDec(c, 1)}`, `$${fmtDec(c * 10, 2)}`, `$${fmtDec(c + 10, 2)}`, `$${fmtDec(c, 3)}`];
      push('math.decimals.tenths_hundredths', 'EquationTap', {
        type: 'EquationTap',
        equation: `${c}¢ = ?`,
        choices: strChoices(correct, cands, r),
        promptText: `${c} cents is how many dollars?`,
      }, { correct }, 1830 + i * 5);
    }
  }

  // ── math.multiply.2digit_by_2digit (4.NBT.B.5) ───────────────────
  {
    const r = rng(101);
    const pairs: Array<[number, number]> = [
      [12, 13], [14, 21], [23, 14], [15, 16], [22, 24], [31, 15], [25, 18], [35, 21],
      [42, 13], [27, 24], [33, 26], [45, 22], [38, 17], [52, 19], [44, 25], [36, 28],
      [53, 24], [47, 32], [62, 21], [55, 34],
    ];
    for (let i = 0; i < pairs.length; i++) {
      const [a, b] = pairs[i];
      const correct = a * b;
      const forgotTens = a * (b % 10) + a * Math.floor(b / 10);  // forgot the ×10 shift
      push('math.multiply.2digit_by_2digit', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} × ${b} = ?`,
        choices: numChoices(correct, [forgotTens, correct + 10, correct - 100, correct + 100], r),
        promptText: `${a} times ${b}.`,
      }, { correct }, 1740 + Math.floor(correct / 250) * 15);
    }
    // garden word problems
    const wpPairs: Array<[number, number]> = [[24, 12], [18, 15], [32, 21], [26, 14], [45, 16], [36, 25]];
    const wpTemplates = [
      (a: number, b: number) => `The pumpkin patch has ${a} rows with ${b} pumpkins in each row. How many pumpkins?`,
      (a: number, b: number) => `Each of the ${a} beehives holds ${b} honeycomb cells per frame. How many cells in one frame from every hive?`,
      (a: number, b: number) => `The nursery has ${a} shelves with ${b} pots on each. How many pots in all?`,
    ];
    for (let i = 0; i < wpPairs.length; i++) {
      const [a, b] = wpPairs[i];
      const correct = a * b;
      const forgotTens = a * (b % 10) + a * Math.floor(b / 10);
      push('math.multiply.2digit_by_2digit', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} × ${b} = ?`,
        choices: numChoices(correct, [forgotTens, correct + 100, correct - 10, a + b], r),
        promptText: wpTemplates[i % wpTemplates.length](a, b),
      }, { correct }, 1820 + i * 15);
    }
  }

  // ── math.decimals.compare (4.NF.C.7) ─────────────────────────────
  {
    const r = rng(102);
    // pairs given in hundredths so symbol math stays exact
    const cmpPairs: Array<[number, number]> = [
      [70, 65], [40, 39], [9, 10], [55, 60], [80, 8], [32, 3], [21, 12], [90, 89],
      [45, 54], [7, 70], [66, 6], [15, 51], [83, 38], [50, 50], [25, 25], [98, 89],
      [30, 3], [72, 27], [11, 10], [60, 59],
    ];
    for (let i = 0; i < cmpPairs.length; i++) {
      const [lh, rh] = cmpPairs[i];
      const left = lh / 100, right = rh / 100;
      const symbol: '<' | '>' | '=' = lh < rh ? '<' : lh > rh ? '>' : '=';
      push('math.decimals.compare', 'NumberCompare', {
        type: 'NumberCompare', left, right,
        promptText: `Compare ${left} and ${right}.`,
      }, { symbol }, 1760 + i * 5);
    }
    // whole-plus-decimal pairs (hundredths again)
    const bigPairs: Array<[number, number]> = [
      [350, 345], [105, 150], [275, 257], [440, 404], [199, 210], [380, 38],
    ];
    for (let i = 0; i < bigPairs.length; i++) {
      const [lh, rh] = bigPairs[i];
      const left = lh / 100, right = rh / 100;
      const symbol: '<' | '>' | '=' = lh < rh ? '<' : lh > rh ? '>' : '=';
      push('math.decimals.compare', 'NumberCompare', {
        type: 'NumberCompare', left, right,
        promptText: `Compare ${left} and ${right}.`,
      }, { symbol }, 1840 + i * 8);
    }
    // "Which is the largest?" (values in hundredths)
    const bigSets: number[][] = [
      [45, 54, 5, 50], [70, 7, 67, 76], [12, 21, 2, 20],
      [89, 98, 9, 90], [33, 3, 30, 13], [61, 16, 6, 60],
    ];
    for (let i = 0; i < bigSets.length; i++) {
      const set = bigSets[i];
      const max = Math.max(...set);
      push('math.decimals.compare', 'EquationTap', {
        type: 'EquationTap',
        equation: set.map(h => `${h / 100}`).join('   '),
        choices: shuffle(set.map(h => `${h / 100}`), r),
        promptText: 'Which number is the largest?',
      }, { correct: `${max / 100}` }, 1860 + i * 6);
    }
  }

  // ── math.measurement.area_perimeter (4.MD.A.3) ───────────────────
  {
    const r = rng(103);
    const beds: Array<[number, number]> = [
      [8, 5], [9, 4], [7, 6], [12, 5], [10, 8], [15, 4],
      [11, 7], [9, 9], [14, 6], [13, 8], [20, 5], [16, 7],
    ];
    const units = ['feet', 'meters'];
    for (let i = 0; i < beds.length; i++) {
      const [l, w] = beds[i];
      const unit = units[i % 2];
      const area = l * w, per = 2 * (l + w);
      push('math.measurement.area_perimeter', 'EquationTap', {
        type: 'EquationTap',
        equation: `${l} × ${w} = ?`,
        choices: strChoices(`${area} square ${unit}`,
          [`${per} ${unit}`, `${l + w} square ${unit}`, `${area} ${unit}`], r),
        promptText: `A garden bed is ${l} ${unit} long and ${w} ${unit} wide. What is its area?`,
      }, { correct: `${area} square ${unit}` }, 1780 + i * 6);
      push('math.measurement.area_perimeter', 'EquationTap', {
        type: 'EquationTap',
        equation: `2 × (${l} + ${w}) = ?`,
        choices: strChoices(`${per} ${unit}`,
          [`${area} square ${unit}`, `${l + w} ${unit}`, `${per} square ${unit}`], r),
        promptText: `A fence goes all the way around a ${l} ${unit} by ${w} ${unit} garden bed. How long is the fence?`,
      }, { correct: `${per} ${unit}` }, 1810 + i * 6);
    }
    // missing-side problems (area ÷ known side)
    const missing: Array<[number, number]> = [[36, 4], [48, 6], [60, 5], [42, 7], [72, 8], [54, 9]];
    for (let i = 0; i < missing.length; i++) {
      const [area, l] = missing[i];
      const w = area / l;
      push('math.measurement.area_perimeter', 'EquationTap', {
        type: 'EquationTap',
        equation: `${area} ÷ ${l} = ?`,
        choices: numChoices(w, [w + 1, w - 1, area - l, l], r),
        promptText: `A bed has an area of ${area} square feet and is ${l} feet long. How wide is it?`,
      }, { correct: w }, 1880 + i * 6);
    }
  }

  // ── math.word_problem.multiplicative (4.OA.A.2) ──────────────────
  {
    const r = rng(104);
    // "k times as many" — find the product
    const mult: Array<[number, number]> = [
      [3, 4], [5, 6], [4, 7], [6, 5], [3, 9], [8, 4],
      [7, 6], [4, 12], [5, 9], [6, 8], [3, 15], [9, 7],
    ];
    const tallT = [
      (k: number, s: number) => `The oak is ${k} times as tall as the sapling. The sapling is ${s} feet tall. How tall is the oak?`,
      (k: number, s: number) => `Nana picked ${k} times as many berries as Cecily. Cecily picked ${s}. How many did Nana pick?`,
      (k: number, s: number) => `The sunflower is ${k} times as tall as the daisy. The daisy is ${s} inches tall. How tall is the sunflower?`,
      (k: number, s: number) => `A pumpkin weighs ${k} times as much as a squash. The squash weighs ${s} pounds. How much does the pumpkin weigh?`,
    ];
    for (let i = 0; i < mult.length; i++) {
      const [k, s] = mult[i];
      const correct = k * s;
      push('math.word_problem.multiplicative', 'EquationTap', {
        type: 'EquationTap',
        equation: `${k} × ${s} = ?`,
        choices: numChoices(correct, [k + s, correct + s, correct - k, s], r),
        promptText: tallT[i % tallT.length](k, s),
      }, { correct }, 1800 + i * 8);
    }
    // inverse — find the smaller quantity
    const divs: Array<[number, number]> = [
      [4, 24], [3, 27], [6, 42], [5, 45], [7, 56], [8, 64], [4, 36], [9, 63], [6, 54], [3, 39],
    ];
    const divT = [
      (k: number, t: number) => `The old maple is ${t} feet tall — ${k} times as tall as the young one. How tall is the young tree?`,
      (k: number, t: number) => `Esme collected ${t} acorns, which is ${k} times what Luna found. How many did Luna find?`,
      (k: number, t: number) => `The big pond has ${t} tadpoles — ${k} times as many as the little pond. How many in the little pond?`,
    ];
    for (let i = 0; i < divs.length; i++) {
      const [k, t] = divs[i];
      const correct = t / k;
      push('math.word_problem.multiplicative', 'EquationTap', {
        type: 'EquationTap',
        equation: `${t} ÷ ${k} = ?`,
        choices: numChoices(correct, [t - k, correct + 1, correct - 1, k], r),
        promptText: divT[i % divT.length](k, t),
      }, { correct }, 1870 + i * 8);
    }
    // "how many times as many?"
    const ratio: Array<[number, number]> = [[24, 6], [35, 7], [48, 8], [27, 9]];
    for (let i = 0; i < ratio.length; i++) {
      const [t, s] = ratio[i];
      const correct = t / s;
      push('math.word_problem.multiplicative', 'EquationTap', {
        type: 'EquationTap',
        equation: `${t} ÷ ${s} = ?`,
        choices: numChoices(correct, [correct + 1, correct - 1, t - s, s], r),
        promptText: `The garden has ${t} tomatoes and ${s} peppers. How many times as many tomatoes as peppers?`,
      }, { correct }, 1900 + i * 10);
    }
  }

  // ════════════════════════════════════════════════════════════════
  // ═══ LEVEL 5 (CCSS grade 5) — Elo band ≈ 1800–2200 ═══
  // ════════════════════════════════════════════════════════════════

  // ── math.decimals.multiply_divide_10s (5.NBT.A.2) ────────────────
  {
    const r = rng(105);
    // [scaledValue, decimalPlaces, powerOfTen, isMultiply]
    const probs: Array<[number, number, number, boolean]> = [
      [37, 1, 1, true], [42, 1, 1, false], [45, 2, 2, true], [58, 1, 2, true],
      [625, 2, 1, true], [7, 1, 1, false], [83, 1, 1, true], [206, 2, 2, true],
      [35, 1, 2, false], [64, 1, 1, false], [512, 2, 1, false], [9, 2, 3, true],
      [271, 2, 2, false], [66, 1, 3, true], [48, 2, 1, true], [123, 2, 1, false],
      [55, 1, 2, false], [808, 2, 2, true], [92, 1, 2, true], [304, 2, 1, false],
      [16, 1, 3, true], [77, 2, 2, false],
    ];
    for (let i = 0; i < probs.length; i++) {
      const [v, dp, p, isMul] = probs[i];
      const factor = Math.pow(10, p);
      const resDp = isMul ? dp - p : dp + p;
      const correct = fmtDec(v, resDp);
      const cands = [
        fmtDec(v, isMul ? dp + p : dp - p),   // shifted the wrong way
        fmtDec(v, resDp + 1),                 // one place short
        fmtDec(v, dp),                        // didn't shift at all
        fmtDec(v, isMul ? resDp - 1 : resDp + 2),  // one place too far
      ];
      push('math.decimals.multiply_divide_10s', 'EquationTap', {
        type: 'EquationTap',
        equation: `${fmtDec(v, dp)} ${isMul ? '×' : '÷'} ${comma(factor)} = ?`,
        choices: strChoices(correct, cands, r),
        promptText: `${fmtDec(v, dp)} ${isMul ? 'times' : 'divided by'} ${comma(factor)} — slide the decimal point.`,
      }, { correct }, 1800 + p * 30 + i * 3);
    }
    // exponent notation
    const sups = ['¹', '²', '³'];
    for (let e = 1; e <= 3; e++) {
      const correct = Math.pow(10, e);
      push('math.decimals.multiply_divide_10s', 'EquationTap', {
        type: 'EquationTap',
        equation: `10${sups[e - 1]} = ?`,
        choices: numChoices(correct, [10 * e, Math.pow(10, e + 1), e === 1 ? 1 : Math.pow(10, e - 1), 20 * e], r),
        promptText: `What is 10 to the power of ${e}?`,
      }, { correct }, 1880 + e * 15);
    }
    const expMul: Array<[number, number]> = [[4, 2], [7, 3]];
    for (let i = 0; i < expMul.length; i++) {
      const [c, e] = expMul[i];
      const correct = c * Math.pow(10, e);
      push('math.decimals.multiply_divide_10s', 'EquationTap', {
        type: 'EquationTap',
        equation: `${c} × 10${sups[e - 1]} = ?`,
        choices: numChoices(correct, [correct / 10, correct * 10, c * 10 * e, c + Math.pow(10, e)], r),
        promptText: `${c} times 10${sups[e - 1]}.`,
      }, { correct }, 1930 + i * 10);
    }
  }

  // ── math.fractions.of_a_set (5.NF.B.4.a) ─────────────────────────
  {
    const r = rng(106);
    const sets: Array<[number, number, number]> = [  // [num, den, whole]
      [1, 2, 12], [1, 3, 15], [1, 4, 20], [2, 3, 12], [3, 4, 16], [2, 5, 20],
      [1, 5, 25], [3, 5, 30], [1, 6, 18], [5, 6, 24], [2, 3, 21], [3, 8, 24],
      [1, 4, 36], [2, 5, 35], [3, 4, 28], [5, 8, 32], [4, 5, 45], [2, 7, 21],
      [7, 10, 50], [5, 12, 36],
    ];
    for (let i = 0; i < sets.length; i++) {
      const [num, den, whole] = sets[i];
      const unit = whole / den;
      const correct = unit * num;
      push('math.fractions.of_a_set', 'EquationTap', {
        type: 'EquationTap',
        equation: `${num}/${den} × ${whole} = ?`,
        choices: numChoices(correct, [unit, whole - num, whole - correct, correct + den, num * den], r),
        promptText: `What is ${num}/${den} of ${whole}?`,
      }, { correct }, 1820 + Math.floor(i / 3) * 20);
    }
    // word problems
    const wsets: Array<[number, number, number]> = [
      [2, 5, 20], [1, 3, 24], [3, 4, 32], [1, 2, 26], [2, 3, 27], [5, 6, 36], [3, 8, 40], [1, 4, 44],
    ];
    const wpT = [
      (n: number, d: number, w: number) => `${n}/${d} of the ${w} seedlings sprouted. How many sprouted?`,
      (n: number, d: number, w: number) => `Of the ${w} berries picked, ${n}/${d} were ripe. How many were ripe?`,
      (n: number, d: number, w: number) => `Nana planted ${w} bulbs and ${n}/${d} of them bloomed. How many bloomed?`,
      (n: number, d: number, w: number) => `${n}/${d} of the ${w} bees left the hive at dawn. How many left?`,
    ];
    for (let i = 0; i < wsets.length; i++) {
      const [num, den, whole] = wsets[i];
      const unit = whole / den;
      const correct = unit * num;
      push('math.fractions.of_a_set', 'EquationTap', {
        type: 'EquationTap',
        equation: `${num}/${den} × ${whole} = ?`,
        choices: numChoices(correct, [unit, whole - correct, correct + den, num * den, whole - num, correct - den], r),
        promptText: wpT[i % wpT.length](num, den, whole),
      }, { correct }, 1900 + i * 10);
    }
  }

  // ── math.multiply.multi_digit (5.NBT.B.5) ────────────────────────
  {
    const r = rng(107);
    // 3-digit × 1-digit (lower band)
    const p1: Array<[number, number]> = [
      [123, 4], [214, 3], [156, 6], [307, 5], [248, 7],
      [432, 6], [519, 4], [365, 8], [278, 9], [446, 5],
    ];
    for (let i = 0; i < p1.length; i++) {
      const [a, b] = p1[i];
      const correct = a * b;
      push('math.multiply.multi_digit', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} × ${b} = ?`,
        choices: numChoices(correct, [a * (b - 1), correct + 100, correct - 10, correct + 1000], r),
        promptText: `${a} times ${b}.`,
      }, { correct }, 1850 + i * 6);
    }
    // 3-digit × 2-digit (upper band)
    const p2: Array<[number, number]> = [
      [214, 23], [132, 24], [315, 21], [246, 32], [421, 25], [173, 34],
      [352, 26], [284, 41], [163, 52], [235, 43], [312, 33], [425, 36],
    ];
    for (let i = 0; i < p2.length; i++) {
      const [a, b] = p2[i];
      const correct = a * b;
      const forgotTens = a * (b % 10) + a * Math.floor(b / 10);
      push('math.multiply.multi_digit', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} × ${b} = ?`,
        choices: numChoices(correct, [forgotTens, correct + 100, correct - 100, correct + 1000], r),
        promptText: `${a} times ${b} — line up your partial products.`,
      }, { correct }, 1920 + i * 7);
    }
    // word problems
    const wp: Array<[number, number]> = [[125, 16], [240, 12], [214, 15], [180, 24]];
    const wpT = [
      (a: number, b: number) => `The orchard has ${a} trees and each gives ${b} apples. How many apples in all?`,
      (a: number, b: number) => `A wildflower field has ${a} rows with ${b} plants per row. How many plants?`,
    ];
    for (let i = 0; i < wp.length; i++) {
      const [a, b] = wp[i];
      const correct = a * b;
      const forgotTens = a * (b % 10) + a * Math.floor(b / 10);
      push('math.multiply.multi_digit', 'EquationTap', {
        type: 'EquationTap',
        equation: `${a} × ${b} = ?`,
        choices: numChoices(correct, [forgotTens, correct + 100, correct - 100, a + b], r),
        promptText: wpT[i % wpT.length](a, b),
      }, { correct }, 1950 + i * 10);
    }
  }

  // ── math.decimals.add_subtract (5.NBT.B.7) ───────────────────────
  {
    const r = rng(108);
    // [aHundredths, aDisplayDp, bHundredths, bDisplayDp, isAdd] — all
    // results avoid trailing zeros so the canonical answer is unique.
    const disp = (h: number, dp: number) => (dp === 1 ? fmtDec(h / 10, 1) : fmtDec(h, 2));
    const probs: Array<[number, number, number, number, boolean]> = [
      [345, 2, 280, 1, true], [620, 1, 175, 2, false], [473, 2, 390, 1, true],
      [512, 2, 168, 2, false], [270, 1, 456, 2, true], [903, 2, 350, 1, false],
      [185, 2, 232, 2, true], [740, 1, 265, 2, false], [366, 2, 470, 1, true],
      [825, 2, 490, 1, false], [156, 2, 380, 1, true], [934, 2, 561, 2, false],
      [283, 2, 190, 1, true], [660, 1, 214, 2, false], [508, 2, 329, 2, true],
      [871, 2, 430, 1, false],
    ];
    for (let i = 0; i < probs.length; i++) {
      const [aH, aDp, bH, bDp, isAdd] = probs[i];
      const result = isAdd ? aH + bH : aH - bH;
      const correct = fmtDec(result, 2);
      // misalignment error: add/subtract the digits as written,
      // ignoring the decimal points
      const rawA = aDp === 1 ? aH / 10 : aH;
      const rawB = bDp === 1 ? bH / 10 : bH;
      const mis = isAdd ? rawA + rawB : rawA - rawB;
      const cands = [
        ...(mis > 0 ? [fmtDec(mis, 2)] : []),
        fmtDec(result + 10, 2), fmtDec(result - 10, 2), fmtDec(result + 100, 2),
      ];
      push('math.decimals.add_subtract', 'EquationTap', {
        type: 'EquationTap',
        equation: `${disp(aH, aDp)} ${isAdd ? '+' : '−'} ${disp(bH, bDp)} = ?`,
        choices: strChoices(correct, cands, r),
        promptText: `${disp(aH, aDp)} ${isAdd ? 'plus' : 'minus'} ${disp(bH, bDp)} — line up the decimal points.`,
      }, { correct }, 1850 + i * 8);
    }
    // money contexts (cents, always 2 dp)
    const money: Array<[number, number, boolean]> = [
      [425, 389, true], [612, 249, false], [178, 355, true], [500, 137, false],
      [265, 449, true], [950, 615, false], [389, 476, true], [800, 275, false],
      [199, 349, true], [725, 158, false],
    ];
    const moneyT = [
      (a: string, b: string) => `Cecily spent $${a} on seeds and $${b} on twine. How much did she spend?`,
      (a: string, b: string) => `A trowel costs $${a} and gloves cost $${b}. What is the total?`,
      (a: string, b: string) => `Nana had $${a} and spent $${b} at the farm stand. How much is left?`,
      (a: string, b: string) => `A watering can costs $${a}. Esme has $${b}. How much more does she need?`,
    ];
    for (let i = 0; i < money.length; i++) {
      const [aC, bC, isAdd] = money[i];
      const result = isAdd ? aC + bC : aC - bC;
      const correct = `$${fmtDec(result, 2)}`;
      const cands = [`$${fmtDec(result + 10, 2)}`, `$${fmtDec(result - 10, 2)}`, `$${fmtDec(result + 100, 2)}`];
      const tmpl = isAdd ? moneyT[i % 2] : moneyT[2 + (i % 2)];
      const [big, small] = isAdd ? [aC, bC] : [aC, bC];
      push('math.decimals.add_subtract', 'EquationTap', {
        type: 'EquationTap',
        equation: `$${fmtDec(aC, 2)} ${isAdd ? '+' : '−'} $${fmtDec(bC, 2)} = ?`,
        choices: strChoices(correct, cands, r),
        promptText: tmpl(fmtDec(big, 2), fmtDec(small, 2)),
      }, { correct }, 1930 + i * 8);
    }
  }

  // ── math.divide.long_division (5.NBT.B.6) ────────────────────────
  {
    const r = rng(109);
    // 3-digit ÷ 1-digit, exact — [divisor, quotient]
    const exact: Array<[number, number]> = [
      [3, 124], [4, 132], [5, 123], [6, 141], [7, 118],
      [8, 116], [9, 107], [4, 216], [6, 152], [7, 134],
    ];
    for (let i = 0; i < exact.length; i++) {
      const [d, q] = exact[i];
      const dividend = d * q;
      push('math.divide.long_division', 'EquationTap', {
        type: 'EquationTap',
        equation: `${dividend} ÷ ${d} = ?`,
        choices: numChoices(q, [q + 10, q - 10, q + 1, q - 1], r),
        promptText: `${dividend} divided by ${d}.`,
      }, { correct: q }, 1880 + i * 6);
    }
    // 3-digit ÷ 1-digit with remainders — [divisor, quotient, remainder]
    const remCases: Array<[number, number, number]> = [
      [5, 124, 2], [4, 156, 3], [6, 118, 5], [7, 132, 4], [8, 121, 7],
      [3, 215, 1], [9, 111, 8], [6, 145, 3], [7, 129, 5], [4, 233, 1],
    ];
    for (let i = 0; i < remCases.length; i++) {
      const [d, q, rem] = remCases[i];
      const dividend = d * q + rem;
      const correct = `${q} R${rem}`;
      const cands = [`${q}`, `${q + 1} R${rem}`, `${q} R${rem === 1 ? 2 : rem - 1}`, `${q - 1} R${rem}`];
      push('math.divide.long_division', 'EquationTap', {
        type: 'EquationTap',
        equation: `${dividend} ÷ ${d} = ?`,
        choices: strChoices(correct, cands, r),
        promptText: `${dividend} divided by ${d} — quotient and remainder.`,
      }, { correct }, 1950 + i * 8);
    }
    // friendly 2-digit divisors — [divisor, quotient]
    const two: Array<[number, number]> = [
      [12, 8], [12, 12], [15, 6], [11, 9], [25, 4], [16, 6], [14, 7], [12, 11],
    ];
    for (let i = 0; i < two.length; i++) {
      const [d, q] = two[i];
      const dividend = d * q;
      push('math.divide.long_division', 'EquationTap', {
        type: 'EquationTap',
        equation: `${dividend} ÷ ${d} = ?`,
        choices: numChoices(q, [q + 1, q - 1, q + 2, d - q], r),
        promptText: `${dividend} divided by ${d}.`,
      }, { correct: q }, 1990 + i * 8);
    }
  }

  // ── math.fractions.add_subtract_unlike (5.NF.A.1) ────────────────
  {
    const r = rng(110);
    // [an, ad, bn, bd, isAdd] — denominators from {2,3,4,6,8,12}, easy LCDs.
    const probs: Array<[number, number, number, number, boolean]> = [
      [1, 2, 1, 4, true], [1, 2, 1, 6, true], [2, 3, 1, 6, false], [1, 3, 1, 6, true],
      [3, 4, 1, 8, false], [1, 2, 3, 8, true], [5, 6, 1, 3, false], [1, 4, 1, 6, true],
      [2, 3, 1, 4, false], [1, 2, 1, 12, true], [3, 4, 2, 3, false], [1, 6, 1, 4, true],
      [5, 8, 1, 2, false], [1, 3, 1, 4, true], [5, 6, 3, 4, false], [1, 2, 1, 3, true],
      [2, 3, 1, 2, false], [1, 4, 1, 2, true], [7, 8, 3, 4, false], [1, 6, 2, 3, true],
    ];
    const solve = (an: number, ad: number, bn: number, bd: number, isAdd: boolean) => {
      const L = (ad * bd) / gcd(ad, bd);
      const rawN = isAdd ? an * (L / ad) + bn * (L / bd) : an * (L / ad) - bn * (L / bd);
      const g = gcd(rawN, L);
      return { cn: rawN / g, cd: L / g };
    };
    const mkFracCands = (raw: string[], cn: number, cd: number) =>
      raw.filter(f => {
        const [fn, fd] = f.split('/').map(Number);
        return fn >= 1 && fd >= 2 && !fracEq(fn, fd, cn, cd);
      });
    for (let i = 0; i < probs.length; i++) {
      const [an, ad, bn, bd, isAdd] = probs[i];
      const { cn, cd } = solve(an, ad, bn, bd, isAdd);
      const correct = `${cn}/${cd}`;
      const straightN = isAdd ? an + bn : an - bn;
      const cands = mkFracCands([
        `${straightN}/${ad + bd}`,               // added straight across
        `${straightN}/${Math.max(ad, bd)}`,      // forgot to convert one fraction
        `${cn + 1}/${cd}`,                       // off by one
        `${cn}/${cd * 2}`,
      ], cn, cd);
      push('math.fractions.add_subtract_unlike', 'EquationTap', {
        type: 'EquationTap',
        equation: `${an}/${ad} ${isAdd ? '+' : '−'} ${bn}/${bd} = ?`,
        choices: strChoices(correct, cands, r),
        promptText: `${an}/${ad} ${isAdd ? 'plus' : 'minus'} ${bn}/${bd} — find a common denominator first.`,
      }, { correct }, 1900 + i * 8);
    }
    // word problems
    const wps: Array<[number, number, number, number, boolean]> = [
      [1, 2, 1, 4, true], [2, 3, 1, 6, false], [1, 2, 1, 3, true],
      [3, 4, 1, 2, false], [1, 4, 1, 8, true], [5, 6, 1, 2, false],
    ];
    const wpT = [
      (a: string, b: string) => `Cecily filled ${a} of the basket with berries and ${b} with plums. How full is the basket?`,
      (a: string, b: string) => `The rain barrel was ${a} full. Watering used ${b} of a barrel. How much water is left?`,
      (a: string, b: string) => `Esme weeded ${a} of the bed and Luna weeded ${b}. What fraction is weeded?`,
      (a: string, b: string) => `The trail is ${a} of a mile, and Nana has walked ${b} of a mile. How much is left?`,
    ];
    for (let i = 0; i < wps.length; i++) {
      const [an, ad, bn, bd, isAdd] = wps[i];
      const { cn, cd } = solve(an, ad, bn, bd, isAdd);
      const correct = `${cn}/${cd}`;
      const straightN = isAdd ? an + bn : an - bn;
      const cands = mkFracCands([
        `${straightN}/${ad + bd}`, `${straightN}/${Math.max(ad, bd)}`, `${cn + 1}/${cd}`, `${cn}/${cd * 2}`,
      ], cn, cd);
      const tmpl = isAdd ? wpT[i % 2 === 0 ? 0 : 2] : wpT[i % 2 === 0 ? 1 : 3];
      push('math.fractions.add_subtract_unlike', 'EquationTap', {
        type: 'EquationTap',
        equation: `${an}/${ad} ${isAdd ? '+' : '−'} ${bn}/${bd} = ?`,
        choices: strChoices(correct, cands, r),
        promptText: tmpl(`${an}/${ad}`, `${bn}/${bd}`),
      }, { correct }, 2000 + i * 10);
    }
  }

  // ── math.order_of_operations (5.OA.A.1) ──────────────────────────
  {
    const r = rng(111);
    type OpItem = { eq: string; correct: number; cands: number[] };
    const items: OpItem[] = [];
    // a + b × c, with and without parentheses
    const triples: Array<[number, number, number]> = [
      [3, 4, 2], [5, 2, 6], [4, 3, 5], [7, 2, 4], [6, 5, 3], [2, 8, 4], [9, 3, 2], [8, 4, 3],
    ];
    for (const [a, b, c] of triples) {
      // classic distractor = left-to-right evaluation
      items.push({ eq: `${a} + ${b} × ${c}`, correct: a + b * c, cands: [(a + b) * c, a + b + c, a * b + c, a * c + b] });
      items.push({ eq: `(${a} + ${b}) × ${c}`, correct: (a + b) * c, cands: [a + b * c, a + b + c, a * b * c] });
    }
    // a − b ÷ c (b and a−b both divisible by c)
    const dv: Array<[number, number, number]> = [
      [20, 12, 4], [30, 18, 6], [24, 16, 4], [50, 20, 5], [36, 12, 3], [42, 30, 6],
    ];
    for (const [a, b, c] of dv) {
      items.push({ eq: `${a} − ${b} ÷ ${c}`, correct: a - b / c, cands: [(a - b) / c, a - b - c, (a - b) * c] });
      items.push({ eq: `(${a} − ${b}) ÷ ${c}`, correct: (a - b) / c, cands: [a - b / c, a - b - c, a + b / c] });
    }
    // a × b + c × d
    const quads: Array<[number, number, number, number]> = [
      [2, 5, 3, 4], [3, 4, 2, 6], [5, 2, 4, 3], [6, 3, 2, 5],
    ];
    for (const [a, b, c, d] of quads) {
      items.push({
        eq: `${a} × ${b} + ${c} × ${d}`,
        correct: a * b + c * d,
        cands: [(a * b + c) * d, (a + b) * (c + d), a + b + c + d],
      });
    }
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      push('math.order_of_operations', 'EquationTap', {
        type: 'EquationTap',
        equation: `${it.eq} = ?`,
        choices: numChoices(it.correct, it.cands, r),
        promptText: 'Solve — remember the order of operations.',
      }, { correct: it.correct }, 1950 + i * 5);
    }
  }

  // ── math.fractions.multiply (5.NF.B.4) ───────────────────────────
  // Convention: the correct answer is ALWAYS given in lowest terms,
  // and no distractor is numerically equal to it.
  {
    const r = rng(112);
    const probs: Array<[number, number, number, number]> = [
      [1, 2, 1, 3], [1, 2, 2, 3], [2, 3, 3, 4], [1, 3, 3, 5], [3, 4, 1, 2], [2, 5, 1, 2],
      [3, 4, 2, 5], [1, 4, 2, 3], [2, 3, 2, 5], [5, 6, 1, 2], [3, 5, 5, 6], [1, 2, 4, 5],
      [2, 3, 1, 4], [3, 8, 2, 3], [4, 5, 1, 3], [5, 8, 4, 5], [1, 6, 3, 4], [2, 7, 7, 8],
      [5, 6, 3, 4], [1, 3, 6, 7],
    ];
    const productOf = (an: number, ad: number, bn: number, bd: number) => {
      const rawN = an * bn, rawD = ad * bd;
      const g = gcd(rawN, rawD);
      return { cn: rawN / g, cd: rawD / g };
    };
    for (let i = 0; i < probs.length; i++) {
      const [an, ad, bn, bd] = probs[i];
      const { cn, cd } = productOf(an, ad, bn, bd);
      const correct = `${cn}/${cd}`;
      const cands = [
        `${an + bn}/${ad + bd}`,       // added instead of multiplied
        `${an * bn}/${ad + bd}`,       // multiplied tops, added bottoms
        `${an + bn}/${ad * bd}`,       // added tops, multiplied bottoms
        `${an * bd}/${ad * bn}`,       // cross-multiplied
        `${an * bn}/${Math.max(ad, bd)}`,   // multiplied tops, kept one bottom
      ].filter(f => {
        const [fn, fd] = f.split('/').map(Number);
        return fn >= 1 && fd >= 2 && !fracEq(fn, fd, cn, cd);
      });
      push('math.fractions.multiply', 'EquationTap', {
        type: 'EquationTap',
        equation: `${an}/${ad} × ${bn}/${bd} = ?`,
        choices: strChoices(correct, cands, r),
        promptText: `Multiply: ${an}/${ad} × ${bn}/${bd}.`,
      }, { correct }, 2000 + i * 7);
    }
    // word problems — a fraction of a fraction
    const wps: Array<[number, number, number, number]> = [
      [1, 2, 2, 3], [1, 3, 3, 4], [1, 2, 1, 4], [2, 3, 3, 5], [1, 4, 2, 3], [3, 4, 1, 3],
    ];
    const wpT = [
      (a: string, b: string) => `${b} of the bed is herbs, and ${a} of the herbs are mint. What fraction of the bed is mint?`,
      (a: string, b: string) => `${b} of the orchard is apple trees, and ${a} of those are ripe. What fraction of the orchard has ripe apples?`,
      (a: string, b: string) => `${b} of the pond is lily pads, and ${a} of the pads have flowers. What fraction of the pond has flowers?`,
    ];
    for (let i = 0; i < wps.length; i++) {
      const [an, ad, bn, bd] = wps[i];
      const { cn, cd } = productOf(an, ad, bn, bd);
      const correct = `${cn}/${cd}`;
      const cands = [
        `${an + bn}/${ad + bd}`, `${an * bn}/${ad + bd}`, `${an + bn}/${ad * bd}`, `${bn}/${ad * bd}`,
      ].filter(f => {
        const [fn, fd] = f.split('/').map(Number);
        return fn >= 1 && fd >= 2 && !fracEq(fn, fd, cn, cd);
      });
      push('math.fractions.multiply', 'EquationTap', {
        type: 'EquationTap',
        equation: `${an}/${ad} × ${bn}/${bd} = ?`,
        choices: strChoices(correct, cands, r),
        promptText: wpT[i % wpT.length](`${an}/${ad}`, `${bn}/${bd}`),
      }, { correct }, 2080 + i * 10);
    }
  }

  // ── math.volume.rectangular (5.MD.C.5) ───────────────────────────
  {
    const r = rng(113);
    const boxes: Array<[number, number, number]> = [
      [4, 3, 2], [5, 4, 3], [6, 2, 3], [8, 5, 2], [7, 4, 3], [10, 6, 4], [9, 5, 3],
      [12, 4, 2], [6, 6, 5], [11, 3, 4], [8, 8, 2], [15, 4, 3], [5, 5, 5], [9, 6, 4],
      [7, 6, 5], [12, 5, 4], [10, 10, 3], [14, 3, 2], [20, 4, 3], [8, 7, 6],
    ];
    const units = ['feet', 'inches', 'meters'];
    for (let i = 0; i < boxes.length; i++) {
      const [l, w, h] = boxes[i];
      const unit = units[i % 3];
      const vol = l * w * h;
      const correct = `${vol} cubic ${unit}`;
      const cands = [
        `${vol} square ${unit}`,           // right number, wrong unit
        `${l + w + h} cubic ${unit}`,      // added instead of multiplied
        `${l * w} cubic ${unit}`,          // forgot the height
        `${2 * (l * w + l * h + w * h)} cubic ${unit}`,   // surface area
      ];
      push('math.volume.rectangular', 'EquationTap', {
        type: 'EquationTap',
        equation: `${l} × ${w} × ${h} = ?`,
        choices: strChoices(correct, cands, r),
        promptText: i % 2 === 0
          ? `A planter box is ${l} ${unit} long, ${w} ${unit} wide, and ${h} ${unit} tall. What is its volume?`
          : `A raised bed measures ${l} × ${w} × ${h} ${unit}. How much soil fills it?`,
      }, { correct }, 2000 + i * 8);
    }
    // missing-dimension problems
    const md: Array<[number, number, number]> = [   // [l, w, h] — solve for h
      [4, 3, 5], [6, 2, 4], [5, 4, 3], [8, 3, 2], [10, 2, 6], [6, 6, 3],
    ];
    for (let i = 0; i < md.length; i++) {
      const [l, w, h] = md[i];
      const vol = l * w * h;
      push('math.volume.rectangular', 'EquationTap', {
        type: 'EquationTap',
        equation: `${vol} ÷ (${l} × ${w}) = ?`,
        choices: numChoices(h, [h + 1, h - 1, l * w, vol - l - w], r),
        promptText: `A planter holds ${vol} cubic feet of soil. It is ${l} feet long and ${w} feet wide. How tall is it?`,
      }, { correct: h }, 2090 + i * 10);
    }
  }

  // ── math.word_problem.multi_step (4.OA.A.3) ──────────────────────
  {
    const r = rng(114);
    let idx = 0;
    const pushStory = (eq: string, text: string, correct: number, cands: number[]) => {
      push('math.word_problem.multi_step', 'EquationTap', {
        type: 'EquationTap',
        equation: eq,
        choices: numChoices(correct, cands, r),
        promptText: text,
      }, { correct }, 2050 + (idx++) * 5);
    };
    // a baskets of b, minus c
    const set1: Array<[number, number, number]> = [
      [3, 24, 18], [4, 15, 22], [5, 12, 17], [6, 14, 29], [4, 26, 35], [7, 13, 44],
    ];
    for (const [a, b, c] of set1) {
      const correct = a * b - c;
      pushStory(`${a} × ${b} − ${c} = ?`,
        `Nana picked ${a} baskets of ${b} berries, then gave away ${c}. How many berries are left?`,
        correct, [a * b + c, a * b, correct + 10, a + b + c]);
    }
    // a rows of b, plus c more
    const set2: Array<[number, number, number]> = [
      [6, 24, 15], [5, 18, 27], [8, 12, 30], [7, 16, 23], [9, 14, 18], [4, 32, 26],
    ];
    for (const [a, b, c] of set2) {
      const correct = a * b + c;
      pushStory(`${a} × ${b} + ${c} = ?`,
        `The garden has ${a} rows of ${b} carrots, plus ${c} more growing in pots. How many carrots in all?`,
        correct, [a * b - c, a * b, correct - 10, a + b + c]);
    }
    // (a + b) × c
    const set3: Array<[number, number, number]> = [
      [8, 6, 4], [12, 9, 3], [15, 10, 5], [7, 5, 6], [11, 13, 4], [9, 12, 6],
    ];
    for (const [a, b, c] of set3) {
      const correct = (a + b) * c;
      pushStory(`(${a} + ${b}) × ${c} = ?`,
        `Cecily planted ${a} tomato and ${b} pepper seedlings in each of ${c} beds. How many seedlings altogether?`,
        correct, [a + b * c, a + b + c, (a + b) * (c - 1), a * b * c]);
    }
    // a − b × c
    const set4: Array<[number, number, number]> = [
      [100, 12, 6], [80, 9, 7], [150, 16, 8], [96, 11, 5], [120, 18, 5], [200, 24, 7],
    ];
    for (const [a, b, c] of set4) {
      const correct = a - b * c;
      pushStory(`${a} − ${b} × ${c} = ?`,
        `Esme had ${a} seeds. She planted ${c} rows with ${b} seeds in each row. How many seeds are left?`,
        correct, [a - b - c, b * c, correct + 10, a - b]);
    }
    // T ÷ g + e
    const set5: Array<[number, number, number]> = [
      [48, 6, 5], [63, 7, 8], [72, 8, 6], [90, 9, 12], [56, 7, 9], [84, 6, 11],
    ];
    for (const [t, g, e] of set5) {
      const correct = t / g + e;
      pushStory(`${t} ÷ ${g} + ${e} = ?`,
        `Nana baked ${t} berry muffins and packed them equally into ${g} boxes, then added ${e} more muffins to one box. How many muffins are in that box?`,
        correct, [t / g, e + g, t - g, correct + 5]);
    }
  }

  return out;
}

export async function seedMath(
  sb: SupabaseClient,
  skillIdByCode: Map<string, string>
): Promise<void> {
  let rows = buildMathItems(code => skillIdByCode.get(code));
  const mathSkillIds = Array.from(skillIdByCode.entries())
    .filter(([c]) => c.startsWith('math.'))
    .map(([, id]) => id);

  // SEED_ADDITIVE=1: only insert items for skills that currently have
  // NO seed items (i.e. newly added skills). Skips the wipe entirely —
  // the full wipe deletes learners' attempts on prior seed items,
  // which resets attempt-derived progress (garden structure counts).
  // Use additive mode when shipping new skills to a live database.
  if (process.env.SEED_ADDITIVE === '1') {
    const seeded = new Set<string>();
    const PAGE = 1000;
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await sb.from('item')
        .select('skill_id').eq('generated_by', 'seed').in('skill_id', mathSkillIds)
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      for (const r of data) seeded.add(r.skill_id);
      if (data.length < PAGE) break;
    }
    rows = rows.filter(r => !seeded.has(r.skill_id));
    console.log(`  → math (additive): ${rows.length} items for previously-unseeded skills`);
  } else if (mathSkillIds.length > 0) {
    // Paginate — Supabase caps SELECT at 1000 rows by default.
    const PAGE = 1000;
    const priorIds: string[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await sb.from('item')
        .select('id').eq('generated_by', 'seed').in('skill_id', mathSkillIds)
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      for (const r of data) priorIds.push(r.id);
      if (data.length < PAGE) break;
    }
    if (priorIds.length > 0) {
      // PostgREST has a URL-length limit (~8KB). With ~1000 UUIDs of
      // 37 chars each, a single .in('id', priorIds) blows the URL,
      // the delete fails silently, and items pile up across re-seed
      // runs (we've seen 3x duplication). Batch the deletes.
      const DELETE_BATCH = 50;
      for (let i = 0; i < priorIds.length; i += DELETE_BATCH) {
        const batch = priorIds.slice(i, i + DELETE_BATCH);
        const { error: aErr } = await sb.from('attempt').delete().in('item_id', batch);
        if (aErr) throw aErr;
      }
      for (let i = 0; i < priorIds.length; i += DELETE_BATCH) {
        const batch = priorIds.slice(i, i + DELETE_BATCH);
        const { error: iErr } = await sb.from('item').delete().in('id', batch);
        if (iErr) throw iErr;
      }
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
