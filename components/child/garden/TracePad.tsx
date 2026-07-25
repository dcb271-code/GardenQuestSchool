// components/child/garden/TracePad.tsx
//
// Trace a Japanese character with a finger, one stroke at a time.
//
// What's on screen, back to front:
//   • the real character, rendered from the device font in pale grey.
//     This is the visual truth — the guide paths are approximations,
//     the glyph is not.
//   • strokes already finished, in green, so progress is visible
//   • the current stroke as a dashed grey line with a green START dot
//     and an arrowhead at the finish, because direction is half of
//     what we're teaching
//   • the child's own ink, following the finger
//
// A stroke passes on coverage + both ends + direction (traceScoring).
// Finishing the last stroke speaks the character aloud, which is the
// whole reason this exists: shape → sound, in the same second.

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { strokesFor } from '@/lib/world/japaneseStrokes';
import { scoreTrace, traceHint, type Pt } from '@/lib/world/traceScoring';
import { speakJapanese } from '@/lib/audio/japaneseVoice';
import { playSoftTap, playCorrectChime } from '@/lib/audio/sfx';

const BOX = 100;          // guide coordinate space
const GUIDE_SAMPLES = 26; // points sampled along each guide stroke

export default function TracePad({
  char, size = 260, onComplete, onSkip,
}: {
  char: string;
  size?: number;
  onComplete?: () => void;
  onSkip?: () => void;
}) {
  const data = strokesFor(char);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const [strokeIdx, setStrokeIdx] = useState(0);
  const [drawn, setDrawn] = useState<Pt[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setStrokeIdx(0); setDrawn([]); setHint(null); setDone(false);
  }, [char]);

  const toBox = useCallback((e: React.PointerEvent): Pt | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    return {
      x: ((e.clientX - r.left) / r.width) * BOX,
      y: ((e.clientY - r.top) / r.height) * BOX,
    };
  }, []);

  /** Sample the current guide stroke into ordered points. */
  const guidePoints = useCallback((): Pt[] => {
    const el = pathRefs.current[strokeIdx];
    if (!el || typeof el.getTotalLength !== 'function') return [];
    const len = el.getTotalLength();
    if (!len) return [];
    return Array.from({ length: GUIDE_SAMPLES }, (_, i) => {
      const p = el.getPointAtLength((i / (GUIDE_SAMPLES - 1)) * len);
      return { x: p.x, y: p.y };
    });
  }, [strokeIdx]);

  if (!data) return null;
  const total = data.strokes.length;

  const onDown = (e: React.PointerEvent) => {
    if (done) return;
    const p = toBox(e);
    if (!p) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrawing(true);
    setHint(null);
    setDrawn([p]);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawing || done) return;
    const p = toBox(e);
    if (!p) return;
    setDrawn(d => (d.length && Math.hypot(p.x - d[d.length - 1].x, p.y - d[d.length - 1].y) < 1.2 ? d : [...d, p]));
  };

  const onUp = () => {
    if (!drawing || done) return;
    setDrawing(false);
    const result = scoreTrace(guidePoints(), drawn);
    if (!result.passed) {
      setHint(traceHint(result.reason));
      setDrawn([]);
      return;
    }
    playSoftTap();
    const next = strokeIdx + 1;
    setDrawn([]);
    if (next >= total) {
      setDone(true);
      playCorrectChime();
      // The point of the whole exercise: the shape becomes a sound.
      void speakJapanese(data.say);
      onComplete?.();
    } else {
      setStrokeIdx(next);
    }
  };

  const current = data.strokes[strokeIdx];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="font-display italic text-[11px] tracking-[0.2em] uppercase text-bark/55">
          {done ? 'finished' : `stroke ${strokeIdx + 1} of ${total}`}
        </div>
        <div className="flex gap-1.5">
          {data.strokes.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i < strokeIdx || done ? 'bg-forest' : i === strokeIdx ? 'bg-ochre' : 'bg-ochre/30'}`} />
          ))}
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${BOX} ${BOX}`}
        width={size}
        height={size}
        className="mx-auto rounded-2xl border-2 border-ochre/50 bg-white"
        style={{ touchAction: 'none', cursor: done ? 'default' : 'crosshair' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={() => drawing && onUp()}
      >
        <defs>
          <marker id="trace-arrow" viewBox="0 0 10 10" refX="7" refY="5"
                  markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#B08A3E" />
          </marker>
        </defs>

        {/* paper guides */}
        <line x1={50} y1={4} x2={50} y2={96} stroke="#E4DCC8" strokeWidth={0.8} strokeDasharray="3 3" />
        <line x1={4} y1={50} x2={96} y2={50} stroke="#E4DCC8" strokeWidth={0.8} strokeDasharray="3 3" />

        {/* the REAL glyph from the font — the shape of record */}
        <text
          x={50} y={50} lang="ja" textAnchor="middle" dominantBaseline="central"
          fontSize={84} fill="#EFEAD8" pointerEvents="none"
        >
          {char}
        </text>

        {/* strokes already completed */}
        {data.strokes.slice(0, strokeIdx).map((d, i) => (
          <path key={i} d={d} stroke="#6B8E5A" strokeWidth={4.5} fill="none"
                strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
        ))}
        {done && (
          <path d={data.strokes[total - 1]} stroke="#6B8E5A" strokeWidth={4.5} fill="none"
                strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
        )}

        {/* the stroke to follow now — dashed, with a direction arrow */}
        {!done && (
          <>
            <path
              ref={el => { pathRefs.current[strokeIdx] = el; }}
              d={current}
              stroke="#B8AE92" strokeWidth={5} fill="none"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="6 5"
              markerEnd="url(#trace-arrow)"
            />
            {/* START dot — pulses so it reads as "begin here" */}
            <StartDot d={current} />
          </>
        )}

        {/* the child's ink */}
        {drawn.length > 1 && (
          <polyline
            points={drawn.map(p => `${p.x},${p.y}`).join(' ')}
            stroke="#3F2817" strokeWidth={5} fill="none"
            strokeLinecap="round" strokeLinejoin="round" opacity={0.85}
          />
        )}
      </svg>

      {hint && (
        <motion.div
          className="text-center font-display italic text-[14px] text-terracotta"
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
        >
          {hint}
        </motion.div>
      )}

      {done ? (
        <div className="space-y-2">
          <div className="text-center font-display text-[15px] text-forest" style={{ fontWeight: 700 }}>
            ✓ you wrote it
          </div>
          <button
            onClick={() => void speakJapanese(data.say)}
            className="w-full bg-white border-2 border-ochre rounded-full py-2.5 font-display text-bark"
            style={{ touchAction: 'manipulation', minHeight: 48, fontWeight: 600 }}
          >
            🔊 hear it again
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => { setDrawn([]); setStrokeIdx(0); setHint(null); }}
            className="flex-1 bg-white border-2 border-ochre rounded-full py-2.5 font-display italic text-bark/70"
            style={{ touchAction: 'manipulation', minHeight: 48 }}
          >
            start over
          </button>
          {onSkip && (
            <button
              onClick={onSkip}
              className="flex-1 bg-white border-2 border-ochre rounded-full py-2.5 font-display italic text-bark/70"
              style={{ touchAction: 'manipulation', minHeight: 48 }}
            >
              skip
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** A pulsing dot at the first point of the stroke: "begin here." */
function StartDot({ d }: { d: string }) {
  const ref = useRef<SVGPathElement | null>(null);
  const [p, setP] = useState<Pt | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.getPointAtLength !== 'function') return;
    try {
      const pt = el.getPointAtLength(0);
      setP({ x: pt.x, y: pt.y });
    } catch { /* jsdom */ }
  }, [d]);
  return (
    <>
      <path ref={ref} d={d} stroke="none" fill="none" />
      {p && (
        <>
          <motion.circle
            cx={p.x} cy={p.y} r={6} fill="#6B8E5A"
            animate={{ opacity: [0.25, 0.5, 0.25], r: [6, 8, 6] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <circle cx={p.x} cy={p.y} r={3.4} fill="#6B8E5A" />
        </>
      )}
    </>
  );
}
