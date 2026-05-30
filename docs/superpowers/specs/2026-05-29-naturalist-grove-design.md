# Naturalist Grove — Design Spec

**Date:** 2026-05-29
**Author:** Dylan Brock
**Learners:** Cecily (primary), Esme (fast-follow)
**Status:** Design approved, ready for implementation planning
**Branch entry-point:** signpost off Reading Forest → `/naturalist/walk`

---

## 1. Executive Summary

A new module that teaches Cecily to identify real trees and wildflowers in her environment (Louisville KY + Red River Gorge), using **real photographs** rather than the project's hand-drawn SVG aesthetic. The learner walks through a **dichotomous field-key** (yes/no botanical questions with comparison photos), arrives at a species name, and adds it to her Field Journal.

Three pedagogical commitments shape every choice:

1. **No quiz framing.** There are no "wrong" branches in the key — any path lands on *some* species, and that's the species she found.
2. **Spaced repetition baked in.** Visual pattern recognition requires repeated, interleaved exposure with progressively harder photos. The walk picker schedules species by spacing intervals (SM-2 lite); each re-exposure surfaces a different photo role (leaf vs bark vs whole-tree vs flower).
3. **Real biological accuracy.** All photos come from CC-licensed iNaturalist (research-grade community-verified) and Wikimedia Commons. No scraping, no mislabeling, no copyright risk.

The module is **not a map**. It's a focused activity that lives at `/naturalist/walk`, reached by tapping a hand-drawn wooden signpost on the south edge of the Reading Forest scene.

---

## 2. Goals & Non-Goals

### Goals (V1)
- Cecily can identify ~55 trees + wildflowers + ferns native to Louisville KY + Red River Gorge
- Each walk session is 5-8 min, identifies 2-4 species via dichotomous key
- Spaced repetition surfaces species she's seen before at expanding intervals
- Each species re-exposure shows a different photo angle (leaf → bark → fruit → whole)
- Real photo attribution always one tap away (legal CC requirement, also a small lesson)
- All photos cached in Supabase Storage; walks work offline once loaded
- Catalog is **seasonally accurate** — winter walks surface evergreens + distinctive bark, spring walks surface ephemerals, etc.

### Non-Goals
- Camera-based AI species ID (iNat's own app does this; not this module's purpose)
- Bird calls or animal sound ID
- GPS / geo-tagged "what's near you right now" features
- Parent-contribution UI (curation by you is fine for V1)
- Achievement badges, leaderboards, or "mastery %" framing
- Live-fetch photos at runtime (always cached at content-prep time)
- Pruning / non-native invasive species coverage

---

## 3. Pedagogical Model

### Dichotomous field-key
The activity mirrors how real botanists identify plants. Each yes/no choice narrows the possibilities. There is no objectively correct path — only the path that fits the specimen she's looking at.

Example walk path for Eastern Hemlock:
```
Are the leaves...
  ☐ long thin needles      ← TAP
  ☐ flat broad leaves

Are the needles arranged...
  ☐ in bundles (2, 3, or 5)
  ☐ flat along the twig    ← TAP

Are the cones...
  ☐ very small (under an inch)  ← TAP
  ☐ longer (1-3 inches)

→ Eastern Hemlock
```

If Cecily had chosen "long needles in bundles of 5" at step 2, she would have arrived at Eastern White Pine instead — a real-world correct call. No path is wrong; some paths are wrong for *this specimen*.

### No-quiz guardrails
- No score, no streak, no "% correct" anywhere.
- No "try again!" if she goes down a path her specimen doesn't fit — the system just shows her the species she landed on.
- The reveal screen looks identical regardless of how many steps it took.
- The Field Journal records *how many times* she's identified each species (documentation), never *how well*.

