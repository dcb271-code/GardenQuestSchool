import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const PARENT_AUTH_COOKIE = 'gqs:parent-auth';

export default async function AuthGate({ children }: { children: React.ReactNode }) {
  // Path 1: passcode auth (cookie set by /api/auth/passcode). Fast path
  // for at-home use, avoids the magic-link round trip.
  const passcodeOk = cookies().get(PARENT_AUTH_COOKIE)?.value === '1';
  if (passcodeOk) return <>{children}</>;

  // Path 2: Supabase magic-link auth (legacy / production option).
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return <>{children}</>;
  } catch {
    // ignore — fall through to redirect
  }

  redirect('/auth');
}
