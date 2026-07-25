// components/child/garden/JapanesePlantStages.tsx
//
// Stage art for the japanese-garden additions — moss (苔), Japanese
// maple (紅葉), chrysanthemum (菊), and wisteria (藤). Same hand-drawn
// language as PlantStageIllustration.tsx: naturalist palette, dark
// bark outlines, slight asymmetry, top-down-ish view sized for a plot.
//
// The bed's own palette runs cooler and more muted than the vegetable
// patch — sage greens, moss, weathered stone — so these lean that way
// too, with the maple's autumn blaze and the wisteria's violet as the
// two deliberate splashes of colour.

'use client';

const STROKE = '#5A3B1F';

interface StageProps { x: number; y: number; size: number; }

// ─── MOSS 苔 ────────────────────────────────────────────────────────────
// A spreading cushion, never a "plant with a stem". Growth reads as the
// patch widening and gaining texture rather than gaining height.

function MossSpore({ x, y, size }: StageProps) {
  const r = size * 0.05;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 5} ry={r * 2.4} fill="#5C4A2E" opacity={0.35} />
      {/* a scatter of spore dust — moss doesn't come from a tidy seed */}
      {[[-3, -1], [0, 0.5], [3.2, -0.8], [1.4, 1.6], [-2, 1.4]].map(([dx, dy], i) => (
        <circle key={i} cx={dx * (size / 48)} cy={dy * (size / 48)} r={r * 0.55}
                fill="#4F6F42" opacity={0.85} />
      ))}
    </g>
  );
}

function mossTufts(r: number, count: number, spreadX: number, spreadY: number, seed = 1) {
  return Array.from({ length: count }).map((_, i) => {
    // deterministic scatter — golden-angle spiral keeps it organic
    const a = i * 2.399 * seed;
    const d = Math.sqrt((i + 1) / count);
    const cx = Math.cos(a) * spreadX * d;
    const cy = Math.sin(a) * spreadY * d;
    return (
      <g key={i}>
        <ellipse cx={cx} cy={cy} rx={r * 0.9} ry={r * 0.6}
                 fill={i % 3 === 0 ? '#6B8E5A' : i % 3 === 1 ? '#7BA46F' : '#5C7E4F'} />
        {/* a couple of upright shoots so it reads as moss, not paint */}
        <line x1={cx - r * 0.3} y1={cy} x2={cx - r * 0.35} y2={cy - r * 1.1}
              stroke="#4F6F42" strokeWidth={0.5} strokeLinecap="round" />
        <line x1={cx + r * 0.25} y1={cy} x2={cx + r * 0.3} y2={cy - r * 0.9}
              stroke="#5C7E4F" strokeWidth={0.5} strokeLinecap="round" />
      </g>
    );
  });
}

function MossPatch({ x, y, size }: StageProps) {
  const s = size / 48;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={1 * s} rx={9 * s} ry={5 * s} fill="#4A3A22" opacity={0.35} />
      {mossTufts(2.6 * s, 5, 6 * s, 3.4 * s)}
    </g>
  );
}

function MossCushion({ x, y, size }: StageProps) {
  const s = size / 48;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={2 * s} rx={14 * s} ry={7.5 * s} fill="#3F5233" opacity={0.4} />
      <ellipse cx={0} cy={0} rx={12.5 * s} ry={6.5 * s} fill="#5C7E4F" />
      {mossTufts(2.8 * s, 11, 10 * s, 5 * s)}
    </g>
  );
}

function MossCarpet({ x, y, size }: StageProps) {
  const s = size / 48;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={3 * s} rx={19 * s} ry={10 * s} fill="#3F5233" opacity={0.4} />
      {/* the cushion swells into a soft green mound */}
      <ellipse cx={0} cy={0} rx={17.5 * s} ry={9 * s} fill="#5C7E4F" />
      <ellipse cx={-3 * s} cy={-1.5 * s} rx={10 * s} ry={4.5 * s} fill="#6B8E5A" opacity={0.8} />
      {mossTufts(3 * s, 20, 15 * s, 7.5 * s)}
      {/* sporophytes — the little stalks moss sends up to release spores */}
      {[[-7, -3], [2, -5], [8, -2], [-2, 2]].map(([dx, dy], i) => (
        <g key={i} transform={`translate(${dx * s}, ${dy * s})`}>
          <line x1={0} y1={0} x2={0.6 * s} y2={-6 * s} stroke="#A88044" strokeWidth={0.7 * s} strokeLinecap="round" />
          <ellipse cx={0.7 * s} cy={-6.6 * s} rx={1.1 * s} ry={1.6 * s}
                   fill="#C9A66A" stroke={STROKE} strokeWidth={0.4} transform={`rotate(18 ${0.7 * s} ${-6.6 * s})`} />
        </g>
      ))}
    </g>
  );
}

