'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Lightweight wrapper around the Web Speech Recognition API. Used by
 * the blending/reading skills so a child can SAY the word instead of
 * just picking it from choices.
 *
 * Browser support:
 *  - Chrome / Edge: window.SpeechRecognition (or webkitSpeechRecognition)
 *  - Safari (incl. iPad): window.webkitSpeechRecognition
 *  - Firefox: not supported — caller falls back to listen-and-build UI
 *
 * Reliability notes (learned on wall-tablet Android webviews):
 *  - A recognition instance can go stale after one use — start() then
 *    throws or silently never fires events. We build a FRESH instance
 *    on every start() instead of reusing one.
 *  - Sessions often end after ~1-2s of silence, cutting kids off
 *    mid-think. When a session ends with no final result and no fatal
 *    error, we transparently restart it (up to a small cap per tap)
 *    so one tap keeps listening long enough for a 6-year-old to
 *    breathe first.
 */
export interface SpeechRecognitionState {
  supported: boolean;
  listening: boolean;
  transcript: string;       // best-guess FINAL text, lowercase trimmed
  interim: string;          // in-flight hypothesis (often garbled — display with care)
  alternatives: string[];   // up to N alternative transcripts (for fuzzy match)
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const MAX_AUTO_RESTARTS = 3;      // per tap
const ATTEMPT_WINDOW_MS = 12000;  // stop keeping the mic hot after this

export function useSpeechRecognition(): SpeechRecognitionState {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<any>(null);
  const wantRef = useRef(false);        // user still expects listening
  const restartsRef = useRef(0);
  const attemptStartRef = useRef(0);
  const gotFinalRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const Rec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!Rec);
    return () => {
      wantRef.current = false;
      try { recRef.current?.abort?.(); } catch { /* ok */ }
    };
  }, []);

  const buildAndStart = useCallback((): boolean => {
    const Rec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Rec) return false;
    // Drop any previous instance — reuse is what goes stale.
    try { recRef.current?.abort?.(); } catch { /* ok */ }
    let rec: any;
    try {
      rec = new Rec();
    } catch {
      return false;
    }
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 5;

    rec.onresult = (e: any) => {
      const results = e.results;
      if (!results.length) return;
      const last = results[results.length - 1];
      const text = (last[0]?.transcript ?? '').toLowerCase().trim();
      if (last.isFinal) {
        gotFinalRef.current = true;
        setTranscript(text);
        setInterim('');
        const alts: string[] = [];
        for (let i = 0; i < Math.min(last.length, 5); i++) {
          const t = (last[i]?.transcript ?? '').toLowerCase().trim();
          if (t) alts.push(t);
        }
        setAlternatives(alts);
      } else {
        setInterim(text);
      }
    };
    rec.onerror = (e: any) => {
      const err = e.error ?? 'unknown';
      // 'no-speech' and 'aborted' are routine on kid tablets — the
      // restart path in onend handles them. Only surface real faults.
      if (err !== 'no-speech' && err !== 'aborted') {
        setError(err);
        wantRef.current = false;
      }
    };
    rec.onend = () => {
      const withinWindow = Date.now() - attemptStartRef.current < ATTEMPT_WINDOW_MS;
      const shouldRestart =
        wantRef.current &&
        !gotFinalRef.current &&
        restartsRef.current < MAX_AUTO_RESTARTS &&
        withinWindow;
      if (shouldRestart) {
        restartsRef.current += 1;
        // Tiny breather — an immediate restart can throw on some engines.
        setTimeout(() => {
          if (wantRef.current && !gotFinalRef.current) buildAndStart();
        }, 150);
      } else {
        wantRef.current = false;
        setListening(false);
        setInterim('');
      }
    };

    recRef.current = rec;
    try {
      rec.start();
      return true;
    } catch {
      return false;
    }
  }, []);

  const start = useCallback(() => {
    setError(null);
    setTranscript('');
    setInterim('');
    setAlternatives([]);
    wantRef.current = true;
    gotFinalRef.current = false;
    restartsRef.current = 0;
    attemptStartRef.current = Date.now();
    if (buildAndStart()) {
      setListening(true);
    } else {
      wantRef.current = false;
      setListening(false);
      setError('start-failed');
    }
  }, [buildAndStart]);

  const stop = useCallback(() => {
    wantRef.current = false;
    try { recRef.current?.stop?.(); } catch { /* ok */ }
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterim('');
    setAlternatives([]);
    setError(null);
  }, []);

  return { supported, listening, transcript, interim, alternatives, error, start, stop, reset };
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

/**
 * Kid-screen-safe rendering of what the recognizer heard. Raw
 * hypotheses are often garbage ("buh luh aw b 7") — never show that
 * to a child. Returns null when there's nothing presentable; callers
 * show a friendly "didn't catch that" instead.
 */
export function presentableHeardWord(transcript: string, alternatives: string[]): string | null {
  for (const raw of [transcript, ...alternatives]) {
    if (!raw) continue;
    const words = raw.toLowerCase().trim().split(/\s+/);
    if (words.length === 0 || words.length > 3) continue;
    // Take the last word — recognizers love to prepend filler.
    const w = words[words.length - 1]?.replace(/[^a-z']/g, '') ?? '';
    if (w.length >= 2 && w.length <= 12) return w;
  }
  return null;
}
