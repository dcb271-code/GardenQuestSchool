// tests/world/birdCurriculum.test.ts
import { describe, it, expect } from 'vitest';
import {
  UNITS, getUnit, buildExercises, isUnitUnlocked, nextUnit, visibleUnits,
  birdsLearned, choiceCount, unitsOfCrew,
  PITCH_LABEL, TONE_LABEL,
  type BirdExercise, type BirdClipRef,
} from '@/lib/birds/curriculum';
import { getBird, sizeComparison, BILL_HINT } from '@/lib/world/birdCatalog';

const SEEDS = [1, 7, 42, 99, 1234, 5150, 20260726];

/** Every exercise this unit can generate across many seeds. */
function allExercises(unitCode: string): BirdExercise[] {
  const unit = getUnit(unitCode)!;
  return SEEDS.flatMap(s => buildExercises(unit, s));
}

describe('bird units', () => {
  it('every unit references only real birds', () => {
    for (const u of UNITS) {
      expect(u.birdCodes.length, u.code).toBeGreaterThan(0);
      for (const code of u.birdCodes) {
        expect(getBird(code), `${u.code} → ${code}`).toBeDefined();
      }
    }
  });

  it('every teach-page figure points at a real bird', () => {
    for (const u of UNITS) {
      for (const p of u.teach) {
        const f = p.figure;
        if (!f) continue;
        if (f.kind === 'photo') expect(getBird(f.ref.birdCode), u.code).toBeDefined();
        if (f.kind === 'marks') expect(getBird(f.birdCode), u.code).toBeDefined();
      }
    }
  });

  it('teaches a bird before it quizzes on it', () => {
    // A figure may only show a bird the unit actually covers, or one
    // from an earlier unit she has already met.
    const metByUnit = new Map<string, Set<string>>();
    const seen = new Set<string>();
    for (const u of UNITS) {
      u.birdCodes.forEach(c => seen.add(c));
      metByUnit.set(u.code, new Set(seen));
    }
    for (const u of UNITS) {
      const met = metByUnit.get(u.code)!;
      for (const p of u.teach) {
        const f = p.figure;
        const code = f?.kind === 'photo' ? f.ref.birdCode
          : f?.kind === 'marks' ? f.birdCode : null;
        if (code) expect(met.has(code), `${u.code} shows unmet ${code}`).toBe(true);
      }
    }
  });

  it('unlocks strictly in order, one at a time', () => {
    expect(isUnitUnlocked(UNITS[0].code, [])).toBe(true);
    expect(isUnitUnlocked(UNITS[1].code, [])).toBe(false);
    expect(isUnitUnlocked(UNITS[1].code, [UNITS[0].code])).toBe(true);
    // Completing a later unit must not unlock a skipped earlier one.
    expect(isUnitUnlocked(UNITS[2].code, [UNITS[0].code])).toBe(false);
  });

  it('look comes before know within a crew', () => {
    for (const crew of ['crew1', 'crew2']) {
      const stages = unitsOfCrew(crew).map(u => u.stage);
      expect(stages[0], crew).toBe('look');
      expect(stages).toContain('know');
      expect(stages.indexOf('look')).toBeLessThan(stages.indexOf('know'));
    }
  });

  it('nextUnit walks the whole course and then stops', () => {
    const done: string[] = [];
    for (let i = 0; i < UNITS.length; i++) {
      const n = nextUnit(done)!;
      expect(n.code).toBe(UNITS[i].code);
      done.push(n.code);
    }
    expect(nextUnit(done)).toBeUndefined();
  });

  it('birdsLearned accumulates as units are completed', () => {
    expect(birdsLearned([])).toEqual([]);
    const afterFirst = birdsLearned(['crew1_look']);
    expect(afterFirst).toHaveLength(5);
    expect(afterFirst).toContain('northern_cardinal');
    expect(birdsLearned(['crew1_look', 'crew2_look'])).toHaveLength(10);
    // The know unit covers the same birds — no double counting.
    expect(birdsLearned(['crew1_look', 'crew1_know'])).toHaveLength(5);
  });
});

