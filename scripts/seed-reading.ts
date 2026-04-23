#!/usr/bin/env tsx
import type { SupabaseClient } from '@supabase/supabase-js';
import { READING_STRANDS } from '../lib/packs/reading/strands';
import { READING_SKILLS } from '../lib/packs/reading/skills';

const DOLCH_PRIMER = [
  'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down',
  'find', 'for', 'funny', 'go', 'help', 'here', 'I', 'in',
  'is', 'it', 'jump', 'little', 'look', 'make', 'me', 'my',
  'not', 'one', 'play', 'red', 'run', 'said', 'see', 'the',
  'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you',
];

const DOLCH_FIRST_GRADE = [
  'after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could',
  'every', 'fly', 'from', 'give', 'going', 'had', 'has', 'her',
  'him', 'his', 'how', 'just', 'know', 'let', 'live', 'may',
  'of', 'old', 'once', 'open', 'over', 'put', 'round', 'some',
  'stop', 'take', 'thank', 'them', 'then', 'think', 'walk', 'were',
  'when',
];

const CVC_WORDS: string[][] = [
  ['c', 'a', 't'], ['d', 'o', 'g'], ['b', 'a', 't'], ['m', 'a', 'p'],
  ['p', 'i', 'g'], ['s', 'u', 'n'], ['f', 'i', 'sh'], ['c', 'u', 'p'],
  ['h', 'a', 't'], ['r', 'e', 'd'], ['b', 'u', 'g'], ['l', 'i', 'p'],
  ['n', 'e', 't'], ['j', 'e', 't'], ['p', 'a', 'n'], ['f', 'o', 'x'],
];

const DIGRAPH_WORDS: Array<{ word: string; digraph: string; emoji: string }> = [
  { word: 'ship', digraph: 'sh', emoji: '🚢' },
  { word: 'fish', digraph: 'sh', emoji: '🐟' },
  { word: 'shoe', digraph: 'sh', emoji: '👟' },
  { word: 'shell', digraph: 'sh', emoji: '🐚' },
  { word: 'chip', digraph: 'ch', emoji: '🍟' },
  { word: 'chin', digraph: 'ch', emoji: '🙂' },
  { word: 'chick', digraph: 'ch', emoji: '🐥' },
  { word: 'cheese', digraph: 'ch', emoji: '🧀' },
  { word: 'thin', digraph: 'th', emoji: '➖' },
  { word: 'thumb', digraph: 'th', emoji: '👍' },
  { word: 'three', digraph: 'th', emoji: '3️⃣' },
  { word: 'thick', digraph: 'th', emoji: '📚' },
];

const READ_ALOUD_WORDS = [
  'cat', 'dog', 'sun', 'map', 'bug', 'hat', 'red', 'fish',
  'ship', 'chip', 'milk', 'book', 'pond', 'frog', 'cake',
];

