import { describe, it, expect } from 'vitest';
import {
  addBuilderLetter, addLetter, unreadReplies, markRepliesRead, replyTo,
} from '@/lib/world/letters';

describe('letters from the garden-builder', () => {
  const NOW = '2026-08-21T12:00:00.000Z';

  it('arrives newest-first, flagged unread, and expects no reply', () => {
    const child = addLetter([], 'Dear garden builder, hello', NOW)!;
    const out = addBuilderLetter(child.box, 'News from the garden.', NOW)!;
    expect(out.box[0].from).toBe('builder');
    expect(out.box[0].text).toBe('News from the garden.');
    // it raises the flag exactly like a reply
    expect(unreadReplies(out.box).map(l => l.id)).toContain(out.letter.id);
  });

  it('opening the box clears it, like any reply', () => {
    const out = addBuilderLetter([], 'News.', NOW)!;
    const read = markRepliesRead(out.box, NOW);
    expect(read[0].readAt).toBe(NOW);
    expect(unreadReplies(read)).toHaveLength(0);
  });

  it('an empty letter is not a letter', () => {
    expect(addBuilderLetter([], '   ', NOW)).toBeNull();
  });

  it('does not disturb her own letters or their replies', () => {
    let box = addLetter([], 'my letter', NOW)!.box;
    box = replyTo(box, box[0].id, 'my reply', NOW);
    const withNews = addBuilderLetter(box, 'news', NOW)!.box;
    const hers = withNews.find(l => !l.from)!;
    expect(hers.text).toBe('my letter');
    expect(hers.reply).toBe('my reply');
    // both unread: her reply and the news
    expect(unreadReplies(withNews)).toHaveLength(2);
  });
});