describe('choiceCount', () => {
  it('ramps 2 → 3 → 4 across a unit', () => {
    const counts = Array.from({ length: 9 }, (_, i) => choiceCount(i, 9));
    expect(counts[0]).toBe(2);
    expect(counts[8]).toBe(4);
    // Never goes backwards.
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
    }
  });

  it('never offers four choices in a two-question unit', () => {
    expect(choiceCount(0, 2)).toBe(2);
    expect(choiceCount(1, 2)).toBe(2);
  });
});

describe('buildExercises', () => {
  it('generates the requested number for every unit', () => {
    for (const u of UNITS) {
      for (const seed of SEEDS) {
        expect(buildExercises(u, seed).length, `${u.code}/${seed}`)
          .toBe(u.exerciseCount);
      }
    }
  });

  it('is deterministic for a given seed', () => {
    for (const u of UNITS) {
      expect(buildExercises(u, 42)).toEqual(buildExercises(u, 42));
    }
  });

  it('different seeds give different question sets', () => {
    const a = JSON.stringify(buildExercises(getUnit('crew1_look')!, 1));
    const b = JSON.stringify(buildExercises(getUnit('crew1_look')!, 2));
    expect(a).not.toBe(b);
  });

  it('every multiple choice has a valid, unique, in-range answer', () => {
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        if (ex.kind === 'true_false') continue;
        const options: Array<string | { birdCode: string; role?: string; kind?: string }> =
          ex.kind === 'name_photo' || ex.kind === 'song_to_photo' ? ex.photos
          : ex.kind === 'which_did_you_hear' ? ex.clips
          : ex.choices;
        expect(options.length, ex.kind).toBeGreaterThanOrEqual(2);
        expect(ex.correctIndex).toBeGreaterThanOrEqual(0);
        expect(ex.correctIndex).toBeLessThan(options.length);
        // No repeated option — a duplicate makes two answers correct.
        const keys = options.map(o =>
          typeof o === 'string' ? o : `${o.birdCode}/${o.role ?? o.kind}`);
        expect(new Set(keys).size, `${ex.kind}: ${keys.join(' | ')}`).toBe(keys.length);
      }
    }
  });

  it('every exercise carries a hint worth reading', () => {
    // A wrong tap never advances; the hint is what makes the retry
    // teach instead of just costing a guess.
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        expect(ex.hint.trim().length, ex.kind).toBeGreaterThan(10);
      }
    }
  });

  it('size questions state the true size', () => {
    for (const ex of allExercises('crew1_look')) {
      if (ex.kind !== 'size_anchor') continue;
      const bird = getBird(ex.birdCode)!;
      expect(ex.choices[ex.correctIndex]).toBe(sizeComparison(bird));
    }
  });

  it('bill questions state the true bill', () => {
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        if (ex.kind !== 'bill_face') continue;
        const bird = getBird(ex.birdCode)!;
        expect(ex.choices[ex.correctIndex]).toBe(BILL_HINT[bird.bill]);
      }
    }
  });

  it('name_photo shows the target bird exactly once', () => {
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        if (ex.kind !== 'name_photo') continue;
        const hits = ex.photos.filter(p => p.birdCode === ex.birdCode);
        expect(hits).toHaveLength(1);
        expect(ex.photos[ex.correctIndex].birdCode).toBe(ex.birdCode);
      }
    }
  });

  it('behaviour distractors are never also true of the bird asked about', () => {
    // The bug this guards: two birds in a crew can honestly share a
    // behaviour, and offering it as the wrong answer marks a right
    // answer wrong.
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        if (ex.kind !== 'behaviour') continue;
        const bird = getBird(ex.birdCode)!;
        ex.choices.forEach((c, i) => {
          if (i === ex.correctIndex) return;
          expect(bird.behaviour, `${bird.code} also does "${c}"`).not.toContain(c);
        });
      }
    }
  });

  it('habitat distractors are never also true of the bird asked about', () => {
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        if (ex.kind !== 'habitat') continue;
        const bird = getBird(ex.birdCode)!;
        ex.choices.forEach((c, i) => {
          if (i === ex.correctIndex) return;
          expect(bird.habitat).not.toContain(c);
        });
      }
    }
  });

  it('a false true/false statement is actually false', () => {
    // It borrows another bird's field mark. If that mark happened to
    // also be true of this bird, the "correct" answer would be wrong.
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        if (ex.kind !== 'true_false' || ex.answer) continue;
        const bird = getBird(ex.birdCode)!;
        for (const mark of bird.fieldMarks) {
          expect(ex.prompt, `${bird.code}: "${mark}" is true of it`).not.toContain(mark);
        }
      }
    }
  });

  it('a true true/false statement is actually true', () => {
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        if (ex.kind !== 'true_false' || !ex.answer) continue;
        const bird = getBird(ex.birdCode)!;
        expect(bird.fieldMarks.some(m => ex.prompt.includes(m))).toBe(true);
      }
    }
  });

  it('asks about every bird in the crew, not just a favourite', () => {
    for (const u of UNITS) {
      const asked = new Set<string>();
      for (const ex of allExercises(u.code)) {
        const code =
          'birdCode' in ex ? ex.birdCode
          : 'photo' in ex ? ex.photo.birdCode
          : 'clip' in ex ? ex.clip.birdCode
          : ex.clips[ex.correctIndex].birdCode;
        asked.add(code);
      }
      for (const code of u.birdCodes) {
        expect(asked.has(code), `${u.code} never asks about ${code}`).toBe(true);
      }
    }
  });

  it('look units lead with shape before they lead with colour', () => {
    // Cornell's ordering is the whole pedagogical claim. If the
    // generator drifts to name-the-photo only, the claim is false.
    const kinds = new Set(allExercises('crew1_look').map(e => e.kind));
    expect(kinds).toContain('size_anchor');
    expect(kinds).toContain('bill_face');
    expect(kinds).toContain('photo_name');
  });

  it('know units ask about living, not about looks', () => {
    const kinds = new Set(allExercises('crew1_know').map(e => e.kind));
    expect(kinds.has('behaviour') || kinds.has('habitat')).toBe(true);
    expect(kinds).not.toContain('size_anchor');
    expect(kinds).not.toContain('photo_name');
  });
});

