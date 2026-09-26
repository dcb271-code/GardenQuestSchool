'use client';

// Bunny's Basket. Spec: docs/superpowers/specs/2026-09-26-level-zero-spec.md
//
// Two baskets of carrots. "Which has more?" Tap. Right: the bunny hops
// to it and eats one, crunch. Then "put one more carrot in" — tap the
// basket, a carrot drops — "three… and one more is four" — tap the 4.
// The whole bridge into add.within_10, in one tap.
//
// No way to lose. A wrong basket lifts the carrots out of both baskets
// into two rows, numbered, so the longer row is plain and the voice
// counts each; a wrong numeral does the same for the one basket. The
// baskets and cards stay tappable. The round ends one way.

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useNarrator } from '@/lib/audio/useNarrator';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { playSparkle } from '@/lib/audio/sfx';
import { numberWord } from '@/lib/level0/ladybug';
import type { BasketRound, Side } from '@/lib/level0/basket';
import { BASKET } from '@/lib/level0/words';
import { Basket, Carrot } from '@/components/child/level0/BasketArt';
import { NumeralCard, INK } from '@/components/child/level0/LadybugArt';
import { BunnyFigure } from '@/app/(child)/town/play-barn/art';
import ReadToMeButton from '@/components/child/ReadToMeButton';

type Phase = 'loading' | 'compare' | 'eating' | 'oneMoreTap' | 'numeral' | 'done';

const BASKET_X: Record<Side, number> = { left: 105, right: 295 };
const BASKET_Y = 180;
const BUNNY_HOME = { x: 200, y: 330, flip: false };
const CARD_Y = 420;
const CARD_XS = [80, 200, 320];

