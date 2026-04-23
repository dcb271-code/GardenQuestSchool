'use client';

import { useEffect } from 'react';
import { loadSettings, applySettingsToDocument } from '@/lib/settings/useAccessibilitySettings';

export default function AccessibilityApplier() {
  useEffect(() => {
    applySettingsToDocument(loadSettings());
  }, []);
  return null;
}
