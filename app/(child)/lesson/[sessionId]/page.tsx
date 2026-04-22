'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LessonHeader from '@/components/child/LessonHeader';
import NumberBonds from '@/lib/packs/math/rendering/NumberBonds';
import CountingTiles from '@/lib/packs/math/rendering/CountingTiles';
import EquationTap from '@/lib/packs/math/rendering/EquationTap';

interface ItemPayload {
  itemId: string;
  type: 'NumberBonds' | 'CountingTiles' | 'EquationTap';
  content: any;
  audioUrl?: string;
}

export default function LessonPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<ItemPayload | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'feedback'>('loading');
  const [retries, setRetries] = useState(0);
  const startTime = useRef<number>(Date.now());

  const endSession = useCallback(async () => {
    await fetch(`/api/session/${params.sessionId}/end`, { method: 'POST' });
    router.push(`/complete/${params.sessionId}`);
  }, [params.sessionId, router]);

  const loadNext = useCallback(async () => {
    setStatus('loading');
    setRetries(0);
    const res = await fetch(`/api/session/${params.sessionId}/item`);
    const data = await res.json();
    if (data.ended) {
      endSession();
      return;
    }
    setItem(data);
    startTime.current = Date.now();
    setStatus('ready');
  }, [params.sessionId, endSession]);

  const submit = async (response: any) => {
    if (!item) return;
    const res = await fetch(`/api/session/${params.sessionId}/attempt`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        itemId: item.itemId,
        response,
        timeMs: Date.now() - startTime.current,
        retries,
      }),
    });
    const data = await res.json();
    if (data.outcome === 'correct') {
      setStatus('feedback');
      setTimeout(loadNext, 900);
    } else {
      setRetries(r => r + 1);
    }
  };

  useEffect(() => { loadNext(); }, [loadNext]);

  return (
    <main className="max-w-xl mx-auto p-4">
      <LessonHeader
        breadcrumb="🔍 Exploration"
        onReplayAudio={() => {/* Plan 2 TTS wiring */}}
        onWonder={() => {/* Plan 3 virtue detector */}}
      />
      {status === 'loading' && <div className="text-kid-md text-center py-12">…</div>}
      {status === 'ready' && item && (
        <>
          {item.type === 'NumberBonds' &&
            <NumberBonds key={item.itemId} content={item.content} onSubmit={submit} retries={retries} />}
          {item.type === 'CountingTiles' &&
            <CountingTiles key={item.itemId} content={item.content} onSubmit={submit} retries={retries} />}
          {item.type === 'EquationTap' &&
            <EquationTap key={item.itemId} content={item.content} onSubmit={submit} retries={retries} />}
          {retries > 0 && (
            <div className="text-center text-terracotta mt-4">
              Let&apos;s look at it again — this is the hard part before it gets easy.
            </div>
          )}
        </>
      )}
      {status === 'feedback' && (
        <div className="text-center text-forest text-kid-md py-12">✓</div>
      )}
    </main>
  );
}
