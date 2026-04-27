// components/child/garden/BranchSceneLayout.tsx
//
// Shared layout container for branch scenes (Math Mountain, Reading
// Forest). Reuses the same viewport pattern as GardenScene: 100dvh
// flex column with a compact header + flex-1 SVG area, so the scene
// fills the screen on iPad landscape without a cap.
//
// The actual SVG content (background gradient, hills, structures) is
// passed in as `children` — branch-specific. This layout owns: header,
// time-of-day tint overlay, viewport sizing, and the back-to-garden
// navigation chrome.

'use client';

import { useEffect, useState } from 'react';
import BranchHeader from './BranchHeader';

export interface BranchSceneLayoutProps {
  learnerId: string;
  title: string;
  iconEmoji: string;
  children: React.ReactNode;  // the inner SVG (viewBox=0 0 1440 800)
}

export default function BranchSceneLayout({
  learnerId, title, iconEmoji, children,
}: BranchSceneLayoutProps) {
  // Time-of-day tint — initialised to noon (transparent) and updated
  // after mount so SSR + hydration always agree (no flash of darkness).
  // Same logic as GardenScene so the world feels uniform.
  const [hour, setHour] = useState(12);
  useEffect(() => { setHour(new Date().getHours()); }, []);
  const tint =
    hour < 5  ? 'rgba(40, 50, 100, 0.18)' :
    hour < 7  ? 'rgba(255, 200, 140, 0.04)' :
    hour < 19 ? 'transparent' :
    hour < 21 ? 'rgba(255, 170, 110, 0.05)' :
                'rgba(20, 25, 60, 0.18)';

  return (
    <div
      className="bg-[#F5EBDC] flex flex-col overflow-hidden"
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
