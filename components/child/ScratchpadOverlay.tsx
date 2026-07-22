'use client';

// Finger/stylus scratchpad for working out math by hand. A translucent
// paper layer floats over the whole problem so the child can see the
// equation while writing under it — like working directly on the
// screen. Closing wipes the page; each problem starts fresh.

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INK = '#6b4423';

export default function ScratchpadOverlay({
  open, onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  // Size the canvas to the viewport at device resolution; re-size on
  // rotation. Resizing clears the bitmap, which is fine for scratch.
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 4;
        ctx.strokeStyle = INK;
      }
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [open]);

  const pos = (e: React.PointerEvent) => ({ x: e.clientX, y: e.clientY });

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const up = () => { drawing.current = false; last.current = null; };

  const wipe = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* translucent paper — the problem stays readable underneath */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ background: 'rgba(255, 250, 242, 0.6)', touchAction: 'none' }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
          />
          {/* floating tools */}
          <div
            className="absolute top-3 right-3 flex gap-2 items-center"
            style={{ paddingTop: 'var(--scene-inset-top)' }}
          >
            <span className="font-display italic text-[13px] text-bark/70 bg-cream/90 border border-ochre/50 rounded-full px-3 py-1.5 hidden sm:inline">
              work it out here ✏️
            </span>
            <motion.button
              onClick={wipe}
              aria-label="wipe the scratchpad clean"
              className="text-2xl rounded-full bg-white border-2 border-ochre shadow-md"
              style={{ touchAction: 'manipulation', minWidth: 52, minHeight: 52 }}
              whileTap={{ scale: 0.9 }}
            >
              🧽
            </motion.button>
            <motion.button
              onClick={onClose}
              aria-label="close the scratchpad and answer"
              className="text-xl rounded-full bg-forest text-white shadow-md font-display"
              style={{ touchAction: 'manipulation', minWidth: 52, minHeight: 52, fontWeight: 600 }}
              whileTap={{ scale: 0.9 }}
            >
              ✓
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