### Spaced + interleaved repetition (the new layer)
Visual pattern recognition for ~60 species cannot be learned from one exposure each. The walk picker schedules species at expanding intervals (1d → 3d → 7d → 14d → 30d → 60d), and each re-exposure rotates through a different photo role so she sees a Red Maple's leaf, then its bark, then its samaras, then its whole-tree silhouette across her first ~5 exposures.

After 5+ exposures to a species, an optional **quick-recognize shortcut** appears at the start of that species block — "Do you already know this one?" — supporting retrieval practice (the strongest predictor of long-term recall in cognitive science). Either choice lands on the species name; the choice itself is the lesson.

### Virtue gem touchpoints (existing system)
- **Noticing** gem when she taps multiple feature captions on the reveal screen.
- **Curiosity** gem when she opens the journal's flora tab unprompted between walks.
- No new gems specific to this module.

---

## 4. Architecture

### Routing + entry-point
- Reading Forest scene (`app/(child)/garden/reading-forest/ReadingForestScene.tsx`) gets a new hand-drawn signpost on the south edge: a weathered wooden post with arrows pointing to Reading Grove (existing) and a new arrow pointing to Naturalist Grove with a tiny dogwood-bloom motif.
- Tapping the signpost → `router.push('/naturalist/walk?learner=...')`.
- The walk page is **not a map**. It's a focused activity UI.

### New files

| File | Purpose |
|---|---|
| `lib/world/floraCatalog.ts` | The 55-species catalog (parallel to `speciesCatalog.ts`). |
| `lib/world/dichotomousKey.ts` | Shared decision tree: every species code is a leaf. |
| `lib/naturalist/spacing.ts` | SM-2 lite intervals + walk-selection algorithm. |
| `lib/naturalist/photoCache.ts` | Helpers that build Supabase Storage URLs + attribution objects. |
| `scripts/seed-flora-photos.ts` | One-time content-prep CLI: harvests candidate photos from iNat + Wikimedia. |
| `app/(child)/naturalist/walk/page.tsx` | The walk session page. |
| `app/api/naturalist/walk/route.ts` | Picks species + serves photo URLs + records exposures. |
| `app/(parent)/parent/flora-photos/page.tsx` | Manual curation UI (parent-zone, matches existing parent-zone routing convention). |
| `components/child/naturalist/DichotomousStep.tsx` | Single yes/no key step (photo pair + question). |
| `components/child/naturalist/SpeciesReveal.tsx` | Reveal screen with feature photos + facts. |
| `components/child/naturalist/WalkProgress.tsx` | The three pacing dots. |
| `components/child/naturalist/PhotoAttribution.tsx` | The ⓘ tap target overlay. |

### Modified files
- `app/(child)/garden/reading-forest/ReadingForestScene.tsx` — add the signpost.
- `app/(child)/journal/page.tsx` — add a "Trees & Flowers" tab.

### Supabase schema additions
```sql
create table flora_review (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learner(id),
  flora_code text not null,
  exposures int not null default 0,
  last_seen_at timestamptz,
  next_review_at timestamptz,
  ease_factor float not null default 2.5,
  photo_roles_seen text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique(learner_id, flora_code)
);
create index on flora_review (learner_id, next_review_at);

create table flora_photo (
  id uuid primary key default gen_random_uuid(),
  flora_code text not null,
  role text not null,            -- 'whole'|'leaf'|'bark'|'flower'|'fruit'
  tier int not null default 1,   -- 1=clear, 2=in-habitat, 3=hard
  storage_path text not null,
  source text not null,          -- 'inat' | 'wikimedia'
  source_url text not null,
  photographer text,
  license_code text not null,    -- 'cc0'|'cc-by'|'cc-by-sa'
  alt_text text not null,
  created_at timestamptz not null default now()
);
create index on flora_photo (flora_code, role, tier);

-- Optional: generic comparison photos used in dichotomous key nodes
-- (not species-specific — illustrate "needle vs broadleaf" etc.)
create table key_node_photo (
  id uuid primary key default gen_random_uuid(),
  node_id text not null,        -- 'root.leftLabel' etc.
  storage_path text not null,
  source text not null,
  source_url text not null,
  photographer text,
  license_code text not null,
  alt_text text not null,
  created_at timestamptz not null default now()
);
```

