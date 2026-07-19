// components/child/garden/PlantStageIllustration.tsx
//
// Switch-based renderer for plant stages. Same hand-drawn style as
// illustrations.tsx — naturalist palette, dark bark outlines, slight
// asymmetry. Top-down view, sized for the plot grid (40-80 px wide).
//
// Lives in its own file so we don't keep growing illustrations.tsx.
//
// All stages render at translate(x, y) so they slot into the plot at
// the plot's center.

'use client';

const STROKE = '#5A3B1F';

interface Props {
  code: string;
  x: number;
  y: number;
  size: number;
}

interface StageProps { x: number; y: number; size: number; }

// ─── RADISH ─────────────────────────────────────────────────────────────
function RadishSeed({ x, y, size }: StageProps) {
  // Tiny dot in disturbed soil — 5px wide
  const r = size * 0.06;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4} ry={r * 2} fill="#6B4423" opacity={0.35} />
      <circle cx={0} cy={0} r={r} fill="#3F2614" />
    </g>
  );
}

function RadishSprout({ x, y, size }: StageProps) {
  const h = size * 0.2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.18} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      <line x1={0} y1={size * 0.05} x2={0} y2={-h} stroke="#7BA46F" strokeWidth={1.6} strokeLinecap="round" />
      <ellipse cx={-size * 0.05} cy={-h * 0.9} rx={size * 0.05} ry={size * 0.07} fill="#95B88F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(-25 ${-size * 0.05} ${-h * 0.9})`} />
      <ellipse cx={size * 0.05} cy={-h * 0.9} rx={size * 0.05} ry={size * 0.07} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(25 ${size * 0.05} ${-h * 0.9})`} />
    </g>
  );
}

function RadishLeaves({ x, y, size }: StageProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.2} rx={r * 0.55} ry={r * 0.1} fill="#6B4423" opacity={0.38} />
      {[0, 60, 120, 180, 240, 300].map(a => (
        <ellipse key={a} cx={0} cy={-r * 0.25} rx={r * 0.2} ry={r * 0.32} fill="#7BA46F" stroke={STROKE} strokeWidth={1} transform={`rotate(${a})`} />
      ))}
      <circle cx={0} cy={r * 0.05} r={r * 0.06} fill="#5C7E4F" />
    </g>
  );
}

function RadishMature({ x, y, size }: StageProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.4} rx={r * 0.7} ry={r * 0.12} fill="#6B4423" opacity={0.3} />
      {/* leafy tops */}
      {[0, 50, 100, 200, 250, 310].map(a => (
        <ellipse key={a} cx={0} cy={-r * 0.4} rx={r * 0.2} ry={r * 0.4} fill="#7BA46F" stroke={STROKE} strokeWidth={1.1} transform={`rotate(${a})`} />
      ))}
      {/* red bulb peeking from soil */}
      <ellipse cx={0} cy={r * 0.18} rx={r * 0.32} ry={r * 0.36} fill="#C84A3A" stroke={STROKE} strokeWidth={1.4} />
      {/* highlight */}
      <ellipse cx={-r * 0.1} cy={r * 0.1} rx={r * 0.1} ry={r * 0.14} fill="#E6705F" opacity={0.7} />
      {/* root tail */}
      <path d={`M 0 ${r * 0.5} Q ${r * 0.04} ${r * 0.62} 0 ${r * 0.74}`} stroke="#FFFAF2" strokeWidth={1.2} fill="none" strokeLinecap="round" />
    </g>
  );
}

// ─── MINT ───────────────────────────────────────────────────────────────
function MintSeed({ x, y, size }: StageProps) {
  const r = size * 0.06;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4} ry={r * 2} fill="#6B4423" opacity={0.35} />
      <circle cx={0} cy={0} r={r} fill="#3F2614" />
    </g>
  );
}

function MintSprout({ x, y, size }: StageProps) {
  // Single stem with two oval leaves, tiny notch for serration
  const h = size * 0.2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.16} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      <line x1={0} y1={size * 0.05} x2={0} y2={-h} stroke="#7BA46F" strokeWidth={1.4} strokeLinecap="round" />
      {/* left leaf with serration notch */}
      <g transform={`translate(${-size * 0.06},${-h * 0.85}) rotate(-30)`}>
        <ellipse cx={0} cy={0} rx={size * 0.06} ry={size * 0.085} fill="#95B88F" stroke={STROKE} strokeWidth={0.8} />
        <path d={`M ${-size * 0.06} 0 l ${size * 0.012} ${size * 0.012} l ${-size * 0.012} ${size * 0.012}`} fill="#95B88F" stroke={STROKE} strokeWidth={0.6} />
      </g>
      {/* right leaf with serration notch */}
      <g transform={`translate(${size * 0.06},${-h * 0.85}) rotate(30)`}>
        <ellipse cx={0} cy={0} rx={size * 0.06} ry={size * 0.085} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} />
        <path d={`M ${size * 0.06} 0 l ${-size * 0.012} ${size * 0.012} l ${size * 0.012} ${size * 0.012}`} fill="#7BA46F" stroke={STROKE} strokeWidth={0.6} />
      </g>
    </g>
  );
}

function MintYoung({ x, y, size }: StageProps) {
  // Three pairs of opposite leaves on a stem ~30% size
  const h = size * 0.3;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.08} rx={size * 0.2} ry={size * 0.05} fill="#6B4423" opacity={0.35} />
      <line x1={0} y1={size * 0.08} x2={0} y2={-h} stroke="#7BA46F" strokeWidth={1.2} strokeLinecap="round" />
      {[0.25, 0.55, 0.85].map((frac, i) => {
        const ly = -h * frac;
        const angle = i % 2 === 0 ? -32 : -28;
        const angle2 = i % 2 === 0 ? 32 : 28;
        return (
          <g key={frac}>
            <ellipse cx={-size * 0.08} cy={ly} rx={size * 0.07} ry={size * 0.045} fill="#95B88F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(${angle} ${-size * 0.08} ${ly})`} />
            <ellipse cx={size * 0.08} cy={ly} rx={size * 0.07} ry={size * 0.045} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(${angle2} ${size * 0.08} ${ly})`} />
          </g>
        );
      })}
    </g>
  );
}

function MintMature({ x, y, size }: StageProps) {
  // Bushy mound ~70% with rounded leaves
  const r = size * 0.35;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.55} rx={r * 1.1} ry={r * 0.18} fill="#6B4423" opacity={0.3} />
      {/* base mound */}
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.85} fill="#7BA46F" stroke={STROKE} strokeWidth={1.2} />
      {/* clustered round leaves */}
      {[
        { cx: -r * 0.55, cy: -r * 0.2, rot: -18, fill: '#95B88F' },
        { cx: r * 0.45, cy: -r * 0.3, rot: 22, fill: '#95B88F' },
        { cx: -r * 0.2, cy: -r * 0.55, rot: -5, fill: '#A2C794' },
        { cx: r * 0.15, cy: -r * 0.5, rot: 8, fill: '#A2C794' },
        { cx: 0, cy: -r * 0.1, rot: 0, fill: '#7BA46F' },
        { cx: -r * 0.5, cy: r * 0.2, rot: -30, fill: '#5C7E4F' },
        { cx: r * 0.55, cy: r * 0.15, rot: 30, fill: '#5C7E4F' },
      ].map((leaf, i) => (
        <ellipse key={i} cx={leaf.cx} cy={leaf.cy} rx={r * 0.32} ry={r * 0.22} fill={leaf.fill} stroke={STROKE} strokeWidth={1} transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`} />
      ))}
      {/* small midrib hints */}
      <line x1={-r * 0.55} y1={-r * 0.2} x2={-r * 0.85} y2={-r * 0.25} stroke={STROKE} strokeWidth={0.5} opacity={0.5} />
      <line x1={r * 0.45} y1={-r * 0.3} x2={r * 0.7} y2={-r * 0.4} stroke={STROKE} strokeWidth={0.5} opacity={0.5} />
    </g>
  );
}

// ─── LETTUCE ────────────────────────────────────────────────────────────
function LettuceSeed({ x, y, size }: StageProps) {
  const r = size * 0.06;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4} ry={r * 2} fill="#6B4423" opacity={0.35} />
      <circle cx={0} cy={0} r={r} fill="#3F2614" />
    </g>
  );
}

function LettuceSprout({ x, y, size }: StageProps) {
  // Small loose green tuft, looser than mint
  const h = size * 0.18;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.18} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      {[
        { rot: -45, fill: '#95B88F' },
        { rot: -10, fill: '#A2C794' },
        { rot: 25, fill: '#7BA46F' },
        { rot: 50, fill: '#95B88F' },
      ].map((leaf, i) => (
        <ellipse key={i} cx={0} cy={-h * 0.7} rx={size * 0.05} ry={size * 0.09} fill={leaf.fill} stroke={STROKE} strokeWidth={0.7} transform={`rotate(${leaf.rot} 0 ${-h * 0.4})`} />
      ))}
    </g>
  );
}

function LettuceYoung({ x, y, size }: StageProps) {
  // Overlapping wide leaves forming a loose rosette ~50%
  const r = size * 0.25;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.6} rx={r * 1.1} ry={r * 0.18} fill="#6B4423" opacity={0.32} />
      {[0, 60, 120, 180, 240, 300].map((a, i) => (
        <ellipse
          key={a}
          cx={0}
          cy={-r * 0.3}
          rx={r * 0.45}
          ry={r * 0.6}
          fill={i % 2 === 0 ? '#95B88F' : '#A2C794'}
          stroke={STROKE}
          strokeWidth={0.9}
          transform={`rotate(${a + i * 3})`}
        />
      ))}
      <circle cx={0} cy={0} r={r * 0.18} fill="#7BA46F" />
    </g>
  );
}

