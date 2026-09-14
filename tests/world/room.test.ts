import { describe, it, expect } from 'vitest';
import {
  emptyRoom, setQuilt, setShelf, pruneShelf, hangInBedroom, checkWallSlot,
  resolveHung, resolveShelf, isUndecorated, getsABedroom, ownsShelfItem,
  QUILTS, BEDROOM_SLOTS, type Collections,
} from '@/lib/world/room';
import { hangPicture, addPiece, type HungPictures } from '@/lib/world/artStore';

const NOW = '2026-09-14T12:00:00.000Z';
const gallery = addPiece(addPiece([], 'kid/a.png', NOW).gallery, 'kid/b.png', NOW).gallery;
// ids: 2026-09-14-2 (newest, first) and 2026-09-14-1

const owns: Collections = {
  kept: { garnet: 1, geode: 2, coal: 0 },
  lifeList: ['carolina_wren'],
  prizes: ['proud_tomato', 'proud_tomato'],
};

describe('who gets a door', () => {
  it('every child does; the shared tablets do not', () => {
    expect(getsABedroom('Cecily')).toBe(true);
    expect(getsABedroom('Otto')).toBe(true);
    expect(getsABedroom('Friends')).toBe(false);
    expect(getsABedroom('Family')).toBe(false);
  });
});

describe('the quilt', () => {
  it('is one of four, and anything else is refused in words', () => {
    expect(QUILTS.map(q => q.code)).toEqual(['patch', 'star', 'sun', 'sea']);
    const out = setQuilt(emptyRoom(), 'star');
    expect('room' in out && out.room.quilt).toBe('star');
    const bad = setQuilt(emptyRoom(), 'velvet');
    expect('error' in bad && bad.error).toMatch(/not one of the quilts/);
  });
});

describe('the treasure shelf shows what she owns, never what a client names', () => {
  it('puts a kept stone, a seen bird and a won veggie up', () => {
    let room = emptyRoom();
    for (const [spot, item] of [
      [0, { kind: 'stone', code: 'garnet' }],
      [1, { kind: 'bird', code: 'carolina_wren' }],
      [2, { kind: 'veggie', code: 'proud_tomato' }],
    ] as const) {
      const out = setShelf(room, spot, item, owns);
      expect('room' in out).toBe(true);
      if ('room' in out) room = out.room;
    }
    expect(room.shelf).toEqual([
      { kind: 'stone', code: 'garnet' },
      { kind: 'bird', code: 'carolina_wren' },
      { kind: 'veggie', code: 'proud_tomato' },
    ]);
  });

  it('refuses a stone she never banked, a bird never seen, a veggie never won', () => {
    const stone = setShelf(emptyRoom(), 0, { kind: 'stone', code: 'diamond' }, owns);
    expect('error' in stone && stone.error).toMatch(/not in your case/);
    const zero = setShelf(emptyRoom(), 0, { kind: 'stone', code: 'coal' }, owns);
    expect('error' in zero).toBe(true);
    const bird = setShelf(emptyRoom(), 1, { kind: 'bird', code: 'blue_jay' }, owns);
    expect('error' in bird && bird.error).toMatch(/life list/);
    const veg = setShelf(emptyRoom(), 2, { kind: 'veggie', code: 'enormous_pumpkin' }, owns);
    expect('error' in veg && veg.error).toMatch(/not won/);
  });

  it('refuses a code that is owned in the blob but unknown to the catalog', () => {
    const c: Collections = { kept: { unobtainium: 1 }, lifeList: ['dodo'], prizes: ['golden_beet'] };
    expect(ownsShelfItem({ kind: 'stone', code: 'unobtainium' }, c)).toBe(false);
    expect(ownsShelfItem({ kind: 'bird', code: 'dodo' }, c)).toBe(false);
    expect(ownsShelfItem({ kind: 'veggie', code: 'golden_beet' }, c)).toBe(false);
  });

  it('one thing, one spot — even a stone she has two of', () => {
    const one = setShelf(emptyRoom(), 0, { kind: 'stone', code: 'geode' }, owns);
    if (!('room' in one)) throw new Error('expected room');
    const twice = setShelf(one.room, 2, { kind: 'stone', code: 'geode' }, owns);
    expect('error' in twice && twice.error).toMatch(/already on the shelf/);
    // Moving it to the same spot it is already on is fine.
    const same = setShelf(one.room, 0, { kind: 'stone', code: 'geode' }, owns);
    expect('room' in same).toBe(true);
  });

  it('three spots only, and clearing one leaves the others', () => {
    const out = setShelf(emptyRoom(), 3, { kind: 'stone', code: 'garnet' }, owns);
    expect('error' in out && out.error).toMatch(/three spots/);
    const room = { shelf: [{ kind: 'stone', code: 'garnet' }, null, { kind: 'bird', code: 'carolina_wren' }] } as const;
    const cleared = setShelf(room as any, 0, null, owns);
    expect('room' in cleared && cleared.room.shelf).toEqual([null, null, { kind: 'bird', code: 'carolina_wren' }]);
  });

  it('prunes what she no longer owns whenever it writes — displaying never reserves', () => {
    const room = { shelf: [{ kind: 'stone', code: 'garnet' }, { kind: 'stone', code: 'geode' }, null] } as any;
    const sold: Collections = { ...owns, kept: { geode: 2 } };   // garnet sold at the cavern
    expect(pruneShelf(room, sold).shelf).toEqual([null, { kind: 'stone', code: 'geode' }, null]);
    const out = setShelf(room, 2, { kind: 'bird', code: 'carolina_wren' }, sold);
    expect('room' in out && out.room.shelf).toEqual([
      null, { kind: 'stone', code: 'geode' }, { kind: 'bird', code: 'carolina_wren' },
    ]);
  });
});

