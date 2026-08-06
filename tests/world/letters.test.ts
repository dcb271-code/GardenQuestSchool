// tests/world/letters.test.ts
import { describe, it, expect } from 'vitest';
import {
  addLetter, unreadReplies, markRepliesRead, replyTo, letterId,
  MAX_LETTER_LENGTH, type Letterbox,
} from '@/lib/world/letters';

const DAY = '2026-08-06T10:00:00.000Z';

describe('writing a letter', () => {
  it('keeps what she wrote, newest first', () => {
    const one = addLetter([], 'please add a gem mine', DAY)!;
    const two = addLetter(one.box, 'and a waterfall', DAY)!;
    expect(two.box.map(l => l.text)).toEqual(['and a waterfall', 'please add a gem mine']);
  });

  it('refuses an empty letter but never mangles a real one', () => {
    expect(addLetter([], '   ', DAY)).toBeNull();
    expect(addLetter([], '  hello  ', DAY)!.letter.text).toBe('hello');
  });

  it('gives every letter a unique, readable id even on the same day', () => {
    let box: Letterbox = [];
    for (let i = 0; i < 3; i++) box = addLetter(box, `letter ${i}`, DAY)!.box;
    const ids = box.map(l => l.id);
    expect(new Set(ids).size).toBe(3);
    expect(ids.every(id => id.startsWith('2026-08-06'))).toBe(true);
  });

  it('caps absurd length without silently dropping a normal letter', () => {
    const long = 'a'.repeat(MAX_LETTER_LENGTH + 500);
    expect(addLetter([], long, DAY)!.letter.text).toHaveLength(MAX_LETTER_LENGTH);
    // A real child's letter is nowhere near the cap.
    const normal = 'I would like a gem mine in one of the mountains please';
    expect(addLetter([], normal, DAY)!.letter.text).toBe(normal);
  });
});

describe('replies', () => {
  it('a reply is unread until she opens the box', () => {
    let box = addLetter([], 'can birds sing in the garden?', DAY)!.box;
    expect(unreadReplies(box)).toHaveLength(0);      // nothing to read yet
    box = replyTo(box, box[0].id, 'They can now — tap one!', DAY);
    expect(unreadReplies(box)).toHaveLength(1);
    box = markRepliesRead(box, DAY);
    expect(unreadReplies(box)).toHaveLength(0);
  });

  it('marking read does not disturb letters with no reply', () => {
    const box = addLetter([], 'hello', DAY)!.box;
    expect(markRepliesRead(box, DAY)).toEqual(box);
  });

  it('replying leaves her words exactly as written', () => {
    const original = 'a gem mine!!! with REAL gems';
    let box = addLetter([], original, DAY)!.box;
    box = replyTo(box, box[0].id, 'Building it now.', DAY);
    expect(box[0].text).toBe(original);
    expect(box[0].reply).toBe('Building it now.');
    expect(box[0].repliedAt).toBe(DAY);
  });

  it('an unknown id changes nothing', () => {
    const box = addLetter([], 'hello', DAY)!.box;
    expect(replyTo(box, 'not-a-letter', 'hi', DAY)).toEqual(box);
  });
});

describe('letterId', () => {
  it('numbers within a day and never collides', () => {
    expect(letterId(DAY, [])).toBe('2026-08-06-1');
    expect(letterId(DAY, [{ id: '2026-08-06-1', text: 'x', sentAt: DAY }]))
      .toBe('2026-08-06-2');
  });
});