function LettuceMature({ x, y, size }: StageProps) {
  // Full leafy head ~80% with frilly outer edges
  const r = size * 0.4;
  // Build a ruffly outline path: a circle with little wavelets
  const ruffPath = (radius: number, count: number, amp: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= count; i++) {
      const a = (i / count) * Math.PI * 2;
      const wave = i % 2 === 0 ? radius : radius - amp;
      const px = Math.cos(a) * wave;
      const py = Math.sin(a) * wave;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)}`);
    }
    return pts.join(' ') + ' Z';
  };
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.7} rx={r * 1.15} ry={r * 0.18} fill="#6B4423" opacity={0.3} />
      {/* outer ruffly outline */}
      <path d={ruffPath(r, 24, r * 0.08)} fill="#95B88F" stroke={STROKE} strokeWidth={1.2} />
      {/* overlapping leaves (8) */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
        <ellipse
          key={a}
          cx={0}
          cy={-r * 0.4}
          rx={r * 0.4}
          ry={r * 0.55}
          fill={i % 2 === 0 ? '#A2C794' : '#95B88F'}
          stroke={STROKE}
          strokeWidth={0.9}
          opacity={0.95}
          transform={`rotate(${a + i * 2})`}
        />
      ))}
      {/* inner cluster */}
      <circle cx={0} cy={0} r={r * 0.28} fill="#A2C794" stroke={STROKE} strokeWidth={0.8} />
      <ellipse cx={-r * 0.08} cy={-r * 0.05} rx={r * 0.12} ry={r * 0.18} fill="#C8DDB8" opacity={0.7} />
    </g>
  );
}

// ─── TULIP ──────────────────────────────────────────────────────────────
function TulipBulb({ x, y, size }: StageProps) {
  // Brown ovoid bulb partially buried
  const r = size * 0.12;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.4} rx={r * 1.4} ry={r * 0.3} fill="#6B4423" opacity={0.4} />
      {/* bulb body — half-buried */}
      <ellipse cx={0} cy={0} rx={r} ry={r * 1.3} fill="#7A4A1F" stroke={STROKE} strokeWidth={1} />
      {/* papery skin highlight */}
      <path d={`M ${-r * 0.4} ${-r * 0.6} Q 0 ${-r * 1.1} ${r * 0.4} ${-r * 0.6}`} stroke="#A66838" strokeWidth={0.8} fill="none" opacity={0.7} />
      {/* tiny tip */}
      <line x1={0} y1={-r * 1.3} x2={0} y2={-r * 1.6} stroke="#7BA46F" strokeWidth={0.8} strokeLinecap="round" />
    </g>
  );
}

function TulipSpear({ x, y, size }: StageProps) {
  // Single thin green spear ~25% size
  const h = size * 0.25;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.16} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      {/* spear */}
      <path d={`M 0 ${size * 0.05} L ${-size * 0.025} ${-h * 0.4} L 0 ${-h} L ${size * 0.025} ${-h * 0.4} Z`} fill="#7BA46F" stroke={STROKE} strokeWidth={0.9} />
      {/* highlight */}
      <line x1={0} y1={-h * 0.1} x2={0} y2={-h * 0.85} stroke="#95B88F" strokeWidth={0.6} />
    </g>
  );
}

function TulipBud({ x, y, size }: StageProps) {
  // Taller stem with closed pointed bud
  const h = size * 0.45;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.07} rx={size * 0.18} ry={size * 0.05} fill="#6B4423" opacity={0.35} />
      {/* stem */}
      <line x1={0} y1={size * 0.07} x2={0} y2={-h * 0.7} stroke="#7BA46F" strokeWidth={1.4} strokeLinecap="round" />
      {/* base leaf */}
      <ellipse cx={-size * 0.06} cy={-h * 0.25} rx={size * 0.04} ry={size * 0.18} fill="#5C7E4F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(-15 ${-size * 0.06} ${-h * 0.25})`} />
      {/* closed pointed bud */}
      <path d={`M 0 ${-h * 0.7} Q ${-size * 0.08} ${-h * 0.85} 0 ${-h} Q ${size * 0.08} ${-h * 0.85} 0 ${-h * 0.7} Z`} fill="#C38D9E" stroke={STROKE} strokeWidth={1} />
      {/* center crease */}
      <line x1={0} y1={-h * 0.72} x2={0} y2={-h * 0.95} stroke={STROKE} strokeWidth={0.6} opacity={0.7} />
    </g>
  );
}

function TulipBloom({ x, y, size }: StageProps) {
  // Open tulip from above — 3 petals visible, 2 leaves at base
  const r = size * 0.35;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.7} rx={r * 1.1} ry={r * 0.16} fill="#6B4423" opacity={0.3} />
      {/* base leaves */}
      <ellipse cx={-r * 0.55} cy={r * 0.35} rx={r * 0.16} ry={r * 0.55} fill="#5C7E4F" stroke={STROKE} strokeWidth={1} transform={`rotate(-30 ${-r * 0.55} ${r * 0.35})`} />
      <ellipse cx={r * 0.55} cy={r * 0.35} rx={r * 0.16} ry={r * 0.55} fill="#7BA46F" stroke={STROKE} strokeWidth={1} transform={`rotate(30 ${r * 0.55} ${r * 0.35})`} />
      {/* outer 3 petals (top-down) */}
      {[0, 120, 240].map(a => (
        <ellipse key={a} cx={0} cy={-r * 0.18} rx={r * 0.32} ry={r * 0.5} fill="#E8A87C" stroke={STROKE} strokeWidth={1.1} transform={`rotate(${a})`} />
      ))}
      {/* inner petals slightly offset */}
      {[60, 180, 300].map(a => (
        <ellipse key={a} cx={0} cy={-r * 0.12} rx={r * 0.22} ry={r * 0.36} fill="#C38D9E" stroke={STROKE} strokeWidth={0.9} transform={`rotate(${a})`} />
      ))}
      {/* center */}
      <circle cx={0} cy={0} r={r * 0.12} fill="#5A3B1F" />
      <circle cx={0} cy={0} r={r * 0.06} fill="#FFD93D" />
    </g>
  );
}

// ─── DAISY ──────────────────────────────────────────────────────────────
function DaisySeed({ x, y, size }: StageProps) {
  const r = size * 0.06;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4} ry={r * 2} fill="#6B4423" opacity={0.35} />
      <circle cx={0} cy={0} r={r} fill="#3F2614" />
    </g>
  );
}

function DaisySprout({ x, y, size }: StageProps) {
  const h = size * 0.18;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.16} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      <line x1={0} y1={size * 0.05} x2={0} y2={-h * 0.7} stroke="#7BA46F" strokeWidth={1.4} strokeLinecap="round" />
      <ellipse cx={-size * 0.06} cy={-h * 0.85} rx={size * 0.06} ry={size * 0.04} fill="#95B88F" stroke={STROKE} strokeWidth={0.7} transform={`rotate(-30 ${-size * 0.06} ${-h * 0.85})`} />
      <ellipse cx={size * 0.06} cy={-h * 0.85} rx={size * 0.06} ry={size * 0.04} fill="#7BA46F" stroke={STROKE} strokeWidth={0.7} transform={`rotate(30 ${size * 0.06} ${-h * 0.85})`} />
    </g>
  );
}

function DaisyBud({ x, y, size }: StageProps) {
  // Stem with closed yellow-green bud
  const h = size * 0.4;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.06} rx={size * 0.16} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      <line x1={0} y1={size * 0.06} x2={0} y2={-h * 0.75} stroke="#7BA46F" strokeWidth={1.2} strokeLinecap="round" />
      {/* small base leaves */}
      <ellipse cx={-size * 0.08} cy={-h * 0.2} rx={size * 0.05} ry={size * 0.1} fill="#5C7E4F" stroke={STROKE} strokeWidth={0.7} transform={`rotate(-25 ${-size * 0.08} ${-h * 0.2})`} />
      <ellipse cx={size * 0.08} cy={-h * 0.2} rx={size * 0.05} ry={size * 0.1} fill="#7BA46F" stroke={STROKE} strokeWidth={0.7} transform={`rotate(25 ${size * 0.08} ${-h * 0.2})`} />
      {/* closed bud */}
      <ellipse cx={0} cy={-h * 0.85} rx={size * 0.09} ry={size * 0.13} fill="#D2C77A" stroke={STROKE} strokeWidth={1} />
      {/* sepal hint */}
      <path d={`M ${-size * 0.08} ${-h * 0.78} Q 0 ${-h * 0.7} ${size * 0.08} ${-h * 0.78}`} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} />
    </g>
  );
}

function DaisyBloom({ x, y, size }: StageProps) {
  // 8-12 white petals around yellow center, top-down
  const r = size * 0.4;
  const petalCount = 10;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.8} rx={r * 0.9} ry={r * 0.14} fill="#6B4423" opacity={0.3} />
      {/* base leaves peeking */}
      <ellipse cx={-r * 0.6} cy={r * 0.55} rx={r * 0.18} ry={r * 0.4} fill="#5C7E4F" stroke={STROKE} strokeWidth={0.9} transform={`rotate(-30 ${-r * 0.6} ${r * 0.55})`} />
      <ellipse cx={r * 0.6} cy={r * 0.55} rx={r * 0.18} ry={r * 0.4} fill="#7BA46F" stroke={STROKE} strokeWidth={0.9} transform={`rotate(30 ${r * 0.6} ${r * 0.55})`} />
      {/* petals (shadow layer) */}
      {Array.from({ length: petalCount }).map((_, i) => {
        const a = (i / petalCount) * 360;
        return (
          <ellipse key={`s${i}`} cx={0} cy={-r * 0.55} rx={r * 0.16} ry={r * 0.4} fill="#E8C493" opacity={0.6} transform={`rotate(${a + 4})`} />
        );
      })}
      {/* petals */}
      {Array.from({ length: petalCount }).map((_, i) => {
        const a = (i / petalCount) * 360;
        return (
          <ellipse key={i} cx={0} cy={-r * 0.55} rx={r * 0.15} ry={r * 0.38} fill="#FFFAF2" stroke={STROKE} strokeWidth={0.9} transform={`rotate(${a})`} />
        );
      })}
      {/* center ring */}
      <circle cx={0} cy={0} r={r * 0.26} fill="#E8A87C" stroke={STROKE} strokeWidth={1} />
      <circle cx={0} cy={0} r={r * 0.2} fill="#FFD93D" />
      {/* center stipple */}
      <circle cx={-r * 0.05} cy={-r * 0.04} r={r * 0.025} fill="#E8A87C" />
      <circle cx={r * 0.06} cy={r * 0.05} r={r * 0.025} fill="#E8A87C" />
      <circle cx={0} cy={r * 0.07} r={r * 0.02} fill="#E8A87C" />
    </g>
  );
}

// ─── SUNFLOWER ──────────────────────────────────────────────────────────
function SunflowerSeed({ x, y, size }: StageProps) {
  // Single dark seed (slightly oblong like a real sunflower kernel)
  const r = size * 0.07;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4} ry={r * 2} fill="#6B4423" opacity={0.35} />
      <ellipse cx={0} cy={0} rx={r * 0.7} ry={r * 1.2} fill="#3F2614" stroke={STROKE} strokeWidth={0.6} transform="rotate(15)" />
      <line x1={0} y1={-r} x2={0} y2={r} stroke="#FFFAF2" strokeWidth={0.4} opacity={0.5} transform="rotate(15)" />
    </g>
  );
}

