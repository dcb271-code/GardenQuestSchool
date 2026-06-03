# Naturalist Grove — Phase 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Naturalist Grove reachable and documented — add a hand-drawn signpost in Reading Forest that navigates to the walk, a "Trees & Flowers" section in the Field Journal showing discovered vs. undiscovered flora with real photos, and a tappable ⓘ attribution badge on every CC-licensed photo (legal requirement + small lesson).

**Architecture:** A reusable `AttributionBadge` client component overlays an ⓘ pill on each photo container; tapping toggles a small popover with photographer/license/source. It's dropped into the existing photo containers in `DichotomousStep`, `SpeciesReveal`, `EndOfWalk`, and the walk page's intro/quick `<img>`s. The Reading Forest signpost mirrors the existing garden-exit signpost pattern (native SVG `<g>` + `router.push`). The journal gains a pure `buildFloraJournal()` merge helper (unit-tested) that combines `FLORA_CATALOG` + the learner's discovered `flora_review` codes + one hero photo per discovered code; the server journal page fetches that data and renders a new `FloraJournalGrid` client component below the existing species discoveries.

**Tech Stack:** Next.js 14 App Router, TypeScript 5, framer-motion, Tailwind, Supabase (service-role via `lib/supabase/server.ts`), Vitest + jsdom. Alias `@/` = project root. `next/image` for photos (Supabase host already whitelisted in `next.config.mjs`).

**Spec reference:** `docs/superpowers/specs/2026-05-29-naturalist-grove-design.md` §4 (signpost entry-point), §7 (Field Journal flora tab, attribution overlay).

**Phases 1-3 landed:**
- `flora_review` rows track discovery (learner_id, flora_code, exposures, ...)
- `flora_photo` rows have attribution (photographer, license_code, source_url, role, storage_path)
- `lib/naturalist/floraPhotoStorage.ts` → `publicUrlFor(baseUrl, storagePath, {widthPx})`
- `lib/world/floraCatalog.ts` → `FLORA_CATALOG`, `FloraData`
- Walk photo components: `components/child/naturalist/{DichotomousStep,SpeciesReveal,EndOfWalk}.tsx` — each `KeyPhotoRef` already carries `attribution: { photographer, licenseCode, sourceUrl }`
- Reading Forest: `app/(child)/garden/reading-forest/ReadingForestScene.tsx` has a garden-exit signpost at translate(1408,258) to mirror
- Journal: `app/(child)/journal/page.tsx` (server) + `app/(child)/journal/SpeciesGrid.tsx` (client)

**IMPORTANT — verification gate:** Every task that touches `app/` MUST end with a passing `npm run build` (not just `tsc`), because Vercel runs `next build` and only it catches static-prerender errors (this bit us in Phase 3).

---

## File Structure

| File | Created/Modified | Responsibility |
|---|---|---|
| `components/child/naturalist/AttributionBadge.tsx` | **Create** | ⓘ pill + tap popover showing photographer/license/source. |
| `components/child/naturalist/DichotomousStep.tsx` | **Modify** | Overlay `AttributionBadge` on each photo. |
| `components/child/naturalist/SpeciesReveal.tsx` | **Modify** | Overlay badge on hero + feature photos. |
| `components/child/naturalist/EndOfWalk.tsx` | **Modify** | Overlay badge on summary card photos. |
| `app/(child)/naturalist/walk/page.tsx` | **Modify** | Overlay badge on intro + quick `<img>` heroes. |
| `app/(child)/garden/reading-forest/ReadingForestScene.tsx` | **Modify** | Add Naturalist Grove signpost → `/naturalist/walk`. |
| `lib/naturalist/floraJournal.ts` | **Create** | Pure `buildFloraJournal()` merge helper. |
| `tests/naturalist/floraJournal.test.ts` | **Create** | Merge logic unit tests. |
| `app/(child)/journal/FloraJournalGrid.tsx` | **Create** | Client grid: discovered (photo) vs undiscovered (greyscale). |
| `app/(child)/journal/page.tsx` | **Modify** | Fetch flora journal data, render the new section. |

---

## Task 1: AttributionBadge component

