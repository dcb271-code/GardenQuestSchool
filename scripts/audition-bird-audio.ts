#!/usr/bin/env tsx
/**
 * The audition page — where a human ear picks the clips.
 *
 *   npm run birds:audition        # then open http://localhost:4517
 *
 * Serves every proposed preview clip with its spectrogram, grouped by
 * bird and voice kind, with the catalog's mnemonic beside it so the
 * picker can hear whether the recording matches WHAT THE CURRICULUM
 * TEACHES — the "birdie-birdie-birdie" song exercise must play a clip
 * that actually says birdie-birdie-birdie.
 *
 * Nothing automated can make this judgement: the window proposer picks
 * the loudest six seconds, and the loudest six seconds can be a
 * lawnmower. Choosing which cardinal sounds most like a cardinal is
 * most of the lesson — this is a good page to drive WITH Cecily.
 *
 * Controls per candidate:
 *   ▶ play (m4a preview) · spectrogram · nudge −5/−1/+1/+5 seconds
 *   (re-cuts on the spot) · "choose this one" per bird × kind.
 *
 * Choices land in <bird>/selections.json; nudges persist into
 * proposals.json so a closed tab loses nothing. Upload refuses to run
 * without selections, so nothing ships unheard.
 *
 * Local tool only — it must never ship in the app bundle, which is why
 * it lives in scripts/ beside the contact-sheet generator.
 */

import { createServer } from 'node:http';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync, createReadStream, statSync } from 'node:fs';
import { join, normalize, sep } from 'node:path';
import { BIRD_CATALOG, type VoiceKind } from '../lib/world/birdCatalog';
import type { AudioCandidate } from './seed-bird-audio';
import { cutPreview, type WindowProposal } from './clip-bird-audio';
import { normaliseStart, CLIP_LEN_SEC } from './naturalist/audioClip';

const STAGING = join(process.cwd(), 'scripts', 'staging', 'birds-audio');
const PORT = 4517;

export interface AudioSelection {
  kind: VoiceKind;
  filename: string;
  sourceId: string;
  startSec: number;
}

const MIME: Record<string, string> = {
  '.m4a': 'audio/mp4', '.png': 'image/png',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
};

async function readJson<T>(path: string, fallback: T): Promise<T> {
  if (!existsSync(path)) return fallback;
  try { return JSON.parse(await readFile(path, 'utf-8')) as T; } catch { return fallback; }
}

interface BirdState {
  code: string;
  commonName: string;
  voices: Array<{ kind: VoiceKind; mnemonic: string | null; note: string }>;
  candidates: AudioCandidate[];
  proposals: WindowProposal[];
  selections: AudioSelection[];
}

async function loadState(): Promise<BirdState[]> {
  if (!existsSync(STAGING)) return [];
  const dirs = (await readdir(STAGING, { withFileTypes: true }))
    .filter(d => d.isDirectory() && !d.name.startsWith('_'))
    .map(d => d.name);
  const out: BirdState[] = [];
  // Catalog order, not directory order — the audition should walk the
  // crews the way the curriculum does.
  for (const bird of BIRD_CATALOG) {
    if (!dirs.includes(bird.code)) continue;
    const dir = join(STAGING, bird.code);
    out.push({
      code: bird.code,
      commonName: bird.commonName,
      voices: bird.voices.map(v => ({ kind: v.kind, mnemonic: v.mnemonic, note: v.note })),
      candidates: await readJson<AudioCandidate[]>(join(dir, 'recordings.json'), []),
      proposals: await readJson<WindowProposal[]>(join(dir, 'proposals.json'), []),
      selections: await readJson<AudioSelection[]>(join(dir, 'selections.json'), []),
    });
  }
  return out;
}

/** Resolve a media path and refuse anything that escapes staging. */
function safeMediaPath(rel: string): string | null {
  const full = normalize(join(STAGING, rel));
  if (!full.startsWith(STAGING + sep)) return null;
  if (!existsSync(full)) return null;
  return full;
}

async function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return Buffer.concat(chunks).toString('utf-8');
}

