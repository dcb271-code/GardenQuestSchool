'use client';

// Diagrams for Old Bramble's forest lessons. Every one is drawn to the
// same house rules the garden scenes use: #3F2614 ink line, warm cream
// fills, sage/terracotta accents, no photographs and no clip-art.
//
// Each visual accepts a `highlight` or `stage` so a lesson's pages can
// walk through the same picture changing — the seed sprouting, the web
// being built, the leaf losing its green — rather than showing one
// static image three times.

import { motion } from 'framer-motion';
import type { ForestVisual } from '@/lib/world/forestLessons';

const INK = '#3F2614';
const CREAM = '#FFFAF2';
const SAGE = '#95B88F';
const FOREST = '#6B8E5A';
const TERRA = '#E8A87C';
const RED = '#C34A36';
const WATER = '#B2D4D9';
const DEEP_WATER = '#8FB7C2';
const BARK = '#8B5A2B';
const DARK_BARK = '#5A3B1F';
const GOLD = '#FFD93D';
const SOIL = '#A0714A';

const VB = 'w-full max-w-[360px] mx-auto';

/** Small cream label pill with ink hairline — used across the diagrams. */
function Tag({ x, y, text, tone = CREAM, w }: { x: number; y: number; text: string; tone?: string; w?: number }) {
  const width = w ?? Math.max(30, text.length * 6.0 + 12);
  return (
    <g>
      <rect x={x - width / 2} y={y - 9} width={width} height={17} rx={8.5}
            fill={tone} stroke={INK} strokeWidth={1.2} />
      <text x={x} y={y + 3.2} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={INK}
            style={{ userSelect: 'none' }}>{text}</text>
    </g>
  );
}

/** Arrow with a proper filled head — SVG markers vary too much across engines. */
function Arrow({ d, color = RED, width = 2.4, dashed }: { d: string; color?: string; width?: number; dashed?: boolean }) {
  return (
    <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round"
          strokeDasharray={dashed ? '5 4' : undefined} />
  );
}
function Head({ x, y, angle, color = RED, size = 6 }: { x: number; y: number; angle: number; color?: string; size?: number }) {
  return (
    <path d={`M 0 0 L ${-size} ${-size * 0.55} L ${-size} ${size * 0.55} Z`}
          fill={color} transform={`translate(${x},${y}) rotate(${angle})`} />
  );
}

// ─── 1. Cloud chart ─────────────────────────────────────────────────

function Puff({ x, y, s = 1, fill = CREAM }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={0} cy={4} rx={26} ry={7} fill={fill} stroke={INK} strokeWidth={1.4} />
      <ellipse cx={-10} cy={-2} rx={12} ry={9} fill={fill} stroke={INK} strokeWidth={1.4} />
      <ellipse cx={8} cy={-4} rx={14} ry={11} fill={fill} stroke={INK} strokeWidth={1.4} />
      <ellipse cx={-1} cy={0} rx={16} ry={9} fill={fill} stroke="none" />
    </g>
  );
}

function CloudChart({ highlight }: { highlight?: string }) {
  const dim = (k: string) => (highlight && highlight !== k ? 0.26 : 1);
  return (
    <svg viewBox="0 0 340 200" className={VB}>
      <defs>
        <linearGradient id="fvSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BBD3E8" />
          <stop offset="60%" stopColor="#DCEAF3" />
          <stop offset="100%" stopColor="#EFF3E4" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={340} height={200} rx={10} fill="url(#fvSky)" stroke={INK} strokeWidth={1.6} />

      {/* altitude ruler */}
      <line x1={24} y1={16} x2={24} y2={176} stroke={INK} strokeWidth={1.4} opacity={0.5} />
      {[[26, 'high'], [96, 'middle'], [156, 'low']].map(([y, t]) => (
        <g key={t as string}>
          <line x1={20} y1={y as number} x2={28} y2={y as number} stroke={INK} strokeWidth={1.2} opacity={0.5} />
          <text x={11} y={(y as number) + 3} fontSize={7.5} fontStyle="italic" fill={INK} opacity={0.7}
                textAnchor="middle" transform={`rotate(-90 11 ${(y as number) + 3})`}>{t as string}</text>
        </g>
      ))}

      {/* CIRRUS — its own band across the top left. Stroked wisps, not
          filled blobs: these are wind-stretched ice, not cotton. */}
      <g opacity={dim('cirrus')}>
        {[[42, 24], [76, 32], [116, 22], [96, 42]].map(([x, y], i) => (
          <g key={i}>
            <path d={`M ${x} ${y} q 22 -8 44 -4`} stroke={INK} strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.75} />
            <path d={`M ${x + 6} ${y + 4} q 18 -6 34 -3`} stroke={INK} strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.5} />
          </g>
        ))}
        <Tag x={100} y={62} text="cirrus — ice crystals" />
      </g>

      {/* CUMULUS — middle left, blue sky between the puffs */}
      <g opacity={dim('cumulus')}>
        <Puff x={72} y={100} s={0.95} />
        <Puff x={146} y={110} s={0.6} />
        <Tag x={98} y={132} text="cumulus — fair weather" />
      </g>

      {/* STRATUS — the low blanket, left half only */}
      <g opacity={dim('stratus')}>
        <path d="M 32 150 q 36 -7 72 -3 q 38 4 76 -2 l 0 12 q -40 5 -76 1 q -36 -4 -72 2 Z"
              fill="#C9CFD2" stroke={INK} strokeWidth={1.3} />
        {[48, 84, 120, 156].map(x => (
          <line key={x} x1={x} y1={162} x2={x - 2} y2={170} stroke={DEEP_WATER} strokeWidth={1.1} strokeLinecap="round" opacity={0.6} />
        ))}
        <Tag x={104} y={184} text="stratus — the blanket" />
      </g>

      {/* CUMULONIMBUS — the storm tower gets the right third to itself,
          floor to ceiling, so its height IS the lesson */}
      <g opacity={dim('cumulonimbus')}>
        <path d="M 214 172 q -14 -32 -2 -56 q -14 -28 10 -42 q 4 -24 30 -20 q 26 -8 34 16
                 q 24 8 14 30 q 14 20 -6 34 q 4 24 -18 38 Z"
              fill={highlight === 'cumulonimbus' ? '#E4E7E6' : CREAM} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
        {/* anvil sitting ON the tower top */}
        <path d="M 198 50 q 42 -14 90 -6 q 24 4 36 10 q -38 8 -72 4 q -32 -4 -54 -8 Z"
              fill="#E4E7E6" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
        {[224, 240, 256, 272].map((x, i) => (
          <line key={x} x1={x} y1={174} x2={x - 4} y2={186} stroke={DEEP_WATER} strokeWidth={1.7} strokeLinecap="round" opacity={0.85 - i * 0.07} />
        ))}
        <path d="M 258 108 L 248 132 L 258 132 L 250 154" stroke={GOLD} strokeWidth={2.8}
              fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <Tag x={262} y={84} text="cumulonimbus" tone="#FFF0CF" />
      </g>

      {/* ground */}
      <path d="M 0 188 q 60 -5 120 -1 q 70 4 120 -3 q 60 -6 100 2 L 340 200 L 0 200 Z" fill={FOREST} opacity={0.55} />
    </svg>
  );
}

