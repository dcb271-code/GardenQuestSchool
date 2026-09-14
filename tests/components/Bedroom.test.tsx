import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import Bedroom, { Quilt } from '@/app/(child)/garden/house/Bedroom';
import UpstairsLanding from '@/app/(child)/garden/house/UpstairsLanding';

const EMPTY = { r1: null, r2: null, r3: null, r4: null, r5: null, r6: null };
const HUNG = { ...EMPTY, r2: { url: 'data:,x', frame: 'gold' } };

describe('the star quilt tells the truth', () => {
  it('shows seven rows of seven — forty-nine stars a child can count', () => {
    const { container } = render(
      <svg><Quilt code="star" x={0} y={0} w={140} h={140} /></svg>,
    );
    expect(container.querySelectorAll('[data-star]')).toHaveLength(49);
  });
});

describe('her own room can be changed', () => {
  it('every wall slot, every shelf spot and the bed are buttons', () => {
    const onWall = vi.fn(), onShelf = vi.fn(), onQuilt = vi.fn();
    const { getAllByRole, getByLabelText } = render(
      <Bedroom name="Cecily" mine quilt="star" hung={HUNG} shelf={[null, null, null]}
               reducedMotion onBack={() => {}} onWall={onWall} onShelf={onShelf} onQuilt={onQuilt} />,
    );
    // six frames + three spots + the bed + back
    expect(getAllByRole('button')).toHaveLength(11);
    fireEvent.click(getByLabelText('Change this picture'));
    expect(onWall).toHaveBeenCalledWith('r2');
    fireEvent.click(getByLabelText('Choose a quilt'));
    expect(onQuilt).toHaveBeenCalled();
    fireEvent.click(getAllByRole('button', { name: 'Put something on the shelf' })[2]);
    expect(onShelf).toHaveBeenCalledWith(2);
  });
});

describe('visiting a sibling is looking, not redecorating', () => {
  it('renders no button but the way back — nothing a tap could send', () => {
    const onWall = vi.fn(), onShelf = vi.fn(), onQuilt = vi.fn();
    const { getAllByRole, container } = render(
      <Bedroom name="Esme" mine={false} quilt="sea" hung={HUNG} shelf={[null, null, null]}
               reducedMotion onBack={() => {}} onWall={onWall} onShelf={onShelf} onQuilt={onQuilt} />,
    );
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAttribute('aria-label', 'Back to the landing');
    // Tap everything anyway: the picture, the frames, the bed, the shelf.
    for (const el of Array.from(container.querySelectorAll('g, rect, image, path, circle'))) {
      fireEvent.click(el);
    }
    expect(onWall).not.toHaveBeenCalled();
    expect(onShelf).not.toHaveBeenCalled();
    expect(onQuilt).not.toHaveBeenCalled();
  });

  it('says so, warmly, when the room is undecorated — and not when it is not', () => {
    const bare = render(
      <Bedroom name="Otto" mine={false} quilt="patch" hung={EMPTY} shelf={[null, null, null]}
               reducedMotion onBack={() => {}} />,
    );
    expect(bare.container.textContent).toContain('Otto has not decorated yet.');
    bare.unmount();
    const done = render(
      <Bedroom name="Esme" mine={false} quilt="patch" hung={HUNG} shelf={[null, null, null]}
               reducedMotion onBack={() => {}} />,
    );
    expect(done.container.textContent).toContain("Esme's room");
    expect(done.container.textContent).not.toContain('has not decorated');
  });
});

describe('the landing', () => {
  it('has one door per child handed to it, the signed-in child\'s own', () => {
    const onDoor = vi.fn();
    const { getByLabelText, getAllByRole } = render(
      <UpstairsLanding doors={[{ id: 'c', name: 'Cecily' }, { id: 'e', name: 'Esme' }, { id: 'o', name: 'Otto' }]}
                       learnerId="e" reducedMotion onDoor={onDoor} onDown={() => {}} />,
    );
    // three doors + the stairs down
    expect(getAllByRole('button')).toHaveLength(4);
    fireEvent.click(getByLabelText('Go into your room'));
    expect(onDoor).toHaveBeenCalledWith('e');
    fireEvent.click(getByLabelText("Visit Otto's room"));
    expect(onDoor).toHaveBeenCalledWith('o');
  });
});
