// app/(child)/garden/grow/EmptyPlotMarker.tsx
//
// Character-driven empty-plot markers, one design per quadrant (no
// generic dashed ellipses). Shared by both grow screens.

'use client';

import type { GardenType } from '@/lib/world/plantCatalog';

export default function EmptyPlotMarker({
  garden, cx, cy, isOpen,
}: {
  garden: GardenType;
  cx: number; cy: number; isOpen: boolean;
}) {
  // Subtle "tap me" affordance — when the quadrant is open, the marker
  // gets a soft golden glow ring. When locked, no glow (the quadrant
  // overlay already shows it's not interactive).
  const glow = isOpen ? (
    <circle cx={cx} cy={cy} r={20} fill="#FFD93D" opacity={0.10} />
  ) : null;

  switch (garden) {
    case 'vegetable':
      // Crumbled soil mound + wooden tag stake. Reads as a freshly
      // dug planting hole waiting for a seed.
      return (
        <g>
          {glow}
          <ellipse cx={cx} cy={cy + 2} rx={20} ry={11} fill="#5C3A1E" opacity={0.55} />
          <ellipse cx={cx} cy={cy} rx={17} ry={8.5} fill="#7A4F2C" stroke="#3F2614" strokeWidth={1.1} />
          <ellipse cx={cx - 3} cy={cy - 1.5} rx={10} ry={3.5} fill="#9C6B3E" opacity={0.6} />
          {/* tag stake on the right side */}
          <line x1={cx + 11} y1={cy - 2} x2={cx + 11} y2={cy - 14}
                stroke="#7B4F2C" strokeWidth={1.6} strokeLinecap="round" />
          <rect x={cx + 4} y={cy - 18} width={14} height={6} rx={1}
                fill="#F0E4CF" stroke="#5A3B1F" strokeWidth={0.7} />
          <line x1={cx + 6} y1={cy - 15} x2={cx + 16} y2={cy - 15}
                stroke="#5A3B1F" strokeWidth={0.5} opacity={0.7} />
        </g>
      );

    case 'flower':
      // Fairy ring of small pebbles around a bare patch.
      return (
        <g>
          {glow}
          <ellipse cx={cx} cy={cy + 1} rx={15} ry={8} fill="#7A8262" opacity={0.55} />
          <ellipse cx={cx} cy={cy} rx={11} ry={5.5} fill="#8FA983" opacity={0.7} />
          {[0, 60, 120, 180, 240, 300].map(deg => {
            const rad = (deg * Math.PI) / 180;
            const px = cx + Math.cos(rad) * 16;
            const py = cy + Math.sin(rad) * 9;
            const r = deg % 120 === 0 ? 3.4 : 2.8;
            return (
              <g key={deg}>
                <ellipse cx={px + 0.4} cy={py + 0.6} rx={r} ry={r * 0.55} fill="#000" opacity={0.18} />
                <ellipse cx={px} cy={py} rx={r} ry={r * 0.55}
                         fill={deg % 60 === 0 ? '#B5A892' : '#A89D8A'}
                         stroke="#6B5D48" strokeWidth={0.5} />
              </g>
            );
          })}
          {/* tiny sprout-stub center hint that something will grow */}
          <path d={`M ${cx} ${cy + 2} L ${cx} ${cy - 2}`}
                stroke="#5C7E4F" strokeWidth={0.9} strokeLinecap="round" opacity={0.6} />
        </g>
      );

    case 'fruit':
      // Planting hole + stake with twine-tied paper tag.
      return (
        <g>
          {glow}
          <ellipse cx={cx + 1} cy={cy + 4} rx={18} ry={9} fill="#3F2614" opacity={0.55} />
          <ellipse cx={cx} cy={cy + 1} rx={15} ry={7} fill="#7A4F2C" stroke="#3F2614" strokeWidth={1.1} />
          <ellipse cx={cx - 2} cy={cy - 0.5} rx={8} ry={3} fill="#9C6B3E" opacity={0.55} />
          {/* stake */}
          <line x1={cx - 9} y1={cy - 2} x2={cx - 9} y2={cy - 18}
                stroke="#7B4F2C" strokeWidth={1.6} strokeLinecap="round" />
          {/* twine */}
          <path d={`M ${cx - 9} ${cy - 16} L ${cx - 2} ${cy - 13}`}
                stroke="#A99878" strokeWidth={0.8} strokeLinecap="round" />
          {/* paper tag, slightly tilted */}
          <g transform={`rotate(-12 ${cx + 2} ${cy - 12})`}>
            <rect x={cx - 2} y={cy - 15} width={11} height={6} rx={0.8}
                  fill="#F0E4CF" stroke="#5A3B1F" strokeWidth={0.6} />
            <line x1={cx} y1={cy - 12} x2={cx + 7} y2={cy - 12}
                  stroke="#5A3B1F" strokeWidth={0.4} opacity={0.65} />
          </g>
        </g>
      );

    case 'japanese':
      // Smooth river stone resting on a moss patch, with a tiny
      // rake-mark sweep arcing past it.
      return (
        <g>
          {glow}
          {/* moss patch */}
          <ellipse cx={cx} cy={cy + 2} rx={18} ry={9} fill="#5C7E4F" opacity={0.55} />
          <ellipse cx={cx - 2} cy={cy + 1} rx={12} ry={5.5} fill="#7BA46F" opacity={0.7} />
          {/* stone */}
          <ellipse cx={cx + 1} cy={cy + 1} rx={11} ry={4.5} fill="#5F5B53" opacity={0.30} />
          <ellipse cx={cx} cy={cy} rx={11} ry={4.5} fill="#9B948A" stroke="#5A3B1F" strokeWidth={0.9} />
          <ellipse cx={cx - 2} cy={cy - 1} rx={5.5} ry={1.6} fill="#C2B5A2" opacity={0.75} />
          {/* small rake-mark sweep arcing past the stone */}
          <path d={`M ${cx - 16} ${cy + 8} Q ${cx} ${cy + 12} ${cx + 16} ${cy + 8}`}
                stroke="#A89878" strokeWidth={0.7} fill="none" opacity={0.6} strokeLinecap="round" />
        </g>
      );

    case 'orchard':
      // Wide planting circle with a pair of tree stakes — a young
      // tree's future home, staked and ready.
      return (
        <g>
          {glow}
          <ellipse cx={cx} cy={cy + 3} rx={21} ry={10} fill="#4A5C3A" opacity={0.4} />
          <ellipse cx={cx} cy={cy + 1} rx={17} ry={8} fill="#7A4F2C" stroke="#3F2614" strokeWidth={1.1} />
          <ellipse cx={cx - 3} cy={cy} rx={9} ry={3.4} fill="#9C6B3E" opacity={0.6} />
          {/* twin tree stakes, angled slightly toward each other */}
          <line x1={cx - 12} y1={cy + 2} x2={cx - 10} y2={cy - 18}
                stroke="#7B4F2C" strokeWidth={1.8} strokeLinecap="round" />
          <line x1={cx + 12} y1={cy + 2} x2={cx + 10} y2={cy - 18}
                stroke="#7B4F2C" strokeWidth={1.8} strokeLinecap="round" />
          {/* twine tie waiting between the stakes */}
          <path d={`M ${cx - 10} ${cy - 12} Q ${cx} ${cy - 9} ${cx + 10} ${cy - 12}`}
                stroke="#A99878" strokeWidth={0.9} fill="none" strokeLinecap="round" />
        </g>
      );

    case 'berry':
      // Soil mound with two arched cane stubs — pruned canes waiting
      // to leaf out along the wire.
      return (
        <g>
          {glow}
          <ellipse cx={cx} cy={cy + 2} rx={18} ry={9.5} fill="#4E3A22" opacity={0.5} />
          <ellipse cx={cx} cy={cy} rx={14.5} ry={7} fill="#6E4A28" stroke="#3F2614" strokeWidth={1.1} />
          <ellipse cx={cx - 2} cy={cy - 1} rx={8} ry={3} fill="#8F6236" opacity={0.6} />
          {/* arched cane stubs */}
          <path d={`M ${cx - 8} ${cy + 1} Q ${cx - 10} ${cy - 12} ${cx - 2} ${cy - 15}`}
                stroke="#6B4B34" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d={`M ${cx + 7} ${cy + 1} Q ${cx + 10} ${cy - 10} ${cx + 3} ${cy - 14}`}
                stroke="#6B4B34" strokeWidth={1.4} fill="none" strokeLinecap="round" />
          {/* a first brave leaf on one cane */}
          <ellipse cx={cx - 2} cy={cy - 15} rx={2.8} ry={1.6} fill="#5C7E4F"
                   stroke="#3D5C32" strokeWidth={0.5} transform={`rotate(-25 ${cx - 2} ${cy - 15})`} />
        </g>
      );

    case 'herb':
      // Little square wooden planter frame set into the bed, corner
      // pegs showing — a kitchen-garden pocket waiting for a seedling.
      return (
        <g>
          {glow}
          <rect x={cx - 15} y={cy - 8} width={30} height={17} rx={2.5}
                fill="#5C3A1E" opacity={0.5} transform={`translate(1.5, 2)`} />
          <rect x={cx - 15} y={cy - 8} width={30} height={17} rx={2.5}
                fill="#8A6238" stroke="#3F2614" strokeWidth={1.1} />
          <rect x={cx - 11.5} y={cy - 4.5} width={23} height={10} rx={1.5}
                fill="#7A4F2C" stroke="#5A3B1F" strokeWidth={0.7} />
          {/* corner pegs */}
          {[[-15, -8], [15, -8], [-15, 9], [15, 9]].map(([dx, dy], i) => (
            <circle key={i} cx={cx + (dx as number)} cy={cy + (dy as number)} r={1.7}
                    fill="#A9774C" stroke="#3F2614" strokeWidth={0.6} />
          ))}
          {/* soil crumbs inside */}
          <ellipse cx={cx - 4} cy={cy + 1} rx={2} ry={0.9} fill="#5C3A1E" opacity={0.6} />
          <ellipse cx={cx + 5} cy={cy - 1} rx={1.6} ry={0.8} fill="#5C3A1E" opacity={0.5} />
        </g>
      );

    case 'moon':
      // Ring of pale moonstones around a silvery patch, with a tiny
      // star sparkle — a bed that waits for nightfall.
      return (
        <g>
          {glow}
          <ellipse cx={cx} cy={cy + 1} rx={16} ry={8.5} fill="#4A4E6B" opacity={0.5} />
          <ellipse cx={cx} cy={cy} rx={11.5} ry={5.8} fill="#8A8FB0" opacity={0.65} />
          {[20, 90, 160, 230, 300].map(deg => {
            const rad = (deg * Math.PI) / 180;
            const px = cx + Math.cos(rad) * 15;
            const py = cy + Math.sin(rad) * 8.5;
            return (
              <g key={deg}>
                <ellipse cx={px + 0.4} cy={py + 0.6} rx={2.8} ry={1.6} fill="#000" opacity={0.2} />
                <ellipse cx={px} cy={py} rx={2.8} ry={1.6}
                         fill="#E4E1EF" stroke="#6B6D8A" strokeWidth={0.5} />
              </g>
            );
          })}
          {/* star sparkle */}
          <path d={`M ${cx} ${cy - 3.5} L ${cx + 1} ${cy - 0.8} L ${cx + 3.6} ${cy}
                    L ${cx + 1} ${cy + 0.8} L ${cx} ${cy + 3.5} L ${cx - 1} ${cy + 0.8}
                    L ${cx - 3.6} ${cy} L ${cx - 1} ${cy - 0.8} Z`}
                fill="#F4F0D8" opacity={0.85} />
        </g>
      );
  }
}
