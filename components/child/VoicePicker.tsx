'use client';

import { useEffect, useState } from 'react';
import { getAvailableVoices, speak, isSpeechAvailable } from '@/lib/audio/tts';

interface VoicePickerProps {
  selected: string | null;
  rate: number;
  onSelect: (voiceName: string | null) => void;
  onRateChange: (rate: number) => void;
}

// Regions we group voices into for the picker, in display order.
// Voices detected as one of these langs get bucketed; the rest land in "Other".
const REGION_LABELS: Array<{ label: string; matcher: (lang: string, name: string) => boolean; icon: string }> = [
  { label: 'British',    matcher: l => l === 'en-GB', icon: '🇬🇧' },
  { label: 'Irish',      matcher: l => l === 'en-IE', icon: '🇮🇪' },
  { label: 'Scottish',   matcher: (_l, n) => /fiona|scottish/i.test(n), icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { label: 'Australian', matcher: l => l === 'en-AU', icon: '🇦🇺' },
  { label: 'Indian',     matcher: l => l === 'en-IN', icon: '🇮🇳' },
  { label: 'South Afr.', matcher: l => l === 'en-ZA', icon: '🇿🇦' },
  { label: 'American',   matcher: l => l === 'en-US', icon: '🇺🇸' },
  { label: 'Canadian',   matcher: l => l === 'en-CA', icon: '🇨🇦' },
];

// Heuristic: does this voice name sound feminine? (used to prioritize in UI)
const FEMININE_NAMES = /samantha|karen|moira|fiona|serena|kate|tessa|veena|hazel|susan|heera|sonia|libby|natasha|clara|aria|ava|amy|joanna|emma|olivia|catherine|allison|female/i;

export default function VoicePicker({ selected, rate, onSelect, onRateChange }: VoicePickerProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isSpeechAvailable()) {
      setLoaded(true);
      return;
    }
    // Voices load async — listen for them.
    const loadVoices = () => {
      const vs = getAvailableVoices();
      if (vs.length > 0) {
        setVoices(vs);
        setLoaded(true);
      }
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    // Safety fallback: try again after a short delay
    const t = setTimeout(loadVoices, 400);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      clearTimeout(t);
    };
  }, []);

  const preview = (voiceName: string | null) => {
    void speak(
      'Hello! Let\'s go exploring in the garden today.',
      { voice: voiceName ?? undefined, rate }
    );
  };

  if (!isSpeechAvailable()) {
    return (
      <div className="text-kid-sm text-bark/70 italic">
        Your browser does not support speech.
      </div>
    );
  }

  if (!loaded) {
    return <div className="text-kid-sm text-bark/70 italic">loading voices…</div>;
  }

  // Filter to English voices only, sort with feminine-names bubbled up.
  const english = voices
    .filter(v => v.lang.toLowerCase().startsWith('en'))
    .sort((a, b) => {
      const aFem = FEMININE_NAMES.test(a.name) ? 0 : 1;
      const bFem = FEMININE_NAMES.test(b.name) ? 0 : 1;
      if (aFem !== bFem) return aFem - bFem;
      return a.name.localeCompare(b.name);
    });

  // Bucket by region
  const buckets: Record<string, SpeechSynthesisVoice[]> = {};
  for (const v of english) {
    const region = REGION_LABELS.find(r => r.matcher(v.lang, v.name));
    const key = region?.label ?? 'Other';
    (buckets[key] ??= []).push(v);
  }

  const selectedVoice = voices.find(v => v.name === selected) ?? null;

  return (
    <div className="space-y-4">
      {/* Current voice + preview */}
      <div className="bg-cream/60 border-2 border-ochre rounded-xl p-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wider text-bark/60 font-display italic">current voice</div>
          <div className="font-display text-[17px] text-bark truncate" style={{ fontWeight: 500 }}>
            {selectedVoice ? selectedVoice.name : '✨ automatic (best available)'}
          </div>
          {selectedVoice && (
            <div className="text-xs text-bark/60 mt-0.5">{selectedVoice.lang}</div>
          )}
        </div>
        <button
          onClick={() => preview(selected)}
          className="shrink-0 font-display italic text-[15px] px-4 py-2 rounded-full bg-sage text-white"
          style={{ touchAction: 'manipulation', minHeight: 44 }}
        >
          ▶ hear it
        </button>
      </div>

      {/* Rate slider */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <div className="font-display italic text-[15px] text-bark/70">reading speed</div>
          <div className="text-xs text-bark/60 font-mono">{rate.toFixed(2)}×</div>
        </div>
        <input
          type="range"
          min={0.7} max={1.1} step={0.02}
          value={rate}
          onChange={e => onRateChange(parseFloat(e.target.value))}
          className="w-full accent-sage"
          style={{ touchAction: 'manipulation' }}
        />
        <div className="flex justify-between text-[11px] text-bark/50 font-display italic mt-1">
          <span>slower</span>
          <span>faster</span>
        </div>
      </div>

      {/* Automatic option */}
      <div>
        <button
          onClick={() => { onSelect(null); preview(null); }}
          className={`w-full text-left px-4 py-3 rounded-xl border-2 flex items-center justify-between ${selected === null ? 'border-forest bg-forest/10' : 'border-ochre/60 bg-white hover:bg-ochre/5'}`}
          style={{ touchAction: 'manipulation', minHeight: 52 }}
        >
          <div>
            <div className="font-display text-[17px] text-bark" style={{ fontWeight: 500 }}>
              ✨ automatic
            </div>
            <div className="text-xs text-bark/60 italic font-display">pick the best available voice</div>
          </div>
          {selected === null && <div className="text-forest">✓</div>}
        </button>
      </div>

      {/* Voice list grouped by region */}
      {REGION_LABELS.map(region => {
        const list = buckets[region.label];
        if (!list || list.length === 0) return null;
        return (
          <div key={region.label}>
            <div className="text-xs uppercase tracking-wider text-bark/55 font-display italic mb-2 flex items-center gap-2">
              <span className="text-base not-italic">{region.icon}</span>
              {region.label}
            </div>
            <div className="space-y-1.5">
              {list.map(v => (
                <VoiceRow
                  key={v.name}
                  voice={v}
                  isSelected={selected === v.name}
                  onSelect={() => { onSelect(v.name); preview(v.name); }}
                />
              ))}
            </div>
          </div>
        );
      })}

      {buckets['Other'] && (
        <div>
          <div className="text-xs uppercase tracking-wider text-bark/55 font-display italic mb-2">other</div>
          <div className="space-y-1.5">
            {buckets['Other'].map(v => (
              <VoiceRow
                key={v.name}
                voice={v}
                isSelected={selected === v.name}
                onSelect={() => { onSelect(v.name); preview(v.name); }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VoiceRow({
  voice, isSelected, onSelect,
}: {
  voice: SpeechSynthesisVoice;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isFeminine = FEMININE_NAMES.test(voice.name);
  const isNatural = /natural|enhanced|premium/i.test(voice.name);
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 rounded-lg border-2 flex items-center gap-3 ${isSelected ? 'border-forest bg-forest/10' : 'border-transparent hover:border-ochre/40 bg-white hover:bg-ochre/5'}`}
      style={{ touchAction: 'manipulation', minHeight: 44 }}
    >
      <div className="flex-1 min-w-0">
        <div className="font-display text-[15px] text-bark truncate" style={{ fontWeight: 500 }}>
          {voice.name}
        </div>
        <div className="flex gap-1.5 mt-0.5 flex-wrap">
          {isNatural && (
            <span className="text-[10px] bg-sage/20 text-forest px-1.5 py-0.5 rounded font-display italic">natural</span>
          )}
          {isFeminine && (
            <span className="text-[10px] bg-rose/20 text-rose px-1.5 py-0.5 rounded font-display italic">female</span>
          )}
          <span className="text-[10px] text-bark/50 font-mono">{voice.lang}</span>
        </div>
      </div>
      {isSelected && <div className="text-forest text-lg">✓</div>}
    </button>
  );
}
