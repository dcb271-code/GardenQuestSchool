'use client';

import { useCallback, useEffect, useRef } from 'react';
import { speak, stopSpeaking } from './tts';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

/**
 * Auto-narrates `text` once when it changes (i.e., when a new item appears).
 * Returns a `replay` function bound to the current text.
 * Reads voice preferences from the accessibility settings.
 */
export function useNarrator(text: string): { replay: () => void } {
  const { settings } = useAccessibilitySettings();
  const lastSpokenRef = useRef<string>('');

  useEffect(() => {
    if (!text || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;
    // Slight delay helps iOS Safari "wake" the speech engine after page nav.
    const timer = setTimeout(() => {
      void speak(text, {
        voice: settings.voiceName ?? undefined,
        rate: settings.voiceRate,
      });
    }, 80);
    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, settings.voiceName, settings.voiceRate]);

  const replay = useCallback(() => {
    if (!text) return;
    void speak(text, {
      voice: settings.voiceName ?? undefined,
      rate: settings.voiceRate,
    });
  }, [text, settings.voiceName, settings.voiceRate]);

  return { replay };
}
