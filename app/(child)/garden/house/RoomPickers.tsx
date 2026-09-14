'use client';

// The two choosers for her own room: which quilt, and what stands on
// each shelf spot. Both are free and both show only what she really
// has — the server checks again, but the picker never offers a stone
// she has not banked, so the refusal is a safety net, not a lesson.

import GemSpecimen from '@/components/child/garden/GemSpecimen';
import { SpeciesIllustration } from '@/components/child/garden/speciesIllustrations';
import { PrizeVeggieArt } from '@/app/(child)/town/play-barn/art';
import { getGem } from '@/lib/world/gemCatalog';
import { getBird } from '@/lib/world/birdCatalog';
import { PRIZE_VEGGIES } from '@/lib/packs/math/munch';
import { QUILTS, type QuiltCode, type ShelfItem } from '@/lib/world/room';
import { Quilt } from './Bedroom';

const SHEET = {
  background: 'rgba(20,14,8,0.7)',
};
const CARD: React.CSSProperties = {
  background: '#FFFAF2', border: '2px solid #C9A227', maxWidth: 420,
};

export function QuiltPicker({ current, onPick, onClose }: {
  current: QuiltCode;
  onPick: (code: QuiltCode) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
         style={SHEET} onClick={onClose}>
      <div className="rounded-2xl p-4 w-full" onClick={e => e.stopPropagation()} style={CARD}>
        <h2 className="font-bold text-base" style={{ color: '#3f2614' }}>A quilt for your bed</h2>
        <p className="text-xs mt-0.5 mb-3" style={{ color: '#8A7A5E' }}>
          Pick any one, any time. The whole room takes its color.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {QUILTS.map(q => (
            <button key={q.code} onClick={() => onPick(q.code)}
                    className="rounded-xl p-2 flex flex-col items-center gap-1"
                    aria-label={q.name}
                    style={{ background: current === q.code ? '#EFE0B0' : '#F6EEDF',
                             border: '1px solid #C9A227', minHeight: 96 }}>
              <svg viewBox="0 0 140 90" width={140} height={90} aria-hidden>
                <Quilt code={q.code} x={4} y={4} w={132} h={82} />
              </svg>
              <span className="text-[11px] font-bold text-center" style={{ color: '#3f2614' }}>
                {q.name}
              </span>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full rounded-xl font-bold text-sm mt-3"
                style={{ background: '#C9A227', color: '#2A2420', minHeight: 48 }}>
          done
        </button>
      </div>
    </div>
  );
}

export function ShelfPicker({
  spot, kept, lifeListCodes, prizeCodes, current, onPick, onClose,
}: {
  spot: number;
  kept: Record<string, number>;
  lifeListCodes: string[];
  prizeCodes: string[];
  current: ShelfItem | null;
  onPick: (item: ShelfItem | null) => void;
  onClose: () => void;
}) {
  const stones = Object.keys(kept).filter(c => (kept[c] ?? 0) > 0)
    .map(c => ({ code: c, gem: getGem(c) })).filter(o => !!o.gem);
  const birds = lifeListCodes.map(c => ({ code: c, bird: getBird(c) })).filter(o => !!o.bird);
  const veggies = Array.from(new Set(prizeCodes))
    .map(c => ({ code: c, veggie: PRIZE_VEGGIES.find(v => v.code === c) })).filter(o => !!o.veggie);
  const nothing = stones.length + birds.length + veggies.length === 0;
  const isCurrent = (kind: ShelfItem['kind'], code: string) =>
    current?.kind === kind && current.code === code;

  const tile = (kind: ShelfItem['kind'], code: string, art: React.ReactNode, label: string) => (
    <button key={`${kind}-${code}`} onClick={() => onPick({ kind, code })}
            className="rounded-xl p-2 flex flex-col items-center gap-1"
            style={{ background: isCurrent(kind, code) ? '#EFE0B0' : '#F6EEDF',
                     border: '1px solid #C9A227', minHeight: 84 }}>
      {art}
      <span className="text-[10px] font-bold text-center" style={{ color: '#3f2614' }}>{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
         style={SHEET} onClick={onClose}>
      <div className="rounded-2xl p-4 w-full" onClick={e => e.stopPropagation()} style={CARD}>
        <h2 className="font-bold text-base" style={{ color: '#3f2614' }}>
          Something for spot {spot + 1}
        </h2>
        <p className="text-xs mt-0.5 mb-3" style={{ color: '#8A7A5E' }}>
          A stone from your case, a bird from your life list, or a prize
          from the barn. It stays yours — the shelf just shows it off.
        </p>
        {nothing ? (
          <p className="text-sm italic py-4" style={{ color: '#6b6255' }}>
            Nothing to show off yet. Stones come from the cavern, birds
            from a real window, and prize veggies from the Play Barn.
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto flex flex-col gap-3">
            {stones.length > 0 && (
              <section>
                <h3 className="text-xs font-bold mb-1" style={{ color: '#8A7A5E' }}>stones</h3>
                <div className="grid grid-cols-3 gap-2">
                  {stones.map(o => tile('stone', o.code, <GemSpecimen gem={o.gem!} size={36} />, o.gem!.name))}
                </div>
              </section>
            )}
            {birds.length > 0 && (
              <section>
                <h3 className="text-xs font-bold mb-1" style={{ color: '#8A7A5E' }}>birds</h3>
                <div className="grid grid-cols-3 gap-2">
                  {birds.map(o => tile('bird', o.code, <SpeciesIllustration code={o.code} size={40} />, o.bird!.commonName))}
                </div>
              </section>
            )}
            {veggies.length > 0 && (
              <section>
                <h3 className="text-xs font-bold mb-1" style={{ color: '#8A7A5E' }}>prize veggies</h3>
                <div className="grid grid-cols-3 gap-2">
                  {veggies.map(o => tile('veggie', o.code, <PrizeVeggieArt code={o.code} size={40} />, o.veggie!.name))}
                </div>
              </section>
            )}
          </div>
        )}
        <div className="flex gap-2 mt-3">
          {current && (
            <button onClick={() => onPick(null)}
                    className="flex-1 rounded-xl font-bold text-sm"
                    style={{ background: '#EFE7D8', color: '#3f2614', minHeight: 48 }}>
              take it down
            </button>
          )}
          <button onClick={onClose}
                  className="flex-1 rounded-xl font-bold text-sm"
                  style={{ background: '#C9A227', color: '#2A2420', minHeight: 48 }}>
            done
          </button>
        </div>
      </div>
    </div>
  );
}