---

## 5. Data Model

### `FloraData`
```ts
type FloraKind = 'tree' | 'flower' | 'fern' | 'shrub';
type Season = 'spring' | 'summer' | 'fall' | 'winter';
type LocalTier = 'hyper_local' | 'canonical_native';
type PhotoRole = 'whole' | 'leaf' | 'bark' | 'flower' | 'fruit';

export interface FloraData {
  code: string;                  // 'red_maple', 'eastern_redbud'
  commonName: string;
  scientificName: string;
  kind: FloraKind;
  localTier: LocalTier;
  emoji: string;                 // fallback / journal chip
  seasons: Season[];             // when this species is visibly identifiable
  notableFeatures: string[];     // ['lobed leaf', 'red samaras', 'smooth grey bark']
  facts: string[];               // 2-3 short kid-readable facts
  wikiSpecies: string;           // 'Acer_rubrum'
  inatTaxonId: number;           // 47851
  photoRoles: PhotoRole[];       // which roles exist for this species
}

export const FLORA_CATALOG: FloraData[] = [
  // ... 55 entries
];
```

### Dichotomous key — single shared tree
```ts
type KeyChild = string | { species: string };  // node id, or terminal leaf

interface KeyNode {
  id: string;
  question: string;              // "Look at the leaves. Are they..."
  leftLabel: string;
  rightLabel: string;
  leftPhotoNodeId: string;       // looks up generic key_node_photo
  rightPhotoNodeId: string;
  leftChild: KeyChild;
  rightChild: KeyChild;
}

export const DICHOTOMOUS_KEY: Record<string, KeyNode> = {
  root: {
    id: 'root',
    question: "Look at the leaves. Are they...",
    leftLabel: "...long thin needles?",
    rightLabel: "...flat broad leaves?",
    leftPhotoNodeId: 'root.left',
    rightPhotoNodeId: 'root.right',
    leftChild: 'conifer.needle_arrangement',
    rightChild: 'broadleaf.lobed_or_simple',
  },
  // ... ~60 more nodes
};
```

### Walk-session structure (returned by the walk API)
```ts
interface WalkSpecies {
  position: 1 | 2 | 3 | 4;
  flora_code: string;
  exposures: number;
  showQuickRecognize: boolean;   // true when exposures >= 5
  heroPhoto: PhotoRef;           // full-bleed hero on intro
  keyPath: string[];             // node ids she walks through
  revealPhotos: PhotoRef[];      // 3 feature photos on the reveal screen
}

interface PhotoRef {
  url: string;                   // Supabase Storage signed URL
  alt: string;
  attribution: {
    photographer: string;
    licenseCode: string;
    sourceUrl: string;
  };
}

interface WalkSession {
  id: string;                    // uuid for this walk (recorded in flora_review on completion)
  species: WalkSpecies[];        // 2-4 entries
}
```

---

## 6. Walk Selection Algorithm

```ts
// app/api/naturalist/walk/route.ts (sketch)
async function selectWalkSpecies(learnerId: string): Promise<string[]> {
  const season = currentSeason();
  const N = randInt(2, 4);                   // 2-4 species per walk

  // Bucket A: DUE for review (50% weight)
  const due = await supabase
    .from('flora_review')
    .select('flora_code, exposures, photo_roles_seen')
    .eq('learner_id', learnerId)
    .lte('next_review_at', new Date().toISOString())
    .filter('flora_code', 'in', floraCodesInSeason(season))
    .order('next_review_at', { ascending: true })
    .limit(20);

  // Bucket B: NEW (never seen by this learner, 30% weight)
  const seenCodes = await getAllSeenCodes(learnerId);
  const newCandidates = floraCodesInSeason(season)
    .filter(c => !seenCodes.includes(c));

  // Bucket C: WILD CARD (20% — any season-appropriate species)
  const wildCard = floraCodesInSeason(season);

  // Weighted sample N from the three buckets
  return weightedSample({
    buckets: [
      { items: due.map(d => d.flora_code), weight: 0.5 },
      { items: newCandidates,              weight: 0.3 },
      { items: wildCard,                   weight: 0.2 },
    ],
    n: N,
    uniqueOnly: true,
  });
}
```

