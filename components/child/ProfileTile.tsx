'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ProfileTile({
  name, avatarEmoji, href,
}: { name: string; avatarEmoji: string; href: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center justify-center w-40 h-40 bg-white rounded-3xl border-4 border-ochre shadow-md hover:shadow-lg transition-shadow relative overflow-hidden"
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
        className="mt-2 font-display text-[22px] text-bark relative z-10"
        style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
      >
        {name}
      </div>
    </Link>
  );
}
