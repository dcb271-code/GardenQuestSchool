'use client';

// Phase 1 of the art store: the easel up front, her picture wall
// below. Every pixel of chrome is icon-first — the primary artist is
// five and does not read yet.

import { useState } from 'react';
import Link from 'next/link';
import { publicStorageUrl } from '@/lib/storage/publicUrl';
import { ART_BUCKET, type ArtGallery, type ArtPiece } from '@/lib/world/artStore';
import Easel from './Easel';

export default function ArtStoreScene({
  learnerId, initialGallery, baseUrl,
}: {
  learnerId: string;
  initialGallery: ArtGallery;
  baseUrl: string;
}) {
  const [gallery, setGallery] = useState<ArtGallery>(initialGallery);
  const [confirmDelete, setConfirmDelete] = useState<ArtPiece | null>(null);

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
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#3A2E1E' }}>
              🎨 The Art Store
            </h1>
            <p className="text-xs" style={{ color: '#8A7A5E' }}>
              Paint something. The paint is free — it always will be.
            </p>
          </div>
          <Link href={`/garden?learner=${learnerId}`}
                className="text-sm rounded-xl px-3 py-2 shrink-0"
                style={{ background: '#EADFC6', color: '#4A3B24', minHeight: 44,
                         display: 'inline-flex', alignItems: 'center' }}>
            ← garden
          </Link>
        </div>

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
                       className="w-full rounded-md block"
                       style={{ background: '#FFFDF6' }} />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px]" style={{ color: '#F4EDDC' }}>
                      {p.createdAt.slice(0, 10)}
                    </span>
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
