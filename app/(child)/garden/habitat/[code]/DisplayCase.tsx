// app/(child)/garden/habitat/[code]/DisplayCase.tsx
//
// The display case — what "keep" was always FOR.
//
// Cecily wrote to ask: "Way can't I see stones that I found in crystal
// cavern". She was right to. The cavern offered her a real choice on
// every dig — keep the stone or sell it for coins — and the keeping led
// to a line of text reading "3 stones in the case". There was no case.
// A collection you cannot look at is not a collection, it is a number,
// and she had been giving up coins for it.
//
// So this is a cabinet, built the way a mining museum builds one:
//
//   TWO SHELVES, matching the catalog's own split. THE SEAM is what is
//   really under Kentucky and it comes first, because the local thing
//   always leads here. THE CASE is the famous ones from elsewhere.
//
//   EMPTY SLOTS SHOW THE SHAPE. A gap is drawn as a faint engraving of
//   the crystal habit that belongs in it, so she can see that something
//   cube-shaped is missing before she has ever dug one. A collection
//   whose holes are visible is a collection worth finishing — and it
//   means the case teaches even when it is nearly empty, which is the
//   state it will be in for weeks.
//
//   EVERY SPECIMEN IS DRAWN AS ITS REAL CRYSTAL HABIT, not an emoji.
//   See GemSpecimen. The geometry is the point.
//
// Tapping a found stone opens its label — the full museum card, with
// the scratch test she can actually run on a real rock.

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GemSpecimen from '@/components/child/garden/GemSpecimen';
import {
  GEM_CATALOG, gemsOnShelf, scratchTestFor, type GemData,
} from '@/lib/world/gemCatalog';
import { coinsToPrice, isSellableForCoins } from '@/lib/world/cavern';

const SHELVES: Array<{ shelf: 'seam' | 'case'; title: string; blurb: string }> = [
  { shelf: 'seam', title: 'The Seam',
    blurb: 'What is really under Kentucky. You could dig every one of these yourself.' },
  { shelf: 'case', title: 'The Case',
    blurb: 'The famous ones, from further away.' },
];

