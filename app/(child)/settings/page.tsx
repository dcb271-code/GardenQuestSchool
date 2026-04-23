'use client';

import Link from 'next/link';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

export default function SettingsPage() {
  const { settings, update } = useAccessibilitySettings();

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/picker"
          className="text-2xl p-2 rounded-full bg-white border border-ochre"
          aria-label="back"
          style={{ minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >←</Link>
        <h1 className="text-kid-lg text-center flex-1">⚙️ Settings</h1>
        <div style={{ width: 44 }}></div>
      </div>

      <section className="bg-white border-4 border-ochre rounded-2xl p-4 space-y-4">
        <h2 className="text-kid-sm font-bold">Display</h2>

        <label className="flex items-center justify-between gap-3">
          <span className="text-kid-sm">Easier-to-read font (OpenDyslexic)</span>
          <input
            type="checkbox"
            checked={settings.openDyslexic}
            onChange={e => update({ openDyslexic: e.target.checked })}
            className="w-6 h-6"
          />
        </label>

        <label className="flex items-center justify-between gap-3">
          <span className="text-kid-sm">Reduce motion</span>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={e => update({ reducedMotion: e.target.checked })}
            className="w-6 h-6"
          />
        </label>

        <div>
          <div className="text-kid-sm mb-2">Text size</div>
          <div className="flex gap-2">
            {([1, 1.25, 1.5] as const).map(sz => (
              <button
                key={sz}
                onClick={() => update({ textSize: sz })}
                className={`flex-1 rounded-xl py-3 border-4 ${settings.textSize === sz ? 'border-forest bg-forest/10' : 'border-ochre bg-white'}`}
                style={{ touchAction: 'manipulation', minHeight: 60 }}
              >
                {sz === 1 ? 'Normal' : sz === 1.25 ? 'Bigger' : 'Biggest'}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
