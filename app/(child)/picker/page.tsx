import { createServiceClient } from '@/lib/supabase/server';
import PickerClient from './PickerClient';

export const dynamic = 'force-dynamic';

export default async function PickerPage() {
  const supabase = createServiceClient();
  const { data: learners } = await supabase
    .from('learner')
    .select('id, first_name, avatar_key, grade_level, default_challenge')
    .order('created_at', { ascending: true })
    .limit(10);

  return <PickerClient learners={learners ?? []} />;
}
