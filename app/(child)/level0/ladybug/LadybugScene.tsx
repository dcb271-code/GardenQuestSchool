'use client';

// The Ladybug Count. Spec: docs/superpowers/specs/2026-09-26-level-zero-spec.md
//
// Ears, not eyes: every prompt is spoken the moment it appears (the
// narrator's immediate flag), each ladybug says its number when
// tapped, and the speaker button is the biggest control after the
// cards. Text on screen is for the grown-up beside her.
//
// One tap, three choices, no way to lose. A wrong numeral lines the
// ladybugs up in a row with their numbers under them and the voice
// counts them — computed from the leaf, never canned — and the cards
// stay tappable. The leaf ends one way: she tapped the right number.

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useNarrator } from '@/lib/audio/useNarrator';
import { useReadAloud } from '@/lib/audio/useReadAloud';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { playSparkle } from '@/lib/audio/sfx';
import { numberWord, LEAF_W, LEAF_H, type Leaf } from '@/lib/level0/ladybug';
import { LADYBUG } from '@/lib/level0/words';
import { Ladybug, BigLeaf, NumeralCard, INK } from '@/components/child/level0/LadybugArt';
import ReadToMeButton from '@/components/child/ReadToMeButton';

type Phase = 'loading' | 'counting' | 'choosing' | 'done';

const CARD_Y = 400;
const CARD_XS = [80, 200, 320];

