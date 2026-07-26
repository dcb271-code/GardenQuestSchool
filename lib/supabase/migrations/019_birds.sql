-- 019_birds.sql
--
-- Media for the bird curriculum. Learner PROGRESS is not here — that
-- lives in world_state.garden (bird_units, bird_review, bird_lifelist)
-- like every other subject. These two tables are content: harvested
-- once by a script, read by everyone, written only by the service role.
--
-- Mirrors flora_photo from 011_naturalist.sql, with two differences
-- that matter:
--
--   * bird roles are not plant roles. A bird has sexes and a flight
--     silhouette; it has no bark or fruit. Half of what confuses a
--     beginner is that a male and female cardinal look nothing alike,
--     so 'male' and 'female' are first-class roles.
--
--   * bird_audio is new ground. Nothing in this app has ever shipped a
--     recorded sound before — everything is Web Audio synthesis or
--     TTS. The licence columns are load-bearing, not bookkeeping; see
--     the constraint at the bottom.

create table if not exists bird_photo (
  id uuid primary key default gen_random_uuid(),
  bird_code text not null,
  role text not null,
  tier integer not null default 1,            -- 1=clear  2=in-habitat  3=hard
  storage_path text not null,
  source text not null,                       -- 'inat' | 'wikimedia'
  source_url text not null,
  photographer text,
  license_code text not null,
  alt_text text not null,
  created_at timestamptz not null default now(),
  constraint bird_photo_role_valid check (
    role in ('perched','flight','male','female','juvenile','head','back','silhouette')),
  constraint bird_photo_tier_valid check (tier between 1 and 3),
  constraint bird_photo_license_valid check (license_code in ('cc0','cc-by','cc-by-sa'))
);

create index if not exists bird_photo_code_role_idx on bird_photo (bird_code, role);
create unique index if not exists bird_photo_storage_path_idx on bird_photo (storage_path);

create table if not exists bird_audio (
  id uuid primary key default gen_random_uuid(),
  bird_code text not null,
  kind text not null,
  storage_path text not null,                 -- the trimmed opus clip
  fallback_path text,                         -- .m4a, for older Safari
  spectrogram_path text,                      -- generated from the clip; nullable
  source text not null default 'xeno_canto',
  source_id text not null,                    -- 'XC1154497'
  source_url text not null,
  recordist text not null,
  -- Stored VERBATIM and in full. Xeno-canto carries 4.0, 3.0 and 2.5
  -- licences side by side, and 3.0 has attribution requirements 4.0
  -- does not, so normalising this to "CC BY-NC-SA" would lose the
  -- information needed to credit it correctly.
  license_url text not null,
  -- Non-commercial. ~73% of xeno-canto is NC, which is fine for a
  -- family homeschool app and not fine the moment anything is sold.
  -- A flag rather than a comment, so that day is one query, not an
  -- archaeology project.
  is_nc boolean not null,
  original_title text,                        -- CC 3.0/2.5 require the title
  locality text,
  recorded_on date,
  clip_start_sec numeric not null,
  clip_len_sec numeric not null,
  -- CC 4.0 §3(a)(1) requires indicating that the work was modified.
  modifications text not null,
  created_at timestamptz not null default now(),
  constraint bird_audio_kind_valid check (kind in ('song','call','drum','flight_call')),
  -- No-derivatives recordings cannot be used at all: we trim, we
  -- loudness-normalise, and we high-pass filter, which is
  -- unambiguously modification. Enforced here rather than trusted to
  -- the harvest script, because a licence mistake is not the kind of
  -- thing you notice later.
  constraint bird_audio_not_nd check (license_url not like '%-nd/%')
);

create index if not exists bird_audio_code_kind_idx on bird_audio (bird_code, kind);
create unique index if not exists bird_audio_storage_path_idx on bird_audio (storage_path);

alter table bird_photo enable row level security;
alter table bird_audio enable row level security;

drop policy if exists bird_photo_read on bird_photo;
create policy bird_photo_read on bird_photo for select using (true);

drop policy if exists bird_audio_read on bird_audio;
create policy bird_audio_read on bird_audio for select using (true);
