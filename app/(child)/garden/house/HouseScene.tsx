'use client';

// The house: the entry hall and the reading room. Phase 1 of the
// house spec.
//
// Drawn from photos of the real house: the quartersawn-oak staircase
// with its landing and carved newel, the double front doors, the
// cushioned bench in front of the stairs (the real detail — the
// listing photos staged a table there), and in the next room the
// full-height oak mantel with columns, mirror and display shelf over
// a brick firebox.
//
// One hero per room: the staircase in the hall, the mantel in the
// reading room. Everything else supports.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import HabitatInteriorLayout from '@/components/child/garden/HabitatInteriorLayout';
import LunaVisitModal from '@/components/child/garden/LunaVisitModal';
import KitchenModal from '@/components/child/garden/KitchenModal';
import GemSpecimen from '@/components/child/garden/GemSpecimen';
import { SpeciesIllustration } from '@/components/child/garden/speciesIllustrations';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { playPageTurn, playSparkle } from '@/lib/audio/sfx';
import { getGem } from '@/lib/world/gemCatalog';
import { getBird } from '@/lib/world/birdCatalog';
import { getEpisode } from '@/lib/world/lunaAdventure';
import {
  storybookPages, coatColorsFor, type HouseState, type BookPage,
} from '@/lib/world/house';

const WALL = '#F4F0E7';
const TRIM = '#6B4226';
const OAK = '#955F2E';
const OAK_LIGHT = '#B07A42';
const OAK_DARK = '#6E4520';
const FLOOR = '#B0713C';
const FLOOR_LINE = '#8F5A2E';
const BRICK = '#A5553F';
const MORTAR = '#D8C7B4';

type Room = 'entry' | 'reading' | 'kitchen';

