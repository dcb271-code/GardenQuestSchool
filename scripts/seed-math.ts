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
        const choices = total === 0 ? [0, 1, a + b, a * (b + 1)] : mkChoices(total, r, 6);
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
