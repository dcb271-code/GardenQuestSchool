'use client';

// Garden Friend care modal: needs, feeding from the harvest basket,
// bond progress, nickname (level 1+). All rules server-enforced; this
// is a window, not a referee.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CompanionStatus } from '@/app/api/companion/route';
import { BOND_LEVELS } from '@/lib/companion/companionRules';
import { SpeciesIllustration } from './speciesIllustrations';
import { playSparkle } from '@/lib/audio/sfx';

export default function CompanionModal({
  open, learnerId, companion, onClose, onChanged,
}: {
  open: boolean;
  learnerId: string;
  companion: CompanionStatus | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [basket, setBasket] = useState<Record<string, number>>({});
  const [plantNames, setPlantNames] = useState<Record<string, string>>({});
  const [feeding, setFeeding] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  useEffect(() => {
    if (open && learnerId) {
      setNote(null);
      fetch(`/api/kitchen?learner=${learnerId}`)
        .then(r => r.json())
        .then(d => { setBasket(d.basket ?? {}); setPlantNames(d.plantNames ?? {}); })
        .catch(() => {});
    }
  }, [open, learnerId]);

  if (!companion) return null;
  const label = companion.nickname ?? companion.speciesName;

  const feed = async (plantCode: string) => {
    if (feeding) return;
    setFeeding(true);
    setNote(null);
    try {
      const res = await fetch('/api/companion/feed', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, plantCode }),
      });
      if (res.ok) {
        playSparkle();
        setNote(`${label} munches the ${plantNames[plantCode] ?? plantCode} happily.`);
        onChanged();
      } else {
        const j = await res.json().catch(() => ({}));
        setNote(j.error === 'already-fed'
          ? `${label} is full for today — same time tomorrow!`
          : 'hmm, nothing in the basket for that');
      }
    } finally {
      setFeeding(false);
    }
  };

  const saveNickname = async () => {
    const nickname = nameDraft.trim();
    if (!nickname) { setEditingName(false); return; }
    await fetch('/api/companion/adopt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ learnerId, speciesCode: companion.speciesCode, nickname }),
    });
    setEditingName(false);
    onChanged();
  };

  const nextAt = companion.nextLevelAt;
  const basketEntries = Object.entries(basket).filter(([, n]) => n > 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.4), rgba(20, 25, 40, 0.6))',
            backdropFilter: 'blur(2px)',
          }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-cream border-4 border-terracotta rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.9, 0.34, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <svg viewBox="-40 -40 80 80" width={90} height={90} className="mx-auto" aria-hidden="true">
                <SpeciesIllustration code={companion.speciesCode} size={64} />
              </svg>
              <div className="font-display italic text-[12px] tracking-[0.3em] uppercase text-bark/55">
                your garden friend
              </div>
              <h2 className="font-display text-[26px] text-bark leading-tight" style={{ fontWeight: 600 }}>
                <span className="italic text-forest">{label.toLowerCase()}</span>
              </h2>
              {companion.napping && (
                <div className="font-display italic text-[13px] text-bark/60">
                  {label} is having a cozy nap 💤
                </div>
              )}
            </div>

            {/* Needs */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`rounded-2xl border-2 px-3 py-2.5 text-center font-display text-[14px] ${
                companion.hungryToday ? 'border-ochre bg-white' : 'border-sage/60 bg-sage/10'
              }`}>
                <div className="text-xl">🍓</div>
                {companion.hungryToday ? 'a little hungry' : 'fed today ✓'}
              </div>
              <div className={`rounded-2xl border-2 px-3 py-2.5 text-center font-display text-[14px] ${
                !companion.playedToday ? 'border-ochre bg-white' : 'border-sage/60 bg-sage/10'
              }`}>
                <div className="text-xl">🎈</div>
                {companion.playedToday ? 'played today ✓' : 'play = any practice'}
              </div>
            </div>

            {/* Bond bar */}
            <div>
              <div className="flex justify-between font-display text-[12px] text-bark/60 mb-1">
                <span>friendship</span>
                <span>{companion.bondXp}{nextAt ? ` / ${nextAt}` : ' ★'}</span>
              </div>
              <div className="h-3 rounded-full bg-white border-2 border-ochre/50 overflow-hidden">
                <div
                  className="h-full bg-terracotta transition-all"
                  style={{ width: `${nextAt ? Math.min(100, (companion.bondXp / nextAt) * 100) : 100}%` }}
                />
              </div>
              <div className="flex justify-between font-display italic text-[10px] text-bark/50 mt-1">
                {BOND_LEVELS.map(b => (
                  <span key={b.level} className={companion.bondXp >= b.atXp ? 'text-forest font-semibold' : ''}>
                    {b.unlock === 'nickname' ? 'name' : b.unlock === 'bandana' ? 'bandana' : 'flower crown'}
                  </span>
                ))}
              </div>
            </div>

            {/* Nickname (level 1+) */}
            {companion.bondLevel >= 1 && (
              editingName ? (
                <div className="flex gap-2">
                  <input
                    value={nameDraft}
                    onChange={e => setNameDraft(e.target.value)}
                    maxLength={24}
                    placeholder="a name just for them"
                    className="flex-1 bg-white border-2 border-ochre rounded-xl px-3 py-2 font-display"
                    autoFocus
                  />
                  <button
                    onClick={saveNickname}
                    className="bg-forest text-white rounded-xl px-4 font-display"
                    style={{ touchAction: 'manipulation', fontWeight: 600 }}
                  >save</button>
                </div>
              ) : (
                <button
                  onClick={() => { setNameDraft(companion.nickname ?? ''); setEditingName(true); }}
                  className="w-full font-display italic text-[13px] text-bark/60 underline"
                  style={{ touchAction: 'manipulation' }}
                >
                  {companion.nickname ? 'change their name' : 'give them a name ✎'}
                </button>
              )
            )}

            {/* Feed picker */}
            {companion.hungryToday && (
              <div className="space-y-2">
                <div className="font-display italic text-[13px] text-bark/65 text-center">
                  share something from the harvest basket:
                </div>
                {basketEntries.length === 0 ? (
                  <div className="text-center font-display italic text-[13px] text-bark/50">
                    the basket is empty — harvest something in the grow garden first
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {basketEntries.map(([code, n]) => (
                      <button
                        key={code}
                        disabled={feeding}
                        onClick={() => feed(code)}
                        className="bg-white border-2 border-ochre rounded-xl px-2 py-2 font-display text-[13px] text-bark hover:border-forest disabled:opacity-50"
                        style={{ touchAction: 'manipulation', minHeight: 52 }}
                      >
                        {plantNames[code] ?? code}
                        <span className="block text-[11px] text-bark/50">×{n}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {note && (
              <div className="text-center font-display italic text-[14px] text-forest">
                {note}
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full bg-forest text-white rounded-full py-3.5 font-display"
              style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
            >
              see you soon
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
