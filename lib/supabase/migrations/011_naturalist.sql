-- 011_naturalist.sql
--
-- Schema for the Naturalist Grove module (real-world tree + wildflower
-- identification via dichotomous field-key + spaced repetition).
--
-- Adds three tables:
--   flora_review      — per-learner exposure tracking (SM-2 lite spacing)
--   flora_photo       — per-species curated photos with CC attribution
--   key_node_photo    — generic comparison photos used in the dichotomous key
--
-- Idempotent — uses `if not exists` and `drop policy if exists`.
--
-- Design spec: docs/superpowers/specs/2026-05-29-naturalist-grove-design.md §4

-- ── flora_review ─────────────────────────────────────────────────────
-- One row per (learner, flora_code). exposures + next_review_at drive
-- the spaced-repetition picker in Phase 3.
create table if not exists flora_review (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learner(id) on delete cascade,
  flora_code text not null,                  -- references FLORA_CATALOG[].code in code
  exposures integer not null default 0,
  last_seen_at timestamptz,
  next_review_at timestamptz,
  ease_factor double precision not null default 2.5,
  photo_roles_seen text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique(learner_id, flora_code)
);

create index if not exists flora_review_due_idx
  on flora_review (learner_id, next_review_at);

alter table flora_review enable row level security;

drop policy if exists "flora_review owned via learner" on flora_review;
create policy "flora_review owned via learner" on flora_review for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);

-- ── flora_photo ──────────────────────────────────────────────────────
-- Curated photos per (flora_code, role, tier). Photos are NOT picked at
-- runtime from third-party APIs — they are pre-curated, uploaded to
-- Supabase Storage, and metadata is logged here for attribution.
create table if not exists flora_photo (
  id uuid primary key default gen_random_uuid(),
  flora_code text not null,
  role text not null,                        -- 'whole'|'leaf'|'bark'|'flower'|'fruit'
  tier integer not null default 1,           -- 1=clear  2=in-habitat  3=hard
  storage_path text not null,                -- '<flora_code>/<role>_<tier>_<id>.jpg'
  source text not null,                      -- 'inat' | 'wikimedia'
  source_url text not null,
  photographer text,
  license_code text not null,                -- 'cc0'|'cc-by'|'cc-by-sa'
  alt_text text not null,
  created_at timestamptz not null default now(),
  constraint flora_photo_role_valid check (
    role in ('whole','leaf','bark','flower','fruit')
  ),
  constraint flora_photo_tier_valid check (tier between 1 and 3),
  constraint flora_photo_license_valid check (
    license_code in ('cc0','cc-by','cc-by-sa')
  )
);

create index if not exists flora_photo_pick_idx
  on flora_photo (flora_code, role, tier);

alter table flora_photo enable row level security;

-- flora_photo: anyone (even anonymous) can read; only service-role can write.
drop policy if exists "flora_photo public read" on flora_photo;
create policy "flora_photo public read" on flora_photo
  for select using (true);

-- ── key_node_photo ───────────────────────────────────────────────────
-- Generic comparison photos shown in dichotomous-key steps. These are
-- not species-specific — they illustrate features ("here is what a
-- needle looks like, here is what a broad leaf looks like").
create table if not exists key_node_photo (
  id uuid primary key default gen_random_uuid(),
  node_id text not null,                     -- 'root.left', 'broadleaf.lobed_or_simple.right' etc.
  storage_path text not null,
  source text not null,
  source_url text not null,
  photographer text,
  license_code text not null,
  alt_text text not null,
  created_at timestamptz not null default now(),
  constraint key_node_photo_license_valid check (
    license_code in ('cc0','cc-by','cc-by-sa')
  )
);

create index if not exists key_node_photo_node_idx
  on key_node_photo (node_id);

alter table key_node_photo enable row level security;

drop policy if exists "key_node_photo public read" on key_node_photo;
create policy "key_node_photo public read" on key_node_photo
  for select using (true);
