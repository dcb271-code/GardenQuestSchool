'use client';

import { useEffect } from 'react';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { setSfxEnabled } from '@/lib/audio/sfx';

/**
 * Bridges the global soundEffects setting into the imperative SFX
 * library, so all play* calls anywhere become no-ops when the user
 * has turned sound effects off.
 *
 * Mounted once at the root layout.
 */
export default function SfxBinder() {
  const { settings } = useAccessibilitySettings();
  useEffect(() => {
    setSfxEnabled(!!settings.soundEffects);
  }, [settings.soundEffects]);
  return null;
}