// ─── 2. Germination ─────────────────────────────────────────────────

function Germination({ stage }: { stage: number }) {
  return (
    <svg viewBox="0 0 340 200" className={VB}>
      {/* sky + soil */}
      <rect x={0} y={0} width={340} height={78} rx={10} fill="#DCEAF3" stroke={INK} strokeWidth={1.6} />
      <path d="M 0 78 L 340 78 L 340 190 q 0 10 -10 10 L 10 200 q -10 0 -10 -10 Z" fill={SOIL} stroke={INK} strokeWidth={1.6} />
      <line x1={0} y1={78} x2={340} y2={78} stroke={INK} strokeWidth={1.8} />
      {/* soil speckle */}
      {[[40, 104], [92, 152], [148, 118], [214, 166], [268, 108], [300, 148], [66, 178], [188, 96]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.2} fill={DARK_BARK} opacity={0.28} />
      ))}
      {stage >= 3 && <circle cx={294} cy={26} r={15} fill={GOLD} stroke={INK} strokeWidth={1.4} />}

      <g transform="translate(170, 0)">
        {/* the seed */}
        <g transform={`translate(0, ${stage === 1 ? 112 : 106})`}>
          <ellipse cx={0} cy={0} rx={15} ry={11} fill="#D8B48A" stroke={INK} strokeWidth={1.6}
                   transform={stage >= 2 ? 'rotate(-12)' : undefined} />
          {stage === 1 && (
            <>
              {/* the packed lunch + baby plant, seen through a cutaway */}
              <path d="M -9 -4 q 5 6 0 10" stroke={INK} strokeWidth={1.1} fill="none" opacity={0.55} />
              <ellipse cx={3} cy={0} rx={7} ry={6} fill="#F0DCB4" stroke={INK} strokeWidth={1} opacity={0.9} />
              <path d="M 1 3 q 3 -5 6 -6" stroke={FOREST} strokeWidth={1.8} fill="none" strokeLinecap="round" />
            </>
          )}
          {stage >= 2 && (
            /* split coat */
            <path d="M -13 3 q 7 5 15 3" stroke={INK} strokeWidth={1.6} fill="none" strokeLinecap="round" />
          )}
        </g>

        {/* root — always first, always down */}
        {stage >= 2 && (
          <motion.path
            d={stage === 2
              ? 'M 0 116 q -3 12 1 24'
              : 'M 0 116 q -4 16 1 32 q 4 14 -2 26'}
            stroke={CREAM} strokeWidth={3.4} fill="none" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }}
          />
        )}
        {stage >= 3 && (
          <>
            <path d="M -1 148 q -12 6 -18 16" stroke={CREAM} strokeWidth={2} fill="none" strokeLinecap="round" />
            <path d="M 1 158 q 12 6 17 14" stroke={CREAM} strokeWidth={2} fill="none" strokeLinecap="round" />
            <path d="M 0 132 q -10 4 -14 12" stroke={CREAM} strokeWidth={1.7} fill="none" strokeLinecap="round" />
          </>
        )}

        {/* shoot — only after the root has hold */}
        {stage >= 3 && (
          <motion.path
            d={stage === 3 ? 'M 0 100 q -2 -10 0 -18' : 'M 0 100 q -3 -22 1 -44'}
            stroke={FOREST} strokeWidth={3.4} fill="none" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
          />
        )}
        {stage === 3 && (
          /* still hooked over, pushing through */
          <path d="M 0 82 q 1 -6 7 -5" stroke={FOREST} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        )}
        {stage >= 4 && (
          <>
            <path d="M 1 60 q -16 -10 -20 -22 q 16 -1 21 14 Z" fill={SAGE} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
            <path d="M 1 60 q 16 -10 20 -22 q -16 -1 -21 14 Z" fill={SAGE} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          </>
        )}
      </g>

      {/* stage captions */}
      {stage === 1 && <Tag x={80} y={130} text="food packed inside" tone="#FFF0CF" />}
      {stage === 2 && <Tag x={78} y={140} text="root first — down" tone="#FFF0CF" />}
      {stage >= 3 && <Tag x={78} y={150} text="then the shoot — up" tone="#FFF0CF" />}
      {stage >= 4 && <Tag x={84} y={26} text="now it makes its own food" tone="#FFF0CF" />}
    </svg>
  );
}

// ─── 3. Root / tuber / fruit ────────────────────────────────────────

