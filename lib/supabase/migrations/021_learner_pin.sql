-- 021_learner_pin.sql
--
-- An optional PIN per learner profile.
--
-- Two children share one tablet, and the letterbox, garden and journal
-- are personal in a way that matters to a seven-year-old. This is the
-- lock on her bedroom door, not a bank vault: it keeps a sister out,
-- and it is not trying to withstand an adult with the URL bar.
--
-- Stored as scrypt(pin, salt) — never the digits themselves. A PIN is
-- four characters from an alphabet of ten, so it is guessable by
-- anybody willing to sit there; hashing it is still right, because
-- children reuse numbers and this database also holds their names.
--
-- Null pin_hash means the profile is open, which is the default and
-- stays the default. Nothing here writes learner state.

alter table learner add column if not exists pin_hash text;
alter table learner add column if not exists pin_set_at timestamptz;

comment on column learner.pin_hash is
  'scrypt hash of the profile PIN as "salt:derivedkey", both hex. '
  'Null means no PIN and the profile opens without one.';