// ─── JAPANESE MAPLE 紅葉 ────────────────────────────────────────────────
// The signature is the LEAF: five pointed lobes, "frog's hand". Early
// stages are green; the mature stage is the autumn blaze.

function momijiLeaf(cx: number, cy: number, r: number, fill: string, rot = 0, key?: number) {
  // five slim lobes radiating from a point, plus a short stem
  return (
    <g key={key} transform={`translate(${cx}, ${cy}) rotate(${rot})`}>
      {[-64, -32, 0, 32, 64].map(a => (
        <path key={a}
          d={`M 0 0 Q ${Math.sin(a * Math.PI / 180) * r * 0.4} ${-r * 0.55}
                     ${Math.sin(a * Math.PI / 180) * r} ${-Math.cos(a * Math.PI / 180) * r}
              Q ${Math.sin(a * Math.PI / 180) * r * 0.55} ${-r * 0.5} 0 0 Z`}
          fill={fill} stroke={STROKE} strokeWidth={0.5} strokeLinejoin="round" />
      ))}
      <line x1={0} y1={0} x2={0} y2={r * 0.45} stroke="#7B4F2C" strokeWidth={0.6} strokeLinecap="round" />
    </g>
  );
}

function MomijiSeed({ x, y, size }: StageProps) {
  // a samara — the winged "helicopter" seed maples actually drop
  const s = size / 48;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={1 * s} rx={7 * s} ry={3 * s} fill="#5C4A2E" opacity={0.35} />
      <g transform={`rotate(-18)`}>
        <ellipse cx={-1.5 * s} cy={0} rx={2 * s} ry={1.6 * s} fill="#8B5A2B" stroke={STROKE} strokeWidth={0.5} />
        <path d={`M 0 -0.6 Q ${6 * s} ${-3 * s} ${9 * s} ${-0.5 * s} Q ${5 * s} ${1 * s} 0 ${0.8 * s} Z`}
              fill="#C9A66A" stroke={STROKE} strokeWidth={0.5} strokeLinejoin="round" opacity={0.9} />
      </g>
    </g>
  );
}

function MomijiSprout({ x, y, size }: StageProps) {
  const h = size * 0.2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.17} ry={size * 0.04} fill="#5C4A2E" opacity={0.4} />
      <line x1={0} y1={size * 0.05} x2={0} y2={-h * 0.8} stroke="#7BA46F" strokeWidth={1.4} strokeLinecap="round" />
      {momijiLeaf(-size * 0.07, -h * 0.85, size * 0.09, '#8FB07A', -22)}
      {momijiLeaf(size * 0.07, -h * 0.9, size * 0.08, '#7BA46F', 20)}
    </g>
  );
}

function MomijiTwig({ x, y, size }: StageProps) {
  const h = size * 0.34;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.06} rx={size * 0.18} ry={size * 0.04} fill="#5C4A2E" opacity={0.4} />
      <path d={`M ${-size * 0.022} ${size * 0.06} L ${-size * 0.018} ${-h * 0.85}
                L ${size * 0.018} ${-h * 0.85} L ${size * 0.022} ${size * 0.06} Z`}
            fill="#8B7355" stroke={STROKE} strokeWidth={0.9} />
      <line x1={0} y1={-h * 0.55} x2={size * 0.1} y2={-h * 0.8} stroke="#8B7355" strokeWidth={1.1} strokeLinecap="round" />
      <line x1={0} y1={-h * 0.68} x2={-size * 0.09} y2={-h * 0.92} stroke="#8B7355" strokeWidth={1.1} strokeLinecap="round" />
      {momijiLeaf(size * 0.11, -h * 0.84, size * 0.1, '#7BA46F', 34)}
      {momijiLeaf(-size * 0.1, -h * 0.96, size * 0.1, '#8FB07A', -30)}
      {momijiLeaf(0, -h * 0.92, size * 0.09, '#6B8E5A', 4)}
    </g>
  );
}

