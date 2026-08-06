// app/(child)/letters/LetterScene.tsx
//
// Writing a letter about your own garden.
//
// The tone here is a letter, not a feedback form. She gets a sheet of
// paper, a big friendly send button, and her past letters underneath
// with any replies. No categories to choose, no "was this helpful",
// nothing that turns her idea into a ticket.
//
// She can also DICTATE it. She is seven; the ideas arrive faster than
// the typing does, and the app already has speech recognition for the
// read-aloud exercises. The mic is offered only when it genuinely
// works — see `usable` on the hook, and the blocked-mic dead end it
// exists to prevent.

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSpeechRecognition } from '@/lib/audio/useSpeechRecognition';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { playSparkle } from '@/lib/audio/sfx';
import { MAX_LETTER_LENGTH, type Letter } from '@/lib/world/letters';

export default function LetterScene({
  learnerId, firstName,
}: { learnerId: string; firstName: string }) {
  const { settings } = useAccessibilitySettings();
  const reduced = settings.reducedMotion;
  const [letters, setLetters] = useState<Letter[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const speech = useSpeechRecognition();
  const boxRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/letters?learner=${learnerId}&open=1`)
      .then(r => r.json())
      .then(d => { setLetters(d.letters ?? []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [learnerId]);

  // Dictation appends rather than replaces, so she can speak a bit,
  // think, and speak again without losing the first part.
  useEffect(() => {
    if (!speech.transcript) return;
    setText(t => (t ? `${t} ${speech.transcript}` : speech.transcript));
    speech.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.transcript]);

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, text: body }),
      });
      const d = await res.json();
      if (d.letters) {
        setLetters(d.letters);
        setText('');
        setJustSent(true);
        playSparkle();
        window.setTimeout(() => setJustSent(false), 4000);
      }
    } catch {
      // Keep her words. A failed send must never eat the letter.
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(#efe7d6, #e3d9c4)' }}>
      <header className="flex items-center gap-2 px-4 py-3">
        <Link href={`/garden?learner=${learnerId}`}
          className="rounded-full bg-white border border-ochre text-lg"
          aria-label="back to the garden"
          style={{ minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          ←
        </Link>
        <h1 className="font-bold" style={{ color: '#3f2614' }}>The Letterbox</h1>
      </header>

      <main className="px-4 pb-12 max-w-xl mx-auto">
        <p className="text-sm mb-3" style={{ color: '#4a4034' }}>
          This goes to the person who builds your garden. Tell them what you
          want in it, what you like, what is broken, or what you have been
          wondering about. Real letters, read by a real someone.
        </p>

        <div className="rounded-2xl p-3"
             style={{ background: '#fffdf5', border: '1px solid #d8c9a8',
                      boxShadow: '0 1px 0 #e8dcc0 inset' }}>
          <textarea
            ref={boxRef}
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX_LETTER_LENGTH))}
            placeholder={`Dear garden-builder,\n\n`}
            rows={7}
            className="w-full bg-transparent outline-none resize-none text-base leading-relaxed"
            style={{ color: '#3f2614', fontFamily: 'inherit' }}
          />
          <div className="flex items-center gap-2 pt-2"
               style={{ borderTop: '1px dashed #e0d4b8' }}>
            {speech.usable && (
              <button
                onClick={() => (speech.listening ? speech.stop() : speech.start())}
                className="rounded-full text-lg"
                aria-label={speech.listening ? 'stop talking' : 'say it instead of typing'}
                style={{
                  minWidth: 44, minHeight: 44,
                  background: speech.listening ? '#c94c3e' : '#fffaf2',
                  color: speech.listening ? '#fff' : '#3f2614',
                  border: '1px solid #d8c9a8', touchAction: 'manipulation',
                }}
              >{speech.listening ? '◼' : '🎤'}</button>
            )}
            <span className="text-xs italic flex-1" style={{ color: '#8a7c62' }}>
              {speech.listening ? 'listening — just talk' : `love, ${firstName}`}
            </span>
            <button
              onClick={send}
              disabled={!text.trim() || sending}
              className="rounded-xl px-5 font-bold text-sm disabled:opacity-40"
              style={{ background: '#6b8e5a', color: '#fffaf2', minHeight: 48,
                       touchAction: 'manipulation' }}
            >
              {sending ? 'sending…' : 'send it'}
            </button>
          </div>
        </div>

        {justSent && (
          <motion.p
            initial={reduced ? undefined : { opacity: 0, y: -4 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            className="text-sm font-bold text-center mt-3"
            style={{ color: '#6b8e5a' }}
          >
            ✉️ posted. It may take a few days to be read.
          </motion.p>
        )}

        {loaded && letters.length > 0 && (
          <>
            <h2 className="text-sm font-bold mt-7 mb-2" style={{ color: '#3f2614' }}>
              Letters you have sent
            </h2>
            <div className="space-y-3">
              {letters.map(l => (
                <div key={l.id} className="rounded-2xl p-3"
                     style={{ background: 'rgba(255,253,245,0.92)', border: '1px solid #d8c9a8' }}>
                  <div className="text-xs mb-1" style={{ color: '#8a7c62' }}>
                    {l.sentAt.slice(0, 10)}
                  </div>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#3f2614' }}>
                    {l.text}
                  </p>
                  {l.reply && (
                    <div className="mt-3 rounded-xl p-3"
                         style={{ background: 'rgba(107,142,90,0.13)', border: '1px solid #6b8e5a' }}>
                      <div className="text-xs font-bold mb-1" style={{ color: '#4a6b3a' }}>
                        ✉️ a reply
                      </div>
                      <p className="text-sm whitespace-pre-wrap" style={{ color: '#3f2614' }}>
                        {l.reply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
