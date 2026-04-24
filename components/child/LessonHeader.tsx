'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
    <motion.div
      className="flex justify-between items-center py-4 gap-2"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Link
        href={learnerId ? `/garden?learner=${learnerId}` : '/picker'}
        className="text-2xl p-2 rounded-full bg-white border border-ochre hover:bg-ochre/10 active:bg-ochre/20"
        aria-label="exit to garden"
        style={{
          touchAction: 'manipulation',
          minWidth: 44,
          minHeight: 44,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className="text-bark/70">✕</span>
      </Link>

      <div
        className="flex-1 text-center truncate font-display text-[17px] text-bark/85"
        style={{ fontWeight: 500, letterSpacing: '-0.005em' }}
      >
        {breadcrumb}
      </div>

      <div className="flex gap-2">
        {onSkip && (
          <button
            onClick={onSkip}
            aria-label="skip this question"
            className="font-display italic text-[15px] px-3 py-1 rounded-full bg-white border border-ochre/70 text-bark/70 hover:bg-ochre/10"
            style={{ touchAction: 'manipulation', minHeight: 44 }}
          >
            skip
          </button>
        )}
        <button
          onClick={onReplayAudio}
          aria-label="replay audio"
          className="text-2xl p-2 rounded-full bg-white border border-ochre hover:bg-ochre/10 active:bg-ochre/20"
          style={{ touchAction: 'manipulation', minWidth: 44, minHeight: 44 }}
        >
          🔊
        </button>
        <button
          onClick={onWonder}
          aria-label="wondering"
          className="text-2xl p-2 rounded-full bg-white border border-ochre hover:bg-ochre/10 active:bg-ochre/20"
          style={{ touchAction: 'manipulation', minWidth: 44, minHeight: 44 }}
        >
          ❓
        </button>
      </div>
    </motion.div>
  );
}
