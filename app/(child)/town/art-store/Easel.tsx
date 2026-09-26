'use client';

// The easel. Finger painting on a real canvas, designed PRE-READER
// FIRST: every control is an icon, nothing requires reading, and
// the making is free, forever.
//
// Undo is a stroke stack redrawn from scratch — the only undo that
// never corrupts. Stamps are emoji drawn as text: the garden's
// creatures in the palette she already knows, with zero image
// loading to fail.
//
// Sign Her Name (Level 0 spec): "put it on the wall" first lays a
// dotted name over the corner of the picture. She traces it with a
// finger — each letter finishes when the dots are passed in order,
// and says its name — and her own wobbly line is in the PNG that
// goes on the wall. Skippable with one tap; nothing is ever lost.
// Every child signs with their own name; a child with no name to
// draw goes straight to the wall.

import { useEffect, useRef, useState } from 'react';
import { playSparkle, playHarvest } from '@/lib/audio/sfx';
import { useNarrator } from '@/lib/audio/useNarrator';
import { useReadAloud } from '@/lib/audio/useReadAloud';
import {
  LETTER_GUIDES, signatureLetters, startTrace, advanceTrace, type TraceProgress, type Point,
} from '@/lib/level0/signature';
import { SIGNATURE } from '@/lib/level0/words';
import SignatureGuide, { SIG_BOX, letterOrigin } from './SignatureGuide';

const COLORS = [
  '#2A2420', '#C94C3E', '#E8913A', '#F5D98F', '#5F7F4A',
  '#4A7BA6', '#7A5A8C', '#E8B4C0', '#8A6238', '#FFFFFF',
];
const SIZES = [6, 14, 28];
const STAMPS = ['🐰', '🐦', '🐝', '🐸', '🐌', '🦋', '🌸', '⭐'];

type Stroke =
  | { kind: 'path'; color: string; size: number; points: Array<[number, number]> }
  | { kind: 'stamp'; emoji: string; x: number; y: number };

const CANVAS_W = 640;
const CANVAS_H = 480;
const INK = '#2A2420';
const SIGNATURE_BRUSH = 5;

