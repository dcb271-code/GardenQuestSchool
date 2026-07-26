// tests/world/inatClient.test.ts
//
// These exist because of a bug that cost an afternoon and would have
// shipped a lesson teaching the wrong bird.
//
// The sex annotation ids were inverted — Female is 10 and Male is 11,
// and I had them the other way round. Nothing failed. The API happily
// returned real, research-grade, correctly-licensed photographs; they
// were simply all of the opposite sex, so the "female cardinal" folder
// filled up with scarlet males. It surfaced only when a filename
// mismatch made the validator complain, and my first instinct was to
// blame iNaturalist's data rather than my own constant.
//
// A wrong constant that returns plausible results needs a test, because
// nothing else will ever notice.

import { describe, it, expect } from 'vitest';
import {
  buildInatObservationsUrl, parseInatResponse, largeUrlFor, ANNOTATION,
} from '@/scripts/naturalist/inatClient';

describe('iNat annotation ids', () => {
  it('pins Female=10 and Male=11', () => {
    // Verified against https://api.inaturalist.org/v1/controlled_terms
    // on 2026-07-26: term 9 "Sex" → 10 Female, 11 Male, 20 Cannot Be
    // Determined. Do not "tidy" these into alphabetical order.
    expect(ANNOTATION.SEX).toBe(9);
    expect(ANNOTATION.FEMALE).toBe(10);
    expect(ANNOTATION.MALE).toBe(11);
    expect(ANNOTATION.MALE).not.toBe(ANNOTATION.FEMALE);
  });
});

describe('buildInatObservationsUrl', () => {
  it('asks only for licences we may actually use', () => {
    const u = new URL(buildInatObservationsUrl({ taxonId: 9083 }));
    expect(u.searchParams.get('license')).toBe('cc0,cc-by,cc-by-sa');
    expect(u.searchParams.get('quality_grade')).toBe('research');
    expect(u.searchParams.get('photos')).toBe('true');
  });

  it('omits the annotation filter unless both parts are given', () => {
    const plain = new URL(buildInatObservationsUrl({ taxonId: 9083 }));
    expect(plain.searchParams.has('term_id')).toBe(false);

    // A half-specified filter would silently widen the query.
    const half = new URL(buildInatObservationsUrl({ taxonId: 9083, termId: 9 }));
    expect(half.searchParams.has('term_id')).toBe(false);
  });

  it('passes a complete annotation filter through', () => {
    const u = new URL(buildInatObservationsUrl({
      taxonId: 9083, termId: ANNOTATION.SEX, termValueId: ANNOTATION.MALE,
    }));
    expect(u.searchParams.get('term_id')).toBe('9');
    expect(u.searchParams.get('term_value_id')).toBe('11');
  });

  it('caps per_page at the API maximum', () => {
    const u = new URL(buildInatObservationsUrl({ taxonId: 1, perPage: 5000 }));
    expect(Number(u.searchParams.get('per_page'))).toBeLessThanOrEqual(200);
  });
});

describe('largeUrlFor', () => {
  it('upgrades every thumbnail variant to large', () => {
    for (const v of ['square', 'small', 'medium', 'original']) {
      expect(largeUrlFor(`https://x.test/photos/1/${v}.jpg`))
        .toBe('https://x.test/photos/1/large.jpg');
    }
  });

  it('leaves an already-large url alone', () => {
    const u = 'https://x.test/photos/1/large.jpg';
    expect(largeUrlFor(u)).toBe(u);
  });
});

describe('parseInatResponse', () => {
  const obs = (licence: string | null) => ({
    id: 1,
    uri: 'https://inat.test/obs/1',
    photos: [{
      id: 99,
      license_code: licence,
      attribution: '(c) Pat Patterson, some rights reserved (CC BY)',
      url: 'https://x.test/photos/99/square.jpg',
    }],
  });

  it('keeps permitted licences and drops everything else', () => {
    for (const ok of ['cc0', 'cc-by', 'cc-by-sa']) {
      expect(parseInatResponse({ results: [obs(ok)] })).toHaveLength(1);
    }
    // Non-commercial and no-derivatives are not usable here, and an
    // unlicensed photo is all-rights-reserved.
    for (const no of ['cc-by-nc', 'cc-by-nd', 'cc-by-nc-sa', null, '']) {
      expect(parseInatResponse({ results: [obs(no)] }), String(no)).toHaveLength(0);
    }
  });

  it('pulls the photographer out of the attribution string', () => {
    expect(parseInatResponse({ results: [obs('cc-by')] })[0].photographer)
      .toBe('Pat Patterson');
  });

  it('returns the large variant, not the square one', () => {
    expect(parseInatResponse({ results: [obs('cc-by')] })[0].largeUrl)
      .toBe('https://x.test/photos/99/large.jpg');
  });

  it('survives junk without throwing', () => {
    expect(parseInatResponse({})).toEqual([]);
    expect(parseInatResponse({ results: [] })).toEqual([]);
    expect(parseInatResponse({ results: [{ id: 1, uri: 'u' }] })).toEqual([]);
    expect(parseInatResponse(null)).toEqual([]);
  });
});
