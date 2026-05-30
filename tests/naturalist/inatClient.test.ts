import { describe, it, expect } from 'vitest';
import {
  buildInatObservationsUrl,
  parseInatResponse,
  largeUrlFor,
  type InatPhoto,
} from '@/scripts/naturalist/inatClient';

describe('inatClient.buildInatObservationsUrl', () => {
  it('builds a URL with taxon_id + research-grade + CC licenses', () => {
    const url = buildInatObservationsUrl({ taxonId: 47561, perPage: 50 });
    expect(url).toContain('https://api.inaturalist.org/v1/observations');
    expect(url).toContain('taxon_id=47561');
    expect(url).toContain('quality_grade=research');
    expect(url).toContain('photos=true');
    expect(url).toContain('per_page=50');
    expect(url).toContain('order_by=votes');
    expect(url).toContain('license=cc0%2Ccc-by%2Ccc-by-sa');
  });

  it('caps perPage at 200 (iNat API limit)', () => {
    const url = buildInatObservationsUrl({ taxonId: 1, perPage: 9999 });
    expect(url).toContain('per_page=200');
  });

  it('defaults perPage to 100', () => {
    const url = buildInatObservationsUrl({ taxonId: 1 });
    expect(url).toContain('per_page=100');
  });
});

describe('inatClient.largeUrlFor', () => {
  it('converts a square.jpg URL into a large.jpg URL', () => {
    const small = 'https://static.inaturalist.org/photos/123/square.jpg?12345';
    expect(largeUrlFor(small)).toBe(
      'https://static.inaturalist.org/photos/123/large.jpg?12345'
    );
  });

  it('preserves non-square URLs unchanged', () => {
    const original = 'https://static.inaturalist.org/photos/123/original.jpeg';
    expect(largeUrlFor(original)).toBe(
      'https://static.inaturalist.org/photos/123/large.jpeg'
    );
  });
});

describe('inatClient.parseInatResponse', () => {
  it('extracts photo metadata from a typical observations response', () => {
    const raw = {
      total_results: 1,
      results: [{
        id: 99,
        uri: 'https://www.inaturalist.org/observations/99',
        taxon: { id: 47561, name: 'Pinus strobus' },
        photos: [
          {
            id: 500,
            license_code: 'cc-by',
            attribution: '(c) Pat Patterson, some rights reserved (CC BY)',
            url: 'https://static.inaturalist.org/photos/500/square.jpg',
            original_dimensions: { width: 2000, height: 1500 },
          },
          {
            id: 501,
            license_code: 'cc-by-nc',  // not in allowed list
            attribution: '(c) X, CC BY-NC',
            url: 'https://static.inaturalist.org/photos/501/square.jpg',
          },
        ],
      }],
    };

    const photos: InatPhoto[] = parseInatResponse(raw);

    expect(photos).toHaveLength(1);
    expect(photos[0].id).toBe(500);
    expect(photos[0].licenseCode).toBe('cc-by');
    expect(photos[0].photographer).toBe('Pat Patterson');
    expect(photos[0].largeUrl).toContain('/photos/500/large.jpg');
    expect(photos[0].observationUrl).toBe(
      'https://www.inaturalist.org/observations/99'
    );
  });

  it('returns an empty array when there are no results', () => {
    expect(parseInatResponse({ total_results: 0, results: [] })).toEqual([]);
  });
});
