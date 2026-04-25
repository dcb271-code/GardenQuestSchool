'use client';

import Link from 'next/link';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import VoicePicker from '@/components/child/VoicePicker';

export default function SettingsPage() {
  const { settings, update } = useAccessibilitySettings();

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link
          href="/picker"
          className="text-2xl p-2 rounded-full bg-white border border-ochre"
          aria-label="back"
          style={{ minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >←</Link>
        <h1 className="font-display text-[32px] text-bark text-center flex-1" style={{ fontWeight: 600, letterSpacing: '-0.015em' }}>
          <span className="italic text-forest">settings</span>
        </h1>
        <div style={{ width: 44 }}></div>
      </div>

      <section className="bg-white border-4 border-ochre rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="font-display text-[20px] text-bark" style={{ fontWeight: 600 }}>
            Challenge level <span className="font-display italic text-bark/60 text-[16px] font-normal">· make it just right</span>
          </h2>
          <p className="text-xs text-bark/60 mt-1 font-display italic">
            If a learner says &ldquo;this is too easy!&rdquo; or &ldquo;this is too hard!&rdquo;, slide it here.
            Affects how hard the questions you see actually are.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([
            { key: 'easier' as const,  label: 'Easier',  emoji: '🌱', desc: 'gentler' },
            { key: 'normal' as const,  label: 'Just right', emoji: '🍃', desc: 'normal' },
            { key: 'harder' as const,  label: 'Harder', emoji: '🔥', desc: 'bring it' },
          ]).map(opt => (
            <button
              key={opt.key}
              onClick={() => update({ challengeLevel: opt.key })}
              className={`rounded-xl py-3 px-2 border-4 text-center ${
                settings.challengeLevel === opt.key
                  ? 'border-forest bg-forest/10'
                  : 'border-ochre bg-white hover:border-ochre/80'
              }`}
              style={{ touchAction: 'manipulation', minHeight: 72 }}
            >
              <div className="text-2xl">{opt.emoji}</div>
              <div className="font-display text-[15px] text-bark mt-0.5" style={{ fontWeight: 600 }}>
                {opt.label}
              </div>
              <div className="font-display italic text-[11px] text-bark/55">
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white border-4 border-ochre rounded-2xl p-5 space-y-5">
        <h2 className="font-display text-[20px] text-bark" style={{ fontWeight: 600 }}>
          Display
        </h2>

        <label className="flex items-center justify-between gap-3">
          <span className="text-kid-sm">Easier-to-read font (OpenDyslexic)</span>
          <input
            type="checkbox"
            checked={settings.openDyslexic}
            onChange={e => update({ openDyslexic: e.target.checked })}
            className="w-6 h-6 accent-forest"
          />
        </label>

        <label className="flex items-center justify-between gap-3">
          <span className="text-kid-sm">Reduce motion</span>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={e => update({ reducedMotion: e.target.checked })}
            className="w-6 h-6 accent-forest"
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

      <section className="bg-white border-4 border-ochre rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="font-display text-[20px] text-bark" style={{ fontWeight: 600 }}>
            Narrator <span className="font-display italic text-bark/60 text-[16px] font-normal">· the voice that reads to you</span>
          </h2>
          <p className="text-xs text-bark/60 mt-1 font-display italic">
            British, Irish, and Australian voices often sound the most storybook-ish.
            Tap a voice to preview it.
          </p>
        </div>
        <VoicePicker
          selected={settings.voiceName}
          rate={settings.voiceRate}
          onSelect={name => update({ voiceName: name })}
          onRateChange={rate => update({ voiceRate: rate })}
        />
      </section>
    </main>
  );
}