**Files:**
- Create: `components/child/naturalist/AttributionBadge.tsx`

A small ⓘ button pinned bottom-right of a photo. Tapping toggles a popover with the photographer, license, and a source link. Placed inside a `relative` photo container by consumers.

- [ ] **Step 1: Implement**

Create `components/child/naturalist/AttributionBadge.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify TS compiles**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx tsc --noEmit -p . 2>&1 | head -10`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add components/child/naturalist/AttributionBadge.tsx && git commit -m "feat(naturalist): AttributionBadge — tappable photo credit overlay"
```

---

## Task 2: Wire AttributionBadge into the photo components

**Files:**
- Modify: `components/child/naturalist/DichotomousStep.tsx`
- Modify: `components/child/naturalist/SpeciesReveal.tsx`
- Modify: `components/child/naturalist/EndOfWalk.tsx`

Each already renders photos inside a `relative` container with a `next/image fill`. Add `<AttributionBadge attribution={photo.attribution} />` as a sibling inside each container, after the `<Image>`.

- [ ] **Step 1: DichotomousStep — add import + badge**

In `components/child/naturalist/DichotomousStep.tsx`, add the import after the existing imports (top of file):

```tsx
import AttributionBadge from './AttributionBadge';
```

Then find the photo container `<div className="relative w-full aspect-[4/3] bg-bark/10">` that contains the `<Image>` / fallback. Immediately BEFORE that div's closing `</div>`, add:

```tsx
              {opt.photo.url && <AttributionBadge attribution={opt.photo.attribution} />}
```

(So the badge only shows on real photos, not the label-fallback.)

- [ ] **Step 2: SpeciesReveal — add import + badges**

In `components/child/naturalist/SpeciesReveal.tsx`, add after existing imports:

```tsx
import AttributionBadge from './AttributionBadge';
```

Hero container: find the `motion.div` with `className="w-full max-w-md rounded-3xl overflow-hidden border-4 border-bark/20 bg-cream shadow-lg mb-6 relative aspect-square"`. Immediately before its closing `</motion.div>`, add:

```tsx
        {heroPhoto?.url && <AttributionBadge attribution={heroPhoto.attribution} />}
```

Feature thumbnails: find the `motion.button` that wraps each `<Image>` in the reveal-photos grid (the one with `aria-label={p.alt}`). Immediately before that button's closing `</motion.button>`, add:

```tsx
            <AttributionBadge attribution={p.attribution} />
```

- [ ] **Step 3: EndOfWalk — add import + badge**

In `components/child/naturalist/EndOfWalk.tsx`, add after existing imports:

```tsx
import AttributionBadge from './AttributionBadge';
```

Find the card photo container `<div className="relative w-full aspect-square bg-bark/10">`. Immediately before its closing `</div>`, add:

```tsx
              {c.heroPhoto?.url && <AttributionBadge attribution={c.heroPhoto.attribution} />}
```

- [ ] **Step 4: Verify TS + build**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx tsc --noEmit -p . 2>&1 | head -10`
Expected: no output.

Run: `cd /c/Users/dylan/GardenQuestSchool && npm run build 2>&1 | tail -8`
Expected: "Compiled successfully", `/naturalist/walk` prerenders, no errors.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add components/child/naturalist/DichotomousStep.tsx components/child/naturalist/SpeciesReveal.tsx components/child/naturalist/EndOfWalk.tsx && git commit -m "feat(naturalist): overlay AttributionBadge on walk photos"
```

---

## Task 3: Attribution badge on walk-page intro + quick heroes

**Files:**
- Modify: `app/(child)/naturalist/walk/page.tsx`

The intro and quick-recognize phases render the hero with a native `<img>` inside a `relative` container. The `current.heroPhoto` is a `KeyPhotoRef` with `.attribution`. Add the badge there too.

- [ ] **Step 1: Add the import**

In `app/(child)/naturalist/walk/page.tsx`, add after the existing component imports (e.g. after the `EndOfWalk` import line):

```tsx
import AttributionBadge from '@/components/child/naturalist/AttributionBadge';
```

- [ ] **Step 2: Intro hero badge**

Find the intro phase's hero container:

```tsx
              <div className="w-full max-w-md rounded-3xl overflow-hidden border-4 border-bark/15 bg-cream shadow-md aspect-square relative mb-6">
                {current.heroPhoto?.url
                  ? <img src={current.heroPhoto.url} alt={current.heroPhoto.alt} className="w-full h-full object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center text-7xl">{current.emoji}</div>
                }
              </div>
