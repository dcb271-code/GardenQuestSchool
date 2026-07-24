// components/child/garden/ResearcherQuestModal.tsx
//
// The Level-3+ RESEARCHER quest for a built habitat — same gentle
// quiz mechanics as HabitatQuestModal (retry on wrong, no penalty),
// but harder field-science questions from researcherQuests.ts.
// Completing it earns the habitat's 🔬 researcher badge (persisted via
// /api/garden/habitat/research), a 'wondering' gem when under the
// daily cap, and quietly makes the habitat eligible for RARE visitors.

'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HabitatTypeData } from '@/lib/world/habitatCatalog';
import { getResearcherQuest } from '@/lib/world/researcherQuests';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

type Phase = 'intro' | 'question' | 'celebrate' | 'saving';

export default function ResearcherQuestModal({
  open, habitat, learnerId, onClose, onBadged,
}: {
  open: boolean;
  habitat: HabitatTypeData | null;
  learnerId: string;
  onClose: () => void;
  onBadged: () => void;
}) {
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [phase, setPhase] = useState<Phase>('intro');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [wrongOnce, setWrongOnce] = useState(false);
  const [shakeToken, setShakeToken] = useState(0);
  const [gemGranted, setGemGranted] = useState(false);

  const quest = habitat ? getResearcherQuest(habitat.code) : null;

  useEffect(() => {
    if (open) {
      setPhase('intro');
      setQuestionIdx(0);
      setWrongOnce(false);
      setShakeToken(0);
      setGemGranted(false);
    }
  }, [open, habitat?.code]);

  // Shuffle choices per question (stable while the question is up).
  const current = quest?.questions[questionIdx] ?? null;
  const shuffled = useMemo(() => {
    if (!current) return null;
    const order = current.choices.map((_, i) => i).sort(() => Math.random() - 0.5);
    return { order, correctAt: order.indexOf(current.correctIndex) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.prompt, open]);

  if (!habitat || !quest || !current || !shuffled) return null;
  const total = quest.questions.length;

  const onAnswer = (displayIdx: number) => {
    if (displayIdx === shuffled.correctAt) {
      setWrongOnce(false);
      const next = questionIdx + 1;
      if (next >= total) {
        setPhase('celebrate');
        void save();
      } else {
        setQuestionIdx(next);
      }
    } else {
      setShakeToken(t => t + 1);
      setWrongOnce(true);
    }
  };

  const save = async () => {
    try {
      const res = await fetch('/api/garden/habitat/research', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, habitatCode: habitat.code }),
      });
      const json = await res.json().catch(() => ({}));
      setGemGranted(!!json.gemGranted);
      onBadged();
    } catch (err) {
      console.error('Failed to save researcher badge:', err);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.4), rgba(20, 25, 40, 0.6))',
            backdropFilter: 'blur(2px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => phase !== 'saving' && onClose()}
        >
          <motion.div
            className="relative bg-cream border-4 border-forest rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            initial={{ scale: 0.9, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.9, 0.34, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="text-5xl">🔬</div>
              <div className="font-display italic text-[12px] tracking-[0.3em] uppercase text-bark/55">
                researcher quest
              </div>
              <h2
                className="font-display text-[28px] text-bark leading-tight"
                style={{ fontWeight: 600, letterSpacing: '-0.015em' }}
              >
                <span className="italic text-forest">{habitat.name.toLowerCase()}</span>
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {phase === 'intro' && (
                <motion.div
                  key="intro"
                  className="space-y-4 text-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="font-display italic text-[17px] text-bark/80 leading-snug px-2">
                    {quest.intro}
                  </p>
                  <p className="font-display text-[14px] text-bark/65">
                    {total} harder questions — real field science. Earn the{' '}
                    <span className="not-italic">🔬</span> badge and someone{' '}
                    <span className="italic">rare</span> may notice your garden.
                  </p>
                  <motion.button
                    onClick={() => setPhase('question')}
                    className="w-full bg-forest text-white rounded-full py-4 font-display"
                    style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    open the field notebook
                  </motion.button>
                </motion.div>
              )}

              {phase === 'question' && (
                <motion.div
                  key={`q-${questionIdx}`}
                  className="space-y-4"
                  initial={reducedMotion ? undefined : { opacity: 0, x: 18 }}
                  animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, x: -18 }}
                  transition={{ duration: 0.35, ease: [0.22, 0.9, 0.34, 1] }}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-display italic text-[12px] tracking-[0.2em] uppercase text-bark/55">
                      question {questionIdx + 1} of {total}
                    </div>
                    <div className="flex gap-1.5">
                      {Array.from({ length: total }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${i <= questionIdx ? 'bg-forest' : 'bg-ochre/40'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <motion.div
                    key={`shake-${shakeToken}`}
                    initial={{ x: 0 }}
                    animate={shakeToken > 0 && !reducedMotion
                      ? { x: [0, -7, 7, -5, 5, -2, 0] }
                      : { x: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="bg-white/70 rounded-2xl p-4 border-2 border-forest/30"
                  >
                    <div
                      className="font-display text-[18px] text-bark leading-snug"
                      style={{ fontWeight: 600 }}
                    >
                      {current.prompt}
                    </div>
                  </motion.div>

                  <div className="space-y-2">
                    {shuffled.order.map((choiceIdx, displayIdx) => (
                      <motion.button
                        key={displayIdx}
                        onClick={() => onAnswer(displayIdx)}
                        className="w-full text-left bg-white border-4 border-ochre rounded-2xl px-4 py-3.5 font-display text-[16px] text-bark hover:bg-ochre/10"
                        style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 500 }}
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        {current.choices[choiceIdx]}
                      </motion.button>
                    ))}
                  </div>

                  {wrongOnce && (
                    <motion.div
                      className="text-center font-display italic text-[15px] text-terracotta"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      a researcher checks the evidence again — try once more
                    </motion.div>
                  )}
                </motion.div>
              )}

              {(phase === 'celebrate' || phase === 'saving') && (
                <motion.div
                  key="celebrate"
                  className="space-y-4 text-center py-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.45, ease: [0.22, 0.9, 0.34, 1] }}
                >
                  <div className="font-display text-[24px] text-bark" style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                    🔬 <span className="italic text-forest">researcher badge</span> earned
                  </div>
                  <p className="font-display italic text-[16px] text-bark/75 leading-snug">
                    {quest.outro}
                  </p>
                  {gemGranted && (
                    <div className="bg-white/70 border-2 border-ochre/40 rounded-2xl px-4 py-3 font-display text-[15px] text-bark">
                      💎 a <span style={{ fontWeight: 700 }}>wondering</span> gem for your collection
                    </div>
                  )}
                  <p className="font-display text-[13px] text-bark/60 italic">
                    badged habitats catch the eye of rare visitors…
                  </p>
                  <motion.button
                    onClick={onClose}
                    className="w-full bg-sage text-white rounded-full py-4 font-display"
                    style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600 }}
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