### Photo-role rotation
For each species in the walk:
```ts
function nextRoleForExposure(species: FloraData, rolesSeen: PhotoRole[]): PhotoRole {
  const unseen = species.photoRoles.filter(r => !rolesSeen.includes(r));
  if (unseen.length > 0) return unseen[0];     // prefer never-seen
  return species.photoRoles[
    rolesSeen.length % species.photoRoles.length
  ];                                           // cycle once exhausted
}
```

### Difficulty tier
```ts
function tierForExposures(exposures: number): 1 | 2 | 3 {
  if (exposures < 3) return 1;                 // clear, isolated, well-lit
  if (exposures < 10) return 2;                // in-habitat with other plants
  return 3;                                    // partial view, harder lighting
}
```

### SM-2 lite spacing
```ts
const INTERVALS_DAYS = [1, 3, 7, 14, 30, 60]; // capped at 60

function nextReviewAt(exposures: number): Date {
  const idx = Math.min(exposures, INTERVALS_DAYS.length) - 1;
  const days = INTERVALS_DAYS[Math.max(0, idx)];
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
```

---

## 7. UI Flow

### Walk page (`/naturalist/walk`)

**Header**
- Title: "Today's walk"
- Three (or 2-4) pacing dots under the title; each fills in as she completes a species.
- Top-right ✕ exits to `/garden/reading-forest`.

**Per-species flow (looped 2-4 times)**

```
1. INTRO            "Let's look at something growing here."
                    Hero photo (full-bleed), soft 400ms fade-in.
                    Big terracotta button: "Begin →"

2. QUICK-RECOGNIZE  (only if exposures >= 5)
                    Hero photo + "Do you already know this one?"
                    [I think so]  [Let me check]

3. KEY WALK         3-5 yes/no steps, each:
                    Question text (audio playback button beside it).
                    Two photo cards side-by-side, ~50% screen each.
                    Tap any → next step.

4. REVEAL           Soft chime (or no chime if reducedMotion).
                    "You found a —"
                    [Species common name in big terracotta]
                    [scientific name in italics under it]
                    Path breadcrumb: needle? no → lobed? yes → ...

5. NOTICE           "Here's what makes a [name] a [name]:"
                    Three feature photos (leaf | bark | flower).
                    Tap any → caption appears ("toothed lobes" etc.)
                    Two facts below as plain paragraphs.
                    Big terracotta button: "Found! →"
```

**End-of-walk screen**
- Title: "Your walk today —"
- Three (or 2-4) real-photo cards of what she found, each with common name underneath.
- Subtitle: "Added to your Field Journal."
- Two buttons:
  - "See journal" → `/journal#flora`
  - "Back to the forest" → `/garden/reading-forest`

### Field Journal — flora tab
- New tab in `/journal` (`?tab=flora`) parallel to the existing species tab.
- Grid of all flora in the catalog. Identified species are full-color; unidentified are greyscale silhouettes labeled "to discover".
- Tap any identified species → modal with all curated photos + facts + identification count.

### Reading Forest signpost
- Drawn in `ReadingForestScene.tsx` at roughly south-edge x=720, y=720.
- A weathered wooden post with two arrows (left to Reading Grove, down-right to Naturalist Grove).
- Hand-drawn 2-2.5px bark outlines matching existing forest aesthetic.
- Tiny dogwood bloom + leaf motif beside the Naturalist Grove arrow as a hint at the destination's content.
- Tap target ≥ 60pt, ripple feedback on tap, then `router.push('/naturalist/walk?learner=...')`.

