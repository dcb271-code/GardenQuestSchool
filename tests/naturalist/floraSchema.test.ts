import { config } from 'dotenv';
import { resolve } from 'node:path';
// Load .env.local (Next.js convention) so Supabase creds are available
config({ path: resolve(process.cwd(), '.env.local') });

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Skip the whole suite if the dev DB isn't configured locally — CI
// without supabase creds shouldn't fail this. Run locally to exercise.
const RUN = !!(URL && KEY);

describe.skipIf(!RUN)('flora_review — schema round-trip', () => {
  let supabase: SupabaseClient;
  let learnerId: string;
  let createdRowId: string | null = null;

  beforeAll(async () => {
    supabase = createClient(URL!, KEY!);
    // Reuse an existing learner row — the integration test does not
    // create or delete a learner because that cascades to many tables.
    const { data: learners, error } = await supabase
      .from('learner').select('id').limit(1);
    if (error) throw error;
    if (!learners || learners.length === 0) {
      throw new Error(
        'No learner rows exist in the dev DB. Run `npm run db:seed` first.'
      );
    }
    learnerId = learners[0].id;
  });

  afterAll(async () => {
    if (createdRowId) {
      await supabase.from('flora_review').delete().eq('id', createdRowId);
    }
  });

  it('accepts an insert with all required columns', async () => {
    const { data, error } = await supabase
      .from('flora_review')
      .insert({
        learner_id: learnerId,
        flora_code: 'test_pilot_species',
        exposures: 1,
        last_seen_at: new Date().toISOString(),
        next_review_at: new Date(Date.now() + 86_400_000).toISOString(),
        photo_roles_seen: ['leaf'],
      })
      .select('id, exposures, photo_roles_seen')
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.exposures).toBe(1);
    expect(data!.photo_roles_seen).toEqual(['leaf']);
    createdRowId = data!.id;
  });

  it('updates exposures + photo_roles_seen on subsequent identifications', async () => {
    expect(createdRowId).not.toBeNull();
    const { data, error } = await supabase
      .from('flora_review')
      .update({
        exposures: 2,
        photo_roles_seen: ['leaf', 'bark'],
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', createdRowId!)
      .select('exposures, photo_roles_seen')
      .single();

    expect(error).toBeNull();
    expect(data!.exposures).toBe(2);
    expect(data!.photo_roles_seen).toEqual(['leaf', 'bark']);
  });

  it('rejects a second insert for the same (learner, flora_code)', async () => {
    const { error } = await supabase
      .from('flora_review')
      .insert({
        learner_id: learnerId,
        flora_code: 'test_pilot_species',  // duplicate
        exposures: 1,
      });

    // Postgres unique violation code is 23505
    expect(error).not.toBeNull();
    expect(error!.code).toBe('23505');
  });
});
