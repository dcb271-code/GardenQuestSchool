import { createServiceClient } from '@/lib/supabase/server';
import ProfileTile from '@/components/child/ProfileTile';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const avatarMap: Record<string, string> = {
  fox: '🦊', bunny: '🐰', cat: '🐈', butterfly: '🦋', frog: '🐸', bee: '🐝',
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
          <Link
            href="/parent/family"
            className="flex flex-col items-center justify-center w-40 h-40 bg-white rounded-3xl border-4 border-dashed border-ochre hover:scale-105 active:scale-95 transition-transform shadow-md opacity-70"
            style={{ touchAction: 'manipulation' }}
          >
            <div className="text-7xl">+</div>
            <div className="mt-2 text-kid-md">Add</div>
          </Link>
        </div>
        <div className="flex gap-4 justify-center text-sm opacity-60 pt-8 flex-wrap">
          <Link href="/garden">🌿 Garden</Link>
          <Link href="/journal">📖 Journal</Link>
          <Link href="/habitats">🏠 Habitats</Link>
          <Link href="/settings">⚙️ Settings</Link>
          <Link href="/auth">👤 Parent</Link>
        </div>
      </div>
    </main>
  );
}
