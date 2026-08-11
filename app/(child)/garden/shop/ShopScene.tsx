// app/(child)/garden/shop/ShopScene.tsx
//
// The Yard — a potting shed with things for sale on the shelves.
//
// Cecily has been promised this in writing three times, so it should
// look like somewhere rather than like a list. It is a shed: plank
// walls, a window with daylight behind it, shelves with a lip, and the
// stock standing on those shelves rather than floating in cards.
//
// Prices are shown in what a STONE is worth as well as in coins — "one
// Kentucky agate", "one freshwater pearl" — because that is the
// arithmetic she is actually doing. A number on its own is a number;
// a number next to a rock she has held is a price.
//
// Buying does not place. She buys it into the shed and then goes and
// decides where it stands, which is the half of the promise that
// matters: "your garden, arranged by you".

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ShopItemArt from '@/components/child/garden/ShopItemArt';
import { playHarvest } from '@/lib/audio/sfx';
import { coinsToPrice } from '@/lib/world/cavern';
import {
  SHOP_ITEMS, GREAT_WORKS, canAfford, canTradeFor, unplaced,
  type ShopItem, type ShopState,
} from '@/lib/world/shopCatalog';
import { getGem } from '@/lib/world/gemCatalog';
import GemSpecimen from '@/components/child/garden/GemSpecimen';

