'use client';

export default function ExpeditionCard({
  emoji, title, hint, onSelect,
}: { emoji: string; title: string; hint: string; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="flex items-center gap-4 bg-white hover:bg-ochre/10 active:bg-ochre/20 rounded-2xl border-4 border-terracotta px-5 py-4 shadow-md w-full text-left"
      style={{ touchAction: 'manipulation', minHeight: 80 }}
    >
      <span className="text-5xl">{emoji}</span>
      <div>
        <div className="text-kid-md">{title}</div>
        <div className="text-sm opacity-70">{hint}</div>
      </div>
    </button>
  );
}
