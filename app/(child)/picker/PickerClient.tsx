'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import ProfileTile from '@/components/child/ProfileTile';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

const avatarMap: Record<string, string> = {
  fox: '🦊', bunny: '🐰', cat: '🐈', butterfly: '🦋', frog: '🐸', bee: '🐝',
};

interface Learner {
  id: string;
  first_name: string;
  avatar_key: string | null;
}

export default function PickerClient({ learners }: { learners: Learner[] }) {
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;

  return (
    <main className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden bg-cream">
      {/* Decorative garden silhouette in the background */}
      <PickerBackdrop reducedMotion={reducedMotion} />

      <div className="max-w-3xl w-full text-center space-y-10 relative z-10">
        <motion.div
          initial={reducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 0.9, 0.34, 1] }}
        >
          <div
            className="font-display italic text-[13px] text-bark/55 tracking-[0.3em] uppercase"
          >
            welcome back to
          </div>
          <h1
            className="font-display text-[52px] leading-[1.05] text-bark mt-2"
            style={{ fontWeight: 600, letterSpacing: '-0.02em' }}
          >
            <span className="italic font-[500] text-forest">garden</span> quest school
          </h1>
          <p className="font-display italic text-[18px] text-bark/70 mt-3">
            who&apos;s exploring today?
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-6 justify-center"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: reducedMotion ? 0 : 0.09, delayChildren: 0.5 },
            },
          }}
        >
          {learners.map(l => (
            <motion.div
              key={l.id}
              variants={{
                hidden: { opacity: 0, y: 18, scale: 0.92 },
                show: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.55, ease: [0.22, 0.9, 0.34, 1] }}
            >
              <ProfileTile
                name={l.first_name}
                avatarEmoji={avatarMap[l.avatar_key ?? 'fox'] ?? '🦊'}
                href={`/garden?learner=${l.id}`}
              />
            </motion.div>
          ))}

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 18, scale: 0.92 },
              show: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.55, ease: [0.22, 0.9, 0.34, 1] }}
          >
            <Link
              href="/parent/family"
              className="flex flex-col items-center justify-center w-40 h-40 bg-white/70 rounded-3xl border-4 border-dashed border-ochre/70 hover:scale-105 active:scale-95 transition-transform shadow-md opacity-75 hover:opacity-95"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="text-6xl text-bark/60">+</div>
              <div className="mt-2 font-display italic text-[18px] text-bark/70">add</div>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex gap-5 justify-center pt-6 flex-wrap font-display italic text-[15px] text-bark/50"
          initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <FooterLink href="/garden" emoji="🌿" label="garden" />
          <FooterLink href="/journal" emoji="📖" label="journal" />
          <FooterLink href="/habitats" emoji="🏠" label="habitats" />
          <FooterLink href="/settings" emoji="⚙️" label="settings" />
          <FooterLink href="/auth" emoji="👤" label="parent" />
        </motion.div>
      </div>
    </main>
  );
}

function FooterLink({ href, emoji, label }: { href: string; emoji: string; label: string }) {
  return (
    <Link
      href={href}
      className="hover:text-bark/80 transition-colors flex items-center gap-1.5"
    >
      <span className="not-italic text-base">{emoji}</span>
      {label}
    </Link>
  );
}

function PickerBackdrop({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="pickerSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7ECD6" />
          <stop offset="55%" stopColor="#F5EBDC" />
          <stop offset="100%" stopColor="#E8DFCE" />
        </linearGradient>
        <radialGradient id="pickerSun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF2B5" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#FFE89A" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FFE89A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky wash */}
      <rect width="1440" height="900" fill="url(#pickerSky)" />

      {/* Soft sun glow upper-right */}
      <circle cx={1180} cy={150} r={240} fill="url(#pickerSun)" />

      {/* Distant hills */}
      <path
        d="M 0 560 Q 240 500 460 540 T 900 525 T 1440 545 L 1440 900 L 0 900 Z"
        fill="#B8C4DB" opacity={0.35}
      />
      <path
        d="M 0 620 Q 280 560 560 600 T 1080 580 T 1440 605 L 1440 900 L 0 900 Z"
        fill="#A3BEA2" opacity={0.45}
      />
      <path
        d="M 0 680 Q 320 630 640 660 T 1200 650 T 1440 670 L 1440 900 L 0 900 Z"
        fill="#8AAF84" opacity={0.5}
      />

      {/* Ground sage */}
      <rect x={0} y={720} width={1440} height={180} fill="#AED29A" opacity={0.55} />

      {/* Drifting cloud — slow */}
      {!reducedMotion && (
        <motion.g
          initial={{ x: -240 }}
          animate={{ x: 1700 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        >
          <g transform="translate(0, 180)" opacity={0.85}>
            <ellipse cx={-28} cy={-2} rx={28} ry={15} fill="#FFFFFF" />
            <ellipse cx={30}  cy={-2} rx={32} ry={16} fill="#FFFFFF" />
            <ellipse cx={0}   cy={0}  rx={46} ry={20} fill="#FFFFFF" />
            <ellipse cx={10}  cy={-16} rx={24} ry={14} fill="#FFFFFF" />
          </g>
        </motion.g>
      )}

      {/* Simple tree silhouettes at the edges, low opacity */}
      <g opacity={0.55}>
        <TreeSilhouette cx={120} cy={700} scale={1.2} />
        <TreeSilhouette cx={260} cy={720} scale={0.8} />
        <TreeSilhouette cx={1320} cy={690} scale={1.3} />
        <TreeSilhouette cx={1180} cy={720} scale={0.9} />
      </g>

      {/* Small birds far in the distance */}
      {!reducedMotion && (
        <motion.g
          initial={{ opacity: 0, x: -40, y: 0 }}
          animate={{
            opacity: [0, 0.6, 0.6, 0],
            x: [-40, 400, 900, 1480],
            y: [0, -40, -20, -10],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear', repeatDelay: 12 }}
          transform="translate(0, 230)"
        >
          <path d="M -8 0 Q -4 -5 0 0 Q 4 -5 8 0" stroke="#5A3B1F" strokeWidth={1.3} fill="none" opacity={0.6} strokeLinecap="round" />
          <path d="M 20 8 Q 24 3 28 8 Q 32 3 36 8" stroke="#5A3B1F" strokeWidth={1.1} fill="none" opacity={0.5} strokeLinecap="round" />
        </motion.g>
      )}
    </svg>
  );
}

function TreeSilhouette({ cx, cy, scale }: { cx: number; cy: number; scale: number }) {
  return (
    <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
      <rect x={-4} y={-20} width={8} height={40} fill="#6B4423" />
      <path
        d="M -45 -20 Q -55 -55 -20 -75 Q 15 -90 35 -65 Q 55 -40 40 -15 Q 10 -5 -20 -10 Q -45 -12 -45 -20 Z"
        fill="#6B8E5A"
      />
    </g>
  );
}
