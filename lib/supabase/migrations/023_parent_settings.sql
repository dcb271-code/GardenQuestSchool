-- Family-wide settings the parent page edits: for now, the morning
-- gate (cutoff hour, the chore list). One jsonb column on the parent
-- row; additive, no learner state touched. Code reads it defensively
-- and falls back to defaults until this is applied.
alter table parent add column if not exists settings jsonb not null default '{}'::jsonb;
