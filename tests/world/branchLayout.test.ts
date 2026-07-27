// tests/world/branchLayout.test.ts
//
// Hit-testing geometry, which nothing else here can see.
//
// Three collisions shipped and were found by a seven-year-old on a
// tablet, not by 1000+ passing tests and not by rendered stills —
// because none of them is a logic error or a painting error. They are
// overlapping tap targets:
//
//   * Mirror Tarns' centre sat inside the High Meadow close box, so a
//     dead-centre tap collapsed the station instead of opening the stop.
//   * Paragraph Pavers overlapped the Nature Walk signpost and, drawn
//     later, took its taps — making the walk chooser, and therefore the
//     whole bird curriculum, partly unreachable.
//   * The Ee/Ea Glade's centre sits inside the Phonics Path box.
//
// Everything here is in world units on the 1440x800 canvas. A portrait
// tablet shows ~713 units across at roughly 1.17 px per unit, so 34
// units of tap radius is about 40px — already at the edge of usable.
// There is no room to give any of it away.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  MATH_MOUNTAIN_STRUCTURES, READING_FOREST_STRUCTURES,
  BRANCH_MAP_WIDTH, BRANCH_MAP_HEIGHT,
} from '@/lib/world/branchMaps';
import {
  MATH_STATIONS, READING_STATIONS, SCENE_HOTSPOTS, MARKER,
  stationOpenBox, stationCloseBox, structureHit, structureLabelBox,
  boxesOverlap, boxContainsPoint, circleBoxOverlapArea,
  type BranchStation,
} from '@/lib/world/branchStations';

const BRANCHES = [
  { name: 'math_mountain', structures: MATH_MOUNTAIN_STRUCTURES, stations: MATH_STATIONS },
  { name: 'reading_forest', structures: READING_FOREST_STRUCTURES, stations: READING_STATIONS },
] as const;

/** Structures NOT inside this station — the ones still on screen when it opens. */
function outsiders(station: BranchStation, structures: typeof MATH_MOUNTAIN_STRUCTURES) {
  const members = new Set(station.codes);
  return structures.filter(s => !members.has(s.code));
}

describe('station tap boxes', () => {
  it('every station references only real structures', () => {
    for (const b of BRANCHES) {
      const known = new Set(b.structures.map(s => s.code));
      for (const st of b.stations) {
        for (const c of st.codes) {
          expect(known.has(c), `${st.key} → unknown structure ${c}`).toBe(true);
        }
      }
    }
  });

  it('no structure belongs to two stations', () => {
    for (const b of BRANCHES) {
      const seen = new Map<string, string>();
      for (const st of b.stations) {
        for (const c of st.codes) {
          expect(seen.has(c), `${c} in both ${seen.get(c)} and ${st.key}`).toBe(false);
          seen.set(c, st.key);
        }
      }
    }
  });

  it('a COLLAPSED station never contains the centre of an outside structure', () => {
    // The station is shut, so its members are not drawn — but everything
    // else still is, and the box is painted last, so it wins the tap.
    const bad: string[] = [];
    for (const b of BRANCHES) {
      for (const st of b.stations) {
        if (st.noTapTarget) continue;
        const box = stationOpenBox(st);
        for (const s of outsiders(st, b.structures)) {
          if (boxContainsPoint(box, s.x, s.y)) {
            bad.push(`${st.key} (collapsed) swallows "${s.label}" (${s.code}) at ${s.x},${s.y}`);
          }
        }
      }
    }
    expect(bad, bad.join('\n')).toEqual([]);
  });

  it('an EXPANDED station never contains the centre of any structure', () => {
    // This is the Mirror Tarns bug exactly: when open, the close target
    // sat on top of the stops it had just revealed.
    const bad: string[] = [];
    for (const b of BRANCHES) {
      for (const st of b.stations) {
        if (st.noTapTarget) continue;
        const box = stationCloseBox(st);
        for (const s of b.structures) {
          if (boxContainsPoint(box, s.x, s.y)) {
            bad.push(`${st.key} (expanded) swallows "${s.label}" (${s.code}) at ${s.x},${s.y}`);
          }
        }
      }
    }
    expect(bad, bad.join('\n')).toEqual([]);
  });

  it('an expanded station never covers a member label — tapping the name must open it', () => {
    const bad: string[] = [];
    for (const b of BRANCHES) {
      for (const st of b.stations) {
        if (st.noTapTarget) continue;
        const box = stationCloseBox(st);
        for (const s of b.structures) {
          if (boxesOverlap(box, structureLabelBox(s))) {
            bad.push(`${st.key} (expanded) covers the label of "${s.label}" (${s.code})`);
          }
        }
      }
    }
    expect(bad, bad.join('\n')).toEqual([]);
  });

  it('a station steals no more than a sliver of any tap circle that is on screen', () => {
    // Some overlap of bounding boxes is tolerable on a crowded map; a
    // quarter of the target is not. Mirror Tarns was losing ~44%.
    //
    // Which structures count depends on the state, and getting this
    // wrong makes the test cry wolf: when a station is COLLAPSED its
    // own members are not rendered at all, so the open box may sit on
    // top of them freely. When EXPANDED they are all on screen.
    const full = (MARKER.HIT * 2) ** 2;
    const bad: string[] = [];
    for (const b of BRANCHES) {
      for (const st of b.stations) {
        if (st.noTapTarget) continue;
        const cases: Array<[string, ReturnType<typeof stationOpenBox>, typeof b.structures]> = [
          ['collapsed', stationOpenBox(st), outsiders(st, b.structures)],
          ['expanded', stationCloseBox(st), b.structures],
        ];
        for (const [state, box, pool] of cases) {
          for (const s of pool) {
            const frac = circleBoxOverlapArea(structureHit(s), box) / full;
            if (frac > 0.25) {
              bad.push(`${st.key} (${state}) steals ${(frac * 100).toFixed(0)}% of "${s.label}" (${s.code})`);
            }
          }
        }
      }
    }
    expect(bad, bad.join('\n')).toEqual([]);
  });
});

