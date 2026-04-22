'use client';

export default function LessonHeader({
  breadcrumb, onReplayAudio, onWonder,
}: { breadcrumb: string; onReplayAudio?: () => void; onWonder?: () => void }) {
  return (
    <div className="flex justify-between items-center py-4">
      <div className="text-kid-sm">{breadcrumb}</div>
      <div className="flex gap-3">
        <button onClick={onReplayAudio} aria-label="replay audio"
          className="text-2xl p-2 rounded-full bg-white border border-ochre">🔊</button>
        <button onClick={onWonder} aria-label="wondering"
          className="text-2xl p-2 rounded-full bg-white border border-ochre">❓</button>
      </div>
    </div>
  );
}
