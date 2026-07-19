'use client';

// Portrait panorama viewport for the SVG garden worlds.
//
// On a portrait screen (e.g. a wall-mounted calendar tablet) the wide
// landscape scenes letterbox down to a tiny strip. This hook keeps the
// scene full-height instead and lets the child DRAG the world sideways,
// by sliding the SVG viewBox — no CSS transforms, so every structure's
// tap coordinates keep working exactly as in landscape.
//
// Usage in a scene:
//   const pan = usePortraitPan({ worldW: 1440, worldH: 800, initialCenterX: 350 });
//   <svg {...pan.svgProps}>…</svg>
//   <PanEdgeHints canLeft={pan.canLeft} canRight={pan.canRight} />
//
// In landscape the hook is a no-op: same viewBox and touch behavior as
// before.

import { useCallback, useEffect, useRef, useState } from 'react';
import { panWindow, clampPan, centeredPan } from '@/lib/world/panoramaMath';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

const DRAG_SUPPRESS_TAP_PX = 8;

export function usePortraitPan({
  worldW, worldH, initialCenterX,
}: {
  worldW: number;
  worldH: number;
  /** World x-coordinate to center on when portrait mode first engages. */
  initialCenterX: number;
}) {
  const { settings } = useAccessibilitySettings();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [container, setContainer] = useState({ w: 0, h: 0 });
  const [panX, setPanX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const win = panWindow(worldW, worldH, container.w, container.h);

  // Measure the svg's box; re-measure on resize/orientation change.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setContainer(c => (c.w === r.width && c.h === r.height ? c : { w: r.width, h: r.height }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // When portrait mode engages (or the window shape changes), start
  // centered on the scene's home point and keep the pan in bounds.
  const wasActive = useRef(false);
  useEffect(() => {
    if (win.active && !wasActive.current) {
      setPanX(centeredPan(initialCenterX, win.visibleW, win.maxPan));
    } else if (win.active) {
      setPanX(p => clampPan(p, win.maxPan));
    }
    wasActive.current = win.active;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.active, win.visibleW, win.maxPan]);

  // Drag state lives in refs — pointermove shouldn't re-render per event
  // beyond the panX update itself.
  const drag = useRef({
    pointerId: -1, startPx: 0, startPan: 0, movedPx: 0,
    lastPx: 0, lastT: 0, velocity: 0,
  });
  const momentumRaf = useRef(0);

  const pxToWorld = useCallback(
    (px: number) => (container.h > 0 ? px * (worldH / container.h) : 0),
    [container.h, worldH],
  );

  const stopMomentum = useCallback(() => {
    if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current);
    momentumRaf.current = 0;
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!win.active) return;
    stopMomentum();
    drag.current = {
      pointerId: e.pointerId, startPx: e.clientX, startPan: panX,
      movedPx: 0, lastPx: e.clientX, lastT: performance.now(), velocity: 0,
    };
    setDragging(true);
  }, [win.active, panX, stopMomentum]);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (d.pointerId !== e.pointerId) return;
    const dxPx = e.clientX - d.startPx;
    d.movedPx = Math.max(d.movedPx, Math.abs(dxPx));
    const now = performance.now();
    const dt = now - d.lastT;
    if (dt > 0) d.velocity = (e.clientX - d.lastPx) / dt; // px/ms
    d.lastPx = e.clientX;
    d.lastT = now;
    // Capture the pointer lazily — only once it's clearly a drag, so
    // plain taps still reach the structures underneath.
    if (d.movedPx > DRAG_SUPPRESS_TAP_PX) {
      try { svgRef.current?.setPointerCapture(e.pointerId); } catch { /* ok */ }
    }
    setPanX(clampPan(d.startPan - pxToWorld(dxPx), win.maxPan));
  }, [pxToWorld, win.maxPan]);

  const endDrag = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (d.pointerId !== e.pointerId) return;
    d.pointerId = -1;
    setDragging(false);
    // Momentum glide (skipped in reduced-motion mode).
    if (!settings.reducedMotion && Math.abs(d.velocity) > 0.15 && d.movedPx > DRAG_SUPPRESS_TAP_PX) {
      let v = -pxToWorld(d.velocity) * 16; // world units per frame at ~60fps
      const glide = () => {
        v *= 0.92;
        if (Math.abs(v) < 0.5) { momentumRaf.current = 0; return; }
        setPanX(p => {
          const next = clampPan(p + v, win.maxPan);
          if (next === 0 || next === win.maxPan) v = 0; // hit an edge
          return next;
        });
        momentumRaf.current = requestAnimationFrame(glide);
      };
      momentumRaf.current = requestAnimationFrame(glide);
    }
  }, [settings.reducedMotion, pxToWorld, win.maxPan]);

  useEffect(() => stopMomentum, [stopMomentum]);

  // Swallow the click that follows a real drag so a swipe across a
  // structure doesn't count as tapping it.
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (drag.current.movedPx > DRAG_SUPPRESS_TAP_PX) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  const svgProps = {
    ref: svgRef,
    viewBox: win.active
      ? `${panX} 0 ${win.visibleW} ${worldH}`
      : `0 0 ${worldW} ${worldH}`,
    preserveAspectRatio: 'xMidYMid meet' as const,
    style: win.active
      ? { touchAction: 'none' as const, cursor: dragging ? 'grabbing' as const : 'grab' as const }
      : { touchAction: 'manipulation' as const },
    ...(win.active ? {
      onPointerDown, onPointerMove,
      onPointerUp: endDrag, onPointerCancel: endDrag,
      onClickCapture,
    } : {}),
  };

  return {
    svgProps,
    active: win.active,
    canLeft: win.active && panX > 4,
    canRight: win.active && panX < win.maxPan - 4,
  };
}

/** Soft edge fades + chevrons hinting that more world exists sideways. */
export function PanEdgeHints({ canLeft, canRight }: { canLeft: boolean; canRight: boolean }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-12 flex items-center justify-start pl-1"
        style={{
          background: 'linear-gradient(to right, rgba(63,38,20,0.30), transparent)',
          opacity: canLeft ? 1 : 0,
          transition: 'opacity 0.35s',
        }}
        aria-hidden="true"
      >
        <span className="text-white/90 text-2xl" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>‹</span>
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-12 flex items-center justify-end pr-1"
        style={{
          background: 'linear-gradient(to left, rgba(63,38,20,0.30), transparent)',
          opacity: canRight ? 1 : 0,
          transition: 'opacity 0.35s',
        }}
        aria-hidden="true"
      >
        <span className="text-white/90 text-2xl" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>›</span>
      </div>
    </>
  );
}
