// app/(child)/garden/night/NightGardenScene.tsx
//
// The Night Garden. Cecily's moonflower question, answered properly.
//
// She asked why moonflowers cannot go in her bouquet. They cannot,
// and the reason is worth more than the flower would have been: a
// moonflower opens at dusk and folds at sunrise, once, forever. Cut one
// and you own a damp white rag by breakfast.
//
// So she comes out to it instead, and the flower pays her in moths.
// White, deep-throated and drenched in scent is not decoration — it is
// an advertisement aimed at night-flying moths, and the pink-spotted
// hawkmoth's tongue is longer than its body because a moonflower's
// throat is that deep. The two are built for each other. That is the
// lesson standing in the dark.
//
// Above her, the sky. Five constellations she can genuinely find from a
// Louisville back garden, drawn in their real shapes — the Dipper's
// pointer stars actually line up on Polaris, which is the one trick
// worth owning because it unlocks every other constellation.
//
// ONE NEW MOTH A NIGHT, enforced by the API. The garden pays for
// coming back on another night, never for standing here longer.

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeciesIllustration } from '@/components/child/garden/speciesIllustrations';
import { getSpeciesByCode } from '@/lib/world/speciesCatalog';
import { getPlant } from '@/lib/world/plantCatalog';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { playSparkle } from '@/lib/audio/sfx';
import {
  CONSTELLATIONS, type Constellation, type NightGardenState,
} from '@/lib/world/nightGarden';

interface NightState extends NightGardenState { canVisitTonight: boolean }

/** Fixed scatter of background stars — seeded, so the sky is the same sky. */
const BG_STARS = Array.from({ length: 90 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  return {
    x: ((a - Math.floor(a)) * 100),
    y: ((b - Math.floor(b)) * 58),
    r: 0.5 + ((a - Math.floor(a)) * 1.1),
    o: 0.35 + ((b - Math.floor(b)) * 0.5),
  };
});