export default function HouseScene({
  learnerId, learnerName, coatNames, house: initialHouse, kept,
  lifeListCodes, completedEpisodes, choices, lunaCanFeedToday,
}: {
  learnerId: string;
  learnerName: string;
  coatNames: string[];
  house: HouseState;
  kept: Record<string, number>;
  lifeListCodes: string[];
  completedEpisodes: number[];
  choices: Record<string, string>;
  lunaCanFeedToday: boolean;
}) {
  const router = useRouter();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;

  const [room, setRoom] = useState<Room>('entry');
  const [house, setHouse] = useState<HouseState>(initialHouse);
  const [picker, setPicker] = useState<'stone' | 'bird' | null>(null);
  const [openBook, setOpenBook] = useState<number | null>(null);
  const [lunaOpen, setLunaOpen] = useState(false);
  const [cooking, setCooking] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const setMantel = async (slot: 'stone' | 'bird', code: string | null) => {
    try {
      const res = await fetch('/api/house', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, slot, code }),
      });
      const d = await res.json();
      if (d.house) setHouse(d.house);
      if (d.error) { setNote(d.error); window.setTimeout(() => setNote(null), 5000); return; }
      if (code) playSparkle();
      setPicker(null);
    } catch {
      setNote('That did not go through. Nothing was moved.');
      window.setTimeout(() => setNote(null), 5000);
    }
  };

  return (
    <HabitatInteriorLayout learnerId={learnerId} title="Home" iconEmoji="🏠">
      <div className="absolute inset-0" style={{ background: '#2A2018' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={room}
            className="absolute inset-0"
            initial={reducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {room === 'entry' ? (
              <EntryHall
                coatNames={coatNames}
                learnerName={learnerName}
                reducedMotion={reducedMotion}
                onReadingRoom={() => setRoom('reading')}
                onKitchen={() => setRoom('kitchen')}
              />
            ) : room === 'kitchen' ? (
              <KitchenRoom
                reducedMotion={reducedMotion}
                onBack={() => setRoom('entry')}
                onCook={() => setCooking(true)}
              />
            ) : (
              <ReadingRoom
                house={house}
                completedEpisodes={completedEpisodes}
                reducedMotion={reducedMotion}
                onBack={() => setRoom('entry')}
                onLuna={() => setLunaOpen(true)}
                onBook={(ep) => { setOpenBook(ep); playPageTurn(); }}
                onSlot={(slot) => setPicker(slot)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {note && (
          <p className="absolute left-3 right-3 bottom-4 text-xs rounded-lg p-2 z-50"
             style={{ background: '#3A2A20', color: '#F0DFAE' }}>{note}</p>
        )}
      </div>

      {picker && (
        <MantelPicker
          slot={picker}
          kept={kept}
          lifeListCodes={lifeListCodes}
          current={picker === 'stone' ? house.mantelStone : house.mantelBird}
          onPick={(code) => setMantel(picker, code)}
          onClose={() => setPicker(null)}
        />
      )}

      {openBook !== null && (
        <BookOverlay
          episode={openBook}
          choices={choices}
          onClose={() => setOpenBook(null)}
        />
      )}

      {/* the family recipe book — the same kitchen as Bachan's
          table, reached through her own back hallway */}
      <KitchenModal
        open={cooking}
        learnerId={learnerId}
        onClose={() => setCooking(false)}
        onCooked={() => router.refresh()}
      />

      {lunaOpen && (
        <LunaVisitModal
          learnerId={learnerId}
          canFeedToday={lunaCanFeedToday}
          onClose={() => setLunaOpen(false)}
          onStory={() => router.push(`/adventure/luna?learner=${learnerId}`)}
        />
      )}
    </HabitatInteriorLayout>
  );
}

/* ── the entry hall ─────────────────────────────────────────────── */

// Composed the way you actually walk in: the staircase climbs away to
// the LEFT and out of frame, the hallway ahead runs back to the
// kitchen, the reading room is behind your left shoulder — only its
// firelight reaches into the frame — and the front doors you came
// through are on the right. The bench sits left, in front of the
// stairs, where it really is.

function EntryHall({
  coatNames, learnerName, reducedMotion, onReadingRoom, onKitchen,
}: {
  coatNames: string[];
  learnerName: string;
  reducedMotion: boolean;
  onReadingRoom: () => void;
  onKitchen: () => void;
}) {
  const colors = coatColorsFor(coatNames);
  return (
    <svg viewBox="0 0 700 1100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="hall-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F1E2C8" />
          <stop offset="45%" stopColor="#EAD7B6" />
          <stop offset="100%" stopColor="#D9BE97" />
        </linearGradient>
        <linearGradient id="hall-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BC7C42" />
          <stop offset="100%" stopColor="#93582A" />
        </linearGradient>
        <radialGradient id="lamp-glow" cx="0.5" cy="0.32" r="0.75">
          <stop offset="0%" stopColor="#FFF3CF" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#FFE9B8" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FFE9B8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="corner-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5A3B1F" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#5A3B1F" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="corner-right" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#5A3B1F" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#5A3B1F" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="garden-through-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CFE4EE" />
          <stop offset="55%" stopColor="#A9C6A0" />
          <stop offset="100%" stopColor="#7FA86B" />
        </linearGradient>
        <linearGradient id="hallway-depth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A3826" />
          <stop offset="100%" stopColor="#6E5236" />
        </linearGradient>
        <linearGradient id="firelight-vert" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E2216" />
          <stop offset="55%" stopColor="#5A3418" />
          <stop offset="82%" stopColor="#9A5A24" />
          <stop offset="100%" stopColor="#D97E30" />
        </linearGradient>
        <linearGradient id="oak-round" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={OAK_DARK} />
          <stop offset="45%" stopColor={OAK_LIGHT} />
          <stop offset="100%" stopColor={OAK_DARK} />
        </linearGradient>
      </defs>

      {/* ceiling, wall, floor — warm, lit from the lamp */}
      <rect x={0} y={0} width={700} height={56} fill="#F7EEDC" />
      <rect x={0} y={52} width={700} height={10} fill={TRIM} opacity={0.5} />
      <rect x={0} y={60} width={700} height={764} fill="url(#hall-wall)" />
      <rect x={0} y={820} width={700} height={280} fill="url(#hall-floor)" />
      {[884, 948, 1012, 1076].map(y => (
        <line key={y} x1={0} y1={y} x2={700} y2={y} stroke={FLOOR_LINE} strokeWidth={2} opacity={0.4} />
      ))}
      {[150, 340, 530].map((x, i) => (
        <line key={x} x1={x} y1={820} x2={x + 26 - i * 26} y2={1100} stroke={FLOOR_LINE} strokeWidth={1.5} opacity={0.3} />
      ))}
      {/* picture rail and baseboard */}
      <rect x={0} y={238} width={700} height={7} fill={TRIM} opacity={0.55} />
      <rect x={0} y={800} width={700} height={22} fill={TRIM} />
      <rect x={0} y={822} width={700} height={8} fill="#3F2A16" opacity={0.25} />
      {/* lamplight on the wall */}
      <rect x={0} y={0} width={700} height={840} fill="url(#lamp-glow)" pointerEvents="none" />

      {/* pendant lamp — the scalloped shade from the photos */}
      <line x1={350} y1={0} x2={350} y2={84} stroke="#4A3A28" strokeWidth={3} />
      <path d="M 303 84 Q 315 71 327 84 Q 338 71 350 84 Q 362 71 373 84 Q 385 71 397 84 L 389 124 Q 350 139 311 124 Z"
            fill="#F9F1DC" stroke="#C9B88E" strokeWidth={2} />
      <ellipse cx={350} cy={128} rx={42} ry={11} fill="#FFEDB8" opacity={0.65} />
      {!reducedMotion && [0, 1, 2].map(i => (
        <motion.circle key={i} cx={318 + i * 34} cy={190 + i * 26} r={2.2} fill="#F7E6B8"
                       animate={{ opacity: [0, 0.8, 0], y: [0, -14, -26] }}
                       transition={{ duration: 5 + i * 1.3, repeat: Infinity, delay: i * 1.1 }} />
      ))}

      {/* THE STAIRCASE — the hero of the hall, climbing left and out of
          frame the way it really does when you walk in */}
      <Staircase reducedMotion={reducedMotion} />

      {/* the hallway back to the kitchen — built now. The string and
          the "not built yet" sign came down; warm light and a smell
          of something cooking come up the hall instead. */}
      <g onClick={onKitchen} style={{ cursor: 'pointer' }} role="button"
         aria-label="Go to the kitchen">
        <rect x={318} y={344} width={150} height={470} fill={TRIM} rx={3} />
        <polygon points="330,356 352,432 352,782 330,810" fill="#5A4630" />
        <polygon points="456,356 434,432 434,782 456,810" fill="#5A4630" />
        <rect x={352} y={432} width={82} height={350} fill="url(#hallway-depth)" />
        <polygon points="330,810 352,782 434,782 456,810" fill="#8A5A30" />
        {/* the lamp at the end of the hall, and the red bench under it */}
        <line x1={393} y1={432} x2={393} y2={466} stroke="#2E2216" strokeWidth={2} />
        <circle cx={393} cy={474} r={9} fill="#FFE9A8" opacity={0.95} />
        <ellipse cx={393} cy={500} rx={30} ry={40} fill="#FFE9A8" opacity={0.22} />
        {!reducedMotion && (
          <motion.ellipse cx={393} cy={620} rx={40} ry={160} fill="#FFE9A8"
                          animate={{ opacity: [0.06, 0.13, 0.06] }}
                          transition={{ duration: 3, repeat: Infinity }} />
        )}
        <rect x={362} y={716} width={62} height={26} rx={4} fill="#8F3A32" />
        {[368, 412].map(x => <rect key={x} x={x} y={742} width={7} height={22} fill="#6E2A24" />)}
        <rect x={334} y={744} width={118} height={30} rx={15} fill="#FFF8E8" opacity={0.94}
              stroke="#C9B88E" strokeWidth={1.5} />
        <text x={393} y={764} textAnchor="middle" fontSize={13} fontWeight={700} fill="#3f2614">
          the kitchen
        </text>
      </g>

      {/* framed flower art — the paper-flower pictures from the real
          entry, hung on the pier between hallway and doors */}
      <g>
        <rect x={526} y={296} width={64} height={84} fill={OAK} stroke={OAK_DARK} strokeWidth={2} rx={2} />
        <rect x={533} y={303} width={50} height={70} fill="#F9F1E4" />
        {[[548, 326, 9], [568, 344, 7], [552, 354, 6]].map(([cx, cy, r], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill="#E8B4C0" />
            <circle cx={cx} cy={cy} r={(r as number) * 0.55} fill="#F4D6DC" />
          </g>
        ))}
      </g>

      {/* coat hooks — one per child, on the pier by the door */}
      <rect x={492} y={418} width={132} height={11} fill={OAK} rx={3} />
      {coatNames.map((name, i) => {
        const x = 510 + i * (96 / Math.max(coatNames.length - 1, 1));
        const mine = name === learnerName;
        return (
          <g key={name}>
            <circle cx={x} cy={434} r={3.5} fill={OAK_DARK} />
            <motion.g
              style={{ originX: `${x}px`, originY: '434px' }}
              animate={mine && !reducedMotion ? { rotate: [1.6, -1.6, 1.6] } : undefined}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d={`M ${x - 3.5} 438 Q ${x} 431 ${x + 3.5} 438 L ${x + 5} 445 L ${x - 5} 445 Z`}
                    fill={colors[name]} opacity={0.9} />
              <path d={`M ${x - 13} 445 Q ${x} 438 ${x + 13} 445 L ${x + 11} 498 Q ${x} 503 ${x - 11} 498 Z`}
                    fill={colors[name]} stroke="#00000022" strokeWidth={1} />
              <line x1={x} y1={449} x2={x} y2={496} stroke="#00000033" strokeWidth={1.4} />
            </motion.g>
            {/* four coats fit where three did only if the name
                pills take turns standing on two rows */}
            <rect x={x - 23} y={508 + (i % 2) * 20} width={46} height={16} rx={8}
                  fill="#FFFFFF" opacity={0.85} />
            <text x={x} y={520 + (i % 2) * 20} textAnchor="middle" fontSize={10}
                  fontWeight={700} fill="#3f2614">
              {name}
            </text>
          </g>
        );
      })}

      {/* the reading room, through the doorway off the right edge */}
      <g onClick={onReadingRoom} style={{ cursor: 'pointer' }} role="button"
         aria-label="Go to the reading room">
        <rect x={596} y={300} width={104} height={800} fill="transparent" />
        <rect x={630} y={326} width={70} height={490} fill={TRIM} rx={3} />
        <rect x={646} y={340} width={54} height={462} fill="url(#firelight-vert)" />
        {!reducedMotion && (
          <motion.rect x={646} y={640} width={54} height={162} fill="#E8913A"
                       animate={{ opacity: [0.12, 0.24, 0.12] }}
                       transition={{ duration: 2.4, repeat: Infinity }} />
        )}
        <rect x={548} y={744} width={142} height={30} rx={15} fill="#FFF8E8" opacity={0.94}
              stroke="#C9B88E" strokeWidth={1.5} />
        <text x={619} y={764} textAnchor="middle" fontSize={13} fontWeight={700} fill="#3f2614">
          reading room →
        </text>
      </g>

      {/* the fern stands on plain floor in the far corner — it used
          to sit exactly on the rug's top edge, balanced there like a
          tightrope act, and it crowded the rug */}
      <g>
        <ellipse cx={655} cy={1046} rx={26} ry={7} fill="#000" opacity={0.16} />
        <path d="M 640 1004 L 670 1004 L 665 1044 L 645 1044 Z" fill="#A5553F" stroke="#7A3A2C" strokeWidth={2} />
        <path d="M 655 1002 Q 640 976 626 974 M 655 1002 Q 655 968 649 958 M 655 1002 Q 668 974 682 968 M 655 1002 Q 674 986 686 988"
              fill="none" stroke="#5F7F4A" strokeWidth={4} strokeLinecap="round" />
      </g>

      {/* the runner — the colorful one from the fireplace photo runs
          through the hall. It starts CLEAR of the bench: the two used
          to overlap and the rug's blocks read as a shelf of cubes
          standing against the seat. Fringe on both ends, because
          fringe is what says "rug" in one glance. */}
      <g>
        <rect x={330} y={900} width={250} height={84} rx={8} fill="#8F4A5A" />
        {[0, 1, 2].map(i => (
          <rect key={i} x={350 + i * 74} y={908} width={54} height={68} rx={5}
                fill={['#4A8C8C', '#D9A441', '#C96A5A'][i]} opacity={0.85} />
        ))}
        {[0, 1, 2].map(i => (
          <path key={i} d={`M ${377 + i * 74} 926 l 11 16 l -11 16 l -11 -16 Z`}
                fill="#F2E6D0" opacity={0.7} />
        ))}
        {[0, 1, 2, 3, 4].map(i => (
          <g key={i} stroke="#E8DCC8" strokeWidth={2.5} strokeLinecap="round">
            <line x1={323} y1={910 + i * 14} x2={330} y2={908 + i * 14} />
            <line x1={580} y1={908 + i * 14} x2={587} y2={910 + i * 14} />
          </g>
        ))}
      </g>

      {/* the cushioned bench — left, in front of the stairs, where it
          really is (the listing staged a table; the family put a bench) */}
      <g>
        {/* the shadow lands where the feet land — a shadow floating
            below the legs is what made it float */}
        <ellipse cx={148} cy={1000} rx={100} ry={10} fill="#000" opacity={0.14} />
        {[62, 212].map(x => (
          <ellipse key={x} cx={x + 7} cy={1000} rx={13} ry={4} fill="#000" opacity={0.22} />
        ))}
        <rect x={56} y={924} width={188} height={18} fill={OAK} rx={4} />
        {[62, 212].map(x => (
          <rect key={x} x={x} y={942} width={14} height={58} fill={OAK_DARK} rx={2} />
        ))}
        <rect x={62} y={892} width={176} height={36} rx={14} fill="#B0533F" />
        <line x1={106} y1={896} x2={106} y2={924} stroke="#8F3F30" strokeWidth={2} opacity={0.6} />
        <line x1={194} y1={896} x2={194} y2={924} stroke="#8F3F30" strokeWidth={2} opacity={0.6} />
        <rect x={72} y={878} width={52} height={26} rx={11} fill="#C97B5A" />
        <rect x={180} y={878} width={52} height={26} rx={11} fill="#D9A441" />
        <g fill="#5A4632" stroke="#3F2E1E" strokeWidth={1.5}>
          <path d="M 100 998 l 0 -24 q 0 -6 7 -6 l 8 0 q 6 0 6 6 l 0 10 15 0 q 6 0 6 6 l 0 8 Z" />
          <path d="M 154 998 l 0 -24 q 0 -6 7 -6 l 8 0 q 6 0 6 6 l 0 10 15 0 q 6 0 6 6 l 0 8 Z" />
        </g>
      </g>

      {/* corner shading, so the room has sides */}
      <rect x={0} y={56} width={80} height={1044} fill="url(#corner-left)" pointerEvents="none" />
      <rect x={620} y={56} width={80} height={1044} fill="url(#corner-right)" pointerEvents="none" />
    </svg>
  );
}

/**
 * The staircase, mirrored to how you actually see it walking in: it
 * climbs away to the LEFT and out of the top of the frame — upstairs
 * exists, it just is not built yet, and the sign on the rail says so.
 */
function Staircase({ reducedMotion }: { reducedMotion: boolean }) {
  void reducedMotion;
  const STEPS = 8;
  const x0 = 300, y0 = 950;         // front bottom of the first riser
  const run = 36, rise = 44;
  const steps = Array.from({ length: STEPS }, (_, i) => ({
    x: x0 - i * run, y: y0 - i * rise,
  }));
  return (
    <g>
      {/* closed stringer under the flight */}
      <path d={`M ${x0 + 8} ${y0 + 58} L ${x0 - STEPS * run - 30} ${y0 - STEPS * rise + 58}
                L ${x0 - STEPS * run - 30} 1100 L ${x0 + 8} 1100 Z`}
            fill={OAK_DARK} opacity={0.3} />
      {/* wainscot on the under-stair wall, like the real hall */}
      <path d={`M 0 700 L 236 872 L 236 800 L 0 620 Z`} fill={OAK} opacity={0.25} />
      {/* the steps: riser then tread, each running off-frame left */}
      {steps.map(({ x, y }, i) => (
        <g key={i}>
          <rect x={0} y={y - rise} width={x} height={rise} fill={OAK} />
          <rect x={0} y={y - rise - 10} width={x} height={12} fill={OAK_LIGHT}
                stroke={OAK_DARK} strokeWidth={1.5} rx={2} />
        </g>
      ))}

      {/* newel post at the foot, carved cap like the photos */}
      <rect x={296} y={806} width={26} height={166} fill="url(#oak-round)" stroke={OAK_DARK} strokeWidth={2} rx={3} />
      <rect x={290} y={790} width={38} height={22} fill={OAK} stroke={OAK_DARK} strokeWidth={2} rx={5} />
      <circle cx={309} cy={784} r={9} fill={OAK_LIGHT} stroke={OAK_DARK} strokeWidth={2} />

      {/* balusters and the raked rail */}
      {steps.map(({ x, y }, i) => (
        <g key={i}>
          <rect x={x - 19} y={y - rise - 96} width={5} height={92} fill={OAK} rx={2} />
          <circle cx={x - 16.5} cy={y - rise - 60} r={5} fill={OAK} />
        </g>
      ))}
      <line x1={314} y1={800} x2={x0 - STEPS * run - 10} y2={800 - STEPS * rise}
            stroke={OAK_DARK} strokeWidth={11} strokeLinecap="round" />
      <line x1={314} y1={796} x2={x0 - STEPS * run - 10} y2={796 - STEPS * rise}
            stroke={OAK_LIGHT} strokeWidth={4} strokeLinecap="round" />

      {/* the honest sign about upstairs, hanging from the rail */}
      <line x1={150} y1={624} x2={150} y2={648} stroke="#8A7A5E" strokeWidth={2} />
      <rect x={94} y={648} width={112} height={40} rx={6} fill="#F7EFD9" stroke="#C9B88E" strokeWidth={2}
            transform="rotate(2 150 668)" />
      <text x={150} y={665} textAnchor="middle" fontSize={11} fontWeight={700} fill="#6B5C42"
            transform="rotate(2 150 668)">upstairs</text>
      <text x={150} y={680} textAnchor="middle" fontSize={10} fontStyle="italic" fill="#8A7A5E"
            transform="rotate(2 150 668)">not built yet</text>
    </g>
  );
}

/* ── the kitchen ────────────────────────────────────────────────── */

// Her real kitchen, from the photos: sage shaker cabinets, dark
// veined granite, the white-and-gray starburst backsplash, a window
// over the sink, the stainless refrigerator, and the peninsula with
// the clear stools and teal cushions. The hallway at the back leads
// to the white back door. Cooking opens the same recipe book as
// Bachan's table — one kitchen system, two doors into it.

function KitchenRoom({
  reducedMotion, onBack, onCook,
}: {
  reducedMotion: boolean;
  onBack: () => void;
  onCook: () => void;
}) {
  const SAGE = '#C9D2BC';
  const SAGE_DARK = '#A9B49A';
  const GRANITE = '#4A4A46';
  const GRANITE_VEIN = '#8A8A80';
  return (
    <svg viewBox="0 0 700 1100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="k-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4E4D4" />
          <stop offset="100%" stopColor="#E8D0BC" />
        </linearGradient>
        <linearGradient id="k-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#B8BCC0" />
          <stop offset="45%" stopColor="#D8DCE0" />
          <stop offset="100%" stopColor="#A8ACB0" />
        </linearGradient>
        <linearGradient id="k-corner-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5A3B1F" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#5A3B1F" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="k-corner-r" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#5A3B1F" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#5A3B1F" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ceiling, blush walls from the photos, parquet floor */}
      <rect x={0} y={0} width={700} height={56} fill="#F7EEDC" />
      <rect x={0} y={52} width={700} height={10} fill={TRIM} opacity={0.4} />
      <rect x={0} y={60} width={700} height={780} fill="url(#k-wall)" />
      <rect x={0} y={820} width={700} height={280} fill="#D9B380" />
      {/* parquet: brick-laid blocks */}
      {[850, 900, 950, 1000, 1050].map((y, r) => (
        <g key={y}>
          <line x1={0} y1={y} x2={700} y2={y} stroke="#B98F58" strokeWidth={2} opacity={0.6} />
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <line key={i} x1={i * 100 + (r % 2 ? 50 : 0)} y1={y} x2={i * 100 + (r % 2 ? 50 : 0)} y2={y + 50}
                  stroke="#B98F58" strokeWidth={1.5} opacity={0.5} />
          ))}
        </g>
      ))}

      {/* back to the hall */}
      <g onClick={onBack} style={{ cursor: 'pointer' }} role="button" aria-label="Back to the hall">
        <rect x={16} y={26} width={128} height={38} rx={19} fill="#FFF8E8" opacity={0.92}
              stroke="#C9B88E" strokeWidth={2} />
        <text x={80} y={51} textAnchor="middle" fontSize={14} fontWeight={700} fill="#3f2614">
          ← the hall
        </text>
      </g>

      {/* the hallway to the white back door, off the right */}
      <g>
        <rect x={596} y={330} width={80} height={470} fill={TRIM} rx={3} />
        <rect x={608} y={344} width={56} height={442} fill="#C9B49C" />
        {/* the white door with its window, small with distance */}
        <rect x={616} y={520} width={40} height={200} fill="#F6F2EA" stroke="#C9BCA8" strokeWidth={2} rx={2} />
        <rect x={622} y={532} width={28} height={60} fill="#BFD8E4" stroke="#C9BCA8" strokeWidth={1.5} />
        <circle cx={650} cy={630} r={2.5} fill="#8A7A5E" />
      </g>

      {/* upper cabinets: sage shaker with under-cabinet lights */}
      {[[60, 200], [280, 150], [450, 130]].map(([x, w], i) => (
        <g key={i}>
          <rect x={x} y={210} width={w} height={150} fill={SAGE} stroke={SAGE_DARK} strokeWidth={2} rx={3} />
          {Array.from({ length: Math.max(1, Math.round(w / 75)) }, (_, d) => (
            <rect key={d} x={x + 10 + d * (w / Math.max(1, Math.round(w / 75)))} y={222}
                  width={w / Math.max(1, Math.round(w / 75)) - 20} height={126}
                  fill="none" stroke={SAGE_DARK} strokeWidth={2} rx={2} />
          ))}
          <rect x={x} y={356} width={w} height={6} fill="#FFF3CF" opacity={0.9} />
        </g>
      ))}

      {/* the starburst backsplash */}
      <rect x={60} y={366} width={520} height={128} fill="#F4F0E8" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map(cx => [0, 1].map(cy => {
        const px = 95 + cx * 65, py = 398 + cy * 62;
        return (
          <g key={`${cx}-${cy}`} stroke="#8A8A94" strokeWidth={1.2} opacity={0.55}>
            {[0, 45, 90, 135].map(a => (
              <line key={a}
                    x1={px - 12 * Math.cos(a * Math.PI / 180)} y1={py - 12 * Math.sin(a * Math.PI / 180)}
                    x2={px + 12 * Math.cos(a * Math.PI / 180)} y2={py + 12 * Math.sin(a * Math.PI / 180)} />
            ))}
            <circle cx={px} cy={py} r={2} fill="#8A8A94" stroke="none" />
          </g>
        );
      }))}

      {/* window over the sink, garden beyond */}
      <g>
        <rect x={296} y={286} width={120} height={176} fill="#FFFFFF" stroke="#D8CEBA" strokeWidth={3} rx={2} />
        <rect x={302} y={292} width={108} height={112} fill="#CFE4EE" />
        <rect x={302} y={292} width={108} height={112} fill="url(#garden-through-glass2)" opacity={0.85} />
        <line x1={356} y1={292} x2={356} y2={404} stroke="#FFFFFF" strokeWidth={3} />
        <rect x={302} y={408} width={108} height={48} fill="#EDF4F7" opacity={0.5} />
        <defs>
          <linearGradient id="garden-through-glass2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CFE4EE" />
            <stop offset="55%" stopColor="#A9C6A0" />
            <stop offset="100%" stopColor="#7FA86B" />
          </linearGradient>
        </defs>
      </g>

      {/* counter run: granite, sink under the window, cooktop, base
          cabinets, dishwasher, and the fridge on the left */}
      <g>
        <rect x={40} y={494} width={80} height={330} fill="url(#k-steel)" stroke="#8A8E92" strokeWidth={2} rx={6} />
        <line x1={80} y1={500} x2={80} y2={690} stroke="#8A8E92" strokeWidth={2} />
        <rect x={62} y={560} width={7} height={54} rx={3} fill="#8A8E92" />
        <rect x={91} y={560} width={7} height={54} rx={3} fill="#8A8E92" />
        <line x1={44} y1={700} x2={116} y2={700} stroke="#8A8E92" strokeWidth={2} />
      </g>
      <g>
        <rect x={130} y={494} width={460} height={30} fill={GRANITE} rx={4} />
        {[[150, 505], [230, 512], [330, 502], [430, 514], [520, 506]].map(([vx, vy], i) => (
          <path key={i} d={`M ${vx} ${vy} q 24 ${i % 2 ? 6 : -6} 48 0`} fill="none"
                stroke={GRANITE_VEIN} strokeWidth={1.5} opacity={0.6} />
        ))}
        {/* sink */}
        <rect x={306} y={496} width={100} height={12} rx={4} fill="#B8BCC0" />
        <path d="M 340 494 q 0 -26 18 -26 q 14 0 14 14" fill="none" stroke="#8A8E92" strokeWidth={5} strokeLinecap="round" />
        {/* cooktop with grates */}
        <rect x={452} y={496} width={110} height={16} rx={4} fill="#2A2A28" />
        {[470, 502, 534].map(gx => (
          <circle key={gx} cx={gx + 8} cy={504} r={6} fill="none" stroke="#6A6A64" strokeWidth={2} />
        ))}
        {/* base cabinets */}
        <rect x={130} y={524} width={460} height={210} fill={SAGE} stroke={SAGE_DARK} strokeWidth={2} />
        {[140, 250, 470].map(bx => (
          <rect key={bx} x={bx} y={536} width={90} height={186} fill="none" stroke={SAGE_DARK} strokeWidth={2} rx={2} />
        ))}
        {[140, 250, 470].map(bx => (
          <rect key={bx} x={bx + 30} y={548} width={30} height={5} rx={2.5} fill={SAGE_DARK} />
        ))}
        {/* dishwasher */}
        <rect x={352} y={536} width={104} height={186} fill="url(#k-steel)" stroke="#8A8E92" strokeWidth={2} rx={3} />
        <rect x={362} y={548} width={84} height={8} rx={4} fill="#8A8E92" />
        <rect x={130} y={734} width={460} height={10} fill="#8A8A78" opacity={0.4} />
      </g>

      {/* THE PENINSULA — granite top, sage base, and the three clear
          stools with teal cushions from the photo */}
      <g>
        <rect x={120} y={806} width={430} height={34} fill={GRANITE} rx={6} />
        {[[150, 820], [280, 826], [420, 816]].map(([vx, vy], i) => (
          <path key={i} d={`M ${vx} ${vy} q 30 ${i % 2 ? 7 : -7} 60 0`} fill="none"
                stroke={GRANITE_VEIN} strokeWidth={1.5} opacity={0.6} />
        ))}
        <rect x={148} y={840} width={374} height={96} fill={SAGE} stroke={SAGE_DARK} strokeWidth={2} />
        {[160, 300, 430].map(bx => (
          <rect key={bx} x={bx} y={850} width={80} height={76} fill="none" stroke={SAGE_DARK} strokeWidth={2} rx={2} />
        ))}
        {/* stools: clear acrylic legs, teal seats */}
        {[210, 335, 460].map((sx, i) => (
          <g key={sx}>
            <ellipse cx={sx} cy={1042} rx={30} ry={6} fill="#000" opacity={0.13} />
            <g stroke="#C8D8DC" strokeWidth={4} opacity={0.8} strokeLinecap="round">
              <line x1={sx - 22} y1={974} x2={sx - 26} y2={1040} />
              <line x1={sx + 22} y1={974} x2={sx + 26} y2={1040} />
              <line x1={sx - 24} y1={1012} x2={sx + 24} y2={1012} />
            </g>
            <rect x={sx - 28} y={952} width={56} height={24} rx={11} fill="#2E8B9A" />
            <rect x={sx - 28} y={952} width={56} height={10} rx={5} fill="#3FA3B4" />
          </g>
        ))}
      </g>

      {/* cook something — the door into the family recipe book */}
      <g onClick={onCook} style={{ cursor: 'pointer' }} role="button" aria-label="Cook something">
        <rect x={210} y={640} width={250} height={56} rx={28} fill="#C9A227"
              stroke="#8A6534" strokeWidth={2} />
        <text x={335} y={675} textAnchor="middle" fontSize={19} fontWeight={700} fill="#2A2420">
          🍲 cook something
        </text>
      </g>

      {/* corner shading */}
      <rect x={0} y={56} width={70} height={1044} fill="url(#k-corner-l)" pointerEvents="none" />
      <rect x={630} y={56} width={70} height={1044} fill="url(#k-corner-r)" pointerEvents="none" />
    </svg>
  );
}

/* ── the reading room ───────────────────────────────────────────── */

function ReadingRoom({
  house, completedEpisodes, reducedMotion, onBack, onLuna, onBook, onSlot,
}: {
  house: HouseState;
  completedEpisodes: number[];
  reducedMotion: boolean;
  onBack: () => void;
  onLuna: () => void;
  onBook: (episode: number) => void;
  onSlot: (slot: 'stone' | 'bird') => void;
}) {
  const stone = house.mantelStone ? getGem(house.mantelStone) : undefined;
  const bird = house.mantelBird ? getBird(house.mantelBird) : undefined;
  const books = completedEpisodes
    .map(ep => ({ ep, data: getEpisode(ep) }))
    .filter(b => !!b.data);
  const BOOK_COLORS = ['#4A7BA6', '#B0533F', '#6B8E5A', '#D9A441'];

  return (
    <svg viewBox="0 0 700 1100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="rr-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0DFC2" />
          <stop offset="50%" stopColor="#E9D4AF" />
          <stop offset="100%" stopColor="#D8BB92" />
        </linearGradient>
        <linearGradient id="rr-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BC7C42" />
          <stop offset="100%" stopColor="#93582A" />
        </linearGradient>
        <radialGradient id="rr-fireglow" cx="0.5" cy="0.72" r="0.75">
          <stop offset="0%" stopColor="#F2A93B" stopOpacity="0.28" />
          <stop offset="55%" stopColor="#E8913A" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#E8913A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rr-corner-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5A3B1F" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#5A3B1F" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="rr-corner-right" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#5A3B1F" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#5A3B1F" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* ceiling, wall, rail, floor — warm, and lit by the fire */}
      <rect x={0} y={0} width={700} height={56} fill="#F7EEDC" />
      <rect x={0} y={52} width={700} height={10} fill={TRIM} opacity={0.5} />
      <rect x={0} y={60} width={700} height={822} fill="url(#rr-wall)" />
      <rect x={0} y={240} width={700} height={7} fill={TRIM} opacity={0.55} />
      <rect x={0} y={878} width={700} height={22} fill={TRIM} />
      <rect x={0} y={896} width={700} height={204} fill="url(#rr-floor)" />
      {[950, 1010, 1070].map(y => (
        <line key={y} x1={0} y1={y} x2={700} y2={y} stroke={FLOOR_LINE} strokeWidth={2} opacity={0.4} />
      ))}
      <rect x={0} y={60} width={700} height={1040} fill="url(#rr-fireglow)" pointerEvents="none" />

      {/* framed flower art from the entry photos, one each side */}
      {[[64, 330], [572, 330]].map(([fx, fy], k) => (
        <g key={k}>
          <rect x={fx} y={fy} width={64} height={84} fill={OAK} stroke={OAK_DARK} strokeWidth={2} rx={2} />
          <rect x={fx + 7} y={fy + 7} width={50} height={70} fill="#F9F1E4" />
          {[[22, 30, 9], [38, 48, 7], [24, 58, 6]].map(([dx, dy, r], i) => (
            <g key={i}>
              <circle cx={fx + dx} cy={fy + dy} r={r} fill="#E8B4C0" />
              <circle cx={fx + dx} cy={fy + dy} r={r * 0.55} fill="#F4D6DC" />
            </g>
          ))}
        </g>
      ))}

      {/* back to the hall */}
      <g onClick={onBack} style={{ cursor: 'pointer' }} role="button" aria-label="Back to the hall">
        <rect x={16} y={26} width={128} height={38} rx={19} fill="#FFF8E8" opacity={0.92}
              stroke="#C9B88E" strokeWidth={2} />
        <text x={80} y={51} textAnchor="middle" fontSize={14} fontWeight={700} fill="#3f2614">
          ← the hall
        </text>
      </g>

      {/* THE MANTEL — columns, mirror, shelf, brick. The house's best
          object, drawn the way the photos show it. */}
      <g>
        {/* cornice */}
        <rect x={132} y={286} width={436} height={16} fill={OAK_LIGHT} stroke={OAK_DARK} strokeWidth={2} rx={3} />
        <rect x={144} y={302} width={412} height={12} fill={OAK} />
        {/* columns */}
        {[152, 506].map(x => (
          <g key={x}>
            <rect x={x} y={314} width={42} height={14} fill={OAK} stroke={OAK_DARK} strokeWidth={1.5} />
            <rect x={x + 6} y={328} width={30} height={510} fill="url(#oak-round2)" stroke={OAK_DARK} strokeWidth={2} rx={14} />
            <rect x={x} y={838} width={42} height={26} fill={OAK} stroke={OAK_DARK} strokeWidth={1.5} />
          </g>
        ))}
        <defs>
          <linearGradient id="oak-round2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={OAK_DARK} />
            <stop offset="45%" stopColor={OAK_LIGHT} />
            <stop offset="100%" stopColor={OAK_DARK} />
          </linearGradient>
          {/* a mirror in firelight is warm glass, not sky */}
          <linearGradient id="mirror-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D9CDB8" />
            <stop offset="55%" stopColor="#C4B49E" />
            <stop offset="100%" stopColor="#AE9C86" />
          </linearGradient>
          <radialGradient id="fire-glow" cx="0.5" cy="0.85" r="0.8">
            <stop offset="0%" stopColor="#F2A93B" />
            <stop offset="45%" stopColor="#D96C2A" />
            <stop offset="100%" stopColor="#241A12" />
          </radialGradient>
        </defs>
        {/* panel behind mirror and shelf — darker than the columns so
            the columns stand off it instead of merging into one slab */}
        <rect x={194} y={314} width={312} height={330} fill={OAK_DARK} stroke="#54351A" strokeWidth={2} />
        {/* the mirror. A mirror over a mantel reflects the warm room,
            not the sky — the first render read as a window. */}
        <rect x={222} y={340} width={256} height={128} fill="#5A4A3E" stroke={OAK} strokeWidth={4} />
        <rect x={228} y={346} width={244} height={116} fill="url(#mirror-glass)" />
        <rect x={236} y={354} width={228} height={100} fill="none" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.4} />
        {/* faint reflections: the room's warmth and a slant of light */}
        <ellipse cx={350} cy={448} rx={92} ry={16} fill="#E8913A" opacity={0.14} />
        <line x1={262} y1={452} x2={366} y2={360} stroke="#FFFFFF" strokeWidth={6} opacity={0.22} strokeLinecap="round" />
        {/* the display shelf, and what she chose to stand on it */}
        <rect x={206} y={508} width={288} height={14} fill={OAK_LIGHT} stroke={OAK_DARK} strokeWidth={2} rx={3} />
        {[236, 452].map(x => (
          <path key={x} d={`M ${x} 522 l 10 22 l -20 0 Z`} fill={OAK} />
        ))}
        {/* stone slot — the piece STANDS ON the shelf */}
        <g onClick={() => onSlot('stone')} style={{ cursor: 'pointer' }} role="button"
           aria-label="Choose a stone for the mantel">
          <rect x={258} y={452} width={64} height={60} fill="transparent" />
          {stone ? (
            <g transform="translate(268, 464)"><GemSpecimen gem={stone} size={44} /></g>
          ) : (
            <>
              <circle cx={290} cy={488} r={18} fill="none" stroke="#D8C7A8" strokeWidth={2} strokeDasharray="5 4" />
              <text x={290} y={494} textAnchor="middle" fontSize={15} fill="#D8C7A8">+</text>
            </>
          )}
        </g>
        {/* bird slot */}
        <g onClick={() => onSlot('bird')} style={{ cursor: 'pointer' }} role="button"
           aria-label="Choose a bird for the mantel">
          <rect x={378} y={452} width={68} height={60} fill="transparent" />
          {bird ? (
            <g transform="translate(388, 460)"><SpeciesIllustration code={bird.code} size={48} /></g>
          ) : (
            <>
              <circle cx={412} cy={488} r={18} fill="none" stroke="#D8C7A8" strokeWidth={2} strokeDasharray="5 4" />
              <text x={412} y={494} textAnchor="middle" fontSize={15} fill="#D8C7A8">+</text>
            </>
          )}
        </g>
        {/* raised panels on the frieze, so it reads as joinery
            rather than a flat brown slab */}
        {[214, 362].map(x => (
          <rect key={x} x={x} y={556} width={124} height={72} fill="none"
                stroke={OAK} strokeWidth={3} rx={4} opacity={0.8} />
        ))}
        {/* brick surround and firebox */}
        <g>
          <rect x={222} y={644} width={256} height={220} fill={BRICK} stroke={MORTAR} strokeWidth={1} />
          {/* real brick is not one color — a scatter of darker and
              lighter ones keeps it from reading as wallpaper */}
          {[[230, 664, '#8F4634'], [326, 684, '#B96A50'], [278, 724, '#8F4634'],
            [422, 664, '#B96A50'], [374, 744, '#8F4634'], [230, 804, '#B96A50'],
            [426, 784, '#8F4634'], [254, 844, '#B96A50'], [422, 844, '#8F4634']].map(([bx, by, c], i) => (
            <rect key={i} x={bx as number} y={by as number} width={44} height={18} fill={c as string} opacity={0.55} />
          ))}
          {[664, 684, 704, 724, 744, 764, 784, 804, 824, 844].map((y, r) => (
            <g key={y} stroke={MORTAR} strokeWidth={1.6} opacity={0.7}>
              <line x1={222} y1={y} x2={478} y2={y} />
              {[254, 302, 350, 398, 446].map(x => (
                <line key={x} x1={x + (r % 2 ? 24 : 0)} y1={y - 20} x2={x + (r % 2 ? 24 : 0)} y2={y} />
              ))}
            </g>
          ))}
          <rect x={266} y={688} width={168} height={176} fill="#241A12" rx={6} />
          <rect x={266} y={688} width={168} height={176} fill="url(#fire-glow)" opacity={0.9} rx={6} />
          {/* the fire */}
          {!reducedMotion ? (
            <g>
              {[0, 1, 2].map(i => (
                <motion.path
                  key={i}
                  d={`M ${316 + i * 24} 848 Q ${306 + i * 24} 800 ${322 + i * 24} 770 Q ${330 + i * 24} 796 ${338 + i * 24} 782 Q ${346 + i * 24} 812 ${336 + i * 24} 848 Z`}
                  fill={i === 1 ? '#F7C948' : '#E8913A'}
                  animate={{ scaleY: [1, 1.14, 0.94, 1], opacity: [0.9, 1, 0.82, 0.9] }}
                  transition={{ duration: 1.6 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ originX: `${327 + i * 24}px`, originY: '848px' }}
                />
              ))}
            </g>
          ) : (
            <g>
              {[0, 1, 2].map(i => (
                <path key={i}
                      d={`M ${316 + i * 24} 848 Q ${306 + i * 24} 800 ${322 + i * 24} 770 Q ${330 + i * 24} 796 ${338 + i * 24} 782 Q ${346 + i * 24} 812 ${336 + i * 24} 848 Z`}
                      fill={i === 1 ? '#F7C948' : '#E8913A'} />
              ))}
            </g>
          )}
          {/* logs and screen */}
          <rect x={292} y={844} width={116} height={10} rx={5} fill="#5A3B1F" />
          <path d="M 276 864 Q 350 806 424 864" fill="none" stroke="#3A322A" strokeWidth={3} />
          {[292, 316, 340, 364, 388, 412].map(x => (
            <line key={x} x1={x} y1={x === 292 || x === 412 ? 860 : 838} x2={x} y2={864}
                  stroke="#3A322A" strokeWidth={1.5} opacity={0.8} />
          ))}
        </g>
      </g>

      {/* brick hearth stepping out onto the floor */}
      <path d="M 210 900 L 490 900 L 522 968 L 178 968 Z" fill={BRICK} stroke={MORTAR} strokeWidth={2} />
      <line x1={200} y1={932} x2={500} y2={932} stroke={MORTAR} strokeWidth={1.6} opacity={0.7} />
      {[260, 350, 440].map(x => (
        <line key={x} x1={x - 8} y1={900} x2={x} y2={968} stroke={MORTAR} strokeWidth={1.6} opacity={0.6} />
      ))}

      {/* the striped rug from the photos */}
      <g>
        <rect x={120} y={982} width={460} height={94} rx={14} fill="#E8DFD2" />
        {['#4A8C8C', '#C96A5A', '#D9A441', '#7A5A8C', '#6B8E5A', '#C96A5A', '#4A8C8C'].map((c, i) => (
          <rect key={i} x={138 + i * 62} y={990} width={44} height={78} rx={6} fill={c} opacity={0.85} />
        ))}
      </g>

      {/* Luna, asleep on the hearth rug, where cats are */}
      <g onClick={onLuna} style={{ cursor: 'pointer' }} role="button" aria-label="Visit Luna">
        <ellipse cx={432} cy={1030} rx={52} ry={10} fill="#000" opacity={0.16} />
        <SleepingLuna x={432} y={1006} reducedMotion={reducedMotion} />
        {!reducedMotion && [0, 1].map(i => (
          <motion.text key={i} x={478 + i * 14} y={962 - i * 18} fontSize={13 + i * 3}
                       fill="#8A7A5E" fontStyle="italic"
                       animate={{ opacity: [0, 0.8, 0], y: [0, -10, -18] }}
                       transition={{ duration: 4, repeat: Infinity, delay: i * 1.6 }}>
            z
          </motion.text>
        ))}
      </g>

      {/* the storybook basket — a finished chapter becomes a book */}
      <g>
        <path d="M 96 906 L 208 906 L 196 976 L 108 976 Z" fill="#B08B4F" stroke="#8A6534" strokeWidth={3} />
        {[920, 936, 952].map(y => (
          <line key={y} x1={102} y1={y} x2={202} y2={y} stroke="#8A6534" strokeWidth={2} opacity={0.6} />
        ))}
        {books.length === 0 ? (
          <>
            <rect x={104} y={868} width={96} height={30} rx={8} fill="#FFF8E8" opacity={0.9} />
            <text x={152} y={881} textAnchor="middle" fontSize={9} fill="#8A7A5E">stories you finish</text>
            <text x={152} y={893} textAnchor="middle" fontSize={9} fill="#8A7A5E">will live here</text>
          </>
        ) : books.map((b, i) => (
          <g key={b.ep} onClick={() => onBook(b.ep)} style={{ cursor: 'pointer' }} role="button"
             aria-label={`Read ${b.data!.title}`}>
            <rect x={112 + i * 34} y={856} width={26} height={56} rx={4}
                  fill={BOOK_COLORS[i % BOOK_COLORS.length]} stroke="#3f2614" strokeWidth={1.5}
                  transform={`rotate(${i % 2 ? 4 : -3} ${125 + i * 34} 884)`} />
            <line x1={116 + i * 34} y1={864} x2={134 + i * 34} y2={864}
                  stroke="#FFF8E8" strokeWidth={2} opacity={0.8}
                  transform={`rotate(${i % 2 ? 4 : -3} ${125 + i * 34} 884)`} />
          </g>
        ))}
        {books.length > 0 && (
          <>
            <rect x={98} y={992} width={112} height={22} rx={11} fill="#FFF8E8" opacity={0.9} />
            <text x={154} y={1007} textAnchor="middle" fontSize={11} fontWeight={700} fill="#3f2614">
              story time
            </text>
          </>
        )}
      </g>
    </svg>
  );
}