function MomijiYoung({ x, y, size }: StageProps) {
  const r = size * 0.25;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 1.0} rx={r * 0.9} ry={r * 0.16} fill="#4A3A22" opacity={0.32} />
      <path d={`M ${-r * 0.11} ${r * 0.9} L ${-r * 0.07} ${-r * 0.15} L ${r * 0.07} ${-r * 0.15} L ${r * 0.11} ${r * 0.9} Z`}
            fill="#8B7355" stroke={STROKE} strokeWidth={1.1} />
      {/* the maple's habit: branches spread wide and low, not a ball */}
      <path d={`M 0 ${-r * 0.1} Q ${-r * 0.5} ${-r * 0.45} ${-r * 0.75} ${-r * 0.4}`}
            stroke="#8B7355" strokeWidth={r * 0.09} fill="none" strokeLinecap="round" />
      <path d={`M 0 ${-r * 0.1} Q ${r * 0.5} ${-r * 0.5} ${r * 0.72} ${-r * 0.42}`}
            stroke="#8B7355" strokeWidth={r * 0.09} fill="none" strokeLinecap="round" />
      {[[-0.78, -0.45, -34], [-0.4, -0.62, -14], [0, -0.7, 2], [0.42, -0.64, 18], [0.76, -0.46, 36]].map(
        ([fx, fy, rot], i) => momijiLeaf(r * (fx as number), r * (fy as number), r * 0.3,
          i % 2 === 0 ? '#7BA46F' : '#8FB07A', rot as number, i),
      )}
    </g>
  );
}

function MomijiBlaze({ x, y, size }: StageProps) {
  const r = size * 0.4;
  const REDS = ['#C8452F', '#D9603A', '#E0894A', '#B2382E'];
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.95} rx={r * 1.0} ry={r * 0.18} fill="#4A3A22" opacity={0.32} />
      <path d={`M ${-r * 0.11} ${r * 0.85} L ${-r * 0.07} ${-r * 0.1} L ${r * 0.07} ${-r * 0.1} L ${r * 0.11} ${r * 0.85} Z`}
            fill="#8B7355" stroke={STROKE} strokeWidth={1.2} />
      {/* wide low branching */}
      <path d={`M 0 ${-r * 0.05} Q ${-r * 0.5} ${-r * 0.4} ${-r * 0.82} ${-r * 0.32}`}
            stroke="#8B7355" strokeWidth={r * 0.09} fill="none" strokeLinecap="round" />
      <path d={`M 0 ${-r * 0.05} Q ${r * 0.5} ${-r * 0.45} ${r * 0.8} ${-r * 0.34}`}
            stroke="#8B7355" strokeWidth={r * 0.09} fill="none" strokeLinecap="round" />
      <path d={`M 0 ${-r * 0.15} Q ${r * 0.08} ${-r * 0.5} ${-r * 0.05} ${-r * 0.72}`}
            stroke="#8B7355" strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />
      {/* the blaze — a crown of crimson hands */}
      {[
        [-0.85, -0.36, -40], [-0.55, -0.58, -22], [-0.22, -0.72, -8],
        [0.1, -0.78, 6], [0.42, -0.68, 20], [0.7, -0.52, 32], [0.86, -0.3, 44],
        [-0.35, -0.3, -16], [0.3, -0.34, 14],
      ].map(([fx, fy, rot], i) =>
        momijiLeaf(r * (fx as number), r * (fy as number), r * 0.28, REDS[i % REDS.length], rot as number, i),
      )}
      {/* two leaves already falling — the whole point of momijigari */}
      {momijiLeaf(-r * 0.62, r * 0.42, r * 0.2, '#D9603A', 58, 90)}
      {momijiLeaf(r * 0.55, r * 0.6, r * 0.18, '#C8452F', -42, 91)}
    </g>
  );
}

