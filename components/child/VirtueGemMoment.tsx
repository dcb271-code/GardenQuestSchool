'use client';

const VIRTUE_EMOJI: Record<string, string> = {
  persistence: '💎',
  curiosity: '🔍',
  noticing: '👁️',
  care: '💗',
  practice: '🔁',
  courage: '🦁',
  wondering: '❓',
};

const VIRTUE_LABEL: Record<string, string> = {
  persistence: 'Persistence',
  curiosity: 'Curiosity',
  noticing: 'Noticing',
  care: 'Care',
  practice: 'Practice',
  courage: 'Courage',
  wondering: 'Wondering',
};

export default function VirtueGemMoment({
  virtue, narrativeText,
}: { virtue: string; narrativeText: string }) {
  return (
    <div className="bg-rose/10 border-4 border-rose rounded-2xl p-4 flex items-start gap-3">
      <div className="text-4xl">{VIRTUE_EMOJI[virtue] ?? '💎'}</div>
      <div className="flex-1">
        <div className="text-kid-sm font-bold text-bark">{VIRTUE_LABEL[virtue] ?? virtue}</div>
        <div className="text-kid-sm mt-1">{narrativeText}</div>
      </div>
    </div>
  );
}