function PlantParts({ highlight }: { highlight?: string }) {
  const on = (k: string) => !highlight || highlight === k;
  const fade = (k: string) => (on(k) ? 1 : 0.28);
  return (
    <svg viewBox="0 0 340 200" className={VB}>
      <rect x={0} y={0} width={340} height={92} rx={10} fill="#DCEAF3" stroke={INK} strokeWidth={1.6} />
      <path d="M 0 92 L 340 92 L 340 190 q 0 10 -10 10 L 10 200 q -10 0 -10 -10 Z" fill={SOIL} stroke={INK} strokeWidth={1.6} />
      <line x1={0} y1={92} x2={340} y2={92} stroke={INK} strokeWidth={1.8} />
      <text x={330} y={104} textAnchor="end" fontSize={8} fontStyle="italic" fill={CREAM} opacity={0.85}>soil line</text>

      {/* CARROT — one fat taproot */}
      <g opacity={fade('root')} transform="translate(58, 0)">
        <path d="M -6 92 q -4 -16 -14 -22 M 0 92 q 0 -18 -2 -26 M 6 92 q 5 -16 14 -22"
              stroke={FOREST} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        <path d="M -13 92 L 13 92 L 3 168 q -3 8 -6 0 Z" fill={TERRA} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
        {[104, 118, 132].map(y => (
          <line key={y} x1={-11 + (y - 92) * 0.11} y1={y} x2={11 - (y - 92) * 0.11} y2={y}
                stroke={INK} strokeWidth={0.8} opacity={0.35} />
        ))}
        {/* whiskery side roots doing the drinking */}
        <path d="M -9 116 q -12 4 -18 12 M 9 130 q 12 4 16 13 M -6 146 q -10 5 -14 12"
              stroke={CREAM} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        {on('root') && <Tag x={0} y={186} text="ROOT" tone="#FFE2CC" />}
      </g>

      {/* POTATO — swollen stem with buds */}
      <g opacity={fade('tuber')} transform="translate(170, 0)">
        <path d="M 0 92 q -2 -14 0 -22" stroke={FOREST} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <path d="M 0 70 q -12 -6 -16 -14 q 14 -2 17 10 Z" fill={SAGE} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
        <path d="M 0 70 q 12 -6 16 -14 q -14 -2 -17 10 Z" fill={SAGE} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
        {/* stolon — the underground STEM that swells */}
        <path d="M 0 92 q 1 16 -10 24" stroke="#C9A87C" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        <ellipse cx={-24} cy={132} rx={24} ry={17} fill="#D8B48A" stroke={INK} strokeWidth={1.6} />
        {/* the eyes — buds, and buds mean stem */}
        {[[-34, 126], [-18, 124], [-27, 139], [-11, 136]].map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={3} ry={2} fill={DARK_BARK} opacity={0.55} />
            <path d={`M ${x} ${y - 2} q 1 -5 4 -7`} stroke={FOREST} strokeWidth={1.4} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {on('tuber') && (
          <>
            <Arrow d="M 22 122 q -8 -6 -16 -4" color={RED} width={1.8} />
            <Head x={7} y={118.4} angle={188} size={5} />
            <Tag x={44} y={124} text="eyes = buds" tone="#FFE2CC" />
            <Tag x={-16} y={168} text="TUBER (a stem)" tone="#FFE2CC" />
          </>
        )}
      </g>

      {/* TOMATO — grew from a flower, carries seeds */}
      <g opacity={fade('fruit')} transform="translate(286, 0)">
        <path d="M 0 92 q 2 -22 -1 -40" stroke={FOREST} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        <path d="M -1 62 q -14 -4 -18 -12 q 15 -3 19 9 Z" fill={SAGE} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
        {/* the fruit, cut open so the seeds show */}
        <circle cx={12} cy={40} r={20} fill={RED} stroke={INK} strokeWidth={1.7} />
        <path d="M 12 20 a 20 20 0 0 1 0 40 Z" fill="#E4685A" stroke={INK} strokeWidth={1.2} />
        {[[16, 30], [22, 40], [16, 50], [9, 34], [9, 47]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx={2.4} ry={3.2} fill="#F5E6B8" stroke={INK} strokeWidth={0.8} />
        ))}
        {/* the flower it came from */}
        <g transform="translate(-16, 22)">
          {[0, 72, 144, 216, 288].map(a => (
            <ellipse key={a} cx={0} cy={-5} rx={3} ry={5} fill={GOLD} stroke={INK} strokeWidth={0.8}
                     transform={`rotate(${a})`} />
          ))}
          <circle cx={0} cy={0} r={2.2} fill="#E8A33C" stroke={INK} strokeWidth={0.8} />
        </g>
        {on('fruit') && (
          <>
            <Arrow d="M -10 30 q 8 2 14 6" color={RED} width={1.7} />
            <Head x={5} y={36.5} angle={30} size={4.6} />
            <Tag x={-2} y={84} text="FRUIT + seeds" tone="#FFE2CC" />
          </>
        )}
      </g>
    </svg>
  );
}

// ─── 4. Water cycle ─────────────────────────────────────────────────

function WaterCycle({ highlight }: { highlight?: string }) {
  const hot = (k: string) => highlight === k;
  const arrowCol = (k: string) => (hot(k) ? RED : '#9A8A78');
  return (
    <svg viewBox="0 0 340 200" className={VB}>
      <defs>
        <linearGradient id="fvWcSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CFE2F0" />
          <stop offset="100%" stopColor="#EAF2E2" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={340} height={200} rx={10} fill="url(#fvWcSky)" stroke={INK} strokeWidth={1.6} />

      {/* sun */}
      <circle cx={44} cy={34} r={18} fill={GOLD} stroke={INK} strokeWidth={1.5} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
        <line key={a} x1={44 + 22 * Math.cos(a * Math.PI / 180)} y1={34 + 22 * Math.sin(a * Math.PI / 180)}
              x2={44 + 28 * Math.cos(a * Math.PI / 180)} y2={34 + 28 * Math.sin(a * Math.PI / 180)}
              stroke={GOLD} strokeWidth={2} strokeLinecap="round" />
      ))}

      {/* sea */}
      <path d="M 0 158 q 42 -6 84 -1 q 24 4 34 15 l 0 28 L 0 200 Z" fill={WATER} stroke={INK} strokeWidth={1.5} />
      <path d="M 10 168 q 12 -5 24 0 M 40 176 q 12 -5 24 0" stroke={CREAM} strokeWidth={1.2} fill="none" opacity={0.8} />
      {hot('collection') && <Tag x={44} y={190} text="collection" tone="#FFE2CC" />}

      {/* evaporation */}
      <g>
        <Arrow d="M 76 152 q 10 -34 22 -56" color={arrowCol('evaporation')} width={hot('evaporation') ? 3 : 2} />
        <Head x={98} y={96} angle={-70} color={arrowCol('evaporation')} />
        <Arrow d="M 100 156 q 6 -28 14 -46" color={arrowCol('evaporation')} width={hot('evaporation') ? 2.6 : 1.8} />
        <Head x={114} y={110} angle={-68} color={arrowCol('evaporation')} size={5} />
        {hot('evaporation') && <Tag x={78} y={124} text="evaporation" tone="#FFE2CC" />}
      </g>

      {/* cloud */}
      <g opacity={hot('condensation') ? 1 : 0.92}>
        <Puff x={172} y={70} s={1.15} fill={hot('condensation') ? '#E6EDF2' : CREAM} />
        {hot('condensation') && (
          <>
            {[[158, 66], [168, 74], [180, 66], [188, 74]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={2.4} fill={DEEP_WATER} stroke={INK} strokeWidth={0.7} />
            ))}
            <Tag x={172} y={30} text="condensation" tone="#FFE2CC" />
          </>
        )}
      </g>

      {/* precipitation */}
      <g>
        {[156, 172, 188, 204].map((x, i) => (
          <line key={x} x1={x} y1={88 + (i % 2) * 4} x2={x - 5} y2={118 + (i % 2) * 4}
                stroke={hot('precipitation') ? RED : DEEP_WATER}
                strokeWidth={hot('precipitation') ? 2.4 : 1.8} strokeLinecap="round" />
        ))}
        {hot('precipitation') && <Tag x={252} y={128} text="precipitation" tone="#FFE2CC" />}
      </g>

      {/* hill + river running back to the sea */}
      <path d="M 116 172 q 40 -46 92 -50 q 60 -4 132 -30 L 340 200 L 116 200 Z" fill={FOREST} opacity={0.55} stroke={INK} strokeWidth={1.4} />
      <path d="M 236 108 q -18 26 -46 40 q -34 16 -74 24" stroke={WATER} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M 236 108 q -18 26 -46 40 q -34 16 -74 24" stroke={DEEP_WATER} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.7} />
      <Head x={120} y={172} angle={196} color={arrowCol('collection')} size={7} />

      {/* a couple of trees for scale */}
      {[[262, 96], [296, 82]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 1.6} y={y} width={3.2} height={12} fill={BARK} stroke={INK} strokeWidth={0.9} />
          <path d={`M ${x} ${y - 18} l 11 20 l -22 0 Z`} fill={FOREST} stroke={INK} strokeWidth={1.1} strokeLinejoin="round" />
        </g>
      ))}
    </svg>
  );
}