export default function BasketScene({ learnerId }: { learnerId: string }) {
  const { settings } = useAccessibilitySettings();
  const reduced = settings.reducedMotion;

  const [round, setRound] = useState<BasketRound | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [shown, setShown] = useState<Record<Side, number>>({ left: 0, right: 0 });
  const [basketTaps, setBasketTaps] = useState<Side[]>([]);
  const [numeralTaps, setNumeralTaps] = useState<number[]>([]);
  const [wrongSide, setWrongSide] = useState<Side | null>(null);
  const [wrongCard, setWrongCard] = useState<number | null>(null);
  const [explainRows, setExplainRows] = useState(false);
  const [bunnyAt, setBunnyAt] = useState(BUNNY_HOME);
  const [note, setNote] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const { replay } = useNarrator(prompt, false, { immediate: true });
  const posting = useRef(false);

  const say = (words: string) => { if (words === prompt) replay(); else setPrompt(words); };

  const fetchRound = useCallback(async () => {
    setPhase('loading');
    setRound(null); setBasketTaps([]); setNumeralTaps([]);
    setWrongSide(null); setWrongCard(null); setExplainRows(false);
    setBunnyAt(BUNNY_HOME); setNote(null);
    try {
      const res = await fetch(`/api/level0/basket?learner=${learnerId}`);
      const d = await res.json();
      if (!res.ok || !d.round) { setNote(d.error ?? BASKET.refused); return; }
      const r: BasketRound = d.round;
      setRound(r);
      setShown({ left: r.left, right: r.right });
      setPhase('compare');
      setPrompt(BASKET.askMore);
    } catch {
      setNote(BASKET.refused);
    }
  }, [learnerId]);

  useEffect(() => { void fetchRound(); }, [fetchRound]);

  const post = async (bt: Side[], nt: number[]) => {
    if (!round || posting.current) return;
    posting.current = true;
    try {
      const res = await fetch('/api/level0/basket', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, seed: round.seed, preSkill: round.preSkill, basketTaps: bt, numeralTaps: nt }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) setNote(d.error ?? BASKET.refused);
    } catch {
      setNote(BASKET.refused);
    } finally {
      posting.current = false;
    }
  };

  const tapBasket = (side: Side) => {
    if (!round) return;
    if (phase === 'compare') {
      const taps = [...basketTaps, side];
      setBasketTaps(taps);
      if (side !== round.more) {
        setWrongSide(side);
        setExplainRows(true);
        const other: Side = side === 'left' ? 'right' : 'left';
        say(BASKET.wrongMore(round[side], round[other]));
        return;
      }
      setWrongSide(null);
      setExplainRows(false);
      setPhase('eating');
      say(BASKET.rightMore(round[side]));
      // Hop to the NEAR side of the basket, nose in: to the left of the
      // right basket facing right, to the right of the left basket
      // facing left. The first draw put it on the far side, facing away.
      setBunnyAt(side === 'right'
        ? { x: BASKET_X.right - 95, y: BASKET_Y + 60, flip: false }
        : { x: BASKET_X.left + 95, y: BASKET_Y + 60, flip: true });
      window.setTimeout(() => {
        // crunch: one carrot gone
        setShown(s => ({ ...s, [side]: s[side] - 1 }));
        playSparkle();
        if (round.oneMore) {
          setPhase('oneMoreTap');
          setPrompt(BASKET.askOneMore(round.oneMore.from));
        } else {
          setPhase('done');
          void post(taps, []);
        }
      }, reduced ? 300 : 1100);
      return;
    }
    if (phase === 'oneMoreTap' && round.oneMore) {
      if (side !== round.oneMore.basket) { replay(); return; }   // the other basket: ask again
      setShown(s => ({ ...s, [side]: s[side] + 1 }));
      setPhase('numeral');
      setPrompt(BASKET.oneMoreIn(round.oneMore.from));
    }
  };

  const tapCard = (n: number) => {
    if (!round?.oneMore || phase !== 'numeral') return;
    const taps = [...numeralTaps, n];
    setNumeralTaps(taps);
    if (n !== round.oneMore.to) {
      setWrongCard(n);
      setExplainRows(true);
      say(BASKET.wrongNumeral(n, round.oneMore.to));
      return;
    }
    setWrongCard(null);
    setExplainRows(false);
    setPhase('done');
    setPrompt(BASKET.right(n));
    playSparkle();
    void post(basketTaps, taps);
  };

  // The explanation rows: carrots lifted out of a basket into a
  // numbered row above it. After a wrong basket both rows show; after
  // a wrong numeral only the basket in question.
  const rowSides: Side[] = !explainRows ? []
    : phase === 'numeral' && round?.oneMore ? [round.oneMore.basket]
    : ['left', 'right'];

  const basketState = (side: Side): 'idle' | 'wrong' | 'right' =>
    wrongSide === side ? 'wrong'
    : (phase === 'eating' || phase === 'oneMoreTap' || phase === 'numeral' || phase === 'done') && round?.more === side ? 'right'
    : 'idle';

  const basketsTappable = phase === 'compare' || phase === 'oneMoreTap';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(#efe7d6, #e3d9c4)' }}>
      <header className="flex items-center gap-2 px-4 py-3">
        <Link href={`/garden?learner=${learnerId}`}
              className="rounded-full bg-white border border-ochre text-lg"
              aria-label={BASKET.back}
              style={{ minWidth: 48, minHeight: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          ←
        </Link>
        <h1 className="font-bold flex-1" style={{ color: '#3f2614' }}>Bunny&apos;s Basket</h1>
        <ReadToMeButton reading={false} onToggle={replay} label="say it again" size={64} />
      </header>

      <main className="flex-1 flex flex-col items-center px-3 pb-6">
        <svg viewBox="0 0 400 490" className="w-full" style={{ maxWidth: 520 }}
             role="img" aria-label={prompt}>
          {/* the two baskets */}
          {round && (['left', 'right'] as Side[]).map(side => (
            <g key={side} transform={`translate(${BASKET_X[side]} ${BASKET_Y})`}
               style={{ cursor: basketsTappable ? 'pointer' : 'default', touchAction: 'manipulation' }}
               onClick={() => tapBasket(side)}
               role={basketsTappable ? 'button' : undefined}
               aria-label={basketsTappable ? `${side} basket` : undefined}>
              <rect x={-85} y={-75} width={170} height={140} fill="transparent" />
              <motion.g
                initial={false}
                animate={wrongSide === side && !reduced ? { rotate: [0, -4, 4, -3, 3, 0] } : { rotate: 0 }}
                transition={{ duration: 0.5 }}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              >
                <Basket count={rowSides.includes(side) ? 0 : shown[side]} state={basketState(side)} />
              </motion.g>
            </g>
          ))}

          {/* the explanation rows, above the baskets, numbered */}
          {round && rowSides.map(side => {
            const n = shown[side];
            return Array.from({ length: n }, (_, i) => (
              <g key={`${side}-${i}`} transform={`translate(${BASKET_X[side] - 60 + i * 30} 52)`}>
                <g transform="scale(0.8)"><Carrot /></g>
                <rect x={-11} y={30} width={22} height={20} rx={5} fill="#FFFAF2" stroke="#8A6A48" strokeWidth={1.2} />
                <text y={45} textAnchor="middle" fontSize={14} fontWeight={800} fill={INK}>{i + 1}</text>
              </g>
            ));
          })}

          {/* the bunny — hops to the basket with more */}
          {round && (
            <motion.g
              initial={false}
              animate={{ x: bunnyAt.x - 45, y: bunnyAt.y - 45 }}
              transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 14 }}
            >
              <g transform={`translate(45 45) scale(${bunnyAt.flip ? -1.4 : 1.4} 1.4) translate(-32 -32)`}>
                <BunnyFigure />
              </g>
            </motion.g>
          )}

          {/* the three numerals, only for the one-more step */}
          {round?.oneMore && (phase === 'numeral' || phase === 'done') && round.oneMore.choices.map((n, i) => {
            const state = phase === 'done' && n === round.oneMore!.to ? 'right'
              : wrongCard === n ? 'wrong' : 'idle';
            const tappable = phase === 'numeral';
            return (
              <g key={n} transform={`translate(${CARD_XS[i]} ${CARD_Y})`}
                 style={{ cursor: tappable ? 'pointer' : 'default', touchAction: 'manipulation' }}
                 onClick={() => tapCard(n)}
                 role={tappable ? 'button' : undefined}
                 aria-label={tappable ? numberWord(n) : undefined}>
                <motion.g
                  initial={false}
                  animate={state === 'wrong' && !reduced ? { rotate: [0, -6, 6, -4, 4, 0] } : { rotate: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                >
                  <NumeralCard n={n} state={state} />
                </motion.g>
              </g>
            );
          })}
        </svg>

        {note && (
          <p className="text-sm text-center rounded-xl px-3 py-2 mt-2"
             style={{ background: '#4A2A1A', color: '#F0C4A8' }}>{note}</p>
        )}

        <div className="flex items-center gap-3 mt-3">
          {(phase === 'done' || note) && (
            <button type="button" onClick={() => void fetchRound()}
                    className="rounded-full px-6 font-bold text-base"
                    style={{ background: '#6b8e5a', color: '#fffaf2', minHeight: 56, touchAction: 'manipulation' }}>
              {BASKET.another}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
