'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface ActionDef {
  href: string;
  emoji: string;
  label: string;
  primary?: boolean;
}

export default function CompleteActions({ learnerId }: { learnerId: string }) {
  const actions: ActionDef[] = [
    { href: `/garden?learner=${learnerId}`, emoji: '🌿', label: 'garden',   primary: true },
    { href: `/journal?learner=${learnerId}`, emoji: '📖', label: 'journal' },
    { href: '/picker', emoji: '🏡', label: 'home' },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 gap-3 pt-4"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
      }}
    >
      {actions.map((a, i) => (
        <motion.div
          key={a.href}
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.4, ease: [0.22, 0.9, 0.34, 1] }}
        >
          <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02, y: -1 }}>
            <Link
              href={a.href}
              className={`w-full block rounded-2xl px-4 py-4 font-display text-center ${
                a.primary
                  ? 'bg-sage text-white border-4 border-sage'
                  : 'bg-white text-bark border-4 border-ochre'
              }`}
              style={{ minHeight: 64, fontWeight: 600 }}
            >
              <span className="text-2xl mr-1.5">{a.emoji}</span>
              {a.label}
            </Link>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}
