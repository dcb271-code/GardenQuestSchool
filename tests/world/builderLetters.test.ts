import { describe, it, expect } from 'vitest';
import {
  addBuilderLetter, addSiblingLetter, addLetter, unreadReplies, markRepliesRead, replyTo,
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

describe('kid-to-kid mail', () => {
  const NOW = '2026-08-28T12:00:00.000Z';

  it('lands in the box marked with the sender, unread, flag-raising', () => {
    const out = addSiblingLetter([], 'Dear Otto, I like your garden.', 'Cecily', NOW)!;
    expect(out.box[0].from).toBe('Cecily');
    expect(unreadReplies(out.box)).toHaveLength(1);
    const read = markRepliesRead(out.box, NOW);
    expect(unreadReplies(read)).toHaveLength(0);
  });

  it('an empty sibling letter is not a letter', () => {
    expect(addSiblingLetter([], '  ', 'Esme', NOW)).toBeNull();
  });

  it('sibling mail, builder mail and her own letters coexist', () => {
    let box = addLetter([], 'my own letter', NOW)!.box;
    box = addBuilderLetter(box, 'news', NOW)!.box;
    box = addSiblingLetter(box, 'hi from Esme', 'Esme', NOW)!.box;
    expect(box).toHaveLength(3);
    // two received letters unread; her own letter awaits a reply but
    // does not raise her own flag
    expect(unreadReplies(box)).toHaveLength(2);
  });
});
