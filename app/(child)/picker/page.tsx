import { createServiceClient } from '@/lib/supabase/server';
import ProfileTile from '@/components/child/ProfileTile';

const avatarMap: Record<string, string> = {
  fox: '🦊', bunny: '🐰', cat: '🐈', butterfly: '🦋',
};

export default async function PickerPage() {
  const supabase = createServiceClient();
  const { data: learners } = await supabase
    .from('learner')
    .select('id, first_name, avatar_key')
    .limit(10);

  const pick = learners ?? [];

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-kid-lg text-bark">Who&apos;s exploring today?</h1>
        <div className="flex flex-wrap gap-6 justify-center">
          {pick.map(l => (
            <ProfileTile
              key={l.id}
              name={l.first_name}
              avatarEmoji={avatarMap[l.avatar_key ?? 'fox'] ?? '🦊'}
              href={`/explore?learner=${l.id}`}
            />
          ))}
        </div>
        <div className="text-sm opacity-60 pt-8">
          <a href="/auth">⚙️ Parent</a>
        </div>
      </div>
    </main>
  );
}
