'use client';

import { useEffect, useState } from 'react';

export type ChallengeLevel = 'easier' | 'normal' | 'harder';

export interface AccessibilitySettings {
  openDyslexic: boolean;
  reducedMotion: boolean;
  textSize: 1 | 1.25 | 1.5;
  voiceName: string | null;  // preferred Web Speech voice name (null = auto)
  voiceRate: number;          // speech rate (0.7..1.1), default 0.88
  challengeLevel: ChallengeLevel;  // bias item difficulty up or down
  soundEffects: boolean;       // gentle UI sounds on correct/wrong/sparkle
  gardenSoundtrack: boolean;   // ambient music in the garden
  soundtrackVolume: number;    // 0.0..0.5 (gain capped to ~0.22 in the audio layer)
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  openDyslexic: false,
  reducedMotion: false,
  textSize: 1,
  voiceName: null,
  voiceRate: 0.88,
  challengeLevel: 'normal',
  soundEffects: true,
  gardenSoundtrack: false,
  soundtrackVolume: 0.10,
};

// Elo offset applied to the learner's per-skill rating when picking
// items. Higher offset → harder items served, lower → easier.
//
// Approximate grade-level mapping (combined with default student_elo
// of 1000 and a ±150 selection band):
//   easier  → ~700–1050   (kindergarten / very-early 1st grade)
//   normal  → ~1000–1300  (1st grade through early 2nd grade)
//   harder  → ~1150–1450  (mid-2nd grade and beyond)
export const CHALLENGE_LEVEL_ELO_OFFSET: Record<ChallengeLevel, number> = {
  easier: -150,
  normal: 150,
  harder: 300,
};

const STORAGE_KEY = 'gqs:accessibility';

export function loadSettings(): AccessibilitySettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      openDyslexic: !!parsed.openDyslexic,
      reducedMotion: !!parsed.reducedMotion,
      textSize: parsed.textSize === 1.25 || parsed.textSize === 1.5 ? parsed.textSize : 1,
      voiceName: typeof parsed.voiceName === 'string' ? parsed.voiceName : null,
      voiceRate: typeof parsed.voiceRate === 'number' && parsed.voiceRate >= 0.5 && parsed.voiceRate <= 1.5
        ? parsed.voiceRate
        : 0.88,
      challengeLevel: parsed.challengeLevel === 'easier' || parsed.challengeLevel === 'harder'
        ? parsed.challengeLevel
        : 'normal',
      soundEffects: typeof parsed.soundEffects === 'boolean' ? parsed.soundEffects : true,
      gardenSoundtrack: typeof parsed.gardenSoundtrack === 'boolean' ? parsed.gardenSoundtrack : false,
      soundtrackVolume: typeof parsed.soundtrackVolume === 'number' && parsed.soundtrackVolume >= 0 && parsed.soundtrackVolume <= 0.5
        ? parsed.soundtrackVolume
        : 0.10,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: AccessibilitySettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

export function applySettingsToDocument(s: AccessibilitySettings): void {
  if (typeof document === 'undefined') return;
  const body = document.body;
  body.classList.toggle('dyslexic-font', s.openDyslexic);
  body.classList.toggle('reduced-motion', s.reducedMotion);
  body.style.fontSize = `${s.textSize * 100}%`;
}

export function useAccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    applySettingsToDocument(loaded);
  }, []);

  const update = (patch: Partial<AccessibilitySettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    applySettingsToDocument(next);
  };

  return { settings, update };
}