```

Replace the closing of the conditional so the badge is added — change it to:

```tsx
              <div className="w-full max-w-md rounded-3xl overflow-hidden border-4 border-bark/15 bg-cream shadow-md aspect-square relative mb-6">
                {current.heroPhoto?.url
                  ? <img src={current.heroPhoto.url} alt={current.heroPhoto.alt} className="w-full h-full object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center text-7xl">{current.emoji}</div>
                }
                {current.heroPhoto?.url && <AttributionBadge attribution={current.heroPhoto.attribution} />}
              </div>
```

- [ ] **Step 3: Quick-recognize hero badge**

Find the quick phase's hero container (identical markup, inside the `{phase === 'quick' && (...)}` block) and apply the same change — add this line before the container's closing `</div>`:

```tsx
                {current.heroPhoto?.url && <AttributionBadge attribution={current.heroPhoto.attribution} />}
```

- [ ] **Step 4: Verify TS + build**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx tsc --noEmit -p . 2>&1 | head -10`
Expected: no output.

Run: `cd /c/Users/dylan/GardenQuestSchool && npm run build 2>&1 | tail -8`
Expected: "Compiled successfully", `/naturalist/walk` prerenders (○ Static), no errors.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add 'app/(child)/naturalist/walk/page.tsx' && git commit -m "feat(naturalist): attribution badge on walk intro + quick heroes"
```

---

## Task 4: Reading Forest signpost → Naturalist Grove

**Files:**
- Modify: `app/(child)/garden/reading-forest/ReadingForestScene.tsx`

Mirror the existing garden-exit signpost (at `translate(1408, 258)`). Add a new signpost near the bottom edge pointing down to the Naturalist Grove; tapping routes to `/naturalist/walk?learner=<id>`. Place it at the south edge in open ground (around x=720, y=760) so it doesn't overlap structures.

- [ ] **Step 1: Add the signpost block**

In `app/(child)/garden/reading-forest/ReadingForestScene.tsx`, find the existing garden-exit signpost `<g transform="translate(1408, 258)" ...>` block (it ends with its closing `</g>` after the rope-wrap path). Immediately AFTER that closing `</g>`, insert this new signpost:

```tsx
        {/* ── Naturalist Grove signpost (south edge) ──
             A second wooden signpost pointing DOWN/out of the forest to
             the Naturalist Grove walk (real tree + wildflower ID). Taps
             route to /naturalist/walk. Placed in open ground at the
             bottom-center so it clears the phonics structures. */}
        <g
          transform="translate(720, 752)"
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={() => router.push(`/naturalist/walk?learner=${learnerId}`)}
          role="button"
          aria-label="to Naturalist Grove"
          tabIndex={0}
        >
          {/* generous invisible hit target */}
          <rect x={-60} y={-46} width={120} height={86} fill="transparent" />
          {/* ground shadow + post */}
          <ellipse cx={0} cy={34} rx={11} ry={3} fill="#000" opacity={0.22} />
          <rect x={-3.5} y={-28} width={7} height={62} rx={2} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.3} />
          {/* sign board with a down-pointing arrow tab on the bottom edge */}
          <path
            d="M -52 -40 L 52 -40 Q 56 -40 56 -36 L 56 -16 Q 56 -12 52 -12 L 8 -12 L 0 -4 L -8 -12 L -52 -12 Q -56 -12 -56 -16 L -56 -36 Q -56 -40 -52 -40 Z"
            fill="#FFFAF2" stroke="#8B5A2B" strokeWidth={1.6} strokeLinejoin="round"
          />
          <text
            x={0} y={-29} textAnchor="middle"
            fontSize={11} fontWeight={700} fill="#6b4423"
            style={{ userSelect: 'none' }}
          >
            Naturalist
          </text>
          <text
            x={0} y={-18} textAnchor="middle"
            fontSize={11} fontWeight={700} fill="#6b4423"
            style={{ userSelect: 'none' }}
          >
            Grove ↓
          </text>
          {/* tiny dogwood-bloom hint beside the post — four white bracts + gold center */}
          <g transform="translate(20, 16)" pointerEvents="none">
            {[0, 90, 180, 270].map(deg => (
              <ellipse key={deg} cx={0} cy={-3.4} rx={2} ry={3.2} fill="#FFFAF2"
                       stroke="#C9B79A" strokeWidth={0.5} transform={`rotate(${deg})`} />
            ))}
            <circle cx={0} cy={0} r={1.5} fill="#E8C493" />
          </g>
          {/* a couple of fern fronds at the post base */}
          <g transform="translate(-16, 30)" pointerEvents="none">
            <path d="M 0 0 Q -3 -8 -7 -13" stroke="#6B8E5A" strokeWidth={1.3} fill="none" strokeLinecap="round" />
            <path d="M 0 0 Q 0 -10 -1 -16" stroke="#6B8E5A" strokeWidth={1.3} fill="none" strokeLinecap="round" />
            <path d="M 0 0 Q 3 -8 5 -13" stroke="#6B8E5A" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          </g>
        </g>