### Attribution overlay
- Small ⓘ glyph (16px) in the bottom-right of every photo, on a translucent dark pill.
- Tap → bottomsheet:
  ```
  Photo by [Photographer]
  [Alt text]
  License: [CC BY-SA]
  Source: [iNaturalist ↗]
  ```
- Closes by tapping outside or the ✕ in the corner.

---

## 8. Photo Pipeline

### Phase 1 — Authoring (one-time per species)

**Step 1: Harvest with `scripts/seed-flora-photos.ts`**

```bash
npm run seed:flora -- --species red_maple
# OR --all
```

For each species:
1. iNaturalist query:
   ```
   GET https://api.inaturalist.org/v1/observations
       ?taxon_id={inatTaxonId}
       &quality_grade=research
       &photos=true
       &order_by=votes
       &per_page=100
       &license=cc0,cc-by,cc-by-sa
   ```
2. Wikimedia Commons query:
   ```
   GET https://commons.wikimedia.org/w/api.php
       ?action=query
       &generator=categorymembers
       &gcmtitle=Category:{wikiSpecies}
       &prop=imageinfo
       &iiprop=url|extmetadata
       &format=json
   ```
   Filter to `extmetadata.LicenseShortName` starting with `"CC"`.
3. Download into `scripts/staging/{flora_code}/{source}_{id}.jpg`.
4. Write `scripts/staging/{flora_code}/candidates.json` with photographer, license, source URL, image dimensions per file.

**Step 2: Curate via `/parent/flora-photos`** (parent-zone)

- Lists each species with `flora_review IS NULL OR exposures = 0`-style backlog
- Shows 20-100 candidate thumbs from staging
- For each chosen photo:
  - Tag role: `[whole] [leaf] [bark] [flower] [fruit]`
  - Tag difficulty tier: `[tier 1: clear] [tier 2: in-habitat] [tier 3: hard]`
  - Write alt text (default: `{commonName} {role}, {tier label}`)
- "Save species" → uploads selected photos to Supabase Storage, inserts `flora_photo` rows.
- Goal per species: 3-5 photos × 3-5 roles × 3 tiers ≈ **12-20 curated photos**.

**Estimated effort:** ~6 hours total across 55 species (rough first pass; iterate later).

### Phase 2 — Runtime

**Storage bucket: `flora-photos`** (public read; admin uploads via service role)
- Path: `{flora_code}/{role}_{tier}_{id}.{ext}`
- Original sizes stored; resized variants served via Supabase Storage transform params (`?width=720` for hero, `?width=240` for thumbs).

**Walk API picks photos**
```ts
async function pickPhotoForRole(
  floraCode: string,
  role: PhotoRole,
  tier: 1|2|3,
): Promise<PhotoRef> {
  const { data } = await supabase
    .from('flora_photo')
    .select('storage_path, alt_text, photographer, license_code, source_url')
    .eq('flora_code', floraCode)
    .eq('role', role)
    .eq('tier', tier)
    .limit(10);
  const choice = data[Math.floor(Math.random() * data.length)];
  return {
    url: storagePublicUrl(choice.storage_path) + '?width=720',
    alt: choice.alt_text,
    attribution: {
      photographer: choice.photographer,
      licenseCode: choice.license_code,
      sourceUrl: choice.source_url,
    },
  };
}
```

### Phase 3 — Offline behavior
- Walk page pre-fetches every photo URL for its 2-4 species at session start.
- Service worker (already used elsewhere) intercepts photo URLs and caches.
- A loaded walk completes even if wifi drops mid-session.
- Field Journal flora tab caches progressively as she scrolls.

