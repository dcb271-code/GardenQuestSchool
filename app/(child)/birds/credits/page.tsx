// app/(child)/birds/credits/page.tsx
//
// Attribution for every borrowed thing in the bird hide.
//
// This page is not decoration — it is how the CC licence obligations
// are met. CC BY 4.0 §3(a) wants the creator, a licence notice with a
// link, a link back to the source, and an indication that the work was
// modified; CC explicitly allows all of it to live on one linked
// page, which is this one. The 3.0/2.5 recordings additionally require
// the original title, so it is shown where the database has one.
//
// Xeno-canto's canonical citation format is
//   "{recordist}, XC{id}. Accessible at www.xeno-canto.org/{id}."
// and the rows below follow it.

import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { getBird } from '@/lib/world/birdCatalog';

export const revalidate = 3600;

interface AudioRow {
  bird_code: string;
  kind: string;
  source_id: string;
  source_url: string;
  recordist: string;
  license_url: string;
  original_title: string | null;
  modifications: string;
}

interface PhotoRow {
  bird_code: string;
  photographer: string | null;
  license_code: string;
  source_url: string;
}

/** Xeno-canto returns protocol-relative licence URLs; make them clickable. */
function licenseHref(url: string): string {
  return url.startsWith('//') ? `https:${url}` : url;
}

/** '…/licenses/by-nc-sa/4.0/' → 'CC BY-NC-SA 4.0'. */
function licenseLabel(url: string): string {
  const m = url.match(/licenses\/([a-z-]+)\/(\d+\.\d+)/);
  return m ? `CC ${m[1].toUpperCase()} ${m[2]}` : 'Creative Commons';
}

export default async function BirdCreditsPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const [{ data: audio }, { data: photos }] = await Promise.all([
    db.from('bird_audio')
      .select('bird_code, kind, source_id, source_url, recordist, license_url, original_title, modifications')
      .order('bird_code'),
    db.from('bird_photo')
      .select('bird_code, photographer, license_code, source_url')
      .order('bird_code'),
  ]);

  const audioRows = (audio ?? []) as AudioRow[];
  const photoRows = (photos ?? []) as PhotoRow[];
  const back = `/birds${searchParams.learner ? `?learner=${searchParams.learner}` : ''}`;

  // One line per photographer per bird — the per-photo detail is on
  // each photo's ⓘ badge; this page is the roll of names.
  const photoCredits = new Map<string, PhotoRow>();
  for (const p of photoRows) {
    photoCredits.set(`${p.bird_code}|${p.photographer ?? 'Unknown'}|${p.license_code}`, p);
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(#e9efe4, #d8e3d0)' }}>
      <header className="flex items-center gap-2 px-4 py-3">
        <Link href={back}
          className="rounded-full bg-white border border-ochre text-lg"
          aria-label="back to the bird hide"
          style={{ minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          ←
        </Link>
        <h1 className="font-bold" style={{ color: '#3f2614' }}>Thank you</h1>
      </header>
      <main className="px-4 pb-10 max-w-xl mx-auto">
        <p className="text-sm mb-4" style={{ color: '#4a4034' }}>
          Real people stood in fields with microphones and cameras so we
          could learn these birds. Their work is shared under Creative
          Commons licences, and these are their names.
        </p>

        <h2 className="text-sm font-bold mb-2" style={{ color: '#3f2614' }}>🔊 Sound recordings</h2>
        <p className="text-xs mb-2" style={{ color: '#6b6255' }}>
          All recordings come from{' '}
          <a href="https://xeno-canto.org" className="underline">xeno-canto.org</a>.
          Every clip has been {audioRows[0]?.modifications ?? 'trimmed and re-encoded'}.
        </p>
        <div className="rounded-2xl p-4 mb-5"
             style={{ background: 'rgba(255,250,242,0.94)', border: '1px solid #e3dccf' }}>
          {audioRows.length === 0 && (
            <p className="text-xs" style={{ color: '#6b6255' }}>No recordings yet.</p>
          )}
          <ul className="space-y-2">
            {audioRows.map(r => (
              <li key={r.source_id + r.bird_code + r.kind} className="text-xs" style={{ color: '#4a4034' }}>
                <strong>{getBird(r.bird_code)?.commonName ?? r.bird_code}</strong>
                {' '}({r.kind.replace('_', ' ')}) — {r.recordist},{' '}
                <a href={r.source_url} className="underline">{r.source_id}</a>
                {r.original_title ? <> · “{r.original_title}”</> : null}
                {' '}·{' '}
                <a href={licenseHref(r.license_url)} className="underline">
                  {licenseLabel(r.license_url)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <h2 className="text-sm font-bold mb-2" style={{ color: '#3f2614' }}>📷 Photographs</h2>
        <p className="text-xs mb-2" style={{ color: '#6b6255' }}>
          Photographs come from naturalists on{' '}
          <a href="https://www.inaturalist.org" className="underline">iNaturalist</a>.
        </p>
        <div className="rounded-2xl p-4"
             style={{ background: 'rgba(255,250,242,0.94)', border: '1px solid #e3dccf' }}>
          {photoCredits.size === 0 && (
            <p className="text-xs" style={{ color: '#6b6255' }}>No photographs yet.</p>
          )}
          <ul className="space-y-2">
            {Array.from(photoCredits.values()).map((p, i) => (
              <li key={i} className="text-xs" style={{ color: '#4a4034' }}>
                <strong>{getBird(p.bird_code)?.commonName ?? p.bird_code}</strong>
                {' '}— {p.photographer ?? 'Unknown'} ·{' '}
                <a href={p.source_url} className="underline">source</a> · {p.license_code}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
