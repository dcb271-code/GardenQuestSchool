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

/** A generic small-bird outline, drawn once and scaled. */
function BirdShape({ size, fill }: { size: number; fill: string }) {
  // Viewbox is 100 wide; the path is a plain perching passerine —
  // round body, small head, tail down and back.
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 100 80" aria-hidden>
      <path
        d="M 62 20 a 12 12 0 1 0 -0.4 3
           C 52 27, 38 30, 28 40
           C 18 50, 16 60, 24 66
           C 32 72, 50 70, 60 62
           C 68 55, 72 44, 70 34
           L 94 70 L 88 44 L 74 30 Z"
        fill={fill}
      />
      <circle cx="66" cy="18" r="2" fill="#fffaf2" />
      <path d="M 74 22 L 86 24 L 74 27 Z" fill={fill} />
      <path d="M 34 66 L 32 76 M 44 66 L 44 76" stroke={fill} strokeWidth="3" strokeLinecap="round" />
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

const BILL_PATHS: Record<BillShape, { d: string; label: string }> = {
  cone:        { d: 'M 10 20 L 44 12 L 44 28 Z', label: 'cone' },
  chisel:      { d: 'M 10 17 L 52 16 L 52 24 L 10 23 Z', label: 'chisel' },
  tweezers:    { d: 'M 10 19 L 50 19.5 L 50 21 L 10 22 Z', label: 'tweezers' },
  hook:        { d: 'M 10 14 L 40 16 Q 50 18 46 30 Q 44 22 36 22 L 10 26 Z', label: 'hook' },
  needle:      { d: 'M 10 19.5 L 60 20 L 60 21 L 10 22 Z', label: 'needle' },
  all_purpose: { d: 'M 10 16 L 46 19 L 46 23 L 10 26 Z', label: 'middling' },
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
    { n: 2, emoji: '🎨', title: 'colour pattern', body: 'Light and dark, not just one bright spot.' },
    { n: 3, emoji: '🏃', title: 'behaviour', body: 'What is it doing? How does it move?' },
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