function SunflowerSprout({ x, y, size }: StageProps) {
  const h = size * 0.2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.16} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      <line x1={0} y1={size * 0.05} x2={0} y2={-h} stroke="#7BA46F" strokeWidth={1.4} strokeLinecap="round" />
      <ellipse cx={-size * 0.06} cy={-h * 0.85} rx={size * 0.06} ry={size * 0.08} fill="#95B88F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(-25 ${-size * 0.06} ${-h * 0.85})`} />
      <ellipse cx={size * 0.06} cy={-h * 0.85} rx={size * 0.06} ry={size * 0.08} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(25 ${size * 0.06} ${-h * 0.85})`} />
    </g>
  );
}

function SunflowerStalk({ x, y, size }: StageProps) {
  // Tall thin green stalk with two opposite leaves (no flower) — ~50% width
  const h = size * 0.5;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.06} rx={size * 0.18} ry={size * 0.05} fill="#6B4423" opacity={0.35} />
      <line x1={0} y1={size * 0.06} x2={0} y2={-h} stroke="#7BA46F" strokeWidth={1.6} strokeLinecap="round" />
      {/* two large opposite leaves, top-down view = wide ellipses */}
      <ellipse cx={-size * 0.18} cy={-h * 0.5} rx={size * 0.16} ry={size * 0.09} fill="#5C7E4F" stroke={STROKE} strokeWidth={1.1} transform={`rotate(-20 ${-size * 0.18} ${-h * 0.5})`} />
      <ellipse cx={size * 0.18} cy={-h * 0.5} rx={size * 0.16} ry={size * 0.09} fill="#7BA46F" stroke={STROKE} strokeWidth={1.1} transform={`rotate(20 ${size * 0.18} ${-h * 0.5})`} />
      {/* leaf veins */}
      <line x1={-size * 0.06} y1={-h * 0.5} x2={-size * 0.3} y2={-h * 0.55} stroke={STROKE} strokeWidth={0.5} opacity={0.5} />
      <line x1={size * 0.06} y1={-h * 0.5} x2={size * 0.3} y2={-h * 0.55} stroke={STROKE} strokeWidth={0.5} opacity={0.5} />
    </g>
  );
}

function SunflowerBud({ x, y, size }: StageProps) {
  // Stalk with green bud at top
  const h = size * 0.6;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.06} rx={size * 0.2} ry={size * 0.05} fill="#6B4423" opacity={0.35} />
      <line x1={0} y1={size * 0.06} x2={0} y2={-h * 0.85} stroke="#7BA46F" strokeWidth={1.6} strokeLinecap="round" />
      {/* leaves */}
      <ellipse cx={-size * 0.18} cy={-h * 0.45} rx={size * 0.15} ry={size * 0.08} fill="#5C7E4F" stroke={STROKE} strokeWidth={1} transform={`rotate(-25 ${-size * 0.18} ${-h * 0.45})`} />
      <ellipse cx={size * 0.18} cy={-h * 0.45} rx={size * 0.15} ry={size * 0.08} fill="#7BA46F" stroke={STROKE} strokeWidth={1} transform={`rotate(25 ${size * 0.18} ${-h * 0.45})`} />
      {/* green bud (with sepals) */}
      <circle cx={0} cy={-h * 0.92} r={size * 0.13} fill="#7BA46F" stroke={STROKE} strokeWidth={1.1} />
      {/* sepal points */}
      {[0, 60, 120, 180, 240, 300].map(a => (
        <path key={a} d={`M 0 ${-h * 0.92} l ${size * 0.04} ${-size * 0.04} l ${-size * 0.08} 0 Z`} fill="#5C7E4F" stroke={STROKE} strokeWidth={0.6} transform={`rotate(${a} 0 ${-h * 0.92})`} />
      ))}
      {/* center peeking yellow */}
      <circle cx={0} cy={-h * 0.92} r={size * 0.05} fill="#FFD93D" />
    </g>
  );
}

function SunflowerBloom({ x, y, size }: StageProps) {
  // Large yellow head from above: 14 petals around brown center with seed dots
  const r = size * 0.45;
  const petalCount = 14;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.85} rx={r * 1.0} ry={r * 0.16} fill="#6B4423" opacity={0.3} />
      {/* base leaves peeking */}
      <ellipse cx={-r * 0.7} cy={r * 0.55} rx={r * 0.2} ry={r * 0.45} fill="#5C7E4F" stroke={STROKE} strokeWidth={1} transform={`rotate(-30 ${-r * 0.7} ${r * 0.55})`} />
      <ellipse cx={r * 0.7} cy={r * 0.55} rx={r * 0.2} ry={r * 0.45} fill="#7BA46F" stroke={STROKE} strokeWidth={1} transform={`rotate(30 ${r * 0.7} ${r * 0.55})`} />
      {/* petal shadow ring */}
      {Array.from({ length: petalCount }).map((_, i) => {
        const a = (i / petalCount) * 360;
        return (
          <ellipse key={`s${i}`} cx={0} cy={-r * 0.62} rx={r * 0.13} ry={r * 0.32} fill="#E8A87C" opacity={0.6} transform={`rotate(${a + 4})`} />
        );
      })}
      {/* petals */}
      {Array.from({ length: petalCount }).map((_, i) => {
        const a = (i / petalCount) * 360;
        return (
          <ellipse key={i} cx={0} cy={-r * 0.6} rx={r * 0.12} ry={r * 0.3} fill="#FFD93D" stroke={STROKE} strokeWidth={0.9} transform={`rotate(${a})`} />
        );
      })}
      {/* brown center */}
      <circle cx={0} cy={0} r={r * 0.36} fill="#5A3B1F" stroke={STROKE} strokeWidth={1.1} />
      {/* seed stipple */}
      {[
        [0, 0], [-0.12, -0.06], [0.1, -0.08], [-0.05, 0.12], [0.13, 0.08],
        [-0.18, 0.04], [0.18, -0.04], [0.05, -0.16], [-0.08, -0.16], [0.16, 0.16],
        [-0.16, 0.16], [0.22, 0], [-0.22, 0],
      ].map(([dx, dy], i) => (
        <circle key={i} cx={r * dx} cy={r * dy} r={r * 0.04} fill="#3F2614" />
      ))}
    </g>
  );
}

// ─── APPLE SAPLING ──────────────────────────────────────────────────────
function AppleSeed({ x, y, size }: StageProps) {
  // Single dark teardrop seed
  const r = size * 0.07;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4} ry={r * 2} fill="#6B4423" opacity={0.35} />
      <path d={`M 0 ${-r} Q ${r * 0.6} 0 0 ${r} Q ${-r * 0.6} 0 0 ${-r} Z`} fill="#3F2614" stroke={STROKE} strokeWidth={0.5} />
    </g>
  );
}

function AppleSprout({ x, y, size }: StageProps) {
  // Rounder leaves than radish
  const h = size * 0.2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.18} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      <line x1={0} y1={size * 0.05} x2={0} y2={-h * 0.7} stroke="#7BA46F" strokeWidth={1.4} strokeLinecap="round" />
      <circle cx={-size * 0.06} cy={-h * 0.85} r={size * 0.07} fill="#95B88F" stroke={STROKE} strokeWidth={0.8} />
      <circle cx={size * 0.06} cy={-h * 0.85} r={size * 0.07} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} />
    </g>
  );
}

function AppleTwig({ x, y, size }: StageProps) {
  // Short bare brown twig with maybe 2 leaves
  const h = size * 0.35;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.06} rx={size * 0.18} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      {/* trunk */}
      <path d={`M ${-size * 0.025} ${size * 0.06} L ${-size * 0.02} ${-h * 0.85} L ${size * 0.02} ${-h * 0.85} L ${size * 0.025} ${size * 0.06} Z`} fill="#8B5A2B" stroke={STROKE} strokeWidth={1} />
      {/* twig branches */}
      <line x1={0} y1={-h * 0.6} x2={size * 0.1} y2={-h * 0.85} stroke="#8B5A2B" strokeWidth={1.2} strokeLinecap="round" />
      <line x1={0} y1={-h * 0.7} x2={-size * 0.08} y2={-h * 0.95} stroke="#8B5A2B" strokeWidth={1.2} strokeLinecap="round" />
      {/* 2 leaves */}
      <ellipse cx={size * 0.11} cy={-h * 0.88} rx={size * 0.06} ry={size * 0.04} fill="#7BA46F" stroke={STROKE} strokeWidth={0.7} transform={`rotate(35 ${size * 0.11} ${-h * 0.88})`} />
      <ellipse cx={-size * 0.09} cy={-h * 0.98} rx={size * 0.06} ry={size * 0.04} fill="#95B88F" stroke={STROKE} strokeWidth={0.7} transform={`rotate(-35 ${-size * 0.09} ${-h * 0.98})`} />
    </g>
  );
}

function AppleYoung({ x, y, size }: StageProps) {
  // Small tree ~50% with rounded green canopy on brown trunk
  const r = size * 0.25;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 1.0} rx={r * 0.9} ry={r * 0.16} fill="#6B4423" opacity={0.3} />
      {/* trunk */}
      <path d={`M ${-r * 0.12} ${r * 0.9} L ${-r * 0.08} ${-r * 0.1} L ${r * 0.08} ${-r * 0.1} L ${r * 0.12} ${r * 0.9} Z`} fill="#8B5A2B" stroke={STROKE} strokeWidth={1.1} />
      {/* canopy puffs */}
      <circle cx={-r * 0.45} cy={-r * 0.25} r={r * 0.4} fill="#5C7E4F" stroke={STROKE} strokeWidth={1.1} />
      <circle cx={r * 0.45} cy={-r * 0.25} r={r * 0.4} fill="#7BA46F" stroke={STROKE} strokeWidth={1.1} />
      <circle cx={0} cy={-r * 0.55} r={r * 0.45} fill="#7BA46F" stroke={STROKE} strokeWidth={1.1} />
      {/* highlight */}
      <circle cx={-r * 0.15} cy={-r * 0.65} r={r * 0.12} fill="#A2C794" opacity={0.7} />
    </g>
  );
}

function AppleMature({ x, y, size }: StageProps) {
  // Taller tree with green canopy and one prominent red apple
  const r = size * 0.4;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.95} rx={r * 1.0} ry={r * 0.18} fill="#6B4423" opacity={0.3} />
      {/* trunk */}
      <path d={`M ${-r * 0.12} ${r * 0.85} L ${-r * 0.08} ${-r * 0.05} L ${r * 0.08} ${-r * 0.05} L ${r * 0.12} ${r * 0.85} Z`} fill="#8B5A2B" stroke={STROKE} strokeWidth={1.2} />
      {/* canopy puffs (filled green, outlined dark) */}
      <circle cx={-r * 0.45} cy={-r * 0.2} r={r * 0.42} fill="#5C7E4F" stroke={STROKE} strokeWidth={1.2} />
      <circle cx={r * 0.45} cy={-r * 0.2} r={r * 0.42} fill="#7BA46F" stroke={STROKE} strokeWidth={1.2} />
      <circle cx={-r * 0.15} cy={-r * 0.6} r={r * 0.4} fill="#7BA46F" stroke={STROKE} strokeWidth={1.2} />
      <circle cx={r * 0.2} cy={-r * 0.55} r={r * 0.42} fill="#5C7E4F" stroke={STROKE} strokeWidth={1.2} />
      {/* highlights */}
      <circle cx={-r * 0.25} cy={-r * 0.7} r={r * 0.1} fill="#A2C794" opacity={0.7} />
      {/* prominent red apple */}
      <circle cx={r * 0.25} cy={-r * 0.05} r={r * 0.18} fill="#C84A3A" stroke={STROKE} strokeWidth={1.2} />
      <ellipse cx={r * 0.18} cy={-r * 0.12} rx={r * 0.06} ry={r * 0.08} fill="#E6705F" opacity={0.7} />
      {/* apple stem */}
      <line x1={r * 0.25} y1={-r * 0.22} x2={r * 0.27} y2={-r * 0.3} stroke={STROKE} strokeWidth={0.9} strokeLinecap="round" />
      {/* apple leaf */}
      <ellipse cx={r * 0.32} cy={-r * 0.3} rx={r * 0.06} ry={r * 0.03} fill="#5C7E4F" stroke={STROKE} strokeWidth={0.6} transform={`rotate(40 ${r * 0.32} ${-r * 0.3})`} />
    </g>
  );
}

// ─── BAMBOO ─────────────────────────────────────────────────────────────
function BambooSeed({ x, y, size }: StageProps) {
  const r = size * 0.06;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4.5} ry={r * 2} fill="#6B4423" opacity={0.4} />
      <circle cx={0} cy={0} r={r} fill="#3F2614" />
      {/* tiny scuff marks for soil disturbance */}
      <line x1={-r * 2} y1={r * 0.5} x2={-r * 1.2} y2={r * 0.5} stroke={STROKE} strokeWidth={0.4} opacity={0.5} />
      <line x1={r * 1.2} y1={-r * 0.5} x2={r * 2} y2={-r * 0.5} stroke={STROKE} strokeWidth={0.4} opacity={0.5} />
    </g>
  );
}

function BambooShoot({ x, y, size }: StageProps) {
  // Single thick green shoot pushing up, blunt-tipped
  const h = size * 0.25;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.06} rx={size * 0.18} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      {/* shoot — blunt cone */}
      <path
        d={`M ${-size * 0.06} ${size * 0.06}
            L ${-size * 0.04} ${-h * 0.85}
            Q 0 ${-h * 1.0} ${size * 0.04} ${-h * 0.85}
            L ${size * 0.06} ${size * 0.06} Z`}
        fill="#8CB27A"
        stroke={STROKE}
        strokeWidth={1.1}
      />
      {/* node ring */}
      <line x1={-size * 0.05} y1={-h * 0.4} x2={size * 0.05} y2={-h * 0.4} stroke={STROKE} strokeWidth={0.7} />
      {/* sheath highlight */}
      <line x1={0} y1={-h * 0.2} x2={0} y2={-h * 0.85} stroke="#A2C794" strokeWidth={0.6} />
    </g>
  );
}

function BambooStalk({ x, y, size }: StageProps) {
  // Tall single stalk with 2-3 thin pointed leaves at the top, node rings
  const h = size * 0.55;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.06} rx={size * 0.18} ry={size * 0.04} fill="#6B4423" opacity={0.35} />
      {/* stalk */}
      <path
        d={`M ${-size * 0.04} ${size * 0.06}
            L ${-size * 0.025} ${-h * 0.95}
            L ${size * 0.025} ${-h * 0.95}
            L ${size * 0.04} ${size * 0.06} Z`}
        fill="#8CB27A"
        stroke={STROKE}
        strokeWidth={1}
      />
      {/* node rings */}
      {[0.2, 0.45, 0.7].map(frac => (
        <line key={frac} x1={-size * 0.04} y1={-h * frac} x2={size * 0.04} y2={-h * frac} stroke={STROKE} strokeWidth={0.7} />
      ))}
      {/* 3 thin pointed leaves at the top */}
      <path d={`M 0 ${-h * 0.95} L ${size * 0.18} ${-h * 1.1} L ${size * 0.04} ${-h * 0.92} Z`} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} />
      <path d={`M 0 ${-h * 0.95} L ${-size * 0.18} ${-h * 1.05} L ${-size * 0.04} ${-h * 0.92} Z`} fill="#A2C794" stroke={STROKE} strokeWidth={0.8} />
      <path d={`M 0 ${-h * 0.95} L ${size * 0.04} ${-h * 1.18} L ${-size * 0.04} ${-h * 1.05} Z`} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} />
    </g>
  );
}

function BambooCluster({ x, y, size }: StageProps) {
  // 4-5 stalks clustered, varying heights, leaves at top of each
  const h = size * 0.6;
  const stalks = [
    { dx: -0.18, frac: 0.95, color: '#7BA46F' },
    { dx: -0.06, frac: 1.0, color: '#8CB27A' },
    { dx: 0.06, frac: 0.85, color: '#A2C794' },
    { dx: 0.18, frac: 0.92, color: '#7BA46F' },
    { dx: 0.0, frac: 0.78, color: '#5C7E4F' },
  ];
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.07} rx={size * 0.4} ry={size * 0.06} fill="#6B4423" opacity={0.32} />
      {stalks.map((s, i) => {
        const sx = size * s.dx;
        const top = -h * s.frac;
        return (
          <g key={i}>
            {/* stalk */}
            <path
              d={`M ${sx - size * 0.022} ${size * 0.06}
                  L ${sx - size * 0.018} ${top}
                  L ${sx + size * 0.018} ${top}
                  L ${sx + size * 0.022} ${size * 0.06} Z`}
              fill={s.color}
              stroke={STROKE}
              strokeWidth={0.9}
            />
            {/* node rings */}
            {[0.3, 0.6].map(f => (
              <line key={f} x1={sx - size * 0.025} y1={top * f + size * 0.06 * (1 - f)} x2={sx + size * 0.025} y2={top * f + size * 0.06 * (1 - f)} stroke={STROKE} strokeWidth={0.55} />
            ))}
            {/* a couple of leaves at the top */}
            <path d={`M ${sx} ${top} L ${sx + size * 0.13} ${top - size * 0.08} L ${sx + size * 0.025} ${top - size * 0.005} Z`} fill="#A2C794" stroke={STROKE} strokeWidth={0.7} />
            <path d={`M ${sx} ${top} L ${sx - size * 0.13} ${top - size * 0.06} L ${sx - size * 0.025} ${top - size * 0.005} Z`} fill="#7BA46F" stroke={STROKE} strokeWidth={0.7} />
          </g>
        );
      })}
    </g>
  );
}

// ─── BONSAI ─────────────────────────────────────────────────────────────
function BonsaiSeed({ x, y, size }: StageProps) {
  const r = size * 0.06;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4} ry={r * 2} fill="#6B4423" opacity={0.4} />
      <circle cx={0} cy={0} r={r} fill="#3F2614" />
    </g>
  );
}

function BonsaiSprout({ x, y, size }: StageProps) {
  // Tiny pine sprout — a single needle tuft
  const h = size * 0.2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.16} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      <line x1={0} y1={size * 0.05} x2={0} y2={-h * 0.7} stroke="#5C7E4F" strokeWidth={1.2} strokeLinecap="round" />
      {/* needle tuft — a star of short lines */}
      {[-60, -30, 0, 30, 60].map(a => (
        <line key={a} x1={0} y1={-h * 0.7} x2={0} y2={-h} stroke="#5C7E4F" strokeWidth={0.9} strokeLinecap="round" transform={`rotate(${a} 0 ${-h * 0.7})`} />
      ))}
    </g>
  );
}

function BonsaiYoung({ x, y, size }: StageProps) {
  // Small twisted brown trunk with small green needled crown
  const r = size * 0.25;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.85} rx={r * 0.7} ry={r * 0.13} fill="#6B4423" opacity={0.32} />
      {/* shallow ceramic pot rim hinted */}
      <rect x={-r * 0.55} y={r * 0.55} width={r * 1.1} height={r * 0.28} fill="#5A4533" stroke={STROKE} strokeWidth={1} rx={r * 0.05} />
      {/* twisted trunk — curve */}
      <path d={`M 0 ${r * 0.55} Q ${r * 0.25} ${r * 0.2} ${-r * 0.05} ${-r * 0.05} Q ${-r * 0.25} ${-r * 0.25} ${r * 0.05} ${-r * 0.4}`} stroke="#6B4423" strokeWidth={r * 0.18} fill="none" strokeLinecap="round" />
      {/* small needled crown */}
      <ellipse cx={r * 0.05} cy={-r * 0.5} rx={r * 0.4} ry={r * 0.25} fill="#5C7E4F" stroke={STROKE} strokeWidth={1} />
      <ellipse cx={-r * 0.15} cy={-r * 0.4} rx={r * 0.25} ry={r * 0.18} fill="#7BA46F" stroke={STROKE} strokeWidth={0.9} />
      {/* needle hints */}
      <line x1={r * 0.4} y1={-r * 0.55} x2={r * 0.5} y2={-r * 0.6} stroke={STROKE} strokeWidth={0.5} opacity={0.6} />
      <line x1={-r * 0.35} y1={-r * 0.4} x2={-r * 0.45} y2={-r * 0.42} stroke={STROKE} strokeWidth={0.5} opacity={0.6} />
    </g>
  );
}

function BonsaiMature({ x, y, size }: StageProps) {
  // Bonsai shape: low broad crown of needles spreading horizontally,
  // contorted trunk, in a small ceramic pot
  const r = size * 0.4;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.95} rx={r * 0.95} ry={r * 0.16} fill="#6B4423" opacity={0.3} />
      {/* ceramic pot — trapezoid */}
      <path
        d={`M ${-r * 0.7} ${r * 0.55}
            L ${r * 0.7} ${r * 0.55}
            L ${r * 0.6} ${r * 0.9}
            L ${-r * 0.6} ${r * 0.9} Z`}
        fill="#5A4533"
        stroke={STROKE}
        strokeWidth={1.3}
      />
      {/* pot rim */}
      <line x1={-r * 0.7} y1={r * 0.6} x2={r * 0.7} y2={r * 0.6} stroke={STROKE} strokeWidth={0.9} />
      {/* soil mound at top of pot */}
      <ellipse cx={0} cy={r * 0.55} rx={r * 0.55} ry={r * 0.07} fill="#3F2614" />
      {/* contorted trunk: S-curve from base to crown */}
      <path
        d={`M ${-r * 0.05} ${r * 0.55}
            Q ${r * 0.3} ${r * 0.3} ${-r * 0.1} ${r * 0.05}
            Q ${-r * 0.4} ${-r * 0.15} ${0} ${-r * 0.3}
            Q ${r * 0.3} ${-r * 0.45} ${-r * 0.1} ${-r * 0.45}`}
        stroke="#6B4423"
        strokeWidth={r * 0.16}
        fill="none"
        strokeLinecap="round"
      />
      {/* horizontal broad crown — stacked low ovals (3 tiers) */}
      <ellipse cx={-r * 0.45} cy={-r * 0.4} rx={r * 0.35} ry={r * 0.15} fill="#5C7E4F" stroke={STROKE} strokeWidth={1.1} />
      <ellipse cx={r * 0.4} cy={-r * 0.45} rx={r * 0.4} ry={r * 0.16} fill="#7BA46F" stroke={STROKE} strokeWidth={1.1} />
      <ellipse cx={0} cy={-r * 0.62} rx={r * 0.5} ry={r * 0.18} fill="#5C7E4F" stroke={STROKE} strokeWidth={1.1} />
      <ellipse cx={r * 0.15} cy={-r * 0.78} rx={r * 0.32} ry={r * 0.13} fill="#7BA46F" stroke={STROKE} strokeWidth={1} />
      {/* needle hints — tiny tufts */}
      {[
        [-0.7, -0.42], [-0.2, -0.32], [0.7, -0.5], [0.5, -0.66], [-0.35, -0.7], [0.45, -0.85], [-0.05, -0.87],
      ].map(([dx, dy], i) => (
        <line key={i} x1={r * dx} y1={r * dy} x2={r * (dx + 0.06)} y2={r * (dy - 0.04)} stroke={STROKE} strokeWidth={0.5} opacity={0.6} />
      ))}
    </g>
  );
}

// ─── CHERRY BLOSSOM ─────────────────────────────────────────────────────
function CherrySeed({ x, y, size }: StageProps) {
  // Pit-like seed — bigger than other seeds, slightly almond shaped
  const r = size * 0.08;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4} ry={r * 2} fill="#6B4423" opacity={0.4} />
      <ellipse cx={0} cy={0} rx={r * 0.7} ry={r} fill="#5A3B1F" stroke={STROKE} strokeWidth={0.7} />
      {/* groove */}
      <line x1={0} y1={-r * 0.8} x2={0} y2={r * 0.8} stroke="#3F2614" strokeWidth={0.5} />
    </g>
  );
}

function CherrySprout({ x, y, size }: StageProps) {
  const h = size * 0.2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.16} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      <line x1={0} y1={size * 0.05} x2={0} y2={-h * 0.7} stroke="#7BA46F" strokeWidth={1.4} strokeLinecap="round" />
      <ellipse cx={-size * 0.05} cy={-h * 0.85} rx={size * 0.05} ry={size * 0.07} fill="#95B88F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(-25 ${-size * 0.05} ${-h * 0.85})`} />
      <ellipse cx={size * 0.05} cy={-h * 0.85} rx={size * 0.05} ry={size * 0.07} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(25 ${size * 0.05} ${-h * 0.85})`} />
    </g>
  );
}

function CherryTwig({ x, y, size }: StageProps) {
  // Bare brown twig with branching
  const h = size * 0.4;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.06} rx={size * 0.18} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      {/* main twig */}
      <path
        d={`M ${-size * 0.025} ${size * 0.06} L ${-size * 0.018} ${-h * 0.85} L ${size * 0.018} ${-h * 0.85} L ${size * 0.025} ${size * 0.06} Z`}
        fill="#6B4423"
        stroke={STROKE}
        strokeWidth={1}
      />
      {/* sub-branches */}
      <line x1={0} y1={-h * 0.5} x2={size * 0.12} y2={-h * 0.85} stroke="#6B4423" strokeWidth={1.2} strokeLinecap="round" />
      <line x1={0} y1={-h * 0.65} x2={-size * 0.1} y2={-h * 0.95} stroke="#6B4423" strokeWidth={1.2} strokeLinecap="round" />
      <line x1={0} y1={-h * 0.78} x2={size * 0.07} y2={-h * 1.0} stroke="#6B4423" strokeWidth={1.0} strokeLinecap="round" />
      {/* tiny buds */}
      <circle cx={size * 0.12} cy={-h * 0.85} r={size * 0.018} fill="#8B5A2B" />
      <circle cx={-size * 0.1} cy={-h * 0.95} r={size * 0.018} fill="#8B5A2B" />
    </g>
  );
}

function CherryYoung({ x, y, size }: StageProps) {
  // Small tree with green leaves, no blossoms
  const r = size * 0.3;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.95} rx={r * 0.95} ry={r * 0.16} fill="#6B4423" opacity={0.3} />
      {/* trunk */}
      <path d={`M ${-r * 0.1} ${r * 0.85} L ${-r * 0.06} ${-r * 0.05} L ${r * 0.06} ${-r * 0.05} L ${r * 0.1} ${r * 0.85} Z`} fill="#8B5A2B" stroke={STROKE} strokeWidth={1.1} />
      {/* canopy puffs (green only) */}
      <circle cx={-r * 0.4} cy={-r * 0.25} r={r * 0.4} fill="#5C7E4F" stroke={STROKE} strokeWidth={1.1} />
      <circle cx={r * 0.4} cy={-r * 0.25} r={r * 0.4} fill="#7BA46F" stroke={STROKE} strokeWidth={1.1} />
      <circle cx={0} cy={-r * 0.55} r={r * 0.42} fill="#7BA46F" stroke={STROKE} strokeWidth={1.1} />
      <circle cx={r * 0.15} cy={-r * 0.55} r={r * 0.35} fill="#5C7E4F" stroke={STROKE} strokeWidth={1.1} />
      {/* leaf hints */}
      <ellipse cx={-r * 0.2} cy={-r * 0.7} rx={r * 0.08} ry={r * 0.05} fill="#A2C794" opacity={0.7} />
    </g>
  );
}

function CherryBloom({ x, y, size }: StageProps) {
  // Taller tree with crown of pink/white cherry blossoms
  const r = size * 0.42;
  // a cluster of blossom positions on the canopy
  const blossoms: Array<[number, number, number, string]> = [
    [-0.5, -0.3, 0.07, '#FFD6E0'], [-0.25, -0.45, 0.09, '#FFFAF2'], [0.1, -0.5, 0.08, '#FFD6E0'],
    [0.4, -0.4, 0.07, '#FFFAF2'], [0.55, -0.2, 0.08, '#FFD6E0'], [-0.6, -0.1, 0.07, '#FFFAF2'],
    [0, -0.7, 0.09, '#FFD6E0'], [0.3, -0.65, 0.07, '#FFFAF2'], [-0.35, -0.6, 0.08, '#FFD6E0'],
    [-0.45, 0.05, 0.06, '#FFFAF2'], [0.45, 0.0, 0.07, '#FFD6E0'], [0, -0.2, 0.07, '#FFFAF2'],
  ];
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.95} rx={r * 1.0} ry={r * 0.18} fill="#6B4423" opacity={0.3} />
      {/* trunk */}
      <path d={`M ${-r * 0.12} ${r * 0.85} L ${-r * 0.07} ${-r * 0.05} L ${r * 0.07} ${-r * 0.05} L ${r * 0.12} ${r * 0.85} Z`} fill="#8B5A2B" stroke={STROKE} strokeWidth={1.2} />
      {/* greener crown puffs as backdrop */}
      <circle cx={-r * 0.45} cy={-r * 0.25} r={r * 0.45} fill="#7BA46F" stroke={STROKE} strokeWidth={1.1} opacity={0.85} />
      <circle cx={r * 0.45} cy={-r * 0.25} r={r * 0.45} fill="#95B88F" stroke={STROKE} strokeWidth={1.1} opacity={0.85} />
      <circle cx={0} cy={-r * 0.55} r={r * 0.5} fill="#7BA46F" stroke={STROKE} strokeWidth={1.1} opacity={0.85} />
      <circle cx={r * 0.2} cy={-r * 0.6} r={r * 0.42} fill="#95B88F" stroke={STROKE} strokeWidth={1.1} opacity={0.85} />
      {/* blossoms — clusters of small circles, each with 5 petal hints */}
      {blossoms.map(([dx, dy, br, color], i) => {
        const cx = r * dx;
        const cy = r * dy;
        const pr = r * br;
        return (
          <g key={i}>
            {/* 5 petal circles */}
            {[0, 72, 144, 216, 288].map(a => (
              <circle
                key={a}
                cx={cx + Math.cos((a * Math.PI) / 180) * pr * 0.6}
                cy={cy + Math.sin((a * Math.PI) / 180) * pr * 0.6}
                r={pr}
                fill={color}
                stroke={STROKE}
                strokeWidth={0.6}
              />
            ))}
            {/* center */}
            <circle cx={cx} cy={cy} r={pr * 0.4} fill="#FFD93D" />
          </g>
        );
      })}
    </g>
  );
}

// ─── CARROT ─────────────────────────────────────────────────────────────
function CarrotSeed({ x, y, size }: StageProps) {
  // Tiny seed in a small soil mound
  const r = size * 0.055;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.4} rx={r * 4} ry={r * 2} fill="#6B4423" opacity={0.35} />
      {/* raised mound */}
      <path d={`M ${-r * 2.2} ${r * 0.4} Q 0 ${-r * 1.4} ${r * 2.2} ${r * 0.4}`} fill="#7A4A1F" opacity={0.5} />
      <circle cx={0} cy={-r * 0.2} r={r} fill="#3F2614" />
    </g>
  );
}

function CarrotSprout({ x, y, size }: StageProps) {
  // Two thin feathery leaves splitting from the soil
  const h = size * 0.2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.16} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      {[-1, 1].map(dir => (
        <g key={dir}>
          {/* thin arching stem */}
          <path d={`M 0 ${size * 0.05} Q ${dir * size * 0.04} ${-h * 0.45} ${dir * size * 0.09} ${-h}`} stroke="#7BA46F" strokeWidth={1.1} fill="none" strokeLinecap="round" />
          {/* feathery wisps */}
          <line x1={dir * size * 0.04} y1={-h * 0.5} x2={dir * size * 0.09} y2={-h * 0.58} stroke="#95B88F" strokeWidth={0.7} strokeLinecap="round" />
          <line x1={dir * size * 0.06} y1={-h * 0.72} x2={dir * size * 0.11} y2={-h * 0.8} stroke="#7BA46F" strokeWidth={0.7} strokeLinecap="round" />
          <line x1={dir * size * 0.08} y1={-h * 0.92} x2={dir * size * 0.13} y2={-h * 1.0} stroke="#95B88F" strokeWidth={0.7} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

function CarrotTops({ x, y, size }: StageProps) {
  // Bushy feathery green tops — spread of fronds with fine side wisps
  const h = size * 0.35;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.07} rx={size * 0.22} ry={size * 0.05} fill="#6B4423" opacity={0.35} />
      {[-42, -21, 0, 21, 42].map((a, i) => {
        const fh = h * (0.82 + (i % 2) * 0.18);
        const stem = i % 2 === 0 ? '#5C7E4F' : '#7BA46F';
        const wisp = i % 2 === 0 ? '#7BA46F' : '#95B88F';
        return (
          <g key={a} transform={`rotate(${a})`}>
            <line x1={0} y1={size * 0.04} x2={0} y2={-fh} stroke={stem} strokeWidth={1.2} strokeLinecap="round" />
            {[0.35, 0.55, 0.75].map(f => (
              <g key={f}>
                <line x1={0} y1={-fh * f} x2={-size * 0.05} y2={-fh * (f + 0.14)} stroke={wisp} strokeWidth={0.7} strokeLinecap="round" />
                <line x1={0} y1={-fh * f} x2={size * 0.05} y2={-fh * (f + 0.14)} stroke={wisp} strokeWidth={0.7} strokeLinecap="round" />
              </g>
            ))}
          </g>
        );
      })}
    </g>
  );
}

function CarrotMature({ x, y, size }: StageProps) {
  // Feathery tops with the orange shoulder peeking out of the soil
  const h = size * 0.38;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.12} rx={size * 0.26} ry={size * 0.05} fill="#6B4423" opacity={0.3} />
      {/* orange shoulder half out of the soil */}
      <ellipse cx={0} cy={size * 0.08} rx={size * 0.13} ry={size * 0.11} fill="#E58A3A" stroke={STROKE} strokeWidth={1.3} />
      {/* highlight */}
      <ellipse cx={-size * 0.04} cy={size * 0.05} rx={size * 0.04} ry={size * 0.05} fill="#F2A55C" opacity={0.75} />
      {/* soil line ridged over the shoulder */}
      <path d={`M ${-size * 0.15} ${size * 0.12} Q 0 ${size * 0.16} ${size * 0.15} ${size * 0.12}`} stroke="#6B4423" strokeWidth={1.1} fill="none" opacity={0.55} />
      {/* feathery tops sprouting from the crown */}
      {[-45, -24, -5, 16, 38].map((a, i) => {
        const fh = h * (0.85 + (i % 2) * 0.15);
        const stem = i % 2 === 0 ? '#5C7E4F' : '#7BA46F';
        const wisp = i % 2 === 0 ? '#7BA46F' : '#95B88F';
        return (
          <g key={a} transform={`rotate(${a})`}>
            <line x1={0} y1={0} x2={0} y2={-fh} stroke={stem} strokeWidth={1.2} strokeLinecap="round" />
            {[0.4, 0.6, 0.8].map(f => (
              <g key={f}>
                <line x1={0} y1={-fh * f} x2={-size * 0.05} y2={-fh * (f + 0.13)} stroke={wisp} strokeWidth={0.7} strokeLinecap="round" />
                <line x1={0} y1={-fh * f} x2={size * 0.05} y2={-fh * (f + 0.13)} stroke={wisp} strokeWidth={0.7} strokeLinecap="round" />
              </g>
            ))}
          </g>
        );
      })}
    </g>
  );
}

// ─── TOMATO ─────────────────────────────────────────────────────────────
function TomatoSeed({ x, y, size }: StageProps) {
  // Small pale fuzzy-flat seed
  const r = size * 0.06;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4} ry={r * 2} fill="#6B4423" opacity={0.35} />
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.75} fill="#D2C77A" stroke={STROKE} strokeWidth={0.6} transform="rotate(-15)" />
    </g>
  );
}

function TomatoSprout({ x, y, size }: StageProps) {
  const h = size * 0.2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.16} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      <line x1={0} y1={size * 0.05} x2={0} y2={-h} stroke="#7BA46F" strokeWidth={1.4} strokeLinecap="round" />
      <ellipse cx={-size * 0.06} cy={-h * 0.88} rx={size * 0.06} ry={size * 0.045} fill="#95B88F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(-28 ${-size * 0.06} ${-h * 0.88})`} />
      <ellipse cx={size * 0.06} cy={-h * 0.88} rx={size * 0.06} ry={size * 0.045} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(28 ${size * 0.06} ${-h * 0.88})`} />
    </g>
  );
}

function TomatoVine({ x, y, size }: StageProps) {
  // Vine winding up a small wooden stake
  const h = size * 0.5;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.07} rx={size * 0.2} ry={size * 0.05} fill="#6B4423" opacity={0.35} />
      {/* wooden stake */}
      <path d={`M ${size * 0.04} ${size * 0.06} L ${size * 0.04} ${-h * 0.92} L ${size * 0.075} ${-h} L ${size * 0.075} ${size * 0.06} Z`} fill="#A66838" stroke={STROKE} strokeWidth={0.9} />
      <line x1={size * 0.04} y1={-h * 0.35} x2={size * 0.075} y2={-h * 0.35} stroke={STROKE} strokeWidth={0.5} opacity={0.5} />
      {/* vine curving across the stake */}
      <path d={`M ${-size * 0.05} ${size * 0.06} Q ${-size * 0.14} ${-h * 0.25} ${size * 0.06} ${-h * 0.45} Q ${size * 0.16} ${-h * 0.6} ${size * 0.02} ${-h * 0.85}`} stroke="#5C7E4F" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      {/* jagged tomato leaves along the vine */}
      <ellipse cx={-size * 0.13} cy={-h * 0.22} rx={size * 0.07} ry={size * 0.045} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(-32 ${-size * 0.13} ${-h * 0.22})`} />
      <ellipse cx={size * 0.14} cy={-h * 0.55} rx={size * 0.07} ry={size * 0.045} fill="#95B88F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(30 ${size * 0.14} ${-h * 0.55})`} />
      <ellipse cx={-size * 0.05} cy={-h * 0.78} rx={size * 0.06} ry={size * 0.04} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(-25 ${-size * 0.05} ${-h * 0.78})`} />
      {/* curling tendril tip */}
      <path d={`M ${size * 0.02} ${-h * 0.85} q ${-size * 0.05} ${-size * 0.05} 0 ${-size * 0.07}`} stroke="#7BA46F" strokeWidth={0.9} fill="none" strokeLinecap="round" />
    </g>
  );
}

function TomatoGreen({ x, y, size }: StageProps) {
  // Vine on stake with small green tomatoes
  const h = size * 0.55;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.07} rx={size * 0.22} ry={size * 0.05} fill="#6B4423" opacity={0.35} />
      {/* stake */}
      <path d={`M ${size * 0.04} ${size * 0.06} L ${size * 0.04} ${-h * 0.92} L ${size * 0.075} ${-h} L ${size * 0.075} ${size * 0.06} Z`} fill="#A66838" stroke={STROKE} strokeWidth={0.9} />
      {/* vine */}
      <path d={`M ${-size * 0.05} ${size * 0.06} Q ${-size * 0.15} ${-h * 0.25} ${size * 0.06} ${-h * 0.45} Q ${size * 0.17} ${-h * 0.62} ${size * 0.0} ${-h * 0.9}`} stroke="#5C7E4F" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      {/* leaves */}
      <ellipse cx={-size * 0.14} cy={-h * 0.25} rx={size * 0.07} ry={size * 0.045} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(-30 ${-size * 0.14} ${-h * 0.25})`} />
      <ellipse cx={size * 0.15} cy={-h * 0.58} rx={size * 0.07} ry={size * 0.045} fill="#95B88F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(32 ${size * 0.15} ${-h * 0.58})`} />
      <ellipse cx={-size * 0.06} cy={-h * 0.82} rx={size * 0.06} ry={size * 0.04} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(-22 ${-size * 0.06} ${-h * 0.82})`} />
      {/* small green tomatoes */}
      {[
        { cx: -size * 0.08, cy: -h * 0.42 },
        { cx: size * 0.1, cy: -h * 0.68 },
        { cx: -size * 0.02, cy: -h * 0.6 },
      ].map((t, i) => (
        <g key={i}>
          <circle cx={t.cx} cy={t.cy} r={size * 0.045} fill="#8CB27A" stroke={STROKE} strokeWidth={0.9} />
          {/* tiny calyx star */}
          <circle cx={t.cx} cy={t.cy - size * 0.04} r={size * 0.012} fill="#5C7E4F" />
        </g>
      ))}
    </g>
  );
}

function TomatoRipe({ x, y, size }: StageProps) {
  // Vine on stake heavy with plump red tomatoes
  const h = size * 0.55;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.07} rx={size * 0.24} ry={size * 0.05} fill="#6B4423" opacity={0.32} />
      {/* stake */}
      <path d={`M ${size * 0.04} ${size * 0.06} L ${size * 0.04} ${-h * 0.92} L ${size * 0.075} ${-h} L ${size * 0.075} ${size * 0.06} Z`} fill="#A66838" stroke={STROKE} strokeWidth={0.9} />
      {/* vine */}
      <path d={`M ${-size * 0.05} ${size * 0.06} Q ${-size * 0.16} ${-h * 0.25} ${size * 0.06} ${-h * 0.45} Q ${size * 0.18} ${-h * 0.62} ${size * 0.0} ${-h * 0.9}`} stroke="#5C7E4F" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      {/* leaves */}
      <ellipse cx={-size * 0.15} cy={-h * 0.28} rx={size * 0.08} ry={size * 0.05} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(-30 ${-size * 0.15} ${-h * 0.28})`} />
      <ellipse cx={size * 0.16} cy={-h * 0.58} rx={size * 0.07} ry={size * 0.045} fill="#95B88F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(32 ${size * 0.16} ${-h * 0.58})`} />
      <ellipse cx={-size * 0.06} cy={-h * 0.85} rx={size * 0.06} ry={size * 0.04} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(-22 ${-size * 0.06} ${-h * 0.85})`} />
      {/* plump red tomatoes */}
      {[
        { cx: -size * 0.09, cy: -h * 0.4, r: size * 0.065 },
        { cx: size * 0.11, cy: -h * 0.68, r: size * 0.06 },
        { cx: -size * 0.01, cy: -h * 0.58, r: size * 0.055 },
      ].map((t, i) => (
        <g key={i}>
          <circle cx={t.cx} cy={t.cy} r={t.r} fill="#C84A3A" stroke={STROKE} strokeWidth={1.1} />
          <circle cx={t.cx - t.r * 0.3} cy={t.cy - t.r * 0.3} r={t.r * 0.28} fill="#E6705F" opacity={0.75} />
          {/* green calyx */}
          <path d={`M ${t.cx - t.r * 0.3} ${t.cy - t.r * 0.85} L ${t.cx} ${t.cy - t.r * 0.6} L ${t.cx + t.r * 0.3} ${t.cy - t.r * 0.85}`} stroke="#5C7E4F" strokeWidth={0.9} fill="none" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

// ─── PUMPKIN ────────────────────────────────────────────────────────────
function PumpkinSeed({ x, y, size }: StageProps) {
  // Flat cream teardrop seed
  const r = size * 0.08;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4} ry={r * 2} fill="#6B4423" opacity={0.35} />
      <path d={`M 0 ${-r} Q ${r * 0.85} ${-r * 0.1} 0 ${r} Q ${-r * 0.85} ${-r * 0.1} 0 ${-r} Z`} fill="#E8C493" stroke={STROKE} strokeWidth={0.7} transform="rotate(-20)" />
      {/* rim line */}
      <path d={`M 0 ${-r * 0.75} Q ${r * 0.6} ${-r * 0.1} 0 ${r * 0.75}`} stroke="#D2A96E" strokeWidth={0.5} fill="none" transform="rotate(-20)" />
    </g>
  );
}

function PumpkinSprout({ x, y, size }: StageProps) {
  // Stout sprout with big round seed-leaves
  const h = size * 0.18;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.18} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      <line x1={0} y1={size * 0.05} x2={0} y2={-h * 0.6} stroke="#7BA46F" strokeWidth={1.8} strokeLinecap="round" />
      {/* big rounded seed-leaves */}
      <circle cx={-size * 0.08} cy={-h * 0.85} r={size * 0.085} fill="#95B88F" stroke={STROKE} strokeWidth={0.9} />
      <circle cx={size * 0.08} cy={-h * 0.85} r={size * 0.085} fill="#7BA46F" stroke={STROKE} strokeWidth={0.9} />
      {/* vein hints */}
      <line x1={-size * 0.08} y1={-h * 0.6} x2={-size * 0.08} y2={-h * 1.1} stroke={STROKE} strokeWidth={0.5} opacity={0.4} />
      <line x1={size * 0.08} y1={-h * 0.6} x2={size * 0.08} y2={-h * 1.1} stroke={STROKE} strokeWidth={0.5} opacity={0.4} />
    </g>
  );
}

function PumpkinVine({ x, y, size }: StageProps) {
  // Sprawling vine with broad lobed leaves
  const w = size * 0.42;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.08} rx={w * 1.05} ry={size * 0.05} fill="#6B4423" opacity={0.32} />
      {/* sprawling wavy vine */}
      <path d={`M ${-w} ${size * 0.05} Q ${-w * 0.5} ${-size * 0.1} 0 ${size * 0.02} Q ${w * 0.5} ${size * 0.12} ${w} ${-size * 0.04}`} stroke="#5C7E4F" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      {/* broad leaves along the vine */}
      {[
        { cx: -w * 0.6, cy: -size * 0.09, r: size * 0.11, fill: '#7BA46F' },
        { cx: w * 0.15, cy: -size * 0.05, r: size * 0.13, fill: '#5C7E4F' },
        { cx: w * 0.75, cy: -size * 0.12, r: size * 0.1, fill: '#7BA46F' },
      ].map((leaf, i) => (
        <g key={i}>
          <circle cx={leaf.cx} cy={leaf.cy} r={leaf.r} fill={leaf.fill} stroke={STROKE} strokeWidth={1} />
          {/* leaf notch + vein */}
          <line x1={leaf.cx} y1={leaf.cy + leaf.r * 0.7} x2={leaf.cx} y2={leaf.cy - leaf.r * 0.6} stroke={STROKE} strokeWidth={0.5} opacity={0.5} />
          <circle cx={leaf.cx - leaf.r * 0.3} cy={leaf.cy - leaf.r * 0.3} r={leaf.r * 0.22} fill="#95B88F" opacity={0.6} />
        </g>
      ))}
      {/* curly tendril */}
      <path d={`M ${w} ${-size * 0.04} q ${size * 0.06} ${-size * 0.04} ${size * 0.02} ${-size * 0.08} q ${-size * 0.04} ${-size * 0.03} ${-size * 0.01} ${-size * 0.05}`} stroke="#7BA46F" strokeWidth={0.9} fill="none" strokeLinecap="round" />
    </g>
  );
}

function PumpkinFlower({ x, y, size }: StageProps) {
  // Vine with a large yellow-orange blossom
  const w = size * 0.42;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.08} rx={w * 1.05} ry={size * 0.05} fill="#6B4423" opacity={0.32} />
      {/* vine */}
      <path d={`M ${-w} ${size * 0.05} Q ${-w * 0.5} ${-size * 0.1} 0 ${size * 0.02} Q ${w * 0.5} ${size * 0.12} ${w} ${-size * 0.04}`} stroke="#5C7E4F" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      {/* leaves */}
      {[
        { cx: -w * 0.55, cy: -size * 0.08, r: size * 0.11, fill: '#7BA46F' },
        { cx: w * 0.7, cy: -size * 0.1, r: size * 0.1, fill: '#5C7E4F' },
      ].map((leaf, i) => (
        <g key={i}>
          <circle cx={leaf.cx} cy={leaf.cy} r={leaf.r} fill={leaf.fill} stroke={STROKE} strokeWidth={1} />
          <line x1={leaf.cx} y1={leaf.cy + leaf.r * 0.7} x2={leaf.cx} y2={leaf.cy - leaf.r * 0.6} stroke={STROKE} strokeWidth={0.5} opacity={0.5} />
        </g>
      ))}
      {/* large blossom — 5 pointed petals */}
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse key={a} cx={size * 0.05} cy={-size * 0.16 - size * 0.09} rx={size * 0.045} ry={size * 0.09} fill="#FFC24B" stroke={STROKE} strokeWidth={0.9} transform={`rotate(${a} ${size * 0.05} ${-size * 0.16})`} />
      ))}
      {/* trumpet center */}
      <circle cx={size * 0.05} cy={-size * 0.16} r={size * 0.045} fill="#E8933F" stroke={STROKE} strokeWidth={0.8} />
      <circle cx={size * 0.05} cy={-size * 0.16} r={size * 0.018} fill="#FFD93D" />
    </g>
  );
}

function PumpkinMature({ x, y, size }: StageProps) {
  // Vine with a proud ribbed orange pumpkin
  const w = size * 0.42;
  const pr = size * 0.2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.12} rx={w * 1.05} ry={size * 0.055} fill="#6B4423" opacity={0.3} />
      {/* vine behind */}
      <path d={`M ${-w} ${size * 0.06} Q ${-w * 0.5} ${-size * 0.08} 0 ${size * 0.03} Q ${w * 0.5} ${size * 0.12} ${w} ${-size * 0.02}`} stroke="#5C7E4F" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      {/* leaves */}
      <circle cx={-w * 0.6} cy={-size * 0.07} r={size * 0.1} fill="#7BA46F" stroke={STROKE} strokeWidth={1} />
      <line x1={-w * 0.6} y1={-size * 0.0} x2={-w * 0.6} y2={-size * 0.13} stroke={STROKE} strokeWidth={0.5} opacity={0.5} />
      <circle cx={w * 0.72} cy={-size * 0.08} r={size * 0.09} fill="#5C7E4F" stroke={STROKE} strokeWidth={1} />
      {/* ribbed pumpkin */}
      <ellipse cx={size * 0.05} cy={-size * 0.02} rx={pr} ry={pr * 0.82} fill="#D97B29" stroke={STROKE} strokeWidth={1.4} />
      {/* rib arcs */}
      <path d={`M ${size * 0.05 - pr * 0.45} ${-size * 0.02 - pr * 0.65} Q ${size * 0.05 - pr * 0.62} ${-size * 0.02} ${size * 0.05 - pr * 0.45} ${-size * 0.02 + pr * 0.65}`} stroke={STROKE} strokeWidth={0.8} fill="none" opacity={0.65} />
      <path d={`M ${size * 0.05} ${-size * 0.02 - pr * 0.8} Q ${size * 0.05 - pr * 0.1} ${-size * 0.02} ${size * 0.05} ${-size * 0.02 + pr * 0.8}`} stroke={STROKE} strokeWidth={0.8} fill="none" opacity={0.65} />
      <path d={`M ${size * 0.05 + pr * 0.45} ${-size * 0.02 - pr * 0.65} Q ${size * 0.05 + pr * 0.62} ${-size * 0.02} ${size * 0.05 + pr * 0.45} ${-size * 0.02 + pr * 0.65}`} stroke={STROKE} strokeWidth={0.8} fill="none" opacity={0.65} />
      {/* highlight */}
      <ellipse cx={size * 0.05 - pr * 0.4} cy={-size * 0.02 - pr * 0.35} rx={pr * 0.16} ry={pr * 0.24} fill="#F2A55C" opacity={0.7} />
      {/* curly stem */}
      <path d={`M ${size * 0.05} ${-size * 0.02 - pr * 0.82} q ${size * 0.01} ${-size * 0.05} ${size * 0.05} ${-size * 0.05}`} stroke="#5C7E4F" strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>
  );
}

// ─── STRAWBERRY ─────────────────────────────────────────────────────────
function StrawberrySeed({ x, y, size }: StageProps) {
  const r = size * 0.05;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4} ry={r * 2} fill="#6B4423" opacity={0.35} />
      <circle cx={0} cy={0} r={r} fill="#3F2614" />
    </g>
  );
}

function StrawberrySprout({ x, y, size }: StageProps) {
  // Low sprout with a single trifoliate leaf
  const h = size * 0.16;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.16} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      <line x1={0} y1={size * 0.05} x2={0} y2={-h * 0.6} stroke="#7BA46F" strokeWidth={1.2} strokeLinecap="round" />
      {/* three leaflets */}
      <ellipse cx={-size * 0.07} cy={-h * 0.75} rx={size * 0.05} ry={size * 0.06} fill="#95B88F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(-35 ${-size * 0.07} ${-h * 0.75})`} />
      <ellipse cx={size * 0.07} cy={-h * 0.75} rx={size * 0.05} ry={size * 0.06} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(35 ${size * 0.07} ${-h * 0.75})`} />
      <ellipse cx={0} cy={-h * 1.05} rx={size * 0.05} ry={size * 0.06} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} />
    </g>
  );
}

function StrawberryFlower({ x, y, size }: StageProps) {
  // Leafy mound with small white 5-petal flowers, yellow centers
  const r = size * 0.28;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.6} rx={r * 1.15} ry={r * 0.17} fill="#6B4423" opacity={0.32} />
      {/* mound of trifoliate leaves */}
      {[
        { cx: -r * 0.5, cy: 0, rot: -25, fill: '#5C7E4F' },
        { cx: r * 0.5, cy: 0, rot: 25, fill: '#7BA46F' },
        { cx: -r * 0.15, cy: -r * 0.3, rot: -8, fill: '#7BA46F' },
        { cx: r * 0.25, cy: -r * 0.28, rot: 12, fill: '#95B88F' },
        { cx: 0, cy: r * 0.15, rot: 0, fill: '#5C7E4F' },
      ].map((leaf, i) => (
        <ellipse key={i} cx={leaf.cx} cy={leaf.cy} rx={r * 0.32} ry={r * 0.24} fill={leaf.fill} stroke={STROKE} strokeWidth={0.9} transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`} />
      ))}
      {/* two 5-petal white flowers */}
      {[
        { cx: -r * 0.3, cy: -r * 0.55, fr: r * 0.1 },
        { cx: r * 0.4, cy: -r * 0.5, fr: r * 0.085 },
      ].map((f, i) => (
        <g key={i}>
          {[0, 72, 144, 216, 288].map(a => (
            <circle
              key={a}
              cx={f.cx + Math.cos((a * Math.PI) / 180) * f.fr * 0.9}
              cy={f.cy + Math.sin((a * Math.PI) / 180) * f.fr * 0.9}
              r={f.fr * 0.6}
              fill="#FFFAF2"
              stroke={STROKE}
              strokeWidth={0.6}
            />
          ))}
          <circle cx={f.cx} cy={f.cy} r={f.fr * 0.42} fill="#FFD93D" stroke={STROKE} strokeWidth={0.5} />
        </g>
      ))}
    </g>
  );
}

