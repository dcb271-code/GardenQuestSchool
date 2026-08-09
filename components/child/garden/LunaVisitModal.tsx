// components/child/garden/LunaVisitModal.tsx
//
// Tapping Luna used to jump straight into her adventure. Cecily asked
// to be able to feed her, so the tap now asks which — a treat, or the
// story.
//
// A treat buys a fact. One a day: a fact you get thirty of at once is
// thirty facts you remember none of, and coming back tomorrow is how
// they land.

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { playSparkle } from '@/lib/audio/sfx';

export default function LunaVisitModal({
  learnerId, canFeedToday, onClose, onStory,
}: {
  learnerId: string;
  canFeedToday: boolean;
  onClose: () => void;
  onStory: () => void;
}) {
  const [fact, setFact] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fed, setFed] = useState(!canFeedToday);

  const feed = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/luna', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId }),
      });
      const d = await res.json();
      setFed(true);
      if (d.fed) {
        playSparkle();
        setFact(d.fact ?? 'She has told you everything she knows. She purrs anyway.');
      } else {
        setMessage(d.message ?? 'She is not hungry.');
      }
    } finally { setBusy(false); }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(20,16,12,0.7)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="rounded-2xl w-full max-w-sm p-4"
        style={{ background: '#FFFAF2', border: '2px solid #C9A227' }}
        initial={{ scale: 0.92, y: 14 }} animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-5xl" aria-hidden>🐈‍⬛</div>
          <h2 className="text-lg font-bold mt-1" style={{ color: '#3f2614' }}>Luna</h2>
        </div>

        {fact && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl p-3 mt-3"
                      style={{ background: '#F3E7CE' }}>
            <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: '#A9855A' }}>
              she settles down and says
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#4A3B24' }}>{fact}</p>
          </motion.div>
        )}
        {message && (
          <p className="text-sm text-center mt-3" style={{ color: '#6B5C42' }}>{message}</p>
        )}

        <div className="space-y-2 mt-4">
          {!fact && (
            <button
              onClick={feed}
              disabled={busy || fed}
              className="w-full rounded-xl font-bold text-sm disabled:opacity-50"
              style={{ background: '#C9A227', color: '#2A2420', minHeight: 52,
                       touchAction: 'manipulation' }}
            >
              {fed ? 'fed today' : busy ? 'offering…' : '🐟 give her a treat'}
            </button>
          )}
          <button
            onClick={onStory}
            className="w-full rounded-xl font-bold text-sm"
            style={{ background: '#5A8C4A', color: '#FFF', minHeight: 52,
                     touchAction: 'manipulation' }}
          >
            ✨ her story
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-xl text-sm"
            style={{ background: '#EADFC6', color: '#4A3B24', minHeight: 48,
                     touchAction: 'manipulation' }}
          >
            leave her be
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
