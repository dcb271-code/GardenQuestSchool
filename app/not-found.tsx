import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-cream">
      <div className="max-w-md w-full bg-white border-4 border-ochre rounded-3xl p-7 text-center space-y-4 shadow-2xl">
        <div className="text-6xl">🦋</div>
        <div>
          <div className="font-display italic text-[13px] tracking-[0.3em] uppercase text-bark/55">
            we wandered
          </div>
          <h1
            className="font-display text-[28px] text-bark leading-tight mt-1"
            style={{ fontWeight: 600, letterSpacing: '-0.015em' }}
          >
            <span className="italic text-forest">off the path</span>
          </h1>
        </div>
        <p className="font-display italic text-[15px] text-bark/70">
          this page doesn&apos;t exist. the garden&apos;s back this way.
        </p>
        <Link
          href="/picker"
          className="block w-full bg-sage text-white rounded-full py-3 font-display"
          style={{ fontWeight: 600, minHeight: 56, lineHeight: '32px' }}
        >
          back to the garden
        </Link>
      </div>
    </main>
  );
}