export default function NightGardenScene({
  learnerId, initial, blooming, open,
}: {
  learnerId: string;
  initial: NightState;
  blooming: string[];
  open: boolean;
}) {
  const router = useRouter();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [night, setNight] = useState<NightState>(initial);
  const [arriving, setArriving] = useState(false);
  const [newMoth, setNewMoth] = useState<string | null>(null);
  const [sky, setSky] = useState<Constellation | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Which constellation is "up" is stable per night rather than random,
  // so a child who comes back in ten minutes sees the same sky.
  const [tonightSky] = useState(() =>
    CONSTELLATIONS[new Date().getDate() % CONSTELLATIONS.length]);

  const waitForMoth = async () => {
    if (arriving || !night.canVisitTonight) return;
    setArriving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/night-garden', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, action: 'visit' }),
      });
      const j = await res.json();
      if (j.error) { setMessage(j.error); if (j.night) setNight(j.night); return; }
      setNight(j.night);
      if (j.mothCode) {
        setNewMoth(j.mothCode);
        playSparkle();
        router.refresh();
      } else {
        setMessage('Every moth in this garden has been out to meet you now.');
      }
    } finally {
      setArriving(false);
    }
  };

  const findStar = async (c: Constellation) => {
    setSky(c);
    if (night.starsFound.includes(c.code)) return;
    const res = await fetch('/api/night-garden', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ learnerId, action: 'star', constellationCode: c.code }),
    });
    const j = await res.json();
    if (j.night) setNight(j.night);
  };

  const bloomNames = blooming
    .map(c => getPlant(c)?.commonName).filter(Boolean) as string[];

  return (
    <div className="min-h-screen relative overflow-hidden"
         style={{ background: 'linear-gradient(#070B1A 0%, #0D1430 42%, #16203F 68%, #101A18 100%)' }}>

      {/* ── the sky ──────────────────────────────────────────────── */}
      <svg viewBox="0 0 100 58" className="absolute inset-x-0 top-0 w-full"
           style={{ height: '58vh' }} preserveAspectRatio="none">
        {BG_STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.12} fill="#EAF0FF" opacity={s.o} />
        ))}
      </svg>

      {/* Tonight's constellation, sitting in its own patch of sky. */}
      <button
        onClick={() => findStar(tonightSky)}
        className="absolute"
        style={{ left: '12%', top: '6%', width: '52%', height: '30%',
                 touchAction: 'manipulation' }}
        aria-label={`look at ${tonightSky.name}`}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          {tonightSky.lines.map(([a, b], i) => (
            <line key={i}
                  x1={tonightSky.stars[a].x} y1={tonightSky.stars[a].y}
                  x2={tonightSky.stars[b].x} y2={tonightSky.stars[b].y}
                  stroke="#7FA0D8" strokeWidth={0.5} opacity={0.5} />
          ))}
          {tonightSky.stars.map((st, i) => (
            <g key={i}>
              <circle cx={st.x} cy={st.y} r={st.mag === 1 ? 3.2 : 2.2}
                      fill="#DCE8FF" opacity={0.22} />
              <circle cx={st.x} cy={st.y} r={st.mag === 1 ? 1.5 : st.mag === 2 ? 1.1 : 0.8}
                      fill="#FFFFFF" />
            </g>
          ))}
        </svg>
      </button>

      <div className="absolute" style={{ left: '12%', top: '35%' }}>
        <span className="text-[11px] px-2 py-1 rounded-full"
              style={{ background: 'rgba(20,28,56,0.7)', color: '#AFC4EA',
                       border: '1px solid rgba(127,160,216,0.35)' }}>
          {night.starsFound.includes(tonightSky.code)
            ? tonightSky.name
            : 'tap the stars ✨'}
        </span>
      </div>

      {/* ── the moon ─────────────────────────────────────────────── */}
      <div className="absolute" style={{ right: '10%', top: '7%' }}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx={36} cy={36} r={30} fill="#F6F1DC" opacity={0.12} />
          <circle cx={36} cy={36} r={22} fill="#F8F3DE" />
          <circle cx={28} cy={30} r={4} fill="#E4DCC0" opacity={0.7} />
          <circle cx={42} cy={41} r={5.5} fill="#E4DCC0" opacity={0.55} />
          <circle cx={38} cy={25} r={2.6} fill="#E4DCC0" opacity={0.6} />
        </svg>
      </div>

      {/* ── the garden, open in the dark ─────────────────────────── */}
      <div className="absolute inset-x-0" style={{ bottom: '17%' }}>
        <div className="flex items-end justify-center gap-6 px-4">
          {blooming.slice(0, 5).map((code, i) => (
            <motion.div
              key={code + i}
              animate={reducedMotion ? undefined : { y: [0, -3, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
            >
              <MoonBloom code={code} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── the ground ───────────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: '20%',
           background: 'linear-gradient(#12241C, #0A1512)' }} />

      {/* ── the panel ────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="rounded-2xl p-3 max-w-xl mx-auto"
             style={{ background: 'rgba(10,14,30,0.92)', border: '1px solid #2E3C66' }}>

          {!open ? (
            <p className="text-xs" style={{ color: '#AFC4EA' }}>
              Nothing is open out here yet. Plant something in the moon
              garden and wait for it to bloom — the moths come for the
              flowers, not for the dark.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={waitForMoth}
                  disabled={arriving || !night.canVisitTonight}
                  className="rounded-xl px-4 font-bold text-sm disabled:opacity-45"
                  style={{ background: '#C8B4F0', color: '#171B33', minHeight: 48,
                           touchAction: 'manipulation' }}
                >
                  {arriving ? 'keeping still…'
                    : night.canVisitTonight ? '🌙 wait and watch' : 'watched tonight'}
                </button>
                <div className="flex-1 text-xs" style={{ color: '#AFC4EA' }}>
                  <div>
                    <strong style={{ color: '#E6DCFF' }}>{night.mothsSeen.length}</strong> moth
                    {night.mothsSeen.length === 1 ? '' : 's'} met
                    {' · '}
                    <strong style={{ color: '#E6DCFF' }}>{night.starsFound.length}</strong> of{' '}
                    {CONSTELLATIONS.length} constellations
                  </div>
                  {bloomNames.length > 0 && (
                    <div style={{ color: '#7E90BE' }}>
                      open tonight: {bloomNames.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {!night.canVisitTonight && (
                <p className="text-[11px] mt-2 italic" style={{ color: '#7E90BE' }}>
                  One a night. They are wild things — they come when they come.
                </p>
              )}
              {message && (
                <p className="text-xs mt-2" style={{ color: '#E6DCFF' }}>{message}</p>
              )}
            </>
          )}

          {/* the moths already met */}
          {night.mothsSeen.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {night.mothsSeen.map(code => {
                const sp = getSpeciesByCode(code);
                return (
                  <div key={code} className="rounded-lg px-1.5 py-1 flex items-center gap-1"
                       style={{ background: 'rgba(40,52,92,0.6)' }}>
                    <SpeciesIllustration code={sp?.illustrationKey ?? code} size={26} />
                    <span className="text-[10px]" style={{ color: '#C6D4F2' }}>
                      {sp?.commonName ?? code}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── a moth arrives ───────────────────────────────────────── */}
      <AnimatePresence>
        {newMoth && <MothArrival code={newMoth} onClose={() => setNewMoth(null)} />}
      </AnimatePresence>

      {/* ── a constellation, named ───────────────────────────────── */}
      <AnimatePresence>
        {sky && <SkyCard c={sky} onClose={() => setSky(null)} />}
      </AnimatePresence>
    </div>
  );
}

/** A moon flower, open. White and wide, because that is the advert. */
function MoonBloom({ code }: { code: string }) {
  const petals = code === 'moonflower' ? 5 : 4;
  const glow = code === 'eveningprimrose' ? '#F6E9A8' : '#F4F0FF';
  return (
    <svg width="76" height="96" viewBox="-38 -60 76 96" style={{ overflow: 'visible' }}>
      <circle cx={0} cy={-26} r={26} fill={glow} opacity={0.13} />
      <path d="M 0 36 Q -3 6 -1 -20" fill="none" stroke="#3D5A44" strokeWidth={2.4} />
      <path d="M -1 8 Q -12 2 -16 -8" fill="none" stroke="#3D5A44" strokeWidth={1.8} />
      {Array.from({ length: petals }, (_, i) => (
        <ellipse key={i} cx={0} cy={-34} rx={9} ry={17} fill={glow} opacity={0.93}
                 stroke="#D8D2EE" strokeWidth={0.8}
                 transform={`rotate(${(360 / petals) * i} 0 -22)`} />
      ))}
      <circle cx={0} cy={-22} r={5} fill="#F9F6C8" />
      <circle cx={0} cy={-22} r={2} fill="#E4D882" />
    </svg>
  );
}

function MothArrival({ code, onClose }: { code: string; onClose: () => void }) {
  const sp = getSpeciesByCode(code);
  if (!sp) return null;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,9,20,0.85)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="rounded-2xl w-full max-w-sm p-4 text-center"
        style={{ background: '#131A33', border: '1px solid #3B4A7A' }}
        initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <p className="text-[11px] uppercase tracking-widest" style={{ color: '#8FA6D8' }}>
          something came to the flowers
        </p>
        <div className="my-3 flex justify-center">
          <SpeciesIllustration code={sp.illustrationKey} size={128} />
        </div>
        <h3 className="text-lg font-bold" style={{ color: '#EFE8FF' }}>{sp.commonName}</h3>
        <p className="text-[11px] italic" style={{ color: '#8FA6D8' }}>{sp.scientificName}</p>
        <p className="text-xs mt-2 leading-relaxed" style={{ color: '#C6D4F2' }}>
          {sp.description}
        </p>
        <p className="text-xs mt-2 leading-relaxed" style={{ color: '#AFC4EA' }}>
          {sp.funFact}
        </p>
        <button
          onClick={onClose}
          className="w-full rounded-xl mt-4 font-bold text-sm"
          style={{ background: '#C8B4F0', color: '#171B33', minHeight: 48,
                   touchAction: 'manipulation' }}
        >
          into the journal
        </button>
      </motion.div>
    </motion.div>
  );
}

function SkyCard({ c, onClose }: { c: Constellation; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,9,20,0.85)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="rounded-2xl w-full max-w-sm p-4"
        style={{ background: '#0F1630', border: '1px solid #3B4A7A' }}
        initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <svg viewBox="0 0 100 100" className="w-full" style={{ height: 150 }}>
          {c.lines.map(([a, b], i) => (
            <line key={i} x1={c.stars[a].x} y1={c.stars[a].y}
                  x2={c.stars[b].x} y2={c.stars[b].y}
                  stroke="#7FA0D8" strokeWidth={0.6} opacity={0.65} />
          ))}
          {c.stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y}
                    r={s.mag === 1 ? 2.2 : s.mag === 2 ? 1.6 : 1.1} fill="#FFFFFF" />
          ))}
        </svg>
        <h3 className="text-lg font-bold mt-2" style={{ color: '#EFE8FF' }}>{c.name}</h3>
        <p className="text-xs mt-1" style={{ color: '#C6D4F2' }}>{c.lookFor}</p>
        <p className="text-[11px] mt-2 italic" style={{ color: '#8FA6D8' }}>{c.season}</p>
        <p className="text-xs mt-2 leading-relaxed" style={{ color: '#AFC4EA' }}>{c.fact}</p>
        <button
          onClick={onClose}
          className="w-full rounded-xl mt-4 font-bold text-sm"
          style={{ background: '#3B4A7A', color: '#EFE8FF', minHeight: 48,
                   touchAction: 'manipulation' }}
        >
          keep looking
        </button>
      </motion.div>
    </motion.div>
  );
}