// ── the page ─────────────────────────────────────────────────────────

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bird clip audition</title>
<style>
  :root { color-scheme: light; }
  body { font-family: ui-rounded, "Hiragino Maru Gothic ProN", system-ui, sans-serif;
         background: linear-gradient(#e9efe4, #d8e3d0); color: #3f2614;
         margin: 0; padding: 16px; }
  main { max-width: 760px; margin: 0 auto; }
  h1 { font-size: 20px; }
  .progress { background: rgba(107,142,90,.14); border: 1px solid #6b8e5a;
              border-radius: 12px; padding: 10px 14px; margin: 12px 0;
              font-weight: 700; font-size: 14px; }
  section.bird { background: rgba(255,250,242,.94); border: 1px solid #e3dccf;
                 border-radius: 16px; padding: 14px; margin: 14px 0; }
  h2 { font-size: 17px; margin: 0 0 2px; }
  .kind-block { margin-top: 10px; border-top: 1px dashed #e3dccf; padding-top: 10px; }
  .kind-head { font-weight: 700; font-size: 14px; }
  .kind-head .mn { color: #6b8e5a; }
  .kind-note { font-size: 12.5px; color: #6b6255; margin: 2px 0 8px; }
  .cand { border: 1px solid #e3dccf; border-radius: 12px; padding: 10px;
          margin: 8px 0; background: #fffaf2; }
  .cand.chosen { border-color: #6b8e5a; box-shadow: 0 0 0 2px rgba(107,142,90,.35); }
  .cand .meta { font-size: 11.5px; color: #6b6255; margin-bottom: 6px; }
  .cand .warn { color: #b0652e; font-weight: 700; }
  .cand img { width: 100%; border-radius: 8px; display: block; margin: 6px 0; }
  .row { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
  audio { flex: 1 1 220px; height: 36px; }
  button { font: inherit; font-size: 13px; font-weight: 700; border-radius: 10px;
           border: 1px solid #e3dccf; background: #fffaf2; color: #3f2614;
           padding: 7px 10px; min-height: 40px; cursor: pointer; }
  button:disabled { opacity: .5; cursor: default; }
  button.choose { background: #6b8e5a; color: #fffaf2; border-color: #6b8e5a; }
  .cand.chosen button.choose { background: #3f2614; }
  .start { font-variant-numeric: tabular-nums; font-size: 12.5px; min-width: 88px;
           text-align: center; }
</style>
</head>
<body>
<main>
  <h1>🐦 Bird clip audition</h1>
  <p style="font-size:13.5px; color:#4a4034">
    Listen to each candidate and choose the one that sounds most like the
    words next to it. The picture shows the sound — a whistle is one clean
    line, a buzzy sound is fuzzy stacks. If the good part is just before or
    after the window, nudge it.
  </p>
  <div class="progress" id="progress"></div>
  <div id="birds"></div>
</main>
<script>
const CLIP_LEN = ${CLIP_LEN_SEC};
let state = [];

function chosen(bird, kind) {
  return (bird.selections || []).find(s => s.kind === kind);
}

function render() {
  const root = document.getElementById('birds');
  root.innerHTML = '';
  let need = 0, have = 0;
  for (const bird of state) {
    const sec = document.createElement('section');
    sec.className = 'bird';
    sec.innerHTML = '<h2>' + bird.commonName + '</h2>';
    const kinds = [...new Set(bird.voices.map(v => v.kind))];
    for (const kind of kinds) {
      need++;
      const voice = bird.voices.find(v => v.kind === kind);
      const sel = chosen(bird, kind);
      if (sel) have++;
      const block = document.createElement('div');
      block.className = 'kind-block';
      block.innerHTML =
        '<div class="kind-head">' + kind.replace('_', ' ') +
        (voice && voice.mnemonic ? ' — should sound like <span class="mn">“' + voice.mnemonic + '”</span>' : '') +
        '</div>' +
        (voice ? '<div class="kind-note">' + voice.note + '</div>' : '');
      const props = bird.proposals.filter(p => p.kind === kind);
      if (!props.length) {
        block.innerHTML += '<div class="kind-note">No previews yet — run npm run birds:audio-clips.</div>';
      }
      for (const p of props) {
        const cand = bird.candidates.find(c => c.filename === p.filename);
        const isChosen = !!(sel && sel.filename === p.filename);
        const d = document.createElement('div');
        d.className = 'cand' + (isChosen ? ' chosen' : '');
        d.dataset.bird = bird.code;
        d.dataset.filename = p.filename;
        d.dataset.start = p.proposedStartSec;
        const alsoWarn = cand && cand.also && cand.also.length
          ? ' · <span class="warn">background: ' + cand.also.join(', ') + '</span>' : '';
        d.innerHTML =
          '<div class="meta">' + p.sourceId + ' · quality ' + (cand ? cand.quality : '?') +
          ' · ' + p.durationSec + 's' +
          (cand && cand.locality ? ' · ' + cand.locality : '') + alsoWarn + '</div>' +
          '<img loading="lazy" src="/media/' + bird.code + '/' + p.spectrogramFile + '" alt="">' +
          '<div class="row">' +
            '<audio controls preload="none" src="/media/' + bird.code + '/' + p.previewFile + '"></audio>' +
            '<span class="start">' + fmtWindow(p.proposedStartSec) + '</span>' +
          '</div>' +
          '<div class="row" style="margin-top:6px">' +
            nudgeBtn(-5) + nudgeBtn(-1) + nudgeBtn(1) + nudgeBtn(5) +
            '<button class="choose" style="margin-left:auto">' +
              (isChosen ? '✓ chosen' : 'choose this one') + '</button>' +
          '</div>';
        d.querySelectorAll('button[data-nudge]').forEach(b =>
          b.addEventListener('click', () => nudge(d, Number(b.dataset.nudge))));
        d.querySelector('button.choose').addEventListener('click', () => select(d, kind, p.sourceId));
        block.appendChild(d);
      }
      sec.appendChild(block);
    }
    root.appendChild(sec);
  }
  document.getElementById('progress').textContent =
    have + ' of ' + need + ' clips chosen' + (have === need && need > 0 ? ' — all done! Run npm run birds:audio-upload.' : '');
}

function fmtWindow(s) {
  return s.toFixed(1) + '–' + (s + CLIP_LEN).toFixed(1) + 's';
}

function nudgeBtn(n) {
  return '<button data-nudge="' + n + '">' + (n > 0 ? '+' : '') + n + 's</button>';
}

async function nudge(el, delta) {
  el.querySelectorAll('button').forEach(b => b.disabled = true);
  try {
    const res = await fetch('/recut', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        bird: el.dataset.bird, filename: el.dataset.filename,
        start: Number(el.dataset.start) + delta,
      }),
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error);
    el.dataset.start = d.start;
    el.querySelector('.start').textContent = fmtWindow(d.start);
    el.querySelector('audio').src = '/media/' + el.dataset.bird + '/' + d.previewFile;
    el.querySelector('img').src = '/media/' + el.dataset.bird + '/' + d.spectrogramFile;
  } catch (e) {
    alert('Could not re-cut: ' + e.message);
  }
  el.querySelectorAll('button').forEach(b => b.disabled = false);
}

async function select(el, kind, sourceId) {
  const res = await fetch('/select', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      bird: el.dataset.bird, kind, sourceId,
      filename: el.dataset.filename, startSec: Number(el.dataset.start),
    }),
  });
  const d = await res.json();
  if (d.error) { alert(d.error); return; }
  const b = state.find(x => x.code === el.dataset.bird);
  if (b) b.selections = d.selections;
  render();
}

fetch('/state').then(r => r.json()).then(s => { state = s; render(); });
</script>
</body>
</html>`;

// ── the server ───────────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  try {
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(PAGE);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/state') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(await loadState()));
      return;
    }

    if (req.method === 'GET' && url.pathname.startsWith('/media/')) {
      const rel = decodeURIComponent(url.pathname.slice('/media/'.length));
      const full = safeMediaPath(rel);
      if (!full) { res.writeHead(404); res.end('not found'); return; }
      const ext = full.slice(full.lastIndexOf('.')).toLowerCase();
      res.writeHead(200, {
        'content-type': MIME[ext] ?? 'application/octet-stream',
        'content-length': statSync(full).size,
        'cache-control': 'no-store',
      });
      createReadStream(full).pipe(res);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/recut') {
      const { bird, filename, start } = JSON.parse(await readBody(req));
      const dir = join(STAGING, String(bird));
      const proposalsPath = join(dir, 'proposals.json');
      const proposals = await readJson<WindowProposal[]>(proposalsPath, []);
      const p = proposals.find(x => x.filename === filename);
      if (!p) { res.writeHead(400); res.end(JSON.stringify({ error: 'unknown recording' })); return; }

      const clamped = normaliseStart(Number(start) || 0, p.durationSec);
      const files = await cutPreview(dir, p.filename, clamped);
      // Persist the nudge — a closed tab must not lose an hour of ears.
      p.proposedStartSec = clamped;
      p.previewFile = files.previewFile;
      p.spectrogramFile = files.spectrogramFile;
      await writeFile(proposalsPath, JSON.stringify(proposals, null, 2));

      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ start: clamped, ...files }));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/select') {
      const { bird, kind, filename, sourceId, startSec } = JSON.parse(await readBody(req));
      const dir = join(STAGING, String(bird));
      if (!existsSync(join(dir, String(filename)))) {
        res.writeHead(400); res.end(JSON.stringify({ error: 'unknown recording' })); return;
      }
      const selPath = join(dir, 'selections.json');
      const selections = await readJson<AudioSelection[]>(selPath, []);
      const next = selections.filter(s => s.kind !== kind);
      next.push({ kind, filename, sourceId, startSec: Number(startSec) || 0 });
      await writeFile(selPath, JSON.stringify(next, null, 2));
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ selections: next }));
      return;
    }

    res.writeHead(404); res.end('not found');
  } catch (e) {
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: (e as Error).message }));
  }
});

server.listen(PORT, () => {
  console.log(`\n🐦 Audition page: http://localhost:${PORT}`);
  console.log('Choose every clip by ear, then run: npm run birds:audio-upload\n');
});
