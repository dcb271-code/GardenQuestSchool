'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Lightweight wrapper around the Web Speech Recognition API. Used by
 * the BlendingBrook (CVC blending) skill so a child can SAY the blended
 * word instead of just picking it from choices.
 *
 * Browser support:
 *  - Chrome / Edge: window.SpeechRecognition (or webkitSpeechRecognition)
 *  - Safari (incl. iPad): window.webkitSpeechRecognition
 *  - Firefox: not supported — caller falls back to tap-to-pick UI
 */
export interface SpeechRecognitionState {
  supported: boolean;
  listening: boolean;
  transcript: string;       // best-guess text, lowercase trimmed
  alternatives: string[];   // up to N alternative transcripts (for fuzzy match)
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechRecognition(): SpeechRecognitionState {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const Rec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Rec) {
      setSupported(false);
      return;
    }
    setSupported(true);

    try {
      const rec = new Rec();
      rec.lang = 'en-US';
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 5;

      rec.onresult = (e: any) => {
        const results = e.results;
        if (!results.length) return;
        // Final result preferred; otherwise show interim.
        const last = results[results.length - 1];
        const text = (last[0]?.transcript ?? '').toLowerCase().trim();
        setTranscript(text);
        if (last.isFinal) {
          const alts: string[] = [];
          for (let i = 0; i < Math.min(last.length, 5); i++) {
            const t = (last[i]?.transcript ?? '').toLowerCase().trim();
            if (t) alts.push(t);
          }
          setAlternatives(alts);
        }
      };
      rec.onerror = (e: any) => {
        const err = e.error ?? 'unknown';
        // Common: 'no-speech', 'aborted', 'not-allowed', 'network'
        setError(err);
        setListening(false);
      };
      rec.onend = () => {
        setListening(false);
      };

      recRef.current = rec;
    } catch (err) {
      setSupported(false);
    }
  }, []);

  const start = useCallback(() => {
    setError(null);
    setTranscript('');
    setAlternatives([]);
    if (!recRef.current) return;
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      // Already started, or some other ill state — just ignore.
    }
  }, []);

  const stop = useCallback(() => {
    if (!recRef.current) return;
    try { recRef.current.stop(); } catch {}
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setAlternatives([]);
    setError(null);
  }, []);

  return { supported, listening, transcript, alternatives, error, start, stop, reset };
}

/**
 * Fuzzy-ish word match. Strips punctuation/whitespace, lowercases,
 * accepts exact match against either the transcript or any alternative.
 * Also accepts the transcript ending with the target (Web Speech often
 * adds preamble like "the cat" when the child says "cat").
 */
export function speechMatchesWord(transcript: string, alternatives: string[], target: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
  const t = norm(target);
  if (!t) return false;
  const candidates = [transcript, ...alternatives].map(norm).filter(Boolean);
  return candidates.some(c => c === t || c.endsWith(t) || c.startsWith(t));
}