function StrawberryBerries({ x, y, size }: StageProps) {
  // Red berries with seed specks hanging under the leaf mound
  const r = size * 0.3;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.85} rx={r * 1.15} ry={r * 0.17} fill="#6B4423" opacity={0.3} />
      {/* leaf mound on top */}
      {[
        { cx: -r * 0.45, cy: -r * 0.3, rot: -25, fill: '#5C7E4F' },
        { cx: r * 0.45, cy: -r * 0.3, rot: 25, fill: '#7BA46F' },
        { cx: 0, cy: -r * 0.5, rot: 0, fill: '#7BA46F' },
        { cx: -r * 0.12, cy: -r * 0.2, rot: -8, fill: '#95B88F' },
        { cx: r * 0.2, cy: -r * 0.15, rot: 10, fill: '#5C7E4F' },
      ].map((leaf, i) => (
        <ellipse key={i} cx={leaf.cx} cy={leaf.cy} rx={r * 0.34} ry={r * 0.25} fill={leaf.fill} stroke={STROKE} strokeWidth={0.9} transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`} />
      ))}
      {/* berries hanging below */}
      {[
        { cx: -r * 0.45, cy: r * 0.35, br: r * 0.22 },
        { cx: r * 0.1, cy: r * 0.45, br: r * 0.26 },
        { cx: r * 0.55, cy: r * 0.3, br: r * 0.2 },
      ].map((b, i) => (
        <g key={i}>
          {/* short stem from the leaves */}
          <line x1={b.cx * 0.6} y1={-r * 0.05} x2={b.cx} y2={b.cy - b.br} stroke="#5C7E4F" strokeWidth={0.9} strokeLinecap="round" />
          {/* berry — rounded teardrop */}
          <path d={`M ${b.cx - b.br * 0.85} ${b.cy - b.br * 0.5} Q ${b.cx - b.br} ${b.cy + b.br * 0.4} ${b.cx} ${b.cy + b.br} Q ${b.cx + b.br} ${b.cy + b.br * 0.4} ${b.cx + b.br * 0.85} ${b.cy - b.br * 0.5} Q ${b.cx} ${b.cy - b.br} ${b.cx - b.br * 0.85} ${b.cy - b.br * 0.5} Z`} fill="#C84A3A" stroke={STROKE} strokeWidth={1.1} />
          {/* calyx */}
          <path d={`M ${b.cx - b.br * 0.4} ${b.cy - b.br * 0.6} L ${b.cx} ${b.cy - b.br * 0.35} L ${b.cx + b.br * 0.4} ${b.cy - b.br * 0.6}`} stroke="#5C7E4F" strokeWidth={1} fill="none" strokeLinecap="round" />
          {/* seed specks */}
          <circle cx={b.cx - b.br * 0.3} cy={b.cy} r={b.br * 0.07} fill="#FFE9A8" />
          <circle cx={b.cx + b.br * 0.25} cy={b.cy + b.br * 0.15} r={b.br * 0.07} fill="#FFE9A8" />
          <circle cx={b.cx} cy={b.cy + b.br * 0.45} r={b.br * 0.07} fill="#FFE9A8" />
        </g>
      ))}
    </g>
  );
}

// ─── BLUEBERRY ──────────────────────────────────────────────────────────
function BlueberrySeed({ x, y, size }: StageProps) {
  const r = size * 0.05;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4} ry={r * 2} fill="#6B4423" opacity={0.35} />
      <circle cx={0} cy={0} r={r} fill="#3F2614" />
    </g>
  );
}

function BlueberrySprout({ x, y, size }: StageProps) {
  // Twiggy sprout — thin woody stem, a few tiny oval leaves
  const h = size * 0.22;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.16} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      {/* woody main stem with a kink */}
      <path d={`M 0 ${size * 0.05} L ${size * 0.015} ${-h * 0.5} L ${-size * 0.01} ${-h}`} stroke="#8B5A2B" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      {/* side twig */}
      <line x1={size * 0.012} y1={-h * 0.45} x2={size * 0.09} y2={-h * 0.7} stroke="#8B5A2B" strokeWidth={1} strokeLinecap="round" />
      {/* tiny oval leaves */}
      <ellipse cx={-size * 0.03} cy={-h * 1.05} rx={size * 0.035} ry={size * 0.05} fill="#7BA46F" stroke={STROKE} strokeWidth={0.7} transform={`rotate(-15 ${-size * 0.03} ${-h * 1.05})`} />
      <ellipse cx={size * 0.1} cy={-h * 0.78} rx={size * 0.032} ry={size * 0.045} fill="#95B88F" stroke={STROKE} strokeWidth={0.7} transform={`rotate(30 ${size * 0.1} ${-h * 0.78})`} />
    </g>
  );
}

function BlueberryBush({ x, y, size }: StageProps) {
  // Small rounded bush of oval leaves on a short woody base
  const r = size * 0.32;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.75} rx={r * 1.05} ry={r * 0.16} fill="#6B4423" opacity={0.3} />
      {/* short woody stems */}
      <line x1={0} y1={r * 0.7} x2={-r * 0.15} y2={r * 0.1} stroke="#8B5A2B" strokeWidth={1.3} strokeLinecap="round" />
      <line x1={0} y1={r * 0.7} x2={r * 0.2} y2={r * 0.15} stroke="#8B5A2B" strokeWidth={1.3} strokeLinecap="round" />
      {/* rounded canopy */}
      <ellipse cx={0} cy={-r * 0.1} rx={r} ry={r * 0.8} fill="#5C7E4F" stroke={STROKE} strokeWidth={1.2} />
      {/* oval leaves dotted over the canopy */}
      {[
        { cx: -r * 0.55, cy: -r * 0.15, rot: -25, fill: '#7BA46F' },
        { cx: r * 0.5, cy: -r * 0.25, rot: 20, fill: '#7BA46F' },
        { cx: -r * 0.15, cy: -r * 0.55, rot: -8, fill: '#95B88F' },
        { cx: r * 0.25, cy: -r * 0.5, rot: 15, fill: '#95B88F' },
        { cx: 0, cy: -r * 0.05, rot: 0, fill: '#7BA46F' },
        { cx: -r * 0.45, cy: r * 0.25, rot: -30, fill: '#95B88F' },
        { cx: r * 0.5, cy: r * 0.2, rot: 28, fill: '#7BA46F' },
      ].map((leaf, i) => (
        <ellipse key={i} cx={leaf.cx} cy={leaf.cy} rx={r * 0.14} ry={r * 0.22} fill={leaf.fill} stroke={STROKE} strokeWidth={0.8} transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`} />
      ))}
    </g>
  );
}