### Storage + cost
- Estimated footprint: 55 species × 15 curated photos × ~200 KB ≈ **165 MB** — well inside Supabase free-tier 1 GB.
- Estimated egress: ~5 MB per walk × 30 walks/month ≈ 150 MB/month — well below free-tier 2 GB limit. **Flag if Cecily becomes a power user.**

---

## 9. Seasonal Catalog (55 species)

### Trees (25)
**Hyper-local Louisville (street + yard + park):**
- Tulip Poplar (KY state tree)
- Eastern Redbud
- Flowering Dogwood (KY state flower bears this)
- American Sycamore
- Sweetgum
- Sugar Maple
- Red Maple
- White Oak
- Northern Red Oak
- American Beech
- Black Cherry
- Sassafras (distinctive mitten leaves)
- Common Persimmon
- Black Walnut
- Shagbark Hickory

**Red River Gorge specialties:**
- Eastern White Pine
- Eastern Hemlock
- Pawpaw ("Kentucky banana tree")
- Mountain Laurel
- Rhododendron (Great Rhododendron)

**Canonical North American natives:**
- Paper Birch
- Honey Locust
- American Elm
- Bald Cypress
- Witch Hazel

### Wildflowers (25)
**Spring ephemerals (RRG + KY woods, March-May):**
- Trillium (multiple species — keep generic)
- Virginia Bluebells
- Bloodroot
- Mayapple
- Dutchman's Breeches
- Spring Beauty
- Trout Lily
- Wild Geranium

**Summer (June-August):**
- Cardinal Flower
- Common Milkweed
- Black-eyed Susan
- Purple Coneflower (Echinacea)
- Joe-Pye Weed
- Bee Balm (Wild Bergamot)
- Indian Pink

**Fall (September-October):**
- Goldenrod
- New England Aster

**Year-round yard / lawn / common:**
- Dandelion
- Common Violet
- White Clover
- Queen Anne's Lace
- Chicory

### Ferns + shrubs (5)
- Christmas Fern
- Spicebush
- (Mountain Laurel — listed under trees)
- (Rhododendron — listed under trees)
- (Witch Hazel — listed under trees)

### Winter coverage
Even with no blooms or leaves on most deciduous trees, these stay identifiable:
- Eastern White Pine (evergreen needle bundles of 5)
- Eastern Hemlock (evergreen flat needles)
- Mountain Laurel (evergreen broad leaves)
- Rhododendron (evergreen broad leaves)
- Shagbark Hickory (unmistakable shaggy bark year-round)
- American Sycamore (distinctive mottled bark, persistent fruit balls)
- American Beech (retains tan leaves through winter)
- Sweetgum (winter spiky seedpods, recognizable bark)
- Christmas Fern (evergreen)

---

## 10. Testing Strategy

### Unit tests (Vitest)
- `lib/world/dichotomousKey.ts`
  - Every species code is reachable from `root` via at least one path.
  - No orphan nodes (every non-root node is referenced as a child).
  - Every internal node has exactly two children.
  - No cycles (every path terminates at a species leaf).
- `lib/naturalist/spacing.ts`
  - `nextReviewAt(1)` = now + 1d, `nextReviewAt(2)` = now + 3d, ..., `nextReviewAt(6+)` = now + 60d.
  - `nextRoleForExposure({roles: [leaf, bark, fruit, whole]}, ['leaf'])` returns `'bark'` (first unseen).
  - `tierForExposures(0)` = 1, `tierForExposures(3)` = 2, `tierForExposures(10)` = 3.
- Walk-selection algorithm
  - Given fixture with 5 due / 5 new / 50 wild-card species, returns ~50/30/20 distribution across many trials.
  - Never returns duplicates within a single walk.

### Integration tests (Vitest + Supabase test DB)
- Full walk: pick species → render `WalkSession` → record exposure → assert `flora_review.exposures` incremented and `next_review_at` set correctly.
- Quick-recognize path: after 5 exposures, walk API returns `showQuickRecognize: true`.