// ─── CHRYSANTHEMUM 菊 ───────────────────────────────────────────────────
// The tell is the DENSITY: many narrow petals in layered rings, not the
// eight fat petals of a daisy.

function KikuSeed({ x, y, size }: StageProps) {
  const r = size * 0.055;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4.5} ry={r * 2} fill="#5C4A2E" opacity={0.38} />
      <ellipse cx={0} cy={0} rx={r} ry={r * 1.9} fill="#3F2614" transform="rotate(16)" />
      <line x1={0} y1={-r * 1.8} x2={0} y2={-r * 3} stroke="#A89878" strokeWidth={0.5} strokeLinecap="round" />
    </g>
  );
}

function KikuSprout({ x, y, size }: StageProps) {
  const h = size * 0.2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.17} ry={size * 0.04} fill="#5C4A2E" opacity={0.4} />
      <line x1={0} y1={size * 0.05} x2={0} y2={-h * 0.8} stroke="#6B8E5A" strokeWidth={1.4} strokeLinecap="round" />
      {/* kiku leaves are deeply lobed — little oak-ish paddles */}
      {[[-1, -0.85, -28], [1, -0.9, 26]].map(([dir, fy, rot], i) => (
        <g key={i} transform={`translate(${(dir as number) * size * 0.07}, ${h * (fy as number)}) rotate(${rot})`}>
          <path d={`M 0 0 Q ${-size * 0.04} ${-size * 0.03} ${-size * 0.02} ${-size * 0.07}
                    Q ${0} ${-size * 0.05} ${size * 0.02} ${-size * 0.075}
                    Q ${size * 0.04} ${-size * 0.03} 0 0 Z`}
                fill={i === 0 ? '#8FB07A' : '#7BA46F'} stroke={STROKE} strokeWidth={0.6} strokeLinejoin="round" />
        </g>
      ))}
    </g>
  );
}

function KikuBud({ x, y, size }: StageProps) {
  const h = size * 0.28;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.06} rx={size * 0.18} ry={size * 0.04} fill="#5C4A2E" opacity={0.4} />
      <line x1={0} y1={size * 0.06} x2={0} y2={-h * 0.75} stroke="#6B8E5A" strokeWidth={1.6} strokeLinecap="round" />
      <path d={`M 0 ${-h * 0.3} Q ${-size * 0.09} ${-h * 0.42} ${-size * 0.11} ${-h * 0.2}`}
            stroke="#7BA46F" strokeWidth={1.1} fill="none" strokeLinecap="round" />
      <path d={`M 0 ${-h * 0.45} Q ${size * 0.09} ${-h * 0.58} ${size * 0.11} ${-h * 0.35}`}
            stroke="#7BA46F" strokeWidth={1.1} fill="none" strokeLinecap="round" />
      {/* tight green bud with the first petal tips showing */}
      <circle cx={0} cy={-h * 0.85} r={size * 0.075} fill="#8FB07A" stroke={STROKE} strokeWidth={0.9} />
      {[0, 60, 120, 180, 240, 300].map(a => (
        <line key={a} x1={0} y1={-h * 0.85} x2={Math.cos(a * Math.PI / 180) * size * 0.07}
              y2={-h * 0.85 + Math.sin(a * Math.PI / 180) * size * 0.07}
              stroke="#6B8E5A" strokeWidth={0.6} />
      ))}
      <circle cx={0} cy={-h * 0.85} r={size * 0.03} fill="#E8C05A" opacity={0.75} />
    </g>
  );
}

