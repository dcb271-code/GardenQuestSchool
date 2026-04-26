-- lib/supabase/migrations/009_world_state_unlocked_branches.sql
--
-- World-navigation overhaul: introduce `unlocked_branches` inside the
-- existing world_state.garden jsonb column. This is the "have we already
-- played the unlock-celebration for this branch?" memory — without it
-- the LockedGate component would replay the ivy-slides-aside animation
-- on every garden page load after the gate criterion is met.
--
-- Conventional shape after this migration:
--   world_state.garden = {
--     pendingArrivalSpeciesCode?: string,   -- existing
--     unlocked_branches?: string[]          -- new (e.g. ["math_mountain"])
--   }
--
-- No DDL needed (jsonb is flexible). This migration is data-only:
-- it backfills an empty array on every existing world_state row so
-- application code can rely on the key being present and iterable.
--
-- Idempotent — safe to re-run. Each run is a no-op for rows that
-- already contain the key.

do $$
declare r record;
begin
  for r in select learner_id from world_state loop
    update world_state
       set garden = coalesce(garden, '{}'::jsonb)
                    || jsonb_build_object('unlocked_branches', '[]'::jsonb)
     where learner_id = r.learner_id
       and not (coalesce(garden, '{}'::jsonb) ? 'unlocked_branches');
  end loop;
end $$;
