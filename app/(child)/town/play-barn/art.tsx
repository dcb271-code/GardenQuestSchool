// app/(child)/town/play-barn/art.tsx
//
// The Play Barn's bespoke art. Owner ruling (spec, 2026-08-29):
// never emojis, always drawn SVGs, viewed and checked twice. Every
// sprite stands on something, with a shadow at its feet.

import React from 'react';

/* ── the bunny — the game's face ────────────────────────────────── */

export function BunnySprite({ size = 64, blech = false }: {
  size?: number; blech?: boolean;
}) {
  // Side view, facing right, mid-crouch: haunch, front paws, one ear
  // up and one relaxed. Blech mode wrinkles the nose and shuts the
  // eye — a taste regretted, not a punishment received.
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <ellipse cx="32" cy="58" rx="20" ry="4" fill="rgba(40,28,16,0.18)" />
      {/* haunch + body */}
      <ellipse cx="26" cy="44" rx="15" ry="13" fill="#E8DCC8" />
      <ellipse cx="38" cy="42" rx="13" ry="11" fill="#F2E9D8" />
      {/* tail */}
      <circle cx="12" cy="42" r="5.5" fill="#FFF8EC" />
      {/* back foot */}
      <ellipse cx="24" cy="55.5" rx="8" ry="3.4" fill="#DCCBB0" />
      {/* front paws */}
      <ellipse cx="44" cy="53" rx="4" ry="4.6" fill="#E8DCC8" />
      <ellipse cx="49" cy="53.6" rx="3.6" ry="4" fill="#F2E9D8" />
      {/* head */}
      <circle cx="47" cy="30" r="11" fill="#F2E9D8" />
      {/* ears: one tall, one relaxed */}
      <path d="M 44 21 Q 40 4 47 3 Q 51 8 49 21 Z" fill="#E8DCC8" />
      <path d="M 45.5 19 Q 43 8 46.5 6 Q 48.6 9 48 19 Z" fill="#F3C8C0" opacity="0.7" />
      <path d="M 52 22 Q 60 12 63 16 Q 62 24 54 27 Z" fill="#E8DCC8" />
      {/* face */}
      {blech ? (
        <>
          <path d="M 49 28 q 2.4 -1.6 4.4 0" stroke="#4A3B28" strokeWidth="1.6"
                fill="none" strokeLinecap="round" />
          <path d="M 53 35 q 2 2 4 0.6" stroke="#4A3B28" strokeWidth="1.6"
                fill="none" strokeLinecap="round" />
          {/* wrinkled nose, and the tongue out — blech, not asleep */}
          <path d="M 55.4 31 l 2.6 -1 M 55.4 32.6 l 2.8 0.2" stroke="#C79A8A"
                strokeWidth="1.1" strokeLinecap="round" />
          <path d="M 53 36.6 q 1.4 5 4.2 3.6 q 1.4 -1.4 0.2 -4.2 Z" fill="#E08A96" />
        </>
      ) : (
        <>
          <circle cx="50.5" cy="28.5" r="1.9" fill="#2E2418" />
          <circle cx="51.2" cy="27.8" r="0.6" fill="#FFF" />
          <path d="M 56 32.4 q 1.8 1.6 0 2.6 q -1.8 -1 0 -2.6" fill="#D8A8A0" />
          <path d="M 54.5 36 q 1.6 1.4 3.4 0.4" stroke="#4A3B28" strokeWidth="1.2"
                fill="none" strokeLinecap="round" />
        </>
      )}
      {/* whiskers */}
      <path d="M 56 33.5 l 6 -1.4 M 56 34.6 l 6.4 0.6" stroke="#B8A88E"
            strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

/* ── the groundhog — trundling menace, napping angel ────────────── */

export function GroundhogSprite({ size = 64, napping = false }: {
  size?: number; napping?: boolean;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <ellipse cx="32" cy="57" rx="21" ry="4" fill="rgba(40,28,16,0.2)" />
      {napping ? (
        <>
          {/* curled into a brown bun, ear folded, eye a closed line */}
          <ellipse cx="32" cy="46" rx="19" ry="12.5" fill="#8A6844" />
          <ellipse cx="30" cy="49" rx="14" ry="8" fill="#A07E52" opacity="0.6" />
          <circle cx="45" cy="42" r="7.6" fill="#8A6844" />
          <path d="M 46.5 40.5 q 1.8 1 3.4 0" stroke="#3A2C1C" strokeWidth="1.4"
                fill="none" strokeLinecap="round" />
          <circle cx="49" cy="36.6" r="2" fill="#6E5236" />
          {/* slow breath bubbles, drawn not typed */}
          <circle cx="55" cy="30" r="1.6" fill="#C8B89C" opacity="0.8" />
          <circle cx="58" cy="25" r="2.2" fill="#C8B89C" opacity="0.55" />
        </>
      ) : (
        <>
          {/* all fours, nose down and forward — a professional forager */}
          <ellipse cx="30" cy="43" rx="17" ry="12" fill="#8A6844" />
          <ellipse cx="28" cy="47" rx="12" ry="7" fill="#A07E52" opacity="0.55" />
          {/* legs */}
          <rect x="18" y="50" width="5.4" height="7" rx="2.4" fill="#6E5236" />
          <rect x="36" y="50" width="5.4" height="7" rx="2.4" fill="#6E5236" />
          {/* head */}
          <circle cx="47" cy="36" r="9.5" fill="#8A6844" />
          <ellipse cx="50" cy="40" rx="5.4" ry="4" fill="#C8B89C" />
          <circle cx="49.5" cy="33.5" r="1.8" fill="#2E2418" />
          <circle cx="50.1" cy="32.9" r="0.5" fill="#FFF" />
          <circle cx="43" cy="28.5" r="2.6" fill="#6E5236" />
          {/* the famous teeth */}
          <rect x="50.4" y="42.2" width="2.1" height="3" rx="0.6" fill="#FFF8EC" />
          <rect x="52.7" y="42.2" width="2.1" height="3" rx="0.6" fill="#FFF8EC" />
          <ellipse cx="54" cy="38.5" rx="1.6" ry="1.2" fill="#3A2C1C" />
        </>
      )}
    </svg>
  );
}

/* ── the veggies that grow the numbers ──────────────────────────── */

export type VeggieKind = 'carrot' | 'beet' | 'cabbage' | 'turnip' | 'squash';
export const VEGGIE_KINDS: VeggieKind[] = ['carrot', 'beet', 'cabbage', 'turnip', 'squash'];

/**
 * One tile veggie, drawn to hold a face label on its body. `bitten`
 * shows the bunny's regretted bite.
 */
export function VeggieSprite({ kind, bitten = false }: {
  kind: VeggieKind; bitten?: boolean;
}) {
  // Drawn in a 100×86 box; the tile places the face text at (50,52).
  //
  // The bite is a MASK, not paint: circles cut real material out of
  // the veggie so whatever grows behind it shows through. Painted
  // "bite" circles read as stickers the moment the background is not
  // the same color — the proof render caught exactly that.
  const maskId = React.useId();
  const leafy = (cx: number, cy: number, tint: string) => (
    <g>
      <path d={`M ${cx - 8} ${cy} Q ${cx - 12} ${cy - 14} ${cx - 3} ${cy - 10} Z`} fill={tint} />
      <path d={`M ${cx} ${cy} Q ${cx} ${cy - 17} ${cx + 6} ${cy - 9} Z`} fill={tint} />
      <path d={`M ${cx + 7} ${cy} Q ${cx + 13} ${cy - 12} ${cx + 3} ${cy - 9} Z`} fill={tint} />
    </g>
  );
  return (
    <g aria-hidden>
      {bitten && (
        <mask id={maskId}>
          <rect x="-10" y="-10" width="120" height="106" fill="#FFF" />
          <circle cx="74" cy="36" r="13" fill="#000" />
          <circle cx="67" cy="27" r="5" fill="#000" />
          <circle cx="79" cy="45" r="5" fill="#000" />
        </mask>
      )}
      <ellipse cx="50" cy="80" rx="26" ry="4.5" fill="rgba(40,28,16,0.16)" />
      <g mask={bitten ? `url(#${maskId})` : undefined}>
      {kind === 'carrot' && (
        <g>
          {leafy(50, 26, '#5F7F4A')}
          <path d="M 30 30 Q 50 22 70 30 Q 66 62 50 78 Q 34 62 30 30 Z" fill="#E8913A" />
          <path d="M 36 40 h 26 M 38 50 h 22 M 42 60 h 15" stroke="#C97428"
                strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
        </g>
      )}
      {kind === 'beet' && (
        <g>
          {leafy(50, 26, '#6E8C52')}
          <circle cx="50" cy="52" r="26" fill="#A2385A" />
          <path d="M 50 78 q 1.4 6 -1 8" stroke="#7E2A46" strokeWidth="2"
                fill="none" strokeLinecap="round" />
          <path d="M 34 44 q 16 -8 32 0" stroke="#C05578" strokeWidth="2"
                fill="none" opacity="0.55" />
        </g>
      )}
      {kind === 'cabbage' && (
        <g>
          <circle cx="50" cy="52" r="27" fill="#8FAE6A" />
          <path d="M 26 50 Q 34 28 50 26 Q 42 40 40 56 Z" fill="#A8C284" />
          <path d="M 74 50 Q 66 28 50 26 Q 58 40 60 56 Z" fill="#A8C284" />
          <path d="M 50 26 Q 46 44 50 78" stroke="#6E8C52" strokeWidth="1.6"
                fill="none" opacity="0.7" />
        </g>
      )}
      {kind === 'turnip' && (
        <g>
          {leafy(50, 24, '#5F7F4A')}
          <path d="M 27 42 Q 27 24 50 24 Q 73 24 73 42 Q 73 64 50 78 Q 27 64 27 42 Z"
                fill="#EFE3EE" />
          <path d="M 30 56 Q 50 70 70 56 L 70 46 Q 50 66 30 46 Z" fill="#B187B8" opacity="0.75" />
          <path d="M 50 78 q 1 5 -0.8 7" stroke="#8E6B96" strokeWidth="2"
                fill="none" strokeLinecap="round" />
        </g>
      )}
      {kind === 'squash' && (
        <g>
          <path d="M 47 28 q -1 -7 4 -9 q 3.4 2 2 9" fill="#7A5A34" />
          <ellipse cx="50" cy="56" rx="27" ry="23" fill="#E8B93A" />
          <path d="M 34 38 Q 50 30 66 38 M 30 50 h 40 M 34 64 Q 50 72 66 64"
                stroke="#C79A28" strokeWidth="1.6" fill="none" opacity="0.6" />
        </g>
      )}
      </g>
    </g>
  );
}

/** Nibbled soil where a veggie used to grow. */
export function SoilMound() {
  return (
    <g aria-hidden>
      <ellipse cx="50" cy="72" rx="24" ry="8" fill="#7A5A38" />
      <ellipse cx="50" cy="69" rx="19" ry="5.4" fill="#8E6C46" />
      <circle cx="40" cy="70" r="1.6" fill="#5E432A" />
      <circle cx="56" cy="72.6" r="1.3" fill="#5E432A" />
      <circle cx="49" cy="74" r="1.1" fill="#5E432A" />
    </g>
  );
}

/* ── the prize shelf: county-fair champions ─────────────────────── */

export function PrizeVeggieArt({ code, size = 56 }: { code: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden>
      <ellipse cx="36" cy="64" rx="24" ry="4.4" fill="rgba(40,28,16,0.2)" />
      {code === 'enormous_pumpkin' && (
        <g>
          <path d="M 33 16 q -2 -8 5 -10 q 4 3 2 10" fill="#6E8C52" />
          <ellipse cx="36" cy="40" rx="30" ry="24" fill="#E07B2A" />
          <path d="M 36 17 Q 30 40 36 63 M 22 20 Q 12 40 22 60 M 50 20 Q 60 40 50 60"
                stroke="#B85E1C" strokeWidth="2.2" fill="none" opacity="0.7" />
        </g>
      )}
      {code === 'blue_ribbon_zucchini' && (
        <g>
          <path d="M 12 50 Q 10 30 24 20 Q 56 4 62 16 Q 66 24 40 40 Q 20 52 12 50 Z"
                fill="#4E7038" />
          <path d="M 20 42 Q 36 30 54 18" stroke="#6E9052" strokeWidth="2.4"
                fill="none" opacity="0.8" />
          {/* the ribbon, drawn */}
          <circle cx="22" cy="52" r="8" fill="#4A7BA6" />
          <circle cx="22" cy="52" r="4.6" fill="#7FA8CC" />
          <path d="M 18 58 l -3 9 l 5 -3 M 26 58 l 3 9 l -5 -3" fill="#4A7BA6" />
        </g>
      )}
      {code === 'very_long_carrot' && (
        <g>
          <path d="M 30 8 q -8 -4 -12 2 M 36 8 q 0 -8 6 -8 M 42 9 q 8 -5 11 1"
                stroke="#5F7F4A" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <path d="M 28 12 Q 36 8 44 12 Q 42 44 37 64 Q 33 44 28 12 Z" fill="#E8913A" />
          <path d="M 31 22 h 10 M 32 32 h 8 M 33.5 44 h 5.4 M 35 54 h 3.4"
                stroke="#C97428" strokeWidth="1.6" strokeLinecap="round" opacity="0.65" />
        </g>
      )}
      {code === 'cabbage_of_unusual_size' && (
        <g>
          <circle cx="36" cy="40" r="27" fill="#8FAE6A" />
          <path d="M 12 38 Q 20 14 36 13 Q 27 28 26 46 Z" fill="#A8C284" />
          <path d="M 60 38 Q 52 14 36 13 Q 45 28 46 46 Z" fill="#A8C284" />
          <path d="M 36 13 Q 32 36 36 66" stroke="#6E8C52" strokeWidth="1.8"
                fill="none" opacity="0.7" />
          {/* a tiny measuring stick leaning on it, for scale */}
          <rect x="61" y="30" width="3.4" height="34" rx="1.4" fill="#C9A46A"
                transform="rotate(9 62 47)" />
          <path d="M 61.5 36 h 3 M 61.9 42 h 3 M 62.3 48 h 3 M 62.7 54 h 3"
                stroke="#7A5A34" strokeWidth="1" transform="rotate(9 62 47)" />
        </g>
      )}
      {code === 'proud_tomato' && (
        <g>
          <path d="M 32 14 q -6 -3 -8 1 M 36 13 q 0 -6 4 -7 M 41 14 q 6 -3 8 1"
                stroke="#5F7F4A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="36" cy="42" rx="25" ry="22" fill="#D64B3E" />
          <path d="M 20 32 q 8 -8 16 -6" stroke="#F0837A" strokeWidth="3"
                fill="none" strokeLinecap="round" opacity="0.8" />
        </g>
      )}
      {code === 'curly_kale' && (
        <g>
          {/* a fat rosette of ruffled leaves in a clay pot of earth —
              a bouquet of curls, not a branch */}
          <path d="M 22 52 h 28 l -3 12 h -22 Z" fill="#B08A56" />
          <path d="M 36 50 Q 10 52 8 36 Q 18 40 16 26 Q 26 34 26 18 Q 33 30 36 10
                   Q 40 30 46 18 Q 47 34 56 26 Q 54 40 64 36 Q 62 52 36 50 Z"
                fill="#5E8A46" />
          <path d="M 16 38 q 8 6 16 4 M 30 22 q 4 10 12 8 M 44 26 q 2 10 10 10"
                stroke="#7FAE62" strokeWidth="2.4" fill="none"
                strokeLinecap="round" opacity="0.85" />
          <path d="M 12 34 q 3 5 8 5 M 52 30 q 0 6 6 7" stroke="#4E7038"
                strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
        </g>
      )}
      {code === 'gentle_squash' && (
        <g>
          <path d="M 40 12 q 0 -7 5 -8 q 3 2.4 1.6 8" fill="#7A5A34" />
          <path d="M 42 14 Q 24 16 18 36 Q 12 58 36 62 Q 62 58 56 34 Q 52 18 42 14 Z"
                fill="#E8C05A" />
          <path d="M 30 24 Q 24 40 30 56 M 44 20 Q 52 38 46 58" stroke="#C79A28"
                strokeWidth="1.8" fill="none" opacity="0.6" />
          {/* closed kindly eyes */}
          <path d="M 28 38 q 2.6 2 5 0 M 40 38 q 2.6 2 5 0" stroke="#7A5A34"
                strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      )}
      {code === 'twin_radishes' && (
        <g>
          {/* round globes with pale root tips — radishes, not hearts */}
          <path d="M 22 22 q -3 -10 3 -13 M 27 21 q 1 -9 6 -10 M 46 21 q -1 -9 -6 -10
                   M 50 22 q 3 -10 -3 -13" stroke="#5F7F4A" strokeWidth="3"
                fill="none" strokeLinecap="round" />
          <circle cx="25" cy="36" r="14" fill="#D6486A" />
          <circle cx="47" cy="38" r="14" fill="#E06A86" />
          {/* the white bottoms, where the root begins */}
          <path d="M 14 42 Q 25 54 36 42 Q 32 50 25 50 Q 18 50 14 42 Z" fill="#F6E6EA" />
          <path d="M 36 44 Q 47 56 58 44 Q 54 52 47 52 Q 40 52 36 44 Z" fill="#F6E6EA" />
          <path d="M 25 50 q 0 6 -2 8 M 47 52 q 0 6 2 8" stroke="#F6E6EA"
                strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M 18 30 q 5 -4 10 -2 M 41 32 q 5 -4 10 -2" stroke="#FFF"
                strokeWidth="1.6" fill="none" opacity="0.55" />
        </g>
      )}
    </svg>
  );
}

/* ── the barn itself, and its furniture ─────────────────────────── */

export function BarnHeader({ width = 720 }: { width?: number }) {
  // The gable end of a red barn with white trim, a string of little
  // flags, and the crow on the weathervane — his new perch, in view
  // of the multiples he keeps pictures for.
  return (
    <svg viewBox="0 -58 720 248" style={{ width: '100%', maxWidth: width }} aria-hidden>
      <rect x="0" y="168" width="720" height="22" fill="#8E6C46" />
      <ellipse cx="360" cy="176" rx="330" ry="9" fill="#7A5A38" />
      {/* gable */}
      <path d="M 120 168 V 86 L 360 20 L 600 86 V 168 Z" fill="#A6402E" />
      <path d="M 104 92 L 360 18 L 616 92 L 610 76 L 360 4 L 110 76 Z" fill="#7A2E20" />
      {/* trim + hayloft door */}
      <path d="M 120 86 L 360 20 L 600 86" stroke="#F2E9D8" strokeWidth="5" fill="none" />
      <rect x="330" y="52" width="60" height="48" rx="4" fill="#5E2A1E" />
      <path d="M 330 52 L 390 100 M 390 52 L 330 100" stroke="#F2E9D8" strokeWidth="4" />
      <rect x="330" y="52" width="60" height="48" rx="4" fill="none"
            stroke="#F2E9D8" strokeWidth="4" />
      {/* big doors below, swung open */}
      <rect x="286" y="108" width="66" height="60" fill="#5E2A1E" />
      <rect x="368" y="108" width="66" height="60" fill="#5E2A1E" />
      <path d="M 286 108 L 352 168 M 352 108 L 286 168 M 368 108 L 434 168 M 434 108 L 368 168"
            stroke="#8E4432" strokeWidth="3.4" />
      <rect x="352" y="104" width="16" height="64" fill="#3A1A12" />
      {/* flag string across the gable — a gentle droop that stays
          clear of the doors */}
      <path d="M 136 88 Q 360 106 584 88" stroke="#C9A227" strokeWidth="2" fill="none" />
      {[0, 1, 2, 3, 4, 5, 6].map(i => {
        const t = (i + 1) / 8;
        const x = 136 + 448 * t;
        const y = 88 + 17 * Math.sin(Math.PI * t);
        const tint = ['#C94C3E', '#4A7BA6', '#E8B93A', '#5A8C4A'][i % 4];
        return <path key={i} d={`M ${x - 8} ${y} h 16 l -8 14 Z`} fill={tint} />;
      })}
      {/* weathervane on the roof peak, and the crow upon it — his
          perch above the multiples he keeps pictures for */}
      <g transform="translate(360, 12)">
        <rect x="-2" y="-14" width="4" height="22" fill="#4A4034" />
        <path d="M -26 -14 h 52 M 0 -14 v -8" stroke="#4A4034" strokeWidth="3" />
        <path d="M -26 -18 l -8 4 l 8 4 Z M 26 -18 l 8 4 l -8 4 Z" fill="#4A4034" />
        {/* the crow: glossy black, tail tipped up, one bright eye */}
        <g transform="translate(6, -40)">
          <ellipse cx="0" cy="10" rx="11" ry="7.4" fill="#241F26" />
          <path d="M -9 6 L -22 -2 L -8 2 Z" fill="#241F26" />
          <circle cx="9" cy="2" r="5.6" fill="#241F26" />
          <path d="M 13.6 1 L 22 3 L 13.6 5 Z" fill="#8A7A5E" />
          <circle cx="10.6" cy="0.8" r="1.4" fill="#E8E4DA" />
          <path d="M -2 17 l 2 5 M 3 17 l 2 5" stroke="#241F26" strokeWidth="1.8"
                strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

/** A wooden rule crate. The sprout tag marks the stretch crate. */
export function CrateArt({ stretch = false }: { stretch?: boolean }) {
  return (
    <svg viewBox="0 0 96 72" width="72" height="54" aria-hidden>
      <ellipse cx="48" cy="66" rx="38" ry="4.4" fill="rgba(40,28,16,0.16)" />
      <rect x="10" y="18" width="76" height="46" rx="3" fill="#B08A56" />
      <rect x="10" y="18" width="76" height="10" fill="#C9A46A" />
      <rect x="10" y="54" width="76" height="10" fill="#96703F" />
      <path d="M 14 18 V 64 M 82 18 V 64" stroke="#7A5A34" strokeWidth="3" />
      <path d="M 10 40 h 76" stroke="#7A5A34" strokeWidth="2" opacity="0.6" />
      {/* peeking veggie tops */}
      <path d="M 30 18 q -3 -8 3 -10 q 4 2 2 10 M 48 18 q 0 -9 5 -9 q 3 3 0 9
               M 64 18 q 3 -7 -2 -9 q -4 1 -3 9" fill="#5F7F4A" />
      {stretch && (
        <g transform="translate(74, 8)">
          <circle cx="0" cy="0" r="11" fill="#F6EEDF" stroke="#5A8C4A" strokeWidth="2" />
          {/* the sprout, drawn: two leaves on a bent stem */}
          <path d="M 0 6 V -1" stroke="#5A8C4A" strokeWidth="2" strokeLinecap="round" />
          <path d="M 0 -1 Q -7 -3 -6 -9 Q 0 -8 0 -1 Z" fill="#5A8C4A" />
          <path d="M 0 -2 Q 6 -4 6 -9 Q 1 -9 0 -2 Z" fill="#7FAE62" />
        </g>
      )}
    </svg>
  );
}

/** A small drawn barn for the destination sheet row — no emoji. */
export function BarnRowIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M 4 28 V 14 L 16 5 L 28 14 V 28 Z" fill="#A6402E" />
      <path d="M 2 15 L 16 4 L 30 15 L 28.6 12 L 16 2 L 3.4 12 Z" fill="#7A2E20" />
      <rect x="12" y="18" width="8" height="10" fill="#5E2A1E" />
      <path d="M 12 18 L 20 28 M 20 18 L 12 28" stroke="#8E4432" strokeWidth="1.4" />
      <rect x="14.6" y="9" width="2.8" height="4" fill="#F2E9D8" />
      <path d="M 4 28 h 24" stroke="#7A5A38" strokeWidth="2" />
    </svg>
  );
}
