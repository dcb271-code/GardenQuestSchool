'use client';

import { motion } from 'framer-motion';

/**
 * Pure analog-clock face SVG component, factored out so both
 * ClockRead (read a single clock) and ClockInterval (compare two
 * clocks side by side) can render the same artwork.
 *
 * Hands are positioned by the standard formulas:
 *   minute angle = (minute / 60) * 360
 *   hour angle   = ((hour % 12) / 12) * 360 + (minute / 60) * 30
 * (i.e. the hour hand drifts continuously between numerals as the
 *  minutes advance, which is the realistic look children see on
 *  classroom clocks.)
 */
export interface ClockFaceProps {
  hour: number;          // 1..12
  minute: number;        // 0..55
  size?: number;         // px square
  label?: string;        // optional caption shown under the clock
  animate?: boolean;
}

export default function ClockFace({
  hour, minute, size = 200, label, animate = true,
}: ClockFaceProps) {
  const r = size / 2 - 6;
  const minuteAngle = (minute / 60) * 360;
  const hourAngle = ((hour % 12) / 12) * 360 + (minute / 60) * 30;

  return (
    <div className="inline-flex flex-col items-center gap-1.5">
      <motion.svg
        width={size} height={size}
        viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
        initial={animate ? { scale: 0.92, opacity: 0 } : undefined}
        animate={animate ? { scale: 1, opacity: 1 } : undefined}
        transition={{ duration: 0.45, ease: [0.22, 0.9, 0.34, 1] }}
        style={{ filter: 'drop-shadow(0 4px 6px rgba(107, 68, 35, 0.18))' }}
      >
        {/* Outer rim */}
        <circle cx={0} cy={0} r={r} fill="#F5EBDC" stroke="#6B4423" strokeWidth={size * 0.025} />
        <circle cx={0} cy={0} r={r * 0.92} fill="#FDF6E8" stroke="#6B4423" strokeWidth={1.5} opacity={0.6} />

        {/* Minute marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const isHour = i % 5 === 0;
          const r1 = isHour ? r * 0.78 : r * 0.84;
          const r2 = r * 0.9;
          const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
          return (
            <line
              key={i}
              x1={Math.cos(a) * r1}
              y1={Math.sin(a) * r1}
              x2={Math.cos(a) * r2}
              y2={Math.sin(a) * r2}
              stroke="#6B4423"
              strokeWidth={isHour ? 2.4 : 1}
              opacity={isHour ? 0.95 : 0.55}
              strokeLinecap="round"
            />
          );
        })}

        {/* Hour numerals */}
        {Array.from({ length: 12 }).map((_, i) => {
          const num = i + 1;
          const a = (num / 12) * 2 * Math.PI - Math.PI / 2;
          const numR = r * 0.67;
          return (
            <text
              key={num}
              x={Math.cos(a) * numR}
              y={Math.sin(a) * numR + size * 0.025}
              textAnchor="middle"
              fontSize={size * 0.08}
              fontWeight={700}
              fill="#5A3B1F"
              style={{ fontFamily: 'inherit' }}
            >
              {num}
            </text>
          );
        })}

        {/* Hour hand */}
        <g transform={`rotate(${hourAngle})`}>
          <line
            x1={0} y1={size * 0.03} x2={0} y2={-r * 0.46}
            stroke="#C26B4A" strokeWidth={size * 0.03} strokeLinecap="round"
          />
        </g>
        {/* Minute hand */}
        <g transform={`rotate(${minuteAngle})`}>
          <line
            x1={0} y1={size * 0.05} x2={0} y2={-r * 0.78}
            stroke="#5A3B1F" strokeWidth={size * 0.017} strokeLinecap="round"
          />
        </g>
        {/* Pivot cap */}
        <circle cx={0} cy={0} r={size * 0.025} fill="#5A3B1F" />
        <circle cx={0} cy={0} r={size * 0.01} fill="#FFD93D" />
      </motion.svg>
      {label && (
        <div
          className="font-display italic text-[12px] tracking-[0.2em] uppercase text-bark/65"
        >
          {label}
        </div>
      )}
    </div>
  );
}
