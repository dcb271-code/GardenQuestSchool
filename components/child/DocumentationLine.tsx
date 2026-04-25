'use client';

import { motion } from 'framer-motion';

export default function DocumentationLine({ text, index = 0 }: { text: string; index?: number }) {
  return (
    <motion.div
      className="bg-white/70 border-l-[5px] border-terracotta pl-4 pr-3 py-3 rounded-r-xl"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1, ease: [0.22, 0.9, 0.34, 1] }}
    >
      <div className="font-display text-[16px] text-bark leading-snug" style={{ fontWeight: 500 }}>
        {text}
      </div>
    </motion.div>
  );
}