/**
 * Luna curled up asleep, breathing slowly.
 *
 * The translate lives on a PLAIN outer <g>: framer-motion replaces a
 * motion element's transform attribute with its own animated one, so
 * animating and positioning on the same node throws the cat into the
 * top-left corner. Pip taught this map family the off-screen lesson;
 * this is the SVG-transform version of it.
 */
function SleepingLuna({ x, y, reducedMotion }: { x: number; y: number; reducedMotion: boolean }) {
  const body = (
    <g>
      <ellipse cx={0} cy={0} rx={44} ry={26} fill="#8A8A94" stroke="#5A5A64" strokeWidth={2} />
      {/* tail curled around */}
      <path d="M 40 8 Q 58 18 40 28 Q 12 40 -20 26" fill="none" stroke="#5A5A64" strokeWidth={9} strokeLinecap="round" />
      <path d="M 40 8 Q 58 18 40 28 Q 12 40 -20 26" fill="none" stroke="#8A8A94" strokeWidth={5.5} strokeLinecap="round" />
      {/* head tucked toward paws */}
      <circle cx={-28} cy={-6} r={17} fill="#8A8A94" stroke="#5A5A64" strokeWidth={2} />
      <path d="M -40 -18 l -3 -9 l 9 4 Z" fill="#8A8A94" stroke="#5A5A64" strokeWidth={1.5} />
      <path d="M -26 -21 l 0 -9 l 8 6 Z" fill="#8A8A94" stroke="#5A5A64" strokeWidth={1.5} />
      {/* closed eye, quiet whiskers */}
      <path d="M -36 -6 Q -32 -3 -28 -6" stroke="#3A3A44" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <line x1={-44} y1={0} x2={-52} y2={-1} stroke="#5A5A64" strokeWidth={1} />
      <line x1={-44} y1={3} x2={-52} y2={4} stroke="#5A5A64" strokeWidth={1} />
    </g>
  );
  if (reducedMotion) return <g transform={`translate(${x}, ${y})`}>{body}</g>;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <motion.g
        animate={{ scale: [1, 1.025, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {body}
      </motion.g>
    </g>
  );
}

/* ── the storybook, read by the fire ────────────────────────────── */

function BookOverlay({
  episode, choices, onClose,
}: {
  episode: number;
  choices: Record<string, string>;
  onClose: () => void;
}) {
  const data = getEpisode(episode);
  const pages: BookPage[] = data ? storybookPages(data, choices) : [];
  const [idx, setIdx] = useState(0);
  if (!data || pages.length === 0) return null;
  const page = pages[idx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(20,14,8,0.8)' }}>
      <div className="rounded-2xl p-5 w-full flex flex-col"
           style={{ background: '#FFFAF2', border: '2px solid #C9A227', maxWidth: 420, minHeight: 420 }}>
        <div className="flex items-start justify-between">
          <h2 className="font-bold text-base pr-2" style={{ color: '#3f2614' }}>{data.title}</h2>
          <button onClick={onClose} aria-label="Close the book"
                  className="rounded-full font-bold shrink-0"
                  style={{ background: '#EFE7D8', color: '#3f2614', width: 36, height: 36 }}>
            ✕
          </button>
        </div>
        <div className="flex justify-center my-3 text-5xl" aria-hidden>
          {page.art.type === 'emoji' ? (
            <span>{page.art.emoji}</span>
          ) : page.art.type === 'species' ? (
            <SpeciesIllustration code={page.art.code} size={84} />
          ) : (
            <span>🐈</span>
          )}
        </div>
        <p className="text-sm leading-relaxed flex-1" style={{ color: '#4a4034' }}>{page.text}</p>
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => { if (idx > 0) { setIdx(idx - 1); playPageTurn(); } }}
            disabled={idx === 0}
            className="rounded-xl px-4 font-bold text-sm disabled:opacity-40"
            style={{ background: '#EFE7D8', color: '#3f2614', minHeight: 48 }}
          >
            ← back
          </button>
          <span className="text-xs" style={{ color: '#8A7A5E' }}>
            page {idx + 1} of {pages.length}
          </span>
          {idx < pages.length - 1 ? (
            <button
              onClick={() => { setIdx(idx + 1); playPageTurn(); }}
              className="rounded-xl px-4 font-bold text-sm"
              style={{ background: '#C9A227', color: '#2A2420', minHeight: 48 }}
            >
              next →
            </button>
          ) : (
            <button
              onClick={onClose}
              className="rounded-xl px-4 font-bold text-sm"
              style={{ background: '#6b8e5a', color: '#fffaf2', minHeight: 48 }}
            >
              the end
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── choosing what stands on the mantel ─────────────────────────── */

function MantelPicker({
  slot, kept, lifeListCodes, current, onPick, onClose,
}: {
  slot: 'stone' | 'bird';
  kept: Record<string, number>;
  lifeListCodes: string[];
  current?: string;
  onPick: (code: string | null) => void;
  onClose: () => void;
}) {
  const options = slot === 'stone'
    ? Object.keys(kept).filter(c => (kept[c] ?? 0) > 0)
        .map(c => ({ code: c, gem: getGem(c), bird: undefined as ReturnType<typeof getBird> }))
        .filter(o => !!o.gem)
    : lifeListCodes
        .map(c => ({ code: c, gem: undefined as ReturnType<typeof getGem>, bird: getBird(c) }))
        .filter(o => !!o.bird);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
         style={{ background: 'rgba(20,14,8,0.7)' }} onClick={onClose}>
      <div className="rounded-2xl p-4 w-full" onClick={e => e.stopPropagation()}
           style={{ background: '#FFFAF2', border: '2px solid #C9A227', maxWidth: 420 }}>
        <h2 className="font-bold text-base" style={{ color: '#3f2614' }}>
          {slot === 'stone' ? 'A stone for the mantel' : 'A bird for the mantel'}
        </h2>
        <p className="text-xs mt-0.5 mb-3" style={{ color: '#8A7A5E' }}>
          {slot === 'stone'
            ? 'From your display case. It stays yours — the mantel just shows it off.'
            : 'From your life list — a bird you have really seen.'}
        </p>
        {options.length === 0 ? (
          <p className="text-sm italic py-4" style={{ color: '#6b6255' }}>
            {slot === 'stone'
              ? 'Nothing in your case yet. The cavern is where stones come from.'
              : 'No birds on your life list yet. See one out a real window first.'}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto">
            {options.map(o => (
              <button key={o.code} onClick={() => onPick(o.code)}
                      className="rounded-xl p-2 flex flex-col items-center gap-1"
                      style={{ background: current === o.code ? '#EFE0B0' : '#F6EEDF',
                               border: '1px solid #C9A227', minHeight: 84 }}>
                {o.gem
                  ? <GemSpecimen gem={o.gem} size={36} />
                  : <SpeciesIllustration code={o.code} size={40} />}
                <span className="text-[10px] font-bold text-center" style={{ color: '#3f2614' }}>
                  {o.gem?.name ?? o.bird?.commonName}
                </span>
              </button>
            ))}
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
