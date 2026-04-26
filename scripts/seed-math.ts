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
