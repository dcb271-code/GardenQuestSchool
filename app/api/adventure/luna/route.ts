import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  defaultAdventureState, getEpisode, type LunaAdventureState,
} from '@/lib/world/lunaAdventure';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Luna adventure state machine. State lives in
 * world_state.garden.lunaAdventure; every mutation re-reads the row
 * first and writes the whole garden object back with sibling keys
 * preserved (same pattern as the session end route's arrival stash).
 *
 * Gate integrity: a gate only passes via 'gate-check', which verifies
 * the recorded session actually ended with at least one attempted
 * item. The story cannot be advanced past a gate from the client.
 */

const Body = z.object({
  learnerId: z.string().min(1),
  action: z.discriminatedUnion('type', [
    z.object({ type: z.literal('advance') }),
    z.object({ type: z.literal('choose'), choiceId: z.string(), optionId: z.string() }),
    z.object({ type: z.literal('gate-start'), gateId: z.string(), sessionId: z.string() }),
    z.object({ type: z.literal('gate-check') }),
    z.object({ type: z.literal('complete-episode') }),
  ]),
});

async function loadState(db: any, learnerId: string): Promise<{ garden: Record<string, any>; state: LunaAdventureState }> {
  const { data } = await db
    .from('world_state')
    .select('garden')
    .eq('learner_id', learnerId)
    .maybeSingle();
  const garden = (data?.garden as Record<string, any>) ?? {};
  const state = (garden.lunaAdventure as LunaAdventureState) ?? defaultAdventureState();
  return { garden, state };
}

async function saveState(db: any, learnerId: string, garden: Record<string, any>, state: LunaAdventureState) {
  garden.lunaAdventure = state;
  await db.from('world_state').upsert(
    { learner_id: learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const learnerId = url.searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });
  const db = createServiceClient();
  const { state } = await loadState(db, learnerId);
  return NextResponse.json({ state });
}

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();
  const { garden, state } = await loadState(db, body.learnerId);
  const episode = getEpisode(state.episode);
  if (!episode) return NextResponse.json({ error: 'no such episode' }, { status: 404 });
  const scene = episode.scenes[state.sceneIndex];

  switch (body.action.type) {
    case 'advance': {
      // Never advance past an unpassed gate.
      if (scene?.kind === 'gate' && !state.gatesPassed.includes(scene.id)) {
        return NextResponse.json({ state, blocked: 'gate' });
      }
      if (state.sceneIndex < episode.scenes.length - 1) state.sceneIndex += 1;
      await saveState(db, body.learnerId, garden, state);
      return NextResponse.json({ state });
    }

    case 'choose': {
      state.choices[body.action.choiceId] = body.action.optionId;
      if (state.sceneIndex < episode.scenes.length - 1) state.sceneIndex += 1;
      await saveState(db, body.learnerId, garden, state);
      return NextResponse.json({ state });
    }

    case 'gate-start': {
      // Verify the session belongs to this learner before recording it.
      const { data: sess } = await db
        .from('session')
        .select('id, learner_id')
        .eq('id', body.action.sessionId)
        .maybeSingle();
      if (!sess || sess.learner_id !== body.learnerId) {
        return NextResponse.json({ error: 'session not found' }, { status: 404 });
      }
      state.pendingGate = { gateId: body.action.gateId, sessionId: body.action.sessionId };
      await saveState(db, body.learnerId, garden, state);
      return NextResponse.json({ state });
    }

    case 'gate-check': {
      if (!state.pendingGate) return NextResponse.json({ state, gatePassed: false });
      const { data: sess } = await db
        .from('session')
        .select('ended_at, items_attempted')
        .eq('id', state.pendingGate.sessionId)
        .maybeSingle();
      const passed = !!sess?.ended_at && (sess.items_attempted ?? 0) >= 1;
      if (passed) {
        if (!state.gatesPassed.includes(state.pendingGate.gateId)) {
          state.gatesPassed.push(state.pendingGate.gateId);
        }
        state.pendingGate = null;
        if (state.sceneIndex < episode.scenes.length - 1) state.sceneIndex += 1;
        await saveState(db, body.learnerId, garden, state);
        return NextResponse.json({ state, gatePassed: true });
      }
      // Session abandoned or served zero items (brand-new learner edge)
      // — clear the pending gate so the invite can be re-offered.
      state.pendingGate = null;
      await saveState(db, body.learnerId, garden, state);
      return NextResponse.json({ state, gatePassed: false, attemptedItems: sess?.items_attempted ?? 0 });
    }

    case 'complete-episode': {
      if (state.sceneIndex < episode.scenes.length - 1) {
        return NextResponse.json({ state, blocked: 'not-at-end' });
      }
      if (!state.completedEpisodes.includes(state.episode)) {
        state.completedEpisodes.push(state.episode);
      }
      const next = getEpisode(state.episode + 1);
      if (next) {
        state.episode += 1;
        state.sceneIndex = 0;
      }
      await saveState(db, body.learnerId, garden, state);
      return NextResponse.json({ state });
    }
  }
}
