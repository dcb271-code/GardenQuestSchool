'use client';

import { useState } from 'react';

export default function AudioButton({ onPlay, label = 'replay audio' }: { onPlay: () => void; label?: string }) {
  const [pulsing, setPulsing] = useState(false);

  const handle = () => {
    setPulsing(true);
    onPlay();
    setTimeout(() => setPulsing(false), 500);
  };

  return (
    <button
      onClick={handle}
      aria-label={label}
      className={`text-2xl p-2 rounded-full bg-white border border-ochre transition-transform ${pulsing ? 'scale-125' : ''}`}
      style={{ touchAction: 'manipulation' }}
    >
      🔊
    </button>
  );
}
