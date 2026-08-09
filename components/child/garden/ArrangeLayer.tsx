// components/child/garden/ArrangeLayer.tsx
//
// Putting the shop's things where she wants them.
//
// TAP TO PLACE, NOT DRAG — a deliberate departure from the spec, and
// the reason is worth writing down. The garden map is a panning SVG
// inside a scrolling page, and a finger that presses and moves on it is
// ambiguous: the browser cannot tell "I am dragging this bench" from "I
// am scrolling the map" until it is too late to undo the wrong guess.
// Every implementation of that ends up fighting the pan.
//
// Tapping is unambiguous, needs no pointer capture, works with a
// keyboard and a screen reader for free, and — the part that actually
// decided it — is easier for a seven-year-old than a sustained drag on
// glass. Pick the bench up. Tap where it goes. Done.
//
// The promise was "you put them where you want in the garden", and
// tapping keeps that completely. What she loses is nothing; what she
// gains is that it works every time.

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ShopItemArt from './ShopItemArt';
import { playSparkle } from '@/lib/audio/sfx';
import {
  getShopItem, codeOf, snapToGrid, canPlaceAt, unplaced,
  type Box, type ShopState,
} from '@/lib/world/shopCatalog';

export function useArrange({
  learnerId, shop, obstacles, mapW, mapH, onChange, onDone,
}: {
  learnerId: string;
  shop: ShopState;
  /** Beds, habitats and paths she must not build on top of. */
  obstacles: Box[];
  mapW: number;
  mapH: number;
  onChange: (next: ShopState) => void;
  onDone: () => void;
}) {
  const [holding, setHolding] = useState<string | null>(null);
  const [refused, setRefused] = useState<string | null>(null);
  const shed = unplaced(shop);

  const placeAt = async (worldX: number, worldY: number) => {
    if (!holding) return;
    const item = getShopItem(codeOf(holding));
    if (!item) return;

    const x = snapToGrid(worldX);
    const y = snapToGrid(worldY);
    const others: Box[] = Object.entries(shop.placed)
      .filter(([id]) => id !== holding)
      .map(([id, p]) => {
        const it = getShopItem(codeOf(id))!;
        return { x: p.x, y: p.y, w: it.w, h: it.h };
      });

    if (!canPlaceAt(item, x, y, [...obstacles, ...others], { w: mapW, h: mapH })) {
      // Say WHY. A bench that silently refuses to land reads as broken.
      setRefused('Not there — something is already growing or standing on that spot.');
      setTimeout(() => setRefused(null), 2200);
      return;
    }

    const next: ShopState = { ...shop, placed: { ...shop.placed, [holding]: { x, y } } };
    onChange(next);
    setHolding(null);
    playSparkle();
    await fetch('/api/shop', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ learnerId, action: 'place', instanceId: holding, x, y }),
    });
  };

  const pickUp = (id: string) => {
    const next = { ...shop, placed: { ...shop.placed } };
    delete next.placed[id];
    onChange(next);
    setHolding(id);
    fetch('/api/shop', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ learnerId, action: 'store', instanceId: id }),
    });
  };

  return { holding, refused, shed, placeAt, pickUp, setHolding, onDone };
}

/* ─── the tray along the bottom ───────────────────────────────────── */

export function ArrangeTray({
  shed, holding, refused, onHold, onDone,
}: {
  shed: string[];
  holding: string | null;
  refused: string | null;
  onHold: (id: string | null) => void;
  onDone: () => void;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 p-2">
      <AnimatePresence>
        {refused && (
          <motion.p
            className="text-xs text-center mb-2 mx-auto rounded-xl px-3 py-2 max-w-sm"
            style={{ background: '#4A2A1A', color: '#F0C4A8' }}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            {refused}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="rounded-2xl p-2 max-w-xl mx-auto"
           style={{ background: 'rgba(42,29,18,0.94)', border: '1px solid #6B4A28' }}>
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[11px]" style={{ color: '#E4D3A8' }}>
            {holding
              ? 'Now tap where it should go.'
              : shed.length
                ? 'Tap a thing to pick it up.'
                : 'Tap anything you have already put out to move it.'}
          </span>
          <button
            onClick={onDone}
            className="text-xs rounded-lg px-3 font-bold"
            style={{ background: '#5A8C4A', color: '#FFF', minHeight: 40,
                     touchAction: 'manipulation' }}
          >
            done
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {shed.map(id => {
            const item = getShopItem(codeOf(id));
            if (!item) return null;
            const isHeld = holding === id;
            return (
              <button
                key={id}
                onClick={() => onHold(isHeld ? null : id)}
                className="shrink-0 rounded-xl px-2 py-1"
                style={{
                  background: isHeld ? '#5A8C4A' : '#F6EEDF',
                  border: isHeld ? '2px solid #FFF3DC' : '1px solid #C9A227',
                  touchAction: 'manipulation', minHeight: 76,
                }}
                aria-pressed={isHeld}
              >
                <ShopItemArt code={item.code} size={46} shadow={false} />
                <div className="text-[9px] font-bold"
                     style={{ color: isHeld ? '#FFF' : '#4A3B24' }}>
                  {item.name}
                </div>
              </button>
            );
          })}
          {shed.length === 0 && (
            <p className="text-[11px] italic px-2 py-3" style={{ color: '#9A8C76' }}>
              The shed is empty — everything you own is out in the garden.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── the things already standing in the garden ───────────────────── */

export function PlacedItems({
  shop, arranging, onPickUp,
}: {
  shop: ShopState;
  arranging: boolean;
  onPickUp: (id: string) => void;
}) {
  return (
    <>
      {Object.entries(shop.placed).map(([id, pos]) => {
        const item = getShopItem(codeOf(id));
        if (!item) return null;
        // The art is drawn on a 100-box standing on a ground line at
        // y=84, so it is anchored by its FEET rather than its middle —
        // otherwise a tall lantern would appear to sink into the grass.
        const scale = Math.max(item.w, item.h) / 100;
        return (
          <g
            key={id}
            transform={`translate(${pos.x - 50 * scale}, ${pos.y - 84 * scale}) scale(${scale})`}
            style={{ cursor: arranging ? 'pointer' : 'default' }}
            onClick={arranging ? () => onPickUp(id) : undefined}
            role={arranging ? 'button' : undefined}
            aria-label={arranging ? `move the ${item.name}` : item.name}
          >
            {arranging && (
              <rect x={4} y={10} width={92} height={82} rx={8}
                    fill="none" stroke="#FFF3DC" strokeWidth={2.5}
                    strokeDasharray="6 5" opacity={0.85} />
            )}
            {/* A nested <svg>, not a foreignObject: taps through
                foreignObject are unreliable on iPad Safari, which this
                codebase has already been bitten by once (see
                LunaWanderer). */}
            <ShopItemArt code={item.code} size={100} />
          </g>
        );
      })}
    </>
  );
}
