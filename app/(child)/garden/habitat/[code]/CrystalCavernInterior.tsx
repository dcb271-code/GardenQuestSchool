// app/(child)/garden/habitat/[code]/CrystalCavernInterior.tsx
//
// Crystal Cavern — Cecily's, by request and by her name.
//
// Inside a worked-out mine in the side of Math Mountain: a lantern-lit
// tunnel with a seam of crystal still in the wall, a sorting table
// where the day's finds are counted, and animals living in the dark
// further back.
//
// Three things happen here, and they are hers:
//
//   DIG — one a day. Turns up a specimen, or occasionally a creature.
//         Capped deliberately; see the economy note in the design doc.
//         The cavern pays for going deeper, not for going again.
//   KEEP or SELL — every specimen offers the choice, and it is a real
//         one: a kept stone fills the display case, a sold one becomes
//         coins. The same stone cannot do both.
//   THE MATHS STOP — the money maths she asked for, on the price board.

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { SpeciesData } from '@/lib/world/speciesCatalog';
import { SpeciesIllustration } from '@/components/child/garden/speciesIllustrations';
import HabitatInteriorLayout from '@/components/child/garden/HabitatInteriorLayout';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { playSparkle, playHarvest } from '@/lib/audio/sfx';
import {
  getGem, gemsOnShelf, scratchTestFor, type GemData,
} from '@/lib/world/gemCatalog';
import { coinsToPrice, type CavernState } from '@/lib/world/cavern';
import DisplayCase from './DisplayCase';

const VB_W = 900;
const VB_H = 620;