describe('scene hotspots (signposts drawn outside the structure list)', () => {
  it('no structure tap circle or label lands on a hotspot', () => {
    const bad: string[] = [];
    for (const h of SCENE_HOTSPOTS) {
      const b = BRANCHES.find(x => x.name === h.branch)!;
      for (const s of b.structures) {
        const c = structureHit(s);
        const cb = { x0: c.cx - c.r, y0: c.cy - c.r, x1: c.cx + c.r, y1: c.cy + c.r };
        if (boxesOverlap(cb, h.box)) {
          bad.push(`"${s.label}" (${s.code}) tap circle overlaps ${h.label}`);
        }
        if (boxesOverlap(structureLabelBox(s), h.box)) {
          bad.push(`"${s.label}" (${s.code}) label pill overlaps ${h.label}`);
        }
      }
    }
    expect(bad, bad.join('\n')).toEqual([]);
  });
});

describe('structure spacing', () => {
  it('no two structures on a branch overlap tap circles', () => {
    const bad: string[] = [];
    for (const b of BRANCHES) {
      for (let i = 0; i < b.structures.length; i++) {
        for (let j = i + 1; j < b.structures.length; j++) {
          const a = b.structures[i], c = b.structures[j];
          const d = Math.hypot(a.x - c.x, a.y - c.y);
          if (d < MARKER.HIT * 2) {
            bad.push(`${b.name}: "${a.label}" and "${c.label}" are ${d.toFixed(0)} apart (need ${MARKER.HIT * 2})`);
          }
        }
      }
    }
    expect(bad, bad.join('\n')).toEqual([]);
  });

  it('everything stays on the canvas, label pills included', () => {
    const bad: string[] = [];
    for (const b of BRANCHES) {
      for (const s of b.structures) {
        const lb = structureLabelBox(s);
        if (lb.x0 < 0 || lb.x1 > BRANCH_MAP_WIDTH || lb.y1 > BRANCH_MAP_HEIGHT || s.y - MARKER.HIT < 0) {
          bad.push(`${b.name}: "${s.label}" (${s.x},${s.y}) spills off the canvas`);
        }
      }
    }
    expect(bad, bad.join('\n')).toEqual([]);
  });
});

describe('hotspot boxes match what the scene actually draws', () => {
  it('the Nature Walk signpost geometry is not duplicated by hand', () => {
    // SCENE_HOTSPOTS carries a copy of coordinates that live in JSX. If
    // someone nudges the signpost and forgets this file, the guard above
    // silently starts protecting empty ground — which is precisely the
    // failure mode that let Paragraph Pavers land on it.
    //
    // Plain string scanning, not a regex: the first version of this used
    // `\s*\n\s*` to hop lines, and since \s already matches \n that
    // backtracks catastrophically over a 1400-line file. It hung the
    // suite for five minutes.
    const src = readFileSync(
      join(process.cwd(), 'app', '(child)', 'garden', 'reading-forest', 'ReadingForestScene.tsx'),
      'utf8',
    );
    const hotspot = SCENE_HOTSPOTS.find(h => h.key === 'nature_walk_signpost')!;

    const handler = src.indexOf('setWalkChooserOpen(true)');
    expect(handler, 'the signpost no longer opens the walk chooser').toBeGreaterThan(-1);

    // Nearest preceding translate(...) is the group the handler sits in.
    const before = src.slice(0, handler);
    const tIdx = before.lastIndexOf('translate(');
    const coords = /^translate\((\d+),\s*(\d+)\)/.exec(before.slice(tIdx));
    expect(coords, 'could not read the signpost translate').not.toBeNull();
    const [tx, ty] = [Number(coords![1]), Number(coords![2])];

    // ...and the generous hit rect declared just inside it.
    const rectIdx = src.indexOf('fill="transparent"', handler);
    const rectDecl = src.slice(src.lastIndexOf('<rect', rectIdx), rectIdx);
    const nums = rectDecl.match(/-?\d+/g)!.map(Number);
    const [rx, ry, rw, rh] = nums;

    expect(
      { x0: tx + rx, y0: ty + ry, x1: tx + rx + rw, y1: ty + ry + rh },
      'signpost moved or resized — update SCENE_HOTSPOTS to match',
    ).toEqual(hotspot.box);
  });
});
