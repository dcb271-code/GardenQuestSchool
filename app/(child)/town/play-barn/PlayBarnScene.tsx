'use client';

// app/(child)/town/play-barn/PlayBarnScene.tsx
//
// The Play Barn — games in the hayloft, the bike's second road.
// One stall for now (the Munch Patch), a prize shelf, and a dashed
// empty stall: more games someday, the roads pattern one level down.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  offeredCrates, PRIZE_VEGGIES, type MunchRule, type PrizeVeggie,
} from '@/lib/packs/math/munch';
import { speak, isSpeechAvailable } from '@/lib/audio/tts';
import { BarnHeader, CrateArt, PrizeVeggieArt } from './art';
import MunchPatch, { ruleWords } from './MunchPatch';

interface ShelfPrize { code: string; date: string }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-08-29" → "Aug 29" — a shelf plaque, not a database row. */
function shelfDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}`;
}

export default function PlayBarnScene({
  learnerId, level, initialPrizes,
}: {
  learnerId: string;
  level: number;
  initialPrizes: ShelfPrize[];
}) {
  const [round, setRound] = useState<{ rule: MunchRule; seed: number } | null>(null);
  const [prizes, setPrizes] = useState<ShelfPrize[]>(initialPrizes);
  const crates = offeredCrates(level);
  // Resolved AFTER mount — reading speech availability at render
  // time hydrates differently on server and browser (the PipTools
  // lesson, relearned by the smoke gate on this very page).
  const [canSpeak, setCanSpeak] = useState(false);
  useEffect(() => { setCanSpeak(isSpeechAvailable()); }, []);

  const startRound = (crateCode: string) => {
    const crate = crates.find(c => c.code === crateCode)!;
    const rule = crate.roll(Math.floor(Math.random() * 2 ** 31));
    setRound({ rule, seed: Math.floor(Math.random() * 2 ** 31) });
  };

  return (
    <main className="min-h-screen pb-10" style={{ background: '#F2E7D0' }}>
      <div className="mx-auto px-3" style={{ maxWidth: 620 }}>
        <BarnHeader />

        <div className="flex items-center justify-between mt-1">
          <h1 className="font-bold text-xl" style={{ color: '#3f2614' }}>The Play Barn</h1>
          <a href={`/garden?learner=${learnerId}`}
             className="text-sm rounded-xl px-3 py-2 font-bold"
             style={{ background: '#EFE7D8', color: '#3f2614', minHeight: 44 }}>
            ride home
          </a>
        </div>

        <AnimatePresence mode="wait">
          {round ? (
            <motion.div key="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }} className="mt-3">
              <MunchPatch
                learnerId={learnerId}
                rule={round.rule}
                seed={round.seed}
                onPrize={p => setPrizes(prev => [...prev, { code: p.code, date: 'today' }])}
                onExit={() => setRound(null)}
              />
            </motion.div>
          ) : (
            <motion.div key="barn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}>
              {/* the game stall */}
              <section className="rounded-2xl p-4 mt-3"
                       style={{ background: '#FFFAF2', border: '2px solid #C9A227' }}>
                <h2 className="font-bold text-base" style={{ color: '#3f2614' }}>
                  The Munch Patch
                </h2>
                <p className="text-sm mt-1" style={{ color: '#4A3B24' }}>
                  Pick a crate. The crate tells the bunny what to eat — and the
                  patch is full of veggies that only LOOK right. Watch for the
                  groundhog.
                </p>
                <div className="grid grid-cols-1 gap-2 mt-3">
                  {crates.map(crate => (
                    <div key={crate.code} className="flex items-center gap-3 rounded-xl p-2"
                         style={{ background: '#F6EEDF', border: '2px solid #C9B88E' }}>
                      <button onClick={() => startRound(crate.code)}
                              className="flex items-center gap-3 flex-1 text-left"
                              style={{ minHeight: 56, touchAction: 'manipulation' }}
                              aria-label={`play: ${crate.label}`}>
                        <CrateArt stretch={crate.stretch} />
                        <span>
                          <span className="block font-bold text-sm" style={{ color: '#3f2614' }}>
                            {crate.label}
                          </span>
                          {crate.stretch && (
                            <span className="block text-[11px]" style={{ color: '#5A8C4A' }}>
                              a stretch — for when you want a big one
                            </span>
                          )}
                        </span>
                      </button>
                      {canSpeak && (
                        <button onClick={() => speak(crate.label, { rate: 0.95 })}
                                aria-label={`say out loud: ${crate.label}`}
                                className="rounded-full shrink-0"
                                style={{ width: 44, height: 44, background: '#FFFAF2',
                                         border: '2px solid #C9B88E', touchAction: 'manipulation' }}>
                          <svg viewBox="0 0 24 24" width="20" height="20"
                               style={{ margin: '0 auto' }} aria-hidden>
                            <path d="M 4 9 h 4 l 5 -4 v 14 l -5 -4 H 4 Z" fill="#8A6238" />
                            <path d="M 16 9 q 3 3 0 6" stroke="#8A6238" strokeWidth="1.8"
                                  fill="none" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* the prize shelf */}
              <section className="rounded-2xl p-4 mt-3"
                       style={{ background: '#FFFAF2', border: '2px solid #C9B88E' }}>
                <h2 className="font-bold text-base" style={{ color: '#3f2614' }}>
                  The prize shelf
                </h2>
                {prizes.length === 0 ? (
                  <p className="text-sm mt-1 italic" style={{ color: '#8A7A5E' }}>
                    Clear the patch once in a day and the county fair sends
                    over something enormous.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {prizes.map((p, i) => {
                      const veg = PRIZE_VEGGIES.find(v => v.code === p.code);
                      return (
                        <div key={i} className="flex flex-col items-center rounded-xl p-2"
                             style={{ background: '#F6EEDF', width: 104 }}>
                          <PrizeVeggieArt code={p.code} size={64} />
                          <span className="text-[10px] font-bold text-center mt-1"
                                style={{ color: '#3f2614' }}>
                            {veg?.name ?? p.code}
                          </span>
                          <span className="text-[9px]" style={{ color: '#8A7A5E' }}>
                            {shelfDate(p.date)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* the shelf board itself, drawn */}
                <svg viewBox="0 0 400 22" className="w-full mt-2" aria-hidden>
                  <rect x="0" y="4" width="400" height="10" rx="3" fill="#B08A56" />
                  <rect x="0" y="12" width="400" height="4" fill="#8E6C46" />
                  <rect x="30" y="14" width="8" height="8" fill="#7A5A34" />
                  <rect x="362" y="14" width="8" height="8" fill="#7A5A34" />
                </svg>
              </section>

              {/* more games someday — the honest dashed stall */}
              <div className="rounded-2xl p-4 mt-3 flex items-center gap-3"
                   style={{ border: '2px dashed #C9B88E' }}>
                <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden>
                  <rect x="4" y="10" width="26" height="20" rx="3" fill="none"
                        stroke="#B8A88E" strokeWidth="2" strokeDasharray="4 3" />
                  <path d="M 4 12 L 17 3 L 30 12" fill="none" stroke="#B8A88E"
                        strokeWidth="2" strokeDasharray="4 3" />
                </svg>
                <span className="text-sm italic" style={{ color: '#9A8C76' }}>
                  more games someday
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
