'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

function ExploreHeaderInner({ learnerId }: { learnerId: string | null }) {
  const backHref = learnerId ? `/garden?learner=${learnerId}` : '/picker';

  return (
    <div className="flex justify-between items-center pt-2">
      <Link
        href={backHref}
        className="text-2xl p-2 rounded-full bg-white border border-ochre hover:bg-ochre/10 active:bg-ochre/20"
        aria-label="back to garden"
        style={{
          touchAction: 'manipulation',
          minWidth: 44,
          minHeight: 44,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ←
      </Link>

      <div className="flex-1 flex flex-col items-center">
        <SpinningCompass />
        <h1
          className="font-display text-[26px] text-bark text-center"
          style={{ fontWeight: 600, letterSpacing: '-0.015em', marginTop: 4 }}
        >
          <span className="italic text-forest">three stops</span> in your garden
        </h1>
        <div className="font-display italic text-[13px] text-bark/55 tracking-[0.15em] uppercase mt-1 text-center px-4">
          the compass picks places you&apos;re ready to visit
        </div>
      </div>

      <div style={{ width: 44 }}></div>
    </div>
  );
}

function SpinningCompass() {
  return (
    <motion.svg
      width="64" height="64" viewBox="-36 -36 72 72"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 0.9, 0.34, 1] }}
    >
      {/* outer ring */}
      <circle cx={0} cy={0} r={30} fill="#F5EBDC" stroke="#6B4423" strokeWidth={2.5} />
      <circle cx={0} cy={0} r={26} fill="none" stroke="#6B4423" strokeWidth={0.8} opacity={0.5} />
      {/* cardinal marks */}
      {[0, 90, 180, 270].map(deg => (
        <line
          key={deg}
          x1={0} y1={-28} x2={0} y2={-22}
          stroke="#6B4423" strokeWidth={2}
          transform={`rotate(${deg})`}
        />
      ))}
      {/* N label */}
      <text x={0} y={-17} fontSize={7} textAnchor="middle" fill="#6B4423" fontWeight="700">N</text>
      {/* needle — slowly rotating */}
      <motion.g
        animate={{ rotate: [0, 8, -5, 12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '0px 0px' }}
      >
        <path d="M 0 -22 L 4 0 L 0 0 Z" fill="#C94C3E" stroke="#6B4423" strokeWidth={1} />
        <path d="M 0 -22 L -4 0 L 0 0 Z" fill="#E8708C" stroke="#6B4423" strokeWidth={1} />
        <path d="M 0 22 L 4 0 L 0 0 Z" fill="#F5EBDC" stroke="#6B4423" strokeWidth={1} />
        <path d="M 0 22 L -4 0 L 0 0 Z" fill="#EADCC5" stroke="#6B4423" strokeWidth={1} />
        <circle cx={0} cy={0} r={2.5} fill="#6B4423" />
      </motion.g>
    </motion.svg>
  );
}

export default function ExploreHeader({ learnerId }: { learnerId: string | null }) {
  return <ExploreHeaderInner learnerId={learnerId} />;
}