export default function LadybugScene({ learnerId }: { learnerId: string }) {
  const { settings } = useAccessibilitySettings();
  const reduced = settings.reducedMotion;

  const [leaf, setLeaf] = useState<Leaf | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [flown, setFlown] = useState<number[]>([]);       // ladybug indices, in tap order
  const [taps, setTaps] = useState<number[]>([]);         // numerals tapped, in order
  const [wrongCard, setWrongCard] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);  // a server refusal, in words
  const [prompt, setPrompt] = useState('');
  const { replay } = useNarrator(prompt, false, { immediate: true });
  const speech = useReadAloud();
  const posting = useRef(false);

  const fetchLeaf = useCallback(async () => {
    setPhase('loading');
    setLeaf(null); setFlown([]); setTaps([]); setWrongCard(null); setNote(null);
    try {
      const res = await fetch(`/api/level0/ladybug?learner=${learnerId}`);
      const d = await res.json();
      if (!res.ok || !d.leaf) { setNote(d.error ?? LADYBUG.refused); return; }
      const next: Leaf = d.leaf;
      setLeaf(next);
      if (next.mode === 'count') { setPhase('counting'); setPrompt(LADYBUG.askCount); }
      else if (next.mode === 'subitize') { setPhase('choosing'); setPrompt(LADYBUG.askSubitize); }
      else { setPhase('choosing'); setPrompt(LADYBUG.askNumeral(next.count)); }
    } catch {
      setNote(LADYBUG.refused);
    }
  }, [learnerId]);

  useEffect(() => { void fetchLeaf(); }, [fetchLeaf]);

  // Counting: tap a ladybug, it says its number and flies. When the
  // last one goes, the voice says the total and asks for the numeral.
  const tapLadybug = (i: number) => {
    if (!leaf || phase !== 'counting' || flown.includes(i)) return;
    const n = flown.length + 1;
    speech.say(`bug:${n}`, numberWord(n));
    const nextFlown = [...flown, i];
    setFlown(nextFlown);
    if (nextFlown.length === leaf.count) {
      window.setTimeout(() => {
        setPhase('choosing');
        setPrompt(LADYBUG.counted(leaf.count));
      }, reduced ? 300 : 700);
    }
  };

  const tapCard = async (n: number) => {
    if (!leaf || phase !== 'choosing') return;
    const nextTaps = [...taps, n];
    setTaps(nextTaps);
    if (n !== leaf.count) {
      setWrongCard(n);
      const words = LADYBUG.wrong(n, leaf.count);
      // The narrator speaks only when its text CHANGES; the same wrong
      // card tapped twice deserves the same explanation twice.
      if (words === prompt) replay(); else setPrompt(words);
      return;
    }
    setWrongCard(null);
    setPhase('done');
    setPrompt(LADYBUG.right(n));
    playSparkle();
    if (posting.current) return;
    posting.current = true;
    try {
      const res = await fetch('/api/level0/ladybug', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, seed: leaf.seed, preSkill: leaf.preSkill, taps: nextTaps }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) setNote(d.error ?? LADYBUG.refused);
    } catch {
      setNote(LADYBUG.refused);
    } finally {
      posting.current = false;
    }
  };

  // The row: every ladybug of the leaf lined up with its number, for
  // the explanation after a wrong tap and for the landing at the end.
  // Wrong-tap rows show every bug; in count mode they "come back".
  const showRow = !!leaf && (wrongCard !== null || phase === 'done');
  const rowXs = (n: number) => Array.from({ length: n }, (_, i) =>
    n === 1 ? LEAF_W / 2 : 60 + i * ((LEAF_W - 120) / (n - 1)));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(#efe7d6, #e3d9c4)' }}>
      <header className="flex items-center gap-2 px-4 py-3">
        <Link href={`/garden?learner=${learnerId}`}
              className="rounded-full bg-white border border-ochre text-lg"
              aria-label={LADYBUG.back}
              style={{ minWidth: 48, minHeight: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          ←
        </Link>
        <h1 className="font-bold flex-1" style={{ color: '#3f2614' }}>The Ladybug Count</h1>
        <ReadToMeButton reading={false} onToggle={replay} label="say it again" size={64} />
      </header>

      <main className="flex-1 flex flex-col items-center px-3 pb-6">
        <svg viewBox={`0 0 ${LEAF_W} 480`} className="w-full" style={{ maxWidth: 520 }}
             role="img" aria-label={prompt}>
          <BigLeaf />

          {/* the ladybugs on the leaf */}
          {leaf && !showRow && leaf.mode !== 'numeral' && leaf.spots.map((s, i) => {
            const gone = flown.includes(i);
            const tappable = phase === 'counting' && !gone;
            return (
              <motion.g key={i}
                initial={false}
                animate={gone ? { x: s.x, y: s.y - 90, opacity: 0 } : { x: s.x, y: s.y, opacity: 1 }}
                transition={reduced ? { duration: 0 } : { duration: 0.55, ease: 'easeOut' }}
                style={{ cursor: tappable ? 'pointer' : 'default', touchAction: 'manipulation' }}
                onClick={() => tapLadybug(i)}
                role={tappable ? 'button' : undefined}
                aria-label={tappable ? `ladybug` : undefined}
              >
                {/* a fat hit target — she is four */}
                <circle r={34} fill="transparent" />
                <Ladybug tilt={s.tilt} size={48} />
              </motion.g>
            );
          })}

          {/* the row: lined up, numbered, countable */}
          {leaf && showRow && rowXs(leaf.count).map((x, i) => (
            <g key={`row-${i}`} transform={`translate(${x} ${LEAF_H / 2 - 20})`}>
              <Ladybug size={44} />
              <rect x={-14} y={30} width={28} height={26} rx={7} fill="#FFFAF2" stroke="#8A6A48" strokeWidth={1.5} />
              <text y={49} textAnchor="middle" fontSize={18} fontWeight={800} fill={INK}>{i + 1}</text>
            </g>
          ))}

          {/* the three numerals */}
          {leaf && phase !== 'counting' && leaf.choices.map((n, i) => {
            const state = phase === 'done' && n === leaf.count ? 'right'
              : wrongCard === n ? 'wrong' : 'idle';
            const tappable = phase === 'choosing';
            return (
              <g key={n} transform={`translate(${CARD_XS[i]} ${CARD_Y})`}
                 style={{ cursor: tappable ? 'pointer' : 'default', touchAction: 'manipulation' }}
                 onClick={() => tapCard(n)}
                 role={tappable ? 'button' : undefined}
                 aria-label={tappable ? numberWord(n) : undefined}>
                {/* the wobble rotates about the card's own center, not the leaf's corner */}
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
            <button type="button" onClick={() => void fetchLeaf()}
                    className="rounded-full px-6 font-bold text-base"
                    style={{ background: '#6b8e5a', color: '#fffaf2', minHeight: 56, touchAction: 'manipulation' }}>
              {LADYBUG.another}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
