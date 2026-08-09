// app/(child)/garden/habitat/[code]/BirdFeederInterior.tsx
//
// Inside the bird feeder — which is not a burrow you crawl into, so
// "inside" here means the place you watch it FROM: the window seat,
// looking out at the pole through the glass.
//
// That framing is the point. Every other interior puts a child inside
// an animal's home; this one puts her where she actually is when she
// watches birds, which is the behavior the whole curriculum is
// trying to build. The PLoS study behind the bird spec got its gains
// from children installing feeders and WATCHING them, not from
// instruction.
//
// Layout, back to front: sky and a far hedge, the feeder on its pole
// with the residents queueing at it, the window frame she is looking
// through, and the sill in front with a door to the bird hide.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { SpeciesData } from '@/lib/world/speciesCatalog';
import { SpeciesIllustration } from '@/components/child/garden/speciesIllustrations';
import HabitatInteriorLayout from '@/components/child/garden/HabitatInteriorLayout';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { resolveClip, type AudioIndex } from '@/lib/birds/audioResolve';

const VB_W = 900;
const VB_H = 620;

export default function BirdFeederInterior({
  learnerId, themedSkillCode, themedStructureLabel, themedStructureEmoji,
  discoveredSpecies, undiscoveredCount, audio = {},
}: {
  learnerId: string;
  themedSkillCode: string;
  themedStructureLabel: string;
  themedStructureEmoji: string;
  discoveredSpecies: SpeciesData[];
  undiscoveredCount: number;
  /** Confirmed clips, so a bird at the feeder can be tapped to sing. */
  audio?: AudioIndex;
}) {
  const router = useRouter();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [starting, setStarting] = useState(false);
  const [singing, setSinging] = useState<string | null>(null);

  const startSkill = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, skillCode: themedSkillCode }),
      });
      const { sessionId } = await res.json();
      if (sessionId) router.push(`/lesson/${sessionId}`);
      else setStarting(false);
    } catch {
      setStarting(false);
    }
  };

  /**
   * Tap a bird, hear it. Call before song: a call is what she will
   * actually hear out of this window most of the year, and it is the
   * shorter sound.
   */
  const sing = (code: string) => {
    const clip = resolveClip(audio, code, 'call')
      ?? resolveClip(audio, code, 'song')
      ?? resolveClip(audio, code, 'flight_call');
    if (!clip) return;
    const el = new Audio(clip.url);
    el.addEventListener('error', () => {
      // Opus is not universal; the m4a exists exactly for this.
      if (clip.fallbackUrl && el.src !== clip.fallbackUrl) el.src = clip.fallbackUrl;
      el.play().catch(() => {});
    });
    setSinging(code);
    el.addEventListener('ended', () => setSinging(s => (s === code ? null : s)));
    el.play().catch(() => setSinging(null));
  };

  // Birds perch around the feeder: two on the tray, the rest on the
  // hedge and the pole below, left to right.
  const slot = (i: number) => ({
    x: 120 + (i % 4) * 200,
    y: 300 + Math.floor(i / 4) * 108,
  });

  return (
    <HabitatInteriorLayout learnerId={learnerId} title="Bird Feeder" iconEmoji="🐦">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="feeder-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CBDDE8" />
            <stop offset="100%" stopColor="#E6EEDC" />
          </linearGradient>
          <linearGradient id="feeder-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFDF2" stopOpacity="0.30" />
            <stop offset="45%" stopColor="#FFFDF2" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#FFFDF2" stopOpacity="0.20" />
          </linearGradient>
        </defs>

        {/* the view through the window */}
        <rect x={0} y={0} width={VB_W} height={VB_H} fill="url(#feeder-sky)" />

        {/* far hedge */}
        <path d={`M 0 250 Q 140 214 300 244 T 620 236 T ${VB_W} 250 L ${VB_W} 300 L 0 300 Z`}
              fill="#7C9A6B" />

        {/* lawn */}
        <rect x={0} y={286} width={VB_W} height={VB_H - 286} fill="#8FAE79" />
        <path d={`M 0 286 Q 220 300 460 290 T ${VB_W} 296 L ${VB_W} 320 L 0 320 Z`}
              fill="#7C9A6B" opacity={0.6} />

        {/* THE FEEDER on its pole */}
        <g transform="translate(640, 150)">
          <rect x={-6} y={86} width={12} height={150} fill="#8B6938" stroke="#5A3B1F" strokeWidth={2} rx={3} />
          <rect x={-70} y={78} width={140} height={14} rx={5} fill="#A87147" stroke="#5A3B1F" strokeWidth={2} />
          <rect x={-52} y={16} width={104} height={64} rx={3} fill="#F5EBDC" stroke="#5A3B1F" strokeWidth={2} />
          <rect x={-46} y={48} width={92} height={28} fill="#E8C493" stroke="#8B6938" strokeWidth={1} />
          <polygon points="-78,18 78,18 54,-18 -54,-18"
                   fill="#7B4F2C" stroke="#5A3B1F" strokeWidth={2} strokeLinejoin="round" />
          <line x1={-84} y1={62} x2={84} y2={62} stroke="#5A3B1F" strokeWidth={3} strokeLinecap="round" />
          {/* spilled seed below */}
          {[-40, -18, 6, 26, 44].map((sx, i) => (
            <ellipse key={sx} cx={sx} cy={240 + (i % 2) * 4} rx={3} ry={2}
                     fill="#C9A227" stroke="#5A3B1F" strokeWidth={0.6} />
          ))}
        </g>

        {/* THE SKILL STOP — counting the birds in equal groups */}
        <g
          transform="translate(190, 150)"
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={startSkill}
          aria-label={themedStructureLabel}
        >
          <circle r={46} fill="transparent" />
          {!reducedMotion && (
            <motion.circle
              r={38} fill="#FFE89A"
              animate={{ opacity: [0.15, 0.4, 0.15], scale: [0.95, 1.08, 0.95] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <text y={8} textAnchor="middle" fontSize={34}>{themedStructureEmoji}</text>
          <rect x={-64} y={26} width={128} height={19} rx={9}
                fill="rgba(255,250,242,0.94)" stroke="#6b8e5a" strokeWidth={1} />
          <text y={39} textAnchor="middle" fontSize={10} fontWeight={700} fill="#3f2614">
            {starting ? 'starting…' : themedStructureLabel}
          </text>
        </g>

        {/* THE BIRDS SHE HAS MET — tap one to hear it */}
        {discoveredSpecies.map((sp, i) => {
          const { x, y } = slot(i);
          const isSinging = singing === sp.code;
          return (
            <motion.g key={sp.code}
              style={{ cursor: 'pointer', touchAction: 'manipulation' }}
              onClick={() => sing(sp.code)}
              aria-label={`${sp.commonName} — tap to hear it`}
              animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
              transition={reducedMotion ? undefined : {
                duration: 2.6 + (i % 3) * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3,
              }}
            >
              <circle cx={x} cy={y} r={44} fill="transparent" />
              <ellipse cx={x} cy={y + 26} rx={24} ry={5} fill="#000" opacity={0.18} />
              <g transform={`translate(${x - 30}, ${y - 30})`}>
                {SpeciesIllustration({ code: sp.code, size: 60 })
                  ?? <text x={30} y={40} textAnchor="middle" fontSize={40}>{sp.emoji}</text>}
              </g>
              {/* sound rings while it sings — the visual half of the cue */}
              {isSinging && !reducedMotion && (
                <motion.circle
                  cx={x + 22} cy={y - 16} r={10} fill="none" stroke="#6b8e5a" strokeWidth={2}
                  animate={{ r: [8, 26], opacity: [0.9, 0] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <rect x={x - 60} y={y + 32} width={120} height={18} rx={5}
                    fill={isSinging ? 'rgba(107,142,90,0.95)' : 'rgba(149, 184, 143, 0.92)'} />
              <text x={x} y={y + 45} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#fffaf2">
                {isSinging ? '♪ listen ♪' : sp.commonName}
              </text>
            </motion.g>
          );
        })}

        {/* still to come — empty perches */}
        {Array.from({ length: undiscoveredCount }).map((_, i) => {
          const { x, y } = slot(discoveredSpecies.length + i);
          return (
            <g key={`undiscovered-${i}`} opacity={0.6}>
              <line x1={x - 24} y1={y + 12} x2={x + 24} y2={y + 12}
                    stroke="#6B4423" strokeWidth={3} strokeLinecap="round" opacity={0.5} />
              <text x={x} y={y + 2} textAnchor="middle" fontSize={16} fontStyle="italic"
                    fill="#5A6B4A" opacity={0.7}>?</text>
              <rect x={x - 60} y={y + 32} width={120} height={18} rx={5}
                    fill="rgba(90, 107, 74, 0.55)" />
              <text x={x} y={y + 45} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#EFF3E8">
                not yet visited
              </text>
            </g>
          );
        })}

        {/* THE WINDOW she is looking through — drawn over the view */}
        <g pointerEvents="none">
          <rect x={0} y={0} width={VB_W} height={VB_H} fill="url(#feeder-glass)" />
          <rect x={VB_W / 2 - 7} y={0} width={14} height={VB_H - 92} fill="#E4D5BE" stroke="#B79E7C" strokeWidth={2} />
          <rect x={0} y={112} width={VB_W} height={12} fill="#E4D5BE" stroke="#B79E7C" strokeWidth={2} />
          <rect x={0} y={0} width={22} height={VB_H} fill="#E4D5BE" stroke="#B79E7C" strokeWidth={2} />
          <rect x={VB_W - 22} y={0} width={22} height={VB_H} fill="#E4D5BE" stroke="#B79E7C" strokeWidth={2} />
        </g>

        {/* the sill, and the way through to the bird hide */}
        <rect x={0} y={VB_H - 92} width={VB_W} height={92} fill="#D8C6A8" stroke="#B79E7C" strokeWidth={2} />
        <g
          transform={`translate(${VB_W / 2}, ${VB_H - 48})`}
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={() => router.push(`/birds?learner=${learnerId}`)}
          aria-label="open the bird hide"
        >
          <rect x={-132} y={-24} width={264} height={44} rx={14}
                fill="#6b8e5a" stroke="#3F2614" strokeWidth={2} />
          <text y={5} textAnchor="middle" fontSize={16} fontWeight={700} fill="#fffaf2">
            📖 learn these birds
          </text>
        </g>
      </svg>
    </HabitatInteriorLayout>
  );
}
