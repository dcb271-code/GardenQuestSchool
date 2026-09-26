'use client';

/**
 * "Read it to me." A big drawn speaker that reads one thing aloud,
 * and turns into a stop square while it is reading. Built so a child
 * who cannot read can still open her mail; used wherever there is
 * text she should be able to hear. Drawn, not an emoji glyph — on a
 * Level-0 screen this is the primary control and it has to be
 * unmistakable at arm's length.
 *
 * `reading` and `onToggle` come from useReadAloud, which knows which
 * key is playing so two buttons on one screen never both say "stop".
 */
export default function ReadToMeButton({
  reading, onToggle, label = 'read it to me', size = 48,
}: {
  reading: boolean;
  onToggle: () => void;
  label?: string;
  size?: number;
}) {
  const ink = reading ? '#fff' : '#3f2614';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={reading ? 'stop reading' : label}
      aria-pressed={reading}
      className="rounded-full shrink-0 inline-flex items-center justify-center"
      style={{
        width: size, height: size, minWidth: size, minHeight: size,
        background: reading ? '#c94c3e' : '#fffaf2',
        border: '2px solid #d8c9a8',
        touchAction: 'manipulation',
      }}
    >
      <svg viewBox="0 0 32 32" width={size * 0.62} height={size * 0.62} aria-hidden>
        {reading ? (
          <rect x={8} y={8} width={16} height={16} rx={3} fill={ink} />
        ) : (
          <>
            {/* the horn: a box with a cone */}
            <path d="M 5 12 H 10 L 17 6 V 26 L 10 20 H 5 Z" fill={ink} stroke={ink} strokeWidth={1.5} strokeLinejoin="round" />
            {/* two sound waves */}
            <path d="M 21 11 Q 25 16 21 21" fill="none" stroke={ink} strokeWidth={2.4} strokeLinecap="round" />
            <path d="M 24.5 7.5 Q 31 16 24.5 24.5" fill="none" stroke={ink} strokeWidth={2.4} strokeLinecap="round" />
          </>
        )}
      </svg>
    </button>
  );
}
