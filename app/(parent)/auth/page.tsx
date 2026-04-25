'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Mode = 'passcode' | 'magic';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('passcode');

  // passcode mode
  const [passcode, setPasscode] = useState('');
  const [passBusy, setPassBusy] = useState(false);
  const [passErr, setPassErr] = useState<string | null>(null);

  // magic-link mode
  const [email, setEmail] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [magicErr, setMagicErr] = useState<string | null>(null);

  const submitPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim() || passBusy) return;
    setPassBusy(true);
    setPassErr(null);
    const res = await fetch('/api/auth/passcode', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ passcode: passcode.trim() }),
    });
    if (res.ok) {
      router.push('/parent');
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setPassErr(data.error === 'wrong passcode' ? "That's not the passcode" : 'Couldn\'t sign in');
    }
    setPassBusy(false);
  };

  const sendMagic = async () => {
    setMagicErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/parent` },
    });
    if (error) setMagicErr(error.message); else setMagicSent(true);
  };

  return (
    <main className="max-w-md mx-auto mt-16 p-6 space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Parent sign in</h1>
        <p className="text-sm text-gray-600 mt-1">
          For dashboard access, family management, and progress resets.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setMode('passcode')}
          className={`flex-1 text-sm font-semibold rounded-md py-1.5 ${
            mode === 'passcode' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Passcode
        </button>
        <button
          type="button"
          onClick={() => setMode('magic')}
          className={`flex-1 text-sm font-semibold rounded-md py-1.5 ${
            mode === 'magic' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Magic link
        </button>
      </div>

      {mode === 'passcode' && (
        <form onSubmit={submitPasscode} className="space-y-3">
          <label className="block">
            <div className="text-sm text-gray-700 mb-1.5 font-semibold">Family passcode</div>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              className="w-full border-2 border-gray-300 focus:border-blue-500 rounded-lg px-3 py-2.5 text-lg font-mono tracking-widest text-center"
              placeholder="••••••"
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            disabled={passBusy || !passcode.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg py-2.5 font-semibold"
          >
            {passBusy ? 'Signing in…' : 'Sign in'}
          </button>
          {passErr && (
            <p className="text-red-600 text-sm text-center">{passErr}</p>
          )}
          <p className="text-xs text-gray-500 text-center pt-1">
            Set <code className="font-mono">PARENT_PASSCODE</code> in your env to change it.
          </p>
        </form>
      )}

      {mode === 'magic' && (
        <div className="space-y-3">
          {magicSent ? (
            <p className="text-sm text-gray-700 bg-green-50 border border-green-200 rounded-lg p-3">
              Check your email for a magic link.
            </p>
          ) : (
            <>
              <label className="block">
                <div className="text-sm text-gray-700 mb-1.5 font-semibold">Email</div>
                <input
                  type="email"
                  className="w-full border-2 border-gray-300 focus:border-blue-500 rounded-lg px-3 py-2.5"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </label>
              <button
                onClick={sendMagic}
                disabled={!email.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg py-2.5 font-semibold"
              >
                Send magic link
              </button>
              {magicErr && <p className="text-red-600 text-sm">{magicErr}</p>}
              <p className="text-xs text-gray-500">
                Requires Supabase email/SMTP setup; if it doesn't arrive, use the passcode tab.
              </p>
            </>
          )}
        </div>
      )}
    </main>
  );
}
