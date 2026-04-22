'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const send = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/parent` },
    });
    if (error) setErr(error.message); else setSent(true);
  };

  return (
    <main className="max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-4">Parent sign in</h1>
      {sent ? (
        <p>Check your email for a magic link.</p>
      ) : (
        <>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 mb-3"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button
            onClick={send}
            className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold"
          >Send magic link</button>
          {err && <p className="text-red-600 mt-3 text-sm">{err}</p>}
        </>
      )}
    </main>
  );
}
