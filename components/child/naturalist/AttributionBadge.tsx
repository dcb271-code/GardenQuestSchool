'use client';

import { useState } from 'react';

export interface PhotoAttribution {
  photographer: string | null;
  licenseCode: string;
  sourceUrl: string;
}

const LICENSE_LABEL: Record<string, string> = {
  cc0: 'CC0',
  'cc-by': 'CC BY',
  'cc-by-sa': 'CC BY-SA',
};

// A tiny ⓘ badge pinned to the corner of a photo. Tap to reveal
// photographer + license + source link. Satisfies CC attribution
// (one tap away) and is itself a small lesson (real photographers,
// real citizen-science database). Place inside a `relative` container.
export default function AttributionBadge({
  attribution,
}: { attribution: PhotoAttribution }) {
  const [open, setOpen] = useState(false);

  // No attribution data (e.g. emoji-fallback placeholder) → render nothing.
  if (!attribution || (!attribution.photographer && !attribution.sourceUrl)) {
    return null;
  }

  const license = LICENSE_LABEL[attribution.licenseCode] ?? attribution.licenseCode;

  return (
    <div className="absolute bottom-1.5 right-1.5 z-10">
      <button
        type="button"
        aria-label="Photo information"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="flex items-center justify-center rounded-full bg-bark/55 text-cream text-xs font-bold backdrop-blur-sm"
        style={{ width: 22, height: 22, touchAction: 'manipulation' }}
      >
        ⓘ
      </button>

      {open && (
        <>
          {/* click-away catcher */}
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          />
          <div
            className="absolute bottom-7 right-0 z-20 w-48 rounded-xl bg-cream border border-bark/20 shadow-lg p-3 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {attribution.photographer && (
              <div className="text-bark text-xs mb-1">
                Photo by <span className="font-semibold">{attribution.photographer}</span>
              </div>
            )}
            <div className="text-bark/70 text-[11px] mb-1.5">License: {license}</div>
            {attribution.sourceUrl && (
              <a
                href={attribution.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-forest text-[11px] underline"
              >
                Source ↗
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}
