'use client';

import { useCallback, useEffect, useRef } from 'react';
import { speak, stopSpeaking } from './tts';

/**
 * Auto-narrates `text` once when it changes (i.e., when a new item appears).
 * Returns a `replay` function bound to the current text.
 */
export function useNarrator(text: string): { replay: () => void } {
  const lastSpokenRef = useRef<string>('');

  useEffect(() => {
    if (!text || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;
    // Slight delay helps iOS Safari "wake" the speech engine after page nav.
    const timer = setTimeout(() => { void speak(text); }, 80);
    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [text]);

  const replay = useCallback(() => {
    if (!text) return;
    void speak(text);
  }, [text]);

  return { replay };
}