export async function seedReading(
  sb: SupabaseClient,
  subjectId: string,
  skillIdByCode: Map<string, string>
): Promise<void> {
  for (const s of READING_STRANDS) {
    const { error } = await sb.from('strand').upsert({
      subject_id: subjectId,
      code: s.code,
      name: s.name,
      sort_order: s.sortOrder,
    }, { onConflict: 'subject_id,code' });
    if (error) throw error;
  }

  const { data: strandRows } = await sb.from('strand')
    .select('id, code').eq('subject_id', subjectId);
  const strandIdByCode = new Map(strandRows!.map(r => [r.code, r.id]));

  for (const sk of READING_SKILLS) {
    const strandId = strandIdByCode.get(sk.strandCode);
    if (!strandId) continue;
    const { error } = await sb.from('skill').upsert({
      strand_id: strandId,
      code: sk.code,
      name: sk.name,
      level: sk.level,
      prereq_skill_codes: sk.prereqSkillCodes,
      curriculum_refs: sk.curriculumRefs ?? {},
      theme_tags: sk.themeTags,
      sort_order: sk.sortOrder,
    }, { onConflict: 'code' });
    if (error) throw error;
  }

  const { data: allSkillRows } = await sb.from('skill').select('id, code');
  for (const r of allSkillRows ?? []) skillIdByCode.set(r.code, r.id);

  const readingSkillIds = READING_SKILLS
    .map(s => skillIdByCode.get(s.code))
    .filter((x): x is string => !!x);
  if (readingSkillIds.length > 0) {
    const { data: prior } = await sb.from('item')
      .select('id').eq('generated_by', 'seed').in('skill_id', readingSkillIds);
    const priorIds = (prior ?? []).map(r => r.id);
    if (priorIds.length > 0) {
      await sb.from('attempt').delete().in('item_id', priorIds);
      await sb.from('item').delete().in('id', priorIds);
    }
  }

  const now = new Date().toISOString();
  const items: any[] = [];

  // SightWordTap: Dolch Primer
  {
    const id = skillIdByCode.get('reading.sight_words.dolch_primer');
    if (id) {
      for (let i = 0; i < Math.min(20, DOLCH_PRIMER.length); i++) {
        const word = DOLCH_PRIMER[i];
        const pool = DOLCH_PRIMER.filter(w => w !== word);
        const distractors = [pool[(i * 3) % pool.length], pool[(i * 7 + 1) % pool.length]];
        items.push({
          skill_id: id,
          type: 'SightWordTap',
          content: {
            type: 'SightWordTap',
            word,
            distractors,
            promptText: `Which word says "${word}"?`,
          },
          answer: { word },
          approved_at: now,
          generated_by: 'seed',
          difficulty_elo: 950 + i * 5,
        });
      }
    }
  }

  // SightWordTap: Dolch First Grade
  {
    const id = skillIdByCode.get('reading.sight_words.dolch_first_grade');
    if (id) {
      for (let i = 0; i < Math.min(20, DOLCH_FIRST_GRADE.length); i++) {
        const word = DOLCH_FIRST_GRADE[i];
        const pool = DOLCH_FIRST_GRADE.filter(w => w !== word);
        const distractors = [pool[(i * 3) % pool.length], pool[(i * 5 + 2) % pool.length]];
        items.push({
          skill_id: id,
          type: 'SightWordTap',
          content: {
            type: 'SightWordTap',
            word,
            distractors,
            promptText: `Which word says "${word}"?`,
          },
          answer: { word },
          approved_at: now,
          generated_by: 'seed',
          difficulty_elo: 1050 + i * 5,
        });
      }
    }
  }

  // PhonemeBlend: CVC words
  {
    const id = skillIdByCode.get('reading.phonics.cvc_blend');
    if (id) {
      const blendedWords = CVC_WORDS.map(p => p.join(''));
      for (let i = 0; i < CVC_WORDS.length; i++) {
        const phonemes = CVC_WORDS[i];
        const word = phonemes.join('');
        const pool = blendedWords.filter(w => w !== word);
        const distractors = [pool[(i * 3) % pool.length], pool[(i * 7 + 1) % pool.length]];
        items.push({
          skill_id: id,
          type: 'PhonemeBlend',
          content: {
            type: 'PhonemeBlend',
            phonemes,
            word,
            distractors,
            promptText: 'Blend the sounds and pick the word.',
          },
          answer: { word },
          approved_at: now,
          generated_by: 'seed',
          difficulty_elo: 950 + i * 5,
        });
      }
    }
  }

  // DigraphSort
  {
    const id = skillIdByCode.get('reading.phonics.digraphs');
    if (id) {
      const grouped: Record<string, typeof DIGRAPH_WORDS> = { ch: [], sh: [], th: [] };
      for (const w of DIGRAPH_WORDS) grouped[w.digraph].push(w);
      const rounds = Math.min(grouped.ch.length, grouped.sh.length, grouped.th.length);
      for (let r = 0; r < rounds; r++) {
        const roundWords = [grouped.ch[r], grouped.sh[r], grouped.th[r]];
        items.push({
          skill_id: id,
          type: 'DigraphSort',
          content: {
            type: 'DigraphSort',
            digraphs: ['ch', 'sh', 'th'],
            words: roundWords.map(w => ({ word: w.word, emoji: w.emoji, digraph: w.digraph })),
            promptText: 'Put each word in the right bucket.',
          },
          answer: {
            placements: Object.fromEntries(roundWords.map(w => [w.word, w.digraph])),
          },
          approved_at: now,
          generated_by: 'seed',
          difficulty_elo: 1050 + r * 20,
        });
      }
    }
  }

  // ReadAloudSimple
  {
    const id = skillIdByCode.get('reading.read_aloud.simple');
    if (id) {
      for (let i = 0; i < READ_ALOUD_WORDS.length; i++) {
        const word = READ_ALOUD_WORDS[i];
        items.push({
          skill_id: id,
          type: 'ReadAloudSimple',
          content: {
            type: 'ReadAloudSimple',
            word,
            promptText: 'Say it out loud.',
          },
          answer: {},
          approved_at: now,
          generated_by: 'seed',
          difficulty_elo: 950 + word.length * 10,
        });
      }
    }
  }

  if (items.length > 0) {
    const { error } = await sb.from('item').insert(items);
    if (error) throw error;
  }

  console.log(`  → reading: inserted ${items.length} items across ${readingSkillIds.length} skills`);
}
