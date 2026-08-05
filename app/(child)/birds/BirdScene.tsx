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

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  getUnit, buildExercises, isUnitUnlocked, visibleUnits, crewCodes,
  teachSequence, birdTierForLevel, STAGE_LABEL, STAGE_EMOJI, getBird,
  type BirdExercise, type TeachPage, type BirdClipRef,
} from '@/lib/birds/curriculum';
import {
  resolvePhoto, galleryPhotos, GALLERY_CAPTION,
  type PhotoIndex, type ResolvedPhoto,
} from '@/lib/birds/photoResolve';
import {
  resolveClip, birdsWithAudio, type AudioIndex, type ResolvedClip,
} from '@/lib/birds/audioResolve';
import {
  lifeListRows, lifeListCount, rarityLabel, friendlyDate, sightingFact,
  type LifeList, type LifeListEntry,
} from '@/lib/birds/lifeList';
import { playArrival, playSparkle } from '@/lib/audio/sfx';
import { dueUnits, badgeFor, BADGE_MARK, todayKey, type ReviewMap } from '@/lib/learning/review';
import { SizeLadder, BillChart, FourKeys } from '@/components/child/birds/birdVisuals';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

type Phase = 'menu' | 'teach' | 'practice' | 'done' | 'lifelist';

interface Result {
  exerciseKind: string;
  correct: boolean;
  retries: number;
}

const CREW_TITLE: Record<string, string> = {
  crew1: 'The Everyday Five',
  crew2: 'The Little Gang',
};

