'use client';

// The easel. Finger painting on a real canvas, designed PRE-READER
// FIRST: every control is an icon, nothing requires reading, and
// the making is free, forever.
//
// Undo is a stroke stack redrawn from scratch — the only undo that
// never corrupts. Stamps are emoji drawn as text: the garden's
// creatures in the palette she already knows, with zero image
// loading to fail.

import { useEffect, useRef, useState } from 'react';
import { playSparkle, playHarvest } from '@/lib/audio/sfx';

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

export default function Easel({
  learnerId, onSaved,
}: {
  learnerId: string;
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

  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    const [x, y] = canvasPoint(e);
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
    current.current.points.push(canvasPoint(e));
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

  const save = async () => {
    if (saving || strokes.current.length === 0) return;
    setSaving(true);
    setNote(null);
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
      {/* the canvas, clipped to paper */}
      <div className="rounded-lg overflow-hidden" style={{ background: '#FFFDF6' }}>
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
          aria-label="Your painting"
        />
      </div>

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

      <button onClick={save} disabled={saving || !canUndo}
              className="w-full rounded-xl mt-3 font-bold text-base disabled:opacity-50"
              style={{ background: '#5A8C4A', color: '#FFF', minHeight: 56,
                       touchAction: 'manipulation' }}>
        {saving ? '…' : '🖼️ put it on the wall'}
      </button>
    </div>
  );
}
