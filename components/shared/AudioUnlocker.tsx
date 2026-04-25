'use client';

import { useEffect } from 'react';

/**
 * iOS Safari requires a user gesture before any audio can play. The first
 * time the user taps anywhere we play a tiny silent buffer to "unlock"
 * the AudioContext and HTMLMediaElement playback. Subsequent
 * narrator/audio plays then succeed without needing a fresh gesture.
 *
 * Mounted once at the root layout. Removes its own listeners after first
 * successful unlock.
 */
export default function AudioUnlocker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let unlocked = false;

    const unlock = () => {
      if (unlocked) return;
      unlocked = true;

      // 1) Unlock HTMLAudioElement playback by playing a 1-frame silent MP3.
      try {
        const audio = new Audio(SILENT_MP3);
        audio.muted = false;
        audio.volume = 0.001;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(() => {
            audio.pause();
            audio.src = '';
          }).catch(() => { /* ignore */ });
        }
      } catch { /* ignore */ }

      // 2) Unlock Web Audio API by resuming the AudioContext (used by
      //    speechSynthesis indirectly on some browsers).
      try {
        const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (Ctx) {
          const ctx = new Ctx();
          if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
            ctx.resume().catch(() => { /* ignore */ });
          }
          // Play a silent buffer through the context to fully unlock.
          const buffer = ctx.createBuffer(1, 1, 22050);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
          // Close after a moment so we don't leak.
          setTimeout(() => { try { ctx.close(); } catch {} }, 250);
        }
      } catch { /* ignore */ }

      // 3) Unlock Web Speech Synthesis on iOS Safari by speaking an
      //    empty utterance.
      try {
        const synth = (window as any).speechSynthesis;
        if (synth && typeof SpeechSynthesisUtterance !== 'undefined') {
          const u = new SpeechSynthesisUtterance('');
          u.volume = 0;
          synth.speak(u);
          // Cancel quickly — we just needed the gesture link.
          setTimeout(() => { try { synth.cancel(); } catch {} }, 50);
        }
      } catch { /* ignore */ }

      remove();
    };

    const remove = () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };

    // Use capture so we run before any element handlers; passive for
    // scroll perf.
    window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
    window.addEventListener('touchstart', unlock, { capture: true, passive: true });
    window.addEventListener('keydown', unlock, { capture: true });

    return remove;
  }, []);

  return null;
}

// 1-frame silent MP3 (20 bytes), base64-encoded. Plays for 0.001s.
// Source: https://en.wikipedia.org/wiki/MP3#Header
const SILENT_MP3 =
  'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
