// components/child/birds/birdVisuals.tsx
//
// Drawn figures for the teaching pages.
//
// These are deliberately NOT photographs. The whole shape-before-colour
// sequence depends on being able to show a shape with the colour taken
// away — a photograph of a cardinal answers "which bird is red?" before
// the question about shape has even been asked.

'use client';

import type { SizeAnchor, BillShape } from '@/lib/world/birdCatalog';

/**
 * A generic small-bird outline, drawn once and scaled.
 *
 * Built from overlapping solid shapes in one fill rather than a single
 * clever path — the first version of this was one path, and its beak
 * floated free of the head while its tail sprouted from the same side
 * as its face. Separate shapes that visibly overlap cannot come apart.
 * The bird faces RIGHT: beak rooted in the head, tail sweeping back
 * down to the LEFT.
 */
function BirdShape({ size, fill }: { size: number; fill: string }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 100 80" aria-hidden>
      {/* tail — back-left, rooted under the body */}
      <path d="M 30 38 L 3 62 L 28 56 Z" fill={fill} />
      {/* body */}
      <ellipse cx="46" cy="46" rx="26" ry="20" fill={fill} />
      {/* head, overlapping the body's shoulder */}
      <circle cx="68" cy="26" r="13" fill={fill} />
      {/* beak — base buried inside the head circle */}
      <path d="M 78 21 L 93 26 L 78 31 Z" fill={fill} />
      <circle cx="71" cy="22" r="2" fill="#fffaf2" />
      <path d="M 40 64 L 38 76 M 52 64 L 52 76" stroke={fill} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The birder's measuring stick.
 *
 * Every bird gets compared to one of three she already knows. Drawn to
 * real relative length — sparrow 6", robin 10", crow 17.5" — because a
 * ladder that lies about proportion teaches the wrong thing.
 */
export function SizeLadder({ highlight }: { highlight?: SizeAnchor }) {
  const rungs: Array<{ key: SizeAnchor; label: string; px: number }> = [
    { key: 'sparrow', label: 'sparrow', px: 48 },
    { key: 'robin', label: 'robin', px: 80 },
    { key: 'crow', label: 'crow', px: 132 },
  ];
  return (
    <div className="flex items-end justify-center gap-6 py-3">
      {rungs.map(r => {
        const on = highlight === r.key;
        return (
          <div key={r.key} className="flex flex-col items-center gap-1">
            <BirdShape size={r.px} fill={on ? '#6b8e5a' : '#9aa899'} />
            <span
              className="text-xs font-bold"
              style={{ color: on ? '#3f2614' : '#6b6255' }}
            >
              {r.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The head circle sits at cx=58 r=13, so its left edge is x=45. Every
 * bill's base is at x=48 — INSIDE the circle, so it visibly grows out
 * of the face — and no bill reaches past x=48, so nothing skewers
 * through the head (the old needle ran to x=60, straight across the
 * eye). The distinguishing character of each bill lives at the TIP,
 * where it belongs: the first hook curled at its base, which is not a
 * raptor bill, it is a moustache.
 */
const BILL_PATHS: Record<BillShape, { d: string; label: string }> = {
  cone:        { d: 'M 14 20 L 48 12 L 48 28 Z', label: 'cone' },
  chisel:      { d: 'M 12 17 L 48 15 L 48 25 L 12 23 Z', label: 'chisel' },
  tweezers:    { d: 'M 12 19.2 L 48 17.5 L 48 22.5 L 12 21 Z', label: 'tweezers' },
  hook:        { d: 'M 48 13 L 24 14 Q 12 15 14 27 Q 15 19 26 21 L 48 25 Z', label: 'hook' },
  needle:      { d: 'M 2 19.6 L 48 18.4 L 48 21.6 L 2 20.8 Z', label: 'needle' },
  all_purpose: { d: 'M 14 16.5 L 48 15 L 48 25 L 14 23 Z', label: 'middling' },
};

/** Bill shapes, which is the child's version of "what shape is it?". */
export function BillChart({ highlight }: { highlight?: BillShape }) {
  const shapes = Object.entries(BILL_PATHS) as Array<[BillShape, { d: string; label: string }]>;
  return (
    <div className="grid grid-cols-2 gap-2 py-2">
      {shapes.map(([key, { d, label }]) => {
        const on = highlight === key;
        return (
          <div
            key={key}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5"
            style={{
              background: on ? 'rgba(107,142,90,0.18)' : 'rgba(255,250,242,0.7)',
              border: `1px solid ${on ? '#6b8e5a' : '#e3dccf'}`,
            }}
          >
            <svg width="64" height="40" viewBox="0 0 70 40" aria-hidden>
              <circle cx="58" cy="20" r="13" fill={on ? '#6b8e5a' : '#b9b0a1'} />
              <circle cx="54" cy="16" r="2" fill="#fffaf2" />
              <path d={d} fill={on ? '#3f2614' : '#7a6f5f'} />
            </svg>
            <span className="text-xs font-bold" style={{ color: '#3f2614' }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Cornell's Four Keys, in their order.
 *
 * Shown at the top of the very first unit and again whenever the
 * ordering matters, because the order is the actual teaching — a
 * beginner who jumps to spots and stripes memorises marks without ever
 * learning to see a bird.
 */
export function FourKeys() {
  const keys = [
    { n: 1, emoji: '📏', title: 'size & shape', body: 'How big? What shape is the bill?' },
    { n: 2, emoji: '🎨', title: 'color pattern', body: 'Light and dark, not just one bright spot.' },
    { n: 3, emoji: '🏃', title: 'behavior', body: 'What is it doing? How does it move?' },
    { n: 4, emoji: '🌳', title: 'habitat', body: 'Where is it — ground, trunk, treetop?' },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 py-2">
      {keys.map(k => (
        <div
          key={k.n}
          className="rounded-xl p-2.5"
          style={{ background: 'rgba(255,250,242,0.85)', border: '1px solid #e3dccf' }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="flex items-center justify-center rounded-full text-xs font-bold"
              style={{ width: 20, height: 20, background: '#6b8e5a', color: '#fffaf2' }}
            >{k.n}</span>
            <span className="text-base" aria-hidden>{k.emoji}</span>
          </div>
          <div className="mt-1 text-xs font-bold" style={{ color: '#3f2614' }}>{k.title}</div>
          <div className="text-[11px] leading-snug" style={{ color: '#6b6255' }}>{k.body}</div>
        </div>
      ))}
    </div>
  );
}