function KikuBloom({ x, y, size }: StageProps) {
  const r = size * 0.34;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.95} rx={r * 0.62} ry={r * 0.14} fill="#4A3A22" opacity={0.35} />
      <line x1={0} y1={r * 0.9} x2={0} y2={-r * 0.15} stroke="#6B8E5A" strokeWidth={r * 0.1} strokeLinecap="round" />
      {[[-1, 0.45], [1, 0.2]].map(([dir, fy], i) => (
        <path key={i}
          d={`M 0 ${r * (fy as number)} Q ${(dir as number) * r * 0.34} ${r * ((fy as number) - 0.18)}
                     ${(dir as number) * r * 0.42} ${r * ((fy as number) + 0.06)}`}
          stroke="#7BA46F" strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />
      ))}
      {/* three layered rings of narrow petals — the imperial look */}
      {[
        { count: 16, len: 1.0, w: 0.075, fill: '#E8B0C8', off: 0 },
        { count: 16, len: 0.78, w: 0.07, fill: '#F0C4D6', off: 11 },
        { count: 12, len: 0.55, w: 0.065, fill: '#F8DAE6', off: 6 },
      ].map((ring, ri) => (
        <g key={ri}>
          {Array.from({ length: ring.count }).map((_, i) => {
            const a = (i / ring.count) * 360 + ring.off;
            return (
              <ellipse key={i} cx={0} cy={-r * ring.len * 0.5} rx={r * ring.w} ry={r * ring.len * 0.5}
                       fill={ring.fill} stroke="#C98AA8" strokeWidth={0.4}
                       transform={`rotate(${a})`} />
            );
          })}
        </g>
      ))}
      <circle cx={0} cy={0} r={r * 0.15} fill="#E8C05A" stroke="#C99A2E" strokeWidth={0.7} />
      <circle cx={-r * 0.04} cy={-r * 0.04} r={r * 0.05} fill="#F5DE9A" />
    </g>
  );
}

// ─── WISTERIA 藤 ────────────────────────────────────────────────────────
// The tell is the RACEME: long violet chains hanging DOWN. Growth reads
// as the vine climbing its frame, then the flowers cascading.

function FujiSeed({ x, y, size }: StageProps) {
  const r = size * 0.06;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4.5} ry={r * 2} fill="#5C4A2E" opacity={0.38} />
      {/* a flat round bean — wisteria is in the pea family */}
      <circle cx={0} cy={0} r={r * 1.5} fill="#6E5A44" stroke={STROKE} strokeWidth={0.6} />
      <ellipse cx={-r * 0.4} cy={-r * 0.4} rx={r * 0.5} ry={r * 0.3} fill="#9B8468" opacity={0.8} />
    </g>
  );
}

function FujiSprout({ x, y, size }: StageProps) {
  const h = size * 0.22;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.17} ry={size * 0.04} fill="#5C4A2E" opacity={0.4} />
      <path d={`M 0 ${size * 0.05} C ${-size * 0.05} ${-h * 0.3} ${size * 0.05} ${-h * 0.55} 0 ${-h * 0.85}`}
            stroke="#6B8E5A" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      {/* pinnate leaflets — pairs along a stalk */}
      {[-0.5, -0.7].map((fy, i) => (
        <g key={i}>
          <ellipse cx={-size * 0.055} cy={h * fy} rx={size * 0.04} ry={size * 0.022}
                   fill="#7BA46F" stroke={STROKE} strokeWidth={0.5} transform={`rotate(-18 ${-size * 0.055} ${h * fy})`} />
          <ellipse cx={size * 0.055} cy={h * fy} rx={size * 0.04} ry={size * 0.022}
                   fill="#8FB07A" stroke={STROKE} strokeWidth={0.5} transform={`rotate(18 ${size * 0.055} ${h * fy})`} />
        </g>
      ))}
    </g>
  );
}

function FujiVine({ x, y, size }: StageProps) {
  const h = size * 0.36;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.06} rx={size * 0.18} ry={size * 0.04} fill="#5C4A2E" opacity={0.4} />
      {/* a stake, and the vine spiralling round it — the climbing habit */}
      <line x1={0} y1={size * 0.06} x2={0} y2={-h} stroke="#8A6238" strokeWidth={1.6} strokeLinecap="round" />
      <path d={`M ${-size * 0.02} ${size * 0.05}
                C ${size * 0.09} ${-h * 0.2} ${-size * 0.09} ${-h * 0.42} ${size * 0.03} ${-h * 0.62}
                S ${-size * 0.05} ${-h * 0.88} ${0} ${-h * 0.98}`}
            stroke="#6E8A5E" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      {[[-0.3, -1], [-0.55, 1], [-0.8, -1]].map(([fy, dir], i) => (
        <g key={i}>
          <ellipse cx={(dir as number) * size * 0.075} cy={h * (fy as number)} rx={size * 0.045} ry={size * 0.025}
                   fill={i % 2 ? '#7BA46F' : '#8FB07A'} stroke={STROKE} strokeWidth={0.5}
                   transform={`rotate(${(dir as number) * 20} ${(dir as number) * size * 0.075} ${h * (fy as number)})`} />
        </g>
      ))}
    </g>
  );
}

