// tests/world/xcClient.test.ts
//
// Pins the xeno-canto v3 facts that fail SILENTLY when wrong — the
// same reason inatClient.test.ts pins Female=10/Male=11. A length
// parsed as a number, an unquoted "flight call", or a missed ND
// licence all return plausible-looking results.

import { describe, it, expect } from 'vitest';
import {
  buildXcQuery, buildXcUrl, parseLengthSec, parseXcResponse,
  isNdLicense, isNcLicense, rankRecordings, xcSourceId, XC_TYPE,
} from '../../scripts/naturalist/xcClient';

describe('query building', () => {
  it('uses the v3 endpoint — api/2 is dead and every blog post uses it', () => {
    expect(buildXcUrl('gen:cardinalis', 'k')).toContain('xeno-canto.org/api/3/recordings');
  });

  it('quotes multi-word tag values — v3 silently errors on bare spaces', () => {
    const q = buildXcQuery('gen:spinus sp:tristis', 'flight_call');
    expect(q).toContain('type:"flight call"');
    // Single words stay bare.
    expect(buildXcQuery('gen:x sp:y', 'song')).toContain('type:song');
  });

  it('filters to above-C quality and share-alike US recordings', () => {
    const q = buildXcQuery('gen:x sp:y', 'call');
    expect(q).toContain('q:">C"');
    expect(q).toContain('lic:BY-NC-SA');
    expect(q).toContain('cnt:"United States"');
  });

  it('maps every catalog voice kind to a real XC type tag', () => {
    expect(XC_TYPE.song).toBe('song');
    expect(XC_TYPE.call).toBe('call');
    expect(XC_TYPE.drum).toBe('drumming');
    expect(XC_TYPE.flight_call).toBe('flight call');
  });
});

describe('parseLengthSec', () => {
  it('parses m:ss — the API field is a STRING, not seconds', () => {
    expect(parseLengthSec('0:29')).toBe(29);
    expect(parseLengthSec('1:05')).toBe(65);
    expect(parseLengthSec('12:00')).toBe(720);
  });

  it('handles h:mm:ss and junk without exploding', () => {
    expect(parseLengthSec('1:00:00')).toBe(3600);
    expect(parseLengthSec('not a length')).toBe(0);
    expect(parseLengthSec('')).toBe(0);
  });
});

describe('licences', () => {
  it('detects ND — those recordings cannot be used at all', () => {
    expect(isNdLicense('//creativecommons.org/licenses/by-nc-nd/4.0/')).toBe(true);
    expect(isNdLicense('//creativecommons.org/licenses/by-nc-sa/4.0/')).toBe(false);
  });

  it('detects NC across licence versions', () => {
    expect(isNcLicense('//creativecommons.org/licenses/by-nc-sa/3.0/')).toBe(true);
    expect(isNcLicense('//creativecommons.org/licenses/by-sa/4.0/')).toBe(false);
  });
});

describe('parseXcResponse', () => {
  const rec = (over: Record<string, unknown> = {}) => ({
    id: '1154497', gen: 'Cardinalis', sp: 'cardinalis', en: 'Northern Cardinal',
    rec: 'A Recordist', cnt: 'United States', loc: 'Louisville, KY',
    q: 'A', type: 'song', length: '0:29',
    lic: '//creativecommons.org/licenses/by-nc-sa/4.0/',
    file: 'https://xeno-canto.org/1154497/download',
    'file-name': 'XC1154497-cardinal.mp3',
    also: [], date: '2024-05-01', url: '//xeno-canto.org/1154497',
    ...over,
  });

  it('keeps the licence URL VERBATIM — 4.0, 3.0 and 2.5 credit differently', () => {
    const page = parseXcResponse({ numRecordings: 1, numPages: 1, recordings: [rec({ lic: '//creativecommons.org/licenses/by-nc-sa/3.0/' })] });
    expect(page.recordings[0].licenseUrl).toBe('//creativecommons.org/licenses/by-nc-sa/3.0/');
  });

  it('drops ND recordings even if the query filter let one through', () => {
    const page = parseXcResponse({ numRecordings: 2, numPages: 1, recordings: [
      rec(), rec({ id: '2', lic: '//creativecommons.org/licenses/by-nc-nd/4.0/' }),
    ]});
    expect(page.recordings).toHaveLength(1);
  });

  it('survives a null body or an error object', () => {
    expect(parseXcResponse(null).recordings).toEqual([]);
    expect(parseXcResponse({ error: 'nope' }).recordings).toEqual([]);
  });

  it('parses length into seconds and background species into a list', () => {
    const page = parseXcResponse({ numRecordings: 1, numPages: 1, recordings: [
      rec({ length: '2:03', also: ['Turdus migratorius'] }),
    ]});
    expect(page.recordings[0].lengthSec).toBe(123);
    expect(page.recordings[0].also).toEqual(['Turdus migratorius']);
  });
});

describe('rankRecordings', () => {
  it('prefers quality, then a clean foreground, then a cuttable length', () => {
    const base = {
      id: '1', genus: '', species: '', englishName: '', recordist: '',
      country: '', locality: '', type: 'song', fileName: '', date: '',
      url: '', fileUrl: 'x',
      licenseUrl: '//creativecommons.org/licenses/by-nc-sa/4.0/',
    };
    const ranked = rankRecordings([
      { ...base, id: 'b_quality', quality: 'B', lengthSec: 30, also: [] },
      { ...base, id: 'a_busy', quality: 'A', lengthSec: 30, also: ['someone else'] },
      { ...base, id: 'a_clean', quality: 'A', lengthSec: 30, also: [] },
      { ...base, id: 'a_marathon', quality: 'A', lengthSec: 300, also: [] },
    ]);
    expect(ranked.map(r => r.id)).toEqual(['a_clean', 'a_marathon', 'a_busy', 'b_quality']);
  });
});

describe('xcSourceId', () => {
  it('formats the canonical citation id', () => {
    expect(xcSourceId('1154497')).toBe('XC1154497');
  });
});
