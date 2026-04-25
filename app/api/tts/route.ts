import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Simple in-memory cache — survives hot restarts on the same serverless
// instance. Keyed by `${voice}|${rate}|${text}`. Cache-control headers on
// the response also let the browser cache the blob URL.
const memoryCache = new Map<string, Buffer>();
const MAX_CACHE_ENTRIES = 500;

function cacheKey(text: string, voice: string, rate: number) {
  return `${voice}|${rate}|${text}`;
}

interface SynthRequest {
  text: string;
  voice: string;
  rate: number;
}

async function synthesize({ text, voice, rate }: SynthRequest): Promise<NextResponse> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_TTS_API_KEY not set' }, { status: 500 });
  }

  if (!text) return NextResponse.json({ error: 'Empty text' }, { status: 400 });
  if (text.length > 800) return NextResponse.json({ error: 'Text too long' }, { status: 400 });

  const key = cacheKey(text, voice, rate);
  const cached = memoryCache.get(key);
  if (cached) {
    return new NextResponse(new Uint8Array(cached), {
      status: 200,
      headers: {
        'content-type': 'audio/mpeg',
        // Aggressively cache in the browser too — same text + voice + rate
        // always produces the same bytes, so an immutable response is safe.
        'cache-control': 'public, max-age=31536000, immutable',
        'x-cache': 'HIT',
      },
    });
  }

  // Derive languageCode from voice name (e.g., en-GB-Neural2-A → en-GB)
  const langMatch = voice.match(/^([a-z]{2}-[A-Z]{2})/);
  const languageCode = langMatch ? langMatch[1] : 'en-GB';

  const googleRes = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode, name: voice },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: rate,
          pitch: 0,
          sampleRateHertz: 24000,
          effectsProfileId: ['small-bluetooth-speaker-class-device'],
        },
      }),
    },
  );

  if (!googleRes.ok) {
    const detail = await googleRes.text();
    console.error(`Google TTS error (${googleRes.status}):`, detail);
    return NextResponse.json(
      { error: 'TTS provider failed', status: googleRes.status, detail: detail.slice(0, 400) },
      { status: 502 },
    );
  }

  const payload = (await googleRes.json()) as { audioContent?: string };
  if (!payload.audioContent) {
    return NextResponse.json({ error: 'No audio returned' }, { status: 502 });
  }

  const buf = Buffer.from(payload.audioContent, 'base64');
  if (memoryCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = memoryCache.keys().next().value;
    if (oldest) memoryCache.delete(oldest);
  }
  memoryCache.set(key, buf);

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'content-type': 'audio/mpeg',
      'cache-control': 'public, max-age=31536000, immutable',
      'x-cache': 'MISS',
    },
  });
}

function clampRate(r: unknown, fallback: number): number {
  const n = typeof r === 'number' ? r : typeof r === 'string' ? parseFloat(r) : NaN;
  if (!isFinite(n)) return fallback;
  return Math.max(0.5, Math.min(1.5, n));
}

// GET endpoint — browser-cacheable. Use this in <audio src> for free
// HTTP caching. Same text+voice+rate URL → same MP3 → cache hit.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const text = (url.searchParams.get('text') ?? '').trim();
  const voice = url.searchParams.get('voice') || 'en-GB-Neural2-A';
  const rate = clampRate(url.searchParams.get('rate'), 0.9);
  return synthesize({ text, voice, rate });
}

// POST endpoint — kept for back-compat / longer prompts that wouldn't fit
// in a URL.
export async function POST(req: NextRequest) {
  let body: { text?: string; voice?: string; rate?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  return synthesize({
    text: (body.text ?? '').trim(),
    voice: body.voice || 'en-GB-Neural2-A',
    rate: clampRate(body.rate, 0.9),
  });
}
