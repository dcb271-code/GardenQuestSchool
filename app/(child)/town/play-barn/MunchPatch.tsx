'use client';

// app/(child)/town/play-barn/MunchPatch.tsx
//
// The Munch Patch — a rule crate, twenty veggies, a bunny, and a
// groundhog with no respect for anyone's plans.
//
// Spec: docs/superpowers/specs/2026-08-29-munch-patch-spec.md.
// No timer, no lives, no way to lose: the round ends exactly one
// way — you cleared it.
//
// REFEREE BOOKKEEPING: every live tile carries its ORIGIN index in
// the server's board. When the groundhog steals a correct veggie it
// regrows on some empty tile, but it is still origin tile #11 as far
// as the referee is concerned — munches are reported by origin, so
// the server (which regrows the exact board from the seed) can judge
// every one and decide "cleared" itself.

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  makeBoard, whyWrong, pickEmptyIndex, BOARD_COLS, BOARD_ROWS,
  type MunchRule, type PrizeVeggie,
} from '@/lib/packs/math/munch';
import { getScene, CROW_SCENES, FINGER_TRICK } from '@/lib/packs/math/crowScenes';
import { speak, isSpeechAvailable } from '@/lib/audio/tts';
import { playCrunch, playGentleTone, playHarvest, playSparkle } from '@/lib/audio/sfx';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { useCalmMode } from '@/lib/settings/useCalmMode';
import {
  BunnySprite, GroundhogSprite, VeggieSprite, SoilMound, PrizeVeggieArt,
  VEGGIE_KINDS, type VeggieKind,
} from './art';

/* ── geometry ───────────────────────────────────────────────────── */

const TILE_W = 104;
const TILE_H = 92;
const GAP = 7;
const PAD = 10;
const GRID_W = PAD * 2 + BOARD_COLS * TILE_W + (BOARD_COLS - 1) * GAP;
const GRID_H = PAD * 2 + BOARD_ROWS * TILE_H + (BOARD_ROWS - 1) * GAP + 74; // + burrow strip

const tileX = (i: number) => PAD + (i % BOARD_COLS) * (TILE_W + GAP);
const tileY = (i: number) => PAD + Math.floor(i / BOARD_COLS) * (TILE_H + GAP);
const BURROW = { x: GRID_W / 2 - 34, y: GRID_H - 66 };

const HOP_MS = 220;
const GROUNDHOG_STEP_MS = 950;
const REGROW_MS = 4200;

/* ── child-facing rule words (listenable) ───────────────────────── */

export function ruleWords(rule: MunchRule): string {
  switch (rule.type) {
    case 'eat_number': return `Eat every ${rule.target} in the patch.`;
    case 'bigger_than': return `Eat the numbers bigger than ${rule.pivot}.`;
    case 'sum_equals': return `Eat the sums that make ${rule.target}.`;
    case 'multiple_of':
      return `Eat the numbers you land on when you count by ${rule.k}s.`;
  }
}

/* ── live tile state ────────────────────────────────────────────── */

interface LiveTile {
  originIdx: number;   // index in the server's board — the referee's name for it
  face: string;
  correct: boolean;
  state: 'grown' | 'soil' | 'tasted';
}

interface TallyResult {
  cleared: boolean;
  prize: PrizeVeggie | null;
  correctMunches: number;
  tastedCount: number;
  error?: string;
}

