// lib/level0/signature.ts
//
// Sign Her Name — the pure half. A dotted guide for each capital
// letter, and the rule that decides when a finger has traced it.
// Spec: docs/superpowers/specs/2026-09-26-level-zero-spec.md
//
// No handwriting recognition. A letter is FINISHED when the finger
// passed its checkpoint dots in order, stroke by stroke — the
// connect-the-dots rule, derivable by a four-year-old looking at the
// dots. There is no wrong signature; there is finished and not yet.

export type Point = [number, number];

/** One letter: strokes as polylines in a 100 × 100 box, y down. */
export type LetterGuide = Point[][];

function arc(cx: number, cy: number, r: number, fromDeg: number, toDeg: number, steps = 12): Point[] {
  const out: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((fromDeg + (toDeg - fromDeg) * (i / steps)) * Math.PI) / 180;
    out.push([Math.round(cx + r * Math.cos(a)), Math.round(cy + r * Math.sin(a))]);
  }
  return out;
}

/**
 * The capitals, drawn the way a child is taught them: stems first,
 * top to bottom, left to right. Curves are sampled arcs. Every
 * letter is inside [5, 95] both ways so the dots never touch the
 * next letter's.
 */
export const LETTER_GUIDES: Record<string, LetterGuide> = {
  A: [[[10, 100], [50, 0], [90, 100]], [[25, 60], [75, 60]]],
  B: [[[15, 0], [15, 100]], [[15, 0], [60, 0], [80, 12], [80, 38], [60, 50], [15, 50]],
      [[15, 50], [65, 50], [85, 62], [85, 88], [65, 100], [15, 100]]],
  C: [arc(50, 50, 45, -50, 230)],
  D: [[[15, 0], [15, 100]], [[15, 0], [55, 0], [85, 25], [85, 75], [55, 100], [15, 100]]],
  E: [[[80, 0], [15, 0], [15, 100], [80, 100]], [[15, 50], [65, 50]]],
  F: [[[80, 0], [15, 0], [15, 100]], [[15, 50], [65, 50]]],
  G: [[...arc(50, 50, 45, -50, 270), [95, 60], [55, 60]]],
  H: [[[15, 0], [15, 100]], [[85, 0], [85, 100]], [[15, 50], [85, 50]]],
  I: [[[50, 0], [50, 100]]],
  J: [[[60, 0], [60, 78], [48, 98], [28, 98], [15, 80]]],
  K: [[[15, 0], [15, 100]], [[80, 0], [15, 55]], [[30, 45], [85, 100]]],
  L: [[[15, 0], [15, 100], [85, 100]]],
  M: [[[10, 100], [10, 0], [50, 70], [90, 0], [90, 100]]],
  N: [[[15, 100], [15, 0], [85, 100], [85, 0]]],
  O: [arc(50, 50, 46, -90, 270, 16)],
  P: [[[15, 100], [15, 0]], [[15, 0], [60, 0], [85, 15], [85, 40], [60, 55], [15, 55]]],
  Q: [arc(50, 48, 44, -90, 270, 16), [[62, 68], [92, 100]]],
  R: [[[15, 100], [15, 0]], [[15, 0], [60, 0], [85, 15], [85, 40], [60, 55], [15, 55]], [[45, 55], [85, 100]]],
  S: [[[85, 15], [65, 2], [35, 2], [15, 18], [20, 38], [50, 50], [80, 62], [85, 82], [65, 98], [35, 98], [15, 85]]],
  T: [[[10, 0], [90, 0]], [[50, 0], [50, 100]]],
  U: [[[15, 0], [15, 70], [30, 95], [50, 100], [70, 95], [85, 70], [85, 0]]],
  V: [[[10, 0], [50, 100], [90, 0]]],
  W: [[[5, 0], [27, 100], [50, 30], [73, 100], [95, 0]]],
  X: [[[10, 0], [90, 100]], [[90, 0], [10, 100]]],
  Y: [[[10, 0], [50, 50], [90, 0]], [[50, 50], [50, 100]]],
  Z: [[[10, 0], [90, 0], [10, 100], [90, 100]]],
};

