'use client';

// Scene components for Luna's Lost Treasure. All four share the same
// storybook card chrome; the page (app/(child)/adventure/luna) is the
// phase machine that decides which to show.

import { motion } from 'framer-motion';
import { LunaCat } from '@/components/child/garden/illustrations';
import { SpeciesIllustration } from '@/components/child/garden/speciesIllustrations';
import type { SceneArt, LunaScene } from '@/lib/world/lunaAdventure';

export function SceneArtView({ art }: { art: SceneArt }) {
  if (art.type === 'emoji') {
    return <div className="text-7xl leading-none" aria-hidden="true">{art.emoji}</div>;
  }
  return (
    <svg viewBox="-60 -60 120 120" width={110} height={110} aria-hidden="true">
      {art.type === 'luna' ? <LunaCat size={96} /> : <SpeciesIllustration code={art.code} size={96} />}
    </svg>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="bg-white/85 border-4 border-ochre rounded-3xl p-6 shadow-xl w-full max-w-lg mx-auto text-center space-y-4"
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 0.9, 0.34, 1] }}
    >
      {children}
    </motion.div>
  );
}

function BigButton({
  onClick, children, tone = 'forest',
}: {
  onClick: () => void;
  children: React.ReactNode;
  tone?: 'forest' | 'sage';
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full ${tone === 'forest' ? 'bg-forest' : 'bg-sage'} text-white rounded-full py-4 font-display`}
      style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

/** Narration beat (also used for choice responses + gate afterText). */
export function StoryScene({
  text, art, onContinue, continueLabel = 'turn the page',
}: {
  text: string;
  art: SceneArt;
  onContinue: () => void;
  continueLabel?: string;
}) {
  return (
    <Card>
      <div className="flex justify-center"><SceneArtView art={art} /></div>
      <p className="font-display italic text-[18px] text-bark/85 leading-relaxed text-left">
        {text}
      </p>
      <BigButton onClick={onContinue}>{continueLabel}</BigButton>
    </Card>
  );
}

export function ChoiceScene({
  scene, onChoose,
}: {
  scene: Extract<LunaScene, { kind: 'choice' }>;
  onChoose: (optionId: string) => void;
}) {
  return (
    <Card>
      <div className="flex justify-center"><SceneArtView art={scene.art} /></div>
      <p className="font-display italic text-[18px] text-bark/85 leading-relaxed">
        {scene.prompt}
      </p>
      <div className="space-y-2.5">
        {scene.options.map(o => (
          <motion.button
            key={o.id}
            onClick={() => onChoose(o.id)}
            className="w-full text-left bg-white border-4 border-ochre rounded-2xl px-4 py-3.5 font-display text-[17px] text-bark hover:bg-ochre/10 flex items-center gap-3"
            style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 500 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-2xl">{o.emoji}</span>
            {o.label}
          </motion.button>
        ))}
      </div>
    </Card>
  );
}

export function GateScene({
  scene, starting, onBegin,
}: {
  scene: Extract<LunaScene, { kind: 'gate' }>;
  starting: boolean;
  onBegin: () => void;
}) {
  return (
    <Card>
      <div className="flex justify-center"><SceneArtView art={scene.art} /></div>
      <p className="font-display italic text-[18px] text-bark/85 leading-relaxed text-left">
        {scene.inviteText}
      </p>
      <div className="font-display text-[13px] text-bark/60 italic">
        a real {scene.focusSubject} practice — your garden grows from it too
      </div>
      <BigButton onClick={onBegin} tone="sage">
        {starting ? 'lacing up…' : "let's help Luna"}
      </BigButton>
    </Card>
  );
}

export function EpisodeDone({
  title, onBackToGarden,
}: {
  title: string;
  onBackToGarden: () => void;
}) {
  return (
    <Card>
      <div className="text-6xl">🌸</div>
      <div className="font-display italic text-[12px] tracking-[0.3em] uppercase text-bark/55">
        chapter complete
      </div>
      <h2 className="font-display text-[26px] text-bark leading-tight" style={{ fontWeight: 600 }}>
        <span className="italic text-forest">{title.toLowerCase()}</span>
      </h2>
      <p className="font-display italic text-[15px] text-bark/70">
        Luna is already dreaming up the next one.
      </p>
      <BigButton onClick={onBackToGarden}>back to the garden</BigButton>
    </Card>
  );
}