export default function DisplayCase({
  kept, open, onClose, learnerId, onSold,
}: {
  /** gem code → how many she has kept. */
  kept: Record<string, number>;
  open: boolean;
  onClose: () => void;
  learnerId: string;
  /** Selling from the case pays into the same purse the shop spends. */
  onSold: (cavern: unknown) => void;
}) {
  const [selected, setSelected] = useState<GemData | null>(null);
  const [selling, setSelling] = useState(false);
  const [confirmGap, setConfirmGap] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const sell = async (gem: GemData) => {
    if (selling) return;
    setSelling(true);
    try {
      const res = await fetch('/api/cavern', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, action: 'sell_kept', gemCode: gem.code }),
      });
      const d = await res.json();
      if (d.cavern) onSold(d.cavern);
      // A refused sale must not close the drawer as if it worked —
      // the stone stays where it is and she gets told why.
      if (d.error) { setNote(d.error); setConfirmGap(false); return; }
      setSelected(null);
      setConfirmGap(false);
    } finally { setSelling(false); }
  };

  if (!open) return null;

  const have = GEM_CATALOG.filter(g => (kept[g.code] ?? 0) > 0).length;

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(14,11,9,0.96)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="max-w-2xl mx-auto p-4 pb-24">

        {/* ── cabinet header ──────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#F0DFAE', letterSpacing: '0.02em' }}>
              The Display Case
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#9A8C76' }}>
              Every stone you kept instead of selling.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl px-3 font-bold shrink-0"
            style={{ background: '#3A322A', color: '#E4D3A8', minHeight: 44, minWidth: 44,
                     border: '1px solid #6b5a44', touchAction: 'manipulation' }}
            aria-label="close the case"
          >
            ✕
          </button>
        </div>

        {/* Progress reads as a goal, not a score. */}
        <div className="rounded-xl px-3 py-2 mb-4 flex items-center gap-3"
             style={{ background: '#241E18', border: '1px solid #574838' }}>
          <div className="flex-1">
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#141010' }}>
              <div className="h-full rounded-full transition-all"
                   style={{ width: `${(have / GEM_CATALOG.length) * 100}%`,
                            background: 'linear-gradient(90deg,#C9A227,#F5D98F)' }} />
            </div>
          </div>
          <div className="text-xs font-bold shrink-0" style={{ color: '#F5D98F' }}>
            {have} of {GEM_CATALOG.length}
          </div>
        </div>

        {SHELVES.map(({ shelf, title, blurb }) => (
          <section key={shelf} className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-0.5"
                style={{ color: '#C9A227' }}>
              {title}
            </h3>
            <p className="text-[11px] mb-2 italic" style={{ color: '#8C7F6B' }}>{blurb}</p>

            {/* The shelf itself: a recessed velvet tray with a lip. */}
            <div
              className="rounded-xl p-2.5"
              style={{
                background: 'linear-gradient(#1B1512,#221A15)',
                border: '1px solid #5C4A38',
                boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.75), 0 1px 0 rgba(196,164,110,0.18)',
              }}
            >
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {gemsOnShelf(shelf).map(gem => {
                  const n = kept[gem.code] ?? 0;
                  const found = n > 0;
                  return (
                    <button
                      key={gem.code}
                      onClick={() => { if (found) { setSelected(gem); setNote(null); } }}
                      disabled={!found}
                      className="relative rounded-lg flex flex-col items-center justify-start pt-2 pb-1.5 px-1"
                      style={{
                        minHeight: 96,
                        background: found
                          ? 'radial-gradient(ellipse at 50% 30%, #37302A 0%, #1E1815 78%)'
                          : '#171310',
                        border: found ? '1px solid #6E5A42' : '1px dashed #3E352C',
                        boxShadow: found
                          ? 'inset 0 1px 0 rgba(245,217,143,0.14)'
                          : 'inset 0 2px 6px rgba(0,0,0,0.6)',
                        touchAction: 'manipulation',
                        cursor: found ? 'pointer' : 'default',
                      }}
                      aria-label={found ? `${gem.name}, ${n} kept` : `${gem.name}, none yet`}
                    >
                      <GemSpecimen gem={gem} size={52} ghost={!found} />

                      {/* Brass label plate, the way a real case is captioned. */}
                      <div
                        className="mt-1 text-[9px] leading-tight text-center px-1 rounded-sm w-full"
                        style={{
                          color: found ? '#2A2118' : '#5A4E40',
                          background: found
                            ? 'linear-gradient(#E0C489,#BE9E5F)'
                            : 'transparent',
                          fontWeight: found ? 700 : 400,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {found ? gem.name : '—'}
                      </div>
                      {found && (
                        <div className="text-[9px] mt-0.5" style={{ color: '#8C7F6B' }}>
                          hardness {gem.mohs}
                        </div>
                      )}

                      {n > 1 && (
                        <span
                          className="absolute top-1 right-1 text-[9px] font-bold rounded-full px-1.5 py-0.5"
                          style={{ background: '#C9A227', color: '#241E18' }}
                        >
                          ×{n}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        ))}

        {have === 0 && (
          <p className="text-xs text-center italic px-6" style={{ color: '#8C7F6B' }}>
            Nothing kept yet. The faint shapes are what is waiting — every
            one of them grows in that shape all by itself.
          </p>
        )}
      </div>

      {/* ── the museum label for one stone ──────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-3"
            style={{ background: 'rgba(10,8,6,0.8)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="rounded-2xl w-full max-w-md p-4 max-h-[85vh] overflow-y-auto"
              style={{ background: '#26201A', border: '1px solid #6E5A42' }}
              initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg p-1 shrink-0"
                     style={{ background: 'radial-gradient(ellipse at 50% 30%, #3A332C, #1E1815)' }}>
                  <GemSpecimen gem={selected} size={76} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold" style={{ color: '#F0DFAE' }}>
                    {selected.name}
                  </h3>
                  <p className="text-[11px] italic" style={{ color: '#9A8C76' }}>
                    {selected.kind === 'organic'
                      ? 'made by a living thing'
                      : `a ${selected.kind}`}
                    {' · '}{selected.colors.slice(0, 3).join(', ')}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: '#C9BCA4' }}>
                    <strong style={{ color: '#F5D98F' }}>Shape:</strong> {selected.crystalShape}
                  </p>
                </div>
              </div>

              {/* Hardness, framed as an experiment rather than a number. */}
              <div className="rounded-xl px-3 py-2 mt-3"
                   style={{ background: '#1B1512', border: '1px solid #4A3E30' }}>
                <div className="text-xs" style={{ color: '#F5D98F' }}>
                  <strong>Hardness {selected.mohs}</strong> on the scratch scale
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: '#C9BCA4' }}>
                  {scratchTestFor(selected)
                    ? `You could scratch it with ${scratchTestFor(selected)}.`
                    : 'Nothing in the house will scratch it. Almost nothing on Earth will.'}
                </div>
              </div>

              <p className="text-xs mt-3 leading-relaxed" style={{ color: '#D8C9A8' }}>
                {selected.formationStory}
              </p>

              <p className="text-[11px] mt-2" style={{ color: '#9A8C76' }}>
                <strong style={{ color: '#C9A227' }}>Found:</strong> {selected.whereFound}
              </p>

              <ul className="mt-3 space-y-1.5">
                {selected.facts.map((f, i) => (
                  <li key={i} className="text-[11px] leading-relaxed pl-3 relative"
                      style={{ color: '#C9BCA4' }}>
                    <span className="absolute left-0" style={{ color: '#C9A227' }}>•</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Selling from the case. It used to be a one-way door:
                  keeping was permanent, so she could be holding four
                  sellable stones with no way to reach them. */}
              {(kept[selected.code] ?? 0) > 0 && !isSellableForCoins(selected.code) && (
                /* A case gem has no coin price — offering "sell one
                   for 500,000" and paying nothing is the bug she wrote
                   a letter about. Say what it is actually for. */
                <p className="text-xs italic mt-4 text-center"
                   style={{ color: '#C9BCA4' }}>
                  Too precious for coins. It can be traded for a Great
                  Work at the shop.
                </p>
              )}
              {(kept[selected.code] ?? 0) > 0 && isSellableForCoins(selected.code) && (
                confirmGap ? (
                  <div className="rounded-xl p-3 mt-4"
                       style={{ background: '#3A2A20', border: '1px solid #7A5A3A' }}>
                    <p className="text-xs" style={{ color: '#F0DFAE' }}>
                      This is your only {selected.name}. Sell it and your
                      case will have a gap where it was.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setConfirmGap(false)}
                        className="flex-1 rounded-xl font-bold text-sm"
                        style={{ background: '#3A322A', color: '#E4D3A8', minHeight: 48 }}
                      >
                        keep it
                      </button>
                      <button
                        onClick={() => sell(selected)}
                        disabled={selling}
                        className="flex-1 rounded-xl font-bold text-sm"
                        style={{ background: '#C9A227', color: '#2A2420', minHeight: 48 }}
                      >
                        {selling ? 'selling…' : 'sell anyway'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if ((kept[selected.code] ?? 0) === 1) setConfirmGap(true);
                      else sell(selected);
                    }}
                    disabled={selling}
                    className="w-full rounded-xl mt-4 font-bold text-sm"
                    style={{ background: '#8A6534', color: '#FFF3DC', minHeight: 48,
                             touchAction: 'manipulation' }}
                  >
                    {selling ? 'selling…'
                      : `sell one for ${coinsToPrice(selected.valuePerGram)}`}
                  </button>
                )
              )}
              {note && (
                <p className="text-xs mt-3 rounded-lg p-2"
                   style={{ background: '#3A2A20', color: '#F0DFAE' }}>{note}</p>
              )}
              <button
                onClick={() => { setSelected(null); setConfirmGap(false); setNote(null); }}
                className="w-full rounded-xl mt-2 font-bold text-sm"
                style={{ background: '#C9A227', color: '#2A2420', minHeight: 48,
                         touchAction: 'manipulation' }}
              >
                back to the case
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