export default function CrystalCavernInterior({
  learnerId, themedSkillCode, themedStructureLabel, themedStructureEmoji,
  discoveredSpecies, undiscoveredCount, cavern: initialCavern,
}: {
  learnerId: string;
  themedSkillCode: string;
  themedStructureLabel: string;
  themedStructureEmoji: string;
  discoveredSpecies: SpeciesData[];
  undiscoveredCount: number;
  cavern: CavernState;
}) {
  const router = useRouter();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [starting, setStarting] = useState(false);
  const [cavern, setCavern] = useState(initialCavern);
  const [digging, setDigging] = useState(false);
  /** The stone just dug up, awaiting her keep-or-sell decision. */
  const [found, setFound] = useState<GemData | null>(null);
  // Where the stone in front of her came from. An earned stone should
  // not be presented as luck — she worked for it.
  const [foundReason, setFoundReason] = useState<'dug' | 'earned'>('dug');

  // Stones the cavern owes her for mastering a skill, waiting here so
  // the keep-or-sell choice is still hers. Shown one at a time.
  useEffect(() => {
    if (found) return;
    const next = (cavern.pending ?? [])[0];
    if (!next) return;
    const gem = getGem(next);
    if (gem) { setFound(gem); setFoundReason('earned'); playSparkle(); }
  }, [cavern.pending, found]);
  const [foundCreature, setFoundCreature] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  const dig = async () => {
    if (digging || !cavern.canDigToday) return;
    setDigging(true);
    try {
      const res = await fetch('/api/cavern', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, action: 'dig' }),
      });
      const d = await res.json();
      if (d.error) { setMessage(d.error); return; }
      setCavern(d.cavern);
      if (d.gemCode) { setFound(getGem(d.gemCode) ?? null); setFoundReason('dug'); playSparkle(); }
      if (d.creatureCode) { setFoundCreature(d.creatureCode); playSparkle(); }
      if (!d.gemCode && !d.creatureCode) setMessage('Nothing but rock today. It happens.');
    } catch {
      setMessage('The tunnel is quiet. Try again in a moment.');
    } finally {
      setDigging(false);
    }
  };

  const decide = async (choice: 'keep' | 'sell') => {
    if (!found) return;
    const gem = found;
    setFound(null);
    try {
      const res = await fetch('/api/cavern', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, action: choice, gemCode: gem.code }),
      });
      const d = await res.json();
      if (d.cavern) setCavern(d.cavern);
      if (choice === 'sell') {
        playHarvest();
        setMessage(`Sold the ${gem.name} for ${coinsToPrice(d.paid ?? 0)}.`);
      } else {
        setMessage(`The ${gem.name} goes in the case.`);
      }
      window.setTimeout(() => setMessage(null), 3200);
    } catch {
      setMessage('That did not go through. Your stone is safe.');
    }
  };

  const kept = Object.keys(cavern.kept ?? {}).length;
  const [caseOpen, setCaseOpen] = useState(false);
  const slot = (i: number) => ({ x: 140 + (i % 4) * 200, y: 430 + Math.floor(i / 4) * 96 });

  return (
    <HabitatInteriorLayout learnerId={learnerId} title="Crystal Cavern" iconEmoji="💎">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="cav-rock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4A4038" />
            <stop offset="100%" stopColor="#2A2420" />
          </linearGradient>
          <radialGradient id="cav-lantern" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE89A" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFE89A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* the rock the tunnel is cut through */}
        <rect x={0} y={0} width={VB_W} height={VB_H} fill="url(#cav-rock)" />

        {/* tunnel mouth behind, opening deeper into the dark */}
        <path d={`M 300 ${VB_H} Q 330 250 450 240 Q 570 250 600 ${VB_H} Z`} fill="#181410" />
        <ellipse cx={450} cy={250} rx={148} ry={26} fill="#0E0B08" />

        {/* the seam — crystals still in the wall, catching the light */}
        {[
          { x: 120, y: 300, r: 16, c: '#B589D6' }, { x: 168, y: 268, r: 11, c: '#C9A7E6' },
          { x: 96, y: 250, r: 9, c: '#8FD1E8' }, { x: 760, y: 292, r: 15, c: '#E88F9C' },
          { x: 806, y: 258, r: 10, c: '#F0B8C2' }, { x: 716, y: 246, r: 8, c: '#F5D98F' },
        ].map((g, i) => (
          <motion.g key={i}
            animate={reducedMotion ? undefined : { opacity: [0.75, 1, 0.75] }}
            transition={reducedMotion ? undefined : {
              duration: 3 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.4,
            }}
          >
            <path
              d={`M ${g.x} ${g.y - g.r} L ${g.x + g.r * 0.6} ${g.y} L ${g.x} ${g.y + g.r} L ${g.x - g.r * 0.6} ${g.y} Z`}
              fill={g.c} stroke="#1A1410" strokeWidth={1.4} strokeLinejoin="round"
            />
          </motion.g>
        ))}

        {/* lantern on a hook, and the pool of light it makes */}
        <circle cx={450} cy={150} r={190} fill="url(#cav-lantern)" />
        <g transform="translate(450, 96)">
          <line x1={0} y1={-40} x2={0} y2={-14} stroke="#7A6A55" strokeWidth={2} />
          <rect x={-13} y={-14} width={26} height={30} rx={4}
                fill="#C9A227" stroke="#3F2614" strokeWidth={2} />
          <motion.circle cx={0} cy={1} r={7} fill="#FFF3C4"
            animate={reducedMotion ? undefined : { opacity: [0.7, 1, 0.7] }}
            transition={reducedMotion ? undefined : { duration: 2.2, repeat: Infinity }} />
        </g>

        {/* THE MATHS STOP — the price board */}
        <g transform="translate(730, 150)"
           style={{ cursor: 'pointer', touchAction: 'manipulation' }}
           onClick={startSkill} aria-label={themedStructureLabel}>
          <circle r={46} fill="transparent" />
          {!reducedMotion && (
            <motion.circle r={38} fill="#FFE89A"
              animate={{ opacity: [0.14, 0.36, 0.14], scale: [0.95, 1.08, 0.95] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} />
          )}
          <text y={8} textAnchor="middle" fontSize={34}>{themedStructureEmoji}</text>
          <rect x={-64} y={26} width={128} height={19} rx={9}
                fill="rgba(255,250,242,0.94)" stroke="#6b8e5a" strokeWidth={1} />
          <text y={39} textAnchor="middle" fontSize={10} fontWeight={700} fill="#3f2614">
            {starting ? 'starting…' : themedStructureLabel}
          </text>
        </g>

        {/* the creatures living further in */}
        {discoveredSpecies.map((sp, i) => {
          const { x, y } = slot(i);
          return (
            <motion.g key={sp.code}
              animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
              transition={reducedMotion ? undefined : {
                duration: 3 + (i % 3) * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4,
              }}
            >
              <ellipse cx={x} cy={y + 26} rx={24} ry={5} fill="#000" opacity={0.35} />
              <g transform={`translate(${x - 30}, ${y - 30})`}>
                {SpeciesIllustration({ code: sp.code, size: 60 })
                  ?? <text x={30} y={40} textAnchor="middle" fontSize={38}>{sp.emoji}</text>}
              </g>
              <rect x={x - 62} y={y + 32} width={124} height={18} rx={5}
                    fill="rgba(80, 70, 58, 0.9)" />
              <text x={x} y={y + 45} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#F2E8D5">
                {sp.commonName}
              </text>
            </motion.g>
          );
        })}
        {Array.from({ length: undiscoveredCount }).map((_, i) => {
          const { x, y } = slot(discoveredSpecies.length + i);
          return (
            <g key={`unknown-${i}`} opacity={0.5}>
              <text x={x} y={y + 6} textAnchor="middle" fontSize={20} fontStyle="italic"
                    fill="#9A8C76">?</text>
              <rect x={x - 62} y={y + 32} width={124} height={18} rx={5}
                    fill="rgba(60, 52, 42, 0.7)" />
              <text x={x} y={y + 45} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#B8A98F">
                something in the dark
              </text>
            </g>
          );
        })}
      </svg>

      {/* ── the working surface, over the art ─────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="rounded-2xl p-3 max-w-xl mx-auto"
             style={{ background: 'rgba(28,24,20,0.92)', border: '1px solid #6b5a44' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={dig}
              disabled={digging || !cavern.canDigToday}
              className="rounded-xl px-4 font-bold text-sm disabled:opacity-45"
              style={{ background: '#C9A227', color: '#2A2420', minHeight: 48,
                       touchAction: 'manipulation' }}
            >
              {digging ? 'digging…' : cavern.canDigToday ? '⛏ dig' : 'dug for today'}
            </button>
            <div className="flex-1 text-xs" style={{ color: '#D8C9A8' }}>
              <div><strong style={{ color: '#F5D98F' }}>{coinsToPrice(cavern.coins)}</strong> in coins</div>
              {/* The count was a dead end — she wrote to ask where the
                  stones actually were. It opens the case now. */}
              <button
                onClick={() => setCaseOpen(true)}
                className="underline underline-offset-2 text-left"
                style={{ color: '#D8C9A8', minHeight: 32, touchAction: 'manipulation' }}
              >
                {kept} stone{kept === 1 ? '' : 's'} in the case →
              </button>
            </div>
            {!cavern.canDigToday && (
              /* "No" on its own reads as broken to a seven-year-old —
                 she wrote to ask why the cavern would not let her dig.
                 Say WHEN instead. */
              <span className="text-[11px] italic text-right" style={{ color: '#9A8C76', maxWidth: 160 }}>
                you dug today — the seam opens again tomorrow morning
              </span>
            )}
          </div>
          {message && (
            <p className="text-xs mt-2" style={{ color: '#F5D98F' }}>{message}</p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {caseOpen && (
          <DisplayCase
            kept={cavern.kept ?? {}}
            open={caseOpen}
            onClose={() => setCaseOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── keep or sell ──────────────────────────────────────────── */}
      <AnimatePresence>
        {found && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center p-4"
            style={{ background: 'rgba(20,16,12,0.7)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              initial={reducedMotion ? undefined : { scale: 0.9, y: 10 }}
              animate={reducedMotion ? undefined : { scale: 1, y: 0 }}
              className="rounded-2xl p-4 w-full"
              style={{ background: '#FFFAF2', border: '2px solid #C9A227', maxWidth: 400 }}
            >
              <div className="text-center">
                {/* Earned reads differently from dug. She asked for the
                    maths and the crystals to be one thing; the banner is
                    where that promise is actually kept. */}
                {foundReason === 'earned' && (
                  <div className="rounded-full px-3 py-1 mb-2 inline-block text-[11px] font-bold"
                       style={{ background: '#EFE0B0', color: '#5A4520' }}>
                    ⛏ the seam paid you for mastering something
                  </div>
                )}
                <div className="text-4xl" aria-hidden>{found.emoji}</div>
                <h2 className="font-bold text-lg mt-1" style={{ color: '#3f2614' }}>
                  {found.name}
                </h2>
                <p className="text-xs" style={{ color: '#6b6255' }}>
                  hardness {found.mohs} · {found.crystalShape}
                </p>
              </div>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: '#4a4034' }}>
                {found.formationStory}
              </p>
              <p className="text-xs mt-2 italic" style={{ color: '#6b6255' }}>
                {scratchTestFor(found)
                  ? `You could scratch it with ${scratchTestFor(found)}.`
                  : 'Nothing you own will scratch it.'}
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => decide('keep')}
                  className="flex-1 rounded-xl px-3 font-bold text-sm"
                  style={{ background: '#fffaf2', border: '2px solid #6b8e5a',
                           color: '#3f2614', minHeight: 52 }}
                >
                  keep it<br />
                  <span className="text-[11px] font-normal">for the case</span>
                </button>
                <button
                  onClick={() => decide('sell')}
                  className="flex-1 rounded-xl px-3 font-bold text-sm"
                  style={{ background: '#6b8e5a', color: '#fffaf2', minHeight: 52 }}
                >
                  sell it<br />
                  <span className="text-[11px] font-normal">
                    {coinsToPrice(found.valuePerGram)}
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── a creature, found in the dark ─────────────────────────── */}
      <AnimatePresence>
        {foundCreature && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center p-4"
            style={{ background: 'rgba(20,16,12,0.7)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setFoundCreature(null)}
          >
            <div className="rounded-2xl p-5 text-center w-full"
                 style={{ background: '#FFFAF2', border: '2px solid #6b8e5a', maxWidth: 380 }}>
              <div className="text-4xl mb-1" aria-hidden>👀</div>
              <h2 className="font-bold text-base" style={{ color: '#3f2614' }}>
                Something moved back there
              </h2>
              <p className="text-sm mt-1" style={{ color: '#4a4034' }}>
                Look in your field journal — it is in the cavern now.
              </p>
              <button
                onClick={() => setFoundCreature(null)}
                className="w-full mt-3 rounded-xl px-4 font-bold text-sm"
                style={{ background: '#6b8e5a', color: '#fffaf2', minHeight: 48 }}
              >
                back to digging
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </HabitatInteriorLayout>
  );
}
