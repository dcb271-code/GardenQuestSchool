'use client';

import { motion } from 'framer-motion';

/**
 * Shared fraction visualisation — used by both FractionIdentify and
 * FractionCompareVisual. Two presentation styles:
 *
 *   shape='pie' — circle split into `denominator` equal sectors,
 *                  the first `numerator` of them filled with the
 *                  shaded color. Reads "the part vs the whole" the
 *                  way a clock or a pizza does.
 *   shape='bar' — horizontal rectangle split into `denominator`
 *                  equal columns, the first `numerator` shaded.
 *                  Reads "the part vs the whole" the way a number
 *                  line or a chocolate bar does.
 *
 * Both keep the unshaded parts visible (as outlines) so the child
 * sees the WHOLE — that's the whole point of fractions.
 */
export interface FractionPieProps {
  numerator: number;
  denominator: number;
  shape: 'pie' | 'bar';
  size?: number;       // overall side length in px
  shaded?: string;     // hex color for filled parts
  outline?: string;    // hex color for slice borders + unfilled
  unfilledFill?: string;
  label?: string;      // optional small label drawn under the shape (e.g. "3/4")
  animate?: boolean;
}

const DEFAULT_SHADED = '#E8A87C';        // warm terracotta
const DEFAULT_OUTLINE = '#5A3B1F';
const DEFAULT_UNFILLED = '#FDF6E8';

export default function FractionPie({
  numerator, denominator, shape,
  size = 180,
  shaded = DEFAULT_SHADED,
  outline = DEFAULT_OUTLINE,
  unfilledFill = DEFAULT_UNFILLED,
  label,
  animate = true,
}: FractionPieProps) {
  const n = Math.max(0, Math.min(numerator, denominator));
  const d = Math.max(1, denominator);

  if (shape === 'bar') {
    return (
      <FractionBar
        numerator={n} denominator={d}
        size={size}
        shaded={shaded} outline={outline} unfilledFill={unfilledFill}
        label={label} animate={animate}
      />
    );
  }
  return (
    <FractionPieCircle
      numerator={n} denominator={d}
      size={size}
      shaded={shaded} outline={outline} unfilledFill={unfilledFill}
      label={label} animate={animate}
    />
  );
}

function FractionPieCircle({
  numerator, denominator, size, shaded, outline, unfilledFill, label, animate,
}: Required<Omit<FractionPieProps, 'shape' | 'label' | 'animate'>> & { label?: string; animate: boolean; shape?: never }) {
  const r = size / 2 - 6;          // leave room for stroke
  const cx = 0, cy = 0;
  const sectorPath = (i: number): string => {
    // Start at top (12 o'clock), sweep clockwise.
    const a0 = (i / denominator) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / denominator) * 2 * Math.PI - Math.PI / 2;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const largeArc = (a1 - a0) > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1} Z`;
  };
  const slices = Array.from({ length: denominator }, (_, i) => i);

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <motion.svg
        width={size} height={size}
        viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
        initial={animate ? { scale: 0.92, opacity: 0 } : undefined}
        animate={animate ? { scale: 1, opacity: 1 } : undefined}
        transition={{ duration: 0.35, ease: [0.22, 0.9, 0.34, 1] }}
        style={{ filter: 'drop-shadow(0 3px 4px rgba(60, 40, 20, 0.15))' }}
      >
        {/* Unfilled background (so the slice borders sit on a clean fill) */}
        <circle cx={0} cy={0} r={r} fill={unfilledFill} stroke={outline} strokeWidth={2.5} />
        {/* Shaded slices first */}
        {slices.slice(0, numerator).map(i => (
          <path key={`f${i}`} d={sectorPath(i)} fill={shaded} stroke={outline} strokeWidth={1.5} />
        ))}
        {/* Then dividing lines (drawn on top so they read crisp against shaded fill too) */}
        {slices.map(i => {
          const a = (i / denominator) * 2 * Math.PI - Math.PI / 2;
          const x = r * Math.cos(a);
          const y = r * Math.sin(a);
          return (
            <line key={`l${i}`}
                  x1={0} y1={0} x2={x} y2={y}
                  stroke={outline} strokeWidth={1.4} opacity={0.75} />
          );
        })}
      </motion.svg>
      {label && (
        <div
          className="font-mono text-bark text-center"
          style={{ fontWeight: 700, fontSize: 18 }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

function FractionBar({
  numerator, denominator, size, shaded, outline, unfilledFill, label, animate,
}: Required<Omit<FractionPieProps, 'shape' | 'label' | 'animate'>> & { label?: string; animate: boolean; shape?: never }) {
  // Bar: width = size, height = ~size/3.
  const w = size;
  const h = size * 0.36;
  const cellW = w / denominator;
  const cells = Array.from({ length: denominator }, (_, i) => i);
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <motion.svg
        width={w + 6} height={h + 6}
        viewBox={`${-3} ${-3} ${w + 6} ${h + 6}`}
        initial={animate ? { scale: 0.95, opacity: 0 } : undefined}
        animate={animate ? { scale: 1, opacity: 1 } : undefined}
        transition={{ duration: 0.35, ease: [0.22, 0.9, 0.34, 1] }}
        style={{ filter: 'drop-shadow(0 2px 3px rgba(60, 40, 20, 0.12))' }}
      >
        {/* Unfilled background */}
        <rect x={0} y={0} width={w} height={h} rx={6}
              fill={unfilledFill} stroke={outline} strokeWidth={2} />
        {/* Filled cells */}
        {cells.slice(0, numerator).map(i => (
          <rect key={`f${i}`}
                x={i * cellW} y={0} width={cellW} height={h}
                fill={shaded} />
        ))}
        {/* Cell dividers */}
        {cells.slice(1).map(i => (
          <line key={`d${i}`}
                x1={i * cellW} y1={0} x2={i * cellW} y2={h}
                stroke={outline} strokeWidth={1.4} opacity={0.75} />
        ))}
        {/* Outer rim drawn last for crisp edges */}
        <rect x={0} y={0} width={w} height={h} rx={6}
              fill="none" stroke={outline} strokeWidth={2} />
      </motion.svg>
      {label && (
        <div
          className="font-mono text-bark text-center"
          style={{ fontWeight: 700, fontSize: 18 }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
