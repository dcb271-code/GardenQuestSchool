// lib/world/traceScoring.ts
//
// Deciding whether a finger-drawn stroke "followed" the guide stroke.
// Pure maths, no DOM, so the rules are testable and tunable without a
// tablet in hand.
//
// The rule we want for a six-year-old is forgiving about wobble but
// strict about the two things that actually matter when learning to
// write Japanese: you started at the right END of the stroke, and you
// moved along it in the right DIRECTION. A trace that covers the path
// backwards is not a pass, however neat it looks.
//
// Method: the guide stroke is sampled into an ordered list of points.
// A sample counts as covered when the drawn line passes within
// `tolerance` of it. We then require:
//   • enough of the samples covered at all              (coverage)
//   • the first and last samples both covered           (ends)
//   • coverage happened broadly front-to-back           (direction)
// Direction is judged by comparing when each sample was first touched:
// if the child traced forwards, those touch-times rise with the sample
// index. We count how many adjacent pairs are in the right order.

export interface Pt { x: number; y: number }

export interface TraceResult {
  /** Fraction of guide samples the finger came close to (0..1). */
  coverage: number;
  /** Fraction of adjacent sample pairs touched in the right order (0..1). */
  order: number;
  startHit: boolean;
  endHit: boolean;
  passed: boolean;
  /** Which rule failed first — drives the on-screen nudge. */
  reason?: 'too-short' | 'missed-start' | 'missed-end' | 'gaps' | 'backwards';
}

export interface TraceRules {
  tolerance: number;     // how far off the line a finger may stray
  minCoverage: number;   // fraction of the stroke that must be visited
  minOrder: number;      // fraction of pairs that must run forwards
}

/** Tuned for a 100x100 character box on a touchscreen. */
export const DEFAULT_TRACE_RULES: TraceRules = {
  tolerance: 15,
  minCoverage: 0.8,
  minOrder: 0.75,
};

function dist2(a: Pt, b: Pt): number {
  const dx = a.x - b.x, dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/**
 * Shortest distance from point p to the segment ab. Using segments
 * rather than raw drawn points means a fast swipe (few sampled points,
 * long gaps between them) still registers as covering the line.
 */
function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const l2 = dist2(a, b);
  if (l2 === 0) return Math.sqrt(dist2(p, a));
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt(dist2(p, { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) }));
}

export function scoreTrace(
  guide: Pt[],
  drawn: Pt[],
  rules: TraceRules = DEFAULT_TRACE_RULES,
): TraceResult {
  const fail = (reason: TraceResult['reason']): TraceResult =>
    ({ coverage: 0, order: 0, startHit: false, endHit: false, passed: false, reason });

  if (guide.length === 0) return fail('too-short');
  // A tap is not a trace. Two points is the minimum that has direction.
  if (drawn.length < 2) return fail('too-short');

  // firstTouch[i] = index into `drawn` when guide sample i was first
  // approached; -1 if never.
  const firstTouch: number[] = new Array(guide.length).fill(-1);
  for (let d = 1; d < drawn.length; d++) {
    const a = drawn[d - 1], b = drawn[d];
    for (let g = 0; g < guide.length; g++) {
      if (firstTouch[g] !== -1) continue;
      if (distToSegment(guide[g], a, b) <= rules.tolerance) firstTouch[g] = d;
    }
  }

  const touched = firstTouch.filter(t => t !== -1).length;
  const coverage = touched / guide.length;
  const startHit = firstTouch[0] !== -1;
  const endHit = firstTouch[firstTouch.length - 1] !== -1;

  // Direction: among consecutive covered samples, how many were
  // touched in a non-decreasing order?
  const seq = firstTouch.filter(t => t !== -1);
  let forward = 0, pairs = 0;
  for (let i = 1; i < seq.length; i++) {
    pairs++;
    if (seq[i] >= seq[i - 1]) forward++;
  }
  const order = pairs === 0 ? 0 : forward / pairs;

  let reason: TraceResult['reason'];
  if (!startHit) reason = 'missed-start';
  else if (!endHit) reason = 'missed-end';
  else if (coverage < rules.minCoverage) reason = 'gaps';
  else if (order < rules.minOrder) reason = 'backwards';

  return {
    coverage,
    order,
    startHit,
    endHit,
    passed: reason === undefined,
    reason,
  };
}

/** Friendly, specific nudge for a stroke that didn't pass. */
export function traceHint(reason: TraceResult['reason']): string {
  switch (reason) {
    case 'missed-start': return 'start on the green dot';
    case 'missed-end':   return 'keep going all the way to the end';
    case 'gaps':         return 'try to stay on the grey line';
    case 'backwards':    return 'that way is backwards — follow the arrow';
    case 'too-short':    return 'draw along the line with your finger';
    default:             return 'give it another go';
  }
}