export default function Easel({
  learnerId, firstName, onSaved,
}: {
  learnerId: string;
  /** Whose easel — the name she signs. Nothing means no signature step. */
  firstName?: string | null;
  onSaved: (gallery: unknown[]) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(COLORS[1]);
  const [size, setSize] = useState(SIZES[1]);
  const [stamp, setStamp] = useState<string | null>(null);
  const [erasing, setErasing] = useState(false);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  // ── signing ──
  const sigLetters = signatureLetters(firstName);
  const [signing, setSigning] = useState(false);
  const [sigIndex, setSigIndex] = useState(0);
  const [sigProgress, setSigProgress] = useState<TraceProgress>(startTrace());
  const sigDone = useRef<string[]>([]);
  const [sigPrompt, setSigPrompt] = useState('');
  useNarrator(sigPrompt, !signing, { immediate: true });
  const speech = useReadAloud();

  const redraw = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFDF6';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    for (const s of strokes.current) drawStroke(ctx, s);
    if (current.current) drawStroke(ctx, current.current);
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, s: Stroke) => {
    if (s.kind === 'stamp') {
      ctx.font = '64px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.emoji, s.x, s.y);
      return;
    }
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    s.points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    if (s.points.length === 1) ctx.lineTo(s.points[0][0] + 0.1, s.points[0][1] + 0.1);
    ctx.stroke();
  };

  useEffect(() => { redraw(); }, []);

  const canvasPoint = (e: React.PointerEvent): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return [
      ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    ];
  };

  // A finger position in canvas units → the current letter's 100-box.
  const feedSignature = (p: Point) => {
    if (sigIndex >= sigLetters.length) return;
    const [ox, oy] = letterOrigin(sigIndex, sigLetters.length, CANVAS_W, CANVAS_H);
    const local: Point = [((p[0] - ox) / SIG_BOX) * 100, ((p[1] - oy) / SIG_BOX) * 100];
    const ch = sigLetters[sigIndex];
    const { progress, strokeFinished } = advanceTrace(LETTER_GUIDES[ch], sigProgress, local);
    setSigProgress(progress);
    if (!strokeFinished || !progress.done) return;
    // a letter finished: say it, and move on
    sigDone.current = [...sigDone.current, ch];
    speech.say(`letter:${sigIndex}`, ch);
    playSparkle();
    const nextIndex = sigIndex + 1;
    setSigIndex(nextIndex);
    setSigProgress(startTrace());
    if (nextIndex >= sigLetters.length) {
      setSigPrompt(SIGNATURE.finished(sigLetters, firstName ?? ''));
      window.setTimeout(() => { void finishSaving(); }, 1800);
    }
  };

  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    const [x, y] = canvasPoint(e);
    if (signing) {
      // her signature: ink, thin, and fed to the tracer
      current.current = { kind: 'path', color: INK, size: SIGNATURE_BRUSH, points: [[x, y]] };
      feedSignature([x, y]);
      redraw();
      return;
    }
    if (stamp) {
      strokes.current.push({ kind: 'stamp', emoji: stamp, x, y });
      setCanUndo(true);
      redraw();
      return;
    }
    current.current = {
      kind: 'path',
      color: erasing ? '#FFFDF6' : color,
      size: erasing ? size * 2.5 : size,
      points: [[x, y]],
    };
    redraw();
  };
  const move = (e: React.PointerEvent) => {
    if (!current.current || current.current.kind !== 'path') return;
    const p = canvasPoint(e);
    current.current.points.push(p);
    if (signing) feedSignature(p);
    redraw();
  };
  const up = () => {
    if (current.current) {
      strokes.current.push(current.current);
      current.current = null;
      setCanUndo(true);
    }
  };

  const undo = () => {
    strokes.current.pop();
    setCanUndo(strokes.current.length > 0);
    redraw();
  };

  const clearAll = () => {
    strokes.current = [];
    current.current = null;
    setCanUndo(false);
    redraw();
  };

  // "Put it on the wall": a child with a name signs first; the rest
  // goes straight to the wall.
  const save = async () => {
    if (saving || strokes.current.length === 0) return;
    if (sigLetters.length > 0 && !signing) {
      sigDone.current = [];
      setSigIndex(0);
      setSigProgress(startTrace());
      setSigning(true);
      setSigPrompt(SIGNATURE.ask);
      return;
    }
    await finishSaving();
  };

  // Record the letters she finished (never a failure she can see —
  // the painting is what matters to her), then upload.
  const recordSignature = async () => {
    const letters = sigDone.current;
    if (letters.length === 0) return;
    try {
      await fetch('/api/level0/signature', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, letters }),
      });
    } catch { /* her signature is on the picture regardless */ }
  };

  const finishSaving = async () => {
    if (saving) return;
    setSaving(true);
    setNote(null);
    const wasSigning = signing;
    setSigning(false);
    setSigPrompt('');
    if (current.current) { strokes.current.push(current.current); current.current = null; }
    redraw();
    if (wasSigning) void recordSignature();
    try {
      const dataUrl = canvasRef.current!.toDataURL('image/png');
      const res = await fetch('/api/art', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, action: 'save', dataUrl }),
      });
      const d = await res.json();
      if (d.error) { setNote(d.error); return; }
      playHarvest();
      onSaved(d.gallery ?? []);
      clearAll();
      setNote('Saved to your wall! 🎨');
      window.setTimeout(() => setNote(null), 3000);
    } catch {
      setNote('That did not go through. Your picture is still on the easel — try again.');
    } finally {
      setSaving(false);
    }
  };

  const chip = (active: boolean) => ({
    border: active ? '3px solid #2A2420' : '2px solid #C9B88E',
    transform: active ? 'scale(1.12)' : undefined,
    touchAction: 'manipulation' as const,
  });

  return (
    <div className="rounded-2xl p-3" style={{ background: '#8A6238' }}>
      {/* the canvas, clipped to paper — and, while signing, the
          dotted name over its corner */}
      <div className="rounded-lg overflow-hidden relative" style={{ background: '#FFFDF6' }}>
        {signing && (
          <SignatureGuide letters={sigLetters} current={sigIndex} progress={sigProgress}
                          canvasW={CANVAS_W} canvasH={CANVAS_H} />
        )}
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full block"
          style={{ touchAction: 'none' }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          aria-label={signing ? SIGNATURE.overlayLabel : 'Your painting'}
        />
      </div>

      {signing && (
        <div className="flex items-center gap-2 mt-3">
          <p className="text-sm flex-1 rounded-lg p-2" style={{ background: '#FFFDF6', color: '#5A4520' }}>
            {sigPrompt}
          </p>
          <button type="button" onClick={() => void finishSaving()}
                  className="rounded-xl px-4 font-bold text-sm"
                  style={{ background: '#FFFDF6', color: '#5A4520', minHeight: 48,
                           border: '2px solid #C9B88E', touchAction: 'manipulation' }}>
            {SIGNATURE.skip}
          </button>
        </div>
      )}

      {/* colors */}
      <div className="flex gap-1.5 mt-3 flex-wrap justify-center">
        {COLORS.map(c => (
          <button key={c}
                  onClick={() => { setColor(c); setErasing(false); setStamp(null); }}
                  aria-label={`Paint color`}
                  className="rounded-full"
                  style={{ width: 40, height: 40, background: c,
                           ...chip(color === c && !erasing && !stamp) }} />
        ))}
      </div>

      {/* brushes, eraser, stamps, undo */}
      <div className="flex gap-1.5 mt-2 flex-wrap justify-center items-center">
        {SIZES.map(s => (
          <button key={s} onClick={() => { setSize(s); setErasing(false); setStamp(null); }}
                  aria-label="Brush size"
                  className="rounded-full flex items-center justify-center"
                  style={{ width: 44, height: 44, background: '#FFFDF6',
                           ...chip(size === s && !erasing && !stamp) }}>
            <span className="rounded-full"
                  style={{ width: s * 0.9, height: s * 0.9, background: '#2A2420' }} />
          </button>
        ))}
        <button onClick={() => { setErasing(true); setStamp(null); }}
                aria-label="Eraser"
                className="rounded-full text-xl"
                style={{ width: 44, height: 44, background: '#FFFDF6', ...chip(erasing) }}>
          🧽
        </button>
        <button onClick={undo} disabled={!canUndo}
                aria-label="Undo"
                className="rounded-full text-xl disabled:opacity-40"
                style={{ width: 44, height: 44, background: '#FFFDF6',
                         border: '2px solid #C9B88E', touchAction: 'manipulation' }}>
          ↩️
        </button>
      </div>
      <div className="flex gap-1.5 mt-2 flex-wrap justify-center">
        {STAMPS.map(em => (
          <button key={em} onClick={() => { setStamp(em); setErasing(false); }}
                  aria-label="Stamp"
                  className="rounded-full text-xl"
                  style={{ width: 44, height: 44, background: '#FFFDF6', ...chip(stamp === em) }}>
            {em}
          </button>
        ))}
      </div>

      {note && (
        <p className="text-xs mt-2 rounded-lg p-2 text-center"
           style={{ background: '#FFFDF6', color: '#5A4520' }}>{note}</p>
      )}

      <button onClick={save} disabled={saving || !canUndo || signing}
              className="w-full rounded-xl mt-3 font-bold text-base disabled:opacity-50"
              style={{ background: '#5A8C4A', color: '#FFF', minHeight: 56,
                       touchAction: 'manipulation' }}>
        {saving ? '…' : '🖼️ put it on the wall'}
      </button>
    </div>
  );
}