export default function ShopScene({
  learnerId, coins: initialCoins, shop: initialShop, kept: initialKept = {},
}: {
  learnerId: string;
  coins: number;
  shop: ShopState;
  /** What is in her display case — the Great Works are paid in stones. */
  kept?: Record<string, number>;
}) {
  const [coins, setCoins] = useState(initialCoins);
  const [kept, setKept] = useState<Record<string, number>>(initialKept);
  const [shop, setShop] = useState<ShopState>(initialShop);
  const [busy, setBusy] = useState<string | null>(null);
  const [bought, setBought] = useState<ShopItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const buy = async (item: ShopItem) => {
    if (busy || !canAfford(coins, item)) return;
    setBusy(item.code);
    setMessage(null);
    try {
      const res = await fetch('/api/shop', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, action: 'buy', itemCode: item.code }),
      });
      const d = await res.json();
      if (d.error) { setMessage(d.error); return; }
      setCoins(d.coins);
      setShop(d.shop);
      if (d.kept) setKept(d.kept);
      setBought(item);
      playHarvest();
    } finally { setBusy(null); }
  };

  const inShed = unplaced(shop).length;

  return (
    <div className="min-h-screen" style={{ background: '#2A1D12' }}>
      <div className="max-w-2xl mx-auto pb-16">

        {/* ── the shed itself ──────────────────────────────────────── */}
        <div className="relative">
          <svg viewBox="0 0 800 330" className="w-full" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="shed-wall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8A6238" />
                <stop offset="100%" stopColor="#6B4A28" />
              </linearGradient>
              <linearGradient id="shed-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#BFE0F2" />
                <stop offset="100%" stopColor="#E8F2DC" />
              </linearGradient>
            </defs>
            <rect x={0} y={0} width={800} height={330} fill="url(#shed-wall)" />
            {/* plank lines, so the wall is boards and not a brown field */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <line key={i} x1={0} y1={i * 38 + 20} x2={800} y2={i * 38 + 20}
                    stroke="#54371C" strokeWidth={2} opacity={0.55} />
            ))}
            {/* A scrim under the title. Without it the heading sat on
                plank lines and pot rims and was hard to read. */}
            <rect x={0} y={0} width={800} height={104} fill="#2A1D12" opacity={0.5} />
            {/* the window, with the garden outside it */}
            <g transform="translate(596, 132)">
              <rect x={-6} y={-6} width={152} height={112} rx={4}
                    fill="#4A3018" stroke="#33200E" strokeWidth={3} />
              <rect x={0} y={0} width={140} height={100} fill="url(#shed-sky)" />
              <ellipse cx={30} cy={92} rx={70} ry={26} fill="#7FB35A" />
              <ellipse cx={112} cy={96} rx={52} ry={22} fill="#6FA24E" />
              <circle cx={104} cy={26} r={13} fill="#FCE9A0" />
              <line x1={70} y1={0} x2={70} y2={100} stroke="#4A3018" strokeWidth={5} />
              <line x1={0} y1={50} x2={140} y2={50} stroke="#4A3018" strokeWidth={5} />
            </g>
            {/* hanging tools, because a potting shed has them */}
            <g stroke="#3F2C1A" strokeWidth={3} strokeLinecap="round">
              <path d="M 86 116 L 86 208" />
              <path d="M 68 208 q 18 18 36 0" fill="#9AA3AE" stroke="#4E463C" strokeWidth={3} />
              <path d="M 152 116 L 152 198" />
              <path d="M 138 198 l 28 0 l -5 18 l -18 0 Z" fill="#8A7358" stroke="#4E463C" strokeWidth={2.5} />
            </g>
            {/* a shelf of clay pots */}
            <rect x={214} y={236} width={312} height={10} rx={2} fill="#A87A4A" stroke="#4A3018" strokeWidth={2.5} />
            {[248, 310, 372, 434, 496].map((x, i) => (
              <g key={x}>
                <path d={`M ${x - 17} 202 L ${x + 17} 202 L ${x + 12} 236 L ${x - 12} 236 Z`}
                      fill="#C07A4E" stroke="#7A431F" strokeWidth={2} strokeLinejoin="round" />
                <rect x={x - 19} y={195} width={38} height={9} rx={2}
                      fill="#D08A5E" stroke="#7A431F" strokeWidth={2} />
                {i % 2 === 0 && (
                  <path d={`M ${x} 195 q -10 -20 -3 -30 M ${x} 195 q 11 -18 4 -28`}
                        stroke="#5E8C42" strokeWidth={2.8} fill="none" strokeLinecap="round" />
                )}
              </g>
            ))}
          </svg>

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <div>
              <h1 className="text-xl font-bold"
                  style={{ color: '#FFF3DC', textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
                The Yard
              </h1>
              <p className="text-[11px]" style={{ color: '#F0DCBC', textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
                Things to put in your garden.
              </p>
            </div>
            <Link href={`/garden?learner=${learnerId}`}
                  className="text-sm rounded-xl px-3 shrink-0"
                  style={{ background: 'rgba(42,29,18,0.85)', color: '#E4D3A8', minHeight: 44,
                           display: 'inline-flex', alignItems: 'center' }}>
              ← garden
            </Link>
          </div>
        </div>

        {/* ── purse ───────────────────────────────────────────────── */}
        <div className="px-3 -mt-2">
          <div className="rounded-xl px-3 py-2 flex items-center justify-between"
               style={{ background: '#3E2C1A', border: '1px solid #6B4A28' }}>
            <span className="text-sm font-bold" style={{ color: '#F5D98F' }}>
              {coinsToPrice(coins)} in your purse
            </span>
            {inShed > 0 && (
              <Link href={`/garden?learner=${learnerId}&arrange=1`}
                    className="text-xs rounded-lg px-2 py-1"
                    style={{ background: '#5A8C4A', color: '#FFF', minHeight: 36,
                             display: 'inline-flex', alignItems: 'center' }}>
                {inShed} to place →
              </Link>
            )}
          </div>
          {message && (
            <p className="text-xs mt-2 rounded-lg p-2"
               style={{ background: '#4A2A1A', color: '#F0C4A8' }}>{message}</p>
          )}
        </div>

        {/* ── the stock, standing on shelves ──────────────────────── */}
        <div className="px-3 mt-3 space-y-3">
          {SHOP_ITEMS.map(item => {
            const afford = canAfford(coins, item);
            const owned = shop.owned.filter(c => c === item.code).length;
            return (
              <div key={item.code} className="rounded-2xl p-3 flex gap-3 items-center"
                   style={{ background: '#F6EEDF', border: '1px solid #C9A227' }}>
                <div className="shrink-0 rounded-xl" style={{ background: '#E4DCC8', padding: 4 }}>
                  <ShopItemArt code={item.code} size={72} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-bold text-sm" style={{ color: '#3f2614' }}>{item.name}</h3>
                    {owned > 0 && (
                      <span className="text-[10px] rounded-full px-1.5"
                            style={{ background: '#5A8C4A', color: '#FFF' }}>
                        you have {owned}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] leading-snug mt-0.5" style={{ color: '#6B5C42' }}>
                    {item.blurb}
                  </p>
                  <p className="text-[10px] italic mt-1" style={{ color: '#8A7A5E' }}>
                    {item.worth}
                  </p>
                </div>
                <button
                  onClick={() => buy(item)}
                  disabled={!afford || busy === item.code}
                  className="rounded-xl px-3 font-bold text-sm shrink-0 disabled:opacity-45"
                  style={{ background: afford ? '#C9A227' : '#D8CEBA',
                           color: '#2A2420', minHeight: 52, minWidth: 74,
                           touchAction: 'manipulation' }}
                >
                  {busy === item.code ? '…' : coinsToPrice(item.price)}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── THE GREAT WORKS ─────────────────────────────────────
            Traded, not bought. Money cannot price these: a diamond is
            500,000 pennies and the whole Yard costs 590. Handing over
            the stone keeps every catalog number honest and makes the
            decision the real one — the ruby or the observatory. */}
        <div className="px-3 mt-6">
          <h2 className="text-sm font-bold uppercase tracking-widest"
              style={{ color: '#C9A227' }}>
            The Great Works
          </h2>
          <p className="text-[11px] italic mb-2" style={{ color: '#8A7A5E' }}>
            Not for sale. Each one is traded for a single stone out of
            your case.
          </p>

          <div className="space-y-3">
            {GREAT_WORKS.map(item => {
              const gem = getGem(item.tradeFor!);
              const has = canTradeFor(item, kept);
              const owned = shop.owned.filter(c => c === item.code).length;
              return (
                <div key={item.code} className="rounded-2xl p-3 flex gap-3 items-center"
                     style={{ background: has ? '#F6EEDF' : '#EFE7D8',
                              border: `1px solid ${has ? '#C9A227' : '#D8CEBA'}`,
                              opacity: owned > 0 ? 0.75 : 1 }}>
                  <div className="shrink-0 rounded-xl" style={{ background: '#E4DCC8', padding: 4 }}>
                    <ShopItemArt code={item.code} size={72} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-bold text-sm" style={{ color: '#3f2614' }}>{item.name}</h3>
                      {owned > 0 && (
                        <span className="text-[10px] rounded-full px-1.5"
                              style={{ background: '#5A8C4A', color: '#FFF' }}>built</span>
                      )}
                    </div>
                    <p className="text-[11px] leading-snug mt-0.5" style={{ color: '#6B5C42' }}>
                      {item.blurb}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {gem && <GemSpecimen gem={gem} size={22} ghost={!has} />}
                      <span className="text-[10px] italic"
                            style={{ color: has ? '#5A8C4A' : '#8A7A5E' }}>
                        {has ? `you have a ${gem?.name.toLowerCase()}` : `needs a ${gem?.name.toLowerCase()}`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => buy(item)}
                    disabled={!has || busy === item.code || owned > 0}
                    className="rounded-xl px-3 font-bold text-xs shrink-0 disabled:opacity-45"
                    style={{ background: has && !owned ? '#C9A227' : '#D8CEBA',
                             color: '#2A2420', minHeight: 52, minWidth: 74,
                             touchAction: 'manipulation' }}
                  >
                    {busy === item.code ? '…' : owned > 0 ? 'built' : 'trade'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[11px] text-center mt-4 px-6" style={{ color: '#9A8C76' }}>
          Coins come from selling stones in the cavern. Nothing here is
          ever paid for by answering questions.
        </p>
      </div>

      <AnimatePresence>
        {bought && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(20,14,8,0.75)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setBought(null)}
          >
            <motion.div
              className="rounded-2xl w-full max-w-xs p-4 text-center"
              style={{ background: '#FFFAF2', border: '2px solid #C9A227' }}
              initial={{ scale: 0.9, y: 14 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center"><ShopItemArt code={bought.code} size={120} /></div>
              <h2 className="font-bold text-lg mt-1" style={{ color: '#3f2614' }}>{bought.name}</h2>
              <p className="text-xs mt-1" style={{ color: '#6B5C42' }}>
                It is in the shed. Now go and decide where it stands.
              </p>
              <Link
                href={`/garden?learner=${learnerId}&arrange=1`}
                className="block w-full rounded-xl font-bold text-sm mt-4"
                style={{ background: '#5A8C4A', color: '#FFF', minHeight: 52,
                         display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                put it in the garden →
              </Link>
              <button
                onClick={() => setBought(null)}
                className="w-full rounded-xl text-sm mt-2"
                style={{ background: '#EADFC6', color: '#4A3B24', minHeight: 46 }}
              >
                keep shopping
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