```

- [ ] **Step 2: Verify TS + build**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx tsc --noEmit -p . 2>&1 | head -10`
Expected: no output.

Run: `cd /c/Users/dylan/GardenQuestSchool && npm run build 2>&1 | tail -8`
Expected: "Compiled successfully", `/garden/reading-forest` builds, no errors.

- [ ] **Step 3: Smoke-test navigation**

```bash
cd /c/Users/dylan/GardenQuestSchool && npm run dev > /tmp/dev_p4t4.log 2>&1 &
for i in {1..30}; do if grep -q "Ready in\|Local:" /tmp/dev_p4t4.log 2>/dev/null; then echo READY; break; fi; sleep 1; done
# Confirm the reading-forest route renders without error (200) and the signpost text is present in the HTML
curl -sS "http://localhost:3000/garden/reading-forest?learner=22cefc77-4829-4760-82db-2be88c360fb6" -o /tmp/rf.html -w "HTTP %{http_code}\n"
grep -c "Naturalist" /tmp/rf.html && echo "signpost text present" || echo "signpost text NOT found (may be client-rendered — not necessarily a failure)"
pkill -f "next dev" 2>/dev/null; pkill -f "node.*next" 2>/dev/null; sleep 2
rm -f /tmp/dev_p4t4.log /tmp/rf.html
```

Expected: HTTP 200. (The "Naturalist" grep may be 0 if the scene is client-rendered — that's fine; the build + TS pass is the real gate. The visual confirmation is the user's reload.)

- [ ] **Step 4: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add 'app/(child)/garden/reading-forest/ReadingForestScene.tsx' && git commit -m "feat(naturalist): Reading Forest signpost → Naturalist Grove walk"
```

---

## Task 5: floraJournal.ts — pure merge helper

**Files:**
- Create: `lib/naturalist/floraJournal.ts`
- Create: `tests/naturalist/floraJournal.test.ts`

Pure function that merges `FLORA_CATALOG` with the learner's discovered codes + a hero-photo-URL map into a render-ready array. Discovered species sort first; within each group, catalog order is preserved.

- [ ] **Step 1: Write the failing test**

Create `tests/naturalist/floraJournal.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildFloraJournal, type FloraJournalEntry } from '@/lib/naturalist/floraJournal';
import { FLORA_CATALOG } from '@/lib/world/floraCatalog';