function fujiRaceme(cx: number, cy: number, len: number, w: number, key?: number) {
  // a hanging chain: florets get smaller and paler toward the tip,
  // because a wisteria raceme opens from the top down
  const beads = Math.max(4, Math.round(len / (w * 1.15)));
  return (
    <g key={key}>
      <line x1={cx} y1={cy} x2={cx} y2={cy + len} stroke="#6E8A5E" strokeWidth={0.6} opacity={0.8} />
      {Array.from({ length: beads }).map((_, i) => {
        const t = i / (beads - 1);
        const by = cy + len * t;
        const bw = w * (1 - t * 0.45);
        const fill = t < 0.35 ? '#7E5EA8' : t < 0.7 ? '#9A7BC8' : '#C0AEE0';
        return (
          <g key={i}>
            <ellipse cx={cx - bw * 0.35} cy={by} rx={bw * 0.62} ry={bw * 0.46}
                     fill={fill} stroke="#5E4A84" strokeWidth={0.35} />
            <ellipse cx={cx + bw * 0.35} cy={by + bw * 0.2} rx={bw * 0.55} ry={bw * 0.42}
                     fill={fill} stroke="#5E4A84" strokeWidth={0.35} opacity={0.92} />
          </g>
        );
      })}
    </g>
  );
}

function FujiTrellis({ x, y, size }: StageProps) {
  const s = size / 48;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={13 * s} rx={17 * s} ry={4 * s} fill="#4A3A22" opacity={0.35} />
      {/* pergola frame */}
      <line x1={-13 * s} y1={13 * s} x2={-13 * s} y2={-9 * s} stroke="#8A6238" strokeWidth={2 * s} strokeLinecap="round" />
      <line x1={13 * s} y1={13 * s} x2={13 * s} y2={-9 * s} stroke="#8A6238" strokeWidth={2 * s} strokeLinecap="round" />
      <line x1={-15 * s} y1={-9 * s} x2={15 * s} y2={-9 * s} stroke="#A9774C" strokeWidth={2.2 * s} strokeLinecap="round" />
      {/* vine sprawling along the top beam */}
      <path d={`M ${-13 * s} ${-2 * s} C ${-9 * s} ${-11 * s} ${-3 * s} ${-6 * s} ${1 * s} ${-10 * s}
                S ${10 * s} ${-6 * s} ${13 * s} ${-9 * s}`}
            stroke="#6E8A5E" strokeWidth={1.5 * s} fill="none" strokeLinecap="round" />
      {[[-9, -8], [-3, -7.5], [4, -8], [10, -7.5]].map(([lx, ly], i) => (
        <ellipse key={i} cx={lx * s} cy={ly * s} rx={2.6 * s} ry={1.5 * s}
                 fill={i % 2 ? '#7BA46F' : '#8FB07A'} stroke={STROKE} strokeWidth={0.5}
                 transform={`rotate(${i % 2 ? 18 : -18} ${lx * s} ${ly * s})`} />
      ))}
      {/* first short racemes starting to hang */}
      {fujiRaceme(-6 * s, -6 * s, 9 * s, 2.2 * s, 1)}
      {fujiRaceme(6 * s, -6.5 * s, 7 * s, 2 * s, 2)}
    </g>
  );
}