### E2E test (Playwright — existing setup)
- One happy-path test: navigate to Reading Forest → tap Naturalist Grove signpost → walk through 2 species → see end-of-walk screen → tap "See journal" → see flora tab with both species marked identified.

### Manual content review
- Final phase before opening to Cecily: walk every species with Dylan, confirm photos are clearly the species and not mislabeled.

---

## 11. Implementation Phasing

Five phases. Each is one implementation plan. Phases 1-4 are platform work; phase 5 is content curation.

| Phase | What ships | Acceptance |
|---|---|---|
| **1. Schema + 10-species pilot** | `FLORA_CATALOG` seeded with 10 species (5 trees, 5 flowers). `flora_review` + `flora_photo` + `key_node_photo` tables migrated. Photos hand-curated for those 10 (via temporary local-dev tooling — no admin UI yet). | Catalog queryable. SQL inserts simulate exposures. Photos load from Storage. |
| **2. Walk page + API** | `/naturalist/walk` renders a hardcoded walk with the 10 species; basic dichotomous key (10 nodes) navigates; reveal screen displays. No spacing or role rotation yet. | Walk end-to-end as a sister account. Species pinned in journal. |
| **3. Spaced repetition + role rotation** | SM-2 lite scoring; walk-selection algorithm respects `next_review_at` and `photo_roles_seen`; quick-recognize shortcut at exposures >= 5; tier-based photo selection. | Simulated 30-walk integration test passes intervals + role rotation assertions. |
| **4. Reading Forest signpost + Journal flora tab + Attribution overlay** | Signpost SVG drawn in Reading Forest scene; tap navigates. Journal page gets flora tab. ⓘ attribution overlay on every photo. | End-to-end happy-path E2E test passes. |
| **5. Catalog expansion + admin curation UI** | Build `/parent/flora-photos` curation UI. Expand catalog to all 55 species. Author full dichotomous key (~60 internal nodes). Curate tiers 2 + 3 photos for all species. | Manual species-by-species content review with Dylan. |

---

## 12. Open Questions

1. **iNat taxon IDs** — manually look-up step. Plan: hardcode in `floraCatalog.ts` per species. ~30 sec each × 55 species = ~30 min one-time work.

2. **Dichotomous-key node comparison photos** — these are illustrative, not species-specific ("here's what a needle looks like, here's what a broad leaf looks like"). Plan: a separate small set of ~20 generic feature photos curated alongside species photos in phase 1, stored in `key_node_photo`.

3. **Storage egress monitoring** — flag if monthly Storage egress approaches free-tier limit. May require paid tier if Cecily becomes a power user (>50 walks/week).

4. **Admin curation UI complexity** — if it grows non-trivial, split into its own sub-plan. For phase 1, use a JSON config + manual SQL inserts; build the UI properly in phase 5.

5. **Reduced-motion gating** — confirm in implementation: pacing dots animate normally for default users, fill instantly under reduced-motion. Photo cross-fades become hard cuts. Audio cues unchanged either way.

6. **Trillium species disambiguation** — Trillium grandiflorum vs. T. erectum vs. T. sessile are all RRG-common but visually distinct. Decision: include as one "Trillium" entry for v1; revisit splitting in v2 if Cecily wants to.

---

## 13. References

- iNaturalist API: https://api.inaturalist.org/v1/docs/
- Wikimedia Commons API: https://commons.wikimedia.org/w/api.php
- SM-2 algorithm (SuperMemo): https://www.supermemo.com/en/blog/the-true-history-of-spaced-repetition
- KY native plants (KY Native Plant Society): https://knps.org/
- Red River Gorge flora resources (Daniel Boone National Forest): https://www.fs.usda.gov/dbnf/

---

**Next:** Pass this spec to the `writing-plans` skill to create the phase-by-phase implementation plan.