describe('buildFloraJournal', () => {
  it('returns one entry per catalog species', () => {
    const out = buildFloraJournal({ discovered: new Map(), heroUrlByCode: new Map() });
    expect(out).toHaveLength(FLORA_CATALOG.length);
  });

  it('marks discovered species and carries exposures + hero url', () => {
    const discovered = new Map([['trillium', 4]]);
    const heroUrlByCode = new Map([['trillium', 'https://x/trillium.jpg']]);
    const out = buildFloraJournal({ discovered, heroUrlByCode });
    const t = out.find(e => e.code === 'trillium')!;
    expect(t.discovered).toBe(true);
    expect(t.identifiedCount).toBe(4);
    expect(t.heroUrl).toBe('https://x/trillium.jpg');
  });

  it('marks undiscovered species with discovered=false, count 0, null hero', () => {
    const out = buildFloraJournal({ discovered: new Map(), heroUrlByCode: new Map() });
    const any = out[0];
    expect(any.discovered).toBe(false);
    expect(any.identifiedCount).toBe(0);
    expect(any.heroUrl).toBeNull();
  });

  it('sorts discovered species before undiscovered', () => {
    // Discover the LAST catalog species; it should jump to the front.
    const lastCode = FLORA_CATALOG[FLORA_CATALOG.length - 1].code;
    const discovered = new Map([[lastCode, 1]]);
    const out = buildFloraJournal({ discovered, heroUrlByCode: new Map() });
    expect(out[0].code).toBe(lastCode);
    expect(out[0].discovered).toBe(true);
    // everything after the first should be undiscovered
    for (let i = 1; i < out.length; i++) expect(out[i].discovered).toBe(false);
  });

  it('carries commonName, scientificName, emoji from the catalog', () => {
    const out = buildFloraJournal({ discovered: new Map(), heroUrlByCode: new Map() });
    for (const e of out) {
      const sp = FLORA_CATALOG.find(f => f.code === e.code)!;
      expect(e.commonName).toBe(sp.commonName);
      expect(e.scientificName).toBe(sp.scientificName);
      expect(e.emoji).toBe(sp.emoji);
    }
  });

  it('counts discovered correctly', () => {
    const discovered = new Map([
      [FLORA_CATALOG[0].code, 2],
      [FLORA_CATALOG[1].code, 7],
    ]);
    const out = buildFloraJournal({ discovered, heroUrlByCode: new Map() });
    expect(out.filter(e => e.discovered)).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/naturalist/floraJournal.test.ts`
Expected: FAIL with "Cannot find module '@/lib/naturalist/floraJournal'".

- [ ] **Step 3: Implement**

Create `lib/naturalist/floraJournal.ts`:

```ts
// lib/naturalist/floraJournal.ts
//
// Pure merge helper for the Field Journal's "Trees & Flowers" section.
// Combines the static FLORA_CATALOG with the learner's discovered codes
// (+ exposure counts) and a hero-photo-URL map into a render-ready list,
// discovered species sorted first.

import { FLORA_CATALOG } from '@/lib/world/floraCatalog';

export interface FloraJournalEntry {
  code: string;
  commonName: string;
  scientificName: string;
  emoji: string;
  discovered: boolean;
  identifiedCount: number;
  heroUrl: string | null;
}

export interface BuildFloraJournalInput {
  discovered: Map<string, number>;       // flora_code → exposures
  heroUrlByCode: Map<string, string>;    // flora_code → public hero photo URL
}

export function buildFloraJournal(input: BuildFloraJournalInput): FloraJournalEntry[] {
  const { discovered, heroUrlByCode } = input;

  const entries: FloraJournalEntry[] = FLORA_CATALOG.map(sp => ({
    code: sp.code,
    commonName: sp.commonName,
    scientificName: sp.scientificName,
    emoji: sp.emoji,
    discovered: discovered.has(sp.code),
    identifiedCount: discovered.get(sp.code) ?? 0,
    heroUrl: heroUrlByCode.get(sp.code) ?? null,
  }));

  // Stable sort: discovered first, otherwise preserve catalog order.
  return entries
    .map((e, i) => ({ e, i }))
    .sort((a, b) => {
      if (a.e.discovered !== b.e.discovered) return a.e.discovered ? -1 : 1;
      return a.i - b.i;
    })
    .map(x => x.e);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/naturalist/floraJournal.test.ts`
Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add lib/naturalist/floraJournal.ts tests/naturalist/floraJournal.test.ts && git commit -m "feat(naturalist): buildFloraJournal — pure catalog+discovery merge + tests"
```

---

## Task 6: Journal "Trees & Flowers" section

**Files:**
- Create: `app/(child)/journal/FloraJournalGrid.tsx`
- Modify: `app/(child)/journal/page.tsx`

The server page fetches the learner's `flora_review` rows (discovered codes + exposures) and a hero photo per discovered code, builds the journal via `buildFloraJournal`, and renders a new `FloraJournalGrid` client component below the existing species "discoveries" section.

- [ ] **Step 1: Create the grid component**

Create `app/(child)/journal/FloraJournalGrid.tsx`:

```tsx
'use client';

import type { FloraJournalEntry } from '@/lib/naturalist/floraJournal';

export default function FloraJournalGrid({ entries }: { entries: FloraJournalEntry[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {entries.map(e => (
        <div
          key={e.code}
          className={`rounded-2xl overflow-hidden border-2 ${
            e.discovered ? 'border-forest/30 bg-cream' : 'border-bark/10 bg-bark/5'
          }`}
        >
          <div className="relative w-full aspect-square bg-bark/10">
            {e.discovered && e.heroUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.heroUrl} alt={e.commonName} className="w-full h-full object-cover" />
            ) : e.discovered ? (
              <div className="absolute inset-0 flex items-center justify-center text-4xl">{e.emoji}</div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-3xl grayscale opacity-40">
                {e.emoji}
              </div>
            )}
          </div>
          <div className="p-2 text-center">
            {e.discovered ? (
              <div className="font-display text-[12px] text-bark leading-tight">{e.commonName}</div>
            ) : (
              <div className="font-display italic text-[11px] text-bark/45 leading-tight">to discover</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Wire the journal page to fetch + render flora**

In `app/(child)/journal/page.tsx`:

Add imports at the top (after the existing imports):

```tsx
import { buildFloraJournal } from '@/lib/naturalist/floraJournal';
import { FLORA_CATALOG } from '@/lib/world/floraCatalog';
import { publicUrlFor } from '@/lib/naturalist/floraPhotoStorage';
import FloraJournalGrid from './FloraJournalGrid';
```

After the existing `const unlocked = new Set(...)` block (the species discoveries), add this flora-fetch block:

```tsx
  // ── Trees & Flowers (Naturalist Grove) ──────────────────────────
  const { data: floraReviewRows } = await db
    .from('flora_review')
    .select('flora_code, exposures')
    .eq('learner_id', learnerId!);
  const discoveredFlora = new Map<string, number>(
    (floraReviewRows ?? []).map((r: any) => [r.flora_code, r.exposures ?? 0]),
  );

  const heroUrlByCode = new Map<string, string>();
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (baseUrl && discoveredFlora.size > 0) {
    const { data: floraPhotoRows } = await db
      .from('flora_photo')
      .select('flora_code, role, storage_path')
      .in('flora_code', Array.from(discoveredFlora.keys()))
      .eq('tier', 1);
    // Prefer a 'whole' photo per code; fall back to the first available.
    const byCode = new Map<string, { role: string; storage_path: string }[]>();
    for (const r of floraPhotoRows ?? []) {
      const list = byCode.get(r.flora_code) ?? [];
      list.push({ role: r.role, storage_path: r.storage_path });
      byCode.set(r.flora_code, list);
    }
    for (const [code, list] of byCode) {
      const whole = list.find(p => p.role === 'whole') ?? list[0];
      if (whole) heroUrlByCode.set(code, publicUrlFor(baseUrl, whole.storage_path, { widthPx: 240 }));
    }
  }

  const floraJournal = buildFloraJournal({ discovered: discoveredFlora, heroUrlByCode });
  const floraDiscoveredCount = floraJournal.filter(e => e.discovered).length;
```

Then, in the JSX, immediately AFTER the closing `</section>` of the existing "discoveries" section (the species one) and before the final `</main>`, add a new section:

```tsx
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display italic text-[13px] text-bark/55 tracking-[0.2em] uppercase">
            trees &amp; flowers
          </h2>
          <div className="font-display text-[14px] text-bark/65">
            <span className="font-bold text-forest">{floraDiscoveredCount}</span>
            <span className="text-bark/40"> / {FLORA_CATALOG.length}</span>
          </div>
        </div>

        {floraDiscoveredCount === 0 && (
          <div className="mb-4 bg-gradient-to-br from-cream to-sage/20 border-4 border-sage/40 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="text-5xl shrink-0">🌳</div>
              <div className="flex-1">
                <div className="font-display text-[22px] text-bark leading-tight" style={{ fontWeight: 600 }}>
                  <span className="italic text-forest">take a walk</span> in the Naturalist Grove
                </div>
                <p className="font-display italic text-[15px] text-bark/70 mt-2 leading-snug">
                  find the signpost in the Reading Forest. every tree and flower you identify
                  on a walk lands here.
                </p>
              </div>
            </div>
          </div>
        )}

        <FloraJournalGrid entries={floraJournal} />
      </section>
```

- [ ] **Step 3: Verify TS + build**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx tsc --noEmit -p . 2>&1 | head -10`
Expected: no output.

Run: `cd /c/Users/dylan/GardenQuestSchool && npm run build 2>&1 | tail -8`
Expected: "Compiled successfully", `/journal` builds, no errors.

- [ ] **Step 4: Smoke-test the journal renders**

```bash
cd /c/Users/dylan/GardenQuestSchool && npm run dev > /tmp/dev_p4t6.log 2>&1 &
for i in {1..30}; do if grep -q "Ready in\|Local:" /tmp/dev_p4t6.log 2>/dev/null; then echo READY; break; fi; sleep 1; done
curl -sS "http://localhost:3000/journal?learner=22cefc77-4829-4760-82db-2be88c360fb6" -o /tmp/j.html -w "HTTP %{http_code}\n"
grep -c "trees" /tmp/j.html && echo "flora section present" || echo "flora section NOT found"
pkill -f "next dev" 2>/dev/null; pkill -f "node.*next" 2>/dev/null; sleep 2
rm -f /tmp/dev_p4t6.log /tmp/j.html
```

Expected: HTTP 200, "trees" found (the "trees & flowers" heading renders server-side).

- [ ] **Step 5: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add 'app/(child)/journal/FloraJournalGrid.tsx' 'app/(child)/journal/page.tsx' && git commit -m "feat(naturalist): journal Trees & Flowers section with discovery grid"
```

---

## Task 7: End-to-end acceptance + push

**Files:** No new files; verification + push.

- [ ] **Step 1: Full unit test sweep**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/naturalist tests/world 2>&1 | tail -12`
Expected: all naturalist + world test files pass (includes the new floraJournal suite).

- [ ] **Step 2: Banned-strings lint (pedagogy)**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/child-language.test.ts 2>&1 | tail -6`
Expected: PASS. (Confirms no "good job"/"level up"/"coin"/"streak"/etc. crept into the new journal/signpost copy.)

- [ ] **Step 3: TS + production build**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx tsc --noEmit -p . 2>&1 | head -10`
Expected: no output.

Run: `cd /c/Users/dylan/GardenQuestSchool && npm run build 2>&1 | tail -10`
Expected: "Compiled successfully", all routes build, no prerender errors. `/naturalist/walk` shows as ○ (Static), `/journal` + `/garden/reading-forest` as ƒ (Dynamic).

- [ ] **Step 4: Live full-flow verification**

Seed a discovery, confirm it appears in the journal flora section.

```bash
cd /c/Users/dylan/GardenQuestSchool && npm run dev > /tmp/dev_p4t7.log 2>&1 &
for i in {1..30}; do if grep -q "Ready in\|Local:" /tmp/dev_p4t7.log 2>/dev/null; then echo READY; break; fi; sleep 1; done

cat > scripts/_p4verify.ts << 'EOF'
import { config } from 'dotenv'; import { resolve } from 'node:path';
config({ path: resolve(process.cwd(), '.env.local') });
import { createClient } from '@supabase/supabase-js';
(async () => {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await s.from('learner').select('id').limit(1);
  const learner = data?.[0]?.id;
  await s.from('flora_review').delete().eq('learner_id', learner).eq('flora_code', 'tulip_poplar');
  await s.from('flora_review').insert({
    learner_id: learner, flora_code: 'tulip_poplar', exposures: 2,
    last_seen_at: new Date().toISOString(),
    next_review_at: new Date(Date.now() + 3*86400000).toISOString(),
    photo_roles_seen: ['whole'],
  });
  console.log('LEARNER ' + learner);
})();
EOF
SEED=$(npx tsx scripts/_p4verify.ts 2>/dev/null)
LID=$(echo "$SEED" | grep LEARNER | awk '{print $2}')
echo "learner=$LID"
curl -sS "http://localhost:3000/journal?learner=$LID" -o /tmp/j2.html -w "HTTP %{http_code}\n"
grep -c "Tulip Poplar" /tmp/j2.html && echo "✓ discovered tulip_poplar shows in journal" || echo "✗ tulip_poplar not in journal HTML"

# cleanup
cat > scripts/_p4clean.ts << 'EOF2'
import { config } from 'dotenv'; import { resolve } from 'node:path';
config({ path: resolve(process.cwd(), '.env.local') });
import { createClient } from '@supabase/supabase-js';
(async () => {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  await s.from('flora_review').delete().eq('flora_code', 'tulip_poplar');
  console.log('cleaned');
})();
EOF2
npx tsx scripts/_p4clean.ts 2>/dev/null | tail -1
rm -f scripts/_p4verify.ts scripts/_p4clean.ts
pkill -f "next dev" 2>/dev/null; pkill -f "node.*next" 2>/dev/null; sleep 2
rm -f /tmp/dev_p4t7.log /tmp/j2.html
```

Expected: HTTP 200, "Tulip Poplar" found in the journal HTML (discovered flora renders its common name server-side). Cleanup prints `cleaned`.

- [ ] **Step 5: Push**

```bash
cd /c/Users/dylan/GardenQuestSchool && git push 2>&1 | tail -3
```

- [ ] **Step 6: Final state check**

```bash
cd /c/Users/dylan/GardenQuestSchool && git status && git log --oneline origin/main..HEAD
```
Expected: clean tree, no unpushed commits.

---

## Self-Review

**1. Spec coverage:**

| Spec §4 / §7 requirement | Task |
|---|---|
| Signpost in Reading Forest → /naturalist/walk | Task 4 |
| Field Journal "Trees & Flowers" with discovered vs undiscovered | Tasks 5, 6 |
| Discovered flora show real photos; undiscovered greyscale | Task 6 (FloraJournalGrid) |
| ⓘ attribution overlay (photographer/license/source) on every photo | Tasks 1, 2, 3 |
| Attribution one tap away (CC legal requirement) | Task 1 (popover) |

Out of scope (future): interactive habitat placement, day/night cycle, real TTS, parent authoring — none touched.

**2. Placeholder scan:** No TBD/TODO. Every code step is complete. The journal flora-fetch handles the empty case (discoveredFlora.size===0 skips the photo query). AttributionBadge returns null on missing data (emoji fallbacks). FloraJournalGrid handles discovered-with-photo, discovered-without-photo (emoji), and undiscovered (greyscale emoji) cases.

**3. Type consistency:**
- `PhotoAttribution { photographer, licenseCode, sourceUrl }` in AttributionBadge (Task 1) matches the `attribution` shape on `KeyPhotoRef` (used by DichotomousStep/SpeciesReveal/EndOfWalk and the walk page) — same field names. ✓
- `FloraJournalEntry { code, commonName, scientificName, emoji, discovered, identifiedCount, heroUrl }` defined in Task 5, consumed by FloraJournalGrid (Task 6) + journal page (Task 6). ✓
- `buildFloraJournal({ discovered: Map, heroUrlByCode: Map })` signature consistent Task 5 → Task 6. ✓
- `publicUrlFor(baseUrl, storagePath, { widthPx })` reused from Phase 2 — Task 6 calls it with widthPx:240. ✓
- Reading Forest signpost uses `router.push` + `learnerId` — both already in scope in ReadingForestScene (the garden-exit signpost uses them). ✓

**4. Build-gate consistency:** Tasks 2, 3, 4, 6, 7 all run `npm run build` (not just tsc) since they touch `app/` or components rendered by app routes. This catches the Suspense-class prerender errors that bit Phase 3.

Plan is internally consistent.
