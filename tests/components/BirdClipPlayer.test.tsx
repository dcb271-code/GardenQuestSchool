// tests/components/BirdClipPlayer.test.tsx
//
// The wrong bird played.
//
// Reported from the device: "the mourning dove coo is played several
// times in a row despite at times asking re the Robin, or chickadee."
// The exercise generator was innocent — 2,040 generated clip exercises
// across every unit and 60 seeds have zero prompt/clip mismatches. The
// bug was one layer down, in the DOM:
//
//   A <source> child is only read during the media element's resource
//   selection algorithm, which runs ONCE. React reuses the same
//   <audio> node between questions and swaps the <source src>, which
//   an already-loaded element ignores. So the first clip a unit loaded
//   kept playing for every question after it.
//
// Nothing else could have caught this. The generator tests pass, the
// audio index is correct, the URLs are correct, and a rendered still
// has no sound in it at all. So the guard has to be here: when the
// clip changes, load() must be called.

import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { ClipPlayer } from '@/app/(child)/birds/BirdScene';
import type { ResolvedClip } from '@/lib/birds/audioResolve';

const clip = (name: string): ResolvedClip => ({
  url: `https://example.test/${name}.opus`,
  fallbackUrl: `https://example.test/${name}.m4a`,
  spectrogramUrl: `https://example.test/${name}.png`,
  attribution: {
    recordist: 'A Recordist', sourceId: 'XC1',
    sourceUrl: 'https://example.test/xc1', licenseUrl: 'https://example.test/by-nc-sa',
  },
});

let loadSpy: ReturnType<typeof vi.spyOn>;

beforeAll(() => {
  // jsdom does not implement media playback; both are no-ops we can watch.
  loadSpy = vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'play')
    .mockImplementation(() => Promise.resolve());
});

afterEach(() => { cleanup(); loadSpy.mockClear(); });

describe('ClipPlayer', () => {
  it('reloads the audio element when the clip changes', () => {
    // THE REGRESSION TEST. Same component, same position — exactly what
    // React does between one question and the next.
    const { rerender } = render(<ClipPlayer clip={clip('mourning_dove')} />);
    loadSpy.mockClear();

    rerender(<ClipPlayer clip={clip('american_robin')} />);

    expect(
      loadSpy,
      'the <audio> element was not reloaded, so it will keep playing the previous bird',
    ).toHaveBeenCalled();
  });

  it('actually points at the new clip after the change', () => {
    const { container, rerender } = render(<ClipPlayer clip={clip('mourning_dove')} />);
    rerender(<ClipPlayer clip={clip('carolina_chickadee')} />);
    const sources = Array.from(container.querySelectorAll('source')).map(s => s.getAttribute('src'));
    expect(sources[0]).toContain('carolina_chickadee');
    expect(sources.some(s => s?.includes('mourning_dove'))).toBe(false);
  });

  it('offers the m4a fallback as well as the opus', () => {
    // Older Safari cannot play opus. Using <source> children rather
    // than a plain src is the whole reason load() is needed above, so
    // if this ever collapses to one source, revisit that comment.
    const { container } = render(<ClipPlayer clip={clip('blue_jay')} />);
    const types = Array.from(container.querySelectorAll('source')).map(s => s.getAttribute('type'));
    expect(types).toContain('audio/ogg; codecs=opus');
    expect(types).toContain('audio/mp4');
  });

  it('does not reload when re-rendered with the same clip', () => {
    // A reload mid-listen would cut the bird off. Only a genuinely
    // different clip should reset the element.
    const same = clip('northern_cardinal');
    const { rerender } = render(<ClipPlayer clip={same} />);
    loadSpy.mockClear();
    rerender(<ClipPlayer clip={{ ...same }} />);
    expect(loadSpy).not.toHaveBeenCalled();
  });

  it('shows the spectrogram and credits the recordist', () => {
    // The visual fallback: answerable-ish with sound off, and the CC
    // attribution rides along with the clip.
    const { container, getByTitle } = render(<ClipPlayer clip={clip('carolina_wren')} />);
    expect(container.querySelector('img')?.getAttribute('src')).toContain('.png');
    expect(getByTitle(/A Recordist/)).toBeTruthy();
  });

  it('never crops the spectrogram — its vertical axis is frequency', () => {
    // Reported from the device: "the sound visual image is cut off
    // showing only the top portion, so often pretty useless." It was
    // pinned to 84px with object-fit: cover against a 640x256 image,
    // discarding ~46% of it. On a photo a crop loses scenery; on a
    // spectrogram it loses NOTES, which is the entire content.
    const { container } = render(<ClipPlayer clip={clip('carolina_wren')} />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.style.objectFit, 'cover crops the sound picture').not.toBe('cover');
    expect(img.style.objectFit).toBe('contain');
    // And no fixed height fighting the aspect ratio.
    expect(img.style.height).toBe('');
    expect(img.style.aspectRatio).toBeTruthy();
  });
});
