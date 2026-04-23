'use client';
import Link from 'next/link';

export default function LessonHeader({
  breadcrumb, learnerId, onReplayAudio, onWonder, onSkip,
}: {
  breadcrumb: string;
  learnerId?: string | null;
  onReplayAudio?: () => void;
  onWonder?: () => void;
  onSkip?: () => void;
}) {
  return (
    <div className="flex justify-between items-center py-4 gap-2">
      <Link
        href={learnerId ? `/explore?learner=${learnerId}` : '/picker'}
        className="text-2xl p-2 rounded-full bg-white border border-ochre hover:bg-ochre/10 active:bg-ochre/20"
        aria-label="exit to expedition picker"
        style={{ touchAction: 'manipulation', minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        ✕
      </Link>
      <div className="text-kid-sm flex-1 text-center truncate">{breadcrumb}</div>
      <div className="flex gap-2">
        {onSkip && (
          <button
            onClick={onSkip}
            aria-label="skip this question"
            className="text-lg px-3 py-1 rounded-full bg-white border border-ochre hover:bg-ochre/10"
            style={{ touchAction: 'manipulation', minHeight: 44 }}
          >
            skip
          </button>
        )}
        <button onClick={onReplayAudio} aria-label="replay audio"
          className="text-2xl p-2 rounded-full bg-white border border-ochre"
          style={{ touchAction: 'manipulation', minWidth: 44, minHeight: 44 }}>🔊</button>
        <button onClick={onWonder} aria-label="wondering"
          className="text-2xl p-2 rounded-full bg-white border border-ochre"
          style={{ touchAction: 'manipulation', minWidth: 44, minHeight: 44 }}>❓</button>
      </div>
    </div>
  );
}
