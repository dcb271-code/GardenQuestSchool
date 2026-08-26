'use client';

// Phase 1 of the art store: the easel up front, her picture wall
// below. Every pixel of chrome is icon-first — the primary artist is
// five and does not read yet.

import { useState } from 'react';
import Link from 'next/link';
import { publicStorageUrl } from '@/lib/storage/publicUrl';
import {
  ART_BUCKET, FRAME_CATALOG, type ArtGallery, type ArtPiece,
} from '@/lib/world/artStore';
import { coinsToPrice } from '@/lib/world/cavern';
import Easel from './Easel';

/** What each frame looks like on a picture. Plain is honest wood. */
export function frameStyle(code?: string): React.CSSProperties {
  switch (code) {
    case 'starry':
      return { border: '6px solid #2E4A7A', outline: '3px dashed #F5D98F', outlineOffset: -6 };
    case 'gold':
      return { border: '10px double #C9A227' };
    case 'flowered':
      return { border: '8px solid #E8B4C0', outline: '3px dotted #C94C3E', outlineOffset: -7 };
    default:
      return { border: '6px solid #8A6238' };
  }
}

export default function ArtStoreScene({
  learnerId, initialGallery, baseUrl, initialOwnedFrames, initialCoins,
}: {
  learnerId: string;
  initialGallery: ArtGallery;
  baseUrl: string;
  initialOwnedFrames: string[];
  initialCoins: number;
}) {
  const [gallery, setGallery] = useState<ArtGallery>(initialGallery);
  const [confirmDelete, setConfirmDelete] = useState<ArtPiece | null>(null);
  const [ownedFrames, setOwnedFrames] = useState<string[]>(initialOwnedFrames);
  const [coins, setCoins] = useState(initialCoins);
  const [note, setNote] = useState<string | null>(null);

  const buyFrame = async (code: string) => {
    try {
      const res = await fetch('/api/art', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, action: 'buy_frame', frame: code }),
      });
      const d = await res.json();
      if (d.error) { setNote(d.error); window.setTimeout(() => setNote(null), 4000); return; }
      setOwnedFrames(d.ownedFrames ?? ownedFrames);
      if (typeof d.coins === 'number') setCoins(d.coins);
    } catch { /* the shelf stays as it was */ }
  };

  const applyFrame = async (piece: ArtPiece, frame: string) => {
    try {
      const res = await fetch('/api/art', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, action: 'set_frame', id: piece.id, frame }),
      });
      const d = await res.json();
      if (d.gallery) setGallery(d.gallery);
      if (d.error) { setNote(d.error); window.setTimeout(() => setNote(null), 4000); }
    } catch { /* nothing changed */ }
  };

  const urlFor = (p: ArtPiece) => publicStorageUrl(baseUrl, ART_BUCKET, p.path);

  const remove = async (piece: ArtPiece) => {
    try {
      const res = await fetch('/api/art', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, action: 'delete', id: piece.id }),
      });
      const d = await res.json();
      if (d.gallery) setGallery(d.gallery);
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#F3E7D8' }}>
      <div className="max-w-2xl mx-auto p-4 pb-16">
        {/* the storefront: striped awning over a window of easels */}
        <svg viewBox="0 0 360 84" className="w-full mb-2" style={{ display: 'block' }}>
          <rect x={10} y={30} width={340} height={54} rx={6} fill="#B0713C" stroke="#6E4520" strokeWidth={2} />
          <rect x={26} y={44} width={130} height={40} rx={4} fill="#EAF2F6" stroke="#6E4520" strokeWidth={2} />
          {[0, 1, 2].map(i => (
            <g key={i} transform={`translate(${44 + i * 38}, 76)`}>
              <path d="M -8 0 L 0 -22 L 8 0 M 0 -22 L 0 0" stroke="#8A6238" strokeWidth={2} fill="none" />
              <rect x={-7} y={-20} width={14} height={11} fill={['#C94C3E', '#4A7BA6', '#5F7F4A'][i]} />
            </g>
          ))}
          <rect x={196} y={48} width={70} height={36} rx={3} fill="#6E4520" />
          <circle cx={258} cy={66} r={2.5} fill="#C9A227" />
          <text x={290} y={70} textAnchor="middle" fontSize={22}>🎨</text>
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M ${12 + i * 38} 30 L ${12 + i * 38 + 19} 6 L ${12 + i * 38 + 38} 30 Z`}
                  fill={i % 2 ? '#C94C3E' : '#FFFDF6'} stroke="#8F3F30" strokeWidth={1.5} />
          ))}
        </svg>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#3A2E1E' }}>
              🎨 The Art Store
            </h1>
            <p className="text-xs" style={{ color: '#8A7A5E' }}>
              Paint something. The paint is free — it always will be.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs rounded-full px-2 py-1 font-bold"
                  style={{ background: '#3E2C1A', color: '#F5D98F' }}>
              {coinsToPrice(coins)}
            </span>
            <Link href={`/garden?learner=${learnerId}`}
                  className="text-sm rounded-xl px-3 py-2"
                  style={{ background: '#EADFC6', color: '#4A3B24', minHeight: 44,
                           display: 'inline-flex', alignItems: 'center' }}>
              ← garden
            </Link>
          </div>
        </div>
        {note && (
          <p className="text-xs mb-2 rounded-lg p-2"
             style={{ background: '#4A2A1A', color: '#F0C4A8' }}>{note}</p>
        )}

        <Easel learnerId={learnerId} onSaved={g => setGallery(g as ArtGallery)} />

        {/* her wall */}
        {gallery.length > 0 && (
          <>
            <h2 className="text-sm font-bold mt-6 mb-2" style={{ color: '#3A2E1E' }}>
              🖼️ Your wall ({gallery.length})
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {gallery.map(p => (
                <div key={p.id} className="rounded-xl p-2"
                     style={{ background: '#8A6238' }}>
                  <img src={urlFor(p)} alt={p.title ?? 'Your painting'}
                       className="w-full rounded-sm block"
                       style={{ background: '#FFFDF6', ...frameStyle(p.frame) }} />
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex gap-1">
                      {/* frame chips: plain plus whatever she owns */}
                      {['plain', ...ownedFrames].map(fc => (
                        <button key={fc} onClick={() => applyFrame(p, fc)}
                                aria-label={`Use the ${fc} frame`}
                                className="rounded-full"
                                style={{ width: 24, height: 24,
                                         background: fc === 'plain' ? '#8A6238'
                                           : fc === 'starry' ? '#2E4A7A'
                                           : fc === 'gold' ? '#C9A227' : '#E8B4C0',
                                         border: (p.frame ?? 'plain') === fc
                                           ? '2.5px solid #FFFDF6' : '1.5px solid #5E4020' }} />
                      ))}
                    </div>
                    <button onClick={() => setConfirmDelete(p)}
                            aria-label="Take this picture down"
                            className="text-sm rounded-full"
                            style={{ width: 32, height: 32, background: '#F4EDDC' }}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* the shelves — frames only; the making stays free */}
        <h2 className="text-sm font-bold mt-6 mb-2" style={{ color: '#3A2E1E' }}>
          🛒 The shelves
        </h2>
        <div className="space-y-2">
          {FRAME_CATALOG.map(f => {
            const owned = ownedFrames.includes(f.code);
            const afford = coins >= f.price;
            return (
              <div key={f.code} className="rounded-2xl p-3 flex items-center gap-3"
                   style={{ background: '#FFFDF6', border: '1px solid #C9A227' }}>
                <div className="shrink-0 rounded-sm" style={{ width: 44, height: 44,
                       background: '#EADFC6', ...frameStyle(f.code) }} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm" style={{ color: '#3A2E1E' }}>{f.name}</h3>
                  <p className="text-[11px] leading-snug" style={{ color: '#6B5C42' }}>{f.blurb}</p>
                </div>
                {owned ? (
                  <span className="text-[10px] rounded-full px-2 py-1 font-bold shrink-0"
                        style={{ background: '#5A8C4A', color: '#FFF' }}>yours</span>
                ) : (
                  <button onClick={() => buyFrame(f.code)} disabled={!afford}
                          className="rounded-xl px-3 font-bold text-sm shrink-0 disabled:opacity-45"
                          style={{ background: afford ? '#C9A227' : '#D8CEBA',
                                   color: '#2A2420', minHeight: 48 }}>
                    {coinsToPrice(f.price)}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-center italic mt-2" style={{ color: '#9A8C76' }}>
          The paint is free and always will be. Frames are just for
          showing off — which is allowed.
        </p>

        {/* the plaque — founding lore, true story */}
        <p className="text-[11px] text-center italic mt-6" style={{ color: '#9A8C76' }}>
          This store was paid for, in full, by one diamond.
        </p>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(20,14,8,0.7)' }}
             onClick={() => setConfirmDelete(null)}>
          <div className="rounded-2xl p-4 w-full" style={{ background: '#FFFAF2', maxWidth: 340 }}
               onClick={e => e.stopPropagation()}>
            <p className="text-sm font-bold text-center" style={{ color: '#3f2614' }}>
              Take this picture down for good?
            </p>
            <img src={urlFor(confirmDelete)} alt="" className="w-full rounded-lg mt-2"
                 style={{ background: '#FFFDF6', border: '1px solid #C9B88E' }} />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setConfirmDelete(null)}
                      className="flex-1 rounded-xl font-bold text-sm"
                      style={{ background: '#EFE7D8', color: '#3f2614', minHeight: 48 }}>
                keep it
              </button>
              <button onClick={() => remove(confirmDelete)}
                      className="flex-1 rounded-xl font-bold text-sm"
                      style={{ background: '#B0533F', color: '#FFF', minHeight: 48 }}>
                take it down
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
