// components/child/garden/BranchHeader.tsx
//
// Shared header across branch scenes (Math Mountain, Reading Forest).
// Mirrors the central garden's header in shape and size, but does NOT
// include the music toggle, journal link, or compass — branches are
// quieter scenes for focused study.

'use client';

import Link from 'next/link';

interface BranchHeaderProps {
  learnerId: string;
  title: string;
  iconEmoji: string;  // small scene-icon shown on the right
}

export default function BranchHeader({ learnerId, title, iconEmoji }: BranchHeaderProps) {
  const backHref = `/garden?learner=${learnerId}`;
  return (
    <div
      className="flex items-center justify-between bg-cream/90 backdrop-blur border-b border-ochre/30 px-3 py-2 landscape:py-1.5"
    >
      <Link
        href={backHref}
        className="text-xl p-1.5 rounded-full bg-white border border-ochre landscape:p-1"
        aria-label="back to garden"
        style={{ minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >←</Link>
      <h1
        className="font-display text-[22px] landscape:text-[18px] text-bark"
        style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
      >
        {title}
      </h1>
      <span
        aria-hidden
        className="text-2xl landscape:text-xl"
        style={{ minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}
      >
        {iconEmoji}
      </span>
    </div>
  );
}
