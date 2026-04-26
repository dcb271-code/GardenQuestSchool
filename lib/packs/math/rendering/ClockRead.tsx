'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ClockReadContent, ClockReadResponse } from '@/lib/packs/math/types';

/**
 * Hand-drawn-style analog clock face. Twelve hour numerals around a
 * cream face, sixty minute marks (12 emphasised), short stubby hour
 * hand and longer minute hand in the project's terracotta palette.
 *
 * Hands are positioned by the standard formulas:
 *   minute angle = (minute / 60) * 360
 *   hour angle   = ((hour % 12) / 12) * 360 + (minute / 60) * 30
 * (i.e. the hour hand drifts continuously between numerals as the
 *  minutes advance, which is the realistic look children see on
 *  classroom clocks.)
 *
 * The choices are rendered in randomized order so the right answer
 * isn't always in the same slot.
 */
export default function ClockRead({
  content, onSubmit,
}: {
  content: ClockReadContent;
  onSubmit: (r: ClockReadResponse) => void;
  retries: number;
}) {
  const orderedChoices = useMemo(
    () => content.choices.slice().sort(() => Math.random() - 0.5),
    [content.choices],
  );

  // Angles in degrees, 0° pointing UP (12 o'clock). SVG rotates
  // clockwise from the +x axis by default, so we transform via the
  // rotate() that takes 0 = 12-o'clock.
  const minuteAngle = (content.minute / 60) * 360;
  const hourAngle = ((content.hour % 12) / 12) * 360 + (content.minute / 60) * 30;

  return (
    <div className="space-y-5 py-2 flex flex-col items-center">
      {/* Prompt */}
      <div className="text-center font-display text-[19px] text-bark bg-cream/60 p-3 rounded-2xl border-2 border-ochre/40 max-w-md w-full">
        {content.promptText}
      </div>

      {/* Clock face — sized to fit nicely on iPad portrait */}
      <motion.svg
        width="220" height="220" viewBox="-110 -110 220 220"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 0.9, 0.34, 1] }}
        style={{ filter: 'drop-shadow(0 4px 6px rgba(107, 68, 35, 0.18))' }}
      >
        {/* Outer rim — wood/bark color, slightly thicker */}
        <circle cx={0} cy={0} r={100} fill="#F5EBDC" stroke="#6B4423" strokeWidth={5} />
        <circle cx={0} cy={0} r={92} fill="#FDF6E8" stroke="#6B4423" strokeWidth={1.5} opacity={0.6} />

        {/* Minute marks (60 short, every 5th drawn longer) */}
        {Array.from({ length: 60 }).map((_, i) => {
          const isHour = i % 5 === 0;
          const r1 = isHour ? 78 : 84;
          const r2 = 90;
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

        {/* Hour numerals 1..12 */}
        {Array.from({ length: 12 }).map((_, i) => {
          const num = i + 1;
          const a = (num / 12) * 2 * Math.PI - Math.PI / 2;
          const r = 67;
          return (
            <text
              key={num}
              x={Math.cos(a) * r}
              y={Math.sin(a) * r + 5}    // +5 fudge to center vertically (cap height)
              textAnchor="middle"
              fontSize={16}
              fontWeight={700}
              fill="#5A3B1F"
              style={{ fontFamily: 'inherit' }}
            >
              {num}
            </text>
          );
        })}

        {/* Hour hand — short and stubby, terracotta */}
        <g transform={`rotate(${hourAngle})`}>
          <line
            x1={0} y1={6} x2={0} y2={-46}
            stroke="#C26B4A" strokeWidth={6} strokeLinecap="round"
          />
        </g>

        {/* Minute hand — long and thin, bark */}
        <g transform={`rotate(${minuteAngle})`}>
          <line
            x1={0} y1={10} x2={0} y2={-78}
            stroke="#5A3B1F" strokeWidth={3.4} strokeLinecap="round"
          />
        </g>

        {/* Pivot cap */}
        <circle cx={0} cy={0} r={5} fill="#5A3B1F" />
        <circle cx={0} cy={0} r={2} fill="#FFD93D" />
      </motion.svg>

      {/* Choices */}
      <motion.div
        className="grid grid-cols-2 gap-3 w-full max-w-md"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.3 } } }}
      >
        {orderedChoices.map(c => (
          <motion.button
            key={c}
            onClick={() => onSubmit({ chosen: c })}
            className="bg-white hover:bg-ochre/20 active:bg-ochre/40 border-4 border-ochre rounded-2xl py-5 font-mono"
            style={{ touchAction: 'manipulation', minHeight: 60, fontSize: 32, fontWeight: 700, color: '#5A3B1F' }}
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0 },
            }}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
          >
            {c}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
