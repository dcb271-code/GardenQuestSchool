// app/(child)/birds/BirdScene.tsx
//
// The bird hide.
//
// Layout rule that overrides tidiness everywhere in this file: photo
// and text choices are TWO COLUMNS in portrait, never four. Cecily
// could not reliably tap between four kana at portrait width, and a
// bird photo is a far bigger tap target to get wrong. Choices ramp
// 2 → 3 → 4 by adding ROWS.

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  UNITS, getUnit, buildExercises, isUnitUnlocked, unitsOfCrew, crewCodes,
  STAGE_LABEL, STAGE_EMOJI, getBird,
  type BirdExercise, type BirdUnit, type TeachPage,
} from '@/lib/birds/curriculum';
import {
  resolvePhoto, type PhotoIndex, type ResolvedPhoto,
} from '@/lib/birds/photoResolve';
import { dueUnits, badgeFor, BADGE_MARK, todayKey, type ReviewMap } from '@/lib/learning/review';
import { SizeLadder, BillChart, FourKeys } from '@/components/child/birds/birdVisuals';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

type Phase = 'menu' | 'teach' | 'practice' | 'done';

interface Result {
  exerciseKind: string;
  correct: boolean;
  retries: number;
}

const CREW_TITLE: Record<string, string> = {
  crew1: 'The Everyday Five',
  crew2: 'The Little Gang',
};