function BlueberryBerries({ x, y, size }: StageProps) {
  // Bush dotted with clusters of blue berries, a few green unripe ones
  const r = size * 0.34;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.75} rx={r * 1.05} ry={r * 0.16} fill="#6B4423" opacity={0.3} />
      {/* woody stems */}
      <line x1={0} y1={r * 0.7} x2={-r * 0.15} y2={r * 0.1} stroke="#8B5A2B" strokeWidth={1.3} strokeLinecap="round" />
      <line x1={0} y1={r * 0.7} x2={r * 0.2} y2={r * 0.15} stroke="#8B5A2B" strokeWidth={1.3} strokeLinecap="round" />
      {/* canopy */}
      <ellipse cx={0} cy={-r * 0.1} rx={r} ry={r * 0.8} fill="#5C7E4F" stroke={STROKE} strokeWidth={1.2} />
      {/* oval leaves */}
      {[
        { cx: -r * 0.55, cy: -r * 0.2, rot: -25, fill: '#7BA46F' },
        { cx: r * 0.5, cy: -r * 0.3, rot: 20, fill: '#7BA46F' },
        { cx: -r * 0.1, cy: -r * 0.55, rot: -8, fill: '#95B88F' },
        { cx: r * 0.55, cy: r * 0.2, rot: 28, fill: '#95B88F' },
        { cx: -r * 0.5, cy: r * 0.25, rot: -30, fill: '#7BA46F' },
      ].map((leaf, i) => (
        <ellipse key={i} cx={leaf.cx} cy={leaf.cy} rx={r * 0.14} ry={r * 0.22} fill={leaf.fill} stroke={STROKE} strokeWidth={0.8} transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`} />
      ))}
      {/* berry clusters — ripe blue */}
      {[
        [-0.35, -0.25], [-0.22, -0.15], [-0.3, -0.05],
        [0.25, -0.1], [0.38, -0.02], [0.3, 0.12],
        [0.0, 0.25], [-0.13, 0.32], [0.12, 0.35],
        [0.1, -0.4],
      ].map(([dx, dy], i) => (
        <g key={i}>
          <circle cx={r * dx} cy={r * dy} r={r * 0.09} fill="#6B85B5" stroke={STROKE} strokeWidth={0.8} />
          <circle cx={r * dx - r * 0.025} cy={r * dy - r * 0.03} r={r * 0.025} fill="#9AAECF" />
        </g>
      ))}
      {/* a few green unripe berries for charm */}
      {[
        [-0.05, -0.28], [0.45, -0.35], [-0.48, 0.05],
      ].map(([dx, dy], i) => (
        <circle key={i} cx={r * dx} cy={r * dy} r={r * 0.065} fill="#A2C794" stroke={STROKE} strokeWidth={0.7} />
      ))}
    </g>
  );
}

export function PlantStageIllustration({ code, x, y, size }: Props) {
  switch (code) {
    case 'plant_radish_seed':    return <RadishSeed x={x} y={y} size={size} />;
    case 'plant_radish_sprout':  return <RadishSprout x={x} y={y} size={size} />;
    case 'plant_radish_leaves':  return <RadishLeaves x={x} y={y} size={size} />;
    case 'plant_radish_mature':  return <RadishMature x={x} y={y} size={size} />;
    case 'plant_mint_seed':      return <MintSeed x={x} y={y} size={size} />;
    case 'plant_mint_sprout':    return <MintSprout x={x} y={y} size={size} />;
    case 'plant_mint_young':     return <MintYoung x={x} y={y} size={size} />;
    case 'plant_mint_mature':    return <MintMature x={x} y={y} size={size} />;
    case 'plant_lettuce_seed':   return <LettuceSeed x={x} y={y} size={size} />;
    case 'plant_lettuce_sprout': return <LettuceSprout x={x} y={y} size={size} />;
    case 'plant_lettuce_young':  return <LettuceYoung x={x} y={y} size={size} />;
    case 'plant_lettuce_mature': return <LettuceMature x={x} y={y} size={size} />;
    case 'plant_tulip_bulb':     return <TulipBulb x={x} y={y} size={size} />;
    case 'plant_tulip_spear':    return <TulipSpear x={x} y={y} size={size} />;
    case 'plant_tulip_bud':      return <TulipBud x={x} y={y} size={size} />;
    case 'plant_tulip_bloom':    return <TulipBloom x={x} y={y} size={size} />;
    case 'plant_daisy_seed':     return <DaisySeed x={x} y={y} size={size} />;
    case 'plant_daisy_sprout':   return <DaisySprout x={x} y={y} size={size} />;
    case 'plant_daisy_bud':      return <DaisyBud x={x} y={y} size={size} />;
    case 'plant_daisy_bloom':    return <DaisyBloom x={x} y={y} size={size} />;
    case 'plant_sunflower_seed':   return <SunflowerSeed x={x} y={y} size={size} />;
    case 'plant_sunflower_sprout': return <SunflowerSprout x={x} y={y} size={size} />;
    case 'plant_sunflower_stalk':  return <SunflowerStalk x={x} y={y} size={size} />;
    case 'plant_sunflower_bud':    return <SunflowerBud x={x} y={y} size={size} />;
    case 'plant_sunflower_bloom':  return <SunflowerBloom x={x} y={y} size={size} />;
    case 'plant_apple_seed':       return <AppleSeed x={x} y={y} size={size} />;
    case 'plant_apple_sprout':     return <AppleSprout x={x} y={y} size={size} />;
    case 'plant_apple_twig':       return <AppleTwig x={x} y={y} size={size} />;
    case 'plant_apple_young':      return <AppleYoung x={x} y={y} size={size} />;
    case 'plant_apple_mature':     return <AppleMature x={x} y={y} size={size} />;
    case 'plant_bamboo_seed':      return <BambooSeed x={x} y={y} size={size} />;
    case 'plant_bamboo_shoot':     return <BambooShoot x={x} y={y} size={size} />;
    case 'plant_bamboo_stalk':     return <BambooStalk x={x} y={y} size={size} />;
    case 'plant_bamboo_cluster':   return <BambooCluster x={x} y={y} size={size} />;
    case 'plant_bonsai_seed':      return <BonsaiSeed x={x} y={y} size={size} />;
    case 'plant_bonsai_sprout':    return <BonsaiSprout x={x} y={y} size={size} />;
    case 'plant_bonsai_young':     return <BonsaiYoung x={x} y={y} size={size} />;
    case 'plant_bonsai_mature':    return <BonsaiMature x={x} y={y} size={size} />;
    case 'plant_cherry_seed':      return <CherrySeed x={x} y={y} size={size} />;
    case 'plant_cherry_sprout':    return <CherrySprout x={x} y={y} size={size} />;
    case 'plant_cherry_twig':      return <CherryTwig x={x} y={y} size={size} />;
    case 'plant_cherry_young':     return <CherryYoung x={x} y={y} size={size} />;
    case 'plant_cherry_bloom':     return <CherryBloom x={x} y={y} size={size} />;
    // carrot
    case 'plant_carrot_seed':      return <CarrotSeed x={x} y={y} size={size} />;
    case 'plant_carrot_sprout':    return <CarrotSprout x={x} y={y} size={size} />;
    case 'plant_carrot_tops':      return <CarrotTops x={x} y={y} size={size} />;
    case 'plant_carrot_mature':    return <CarrotMature x={x} y={y} size={size} />;
    // tomato
    case 'plant_tomato_seed':      return <TomatoSeed x={x} y={y} size={size} />;
    case 'plant_tomato_sprout':    return <TomatoSprout x={x} y={y} size={size} />;
    case 'plant_tomato_vine':      return <TomatoVine x={x} y={y} size={size} />;
    case 'plant_tomato_green':     return <TomatoGreen x={x} y={y} size={size} />;
    case 'plant_tomato_ripe':      return <TomatoRipe x={x} y={y} size={size} />;
    // pumpkin
    case 'plant_pumpkin_seed':     return <PumpkinSeed x={x} y={y} size={size} />;
    case 'plant_pumpkin_sprout':   return <PumpkinSprout x={x} y={y} size={size} />;
    case 'plant_pumpkin_vine':     return <PumpkinVine x={x} y={y} size={size} />;
    case 'plant_pumpkin_flower':   return <PumpkinFlower x={x} y={y} size={size} />;
    case 'plant_pumpkin_mature':   return <PumpkinMature x={x} y={y} size={size} />;
    // strawberry
    case 'plant_strawberry_seed':    return <StrawberrySeed x={x} y={y} size={size} />;
    case 'plant_strawberry_sprout':  return <StrawberrySprout x={x} y={y} size={size} />;
    case 'plant_strawberry_flower':  return <StrawberryFlower x={x} y={y} size={size} />;
    case 'plant_strawberry_berries': return <StrawberryBerries x={x} y={y} size={size} />;
    // blueberry
    case 'plant_blueberry_seed':    return <BlueberrySeed x={x} y={y} size={size} />;
    case 'plant_blueberry_sprout':  return <BlueberrySprout x={x} y={y} size={size} />;
    case 'plant_blueberry_bush':    return <BlueberryBush x={x} y={y} size={size} />;
    case 'plant_blueberry_berries': return <BlueberryBerries x={x} y={y} size={size} />;
    default: return null;
  }
}