describe('the gallery wall — six spots, one membership check for every wall', () => {
  it('hangs her own picture on r1..r6 and refuses a picture that is not hers', () => {
    let room = emptyRoom();
    for (const slot of BEDROOM_SLOTS) {
      const out = hangInBedroom(gallery, room, slot, '2026-09-14-1');
      if (!('room' in out)) throw new Error(`refused ${slot}`);
      room = out.room;
    }
    expect(Object.keys(room.hung ?? {})).toEqual([...BEDROOM_SLOTS]);
    const theft = hangInBedroom(gallery, room, 'r2', 'somebody-elses');
    expect('error' in theft && theft.error).toMatch(/not in your gallery/);
    const down = hangInBedroom(gallery, room, 'r2', null);
    expect('room' in down && down.room.hung?.r2).toBeUndefined();
    expect('room' in down && down.room.hung?.r1).toBe('2026-09-14-1');
  });

  it('refuses a slot the wall does not have — r7, or a reading-room slot', () => {
    expect('error' in hangInBedroom(gallery, emptyRoom(), 'r7', '2026-09-14-1')).toBe(true);
    const wrongWall = hangInBedroom(gallery, emptyRoom(), 'left', '2026-09-14-1');
    expect('error' in wrongWall && wrongWall.error).toMatch(/reading room wall/);
  });

  it('a wall/slot mismatch is an error in words, never a silent guess', () => {
    expect(checkWallSlot('reading', 'left')).toBeNull();
    expect(checkWallSlot('bedroom', 'r6')).toBeNull();
    expect(checkWallSlot('reading', 'r3')?.error).toMatch(/bedroom wall/);
    expect(checkWallSlot('bedroom', 'right')?.error).toMatch(/reading room wall/);
    expect(checkWallSlot('bedroom', 'ceiling')?.error).toMatch(/no spot/);
  });

  it('the reading room still hangs on left and right, and nowhere else', () => {
    const out = hangPicture(gallery, {} as HungPictures, 'left', '2026-09-14-2');
    expect('hung' in out && out.hung.left).toBe('2026-09-14-2');
    expect('error' in hangPicture(gallery, {} as HungPictures, 'r1', '2026-09-14-2')).toBe(true);
  });
});

describe('render helpers tolerate dangling refs — an empty slot, never a crash', () => {
  it('a deleted picture on the wall resolves to an empty frame', () => {
    const room = { hung: { r1: '2026-09-14-1', r4: 'deleted-long-ago' } } as any;
    const hung = resolveHung(room, gallery);
    expect(hung.r1?.path).toBe('kid/a.png');
    expect(hung.r4).toBeNull();
    expect(hung.r6).toBeNull();
  });

  it('a sold stone or an unknown code on the shelf resolves to an empty spot', () => {
    const room = {
      shelf: [{ kind: 'stone', code: 'garnet' }, { kind: 'stone', code: 'nope' }, { kind: 'veggie', code: 'proud_tomato' }],
    } as any;
    const shelf = resolveShelf(room);
    expect(shelf[0]?.kind).toBe('stone');
    expect(shelf[1]).toBeNull();
    expect(shelf[2]?.kind === 'veggie' && shelf[2].veggie.name).toBe('the Proud Tomato');
    expect(resolveShelf(emptyRoom())).toEqual([null, null, null]);
  });

  it('an undecorated room is a real case', () => {
    expect(isUndecorated(emptyRoom())).toBe(true);
    expect(isUndecorated({ shelf: [null, null, null], hung: {} })).toBe(true);
    expect(isUndecorated({ quilt: 'sea' })).toBe(false);
    expect(isUndecorated({ hung: { r3: 'x' } })).toBe(false);
  });
});