function FujiCascade({ x, y, size }: StageProps) {
  const s = size / 40;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={15 * s} rx={20 * s} ry={4.5 * s} fill="#4A3A22" opacity={0.35} />
      {/* the heavy old frame — an aged fuji needs propping up */}
      <line x1={-15 * s} y1={15 * s} x2={-15 * s} y2={-11 * s} stroke="#7B5230" strokeWidth={2.6 * s} strokeLinecap="round" />
      <line x1={15 * s} y1={15 * s} x2={15 * s} y2={-11 * s} stroke="#7B5230" strokeWidth={2.6 * s} strokeLinecap="round" />
      <line x1={-18 * s} y1={-11 * s} x2={18 * s} y2={-11 * s} stroke="#A9774C" strokeWidth={2.8 * s} strokeLinecap="round" />
      {/* gnarled trunk twisting up the left post */}
      <path d={`M ${-13 * s} ${15 * s} C ${-17 * s} ${6 * s} ${-11 * s} ${0} ${-14 * s} ${-11 * s}`}
            stroke="#6E5A44" strokeWidth={2.4 * s} fill="none" strokeLinecap="round" />
      {/* canopy of leaves along the beam */}
      {[-13, -8, -3, 2, 7, 12, 16].map((lx, i) => (
        <ellipse key={i} cx={lx * s} cy={(-12.5 + (i % 2)) * s} rx={3 * s} ry={1.7 * s}
                 fill={i % 2 ? '#6B8E5A' : '#7BA46F'} stroke={STROKE} strokeWidth={0.5}
                 transform={`rotate(${i % 2 ? 16 : -16} ${lx * s} ${-12.5 * s})`} />
      ))}
      {/* the waterfall — racemes of staggered length */}
      {fujiRaceme(-12 * s, -9 * s, 19 * s, 2.6 * s, 1)}
      {fujiRaceme(-6.5 * s, -9.5 * s, 24 * s, 2.8 * s, 2)}
      {fujiRaceme(-1 * s, -9 * s, 16 * s, 2.4 * s, 3)}
      {fujiRaceme(4.5 * s, -9.5 * s, 22 * s, 2.7 * s, 4)}
      {fujiRaceme(10 * s, -9 * s, 17 * s, 2.5 * s, 5)}
      {/* a few fallen florets on the ground — fuji drops constantly */}
      {[[-9, 15], [1, 16], [8, 15.5]].map(([fx, fy], i) => (
        <ellipse key={i} cx={fx * s} cy={fy * s} rx={1.5 * s} ry={0.9 * s}
                 fill="#C0AEE0" stroke="#5E4A84" strokeWidth={0.3} opacity={0.85} />
      ))}
    </g>
  );
}

// ─── DISPATCH ───────────────────────────────────────────────────────────

export function JapanesePlantStageIllustration({ code, x, y, size }: { code: string; x: number; y: number; size: number }) {
  switch (code) {
    // moss 苔
    case 'plant_moss_spore':     return <MossSpore x={x} y={y} size={size} />;
    case 'plant_moss_patch':     return <MossPatch x={x} y={y} size={size} />;
    case 'plant_moss_cushion':   return <MossCushion x={x} y={y} size={size} />;
    case 'plant_moss_carpet':    return <MossCarpet x={x} y={y} size={size} />;
    // japanese maple 紅葉
    case 'plant_momiji_seed':    return <MomijiSeed x={x} y={y} size={size} />;
    case 'plant_momiji_sprout':  return <MomijiSprout x={x} y={y} size={size} />;
    case 'plant_momiji_twig':    return <MomijiTwig x={x} y={y} size={size} />;
    case 'plant_momiji_young':   return <MomijiYoung x={x} y={y} size={size} />;
    case 'plant_momiji_blaze':   return <MomijiBlaze x={x} y={y} size={size} />;
    // chrysanthemum 菊
    case 'plant_kiku_seed':      return <KikuSeed x={x} y={y} size={size} />;
    case 'plant_kiku_sprout':    return <KikuSprout x={x} y={y} size={size} />;
    case 'plant_kiku_bud':       return <KikuBud x={x} y={y} size={size} />;
    case 'plant_kiku_bloom':     return <KikuBloom x={x} y={y} size={size} />;
    // wisteria 藤
    case 'plant_fuji_seed':      return <FujiSeed x={x} y={y} size={size} />;
    case 'plant_fuji_sprout':    return <FujiSprout x={x} y={y} size={size} />;
    case 'plant_fuji_vine':      return <FujiVine x={x} y={y} size={size} />;
    case 'plant_fuji_trellis':   return <FujiTrellis x={x} y={y} size={size} />;
    case 'plant_fuji_cascade':   return <FujiCascade x={x} y={y} size={size} />;
    default: return null;
  }
}
