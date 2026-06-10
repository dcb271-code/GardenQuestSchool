'use client';

// Friendly fault screen for async failures in child-facing flows
// (lesson item fetch, naturalist walk start). Always offers "Try
// again" so a transient network blip never dead-ends a session.

interface ErrorRetryCardProps {
  message?: string;
  detail?: string | null;
  onRetry: () => void;
  retryLabel?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export default function ErrorRetryCard({
  message = 'Oops — something got tangled in the roots.',
  detail,
  onRetry,
  retryLabel = 'Try again',
  secondaryLabel,
  onSecondary,
}: ErrorRetryCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center text-bark">
      <div className="text-5xl" aria-hidden="true">🪢</div>
      <p className="text-xl font-display">{message}</p>
      {detail && <p className="text-sm text-bark/50">{detail}</p>}
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 px-8 py-4 rounded-full bg-terracotta text-cream font-display text-xl shadow-md"
        style={{ minHeight: 60, touchAction: 'manipulation' }}
      >
        {retryLabel}
      </button>
      {secondaryLabel && onSecondary && (
        <button
          type="button"
          onClick={onSecondary}
          className="px-6 py-3 rounded-full bg-bark/10 text-bark font-display"
          style={{ minHeight: 60, touchAction: 'manipulation' }}
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  );
}
