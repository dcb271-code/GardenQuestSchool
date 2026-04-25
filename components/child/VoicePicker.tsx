'use client';

import { useEffect, useState } from 'react';
import { getAvailableVoices, speak, isSpeechAvailable } from '@/lib/audio/tts';
import { GOOGLE_VOICE_PREFIX, buildTtsUrl } from '@/lib/audio/useNarrator';

interface VoicePickerProps {
  selected: string | null;
  rate: number;
  onSelect: (voiceName: string | null) => void;
  onRateChange: (rate: number) => void;
}

// Curated list of Google Cloud TTS voices we've picked specifically for
// storybook-style narration for a 7-year-old. All within the 1M free
// chars/month tier (Neural2); Studio voices have a lower 100k tier.
interface GoogleVoice {
  code: string;         // e.g., "en-GB-Neural2-A"
  displayName: string;
  region: string;
  description: string;
  premium?: boolean;    // Studio voices are premium (lower free tier)
}

const GOOGLE_VOICES: GoogleVoice[] = [
  { code: 'en-GB-Neural2-A', displayName: 'Wren',  region: 'British',    description: 'warm, story-ready' },
  { code: 'en-GB-Neural2-C', displayName: 'Isla',  region: 'British',    description: 'bright, friendly' },
  { code: 'en-GB-Neural2-F', displayName: 'Mara',  region: 'British',    description: 'soft-spoken' },
  { code: 'en-GB-Studio-B',  displayName: 'Beatrix', region: 'British',  description: 'audiobook-grade', premium: true },
  { code: 'en-GB-Studio-C',  displayName: 'Celia', region: 'British',    description: 'audiobook-grade', premium: true },
  { code: 'en-AU-Neural2-A', displayName: 'Piper', region: 'Australian', description: 'warm Aussie' },
  { code: 'en-AU-Neural2-C', displayName: 'Willa', region: 'Australian', description: 'bright Aussie' },
  { code: 'en-AU-News-E',    displayName: 'Rowan', region: 'Australian', description: 'clear & gentle' },
  { code: 'en-IN-Neural2-A', displayName: 'Asha',  region: 'Indian',     description: 'melodic English' },
  { code: 'en-US-Neural2-F', displayName: 'Hazel', region: 'American',   description: 'warm American' },
  { code: 'en-US-Neural2-C', displayName: 'Jemma', region: 'American',   description: 'bright American' },
  { code: 'en-US-Studio-O',  displayName: 'Nora',  region: 'American',   description: 'audiobook-grade', premium: true },
];

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

const FEMININE_NAMES = /samantha|karen|moira|fiona|serena|kate|tessa|veena|hazel|susan|heera|sonia|libby|natasha|clara|aria|ava|amy|joanna|emma|olivia|catherine|allison|female/i;

