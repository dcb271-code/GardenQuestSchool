// components/child/music/musicVisuals.tsx
//
// The three things a music lesson has to be able to draw: a keyboard,
// a staff, and a row of rhythm notes.
//
// The keyboard is deliberately drawn as garden STEPPING STONES rather
// than a glossy instrument — white river stones with dark slate stones
// set between them — so it belongs to the same world as the rest of
// the app. The 2-and-3 grouping of the dark stones is the whole point
// of the picture, so nothing is allowed to obscure it.

'use client';

import { motion } from 'framer-motion';
import {
  LETTERS, octaveKeys, midiOf, staffPosition, needsLedger,
  BEATS, type Note, type NoteValue, type Clef,
} from '@/lib/music/theory';

const INK = '#3F2614';
const STONE = '#F6F1E4';
const STONE_EDGE = '#C9BFA6';
const SLATE = '#4A4438';
const HILITE = '#FFD166';
const FOREST = '#6B8E5A';

export type KeyId = string;   // 'C4', 'C#4'

export function keyId(n: Note): KeyId {
  return `${n.letter}${n.sharp ? '#' : ''}${n.octave}`;
}

// ─── KEYBOARD ──────────────────────────────────────────────────────────

export function PianoKeyboard({
  startOctave = 4,
  octaves = 1,
  highlight = [],
  labelWhite = false,
  fingerNumbers = false,
  onTapKey,
  disabled = false,
  width = 320,
}: {
  startOctave?: number;
  octaves?: number;
  highlight?: KeyId[];
  labelWhite?: boolean;
  fingerNumbers?: boolean;
  onTapKey?: (note: Note, id: KeyId) => void;
  disabled?: boolean;
  width?: number;
}) {
  const whitePerOctave = 7;
  const totalWhite = whitePerOctave * octaves;
  const W = 100 * octaves;              // viewBox units
  const H = 62;
  const wKeyW = W / totalWhite;
  const bKeyW = wKeyW * 0.58;
  const hi = new Set(highlight);

  const whites: Array<{ note: Note; x: number }> = [];
  const blacks: Array<{ note: Note; x: number }> = [];
  for (let o = 0; o < octaves; o++) {
    octaveKeys(startOctave + o).forEach((k, i) => {
      const x = (o * whitePerOctave + i) * wKeyW;
      whites.push({ note: k.note, x });
      if (k.blackAfter) blacks.push({ note: k.blackAfter, x: x + wKeyW - bKeyW / 2 });
    });
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={width} height={(width / W) * H}
         className="mx-auto select-none" style={{ touchAction: 'manipulation' }}>
      {/* soft earth the stones are set into */}
      <rect x={0} y={0} width={W} height={H} rx={3} fill="#8FA37E" opacity={0.25} />

      {whites.map(({ note, x }) => {
        const id = keyId(note);
        const lit = hi.has(id);
        return (
          <g key={id}
             onClick={() => !disabled && onTapKey?.(note, id)}
             style={{ cursor: disabled ? 'default' : 'pointer' }}>
            <rect x={x + 0.7} y={2} width={wKeyW - 1.4} height={H - 5} rx={2.4}
                  fill={lit ? HILITE : STONE} stroke={lit ? '#B08A3E' : STONE_EDGE}
                  strokeWidth={lit ? 1.4 : 0.9} />
            {/* a pale speckle so it reads as stone, not plastic */}
            <ellipse cx={x + wKeyW * 0.35} cy={H * 0.72} rx={wKeyW * 0.16} ry={1.4}
                     fill="#E3DAC6" opacity={lit ? 0.35 : 0.8} />
            {labelWhite && (
              <text x={x + wKeyW / 2} y={H - 7} textAnchor="middle" fontSize={6}
                    fontWeight={700} fill={INK}>{note.letter}</text>
            )}
            {fingerNumbers && LETTERS.indexOf(note.letter) < 5 && note.octave === startOctave && (
              <circle cx={x + wKeyW / 2} cy={H - 17} r={4.6} fill={FOREST} opacity={0.9} />
            )}
            {fingerNumbers && LETTERS.indexOf(note.letter) < 5 && note.octave === startOctave && (
              <text x={x + wKeyW / 2} y={H - 15} textAnchor="middle" fontSize={6}
                    fontWeight={800} fill="#FFFDF2">
                {LETTERS.indexOf(note.letter) + 1}
              </text>
            )}
          </g>
        );
      })}

      {blacks.map(({ note, x }) => {
        const id = keyId(note);
        const lit = hi.has(id);
        return (
          <g key={id}
             onClick={() => !disabled && onTapKey?.(note, id)}
             style={{ cursor: disabled ? 'default' : 'pointer' }}>
            <rect x={x} y={2} width={bKeyW} height={H * 0.62} rx={2}
                  fill={lit ? HILITE : SLATE} stroke={lit ? '#B08A3E' : '#2E2A22'}
                  strokeWidth={1} />
            <rect x={x + bKeyW * 0.22} y={5} width={bKeyW * 0.3} height={H * 0.3} rx={1}
                  fill="#6E675A" opacity={lit ? 0.2 : 0.55} />
          </g>
        );
      })}
    </svg>
  );
}

// ─── STAFF ─────────────────────────────────────────────────────────────

