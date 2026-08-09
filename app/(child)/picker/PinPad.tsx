// app/(child)/picker/PinPad.tsx
//
// Four big buttons' worth of privacy.
//
// A typed password would have been the obvious build and the wrong one:
// the users here are five and seven, and a five-year-old who cannot
// spell her way into her own garden is a worse outcome than her sister
// reading her letters. Digits on a keypad are tappable, memorable, and
// can be told to her out loud.
//
// Deliberately forgiving: no lockout, no attempt counter, no scary
// language. A wrong PIN shakes the dots and clears them, and she can go
// again forever. The failure mode worth avoiding here is a child who
// thinks she has broken something.

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PIN_LENGTH } from '@/lib/learner/pin';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export default function PinPad({
  learnerId, name, avatarEmoji, onUnlocked, onCancel,
}: {
  learnerId: string;
  name: string;
  avatarEmoji: string;
  onUnlocked: () => void;
  onCancel: () => void;
}) {
  const [digits, setDigits] = useState('');
  const [wrong, setWrong] = useState(false);
  const [busy, setBusy] = useState(false);

  const attempt = async (pin: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/learner/${learnerId}/pin`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) { onUnlocked(); return; }
      setWrong(true);
      setTimeout(() => { setDigits(''); setWrong(false); }, 700);
    } finally {
      setBusy(false);
    }
  };

  const press = (k: string) => {
    if (busy || wrong) return;
    if (k === '⌫') { setDigits(d => d.slice(0, -1)); return; }
    if (!k) return;
    const next = (digits + k).slice(0, PIN_LENGTH);
    setDigits(next);
    if (next.length === PIN_LENGTH) attempt(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(28,24,18,0.75)' }}>
      <motion.div
        className="rounded-3xl w-full max-w-xs p-5"
        style={{ background: '#FFF8EC' }}
        initial={{ scale: 0.92, y: 14, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
      >
        <div className="text-center">
          <div className="text-5xl">{avatarEmoji}</div>
          <h2 className="text-lg font-bold mt-1" style={{ color: '#3A2E1E' }}>
            Hello {name}
          </h2>
          <p className="text-xs" style={{ color: '#8A7A5E' }}>
            {wrong ? 'Not quite — try again.' : 'Tap your four numbers.'}
          </p>
        </div>

        <motion.div
          className="flex justify-center gap-3 my-4"
          animate={wrong ? { x: [0, -9, 9, -6, 6, 0] } : {}}
          transition={{ duration: 0.45 }}
        >
          {Array.from({ length: PIN_LENGTH }, (_, i) => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: 999,
              background: i < digits.length ? (wrong ? '#D96A4A' : '#5A8C4A') : '#E4D9C0',
            }} />
          ))}
        </motion.div>

        <div className="grid grid-cols-3 gap-2">
          {KEYS.map((k, i) => (
            <button
              key={i}
              onClick={() => press(k)}
              disabled={!k || busy}
              className="rounded-2xl text-xl font-bold"
              style={{
                minHeight: 58, touchAction: 'manipulation',
                background: k ? '#F2E7D0' : 'transparent',
                color: '#4A3B24',
                visibility: k ? 'visible' : 'hidden',
              }}
            >
              {k}
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="w-full mt-3 text-sm rounded-xl"
          style={{ minHeight: 44, color: '#8A7A5E', touchAction: 'manipulation' }}
        >
          not me
        </button>
      </motion.div>
    </div>
  );
}
