# Naturalist Grove — Photo Curation Workflow

This is the V1 hand-curated workflow for the Naturalist Grove module.
Phase 5 will replace it with a parent-zone admin UI; for now, curation
is done with a text editor + the two CLIs below.

## One-time setup

Make sure these are set in `.env.local`:

```
DATABASE_URL=postgresql://postgres:...@db.xxx.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ey...
```

Get them from Supabase Dashboard → Settings → API and Settings → Database → Connection String.

## Workflow per species

### 1. Harvest candidates from iNat + Wikimedia

```bash
npm run naturalist:harvest -- --species tulip_poplar
```

This downloads up to 40 CC-licensed candidate photos (20 from each
source) into `scripts/staging/tulip_poplar/` and writes
`candidates.json` listing every photo with its photographer, license,
and source URL.

The downloaded `.jpg` files are git-ignored. `candidates.json` and
`selections.json` (next step) are tracked.

### 2. Review the candidates in your file browser

Open `scripts/staging/tulip_poplar/` and look through each downloaded
photo. Decide which ones to keep, what role each one shows, and how
hard it is to read at a glance.

### 3. Author selections.json

Create `scripts/staging/tulip_poplar/selections.json` with one entry
per photo you want in the app. Each entry needs:

- `filename`: the file in this directory you are tagging (must also
  appear in `candidates.json`)
- `role`: one of `whole`, `leaf`, `bark`, `flower`, `fruit`
- `tier`: difficulty — `1` (clear isolated reference), `2` (in
  habitat with other plants visible), or `3` (partial view, hard
  lighting, season variant)
- `altText`: short description for screen readers (`"<commonName>
  <role>, <one-liner>"` is a good template)

Example:

```json
[
  {
    "filename": "inat_104857.jpg",
    "role": "leaf",
    "tier": 1,
    "altText": "Tulip Poplar leaf, four-lobed flat-top, clear reference"
  },
  {
    "filename": "wikimedia_22198.jpg",
    "role": "flower",
    "tier": 1,
    "altText": "Tulip Poplar flower close-up, orange band on greenish petals"
  },
  {
    "filename": "inat_5582901.jpg",
    "role": "bark",
    "tier": 1,
    "altText": "Tulip Poplar bark, straight grey trunk with shallow furrows"
  }
]
```

**Goal per species:** 3-5 photos × 3-5 roles × 3 tiers ≈ 12-20 entries.
Start with tier 1 only for Phase 1 — add tiers 2 and 3 in Phase 5.

### 4. Upload selections to Supabase Storage + DB

```bash
npm run naturalist:upload -- --species tulip_poplar
```

This:
- Creates the `flora-photos` Storage bucket (first run only)
- Uploads each selected photo to
  `flora-photos/<flora_code>/<role>_<tier>_<source>_<id>.<ext>`
- Inserts one `flora_photo` row per photo with full attribution

Re-runs are idempotent — already-uploaded photos are skipped.

### 5. Verify

In Supabase Studio:

```sql
select role, tier, license_code, source, alt_text
from flora_photo
where flora_code = 'tulip_poplar'
order by role, tier;
```

You should see one row per `selections.json` entry. Click any photo
in the Storage UI to copy a public URL and confirm it loads in your
browser.

## Curating all species at once

```bash
npm run naturalist:harvest -- --all
# ... hand-author every selections.json ...
npm run naturalist:upload -- --all
```

## Re-running for a species

If you want to add more photos later, repeat steps 1-4. `--all` for
the harvest is also additive — new candidates are merged into the
existing `candidates.json` (newer wins on duplicate filenames).

## Removing a bad photo

1. Delete the row: `delete from flora_photo where id = '<uuid>'`.
2. Delete the Storage object via Supabase Studio.
3. Delete the entry from `selections.json` so re-runs do not re-upload.
