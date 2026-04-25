'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ACTIVE_LEARNER_COOKIE } from '@/lib/learner/activeLearner';

// Pull the learner id back out of `/garden?learner=…` so we can stash
// it as the active-learner cookie when the tile is tapped. The cookie
// then survives subsequent navigations to /garden, /journal, etc.
// without query params (e.g. footer links, manual URL entry).
function extractLearnerId(href: string): string | null {
  try {
    // Use a dummy origin so URL() works on relative paths.
    const u = new URL(href, 'https://x.invalid');
    return u.searchParams.get('learner');
  } catch {
    return null;
  }
}

const CHALLENGE_EMOJI: Record<string, string> = {
  easier: '🌱',
  normal: '🍃',
  harder: '🔥',
};

export default function ProfileTile({
  name, avatarEmoji, href,
  gradeLevel = null,
  defaultChallenge = null,
}: {
  name: string;
  avatarEmoji: string;
  href: string;
  gradeLevel?: number | null;
  defaultChallenge?: 'easier' | 'normal' | 'harder' | null;
}) {
  const onTap = () => {
    const id = extractLearnerId(href);
    if (id && typeof document !== 'undefined') {
      // 1 year — pure UX preference, no auth implication.
      document.cookie = `${ACTIVE_LEARNER_COOKIE}=${id}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };
  return (
    <Link
      href={href}
      onClick={onTap}
      className="group flex flex-col items-center justify-center w-40 h-44 bg-white rounded-3xl border-4 border-ochre shadow-md hover:shadow-lg transition-shadow relative overflow-hidden"
      style={{ touchAction: 'manipulation' }}
    >
      {/* soft warm inner glow on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(255, 230, 150, 0.55), transparent 65%)',
          opacity: 0,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />
      <motion.div
        className="text-7xl relative z-10"
        whileHover={{ scale: 1.08, rotate: [0, -4, 4, 0] }}
        transition={{ duration: 0.6 }}
      >
        {avatarEmoji}
      </motion.div>
      <div
        className="mt-2 font-display text-[22px] text-bark relative z-10 leading-none"
        style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
      >
        {name}
      </div>
      {/* Grade + challenge badge — sits under the name so the parent
          (and the child) sees at a glance who's calibrated to what.
          Hidden when both fields are absent so older learners that
          predate the migration don't render an ugly empty pill. */}
      {(gradeLevel || defaultChallenge) && (
        <div className="mt-1.5 flex items-center gap-1 relative z-10">
          {gradeLevel && (
            <span
              className="font-display italic text-[11px] tracking-[0.1em] uppercase text-bark/70 bg-cream/80 border border-ochre/50 rounded-full px-2 py-0.5"
              style={{ fontWeight: 600 }}
            >
              Grade {gradeLevel}
            </span>
          )}
          {defaultChallenge && (
            <span
              className="text-[12px]"
              title={defaultChallenge}
              aria-label={`${defaultChallenge} challenge`}
            >
              {CHALLENGE_EMOJI[defaultChallenge] ?? '🍃'}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