export default function BirdScene({ learnerId }: { learnerId: string }) {
  const { settings } = useAccessibilitySettings();
  const reduced = settings.reducedMotion;

  const [completed, setCompleted] = useState<string[]>([]);
  const [review, setReview] = useState<ReviewMap>({});
  const [photos, setPhotos] = useState<PhotoIndex>({});
  const [loaded, setLoaded] = useState(false);

  const [phase, setPhase] = useState<Phase>('menu');
  const [unitCode, setUnitCode] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [exIdx, setExIdx] = useState(0);
  const [retries, setRetries] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [saved, setSaved] = useState<{ passed: boolean; gemGranted: boolean } | null>(null);
  const [seed, setSeed] = useState(1);

  const unit = unitCode ? getUnit(unitCode) : undefined;

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch(`/api/birds/practice?learner=${learnerId}`).then(r => r.json()).catch(() => ({})),
      fetch('/api/birds/photos').then(r => r.json()).catch(() => ({})),
    ]).then(([prog, pics]) => {
      if (!alive) return;
      setCompleted(prog.completed ?? []);
      setReview(prog.review ?? {});
      setPhotos(pics.photos ?? {});
      setLoaded(true);
    });
    return () => { alive = false; };
  }, [learnerId]);

  /**
   * Generated exercises, minus any whose photographs are not curated
   * yet. The catalog always runs ahead of the curation — a new crew is
   * a typed array, and its photos are a person looking at 360 images —
   * so this keeps the gap invisible rather than fatal.
   */
  const exercises = useMemo(() => {
    if (!unit) return [];
    return buildExercises(unit, seed).filter(ex => {
      if (ex.kind === 'photo_name' || ex.kind === 'field_mark') {
        return !!resolvePhoto(photos, ex.photo.birdCode, ex.photo.role);
      }
      if (ex.kind === 'name_photo') {
        return ex.photos.every(p => !!resolvePhoto(photos, p.birdCode, p.role));
      }
      return true;
    });
  }, [unit?.code, seed, photos]);

  const due = useMemo(() => dueUnits(review, todayKey()), [review]);

  const start = (code: string) => {
    setUnitCode(code);
    setSeed(Math.floor(Date.now() % 100000) + 1);
    setPage(0); setExIdx(0); setRetries(0);
    setResults([]); setWrong(null); setSaved(null);
    setPhase('teach');
  };

  const finish = async (final: Result[]) => {
    setPhase('done');
    try {
      const res = await fetch('/api/birds/practice', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, unitCode, results: final }),
      });
      const d = await res.json();
      if (d.completed) setCompleted(d.completed);
      if (d.review) setReview(d.review);
      setSaved({ passed: !!d.passed, gemGranted: !!d.gemGranted });
    } catch {
      setSaved({ passed: false, gemGranted: false });
    }
  };

  /** A wrong tap never advances — it shows the hint and waits. */
  const answer = (correct: boolean) => {
    const ex = exercises[exIdx];
    if (!correct) {
      setWrong(w => (w === null ? 0 : w + 1));
      setRetries(r => r + 1);
      return;
    }
    const next = [...results, {
      exerciseKind: ex.kind,
      correct: retries === 0,   // first-try only
      retries,
    }];
    setResults(next);
    setWrong(null);
    setRetries(0);
    if (exIdx + 1 >= exercises.length) finish(next);
    else setExIdx(exIdx + 1);
  };

  if (!loaded) {
    return <Shell learnerId={learnerId}><p className="p-6 text-sm">Opening the hide…</p></Shell>;
  }

  // ── MENU ────────────────────────────────────────────────────────
  if (phase === 'menu') {
    return (
      <Shell learnerId={learnerId}>
        <p className="text-sm mb-3" style={{ color: '#6b6255' }}>
          The birds outside your window, commonest first. Learn these and
          you will know more than most grown-ups.
        </p>

        {due.length > 0 && (
          <div className="mb-4 rounded-xl p-3"
               style={{ background: 'rgba(107,142,90,0.12)', border: '1px solid #6b8e5a' }}>
            <div className="text-xs font-bold mb-1" style={{ color: '#3f2614' }}>
              ↻ ready for another look
            </div>
            <div className="flex flex-wrap gap-2">
              {due.slice(0, 3).map(code => {
                const u = getUnit(code);
                if (!u) return null;
                return (
                  <button key={code} onClick={() => start(code)}
                    className="rounded-lg px-3 py-2 text-xs font-bold"
                    style={{ background: '#fffaf2', border: '1px solid #6b8e5a', color: '#3f2614', minHeight: 44 }}>
                    {u.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {crewCodes().map(crew => (
          <div key={crew} className="mb-5">
            <h2 className="text-sm font-bold mb-2" style={{ color: '#3f2614' }}>
              {CREW_TITLE[crew] ?? crew}
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {unitsOfCrew(crew).map(u => {
                const unlocked = isUnitUnlocked(u.code, completed);
                const done = completed.includes(u.code);
                return (
                  <button
                    key={u.code}
                    disabled={!unlocked}
                    onClick={() => unlocked && start(u.code)}
                    className="text-left rounded-xl p-3 disabled:opacity-45"
                    style={{
                      background: done ? 'rgba(107,142,90,0.14)' : 'rgba(255,250,242,0.9)',
                      border: `1px solid ${done ? '#6b8e5a' : '#e3dccf'}`,
                      minHeight: 60,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span aria-hidden className="text-lg">{unlocked ? STAGE_EMOJI[u.stage] : '🔒'}</span>
                      <span className="font-bold text-sm" style={{ color: '#3f2614' }}>{u.title}</span>
                      <span className="text-xs" style={{ color: '#6b6255' }}>{STAGE_LABEL[u.stage]}</span>
                      <span className="ml-auto text-sm">{BADGE_MARK[badgeFor(review[u.code])]}</span>
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#6b6255' }}>{u.blurb}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Shell>
    );
  }

  if (!unit) return <Shell learnerId={learnerId}><p className="p-6">Lost the thread.</p></Shell>;

  // ── TEACH ───────────────────────────────────────────────────────
  if (phase === 'teach') {
    const p = unit.teach[page];
    const last = page + 1 >= unit.teach.length;
    return (
      <Shell learnerId={learnerId}>
        <motion.div
          key={page}
          initial={reduced ? undefined : { opacity: 0, y: 8 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          className="rounded-2xl p-4"
          style={{ background: 'rgba(255,250,242,0.94)', border: '1px solid #e3dccf' }}
        >
          <h2 className="font-bold text-base mb-2" style={{ color: '#3f2614' }}>{p.heading}</h2>
          <p className="text-sm leading-relaxed mb-2" style={{ color: '#4a4034' }}>{p.body}</p>
          <Figure page={p} photos={photos} />
        </motion.div>

        <div className="flex gap-2 mt-4">
          {page > 0 && (
            <button onClick={() => setPage(page - 1)}
              className="rounded-xl px-4 font-bold text-sm"
              style={{ background: '#fffaf2', border: '1px solid #e3dccf', color: '#3f2614', minHeight: 48 }}>
              back
            </button>
          )}
          <button
            onClick={() => (last ? setPhase('practice') : setPage(page + 1))}
            className="flex-1 rounded-xl px-4 font-bold text-sm"
            style={{ background: '#6b8e5a', color: '#fffaf2', minHeight: 48 }}
          >
            {last ? 'try it →' : 'next →'}
          </button>
        </div>
      </Shell>
    );
  }

  // ── PRACTICE ────────────────────────────────────────────────────
  if (phase === 'practice') {
    if (exercises.length === 0) {
      return (
        <Shell learnerId={learnerId}>
          <p className="text-sm">
            The photographs for this one are not ready yet. Try another unit.
          </p>
          <button onClick={() => setPhase('menu')}
            className="mt-4 rounded-xl px-4 font-bold text-sm"
            style={{ background: '#6b8e5a', color: '#fffaf2', minHeight: 48 }}>
            back to the list
          </button>
        </Shell>
      );
    }
    const ex = exercises[exIdx];
    return (
      <Shell learnerId={learnerId}>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-2 rounded-full" style={{ background: '#e3dccf' }}>
            <div className="h-2 rounded-full"
                 style={{ background: '#6b8e5a', width: `${(exIdx / exercises.length) * 100}%` }} />
          </div>
          <span className="text-xs font-bold" style={{ color: '#6b6255' }}>
            {exIdx + 1}/{exercises.length}
          </span>
        </div>

        <ExerciseView ex={ex} photos={photos} seed={seed + exIdx} onAnswer={answer} />

        {wrong !== null && (
          <motion.div
            initial={reduced ? undefined : { opacity: 0 }}
            animate={reduced ? undefined : { opacity: 1 }}
            className="mt-3 rounded-xl p-3 text-sm"
            style={{ background: 'rgba(214,158,74,0.16)', border: '1px solid #d69e4a', color: '#3f2614' }}
          >
            <strong>Not that one.</strong> {ex.hint}
          </motion.div>
        )}
      </Shell>
    );
  }

  // ── DONE ────────────────────────────────────────────────────────
  const firstTry = results.filter(r => r.correct).length;
  return (
    <Shell learnerId={learnerId}>
      <div className="rounded-2xl p-5 text-center"
           style={{ background: 'rgba(255,250,242,0.94)', border: '1px solid #e3dccf' }}>
        <div className="text-4xl mb-2" aria-hidden>🐦</div>
        <h2 className="font-bold text-base mb-1" style={{ color: '#3f2614' }}>{unit.title}</h2>
        <p className="text-sm mb-2" style={{ color: '#4a4034' }}>
          {firstTry} of {results.length} right first time.
        </p>
        <p className="text-sm italic mb-3" style={{ color: '#6b6255' }}>{unit.outro}</p>
        {saved?.gemGranted && (
          <p className="text-sm font-bold" style={{ color: '#6b8e5a' }}>💎 a curiosity gem</p>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={() => setPhase('menu')}
          className="flex-1 rounded-xl px-4 font-bold text-sm"
          style={{ background: '#6b8e5a', color: '#fffaf2', minHeight: 48 }}>
          back to the list
        </button>
        <Link href={`/garden?learner=${learnerId}`}
          className="flex-1 rounded-xl px-4 font-bold text-sm flex items-center justify-center"
          style={{ background: '#fffaf2', border: '1px solid #e3dccf', color: '#3f2614', minHeight: 48 }}>
          the garden
        </Link>
      </div>
    </Shell>
  );
}

// ── pieces ────────────────────────────────────────────────────────

function Shell({ learnerId, children }: { learnerId: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(#e9efe4, #d8e3d0)' }}>
      <header className="flex items-center gap-2 px-4 py-3">
        <Link href={`/garden?learner=${learnerId}`}
          className="rounded-full bg-white border border-ochre text-lg"
          aria-label="back to the garden"
          style={{ minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          ←
        </Link>
        <h1 className="font-bold" style={{ color: '#3f2614' }}>The Bird Hide</h1>
      </header>
      <main className="px-4 pb-10 max-w-xl mx-auto">{children}</main>
    </div>
  );
}

function Figure({ page, photos }: { page: TeachPage; photos: PhotoIndex }) {
  const f = page.figure;
  if (!f) return null;
  if (f.kind === 'four_keys') return <FourKeys />;
  if (f.kind === 'size_ladder') return <SizeLadder highlight={f.highlight} />;
  if (f.kind === 'bills') return <BillChart highlight={f.highlight} />;

  const code = f.kind === 'photo' ? f.ref.birdCode : f.birdCode;
  const role = f.kind === 'photo' ? f.ref.role : 'perched';
  const pic = resolvePhoto(photos, code, role);
  if (!pic) return null;

  return (
    <figure className="mt-2">
      <PhotoCard photo={pic} />
      {f.kind === 'marks' && (
        <ul className="mt-2 space-y-1">
          {(getBird(code)?.fieldMarks ?? []).map(m => (
            <li key={m} className="text-xs flex gap-1.5" style={{ color: '#4a4034' }}>
              <span aria-hidden>•</span><span>{m}</span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}

function PhotoCard({ photo, tall = false }: { photo: ResolvedPhoto; tall?: boolean }) {
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid #e3dccf' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={photo.alt}
        className="w-full object-cover"
        style={{ height: tall ? 200 : 160 }}
        loading="lazy"
      />
      <span
        className="absolute bottom-1 right-1 rounded px-1 text-[9px]"
        style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
        title={`${photo.attribution.photographer ?? 'Unknown'} · ${photo.attribution.licenseCode}`}
      >
        ⓘ {photo.attribution.photographer ?? 'Unknown'}
      </span>
    </div>
  );
}

/**
 * Choice buttons. Always TWO across — extra choices add rows, never
 * columns. See the header comment.
 */
function Choices({
  options, onPick,
}: { options: React.ReactNode[]; onPick: (i: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {options.map((node, i) => (
        <button
          key={i}
          onClick={() => onPick(i)}
          className="rounded-xl p-2 text-left text-sm font-bold"
          style={{
            background: 'rgba(255,250,242,0.95)', border: '1px solid #e3dccf',
            color: '#3f2614', minHeight: 64, touchAction: 'manipulation',
          }}
        >
          {node}
        </button>
      ))}
    </div>
  );
}

function ExerciseView({
  ex, photos, seed, onAnswer,
}: {
  ex: BirdExercise;
  photos: PhotoIndex;
  seed: number;
  onAnswer: (correct: boolean) => void;
}) {
  const prompt = (
    <h2 className="font-bold text-base mb-1" style={{ color: '#3f2614' }}>{ex.prompt}</h2>
  );

  if (ex.kind === 'true_false') {
    return (
      <div>
        {prompt}
        <Choices
          options={['true', 'false']}
          onPick={i => onAnswer((i === 0) === ex.answer)}
        />
      </div>
    );
  }

  if (ex.kind === 'name_photo') {
    return (
      <div>
        {prompt}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {ex.photos.map((ref, i) => {
            const pic = resolvePhoto(photos, ref.birdCode, ref.role, seed);
            if (!pic) return null;
            return (
              <button key={i} onClick={() => onAnswer(i === ex.correctIndex)}
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid #e3dccf', touchAction: 'manipulation' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pic.url} alt={pic.alt} className="w-full object-cover"
                     style={{ height: 140 }} loading="lazy" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const pic = (ex.kind === 'photo_name' || ex.kind === 'field_mark')
    ? resolvePhoto(photos, ex.photo.birdCode, ex.photo.role, seed)
    : null;

  return (
    <div>
      {prompt}
      {pic && <div className="mt-2"><PhotoCard photo={pic} tall /></div>}
      <Choices
        options={ex.choices.map(c => <span key={c}>{c}</span>)}
        onPick={i => onAnswer(i === ex.correctIndex)}
      />
    </div>
  );
}