/** Longest name that fits along the bottom of a painting. */
export const MAX_SIGNATURE_LETTERS = 8;

/**
 * The letters a child signs: her first name in capitals, letters
 * only. A name longer than the corner can hold becomes initials —
 * nobody in this family, but the rule exists. Nothing (no name, or
 * no letters we can draw) means no signature step at all.
 */
export function signatureLetters(firstName: string | null | undefined): string[] {
  const letters = (firstName ?? '').toUpperCase().replace(/[^A-Z]/g, '').split('')
    .filter(ch => ch in LETTER_GUIDES);
  if (letters.length <= MAX_SIGNATURE_LETTERS) return letters;
  return (firstName ?? '').toUpperCase().split(/\s+/)
    .map(w => w.replace(/[^A-Z]/g, '')[0]).filter(ch => ch && ch in LETTER_GUIDES);
}

/* ── checkpoints ─────────────────────────────────────────────────── */

/** Dots along a stroke, about this far apart in the 100-box. */
export const CHECKPOINT_SPACING = 16;
/** How near the finger must pass a dot, in the 100-box. Generous: she is four. */
export const CHECKPOINT_RADIUS = 26;

/** Resample a polyline into evenly spaced checkpoints, ends included. */
export function checkpoints(stroke: Point[], spacing = CHECKPOINT_SPACING): Point[] {
  if (stroke.length === 1) return [stroke[0]];
  const out: Point[] = [stroke[0]];
  let carry = 0;
  for (let i = 1; i < stroke.length; i++) {
    const [x0, y0] = stroke[i - 1];
    const [x1, y1] = stroke[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    let d = spacing - carry;
    while (d <= len) {
      out.push([x0 + ((x1 - x0) * d) / len, y0 + ((y1 - y0) * d) / len]);
      d += spacing;
    }
    carry = len - (d - spacing);
  }
  const last = stroke[stroke.length - 1];
  const tail = out[out.length - 1];
  if (Math.hypot(last[0] - tail[0], last[1] - tail[1]) > spacing / 2) out.push(last);
  else out[out.length - 1] = last;
  return out;
}

/** Progress through one letter: which stroke, which dot is next. */
export interface TraceProgress {
  stroke: number;
  dot: number;
  done: boolean;
}

export function startTrace(): TraceProgress {
  return { stroke: 0, dot: 0, done: false };
}

/**
 * Feed one finger position (in the letter's 100-box). Dots must be
 * passed in order; a fast finger may take the next two at once, but
 * never skip a stroke. Returns the new progress and whether a stroke
 * just finished (the scene celebrates that).
 */
export function advanceTrace(
  guide: LetterGuide, progress: TraceProgress, point: Point, radius = CHECKPOINT_RADIUS,
): { progress: TraceProgress; strokeFinished: boolean } {
  if (progress.done) return { progress, strokeFinished: false };
  const dots = checkpoints(guide[progress.stroke]);
  let dot = progress.dot;
  let moved = true;
  let steps = 0;
  while (moved && dot < dots.length && steps < 2) {
    const [dx, dy] = dots[dot];
    moved = Math.hypot(point[0] - dx, point[1] - dy) <= radius;
    if (moved) { dot++; steps++; }
  }
  if (dot < dots.length) return { progress: { ...progress, dot }, strokeFinished: false };
  const nextStroke = progress.stroke + 1;
  if (nextStroke >= guide.length) {
    return { progress: { stroke: progress.stroke, dot, done: true }, strokeFinished: true };
  }
  return { progress: { stroke: nextStroke, dot: 0, done: false }, strokeFinished: true };
}

/** The dot the finger should go to next, or null when the letter is done. */
export function nextDot(guide: LetterGuide, progress: TraceProgress): Point | null {
  if (progress.done) return null;
  return checkpoints(guide[progress.stroke])[progress.dot] ?? null;
}
