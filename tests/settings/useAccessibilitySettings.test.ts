import { describe, it, expect, beforeEach } from 'vitest';
import { loadSettings, saveSettings, applySettingsToDocument } from '@/lib/settings/useAccessibilitySettings';

describe('accessibility settings', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.body.className = '';
    document.body.style.fontSize = '';
  });

  it('loadSettings returns defaults when nothing saved', () => {
    expect(loadSettings()).toEqual({
      openDyslexic: false,
      reducedMotion: false,
      textSize: 1,
      voiceName: null,
      voiceRate: 0.88,
      challengeLevel: 'normal',
      soundEffects: true,
      gardenSoundtrack: false,
      soundtrackVolume: 0.18,
    });
  });

  it('saveSettings + loadSettings roundtrip', () => {
    saveSettings({
      openDyslexic: true,
      reducedMotion: true,
      textSize: 1.5,
      voiceName: 'Moira',
      voiceRate: 0.95,
      challengeLevel: 'harder',
      soundEffects: false,
      gardenSoundtrack: true,
      soundtrackVolume: 0.3,
    });
    expect(loadSettings()).toEqual({
      openDyslexic: true,
      reducedMotion: true,
      textSize: 1.5,
      voiceName: 'Moira',
      voiceRate: 0.95,
      challengeLevel: 'harder',
      soundEffects: false,
      gardenSoundtrack: true,
      soundtrackVolume: 0.3,
    });
  });

  it('loadSettings clamps invalid textSize to 1', () => {
    window.localStorage.setItem('gqs:accessibility', JSON.stringify({ textSize: 999 }));
    expect(loadSettings().textSize).toBe(1);
  });

  it('loadSettings clamps invalid voiceRate to default', () => {
    window.localStorage.setItem('gqs:accessibility', JSON.stringify({ voiceRate: 99 }));
    expect(loadSettings().voiceRate).toBe(0.88);
  });

  it('applySettingsToDocument toggles body classes and font size', () => {
    applySettingsToDocument({
      openDyslexic: true,
      reducedMotion: true,
      textSize: 1.25,
      voiceName: null,
      voiceRate: 0.88,
      challengeLevel: 'normal',
      soundEffects: true,
      gardenSoundtrack: false,
      soundtrackVolume: 0.18,
    });
    expect(document.body.classList.contains('dyslexic-font')).toBe(true);
    expect(document.body.classList.contains('reduced-motion')).toBe(true);
    expect(document.body.style.fontSize).toBe('125%');
  });
});
