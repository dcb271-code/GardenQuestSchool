'use client';

import { motion } from 'framer-motion';
import FractionPie from './FractionPie';
import type {
  FractionCompareVisualContent,
  FractionCompareVisualResponse,
} from '@/lib/packs/math/types';

/**
 * Two fraction visuals side by side, with the three comparison
 * symbols ( <  =  > ) as tap targets underneath. The child decides
 * which fraction is bigger by looking at the two shapes.
 *
 * Both shapes use the SAME visualisation kind (pie or bar) and the
 * SAME total size, so the comparison is honestly visual — bigger
 * shaded area = bigger fraction.
 */
export default function FractionCompare({
  content, onSubmit,
}: {
  content: FractionCompareVisualContent;
  onSubmit: (r: FractionCompareVisualResponse) => void;
  retries: number;
}) {
  return (
    <div className="space-y-5 py-2">
      <div className="text-center font-display text-[19px] text-bark bg-cream/60 p-3 rounded-2xl border-2 border-ochre/40">
        {content.promptText}
      </div>

      {/* Two fractions side by side, each labelled with its
          formatted "n/d" so the child connects the picture to the
          symbol. */}
      <div className="flex justify-center items-end gap-6 flex-wrap">
        <FractionPie
          numerator={content.left.numerator}
          denominator={content.left.denominator}
          shape={content.shape}
          size={content.shape === 'pie' ? 150 : 180}
          label={`${content.left.numerator}/${content.left.denominator}`}
        />
        <div
          className="text-bark/40 font-mono text-3xl pb-6"
          aria-hidden
        >
          ?
        </div>
        <FractionPie
          numerator={content.right.numerator}
          denominator={content.right.denominator}
          shape={content.shape}
          size={content.shape === 'pie' ? 150 : 180}
          label={`${content.right.numerator}/${content.right.denominator}`}
        />
      </div>

      {/* Symbol picker — three big tap targets */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.3 } } }}
      >
        {(['<', '=', '>'] as const).map(sym => (
          <motion.button
            key={sym}
            onClick={() => onSubmit({ symbol: sym })}
            className="bg-white hover:bg-rose/15 active:bg-rose/30 border-4 border-rose rounded-2xl py-6 font-mono"
            style={{
              touchAction: 'manipulation',
              minHeight: 70,
              fontSize: 40,
              fontWeight: 700,
              color: '#5A3B1F',
            }}
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03 }}
            aria-label={
              sym === '<' ? 'less than' :
              sym === '=' ? 'equal to' :
                            'greater than'
            }
          >
            {sym}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
