'use client';

// Ikebana with Bachan — tap Bachan on the porch → she teaches the
// three-stem shape (shin/soe/hikae) → the child picks three harvested
// blooms → they go in the vase → a fact, a keepsake in the journal.
//
// Sibling of KitchenModal: same basket, same consume-on-create flow,
// but quieter — no quiz, no guest. Arranging IS the activity.

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playPageTurn, playSparkle } from '@/lib/audio/sfx';
import {
  STEM_ROLES, IKEBANA_FACTS, IKEBANA_FINISH_LESSON, flowerEmoji, type StemRole,
} from '@/lib/world/ikebana';

interface IkebanaState {
  unlocked: boolean;
  lifetimeFlowerHarvests: number;
  needed: number;
  basket: Record<string, number>;
  plantNames: Record<string, string>;
  arrangements: Array<{
    id: string;
    shin_plant_code: string;
    soe_plant_code: string;
    hikae_plant_code: string;
    arranged_at: string;
  }>;
}

type Phase = 'intro' | 'arrange' | 'done';

/** The vase with however many stems are placed so far. */
function VaseView({ stems }: { stems: Partial<Record<StemRole, string>> }) {
  return (
    <svg viewBox="0 0 200 170" className="w-full max-w-[240px] mx-auto" aria-hidden>
      {/* shin — heaven: tall, nearly upright */}
      {stems.shin && (
        <g>
          <path d="M 100 118 C 102 80 96 50 104 26" stroke="#5f7d4f" strokeWidth="3" fill="none" strokeLinecap="round" />
          <text x={104} y={22} textAnchor="middle" fontSize={24}>{flowerEmoji(stems.shin)}</text>
        </g>
      )}
      {/* soe — human: middle height, leaning left */}
      {stems.soe && (
        <g>
          <path d="M 96 118 C 88 96 74 78 62 64" stroke="#5f7d4f" strokeWidth="3" fill="none" strokeLinecap="round" />
          <text x={58} y={60} textAnchor="middle" fontSize={22}>{flowerEmoji(stems.soe)}</text>
        </g>
      )}
      {/* hikae — earth: short, low to the right */}
      {stems.hikae && (
        <g>
          <path d="M 104 118 C 112 110 124 104 134 100" stroke="#5f7d4f" strokeWidth="3" fill="none" strokeLinecap="round" />
          <text x={140} y={100} textAnchor="middle" fontSize={20}>{flowerEmoji(stems.hikae)}</text>
        </g>
      )}
      {/* the vase — simple terracotta, drawn last so stems sit "inside" */}
      <path
        d="M 82 114 L 118 114 C 120 128 116 140 112 148 L 88 148 C 84 140 80 128 82 114 Z"
        fill="#C97B5D" stroke="#8a4f38" strokeWidth="2.5" strokeLinejoin="round"
      />
      <ellipse cx={100} cy={114} rx={18} ry={4} fill="#8a4f38" opacity={0.5} />
      {/* the table line */}
      <line x1={40} y1={150} x2={160} y2={150} stroke="#b8a888" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function IkebanaModal({
  open, learnerId, onClose,
}: {
  open: boolean;
  learnerId: string;
  onClose: () => void;
}) {
  const [state, setState] = useState<IkebanaState | null>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [stems, setStems] = useState<Partial<Record<StemRole, string>>>({});
  const [placing, setPlacing] = useState(false);
  const [fact, setFact] = useState(IKEBANA_FACTS[0]);

  const load = useCallback(() => {
    fetch(`/api/ikebana?learner=${learnerId}`)
      .then(r => r.json())
      .then((d: IkebanaState) => {
        setState(d);
        // Rotate the fact by how many arrangements she's made — every
        // visit teaches the next thing.
        setFact(IKEBANA_FACTS[(d.arrangements?.length ?? 0) % IKEBANA_FACTS.length]);
      })
      .catch(() => {});
  }, [learnerId]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const reset = () => { setPhase('intro'); setStems({}); setPlacing(false); };
  const close = () => { reset(); onClose(); };

  // The next role still waiting for a bloom, in shin → soe → hikae order.
  const nextRole = STEM_ROLES.find(r => !stems[r.role]) ?? null;

  // Basket counts minus blooms already standing in the vase.
  const remaining: Record<string, number> = { ...(state?.basket ?? {}) };
  for (const code of Object.values(stems)) {
    if (code) remaining[code] = (remaining[code] ?? 0) - 1;
  }
  const basketTotal = Object.values(state?.basket ?? {}).reduce((a, b) => a + b, 0);

  const pick = (code: string) => {
    if (!nextRole || (remaining[code] ?? 0) <= 0) return;
    playPageTurn();
    setStems(s => ({ ...s, [nextRole.role]: code }));
  };

  const place = async () => {
    if (!stems.shin || !stems.soe || !stems.hikae || placing) return;
    setPlacing(true);
    try {
      const res = await fetch('/api/ikebana/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          learnerId, shin: stems.shin, soe: stems.soe, hikae: stems.hikae,
        }),
      });
      if (!res.ok) { setPlacing(false); load(); setStems({}); return; }
      playSparkle();
      setPhase('done');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(20,25,40,0.4), rgba(20,25,40,0.6))',
            backdropFilter: 'blur(2px)',
          }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={close}
        >
          <motion.div
            className="relative bg-cream border-4 border-terracotta rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 modal-max-h overflow-y-auto"
            initial={{ scale: 0.9, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.9, 0.34, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="text-4xl">🌸</div>
              <div className="font-display italic text-[12px] tracking-[0.3em] uppercase text-bark/55">
                bachan&apos;s
              </div>
              <h2 className="font-display text-[26px] text-bark leading-tight" style={{ fontWeight: 600 }}>
                <span className="italic text-forest">flower arranging</span>
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {/* ── Bachan explains ── */}
              {phase === 'intro' && (
                <motion.div key="intro" className="space-y-3"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <p className="font-display italic text-[15px] text-bark/75 text-center">
                    Come sit with me. In Japan this is called ikebana —
                    we choose three flowers, and give each one a job.
                  </p>
                  <div className="space-y-2">
                    {STEM_ROLES.map(r => (
                      <div key={r.role} className="bg-white/70 rounded-xl px-3 py-2 border-2 border-ochre/40 text-left">
                        <div className="font-display text-[14px] text-bark" style={{ fontWeight: 600 }}>
                          {r.name}
                        </div>
                        <div className="font-display italic text-[12px] text-bark/60">
                          {r.meaning}
                        </div>
                      </div>
                    ))}
                  </div>
                  {basketTotal >= 3 ? (
                    <motion.button
                      onClick={() => { playPageTurn(); setPhase('arrange'); }}
                      className="w-full bg-forest text-white rounded-full py-3.5 font-display"
                      style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      🌸 let&apos;s arrange
                    </motion.button>
                  ) : (
                    <div className="bg-white/70 rounded-xl p-3 border-2 border-ochre/40 font-display text-[14px] text-bark/80 leading-snug text-center">
                      we need <span style={{ fontWeight: 700 }}>3 blooms</span> in
                      your basket — grow and harvest some flowers, then come back!
                    </div>
                  )}
                  <motion.button
                    onClick={close}
                    className="w-full bg-white border-2 border-ochre rounded-full py-3 font-display italic text-bark/70"
                    style={{ touchAction: 'manipulation', minHeight: 52 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    maybe later
                  </motion.button>
                </motion.div>
              )}

              {/* ── pick the three stems ── */}
              {phase === 'arrange' && (
                <motion.div key="arrange" className="space-y-3"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <VaseView stems={stems} />
                  {nextRole ? (
                    <>
                      <p className="font-display italic text-[15px] text-bark/75 text-center">
                        <span className="text-forest" style={{ fontWeight: 600 }}>{nextRole.name}</span>
                        {' — '}{nextRole.hint}
                      </p>
                      {/* Bachan's learning point for this stem */}
                      <div className="bg-white/70 rounded-xl p-3 border-2 border-ochre/40 font-display italic text-[13px] text-bark/75 leading-snug text-left">
                        👵 {nextRole.lesson}
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {Object.entries(state?.basket ?? {})
                          .filter(([code]) => (remaining[code] ?? 0) > 0)
                          .map(([code]) => (
                            <motion.button
                              key={code}
                              onClick={() => pick(code)}
                              className="bg-white border-4 border-ochre rounded-2xl px-3 py-2 font-display text-[14px] text-bark hover:bg-ochre/10"
                              style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span className="text-xl mr-1">{flowerEmoji(code)}</span>
                              {state?.plantNames[code] ?? code}
                              <span className="text-bark/50 ml-1">×{remaining[code]}</span>
                            </motion.button>
                          ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white/70 rounded-xl p-3 border-2 border-ochre/40 font-display italic text-[13px] text-bark/75 leading-snug text-left">
                        👵 {IKEBANA_FINISH_LESSON}
                      </div>
                      <motion.button
                        onClick={place}
                        disabled={placing}
                        className="w-full bg-forest text-white rounded-full py-3.5 font-display disabled:opacity-50"
                        style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {placing ? 'placing…' : '🏺 place it on the table'}
                      </motion.button>
                    </>
                  )}
                  {Object.keys(stems).length > 0 && (
                    <motion.button
                      onClick={() => setStems({})}
                      className="w-full bg-white border-2 border-ochre rounded-full py-2.5 font-display italic text-bark/70"
                      style={{ touchAction: 'manipulation', minHeight: 48 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      start over
                    </motion.button>
                  )}
                </motion.div>
              )}

              {/* ── done — the keepsake ── */}
              {phase === 'done' && (
                <motion.div key="done" className="space-y-3 text-center"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <VaseView stems={stems} />
                  <p className="font-display text-[16px] text-bark" style={{ fontWeight: 600 }}>
                    beautiful. just enough, and no more.
                  </p>
                  <div className="bg-white/70 rounded-xl p-3 border-2 border-ochre/40 font-display italic text-[14px] text-bark/80 leading-snug">
                    {fact}
                  </div>
                  <p className="font-display italic text-[13px] text-bark/60">
                    saved to your journal 🌸
                  </p>
                  <motion.button
                    onClick={close}
                    className="w-full bg-forest text-white rounded-full py-3.5 font-display"
                    style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    back to the garden
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
