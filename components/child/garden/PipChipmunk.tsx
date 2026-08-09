// components/child/garden/PipChipmunk.tsx
//
// Pip, drawn as an eastern chipmunk rather than a squirrel.
//
// The difference is the whole reason he is a chipmunk, so it has to be
// visible: dark stripes down the back with pale stripes between them, a
// stripe running through the eye, a slim tail carried up rather than a
// plume, and a cheek pouch packed out. A real eastern chipmunk has five
// dark stripes, but only the near two or three face you from the side,
// so that is what is drawn — claiming five and drawing two would make
// the picture disagree with the animal.
//
// Drawn facing the viewer's right, cheeks full, sitting up on his
// haunches the way they do when they are holding something.

interface Props { size?: number; cheeksFull?: boolean }

const FUR       = '#B8834A';
const FUR_DARK  = '#8A5E30';
const FUR_PALE  = '#E8D2AE';
const STRIPE    = '#43301C';
const BELLY     = '#F2E4CC';
const NOSE      = '#5A3A28';

export default function PipChipmunk({ size = 96, cheeksFull = true }: Props) {
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100"
         style={{ overflow: 'visible' }} role="img" aria-label="Pip the chipmunk">
      <ellipse cx={2} cy={36} rx={20} ry={3} fill="#000" opacity={0.15} />

      {/* TAIL — held up, and flatter and thinner than a squirrel's */}
      <path d="M -14 26 Q -34 18 -33 -2 Q -32 -16 -22 -22 Q -26 -10 -25 0 Q -24 14 -10 20 Z"
            fill={FUR} stroke={FUR_DARK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M -20 20 Q -28 8 -25 -8" fill="none" stroke={FUR_PALE} strokeWidth={2} opacity={0.6} />

      {/* BODY, sitting up */}
      <path d="M -12 30 Q -16 4 -6 -10 Q 6 -22 16 -10 Q 24 2 20 30 Z"
            fill={FUR} stroke={FUR_DARK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M -2 28 Q -6 8 2 -6 Q 12 -14 16 -4 Q 20 8 16 28 Z" fill={BELLY} />

      {/* THE STRIPES — five dark, pale between. The identifying mark. */}
      <g stroke={STRIPE} strokeWidth={2.2} strokeLinecap="round" fill="none">
        <path d="M -9 22 Q -12 4 -5 -8" />
        <path d="M -2 24 Q -5 6 1 -10" />
      </g>
      <g stroke={FUR_PALE} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.9}>
        <path d="M -5.5 23 Q -8.5 5 -2 -9" />
        <path d="M 1.5 24 Q -1 7 4.5 -10" />
      </g>

      {/* HAUNCH and FEET */}
      <ellipse cx={4} cy={24} rx={11} ry={9} fill={FUR} stroke={FUR_DARK} strokeWidth={1.4} />
      <path d="M 12 31 q 6 1 8 -1" stroke={FUR_DARK} strokeWidth={1.6} fill="none" strokeLinecap="round" />

      {/* HEAD */}
      <g transform="translate(14, -14)">
        <ellipse cx={0} cy={0} rx={13} ry={11.5} fill={FUR} stroke={FUR_DARK} strokeWidth={1.6} />

        {/* stuffed cheek — the pouch, which is the point of him */}
        {cheeksFull && (
          <g>
            <path d="M 1 3 Q 13 2 15 9 Q 15 17 5 17 Q -4 16 -3 8 Q -2 3 1 3 Z"
                  fill={FUR} stroke={FUR_DARK} strokeWidth={1.5} strokeLinejoin="round" />
            <path d="M 2 7 Q 9 6 12 10" fill="none" stroke={FUR_PALE}
                  strokeWidth={1.4} opacity={0.5} />
          </g>
        )}

        {/* the stripe through the eye, above and below */}
        <path d="M -9 -5 Q -1 -6 8 -4" stroke={STRIPE} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <path d="M -8 2.5 Q -1 2 7 3.5" stroke={FUR_PALE} strokeWidth={1.8} fill="none" strokeLinecap="round" opacity={0.85} />

        {/* muzzle, nose, eye */}
        <ellipse cx={9} cy={0.5} rx={5.5} ry={4.2} fill={BELLY} />
        <ellipse cx={13} cy={-0.5} rx={1.8} ry={1.4} fill={NOSE} />
        <path d="M 12 1 q 0 3 -3 3.5" stroke={NOSE} strokeWidth={1} fill="none" strokeLinecap="round" />
        <circle cx={2} cy={-2.5} r={3} fill="#20160D" />
        <circle cx={3} cy={-3.5} r={1.1} fill="#FFF" opacity={0.9} />

        {/* ear — small and round, not tufted */}
        <ellipse cx={-7} cy={-9} rx={4} ry={4.6} fill={FUR} stroke={FUR_DARK} strokeWidth={1.3} />
        <ellipse cx={-7} cy={-9} rx={1.8} ry={2.4} fill="#C99A6E" />

        {/* whiskers */}
        <g stroke={FUR_DARK} strokeWidth={0.7} opacity={0.65} strokeLinecap="round">
          <path d="M 13 2 q 8 2 12 1" />
          <path d="M 13 3.5 q 8 4 11 5" />
        </g>
      </g>

      {/* FOREPAWS holding an acorn — one pouch-load, the unit he counts.
          Down at the chest and in front of the belly, so it reads as
          something held rather than a second chin. */}
      <g transform="translate(11, 8)">
        {/* the acorn */}
        <ellipse cx={0} cy={1.5} rx={4.8} ry={5.2} fill="#C99A6E" stroke={FUR_DARK} strokeWidth={1.2} />
        <path d="M -4.8 -1.4 Q 0 -5 4.8 -1.4 Q 0 1 -4.8 -1.4 Z" fill="#7A5528" stroke={FUR_DARK} strokeWidth={1} strokeLinejoin="round" />
        <path d="M 0 -4.4 v -2.6" stroke="#6B4A24" strokeWidth={1.4} strokeLinecap="round" />
        {/* the two paws round it */}
        <path d="M -6.5 2 q -3 2 -1 5 q 3 2 5 -1" fill={FUR} stroke={FUR_DARK} strokeWidth={1.3} strokeLinejoin="round" />
        <path d="M 6.5 2 q 3 2 1 5 q -3 2 -5 -1" fill={FUR} stroke={FUR_DARK} strokeWidth={1.3} strokeLinejoin="round" />
      </g>
    </svg>
  );
}