// ─── 5. Gravitropism / phototropism ─────────────────────────────────

function Phototropism({ stage }: { stage: number }) {
  const dark = stage === 1;
  return (
    <svg viewBox="0 0 340 200" className={VB}>
      <rect x={0} y={0} width={340} height={200} rx={10}
            fill={dark ? '#3B3A46' : '#DCEAF3'} stroke={INK} strokeWidth={1.6} />

      {dark ? (
        <>
          <Tag x={252} y={28} text="dark cupboard" tone="#F0EDE4" />
          {/* gravity arrow — the only cue it has */}
          <Arrow d="M 60 46 L 60 148" color={CREAM} width={2.2} dashed />
          <Head x={60} y={150} angle={90} color={CREAM} />
          <text x={60} y={172} textAnchor="middle" fontSize={9.5} fontStyle="italic" fill={CREAM}>gravity</text>
        </>
      ) : (
        <>
          {/* window with light streaming from the left */}
          <rect x={6} y={30} width={40} height={100} rx={4} fill="#FFF6D6" stroke={INK} strokeWidth={1.5} />
          <line x1={26} y1={30} x2={26} y2={130} stroke={INK} strokeWidth={1.2} />
          <line x1={6} y1={80} x2={46} y2={80} stroke={INK} strokeWidth={1.2} />
          {[46, 66, 86, 106].map(y => (
            <g key={y}>
              <Arrow d={`M 50 ${y} L 118 ${y + 6}`} color={GOLD} width={2.4} />
              <Head x={120} y={y + 6.2} angle={5} color={GOLD} size={5.4} />
            </g>
          ))}
        </>
      )}

      {/* pot + soil */}
      <path d="M 152 148 L 236 148 L 228 194 q -1 6 -7 6 L 167 200 q -6 0 -7 -6 Z"
            fill={TERRA} stroke={INK} strokeWidth={1.7} strokeLinejoin="round" />
      <rect x={148} y={140} width={92} height={12} rx={4} fill="#D8916A" stroke={INK} strokeWidth={1.6} />
      <ellipse cx={194} cy={146} rx={40} ry={5} fill={SOIL} stroke={INK} strokeWidth={1.2} />

      {/* roots — down in both stages */}
      <path d="M 194 150 q -3 16 1 30 M 194 162 q -12 6 -17 15 M 195 172 q 12 6 16 14"
            stroke={CREAM} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.9} />

      {/* the seedling */}
      {stage === 1 ? (
        <>
          <path d="M 194 146 q -2 -30 1 -54" stroke={FOREST} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M 195 100 q -18 -8 -24 -18 q 20 -3 25 12 Z" fill={SAGE} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M 195 100 q 18 -8 24 -18 q -20 -3 -25 12 Z" fill={SAGE} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          <Tag x={252} y={92} text="still up. no light." tone="#F0EDE4" />
        </>
      ) : (
        <>
          <motion.path
            d="M 194 146 q -6 -26 -22 -40"
            stroke={FOREST} strokeWidth={4} fill="none" strokeLinecap="round"
            initial={{ pathLength: 0.4 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }}
          />
          <path d="M 172 106 q -20 -4 -28 -12 q 20 -6 28 4 Z" fill={SAGE} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M 174 108 q -6 18 -18 24 q -4 -18 12 -24 Z" fill={SAGE} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          {/* auxin gathering on the SHADY side, cells stretching longer */}
          {[[190, 128], [186, 118], [182, 108], [180, 98]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3} fill={RED} stroke={INK} strokeWidth={0.9} opacity={0.85} />
          ))}
          <Arrow d="M 246 118 q -28 -2 -50 4" color={RED} width={1.8} />
          <Head x={195} y={122.6} angle={172} size={5} />
          <Tag x={276} y={118} text="auxin — shady side" tone="#FFE2CC" />
          <Tag x={230} y={172} text="these cells stretch longer" tone="#FFE2CC" />
        </>
      )}
    </svg>
  );
}

// ─── 6. Orb web ─────────────────────────────────────────────────────

