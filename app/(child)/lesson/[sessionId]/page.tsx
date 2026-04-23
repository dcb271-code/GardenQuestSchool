'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LessonHeader from '@/components/child/LessonHeader';
import { getItemHandler, getPromptText } from '@/lib/packs';
import { useNarrator } from '@/lib/audio/useNarrator';

interface ItemPayload {
  itemId: string;
  type: string;
  content: any;
  audioUrl?: string;
  learnerId?: string;
  skillCode?: string;
  themeTitle?: string;
  themeEmoji?: string;
  progress?: { attempted: number; cap: number };
}

export default function LessonPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<ItemPayload | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'feedback'>('loading');
  const [retries, setRetries] = useState(0);
  const [learnerId, setLearnerId] = useState<string | null>(null);
  const startTime = useRef<number>(Date.now());

  const promptText = item
    ? getPromptText({
        id: item.itemId,
        skillId: '',
        type: item.type,
        content: item.content,
        answer: {},
        difficultyElo: 1000,
        generatedBy: 'seed',
      })
    : '';
  const { replay } = useNarrator(promptText);

  const endSession = useCallback(async (target?: string) => {
    await fetch(`/api/session/${params.sessionId}/end`, { method: 'POST' });
    router.push(target ?? `/complete/${params.sessionId}`);
  }, [params.sessionId, router]);

  const loadNext = useCallback(async () => {
    setStatus('loading');
    setRetries(0);
    const res = await fetch(`/api/session/${params.sessionId}/item`);
    const data = await res.json();
    if (data.learnerId) setLearnerId(data.learnerId);
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

  const skip = async () => {
    if (!item) return;
    // record a skipped attempt so the planner doesn't re-serve the same item next turn
    await fetch(`/api/session/${params.sessionId}/attempt`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        itemId: item.itemId,
        response: { skipped: true },
        timeMs: Date.now() - startTime.current,
        retries,
      }),
    });
    loadNext();
  };

  useEffect(() => { loadNext(); }, [loadNext]);

  const breadcrumb = item
    ? `${item.themeEmoji ?? '🔍'} ${item.themeTitle ?? 'Exploration'}${item.progress ? `  ·  ${item.progress.attempted + 1}/${item.progress.cap}` : ''}`
    : 'Loading…';

  return (
    <main className="max-w-xl mx-auto p-4">
      <LessonHeader
        breadcrumb={breadcrumb}
        learnerId={learnerId}
        onReplayAudio={() => replay()}
        onWonder={() => {/* Plan 3 virtue detector */}}
        onSkip={item ? skip : undefined}
      />
      {status === 'loading' && <div className="text-kid-md text-center py-12">…</div>}
      {status === 'ready' && item && (() => {
        const handler = getItemHandler(item.type);
        if (!handler) return <div className="text-red-600">Unknown item type: {item.type}</div>;
        const Renderer = handler.renderer;
        return (
          <>
            <Renderer key={item.itemId} content={item.content} onSubmit={submit} retries={retries} />
            {retries > 0 && (
              <div className="text-center text-terracotta mt-4">
                Let&apos;s look at it again — this is the hard part before it gets easy.
              </div>
            )}
          </>
        );
      })()}
      {status === 'feedback' && (
        <div className="text-center text-forest text-kid-md py-12">✓</div>
      )}
    </main>
  );
}
