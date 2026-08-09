// app/(child)/garden/tunnels/BurrowLesson.tsx
//
// Read the story, then answer for it.
//
// The animal moves in only when all three questions are right. That bar
// is deliberate: a partial pass would mean the animal arrives for
// having half-read, and the whole reason this exists is that Cecily
// said the burrow was boring because there was nothing to DO. Tapping
// is not doing.
//
// Nothing is lost by getting one wrong. There is no score, no timer and
// no limit on tries — a wrong answer explains itself and she goes
// again. The questions are a door, not a test.
//
// The story is paged rather than dumped in one block, because four
// short screens get read and one long wall gets scrolled past.

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { playSparkle } from '@/lib/audio/sfx';
import { passed, type BurrowAnimal } from '@/lib/world/burrowTunnels';

type Phase = 'story' | 'questions' | 'done';

export default function BurrowLesson({
  animal, learnerId, alreadyPlaced, onClose, onPlaced,
}: {
  animal: BurrowAnimal;
  learnerId: string;
  alreadyPlaced: boolean;
  onClose: () => void;
  onPlaced: (code: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>('story');
  const [page, setPage] = useState(0);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [saving, setSaving] = useState(false);

  const q = animal.questions[qi];
  const lastPage = page >= animal.story.length - 1;

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correct) playSparkle();
  };

  const next = async () => {
    const right = picked === q.correct;
    const all = [...results, right];
    setResults(all);
    setPicked(null);

    if (qi + 1 < animal.questions.length) { setQi(qi + 1); return; }

    if (passed(all, animal.questions.length)) {
      setSaving(true);
      try {
        await fetch('/api/tunnels', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ learnerId, animalCode: animal.code }),
        });
        onPlaced(animal.code);
      } finally { setSaving(false); }
      setPhase('done');
    } else {
      // Straight back to the story. Not a failure screen — a re-read.
      setResults([]); setQi(0); setPage(0); setPhase('story');
    }
  };

  const missed = results.length === animal.questions.length
    && !passed(results, animal.questions.length);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3"
      style={{ background: 'rgba(8,6,4,0.86)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="rounded-2xl w-full max-w-md p-4 max-h-[88vh] overflow-y-auto"
        style={{ background: '#FFFAF2', border: '2px solid #A9855A' }}
        initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#3f2614' }}>
              {animal.emoji} {animal.name}
            </h2>
            <p className="text-[11px] italic" style={{ color: '#8A7A5E' }}>
              {animal.scientificName}
            </p>
          </div>
          <button onClick={onClose} aria-label="close"
                  className="text-xl leading-none shrink-0"
                  style={{ color: '#A9855A', minWidth: 44, minHeight: 44 }}>✕</button>
        </div>

        {phase === 'story' && (
          <>
            <p className="text-sm leading-relaxed mt-3" style={{ color: '#4A3B24' }}>
              {animal.story[page]}
            </p>

            <div className="flex gap-1.5 justify-center mt-4">
              {animal.story.map((_, i) => (
                <span key={i} style={{
                  width: 7, height: 7, borderRadius: 999,
                  background: i <= page ? '#A9855A' : '#E0D4B8', display: 'block',
                }} />
              ))}
            </div>

            {missed && page === 0 && (
              <p className="text-xs mt-3 rounded-lg p-2" style={{ background: '#F3E7CE', color: '#6B5C42' }}>
                Not quite — have another read. The answers are all in here.
              </p>
            )}

            <div className="flex gap-2 mt-4">
              {page > 0 && (
                <button onClick={() => setPage(p => p - 1)}
                        className="rounded-xl px-4 font-bold text-sm"
                        style={{ background: '#EADFC6', color: '#4A3B24', minHeight: 50 }}>
                  back
                </button>
              )}
              <button
                onClick={() => (lastPage ? setPhase('questions') : setPage(p => p + 1))}
                className="flex-1 rounded-xl font-bold text-sm"
                style={{ background: '#5A8C4A', color: '#FFF', minHeight: 50,
                         touchAction: 'manipulation' }}
              >
                {lastPage ? 'I have read it →' : 'next →'}
              </button>
            </div>
          </>
        )}

        {phase === 'questions' && (
          <>
            <p className="text-[11px] mt-3" style={{ color: '#8A7A5E' }}>
              question {qi + 1} of {animal.questions.length}
            </p>
            <p className="text-sm font-bold mt-1" style={{ color: '#3f2614' }}>
              {q.prompt}
            </p>

            <div className="space-y-2 mt-3">
              {q.choices.map((c, i) => {
                const isRight = i === q.correct;
                const chosen = picked === i;
                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={picked !== null}
                    className="w-full text-left rounded-xl px-3 py-2.5 text-sm"
                    style={{
                      minHeight: 52, touchAction: 'manipulation',
                      background: picked === null ? '#F2E7D0'
                        : isRight ? '#5A8C4A' : chosen ? '#D96A4A' : '#F2E7D0',
                      color: picked !== null && (isRight || chosen) ? '#FFF' : '#4A3B24',
                      opacity: picked !== null && !isRight && !chosen ? 0.5 : 1,
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-xs mt-3 leading-relaxed" style={{ color: '#6B5C42' }}>
                  {q.why}
                </p>
                <button
                  onClick={next}
                  disabled={saving}
                  className="w-full rounded-xl font-bold text-sm mt-3"
                  style={{ background: '#5A8C4A', color: '#FFF', minHeight: 50,
                           touchAction: 'manipulation' }}
                >
                  {saving ? 'moving in…'
                    : qi + 1 < animal.questions.length ? 'next question →' : 'finish'}
                </button>
              </motion.div>
            )}
          </>
        )}

        {phase === 'done' && (
          <div className="text-center mt-4">
            <motion.div className="text-6xl"
                        initial={{ scale: 0.5 }} animate={{ scale: 1 }} aria-hidden>
              {animal.emoji}
            </motion.div>
            <p className="text-sm font-bold mt-3" style={{ color: '#3f2614' }}>
              {animal.arrival}
            </p>
            <p className="text-xs mt-2" style={{ color: '#8A7A5E' }}>
              {alreadyPlaced
                ? 'You already knew this one — nice reading anyway.'
                : 'They are in the tunnels now, and they stay.'}
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-xl font-bold text-sm mt-4"
              style={{ background: '#5A8C4A', color: '#FFF', minHeight: 50 }}
            >
              back to the tunnels
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
