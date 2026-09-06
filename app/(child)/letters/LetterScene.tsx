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
import {
  LETTERBOX_COLORS, LETTERBOX_EMBLEMS, getLetterboxColor,
  type LetterboxStyle,
} from '@/lib/world/letterbox';
import { LetterboxArt, EmblemArt } from '@/components/child/garden/LetterboxArt';

export default function LetterScene({
  learnerId, firstName, siblings = [], ownBox = { color: 'green' },
}: {
  learnerId: string;
  firstName: string;
  siblings?: Array<{ id: string; name: string; box?: LetterboxStyle }>;
  ownBox?: LetterboxStyle;
}) {
  const { settings } = useAccessibilitySettings();
  const reduced = settings.reducedMotion;
  const [letters, setLetters] = useState<Letter[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  // '' = the garden-builder; otherwise a sibling's learner id.
  const [recipient, setRecipient] = useState('');
  const recipientName = siblings.find(sb => sb.id === recipient)?.name ?? null;
  const [justSent, setJustSent] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const speech = useSpeechRecognition();
  const boxRef = useRef<HTMLTextAreaElement>(null);

  // The paint job on HER letterbox. Optimistic — the swatch takes
  // effect on tap, and a failed save says so in words and reverts.
  const [box, setBox] = useState<LetterboxStyle>(ownBox);
  const [painting, setPainting] = useState(false);
  const [paintNote, setPaintNote] = useState<string | null>(null);

  const paint = async (color: string, emblem: string | null) => {
    const before = box;
    setBox({ color, ...(emblem ? { emblem } : {}) });
    setPaintNote(null);
    try {
      const res = await fetch('/api/letterbox', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, color, emblem }),
      });
      const d = await res.json();
      if (d.error) { setBox(before); setPaintNote(d.error); }
    } catch {
      setBox(before);
      setPaintNote('The paint did not stick. Try again in a bit.');
    }
  };

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
        body: JSON.stringify({
          learnerId, text: body,
          ...(recipient ? { to: recipient } : {}),
        }),
      });
      const d = await res.json();
      if (d.letters || d.delivered) {
        if (d.letters) setLetters(d.letters);
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
        <h1 className="font-bold flex-1" style={{ color: '#3f2614' }}>The Letterbox</h1>
        {/* her box, as it looks on the map — tap to repaint */}
        <button onClick={() => setPainting(p => !p)}
                aria-label={painting ? 'done painting' : 'paint your letterbox'}
                className="rounded-xl flex items-center gap-1 px-2"
                style={{ background: painting ? '#C9A227' : '#fffaf2',
                         border: '2px solid #C9A227', minHeight: 48,
                         touchAction: 'manipulation' }}>
          <LetterboxArt colorCode={box.color} emblem={box.emblem} flagUp={false} size={34} />
          <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden>
            {/* a little paintbrush, drawn */}
            <path d="M 3 17 q -1 -3 2 -4 q 3 -1 3 2 q 0 3 -5 2 Z" fill="#8A6238" />
            <path d="M 7 13 L 15 3 q 1.6 -1.4 2.8 0 q 1 1.4 -0.6 2.6 L 9 15 Z"
                  fill={painting ? '#3f2614' : '#C9A227'} />
          </svg>
        </button>
      </header>

      <main className="px-4 pb-12 max-w-xl mx-auto">
        {/* the paint panel — six paints, six emblems, all free */}
        {painting && (
          <div className="rounded-2xl p-3 mb-3"
               style={{ background: '#fffdf5', border: '2px solid #C9A227' }}>
            <p className="text-xs font-bold mb-2" style={{ color: '#3f2614' }}>
              Paint your letterbox — it changes in the garden too.
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {LETTERBOX_COLORS.map(c => (
                <button key={c.code} onClick={() => paint(c.code, box.emblem ?? null)}
                        aria-label={c.name}
                        className="rounded-xl"
                        style={{ padding: 2, background: '#fffaf2',
                                 border: box.color === c.code
                                   ? '3px solid #3f2614' : '2px solid #d8c9a8',
                                 touchAction: 'manipulation' }}>
                  <LetterboxArt colorCode={c.code} flagUp={false} size={40} />
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 flex-wrap mt-2 items-center">
              <button onClick={() => paint(box.color, null)}
                      aria-label="no emblem — plain door"
                      className="rounded-full text-[10px] font-bold"
                      style={{ width: 44, height: 44, background: '#fffaf2',
                               color: '#8a7c62',
                               border: !box.emblem ? '3px solid #3f2614' : '2px solid #d8c9a8',
                               touchAction: 'manipulation' }}>
                plain
              </button>
              {LETTERBOX_EMBLEMS.map(e => (
                <button key={e} onClick={() => paint(box.color, e)}
                        aria-label={`${e} emblem`}
                        className="rounded-full"
                        style={{ width: 44, height: 44,
                                 background: getLetterboxColor(box.color).body,
                                 border: box.emblem === e
                                   ? '3px solid #3f2614' : '2px solid #d8c9a8',
                                 touchAction: 'manipulation' }}>
                  <svg width="36" height="36" viewBox="-9 -9 18 18" style={{ margin: '0 auto' }}>
                    <EmblemArt code={e} />
                  </svg>
                </button>
              ))}
            </div>
            {paintNote && (
              <p className="text-xs mt-2" style={{ color: '#A2385A' }}>{paintNote}</p>
            )}
          </div>
        )}

        <p className="text-sm mb-3" style={{ color: '#4a4034' }}>
          This goes to the person who builds your garden. Tell them what you
          want in it, what you like, what is broken, or what you have been
          wondering about. Real letters, read by a real someone.
        </p>

        {/* who gets this letter — the builder, or a sibling. Faces
            over words, because the youngest writer cannot read. */}
        {siblings.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            <button onClick={() => setRecipient('')}
                    className="rounded-full px-3 py-1.5 text-xs font-bold"
                    style={{ background: recipient === '' ? '#6b8e5a' : '#fffaf2',
                             color: recipient === '' ? '#fffaf2' : '#3f2614',
                             border: '2px solid #6b8e5a', minHeight: 40,
                             touchAction: 'manipulation' }}>
              🏡 the garden-builder
            </button>
            {siblings.map(sb => (
              <button key={sb.id} onClick={() => setRecipient(sb.id)}
                      className="rounded-full pl-1.5 pr-3 py-1 text-xs font-bold flex items-center gap-1"
                      style={{ background: recipient === sb.id ? '#C9A227' : '#fffaf2',
                               color: '#3f2614',
                               border: '2px solid #C9A227', minHeight: 40,
                               touchAction: 'manipulation' }}>
                {/* their real letterbox, so the box says whose it is */}
                <LetterboxArt colorCode={sb.box?.color ?? 'green'}
                              emblem={sb.box?.emblem} flagUp={false} size={26} />
                {sb.name}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-2xl p-3"
             style={{ background: '#fffdf5', border: '1px solid #d8c9a8',
                      boxShadow: '0 1px 0 #e8dcc0 inset' }}>
          <textarea
            ref={boxRef}
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX_LETTER_LENGTH))}
            placeholder={`Dear ${recipientName ?? 'garden-builder'},\n\n`}
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
            {recipientName
              ? `✉️ delivered! It is in ${recipientName}'s letterbox right now — their flag is up.`
              : '✉️ posted. It may take a few days to be read.'}
          </motion.p>
        )}

        {loaded && letters.length > 0 && (
          <>
            <h2 className="text-sm font-bold mt-7 mb-2" style={{ color: '#3f2614' }}>
              Letters sent and received
            </h2>
            <div className="space-y-3">
              {letters.map(l => l.from && l.from !== 'builder' ? (
                /* a letter from a SIBLING — rose paper, and a way to
                   write straight back */
                <div key={l.id} className="rounded-2xl p-3"
                     style={{ background: 'rgba(232,180,192,0.18)', border: '2px solid #C97B8A' }}>
                  <div className="text-xs font-bold mb-1" style={{ color: '#8A4A5A' }}>
                    💌 a letter from {l.from} · {l.sentAt.slice(0, 10)}
                  </div>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#3f2614' }}>
                    {l.text}
                  </p>
                  <button
                    onClick={() => {
                      const sb = siblings.find(x => x.name === l.from);
                      if (sb) setRecipient(sb.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      boxRef.current?.focus();
                    }}
                    className="rounded-xl px-3 py-2 mt-2 text-xs font-bold"
                    style={{ background: '#C97B8A', color: '#fffaf2', minHeight: 40,
                             touchAction: 'manipulation' }}>
                    ✏️ write back
                  </button>
                </div>
              ) : l.from === 'builder' ? (
                /* a letter FROM the garden-builder — its own paper,
                   sealed-looking, so news reads as news */
                <div key={l.id} className="rounded-2xl p-3"
                     style={{ background: 'rgba(107,142,90,0.13)', border: '2px solid #6b8e5a' }}>
                  <div className="text-xs font-bold mb-1" style={{ color: '#4a6b3a' }}>
                    📯 a letter from the garden-builder · {l.sentAt.slice(0, 10)}
                  </div>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#3f2614' }}>
                    {l.text}
                  </p>
                </div>
              ) : (
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