export default function VoicePicker({ selected, rate, onSelect, onRateChange }: VoicePickerProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isSpeechAvailable()) {
      setLoaded(true);
      return;
    }
    const loadVoices = () => {
      const vs = getAvailableVoices();
      if (vs.length > 0) {
        setVoices(vs);
        setLoaded(true);
      }
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    const t = setTimeout(loadVoices, 400);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      clearTimeout(t);
    };
  }, []);

  const previewVoice = async (voiceName: string | null) => {
    const sample = "Hello! Let's go exploring in the garden today.";
    if (voiceName && voiceName.startsWith(GOOGLE_VOICE_PREFIX)) {
      setPreviewing(voiceName);
      try {
        const googleVoice = voiceName.slice(GOOGLE_VOICE_PREFIX.length);
        const url = buildTtsUrl(sample, googleVoice, rate);
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.onended = () => setPreviewing(null);
        audio.onerror = () => setPreviewing(null);
        await audio.play();
      } catch (err) {
        console.warn('Preview failed:', err);
        setPreviewing(null);
      }
    } else {
      void speak(sample, { voice: voiceName ?? undefined, rate });
    }
  };

  if (!isSpeechAvailable() && !true /* Google is still available via fetch */) {
    return (
      <div className="text-kid-sm text-bark/70 italic">
        Your browser does not support speech.
      </div>
    );
  }

  // Filter web speech voices to English, sort with feminine-names bubbled up.
  const english = voices
    .filter(v => v.lang.toLowerCase().startsWith('en'))
    .sort((a, b) => {
      const aFem = FEMININE_NAMES.test(a.name) ? 0 : 1;
      const bFem = FEMININE_NAMES.test(b.name) ? 0 : 1;
      if (aFem !== bFem) return aFem - bFem;
      return a.name.localeCompare(b.name);
    });

  // Bucket web speech voices by region
  const buckets: Record<string, SpeechSynthesisVoice[]> = {};
  for (const v of english) {
    const region = REGION_LABELS.find(r => r.matcher(v.lang, v.name));
    const key = region?.label ?? 'Other';
    (buckets[key] ??= []).push(v);
  }

  // Selected display
  const selectedIsGoogle = selected?.startsWith(GOOGLE_VOICE_PREFIX);
  const selectedGoogle = selectedIsGoogle
    ? GOOGLE_VOICES.find(v => `${GOOGLE_VOICE_PREFIX}${v.code}` === selected)
    : null;
  const selectedWeb = !selectedIsGoogle
    ? voices.find(v => v.name === selected)
    : null;

  const selectedLabel = selectedGoogle
    ? `${selectedGoogle.displayName} · ${selectedGoogle.region}`
    : selectedWeb
      ? selectedWeb.name
      : '✨ automatic (best available)';

  return (
    <div className="space-y-4">
      {/* Current voice + preview */}
      <div className="bg-cream/60 border-2 border-ochre rounded-xl p-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wider text-bark/60 font-display italic">current voice</div>
          <div className="font-display text-[17px] text-bark truncate" style={{ fontWeight: 500 }}>
            {selectedLabel}
          </div>
          {selectedGoogle && (
            <div className="text-xs text-bark/60 mt-0.5 font-display italic">
              ☁ google cloud · {selectedGoogle.description}
            </div>
          )}
          {selectedWeb && (
            <div className="text-xs text-bark/60 mt-0.5">{selectedWeb.lang}</div>
          )}
        </div>
        <button
          onClick={() => previewVoice(selected)}
          disabled={previewing === selected}
          className="shrink-0 font-display italic text-[15px] px-4 py-2 rounded-full bg-sage text-white disabled:opacity-70"
          style={{ touchAction: 'manipulation', minHeight: 44 }}
        >
          {previewing === selected ? 'playing…' : '▶ hear it'}
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

      {/* GOOGLE CLOUD VOICES — top of the list as our best picks */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">☁</span>
          <div className="text-xs uppercase tracking-wider text-bark/60 font-display italic">
            modern voices · google cloud
          </div>
        </div>
        <div className="space-y-1.5">
          {GOOGLE_VOICES.map(gv => {
            const fullCode = `${GOOGLE_VOICE_PREFIX}${gv.code}`;
            return (
              <GoogleVoiceRow
                key={gv.code}
                voice={gv}
                isSelected={selected === fullCode}
                isPreviewing={previewing === fullCode}
                onSelect={() => { onSelect(fullCode); previewVoice(fullCode); }}
              />
            );
          })}
        </div>
      </div>

      {/* Automatic (no preference, lets browser pick best web speech) */}
      <div>
        <button
          onClick={() => { onSelect(null); previewVoice(null); }}
          className={`w-full text-left px-4 py-3 rounded-xl border-2 flex items-center justify-between ${selected === null ? 'border-forest bg-forest/10' : 'border-ochre/60 bg-white hover:bg-ochre/5'}`}
          style={{ touchAction: 'manipulation', minHeight: 52 }}
        >
          <div>
            <div className="font-display text-[17px] text-bark" style={{ fontWeight: 500 }}>
              ✨ automatic
            </div>
            <div className="text-xs text-bark/60 italic font-display">pick the best available voice on this device</div>
          </div>
          {selected === null && <div className="text-forest">✓</div>}
        </button>
      </div>

      {/* Web Speech voices (device voices) — only shown if available */}
      {loaded && english.length > 0 && (
        <details className="border-2 border-ochre/60 rounded-xl bg-white">
          <summary className="cursor-pointer px-4 py-3 font-display italic text-[15px] text-bark/70">
            device voices ({english.length})
          </summary>
          <div className="px-4 pb-4 space-y-3">
            {REGION_LABELS.map(region => {
              const list = buckets[region.label];
              if (!list || list.length === 0) return null;
              return (
                <div key={region.label}>
                  <div className="text-xs uppercase tracking-wider text-bark/55 font-display italic mb-1.5 flex items-center gap-2">
                    <span className="text-base not-italic">{region.icon}</span>
                    {region.label}
                  </div>
                  <div className="space-y-1">
                    {list.map(v => (
                      <VoiceRow
                        key={v.name}
                        voice={v}
                        isSelected={selected === v.name}
                        onSelect={() => { onSelect(v.name); previewVoice(v.name); }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
            {buckets['Other'] && (
              <div>
                <div className="text-xs uppercase tracking-wider text-bark/55 font-display italic mb-1.5">other</div>
                <div className="space-y-1">
                  {buckets['Other'].map(v => (
                    <VoiceRow
                      key={v.name}
                      voice={v}
                      isSelected={selected === v.name}
                      onSelect={() => { onSelect(v.name); previewVoice(v.name); }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}

function GoogleVoiceRow({
  voice, isSelected, isPreviewing, onSelect,
}: {
  voice: GoogleVoice;
  isSelected: boolean;
  isPreviewing: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 rounded-lg border-2 flex items-center gap-3 ${isSelected ? 'border-forest bg-forest/10' : 'border-ochre/30 hover:border-ochre bg-white hover:bg-ochre/5'}`}
      style={{ touchAction: 'manipulation', minHeight: 48 }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-display text-[17px] text-bark" style={{ fontWeight: 600, letterSpacing: '-0.005em' }}>
            {voice.displayName}
          </div>
          <span className="text-[10px] text-bark/55 font-display italic">
            {voice.region}
          </span>
          {voice.premium && (
            <span className="text-[10px] bg-sun/40 text-bark px-1.5 py-0.5 rounded font-display italic">
              studio
            </span>
          )}
        </div>
        <div className="text-[12px] text-bark/60 font-display italic mt-0.5">
          {voice.description}
        </div>
      </div>
      {isPreviewing && <div className="text-sage text-sm animate-pulse">♪</div>}
      {isSelected && !isPreviewing && <div className="text-forest text-lg">✓</div>}
    </button>
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
      className={`w-full text-left px-3 py-2 rounded-lg border-2 flex items-center gap-3 ${isSelected ? 'border-forest bg-forest/10' : 'border-transparent hover:border-ochre/40 bg-white hover:bg-ochre/5'}`}
      style={{ touchAction: 'manipulation', minHeight: 44 }}
    >
      <div className="flex-1 min-w-0">
        <div className="font-display text-[14px] text-bark truncate" style={{ fontWeight: 500 }}>
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
