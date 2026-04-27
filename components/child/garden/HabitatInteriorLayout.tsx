// components/child/garden/HabitatInteriorLayout.tsx
//
// Shared layout for habitat interior scenes (Bunny Burrow first;
// frog pond, bee hotel, etc. follow the same pattern in Phase 2).
// Same viewport sizing as BranchSceneLayout, but visually warmer
// and more enclosed — interiors are atmospheric, not full landscapes.

'use client';

import { useEffect, useState } from 'react';
import BranchHeader from './BranchHeader';

interface HabitatInteriorLayoutProps {
  learnerId: string;
  title: string;
  iconEmoji: string;
  children: React.ReactNode;
}

export default function HabitatInteriorLayout({
  learnerId, title, iconEmoji, children,
}: HabitatInteriorLayoutProps) {
  const [hour, setHour] = useState(12);
  useEffect(() => { setHour(new Date().getHours()); }, []);
  // Interiors are warmer-by-default than branches — even at night
  // the lantern keeps things glowing.
  const tint =
    hour < 5  ? 'rgba(60, 30, 80, 0.10)' :
    hour < 19 ? 'transparent' :
                'rgba(40, 25, 60, 0.12)';

  return (
    <div
      className="bg-[#3a2510] flex flex-col overflow-hidden"
      style={{ height: '100dvh', minHeight: '100vh' }}
    >
      <BranchHeader learnerId={learnerId} title={title} iconEmoji={iconEmoji} />
      <div className="flex-1 relative overflow-hidden">
        {children}
        {tint !== 'transparent' && (
          <div
            aria-hidden
            style={{
              position: 'absolute', inset: 0, background: tint,
              pointerEvents: 'none', mixBlendMode: 'multiply',
            }}
          />
        )}
      </div>
    </div>
  );
}
