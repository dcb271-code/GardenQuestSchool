'use client';

/**
 * "Read it to me." A big speaker that reads one thing aloud, and
 * turns into a stop square while it is reading. Built so a child
 * who cannot read can still open her mail; used wherever there is
 * text she should be able to hear.
 *
 * `reading` and `onToggle` come from useReadAloud, which knows which
 * key is playing so two buttons on one screen never both say "stop".
 */
export default function ReadToMeButton({
  reading, onToggle, label = 'read it to me',
}: {
  reading: boolean;
  onToggle: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={reading ? 'stop reading' : label}
      aria-pressed={reading}
      className="rounded-full font-bold text-base shrink-0"
      style={{
        minWidth: 48, minHeight: 48,
        background: reading ? '#c94c3e' : '#fffaf2',
        color: reading ? '#fff' : '#3f2614',
        border: '2px solid #d8c9a8',
        touchAction: 'manipulation',
      }}
    >
      {reading ? '◼' : '🔊'}
    </button>
  );
}