export default function MunchPatch({
  learnerId, rule, seed, onPrize, onExit,
}: {
  learnerId: string;
  rule: MunchRule;
  seed: number;
  onPrize: (prize: PrizeVeggie) => void;
  onExit: () => void;
}) {
  const { settings } = useAccessibilitySettings();
  const calm = useCalmMode();
  const still = settings.reducedMotion || calm;

  const board = useMemo(() => makeBoard(rule, seed), [rule, seed]);
  const [tiles, setTiles] = useState<LiveTile[]>(() =>
    board.tiles.map((t, i) => ({ originIdx: i, ...t, state: 'grown' as const })));
  const veggieKinds = useMemo<VeggieKind[]>(
    () => board.tiles.map((_, i) => VEGGIE_KINDS[(seed + i * 7) % VEGGIE_KINDS.length]),
    [board, seed]);

  const [bunnyTile, setBunnyTile] = useState<number | 'burrow'>('burrow');
  const [blech, setBlech] = useState<string | null>(null);
  const [startled, setStartled] = useState(false);
  const [eatenCorrect, setEatenCorrect] = useState(0);
  const [stolen, setStolen] = useState(0);
  const [tally, setTally] = useState<TallyResult | null>(null);
  const [posting, setPosting] = useState(false);

  const munches = useRef<Array<{ tile: number; face: string }>>([]);
  const hopTimers = useRef<number[]>([]);
  const busy = useRef(false);
  const tilesRef = useRef(tiles);
  tilesRef.current = tiles;
  const bunnyRef = useRef(bunnyTile);
  bunnyRef.current = bunnyTile;
  const doneRef = useRef(false);

  // After mount only — render-time speech checks are a hydration
  // mismatch (server false, browser true).
  const [canSpeak, setCanSpeak] = useState(false);
  useEffect(() => { setCanSpeak(isSpeechAvailable()); }, []);

  /* ── the groundhog ──────────────────────────────────────────── */

  const [hog, setHog] = useState<{ tile: number; entering: boolean } | null>(null);
  const hogRef = useRef(hog);
  hogRef.current = hog;

  useEffect(() => {
    if (still || tally) return; // he naps by the fence in calm rounds
    let canceled = false;
    const timers: number[] = [];

    const trundle = () => {
      if (canceled || doneRef.current) return;
      // A straight walk along one random row, either direction.
      const row = Math.floor(Math.random() * BOARD_ROWS);
      const ltr = Math.random() < 0.5;
      const cols = Array.from({ length: BOARD_COLS }, (_, c) => (ltr ? c : BOARD_COLS - 1 - c));
      cols.forEach((c, step) => {
        timers.push(window.setTimeout(() => {
          if (canceled || doneRef.current) return;
          const idx = row * BOARD_COLS + c;
          setHog({ tile: idx, entering: step === 0 });
          // eat whatever grows here
          const t = tilesRef.current[idx];
          if (t.state === 'grown') {
            setTiles(prev => prev.map((p, i) => i === idx ? { ...p, state: 'soil' } : p));
            if (t.correct) {
              setStolen(s => s + 1);
              // The debt: this exact veggie (by ORIGIN) regrows on an
              // empty tile — the one he just emptied always qualifies.
              timers.push(window.setTimeout(() => {
                if (canceled || doneRef.current) return;
                setTiles(prev => {
                  const empties = prev
                    .map((p, i) => (p.state === 'soil' ? i : -1))
                    .filter(i => i >= 0);
                  const spot = pickEmptyIndex(empties, Math.random());
                  return prev.map((p, i) => i === spot
                    ? { originIdx: t.originIdx, face: t.face, correct: true, state: 'grown' as const }
                    : p);
                });
              }, REGROW_MS));
            }
          }
          // startle check
          if (bunnyRef.current === idx) {
            setStartled(true);
            busy.current = true;
            hopTimers.current.forEach(id => window.clearTimeout(id));
            timers.push(window.setTimeout(() => {
              setBunnyTile('burrow');
              setStartled(false);
              busy.current = false;
            }, 600));
          }
          if (step === BOARD_COLS - 1) {
            timers.push(window.setTimeout(() => setHog(null), GROUNDHOG_STEP_MS));
          }
        }, step * GROUNDHOG_STEP_MS));
      });
      timers.push(window.setTimeout(trundle, BOARD_COLS * GROUNDHOG_STEP_MS + 9000 + Math.random() * 4000));
    };

    timers.push(window.setTimeout(trundle, 7000));
    return () => { canceled = true; timers.forEach(id => window.clearTimeout(id)); };
  }, [still, tally === null]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── hopping and munching ───────────────────────────────────── */

  const hopTo = (target: number) => {
    if (busy.current || tally || tilesRef.current[target].state !== 'grown') return;
    busy.current = true;
    setBlech(null);

    const from = bunnyRef.current;
    const path: number[] = [];
    let col = from === 'burrow' ? target % BOARD_COLS : (from as number) % BOARD_COLS;
    let row = from === 'burrow' ? BOARD_ROWS - 1 : Math.floor((from as number) / BOARD_COLS);
    const tCol = target % BOARD_COLS, tRow = Math.floor(target / BOARD_COLS);
    while (col !== tCol) { col += col < tCol ? 1 : -1; path.push(row * BOARD_COLS + col); }
    while (row !== tRow) { row += row < tRow ? 1 : -1; path.push(row * BOARD_COLS + col); }
    if (from === 'burrow' && path.length === 0) path.push(target);
    if (path[path.length - 1] !== target) path.push(target);

    const stepMs = still ? 60 : HOP_MS;
    hopTimers.current = path.map((idx, i) => window.setTimeout(() => {
      setBunnyTile(idx);
      // hopping onto the groundhog is also a startle
      if (hogRef.current?.tile === idx) {
        setStartled(true);
        hopTimers.current.forEach(id => window.clearTimeout(id));
        window.setTimeout(() => {
          setBunnyTile('burrow'); setStartled(false); busy.current = false;
        }, 600);
        return;
      }
      if (i === path.length - 1) {
        munchAt(idx);
        busy.current = false;
      }
    }, (i + 1) * stepMs));
  };

  const munchAt = (idx: number) => {
    const t = tilesRef.current[idx];
    if (t.state !== 'grown') return;
    munches.current.push({ tile: t.originIdx, face: t.face });
    if (t.correct) {
      playCrunch();
      setTiles(prev => prev.map((p, i) => i === idx ? { ...p, state: 'soil' } : p));
      setEatenCorrect(n => {
        const next = n + 1;
        if (next === board.correctCount) finishRound();
        return next;
      });
    } else {
      playGentleTone();
      setTiles(prev => prev.map((p, i) => i === idx ? { ...p, state: 'tasted' } : p));
      const why = whyWrong(rule, t.face);
      setBlech(why);
      if (canSpeak) speak(why, { rate: 0.95 });
    }
  };

  /* ── the finish: the referee has the last word ───────────────── */

  const finishRound = async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setPosting(true);
    try {
      const res = await fetch('/api/arcade/munch', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, rule, seed, munches: munches.current }),
      });
      const d = await res.json();
      if (d.error) {
        setTally({ cleared: false, prize: null, correctMunches: 0, tastedCount: 0, error: d.error });
      } else {
        if (d.prize) playSparkle(); else playHarvest();
        setTally(d);
        if (d.prize) onPrize(d.prize);
      }
    } catch {
      setTally({
        cleared: false, prize: null, correctMunches: 0, tastedCount: 0,
        error: 'The barn could not hear the tally. Your munching still happened — try another round in a bit.',
      });
    } finally {
      setPosting(false);
    }
  };

  /* ── the crow's one line, after big-multiples rounds ─────────── */

  const crowLine = useMemo(() => {
    if (rule.type !== 'multiple_of' || rule.k < 6) return null;
    if (rule.k === 9) return { title: FINGER_TRICK.title, code: null };
    const matches = CROW_SCENES.filter(s => s.a === rule.k || s.b === rule.k);
    if (matches.length === 0) return null;
    const s = matches[seed % matches.length];
    return { title: getScene(s.code)?.title ?? s.title, code: s.code };
  }, [rule, seed]);

  /* ── render ─────────────────────────────────────────────────── */

  const bunnyPos = bunnyTile === 'burrow'
    ? BURROW
    : { x: tileX(bunnyTile) + TILE_W / 2 - 32, y: tileY(bunnyTile) + TILE_H / 2 - 40 };

  return (
    <div>
      {/* the rule card */}
      <div className="rounded-xl p-3 flex items-center gap-2"
           style={{ background: '#F6EEDF', border: '2px solid #C9A227' }}>
        <p className="flex-1 font-bold text-sm" style={{ color: '#3f2614' }}>
          {ruleWords(rule)}
        </p>
        {canSpeak && (
          <button onClick={() => speak(ruleWords(rule), { rate: 0.95 })}
                  aria-label="say the rule out loud"
                  className="rounded-full shrink-0"
                  style={{ width: 44, height: 44, background: '#FFFAF2',
                           border: '2px solid #C9A227', touchAction: 'manipulation' }}>
            <svg viewBox="0 0 24 24" width="22" height="22" style={{ margin: '0 auto' }} aria-hidden>
              <path d="M 4 9 h 4 l 5 -4 v 14 l -5 -4 H 4 Z" fill="#8A6238" />
              <path d="M 16 9 q 3 3 0 6 M 18.5 6.5 q 5 5.5 0 11" stroke="#8A6238"
                    strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <span className="text-xs font-bold rounded-lg px-2 py-1"
              style={{ background: '#FFFAF2', color: '#5A8C4A' }}>
          {eatenCorrect} of {board.correctCount}
        </span>
      </div>

      {/* the patch */}
      <svg viewBox={`0 0 ${GRID_W} ${GRID_H}`} className="w-full mt-2 select-none"
           style={{ background: '#9DB878', borderRadius: 16, touchAction: 'manipulation' }}>
        {/* soil rows behind everything */}
        {Array.from({ length: BOARD_ROWS }, (_, r) => (
          <rect key={r} x={PAD - 4} y={tileY(r * BOARD_COLS) + TILE_H - 26}
                width={GRID_W - PAD * 2 + 8} height={18} rx={9} fill="#8E6C46" opacity={0.5} />
        ))}

        {tiles.map((t, i) => (
          <g key={i} transform={`translate(${tileX(i)}, ${tileY(i)})`}
             onClick={() => hopTo(i)} role="button"
             aria-label={t.state === 'grown' ? `veggie ${t.face}` : 'empty soil'}
             style={{ cursor: t.state === 'grown' ? 'pointer' : 'default' }}>
            <rect x="0" y="0" width={TILE_W} height={TILE_H} rx="12"
                  fill="rgba(255,250,240,0.24)" />
            <g transform={`translate(${TILE_W / 2 - 50}, ${TILE_H / 2 - 44}) scale(0.94)`}>
              {t.state === 'soil'
                ? <SoilMound />
                : <VeggieSprite kind={veggieKinds[i]} bitten={t.state === 'tasted'} />}
            </g>
            {t.state !== 'soil' && (
              <text x={TILE_W / 2} y={TILE_H / 2 + 14} textAnchor="middle"
                    fontSize={t.face.length > 3 ? 19 : 24} fontWeight={800}
                    fill="#2A2014" opacity={t.state === 'tasted' ? 0.45 : 1}
                    style={{ paintOrder: 'stroke', stroke: 'rgba(255,250,240,0.85)', strokeWidth: 4 }}>
                {t.face}
              </text>
            )}
          </g>
        ))}

        {/* the burrow */}
        <g transform={`translate(${BURROW.x}, ${BURROW.y})`} aria-hidden>
          <ellipse cx="34" cy="46" rx="34" ry="12" fill="#6E5236" />
          <ellipse cx="34" cy="42" rx="26" ry="9" fill="#3A2C1C" />
        </g>

        {/* the groundhog — position on a PLAIN outer g; only opacity
            animates inside (the framer transform rule, 4 sightings) */}
        <AnimatePresence>
          {hog && (
            <g transform={`translate(${tileX(hog.tile) + TILE_W / 2 - 32}, ${tileY(hog.tile) + TILE_H / 2 - 36})`}>
              <motion.g initial={{ opacity: hog.entering ? 0 : 1 }}
                        animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GroundhogSprite size={64} />
              </motion.g>
            </g>
          )}
        </AnimatePresence>
        {still && !tally && (
          <g transform={`translate(${GRID_W - 74}, ${GRID_H - 70})`}>
            <GroundhogSprite size={60} napping />
          </g>
        )}

        {/* the bunny — same rule: plain outer g carries position */}
        <g transform={`translate(${bunnyPos.x}, ${bunnyPos.y})`}>
          <motion.g animate={startled ? { rotate: [0, -8, 8, -6, 0] } : { rotate: 0 }}
                    transition={{ duration: 0.5 }}>
            <BunnySprite size={64} blech={!!blech} />
          </motion.g>
        </g>
      </svg>

      {/* the blech card — why, computed, never canned */}
      <AnimatePresence>
        {blech && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-xl p-3 mt-2 text-sm"
                      style={{ background: '#FFFAF2', border: '2px solid #C9B88E', color: '#4A3B24' }}>
            <span className="font-bold" style={{ color: '#A2385A' }}>Blech! </span>
            {blech}
          </motion.div>
        )}
      </AnimatePresence>

      {/* the tally card */}
      <AnimatePresence>
        {tally && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl p-4 mt-3 text-center"
                      style={{ background: '#FFFAF2', border: '2px solid #C9A227' }}>
            {tally.error ? (
              <p className="text-sm" style={{ color: '#4A3B24' }}>{tally.error}</p>
            ) : (
              <>
                <h3 className="font-bold text-lg" style={{ color: '#3f2614' }}>
                  You cleared the patch!
                </h3>
                <p className="text-sm mt-1" style={{ color: '#4A3B24' }}>
                  You found all {tally.correctMunches}
                  {tally.tastedCount > 0 &&
                    ` — and spat out ${tally.tastedCount} that only LOOKED right`}
                  {stolen > 0 &&
                    `. The groundhog stole ${stolen} (${stolen === 1 ? 'it' : 'they'} grew back)`}.
                </p>
                {tally.prize && (
                  <div className="mt-3 flex flex-col items-center">
                    <PrizeVeggieArt code={tally.prize.code} size={84} />
                    <p className="font-bold text-sm mt-1" style={{ color: '#3f2614' }}>
                      {tally.prize.name} — today&apos;s prize, for the shelf
                    </p>
                    <p className="text-xs italic mt-0.5" style={{ color: '#8A7A5E' }}>
                      {tally.prize.blurb}
                    </p>
                  </div>
                )}
                {crowLine && (
                  <p className="text-xs mt-3 rounded-lg p-2"
                     style={{ background: '#F6EEDF', color: '#4A3B24' }}>
                    The crow, from the weathervane: &ldquo;I keep pictures for the
                    tricky ones. Want to see {crowLine.title}?&rdquo;{' '}
                    <a href={`/times-table?learner=${learnerId}`}
                       className="font-bold underline" style={{ color: '#8A6238' }}>
                      visit the picture cache
                    </a>
                  </p>
                )}
              </>
            )}
            <button onClick={onExit}
                    className="w-full rounded-xl mt-3 font-bold text-sm"
                    style={{ background: '#5A8C4A', color: '#FFF', minHeight: 52,
                             touchAction: 'manipulation' }}>
              back to the barn
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {posting && !tally && (
        <p className="text-xs text-center mt-2" style={{ color: '#8A7A5E' }}>
          counting up the harvest…
        </p>
      )}
    </div>
  );
}