export function Staff({
  notes = [],
  clef = 'treble',
  caption,
  width = 320,
  highlightIndex,
}: {
  notes?: Note[];
  clef?: Clef;
  caption?: string;
  width?: number;
  highlightIndex?: number;
}) {
  const W = 200, H = 96;
  const lineGap = 8;                 // one space
  const bottomY = 62;                // y of the bottom line
  const yOf = (n: Note) => bottomY - staffPosition(n, clef) * (lineGap / 2);
  const firstX = 66;
  const stepX = notes.length > 1 ? Math.min(34, (W - firstX - 16) / notes.length) : 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={width} height={(width / W) * H} className="mx-auto">
      <rect x={0} y={0} width={W} height={H} rx={4} fill="#FFFDF6" stroke="#E4DCC8" strokeWidth={1} />

      {[0, 1, 2, 3, 4].map(i => (
        <line key={i} x1={10} y1={bottomY - i * lineGap} x2={W - 10} y2={bottomY - i * lineGap}
              stroke="#B9AE93" strokeWidth={1} />
      ))}

      {/* clef — drawn simply but recognisably */}
      {clef === 'treble' ? (
        <text x={26} y={bottomY + 2} textAnchor="middle" fontSize={44} fill={INK}
              style={{ fontFamily: 'serif' }}>𝄞</text>
      ) : (
        <text x={26} y={bottomY - 14} textAnchor="middle" fontSize={34} fill={INK}
              style={{ fontFamily: 'serif' }}>𝄢</text>
      )}

      {notes.map((n, i) => {
        const cx = firstX + i * stepX;
        const cy = yOf(n);
        const lit = highlightIndex === i;
        const stemUp = staffPosition(n, clef) < 4;
        return (
          <g key={i}>
            {/* ledger lines above/below as needed */}
            {needsLedger(n, clef) && (() => {
              const p = staffPosition(n, clef);
              const lines: number[] = [];
              if (p < 0) for (let k = -2; k >= p; k -= 2) lines.push(k);
              if (p > 8) for (let k = 10; k <= p; k += 2) lines.push(k);
              return lines.map(k => (
                <line key={k} x1={cx - 9} y1={bottomY - k * (lineGap / 2)}
                      x2={cx + 9} y2={bottomY - k * (lineGap / 2)}
                      stroke="#B9AE93" strokeWidth={1} />
              ));
            })()}
            <ellipse cx={cx} cy={cy} rx={5.2} ry={3.9} fill={lit ? HILITE : INK}
                     stroke={lit ? '#B08A3E' : 'none'} strokeWidth={1.2}
                     transform={`rotate(-18 ${cx} ${cy})`} />
            <line
              x1={stemUp ? cx + 5 : cx - 5} y1={stemUp ? cy - 1 : cy + 1}
              x2={stemUp ? cx + 5 : cx - 5} y2={stemUp ? cy - 26 : cy + 26}
              stroke={INK} strokeWidth={1.4} strokeLinecap="round"
            />
          </g>
        );
      })}

      {caption && (
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={9} fontStyle="italic"
              fill="#6b4423">{caption}</text>
      )}
    </svg>
  );
}

// ─── RHYTHM ────────────────────────────────────────────────────────────

export function RhythmStrip({
  pattern, width = 320, activeIndex, showCounts = true,
}: {
  pattern: NoteValue[];
  width?: number;
  activeIndex?: number;
  showCounts?: boolean;
}) {
  const W = 200, H = 64;
  const totalBeats = pattern.reduce((s, v) => s + BEATS[v], 0) || 4;
  const usable = W - 24;
  let x = 12;
  const glyphs = pattern.map((v, i) => {
    const w = (BEATS[v] / totalBeats) * usable;
    const cx = x + w / 2;
    x += w;
    return { v, cx, w, i };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={width} height={(width / W) * H} className="mx-auto">
      <rect x={0} y={0} width={W} height={H} rx={4} fill="#FFFDF6" stroke="#E4DCC8" strokeWidth={1} />
      <line x1={10} y1={34} x2={W - 10} y2={34} stroke="#D8CDB8" strokeWidth={1} />

      {glyphs.map(({ v, cx, i }) => {
        const active = activeIndex === i;
        const hollow = v === 'whole' || v === 'half';
        return (
          <g key={i}>
            <motion.g animate={active ? { y: [0, -4, 0] } : { y: 0 }} transition={{ duration: 0.25 }}>
              <ellipse cx={cx} cy={34} rx={5.4} ry={4}
                       fill={hollow ? (active ? HILITE : '#FFFDF6') : (active ? HILITE : INK)}
                       stroke={INK} strokeWidth={1.6}
                       transform={`rotate(-18 ${cx} 34)`} />
              {v !== 'whole' && (
                <line x1={cx + 5} y1={33} x2={cx + 5} y2={12} stroke={INK} strokeWidth={1.5} strokeLinecap="round" />
              )}
              {v === 'eighth' && (
                <path d={`M ${cx + 5} 12 q 6 4 4 11`} stroke={INK} strokeWidth={1.5} fill="none" strokeLinecap="round" />
              )}
            </motion.g>
            {showCounts && (
              <text x={cx} y={54} textAnchor="middle" fontSize={8} fill="#6b4423">
                {BEATS[v]}
              </text>
            )}
          </g>
        );
      })}
      {showCounts && (
        <text x={W - 12} y={12} textAnchor="end" fontSize={8} fontStyle="italic" fill="#95876a">
          {totalBeats} beats
        </text>
      )}
    </svg>
  );
}

/** The right-hand C-position finger map, for the teaching page. */
export function FingerMap({ width = 320 }: { width?: number }) {
  return (
    <div className="space-y-1">
      <PianoKeyboard octaves={1} labelWhite fingerNumbers width={width}
                     highlight={['C4', 'D4', 'E4', 'F4', 'G4']} disabled />
      <div className="text-center font-display italic text-[12px] text-bark/60">
        thumb 1 on C · 2 on D · 3 on E · 4 on F · 5 on G
      </div>
    </div>
  );
}
