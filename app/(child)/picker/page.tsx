import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/server';
import { UNLOCK_COOKIE, parseUnlocked } from '@/lib/learner/pin';
import PickerClient from './PickerClient';

export const dynamic = 'force-dynamic';

export default async function PickerPage() {
  const supabase = createServiceClient();
  const { data: learners } = await supabase
    .from('learner')
    // pin_hash itself never leaves the server — only whether one is set.
    .select('id, first_name, avatar_key, grade_level, default_challenge, pin_hash')
    .order('created_at', { ascending: true })
    .limit(10);

  const unlocked = parseUnlocked(cookies().get(UNLOCK_COOKIE)?.value);

  const safe = (learners ?? []).map(l => {
    const { pin_hash, ...rest } = l as Record<string, unknown>;
    return {
      ...rest,
      // Locked only while this device has not already answered for her,
      // so she is not asked again on every trip back to the picker.
      locked: Boolean(pin_hash) && !unlocked.includes(l.id as string),
    };
  });

  return <PickerClient learners={safe as never} />;
}
