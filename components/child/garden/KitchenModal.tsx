'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRecipe } from '@/lib/world/recipeCatalog';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

type Phase = 'recipes' | 'intro' | 'question' | 'guest' | 'cooking' | 'picnic';

interface KitchenRecipe {
  code: string;
  name: string;
  emoji: string;
  description: string;
  ingredients: Record<string, number>;
  cookable: boolean;
  timesCooked: number;
}

interface KitchenGuest { code: string; name: string; emoji: string }

interface KitchenState {
  basket: Record<string, number>;
  plantNames: Record<string, string>;
  recipes: KitchenRecipe[];
  guests: KitchenGuest[];
}

/**
 * Bachan's Kitchen — pick a recipe the basket can afford, learn a
 * couple of true things about the food, invite a guest, share the
 * meal. Cooking consumes the harvested ingredients (the pantry rule:
 * eat what you grow, then grow some more).
 */
export default function KitchenModal({
  open, learnerId, onClose, onCooked,
}: {
  open: boolean;
  learnerId: string;
  onClose: () => void;
  onCooked: () => void;
}) {
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [phase, setPhase] = useState<Phase>('recipes');
  const [state, setState] = useState<KitchenState | null>(null);
  const [recipeCode, setRecipeCode] = useState<string | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [wrongOnce, setWrongOnce] = useState(false);
  const [shakeToken, setShakeToken] = useState(0);
  const [guest, setGuest] = useState<KitchenGuest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPhase('recipes');
      setRecipeCode(null);
      setQuestionIdx(0);
      setWrongOnce(false);
      setShakeToken(0);
      setGuest(null);
      setError(null);
      setState(null);
      fetch(`/api/kitchen?learner=${learnerId}`)
        .then(r => r.json())
        .then(setState)
        .catch(() => setError('the kitchen door is stuck — try again in a moment'));
    }
  }, [open, learnerId]);

  const recipe = recipeCode ? getRecipe(recipeCode) : null;
  const listing = state?.recipes.find(r => r.code === recipeCode) ?? null;
  const current = recipe?.questions[questionIdx];

  const onAnswer = (idx: number) => {
    if (!recipe || !current) return;
    if (idx === current.correctIndex) {
      setWrongOnce(false);
      const next = questionIdx + 1;
      if (next >= recipe.questions.length) setPhase('guest');
      else setQuestionIdx(next);
    } else {
      setShakeToken(t => t + 1);
      setWrongOnce(true);
    }
  };

  const cook = async (g: KitchenGuest) => {
    if (!recipe) return;
    setGuest(g);
    setPhase('cooking');
    try {
      const res = await fetch('/api/kitchen/cook', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, recipeCode: recipe.code, guestCode: g.code }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error === 'not enough ingredients'
          ? 'hmm — the basket came up short. harvest a little more first!'
          : 'the stove sputtered — try again');
        setPhase('recipes');
        return;
      }
      onCooked();
      setPhase('picnic');
    } catch {
      setError('the stove sputtered — try again');
      setPhase('recipes');
    }
  };

  const ingredientLine = (r: KitchenRecipe) =>
    Object.entries(r.ingredients)
      .map(([p, n]) => `${n} ${state?.plantNames[p] ?? p}${n > 1 ? 's' : ''}`)
      .join(' · ');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.4), rgba(20, 25, 40, 0.6))',
            backdropFilter: 'blur(2px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => phase !== 'cooking' && onClose()}
        >
          <motion.div
            className="relative bg-cream border-4 border-terracotta rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 modal-max-h overflow-y-auto"
            initial={{ scale: 0.9, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.9, 0.34, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="text-5xl">{phase === 'picnic' ? '🧺' : recipe?.emoji ?? '🍳'}</div>
              <div className="font-display italic text-[12px] tracking-[0.3em] uppercase text-bark/55">
                {phase === 'picnic' ? 'picnic time' : "bachan's kitchen"}
              </div>
              <h2
                className="font-display text-[28px] text-bark leading-tight"
                style={{ fontWeight: 600, letterSpacing: '-0.015em' }}
              >
                <span className="italic text-forest">
                  {phase === 'recipes' || !recipe ? 'what shall we make?' : recipe.name.toLowerCase()}
                </span>
              </h2>
            </div>

            {error && (
              <div className="text-center font-display italic text-[14px] text-terracotta bg-terracotta/10 border-2 border-terracotta/30 rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {phase === 'recipes' && (
                <motion.div
                  key="recipes"
                  className="space-y-2.5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {!state && !error && (
                    <div className="text-center font-display italic text-bark/60 py-6">
                      opening the recipe box…
                    </div>
                  )}
                  {state?.recipes.map(r => (
                    <motion.button
                      key={r.code}
                      disabled={!r.cookable}
                      onClick={() => { setRecipeCode(r.code); setError(null); setPhase('intro'); }}
                      className={`w-full text-left rounded-2xl px-4 py-3 border-4 font-display ${
                        r.cookable
                          ? 'bg-white border-ochre hover:bg-ochre/10'
                          : 'bg-white/50 border-ochre/30 opacity-60'
                      }`}
                      style={{ touchAction: 'manipulation', minHeight: 56 }}
                      whileTap={r.cookable ? { scale: 0.98 } : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{r.emoji}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[17px] text-bark truncate" style={{ fontWeight: 600 }}>
                            {r.name}
                            {r.timesCooked > 0 && (
                              <span className="ml-2 text-[12px] text-bark/50 italic">made ×{r.timesCooked}</span>
                            )}
                          </span>
                          <span className="block text-[12px] italic text-bark/60 truncate">
                            needs {ingredientLine(r)}
                          </span>
                        </span>
                        {!r.cookable && <span className="text-[12px] text-bark/50 italic shrink-0">harvest more</span>}
                      </div>
                    </motion.button>
                  ))}
                  {state && (
                    <div className="text-center font-display italic text-[12px] text-bark/55 pt-1">
                      in the basket:{' '}
                      {Object.entries(state.basket)
                        .filter(([, n]) => n > 0)
                        .map(([p, n]) => `${n} ${state.plantNames[p] ?? p}`)
                        .join(' · ') || 'nothing yet — harvest something first!'}
                    </div>
                  )}
                </motion.div>
              )}

              {phase === 'intro' && recipe && (
                <motion.div
                  key="intro"
                  className="space-y-4 text-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="font-display italic text-[16px] text-bark/80 leading-snug px-2">
                    {recipe.description}
                  </p>
                  {listing && (
                    <div className="font-display text-[13px] text-bark/65">
                      from the basket: <span className="italic">{ingredientLine(listing)}</span>
                    </div>
                  )}
                  <div className="space-y-2 text-left">
                    {recipe.facts.map((f, i) => (
                      <div key={i} className="bg-white/70 border-2 border-ochre/40 rounded-xl px-3 py-2 font-display text-[14px] text-bark/85 leading-snug">
                        🌿 {f}
                      </div>
                    ))}
                  </div>
                  <motion.button
                    onClick={() => setPhase('question')}
                    className="w-full bg-forest text-white rounded-full py-4 font-display"
                    style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    tie on your apron
                  </motion.button>
                </motion.div>
              )}

              {phase === 'question' && recipe && current && (
                <motion.div
                  key={`q-${questionIdx}`}
                  className="space-y-4"
                  initial={reducedMotion ? undefined : { opacity: 0, x: 18 }}
                  animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, x: -18 }}
                  transition={{ duration: 0.35, ease: [0.22, 0.9, 0.34, 1] }}
                >
                  <div className="font-display italic text-[12px] tracking-[0.2em] uppercase text-bark/55">
                    kitchen question {questionIdx + 1} of {recipe.questions.length}
                  </div>
                  <motion.div
                    key={`shake-${shakeToken}`}
                    initial={{ x: 0 }}
                    animate={shakeToken > 0 && !reducedMotion
                      ? { x: [0, -7, 7, -5, 5, -2, 0] }
                      : { x: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="bg-white/70 rounded-2xl p-4 border-2 border-ochre/40"
                  >
                    <div className="font-display text-[19px] text-bark leading-snug" style={{ fontWeight: 600 }}>
                      {current.prompt}
                    </div>
                  </motion.div>
                  <div className="space-y-2">
                    {current.choices.map((choice, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => onAnswer(idx)}
                        className="w-full text-left bg-white border-4 border-ochre rounded-2xl px-4 py-3.5 font-display text-[17px] text-bark hover:bg-ochre/10"
                        style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 500 }}
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        {choice}
                      </motion.button>
                    ))}
                  </div>
                  {wrongOnce && (
                    <motion.div
                      className="text-center font-display italic text-[15px] text-terracotta"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      not quite — give it another try
                    </motion.div>
                  )}
                </motion.div>
              )}

              {phase === 'guest' && recipe && (
                <motion.div
                  key="guest"
                  className="space-y-3 text-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="font-display italic text-[16px] text-bark/80">
                    the {recipe.name.toLowerCase()} is ready — who shares it with you?
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(state?.guests ?? []).map(g => (
                      <motion.button
                        key={g.code}
                        onClick={() => cook(g)}
                        className="bg-white border-4 border-ochre rounded-2xl p-3 hover:border-forest"
                        style={{ touchAction: 'manipulation', minHeight: 76 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-3xl">{g.emoji}</div>
                        <div className="font-display text-[12px] text-bark mt-1 leading-tight" style={{ fontWeight: 600 }}>
                          {g.name}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {(phase === 'cooking' || phase === 'picnic') && recipe && (
                <motion.div
                  key="picnic"
                  className="space-y-4 text-center py-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.22, 0.9, 0.34, 1] }}
                >
                  {phase === 'cooking' ? (
                    <div className="font-display italic text-[17px] text-bark/70 py-4">
                      stirring… tasting… almost…
                    </div>
                  ) : (
                    <>
                      {!reducedMotion && <PicnicSparkles />}
                      <div className="text-4xl tracking-wide">
                        🧍‍♀️ {guest?.emoji ?? '👵'} {recipe.emoji}
                      </div>
                      <div className="font-display text-[22px] text-bark" style={{ fontWeight: 600 }}>
                        you shared <span className="italic text-forest">{recipe.name.toLowerCase()}</span>
                        {guest ? ` with ${guest.name}` : ''}
                      </div>
                      <p className="font-display italic text-[15px] text-bark/75 leading-snug px-2">
                        {recipe.outro}
                      </p>
                      <p className="font-display text-[12px] text-bark/55 italic">
                        saved to your journal&apos;s recipe box 📖
                      </p>
                      <motion.button
                        onClick={onClose}
                        className="w-full bg-sage text-white rounded-full py-4 font-display"
                        style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        wave goodbye
                      </motion.button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PicnicSparkles() {
  return (
    <svg
      className="absolute pointer-events-none"
      width="220" height="80" viewBox="-110 -40 220 80"
      style={{ left: '50%', top: '10px', transform: 'translateX(-50%)' }}
    >
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const dx = Math.cos(angle) * 80;
        const dy = Math.sin(angle) * 30;
        const color = ['#FFD166', '#E8A87C', '#FFB7C5', '#95B88F'][i % 4];
        return (
          <motion.circle
            key={i}
            cx={0} cy={0} r={3}
            fill={color}
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
            animate={{ x: dx, y: dy, scale: 1.3, opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut', delay: i * 0.04 }}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        );
      })}
    </svg>
  );
}
