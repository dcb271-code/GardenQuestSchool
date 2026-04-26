'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { CoinSumContent, CoinSumResponse, CoinKind } from '@/lib/packs/math/types';

interface CoinSpec {
  cents: number;
  label: string;        // P / N / D / Q for the front face
  fullName: string;
  body: string;         // hex fill
  rim: string;          // hex stroke
  inner: string;        // inner highlight ring
  text: string;         // text + label color
  radius: number;       // visual radius (px in SVG)
  // The detail glyph rendered on the heads side, US-coin-ish:
  //   penny (Lincoln profile) — silhouette of a head
  //   nickel (Jefferson)
  //   dime (Roosevelt)
  //   quarter (Washington)
  // We do simple stylized silhouettes in SVG, not real likenesses.
  silhouette: 'small' | 'medium' | 'large';
}

const COIN_SPECS: Record<CoinKind, CoinSpec> = {
  penny:   { cents: 1,  label: '1¢',  fullName: 'penny',
             body: '#C57F4D', rim: '#8C4A22', inner: '#D89A6A', text: '#3A1F0E',
             radius: 26, silhouette: 'small' },
  nickel:  { cents: 5,  label: '5¢',  fullName: 'nickel',
             body: '#BFC2C8', rim: '#7A7E84', inner: '#D3D6DB', text: '#2A2D33',
             radius: 30, silhouette: 'medium' },
  dime:    { cents: 10, label: '10¢', fullName: 'dime',
             body: '#C9CCD2', rim: '#7A7E84', inner: '#DEE0E5', text: '#2A2D33',
             radius: 22, silhouette: 'small' },
  quarter: { cents: 25, label: '25¢', fullName: 'quarter',
             body: '#C2C5CB', rim: '#6A6E74', inner: '#D6D9DE', text: '#1F2228',
             radius: 34, silhouette: 'large' },
};

/**
 * Show a row (or two) of US coins drawn as styled SVG circles with a
 * cents label and a tiny profile silhouette so each coin reads as a
 * distinct kind. Ask the child for the total.
 *
 * For accessibility: each coin has an aria-label, e.g. "nickel — 5
 * cents". The choices are a normal multiple-choice picker.
 */
export default function CoinSum({
  content, onSubmit,
}: {
  content: CoinSumContent;
  onSubmit: (r: CoinSumResponse) => void;
  retries: number;
}) {
  const orderedChoices = useMemo(
    () => content.choices.slice().sort((a, b) => a - b),  // sort low→high so layout is stable
    [content.choices],
  );

  // Layout the coins horizontally into rows of up to 6 so a big pile
  // of pennies doesn't overflow on iPad portrait.
  const rows = useMemo(() => {
    const out: CoinKind[][] = [];
    const ROW_LEN = 6;
    for (let i = 0; i < content.coins.length; i += ROW_LEN) {
      out.push(content.coins.slice(i, i + ROW_LEN));
    }
    return out;
  }, [content.coins]);

  return (
    <div className="space-y-5 py-2">
      <div className="text-center font-display text-[19px] text-bark bg-cream/60 p-3 rounded-2xl border-2 border-ochre/40">
        {content.promptText}
      </div>

      {/* Coin tray — soft shadowed cream surface */}
      <div className="bg-cream/80 border-4 border-ochre/40 rounded-3xl p-5 shadow-sm flex flex-col items-center gap-3">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center justify-center gap-3 flex-wrap">
            {row.map((kind, i) => (
              <CoinSvg
                key={`${rowIdx}-${i}`}
                spec={COIN_SPECS[kind]}
                index={rowIdx * 6 + i}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Choices — sorted ascending so they read like a number line */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } } }}
      >
        {orderedChoices.map(c => (
          <motion.button
            key={c}
            onClick={() => onSubmit({ chosen: c })}
            className="bg-white hover:bg-forest/15 active:bg-forest/30 border-4 border-forest rounded-2xl py-5 font-display"
            style={{ touchAction: 'manipulation', minHeight: 60, fontSize: 28, fontWeight: 700, color: '#2D4A20' }}
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0 },
            }}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
          >
            {c}¢
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

function CoinSvg({ spec, index }: { spec: CoinSpec; index: number }) {
  const r = spec.radius;
  const size = (r + 4) * 2;
  return (
    <motion.svg
      width={size} height={size}
      viewBox={`${-r - 4} ${-r - 4} ${size} ${size}`}
      role="img"
      aria-label={`${spec.fullName} — ${spec.cents} cents`}
      initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 0.9, 0.34, 1] }}
      style={{ filter: 'drop-shadow(0 2px 3px rgba(60, 40, 20, 0.35))' }}
    >
      {/* Outer rim */}
      <circle cx={0} cy={0} r={r} fill={spec.rim} />
      {/* Coin body */}
      <circle cx={0} cy={0} r={r - 1.5} fill={spec.body} />
      {/* Inner ring */}
      <circle cx={0} cy={0} r={r - 4.5} fill="none" stroke={spec.inner} strokeWidth={1} opacity={0.6} />

      {/* Stylized profile silhouette — facing right */}
      <g transform={`translate(${-r * 0.18}, ${r * 0.04})`}>
        <ellipse
          cx={0} cy={-r * 0.12} rx={r * 0.22} ry={r * 0.28}
          fill={spec.text} opacity={0.7}
        />
        {/* "shoulders" */}
        <path
          d={`M ${-r * 0.32} ${r * 0.42} Q 0 ${r * 0.14} ${r * 0.32} ${r * 0.42} L ${r * 0.32} ${r * 0.55} L ${-r * 0.32} ${r * 0.55} Z`}
          fill={spec.text} opacity={0.7}
        />
      </g>

      {/* Label (¢) on the right edge so it doesn't overlap the silhouette */}
      <text
        x={r * 0.55}
        y={r * 0.05}
        textAnchor="middle"
        fontSize={r * 0.42}
        fontWeight={700}
        fill={spec.text}
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
      >
        {spec.label}
      </text>
    </motion.svg>
  );
}