function SpiderWeb({ stage }: { stage: number }) {
  const CX = 172, CY = 112, R = 66;
  const SPOKES = 12;
  // Irregular radii — a real orb web is never a perfect circle, and the
  // frame is anchored at whatever the spoke reached.
  const rOf = (i: number) => R * (0.86 + 0.14 * Math.abs(Math.sin(i * 2.1)));
  const aOf = (i: number) => (i / SPOKES) * Math.PI * 2 - Math.PI / 2;
  const px = (i: number) => CX + rOf(i) * Math.cos(aOf(i));
  const py = (i: number) => CY + rOf(i) * Math.sin(aOf(i));
  const frame = Array.from({ length: SPOKES }, (_, i) =>
    `${i === 0 ? 'M' : 'L'} ${px(i).toFixed(1)} ${py(i).toFixed(1)}`).join(' ') + ' Z';

  // Spiral laid on the same radii so it meets every spoke, from just
  // outside the hub all the way out to the frame.
  const spiral = (() => {
    const pts: string[] = [];
    const turns = 5;
    const steps = turns * SPOKES;
    for (let k = 0; k <= steps; k++) {
      const i = k % SPOKES;
      const t = k / steps;
      const r = (0.18 + 0.8 * t) * rOf(i);
      const a = aOf(i);
      pts.push(`${k === 0 ? 'M' : 'L'} ${(CX + r * Math.cos(a)).toFixed(1)} ${(CY + r * Math.sin(a)).toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  return (
    <svg viewBox="0 0 340 200" className={VB}>
      <rect x={0} y={0} width={340} height={200} rx={10} fill="#E7EEE0" stroke={INK} strokeWidth={1.6} />
      {/* two twigs to hang it between */}
      <path d="M 8 20 q 32 10 48 34 M 44 30 q 10 -8 22 -8" stroke={BARK} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M 332 24 q -32 12 -46 36 M 296 36 q -10 -8 -22 -6" stroke={BARK} strokeWidth={4} fill="none" strokeLinecap="round" />

      {/* 1. bridge line — the breeze carried it across */}
      <motion.path
        d="M 54 56 q 60 -12 118 -10 q 58 2 118 10"
        stroke={INK} strokeWidth={1.6} fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }}
      />
      {stage === 1 && (
        <>
          <path d="M 212 42 q 12 -8 26 -6" stroke={INK} strokeWidth={1} fill="none" strokeDasharray="3 3" />
          <Tag x={256} y={26} text="the breeze carries it" tone={CREAM} />
          <Tag x={100} y={82} text="bridge line" tone={CREAM} />
        </>
      )}

      {/* 2. frame — hung off the bridge line, anchored to both twigs */}
      {stage >= 2 && (
        <>
          <path d={frame} stroke={INK} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
          <path d={`M 54 56 L ${px(9).toFixed(1)} ${py(9).toFixed(1)} M 290 56 L ${px(3).toFixed(1)} ${py(3).toFixed(1)}`}
                stroke={INK} strokeWidth={1.2} fill="none" opacity={0.75} />
        </>
      )}

      {/* 3. spokes — dry silk, her walkway; they STOP at the frame */}
      {stage >= 3 && Array.from({ length: SPOKES }).map((_, i) => (
        <line key={i} x1={CX} y1={CY} x2={px(i)} y2={py(i)} stroke={INK} strokeWidth={1.3} opacity={0.9} />
      ))}

      {/* 4. spiral — the only sticky part, running out to the frame */}
      {stage >= 4 && (
        <motion.path
          d={spiral} stroke={DEEP_WATER} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6 }}
        />
      )}

      {/* the builder, at the hub */}
      {stage >= 3 && (
        <g transform={`translate(${CX}, ${CY})`}>
          {[35, 70, 110, 145, 215, 250, 290, 325].map(a => (
            <path key={a} d="M 0 0 q 8 -3 13 4" stroke={INK} strokeWidth={1.4} fill="none"
                  strokeLinecap="round" transform={`rotate(${a})`} />
          ))}
          <ellipse cx={0} cy={3} rx={7} ry={8} fill="#7A5A3A" stroke={INK} strokeWidth={1.4} />
          <ellipse cx={0} cy={-1} rx={3} ry={3} fill="#5A3B1F" />
          <path d="M -3 1 q 3 3 6 0" stroke={CREAM} strokeWidth={1} fill="none" opacity={0.7} />
          <circle cx={-1.6} cy={-6} r={1} fill={INK} />
          <circle cx={1.6} cy={-6} r={1} fill={INK} />
        </g>
      )}

      {stage === 3 && <Tag x={96} y={186} text="spokes — dry, safe to walk" tone={CREAM} />}
      {stage >= 4 && (
        <>
          <Tag x={62} y={186} text="spiral — sticky" tone="#CFE6EA" />
          <Tag x={268} y={186} text="spokes — dry" tone={CREAM} />
        </>
      )}
    </svg>
  );
}

// ─── 7. Photosynthesis ──────────────────────────────────────────────

function Photosynthesis({ highlight }: { highlight?: string }) {
  const hot = (k: string) => highlight === k;
  return (
    <svg viewBox="0 0 340 200" className={VB}>
      <rect x={0} y={0} width={340} height={200} rx={10} fill="#E8F1E2" stroke={INK} strokeWidth={1.6} />

      {/* sun + light in */}
      <circle cx={40} cy={32} r={16} fill={GOLD} stroke={INK} strokeWidth={1.5} opacity={hot('light') ? 1 : 0.75} />
      {[54, 74, 94].map((y, i) => (
        <g key={y} opacity={hot('light') ? 1 : 0.55}>
          <Arrow d={`M ${56 + i * 8} ${y - 6} L ${124 + i * 6} ${y + 18}`} color={GOLD} width={hot('light') ? 3 : 2.2} />
          <Head x={126 + i * 6} y={y + 18.5} angle={20} color={GOLD} size={5.4} />
        </g>
      ))}
      {hot('light') && <Tag x={72} y={116} text="sunlight" tone="#FFF0CF" />}

      {/* the leaf */}
      <g transform="translate(186, 74)">
        {/* one ovate leaf with a midrib — a real leaf silhouette */}
        <path d="M -58 0 Q -34 -32 -2 -34 Q 34 -32 56 -2 Q 32 30 -2 30 Q -34 28 -58 0 Z"
              fill={hot('sugar') ? '#8FC286' : SAGE} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
        <path d="M -58 0 Q -6 -4 56 -2" stroke={INK} strokeWidth={1.5} fill="none" opacity={0.55} />
        {[-38, -18, 2, 22].map((x, i) => (
          <g key={x} opacity={0.32}>
            <path d={`M ${x} ${-1 - i * 0.4} q 8 -12 16 -18`} stroke={INK} strokeWidth={0.9} fill="none" />
            <path d={`M ${x} ${-1 - i * 0.4} q 8 12 15 17`} stroke={INK} strokeWidth={0.9} fill="none" />
          </g>
        ))}
        {/* stomata on the underside */}
        {hot('air') && [-26, -2, 22].map(x => (
          <ellipse key={x} cx={x} cy={20} rx={4} ry={2} fill="none" stroke={RED} strokeWidth={1.4} />
        ))}
      </g>

      {/* CO2 in */}
      <g opacity={hot('air') ? 1 : 0.6}>
        <Arrow d="M 316 40 q -32 22 -58 34" color={hot('air') ? RED : '#9A8A78'} width={hot('air') ? 2.6 : 1.9} />
        <Head x={256} y={75} angle={148} color={hot('air') ? RED : '#9A8A78'} size={5.6} />
        <Tag x={278} y={24} text="CO₂ from air" tone={hot('air') ? '#FFE2CC' : CREAM} />
      </g>

      {/* O2 out */}
      <g>
        <Arrow d="M 244 96 q 38 14 68 28" color={hot('sugar') ? RED : DEEP_WATER} width={hot('sugar') ? 2.6 : 2} />
        <Head x={314} y={125} angle={22} color={hot('sugar') ? RED : DEEP_WATER} size={5.6} />
        <Tag x={252} y={148} text="O₂ out — you breathe it" tone={hot('sugar') ? '#FFE2CC' : CREAM} />
      </g>

      {/* stem, soil, roots pulling water up */}
      <path d="M 0 158 L 340 158 L 340 190 q 0 10 -10 10 L 10 200 q -10 0 -10 -10 Z" fill={SOIL} stroke={INK} strokeWidth={1.5} />
      <path d="M 190 158 q 0 -30 -2 -54" stroke={FOREST} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M 190 160 q -3 16 1 28 M 190 172 q -14 6 -19 14 M 191 180 q 14 6 18 14"
            stroke={CREAM} strokeWidth={2} fill="none" strokeLinecap="round" />
      {(hot('water') || !highlight) && (
        <g opacity={hot('water') ? 1 : 0.55}>
          {[176, 160, 144].map((y, i) => (
            <circle key={y} cx={188 + i} cy={y} r={2.6} fill={DEEP_WATER} stroke={INK} strokeWidth={0.8} />
          ))}
          <Arrow d="M 188 178 q 3 -24 5 -48" color={hot('water') ? RED : DEEP_WATER} width={hot('water') ? 2.4 : 1.6} />
          <Head x={194} y={128} angle={-82} color={hot('water') ? RED : DEEP_WATER} size={5.2} />
          {hot('water') && <Tag x={112} y={172} text="water up from the roots" tone="#FFE2CC" />}
        </g>
      )}

      {/* the product */}
      {hot('sugar') && (
        <g>
          <Tag x={130} y={166} text="sugar — the plant's food" tone="#FFF0CF" />
          <Arrow d="M 148 156 q 20 -22 34 -44" color={RED} width={1.8} />
          <Head x={184} y={110} angle={-58} size={5} />
        </g>
      )}
    </svg>
  );
}

// ─── 8. Punnett square ──────────────────────────────────────────────

function Punnett({ top, side, cells, caption }: { top: [string, string]; side: [string, string]; cells: string[]; caption: string }) {
  const S = 46, X0 = 128, Y0 = 46;
  const isWhite = (g: string) => !g.includes('P');
  const chip = (letter: string, cx: number, cy: number) => (
    <g>
      <circle cx={cx} cy={cy} r={13} fill={letter === 'W' ? CREAM : '#9B6FB0'} stroke={INK} strokeWidth={1.5} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={12} fontWeight={800}
            fill={letter === 'W' ? INK : CREAM}>{letter}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 340 200" className={VB}>
      <rect x={0} y={0} width={340} height={200} rx={10} fill="#F3EFE2" stroke={INK} strokeWidth={1.6} />

      {/* one parent's two gametes across the top, the other's down the
          side — these are what actually combine in each cell */}
      {top.map((g, i) => <g key={`t${i}`}>{chip(g, X0 + S / 2 + i * S, Y0 - 20)}</g>)}
      {side.map((g, i) => <g key={`s${i}`}>{chip(g, X0 - 22, Y0 + S / 2 + i * S)}</g>)}

      {cells.map((g, i) => {
        const cx = X0 + (i % 2) * S, cy = Y0 + Math.floor(i / 2) * S;
        return (
          <g key={i}>
            <rect x={cx} y={cy} width={S} height={S} fill={CREAM} stroke={INK} strokeWidth={1.6} />
            <g transform={`translate(${cx + S / 2}, ${cy + 17})`}>
              {[0, 72, 144, 216, 288].map(a => (
                <ellipse key={a} cx={0} cy={-6} rx={3.4} ry={6}
                         fill={isWhite(g) ? CREAM : '#9B6FB0'} stroke={INK} strokeWidth={1}
                         transform={`rotate(${a})`} />
              ))}
              <circle cx={0} cy={0} r={2.6} fill={GOLD} stroke={INK} strokeWidth={0.9} />
            </g>
            <text x={cx + S / 2} y={cy + S - 7} textAnchor="middle" fontSize={11} fontWeight={800} fill={INK}>{g}</text>
          </g>
        );
      })}

      <g transform="translate(28, 60)">
        <circle cx={0} cy={0} r={9} fill="#9B6FB0" stroke={INK} strokeWidth={1.3} />
        <text x={0} y={4} textAnchor="middle" fontSize={10} fontWeight={800} fill={CREAM}>P</text>
        <text x={16} y={4} fontSize={9} fontWeight={600} fill={INK}>purple</text>
        <text x={16} y={15} fontSize={7.5} fontStyle="italic" fill={INK} opacity={0.7}>dominant</text>
        <circle cx={0} cy={40} r={9} fill={CREAM} stroke={INK} strokeWidth={1.3} />
        <text x={0} y={44} textAnchor="middle" fontSize={10} fontWeight={800} fill={INK}>W</text>
        <text x={16} y={44} fontSize={9} fontWeight={600} fill={INK}>white</text>
        <text x={16} y={55} fontSize={7.5} fontStyle="italic" fill={INK} opacity={0.7}>recessive</text>
      </g>

      <Tag x={170} y={182} text={caption} tone="#FFF0CF" w={Math.min(322, caption.length * 6.2 + 16)} />
    </svg>
  );
}

// ─── 9. Butterfly vs moth ───────────────────────────────────────────

function MothButterfly({ highlight }: { highlight?: string }) {
  const ring = (cx: number, cy: number, rx: number, ry: number) => (
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={RED} strokeWidth={2}
             strokeDasharray="5 4" opacity={0.9} />
  );
  return (
    <svg viewBox="0 0 340 200" className={VB}>
      <rect x={0} y={0} width={170} height={200} rx={10} fill="#E4F0F6" stroke={INK} strokeWidth={1.6} />
      <rect x={170} y={0} width={170} height={200} rx={10} fill="#3E4257" stroke={INK} strokeWidth={1.6} />
      <text x={85} y={20} textAnchor="middle" fontSize={11} fontWeight={800} fill={INK}>BUTTERFLY · day</text>
      <text x={255} y={20} textAnchor="middle" fontSize={11} fontWeight={800} fill={CREAM}>MOTH · night</text>

      {/* — butterfly: wings up over the back, slim body, clubbed antennae — */}
      <g transform="translate(85, 112)">
        {/* wings held UP over the back, praying-hands style */}
        <path d="M -3 26 q -30 -14 -27 -44 q 20 -14 25 10 Z" fill={TERRA} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M 3 26 q 30 -14 27 -44 q -20 -14 -25 10 Z" fill={TERRA} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
        <circle cx={-17} cy={-6} r={3.6} fill={CREAM} stroke={INK} strokeWidth={1} />
        <circle cx={17} cy={-6} r={3.6} fill={CREAM} stroke={INK} strokeWidth={1} />
        {/* slim body */}
        <ellipse cx={0} cy={8} rx={4} ry={19} fill="#6B4423" stroke={INK} strokeWidth={1.4} />
        <ellipse cx={0} cy={-13} rx={4.6} ry={5} fill="#6B4423" stroke={INK} strokeWidth={1.4} />
        {/* clubbed antennae — drawn LAST and reaching above the wings,
            because this is the clue the lesson actually teaches */}
        <path d="M -3 -17 q -9 -12 -15 -20" stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
        <path d="M 3 -17 q 9 -12 15 -20" stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
        <circle cx={-18.6} cy={-38} r={4} fill={INK} />
        <circle cx={18.6} cy={-38} r={4} fill={INK} />
        {highlight === 'antennae' && ring(0, -32, 30, 15)}
        {highlight === 'wings' && ring(0, 2, 36, 30)}
        {highlight === 'body' && ring(0, 4, 12, 26)}
      </g>
      <Tag x={85} y={182} text="antennae end in knobs" tone={CREAM} />

      {/* — moth: wings flat/roofed, furry stout body, feathery antennae — */}
      <g transform="translate(255, 112)">
        <path d="M -4 10 q -40 -6 -46 -26 q 26 -22 44 4 Z" fill="#A98C6B" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M 4 10 q 40 -6 46 -26 q -26 -22 -44 4 Z" fill="#A98C6B" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M -34 -12 q 10 4 18 0 M 34 -12 q -10 4 -18 0" stroke={INK} strokeWidth={1} fill="none" opacity={0.6} />
        {/* stout furry body — a coat for cold nights */}
        <ellipse cx={0} cy={0} rx={7} ry={19} fill="#8A6A4A" stroke={INK} strokeWidth={1.4} />
        {[-12, -6, 0, 6, 12].map(y => (
          <g key={y}>
            <path d={`M -7 ${y} q -5 -2 -8 -4`} stroke={INK} strokeWidth={1} fill="none" strokeLinecap="round" />
            <path d={`M 7 ${y} q 5 -2 8 -4`} stroke={INK} strokeWidth={1} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {/* feathery antennae — no knob anywhere */}
        {[-1, 1].map(s => (
          <g key={s}>
            <path d={`M ${s * 2} -16 q ${s * 12} -12 ${s * 20} -18`} stroke={INK} strokeWidth={1.5} fill="none" strokeLinecap="round" />
            {[0.25, 0.45, 0.65, 0.85].map(t => {
              const x = s * 2 + s * 20 * t, y = -16 - 18 * t;
              return (
                <g key={t}>
                  <path d={`M ${x} ${y} l ${s * 4} -5`} stroke={INK} strokeWidth={1} strokeLinecap="round" />
                  <path d={`M ${x} ${y} l ${s * 4} 4`} stroke={INK} strokeWidth={1} strokeLinecap="round" />
                </g>
              );
            })}
          </g>
        ))}
        {highlight === 'antennae' && ring(0, -30, 32, 16)}
        {highlight === 'wings' && ring(0, -6, 52, 26)}
        {highlight === 'body' && ring(0, 0, 14, 24)}
      </g>
      <Tag x={255} y={182} text="feathery — no knobs" tone={CREAM} />

      {/* moon + a couple of stars on the night side */}
      <path d="M 316 40 a 11 11 0 1 1 -9 -13 a 9 9 0 0 0 9 13 Z" fill={GOLD} stroke={INK} strokeWidth={1.2} />
      {[[196, 44], [212, 62], [186, 74]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.6} fill={CREAM} opacity={0.8} />
      ))}
    </svg>
  );
}

// ─── 10. Autumn leaf ────────────────────────────────────────────────

function LeafColor({ stage }: { stage: number }) {
  const body = stage === 1 ? FOREST : stage === 2 ? '#E5B446' : '#C7452F';
  const LEAF = `M 0 46 q -8 -30 -34 -40 q 8 -12 -2 -24 q 16 6 24 -2 q -2 -18 12 -26
                q 14 8 12 26 q 8 8 24 2 q -10 12 -2 24 q -26 10 -34 40 Z`;
  return (
    <svg viewBox="0 0 340 200" className={VB}>
      <rect x={0} y={0} width={340} height={200} rx={10} fill="#F2EDE0" stroke={INK} strokeWidth={1.6} />

      {/* the stack of pigments, drawn as three bands that fill in */}
      <g transform="translate(38, 44)">
        <text x={0} y={-12} fontSize={9} fontWeight={700} fill={INK}>inside the leaf</text>
        {[
          { label: 'chlorophyll', c: FOREST, on: stage === 1, note: 'green, expensive' },
          { label: 'carotenoids', c: '#E5B446', on: true, note: 'there all summer' },
          { label: 'anthocyanins', c: '#C7452F', on: stage === 3, note: 'made in autumn' },
        ].map((b, i) => (
          <g key={b.label} transform={`translate(0, ${i * 34})`} opacity={b.on ? 1 : 0.22}>
            <rect x={0} y={0} width={26} height={20} rx={5} fill={b.c} stroke={INK} strokeWidth={1.3} />
            <text x={34} y={10} fontSize={9} fontWeight={700} fill={INK}>{b.label}</text>
            <text x={34} y={20} fontSize={7.5} fontStyle="italic" fill={INK} opacity={0.7}>{b.note}</text>
          </g>
        ))}
      </g>

      {/* the leaf itself */}
      <g transform="translate(248, 74)">
        <motion.path d={LEAF} fill={body} stroke={INK} strokeWidth={1.8} strokeLinejoin="round"
                     animate={{ fill: body }} transition={{ duration: 0.8 }} />
        <line x1={0} y1={46} x2={0} y2={-40} stroke={INK} strokeWidth={1.2} opacity={0.45} />
        <path d="M 0 8 L -26 -6 M 0 8 L 26 -6 M 0 -14 L -20 -28 M 0 -14 L 20 -28"
              stroke={INK} strokeWidth={0.9} fill="none" opacity={0.35} />
        {/* stalk + twig */}
        <path d="M 0 46 q 1 12 2 20" stroke={BARK} strokeWidth={3.4} fill="none" strokeLinecap="round" />
        <path d="M -34 74 q 40 -8 78 2" stroke={BARK} strokeWidth={7} fill="none" strokeLinecap="round" />
        {/* abscission layer — the corky seal */}
        {stage === 3 && (
          <>
            <rect x={-6} y={62} width={16} height={6} rx={3} fill="#7A5A3A" stroke={INK} strokeWidth={1.3} />
            <Arrow d="M -52 96 q 22 -14 44 -28" color={RED} width={1.8} />
            <Head x={-6} y={66} angle={-32} size={5} />
          </>
        )}
      </g>

      {stage === 1 && <Tag x={248} y={172} text="green drowns the gold out" tone="#FFF0CF" />}
      {stage === 2 && <Tag x={248} y={172} text="green fades — gold uncovered" tone="#FFF0CF" />}
      {stage === 3 && <Tag x={196} y={186} text="abscission layer seals the twig" tone="#FFE2CC" />}
    </svg>
  );
}

// ─── 11. Decomposers ────────────────────────────────────────────────

function Decomposers({ stage }: { stage: number }) {
  return (
    <svg viewBox="0 0 340 200" className={VB}>
      <rect x={0} y={0} width={340} height={200} rx={10} fill="#EFE7D6" stroke={INK} strokeWidth={1.6} />
      {/* leaf litter still drifting down */}
      {[[40, 22, -20], [96, 14, 30], [268, 26, 14], [206, 12, -35]].map(([x, y, r], i) => (
        <path key={i} d="M 0 0 q -7 -8 0 -16 q 7 8 0 16 Z" fill={i % 2 ? '#D8913F' : '#B8642F'}
              stroke={INK} strokeWidth={1} transform={`translate(${x},${y}) rotate(${r})`} />
      ))}

      {/* the fallen log — fades back once the story moves underground */}
      <g transform="translate(0, 6)" opacity={stage === 1 ? 1 : 0.55}>
        <path d="M 40 106 q 100 -14 200 -4 l 0 30 q -110 -10 -200 4 Z" fill={BARK} stroke={INK} strokeWidth={1.7} strokeLinejoin="round" />
        <ellipse cx={40} cy={121} rx={9} ry={16} fill="#A06B36" stroke={INK} strokeWidth={1.6} />
        <ellipse cx={40} cy={121} rx={5} ry={9} fill="none" stroke={INK} strokeWidth={0.9} opacity={0.5} />
        <path d="M 70 112 q 60 -6 120 -2 M 78 126 q 56 -6 110 0" stroke={DARK_BARK} strokeWidth={1} fill="none" opacity={0.45} />
        {[[128, 120], [176, 116], [206, 124]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx={5} ry={3} fill={DARK_BARK} opacity={0.4} />
        ))}
      </g>

      {/* mushrooms — the FRUIT of the fungus */}
      <g opacity={stage === 3 ? 0.55 : 1}>
        {[[92, 106, 1], [112, 110, 0.72], [212, 104, 0.86]].map(([x, y, sc], i) => (
          <g key={i} transform={`translate(${x},${y}) scale(${sc})`}>
            <path d="M -4 0 q -3 14 1 20 q 5 2 8 0 q 3 -8 0 -20 Z" fill={CREAM} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
            <path d="M -17 2 q 4 -18 17 -18 q 13 0 17 18 q -18 6 -34 0 Z" fill="#C4694A" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
            <ellipse cx={-6} cy={-6} rx={3.4} ry={2.2} fill={CREAM} opacity={0.75} />
            <ellipse cx={6} cy={-3} rx={2.6} ry={1.8} fill={CREAM} opacity={0.6} />
          </g>
        ))}
      </g>
      {stage === 1 && (
        <>
          <Tag x={106} y={62} text="fruit of the fungus" tone={CREAM} />
          <Arrow d="M 100 72 q -3 10 -6 16" color={RED} width={1.6} />
          <Head x={93} y={90} angle={116} size={4.6} />
        </>
      )}

      {/* soil, with the real organism spreading through it */}
      <path d="M 0 152 L 340 152 L 340 190 q 0 10 -10 10 L 10 200 q -10 0 -10 -10 Z" fill={SOIL} stroke={INK} strokeWidth={1.5} />
      <line x1={0} y1={152} x2={340} y2={152} stroke={INK} strokeWidth={1.6} />
      <g opacity={stage === 2 ? 1 : 0.6}>
        {[
          'M 40 158 q 30 12 66 6 q 40 -6 76 10 q 34 12 74 4',
          'M 60 174 q 40 10 84 2 q 44 -8 84 8 q 30 8 62 0',
          'M 30 188 q 50 8 104 -2 q 50 -8 108 6 q 32 6 66 0',
        ].map((d, i) => (
          <path key={i} d={d} stroke={CREAM} strokeWidth={stage === 2 ? 1.8 : 1.3} fill="none" strokeLinecap="round" opacity={0.9} />
        ))}
        {[[96, 160], [154, 168], [214, 178], [262, 164], [300, 184]].map(([x, y], i) => (
          <path key={i} d={`M ${x} ${y} q 8 8 2 16 M ${x} ${y} q -10 6 -4 14`}
                stroke={CREAM} strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.7} />
        ))}
      </g>
      {stage === 2 && <Tag x={224} y={192} text="mycelium — the real fungus" tone="#FFE2CC" />}

      {/* stage 3 — the return trip: nutrients rise back into a new plant */}
      {stage === 3 && (
        <>
          {[112, 156, 200].map((x, i) => (
            <g key={x}>
              <Arrow d={`M ${x} 184 q 4 -18 6 -34`} color={RED} width={2} />
              <Head x={x + 6.4} y={148} angle={-78} size={5.4} />
            </g>
          ))}
          <g transform="translate(276, 152)">
            <path d="M 0 0 q -2 -22 1 -40" stroke={FOREST} strokeWidth={4} fill="none" strokeLinecap="round" />
            <path d="M 1 -26 q -18 -8 -24 -18 q 20 -3 25 12 Z" fill={SAGE} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
            <path d="M 1 -34 q 18 -8 24 -18 q -20 -3 -25 12 Z" fill={SAGE} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
            <path d="M 0 2 q -12 6 -16 14 M 1 4 q 12 6 15 13" stroke={CREAM} strokeWidth={1.8} fill="none" strokeLinecap="round" />
          </g>
          <Tag x={132} y={78} text="nutrients go back to the roots" tone="#FFE2CC" />
        </>
      )}

      {/* an earthworm on the crew */}
      <g transform="translate(46, 168)" opacity={stage === 3 ? 0.6 : 1}>
        <path d="M 0 0 q 14 -8 26 0 q 12 8 24 2" stroke="#C48A9A" strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d="M 0 0 q 14 -8 26 0 q 12 8 24 2" stroke={INK} strokeWidth={0.9} fill="none"
              strokeLinecap="round" strokeDasharray="1 6" opacity={0.55} />
        <circle cx={50} cy={2} r={1} fill={INK} />
      </g>
    </svg>
  );
}

// ─── Dispatcher ─────────────────────────────────────────────────────

export default function ForestVisualView({ visual }: { visual: ForestVisual }) {
  switch (visual.kind) {
    case 'cloud_chart':    return <CloudChart highlight={visual.highlight} />;
    case 'germination':    return <Germination stage={visual.stage} />;
    case 'plant_parts':    return <PlantParts highlight={visual.highlight} />;
    case 'water_cycle':    return <WaterCycle highlight={visual.highlight} />;
    case 'phototropism':   return <Phototropism stage={visual.stage} />;
    case 'spider_web':     return <SpiderWeb stage={visual.stage} />;
    case 'photosynthesis': return <Photosynthesis highlight={visual.highlight} />;
    case 'punnett':        return <Punnett top={visual.top} side={visual.side} cells={visual.cells} caption={visual.caption} />;
    case 'moth_butterfly': return <MothButterfly highlight={visual.highlight} />;
    case 'leaf_color':     return <LeafColor stage={visual.stage} />;
    case 'decomposers':    return <Decomposers stage={visual.stage} />;
  }
}