export default function BirdScene({
  learnerId, learnerLevel = 2,
}: { learnerId: string; learnerLevel?: number }) {
  const { settings } = useAccessibilitySettings();
  const reduced = settings.reducedMotion;
  // Level 1 gets the simple tier: crew 1 only, two choices, colour and
  // name, nothing to tell apart by ear.
  const tier = birdTierForLevel(learnerLevel);

  const [completed, setCompleted] = useState<string[]>([]);
  const [review, setReview] = useState<ReviewMap>({});
  const [photos, setPhotos] = useState<PhotoIndex>({});
  const [audio, setAudio] = useState<AudioIndex>({});
  const [lifelist, setLifelist] = useState<LifeList>({});
  const [logging, setLogging] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<
    { code: string; gem: boolean; entry: LifeListEntry } | null
  >(null);
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
      fetch('/api/birds/audio').then(r => r.json()).catch(() => ({})),
    ]).then(([prog, pics, clips]) => {
      if (!alive) return;
      setCompleted(prog.completed ?? []);
      setReview(prog.review ?? {});
      setPhotos(pics.photos ?? {});
      setAudio(clips.audio ?? {});
      setLifelist(prog.lifelist ?? {});
      setLoaded(true);
    });
    return () => { alive = false; };
  }, [learnerId]);

  /**
   * Generated exercises, minus any whose photographs or clips are not
   * curated yet. The catalog always runs ahead of the curation — a new
   * crew is a typed array; its photos are a person looking at 360
   * images and its clips are a person listening to every window — so
   * this keeps the gap invisible rather than fatal.
   */
  const exercises = useMemo(() => {
    if (!unit) return [];
    return buildExercises(unit, seed, tier).filter(ex => {
      if (ex.kind === 'photo_name' || ex.kind === 'field_mark') {
        return !!resolvePhoto(photos, ex.photo.birdCode, ex.photo.role);
      }
      if (ex.kind === 'name_photo') {
        return ex.photos.every(p => !!resolvePhoto(photos, p.birdCode, p.role));
      }
      if (ex.kind === 'mnemonic' || ex.kind === 'song_or_call'
          || ex.kind === 'pitch_shape' || ex.kind === 'tone') {
        return !!resolveClip(audio, ex.clip.birdCode, ex.clip.kind);
      }
      if (ex.kind === 'song_to_photo') {
        return !!resolveClip(audio, ex.clip.birdCode, ex.clip.kind)
          && ex.photos.every(p => !!resolvePhoto(photos, p.birdCode, p.role));
      }
      if (ex.kind === 'which_did_you_hear') {
        return ex.clips.every(c => !!resolveClip(audio, c.birdCode, c.kind));
      }
      return true;
    });
  }, [unit?.code, seed, photos, audio, tier]);

  /**
   * Warm the NEXT exercise's clip while this one is on screen. A
   * four-second stall between "listen" and hearing anything reads as
   * broken to a child, and the tablet's connection is not fast.
   */
  useEffect(() => {
    if (phase !== 'practice') return;
    const next = exercises[exIdx + 1];
    if (!next) return;
    const refs: BirdClipRef[] =
      'clip' in next ? [next.clip] : 'clips' in next ? next.clips : [];
    for (let i = 0; i < refs.length; i++) {
      const ref = refs[i];
      const c = resolveClip(audio, ref.birdCode, ref.kind, seed + exIdx + 1 + i);
      if (!c) continue;
      const el = document.createElement('audio');
      el.preload = 'auto';
      const opus = document.createElement('source');
      opus.src = c.url;
      opus.type = 'audio/ogg; codecs=opus';
      el.appendChild(opus);
      if (c.fallbackUrl) {
        const m4a = document.createElement('source');
        m4a.src = c.fallbackUrl;
        m4a.type = 'audio/mp4';
        el.appendChild(m4a);
      }
      el.load();
    }
  }, [phase, exIdx, exercises, audio, seed]);

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

  /** "I saw one!" — the entry that reaches outside the app. */
  const logSighting = async (birdCode: string, note?: string) => {
    if (logging) return;
    setLogging(birdCode);
    try {
      const res = await fetch('/api/birds/lifelist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, birdCode, note }),
      });
      const d = await res.json();
      if (d.lifelist) setLifelist(d.lifelist);
      // The moment worth making a fuss of: she saw a real bird.
      if (d.entry) {
        setCelebration({ code: birdCode, gem: !!d.gemGranted, entry: d.entry });
        playArrival();
        window.setTimeout(() => playSparkle(), 420);
      }
    } catch {
      // Silent: the list is a record, not a transaction. She can tap
      // again, and a lost tap must never become an error modal
      // between a child and a bird she just saw.
    } finally {
      setLogging(null);
    }
  };

  if (!loaded) {
    return <Shell learnerId={learnerId}><p className="p-6 text-sm">Opening the hide…</p></Shell>;
  }

  // Listen/match units only appear once their crew has confirmed
  // clips, and the unlock chain runs over what is actually shown.
  const units = visibleUnits(birdsWithAudio(audio), tier);

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

        {crewCodes().map(crew => {
          const crewUnits = units.filter(u => u.crew === crew);
          // A crew with nothing in it must not leave a heading behind.
          // The simple tier only meets crew 1, and an empty "The Little
          // Gang" below her two units reads as something broken.
          if (crewUnits.length === 0) return null;
          return (
          <div key={crew} className="mb-5">
            <h2 className="text-sm font-bold mb-2" style={{ color: '#3f2614' }}>
              {CREW_TITLE[crew] ?? crew}
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {crewUnits.map(u => {
                const unlocked = isUnitUnlocked(u.code, completed, units);
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
          );
        })}

        <button
          onClick={() => setPhase('lifelist')}
          className="w-full text-left rounded-xl p-3 mt-1"
          style={{
            background: 'rgba(214,158,74,0.16)', border: '1px solid #d69e4a',
            minHeight: 60,
          }}
        >
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-lg">📓</span>
            <span className="font-bold text-sm" style={{ color: '#3f2614' }}>
              My Life List
            </span>
            <span className="ml-auto text-xs font-bold" style={{ color: '#6b6255' }}>
              {lifeListCount(lifelist)} / {lifeListRows({}).length} seen
            </span>
          </div>
          <div className="text-xs mt-1" style={{ color: '#6b6255' }}>
            Birds you have really seen, with your own eyes.
          </div>
        </button>

        <p className="text-center mt-6">
          <Link href={`/birds/credits?learner=${learnerId}`}
            className="text-xs underline" style={{ color: '#6b6255' }}>
            the people who recorded these sounds and photos
          </Link>
        </p>
      </Shell>
    );
  }

  // ── THE SIGHTING CELEBRATION ────────────────────────────────────
  //
  // She saw a real bird, outside, with her own eyes. That is the thing
  // the whole module exists to cause, and it was being marked with a
  // four-word line that faded after three seconds.
  //
  // So: her photograph of it back, full width; the bird's actual voice,
  // played automatically — the sound she may have just heard through a
  // window; a fact she has NOT been told before (the teach pages lead
  // with facts[0], so a sighting hands back the next one); and the
  // arrival chime the garden already uses when a creature moves in.
  const CelebrationCard = () => {
    if (!celebration) return null;
    const bird = getBird(celebration.code);
    if (!bird) return null;
    const pic = resolvePhoto(photos, bird.code, 'perched');
    const clip = resolveClip(audio, bird.code, 'call')
      ?? resolveClip(audio, bird.code, 'song')
      ?? resolveClip(audio, bird.code, 'flight_call');
    const n = celebration.entry.count;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(63,38,20,0.55)' }}
        onClick={() => setCelebration(null)}
        role="dialog"
        aria-label={`You saw a ${bird.commonName}`}
      >
        <motion.div
          onClick={e => e.stopPropagation()}
          initial={reduced ? undefined : { scale: 0.9, opacity: 0, y: 12 }}
          animate={reduced ? undefined : { scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          className="rounded-2xl overflow-hidden w-full"
          style={{ background: '#fffaf2', border: '2px solid #6b8e5a', maxWidth: 420 }}
        >
          <div className="px-4 pt-4 pb-2 text-center">
            <div className="text-3xl" aria-hidden>🎉</div>
            <h2 className="font-bold text-lg mt-1" style={{ color: '#3f2614' }}>
              {n === 1 ? `You found a ${bird.commonName}!` : `The ${bird.commonName} again!`}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#6b6255' }}>
              {n === 1
                ? `Number ${lifeListCount(lifelist)} on your life list`
                : `You have seen this one ${n} times now`}
            </p>
          </div>

          {pic && (
            <img
              src={pic.url} alt={pic.alt}
              className="w-full object-contain"
              style={{ height: 190, background: '#efe9dc' }}
            />
          )}

          <div className="px-4 py-3">
            {clip && (
              <div className="mb-3">
                <ClipPlayer clip={clip} label={`hear it again`} autoPlay />
              </div>
            )}
            <div className="rounded-xl p-3"
                 style={{ background: 'rgba(214,158,74,0.16)', border: '1px solid #d69e4a' }}>
              <div className="text-xs font-bold mb-0.5" style={{ color: '#6b6255' }}>
                did you know?
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#3f2614' }}>
                {sightingFact(bird, n)}
              </p>
            </div>
            {celebration.gem && (
              <p className="text-sm font-bold text-center mt-3" style={{ color: '#6b8e5a' }}>
                💎 a noticing gem — for spotting it yourself
              </p>
            )}
            <button
              onClick={() => setCelebration(null)}
              className="w-full mt-3 rounded-xl px-4 font-bold text-sm"
              style={{ background: '#6b8e5a', color: '#fffaf2', minHeight: 48 }}
            >
              back to my list
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // ── LIFE LIST ───────────────────────────────────────────────────
  //
  // The point of the whole module: a record of birds she has really
  // seen. Sorted rarest-first from the Louisville feeder guide's own
  // frequency scores, so a genuinely uncommon bird sits at the top and
  // FEELS like the event it was.
  if (phase === 'lifelist') {
    const rows = lifeListRows(lifelist);
    const seen = rows.filter(r => r.entry);
    return (
      <Shell learnerId={learnerId}>
        <p className="text-sm mb-3" style={{ color: '#6b6255' }}>
          Look out of a window. When you really see one of these — not a
          picture, the actual bird — tap “I saw one!”. This is your list,
          and it is the part that counts.
        </p>

        {seen.length === 0 && (
          <p className="text-sm italic mb-3" style={{ color: '#6b6255' }}>
            Nothing on your list yet. The cardinal is out there right now.
          </p>
        )}

        <div className="grid grid-cols-1 gap-2">
          {rows.map(({ bird, entry }) => {
            const pic = resolvePhoto(photos, bird.code, 'perched');
            const isLogging = logging === bird.code;
            return (
              <div
                key={bird.code}
                className="rounded-xl p-2.5 flex items-center gap-3"
                style={{
                  background: entry ? 'rgba(107,142,90,0.14)' : 'rgba(255,250,242,0.9)',
                  border: `1px solid ${entry ? '#6b8e5a' : '#e3dccf'}`,
                }}
              >
                {pic ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={pic.url} alt={pic.alt}
                    className="rounded-lg object-contain"
                    style={{ width: 62, height: 52, background: '#efe9dc', flexShrink: 0 }}
                    loading="lazy"
                  />
                ) : (
                  <span aria-hidden className="text-3xl" style={{ width: 62, textAlign: 'center' }}>
                    {bird.emoji}
                  </span>
                )}

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate" style={{ color: '#3f2614' }}>
                    {bird.commonName}
                  </div>
                  <div className="text-xs" style={{ color: '#6b6255' }}>
                    {entry
                      ? `first seen ${friendlyDate(entry.firstSeen)}${entry.count > 1 ? ` · ${entry.count} times` : ''}`
                      : rarityLabel(bird)}
                  </div>
                  {entry?.note && (
                    <div className="text-xs italic mt-0.5" style={{ color: '#4a4034' }}>
                      “{entry.note}”
                    </div>
                  )}
                </div>

                <button
                  onClick={() => logSighting(bird.code)}
                  disabled={isLogging}
                  className="rounded-xl px-3 text-xs font-bold"
                  style={{
                    background: entry ? '#fffaf2' : '#6b8e5a',
                    color: entry ? '#3f2614' : '#fffaf2',
                    border: entry ? '1px solid #6b8e5a' : 'none',
                    minHeight: 48, minWidth: 84, flexShrink: 0,
                    touchAction: 'manipulation',
                  }}
                >
                  {isLogging ? '…' : entry ? 'saw it again' : 'I saw one!'}
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setPhase('menu')}
          className="w-full mt-4 rounded-xl px-4 font-bold text-sm"
          style={{ background: '#6b8e5a', color: '#fffaf2', minHeight: 48 }}
        >
          back to the list
        </button>

        <CelebrationCard />
      </Shell>
    );
  }

  if (!unit) return <Shell learnerId={learnerId}><p className="p-6">Lost the thread.</p></Shell>;

  // ── TEACH ───────────────────────────────────────────────────────
  if (phase === 'teach') {
    const pages = teachSequence(unit, tier);
    const p = pages[page];
    const last = page + 1 >= pages.length;
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
          <Figure page={p} photos={photos} audio={audio} />
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
            The pictures and sounds for this one are not ready yet. Try another unit.
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

        <ExerciseView ex={ex} photos={photos} audio={audio} seed={seed + exIdx} onAnswer={answer} />

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

function Figure({ page, photos, audio }: {
  page: TeachPage; photos: PhotoIndex; audio: AudioIndex;
}) {
  const f = page.figure;
  if (!f) return null;
  if (f.kind === 'four_keys') return <FourKeys />;
  if (f.kind === 'size_ladder') return <SizeLadder highlight={f.highlight} />;
  if (f.kind === 'bills') return <BillChart highlight={f.highlight} />;
  if (f.kind === 'clip') {
    const clip = resolveClip(audio, f.ref.birdCode, f.ref.kind);
    if (!clip) return null;
    return <div className="mt-2"><ClipPlayer clip={clip} /></div>;
  }
  if (f.kind === 'gallery') {
    const shots = galleryPhotos(photos, f.birdCode);
    if (shots.length === 0) return null;
    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {shots.map(({ photo, role }, i) => (
          <figure key={i} className={shots.length === 1 ? 'col-span-2' : undefined}>
            <PhotoCard photo={photo} />
            {GALLERY_CAPTION[role] && (
              <figcaption className="text-xs font-bold mt-0.5 text-center"
                          style={{ color: '#6b6255' }}>
                {GALLERY_CAPTION[role]}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    );
  }

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

/**
 * Every bird photo renders with object-fit CONTAIN, never cover.
 *
 * Cover looked tidier, and it decapitated the robin: a 3:2 landscape
 * photo in a wide fixed-height box loses its top and bottom, and the
 * head — where nearly every field mark lives — is what goes. A photo
 * where the diagnostic mark is cropped out is the same failure as a
 * photo where it is hidden behind a branch, which the curation rules
 * already forbid. Letterbox bars in cream are the cheap price.
 */
function PhotoCard({ photo, tall = false }: { photo: ResolvedPhoto; tall?: boolean }) {
  return (
    <div className="relative rounded-xl overflow-hidden"
         style={{ border: '1px solid #e3dccf', background: '#efe9dc' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={photo.alt}
        className="w-full object-contain"
        style={{ height: tall ? 220 : 160 }}
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
 * A playable clip: one big replayable button, the clip's spectrogram
 * underneath, and the recordist's name in the corner.
 *
 * The spectrogram is always shown, not tucked behind a toggle. It is
 * the visual fallback when sound is off (a sibling asleep, a muted
 * tablet), and it is also the Bird Song Hero teaching move — a whistle
 * draws one clean line, a buzz draws fuzzy stacks, so timbre becomes
 * something she can SEE. It never gives an answer away: no choice
 * anywhere is written on a spectrogram.
 *
 * iOS autoplay is already handled by AudioUnlocker in the root layout;
 * do not add a second unlock mechanism here.
 */
/** Exported for tests/components/BirdClipPlayer.test.tsx — the
 *  wrong-bird bug lives entirely in this component's DOM behaviour and
 *  cannot be reached through the scene. */
export function ClipPlayer({ clip, label = 'play the sound', autoPlay = false }: {
  clip: ResolvedClip; label?: string;
  /** Play as soon as it is ready — used by the sighting celebration,
   *  where hearing the bird you just saw IS the reward. Safe under
   *  iOS autoplay policy: it only ever mounts from a tap. */
  autoPlay?: boolean;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  /**
   * Re-run resource selection when the clip changes. This is not
   * optional bookkeeping — without it the wrong bird plays.
   *
   * A <source> child is only consulted during the media element's
   * resource selection algorithm, which runs ONCE. React reuses this
   * same <audio> DOM node from one question to the next (same
   * component, same position) and merely swaps the src attribute on
   * the <source> children, which the already-loaded element ignores
   * completely. So the first clip a unit loaded kept playing for
   * every question after it: reported from the device as the mourning
   * dove cooing again when the question asked about the robin.
   *
   * Setting src directly on <audio> would avoid this, but the m4a
   * fallback needs the <source> list — older Safari cannot play the
   * opus. So: load() explicitly, here, where every call site inherits
   * it rather than having to remember a key prop.
   */
  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    a.pause();
    setPlaying(false);
    a.load();
    if (autoPlay) {
      // Let the arrival chime land first, then the bird.
      const t = window.setTimeout(() => { a.play().catch(() => {}); }, 900);
      return () => window.clearTimeout(t);
    }
  }, [clip.url, clip.fallbackUrl, autoPlay]);

  const play = () => {
    const a = ref.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e3dccf', background: '#fffaf2' }}>
      <button
        onClick={play}
        className="w-full font-bold text-sm flex items-center justify-center gap-2"
        style={{ background: playing ? '#557a46' : '#6b8e5a', color: '#fffaf2',
                 minHeight: 56, touchAction: 'manipulation' }}
      >
        <span aria-hidden className="text-lg">{playing ? '🔊' : '▶'}</span>
        {playing ? 'listening…' : label}
      </button>
      <audio
        ref={ref}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
      >
        <source src={clip.url} type="audio/ogg; codecs=opus" />
        {clip.fallbackUrl && <source src={clip.fallbackUrl} type="audio/mp4" />}
      </audio>
      {clip.spectrogramUrl && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* NEVER crop a spectrogram.
              Its vertical axis is FREQUENCY, so a crop does not trim
              scenery the way it would on a photo — it deletes notes.
              This was pinned to 84px with object-fit: cover, which threw
              away nearly half the picture and left mostly the empty band
              above the bird, making the one visual the sound has useless.
              aspect-ratio reserves the space so the layout doesn't jump
              while it loads; contain guarantees the whole thing shows
              even if a future spectrogram is a different size. */}
          <img
            src={clip.spectrogramUrl}
            alt="a picture of the sound — height is how high the note is, brighter is louder"
            className="w-full block"
            style={{ aspectRatio: '640 / 256', objectFit: 'contain' }}
            loading="lazy"
          />
          <span
            className="absolute bottom-1 right-1 rounded px-1 text-[9px]"
            style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
            title={`${clip.attribution.recordist} · ${clip.attribution.sourceId} · xeno-canto.org`}
          >
            ⓘ {clip.attribution.recordist}
          </span>
        </div>
      )}
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
  ex, photos, audio, seed, onAnswer,
}: {
  ex: BirdExercise;
  photos: PhotoIndex;
  audio: AudioIndex;
  seed: number;
  onAnswer: (correct: boolean) => void;
}) {
  const prompt = (
    <h2 className="font-bold text-base mb-1" style={{ color: '#3f2614' }}>{ex.prompt}</h2>
  );

  // ── LISTEN: a clip, then word choices ─────────────────────────
  if (ex.kind === 'mnemonic' || ex.kind === 'song_or_call'
      || ex.kind === 'pitch_shape' || ex.kind === 'tone') {
    const clip = resolveClip(audio, ex.clip.birdCode, ex.clip.kind, seed);
    if (!clip) return null;   // filtered upstream; belt and braces
    return (
      <div>
        {prompt}
        <div className="mt-2"><ClipPlayer clip={clip} /></div>
        <Choices
          options={ex.choices.map(c => <span key={c}>{c}</span>)}
          onPick={i => onAnswer(i === ex.correctIndex)}
        />
      </div>
    );
  }

  // ── MATCH: hear a sound, find the face ────────────────────────
  if (ex.kind === 'song_to_photo') {
    const clip = resolveClip(audio, ex.clip.birdCode, ex.clip.kind, seed);
    if (!clip) return null;
    return (
      <div>
        {prompt}
        <div className="mt-2"><ClipPlayer clip={clip} /></div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {ex.photos.map((ref, i) => {
            const pic = resolvePhoto(photos, ref.birdCode, ref.role, seed);
            if (!pic) return null;
            return (
              <button key={i} onClick={() => onAnswer(i === ex.correctIndex)}
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid #e3dccf', touchAction: 'manipulation' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pic.url} alt={pic.alt} className="w-full object-contain"
                     style={{ height: 140, background: '#efe9dc' }} loading="lazy" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── MATCH: two sounds, which was the named bird? ──────────────
  if (ex.kind === 'which_did_you_hear') {
    return (
      <div>
        {prompt}
        <div className="grid grid-cols-1 gap-3 mt-2">
          {ex.clips.map((ref, i) => {
            const clip = resolveClip(audio, ref.birdCode, ref.kind, seed + i);
            if (!clip) return null;
            return (
              <div key={i} className="flex flex-col gap-1.5">
                <ClipPlayer clip={clip} label={`play sound ${i + 1}`} />
                <button
                  onClick={() => onAnswer(i === ex.correctIndex)}
                  className="rounded-xl p-2 text-sm font-bold"
                  style={{
                    background: 'rgba(255,250,242,0.95)', border: '1px solid #e3dccf',
                    color: '#3f2614', minHeight: 48, touchAction: 'manipulation',
                  }}
                >
                  it was sound {i + 1}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

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
                <img src={pic.url} alt={pic.alt} className="w-full object-contain"
                     style={{ height: 140, background: '#efe9dc' }} loading="lazy" />
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