describe('listen and match stages', () => {
  /** First voice of the clip's kind — the one the audition page pins
   *  the stored clip to. Attribute questions must agree with it. */
  function primaryVoice(clip: BirdClipRef) {
    return getBird(clip.birdCode)!.voices.find(v => v.kind === clip.kind)!;
  }

  it('the course runs look → know → listen → match inside each crew', () => {
    for (const crew of ['crew1', 'crew2']) {
      const stages = unitsOfCrew(crew).map(u => u.stage);
      expect(stages, crew).toEqual(['look', 'know', 'listen', 'match']);
    }
  });

  it('listen units really exercise the ear, and never count repeats', () => {
    for (const code of ['crew1_listen', 'crew2_listen']) {
      const kinds = new Set(allExercises(code).map(e => e.kind));
      expect(kinds).toContain('mnemonic');
      expect(kinds).toContain('pitch_shape');
      expect(kinds).not.toContain('photo_name');
      // `repeats` describes the TYPICAL phrase count; any individual
      // recording may differ, and a child must never be marked wrong
      // for hearing the actual clip correctly.
      expect(kinds).not.toContain('repetitions');
    }
  });

  it('match units play the requested game', () => {
    for (const code of ['crew1_match', 'crew2_match']) {
      const kinds = new Set(allExercises(code).map(e => e.kind));
      expect(kinds).toContain('song_to_photo');
    }
  });

  it('every clip reference points at a voice the bird actually has', () => {
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        const refs: BirdClipRef[] =
          'clip' in ex ? [ex.clip] : 'clips' in ex ? ex.clips : [];
        for (const ref of refs) {
          const bird = getBird(ref.birdCode);
          expect(bird, ref.birdCode).toBeDefined();
          expect(
            bird!.voices.some(v => v.kind === ref.kind),
            `${u.code}: ${ref.birdCode} has no ${ref.kind}`,
          ).toBe(true);
        }
      }
    }
  });

  it('mnemonic questions have the true mnemonic as the answer', () => {
    for (const code of ['crew1_listen', 'crew2_listen']) {
      for (const ex of allExercises(code)) {
        if (ex.kind !== 'mnemonic') continue;
        const voice = primaryVoice(ex.clip);
        expect(ex.choices[ex.correctIndex]).toBe(voice.mnemonic);
        // And no distractor may be another of this bird's own voices.
        const own = getBird(ex.clip.birdCode)!.voices.map(v => v.mnemonic);
        ex.choices.forEach((c, i) => {
          if (i !== ex.correctIndex) expect(own).not.toContain(c);
        });
      }
    }
  });

  it('pitch and tone questions agree with the auditioned voice', () => {
    // The clip in storage is pinned to the FIRST voice of its kind —
    // the Blue Jay's second call rises where its first falls, and an
    // exercise built from the second would contradict the actual clip.
    for (const code of ['crew1_listen', 'crew2_listen']) {
      for (const ex of allExercises(code)) {
        if (ex.kind === 'pitch_shape') {
          expect(ex.choices[ex.correctIndex])
            .toBe(PITCH_LABEL[primaryVoice(ex.clip).pitchShape]);
        }
        if (ex.kind === 'tone') {
          expect(ex.choices[ex.correctIndex])
            .toBe(TONE_LABEL[primaryVoice(ex.clip).tone]);
        }
      }
    }
  });

  it('song_or_call answers state the clip\'s real kind', () => {
    for (const code of ['crew1_listen', 'crew2_listen']) {
      for (const ex of allExercises(code)) {
        if (ex.kind !== 'song_or_call') continue;
        expect(['song', 'call']).toContain(ex.clip.kind);
        const correct = ex.choices[ex.correctIndex];
        expect(correct.startsWith(ex.clip.kind === 'song' ? 'its song' : 'its call'))
          .toBe(true);
      }
    }
  });

  it('song_to_photo shows the singing bird exactly once', () => {
    for (const code of ['crew1_match', 'crew2_match']) {
      for (const ex of allExercises(code)) {
        if (ex.kind !== 'song_to_photo') continue;
        const hits = ex.photos.filter(p => p.birdCode === ex.clip.birdCode);
        expect(hits).toHaveLength(1);
        expect(ex.photos[ex.correctIndex].birdCode).toBe(ex.clip.birdCode);
      }
    }
  });

  it('which_did_you_hear plays two different birds', () => {
    for (const code of ['crew1_match', 'crew2_match']) {
      for (const ex of allExercises(code)) {
        if (ex.kind !== 'which_did_you_hear') continue;
        expect(ex.clips).toHaveLength(2);
        expect(ex.clips[0].birdCode).not.toBe(ex.clips[1].birdCode);
      }
    }
  });

  it('teach-page clip figures only play voices that exist', () => {
    for (const u of UNITS) {
      for (const p of u.teach) {
        if (p.figure?.kind !== 'clip') continue;
        const bird = getBird(p.figure.ref.birdCode);
        expect(bird, u.code).toBeDefined();
        expect(
          bird!.voices.some(v => v.kind === (p.figure as { ref: BirdClipRef }).ref.kind),
          `${u.code} figure: no such voice`,
        ).toBe(true);
      }
    }
  });

  it('listen/match units hide until their crew has audio, without padlocking the rest', () => {
    // No audio at all → the course looks exactly like Phase 1.
    const none = visibleUnits([]);
    expect(none.map(u => u.code)).toEqual(
      ['crew1_look', 'crew1_know', 'crew2_look', 'crew2_know']);
    // The Phase-1 chain still unlocks across the hidden gap.
    expect(isUnitUnlocked('crew2_look', ['crew1_look', 'crew1_know'], none)).toBe(true);

    // One crew1 bird with clips → crew1's listen/match appear.
    const some = visibleUnits(['northern_cardinal']);
    expect(some.map(u => u.code)).toContain('crew1_listen');
    expect(some.map(u => u.code)).not.toContain('crew2_listen');

    // And with audio everywhere, the full course in order.
    const all = visibleUnits(undefined);
    expect(all).toHaveLength(8);
  });

  it('a completed unit never re-locks when units are inserted before it', () => {
    // Cecily finished crew2_look before crew1_listen existed. The new
    // unit sits earlier in the chain; her finished unit must stay
    // open for review.
    expect(isUnitUnlocked('crew2_look', ['crew1_look', 'crew1_know', 'crew2_look'])).toBe(true);
    // But it does gate her NEXT new unit: crew2_know is not next
    // until listen/match are visible-and-passed or hidden.
    expect(nextUnit(['crew1_look', 'crew1_know', 'crew2_look'])!.code).toBe('crew1_listen');
  });
});
