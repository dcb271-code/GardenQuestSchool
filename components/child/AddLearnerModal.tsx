'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AVATARS: Array<{ key: string; emoji: string; label: string }> = [
  { key: 'fox', emoji: '🦊', label: 'Fox' },
  { key: 'bunny', emoji: '🐰', label: 'Bunny' },
  { key: 'cat', emoji: '🐈', label: 'Cat' },
  { key: 'butterfly', emoji: '🦋', label: 'Butterfly' },
  { key: 'frog', emoji: '🐸', label: 'Frog' },
  { key: 'bee', emoji: '🐝', label: 'Bee' },
];

export default function AddLearnerModal({
  open, onClose, onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (learner: { id: string; first_name: string; avatar_key: string }) => void;
}) {
  const [name, setName] = useState('');
  const [avatarKey, setAvatarKey] = useState('fox');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setAvatarKey('fox');
    setError(null);
    setBusy(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/learner', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ firstName: name.trim(), avatarKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not add learner');
        setBusy(false);
        return;
      }
      onCreated({
        id: data.learnerId,
        first_name: name.trim(),
        avatar_key: avatarKey,
      });
      reset();
      onClose();
    } catch (err) {
      setError('Network error — try again');
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.35), rgba(20, 25, 40, 0.55))',
            backdropFilter: 'blur(2px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={close}
        >
          <motion.div
            className="relative bg-cream border-4 border-terracotta rounded-3xl max-w-md w-full p-6 shadow-2xl"
            initial={{ scale: 0.9, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.9, 0.34, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div className="font-display italic text-[13px] tracking-[0.3em] uppercase text-bark/55">
                a new
              </div>
              <h2
                className="font-display text-[32px] text-bark leading-tight"
                style={{ fontWeight: 600, letterSpacing: '-0.015em' }}
              >
                <span className="italic text-forest">explorer</span>
              </h2>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block font-display italic text-[14px] text-bark/65 mb-2">
                  what&apos;s their name?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="first name"
                  autoFocus
                  className="w-full bg-white border-4 border-ochre rounded-2xl px-4 py-3 text-kid-md font-display"
                  style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600 }}
                  required
                  maxLength={40}
                />
              </div>

              <div>
                <label className="block font-display italic text-[14px] text-bark/65 mb-2">
                  pick an avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map(a => (
                    <motion.button
                      type="button"
                      key={a.key}
                      onClick={() => setAvatarKey(a.key)}
                      className={`text-3xl p-3 rounded-xl border-4 ${
                        avatarKey === a.key
                          ? 'border-forest bg-forest/10'
                          : 'border-ochre/50 bg-white hover:border-ochre'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                      aria-label={a.label}
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.06 }}
                    >
                      {a.emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              {error && (
                <motion.div
                  className="text-rose font-display italic text-sm bg-rose/10 border-2 border-rose/40 rounded-xl px-3 py-2 text-center"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={close}
                  disabled={busy}
                  className="flex-1 bg-white border-4 border-ochre rounded-full py-3 font-display italic text-bark/70 disabled:opacity-50"
                  style={{ touchAction: 'manipulation', minHeight: 56 }}
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || !name.trim()}
                  className="flex-1 bg-forest text-white rounded-full py-3 font-display disabled:opacity-50"
                  style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
                >
                  {busy ? 'adding…' : 'add'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
