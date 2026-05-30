import { describe, it, expect } from 'vitest';
import {
  buildWikimediaCategoryUrl,
  parseWikimediaResponse,
  type WikimediaPhoto,
} from '@/scripts/naturalist/wikimediaClient';

describe('wikimediaClient.buildWikimediaCategoryUrl', () => {
  it('builds a URL targeting the species category with imageinfo', () => {
    const url = buildWikimediaCategoryUrl('Pinus_strobus');
    expect(url).toContain('https://commons.wikimedia.org/w/api.php');
    expect(url).toContain('action=query');
    expect(url).toContain('generator=categorymembers');
    expect(url).toContain('gcmtitle=Category%3APinus_strobus');
    expect(url).toContain('gcmtype=file');
    expect(url).toContain('prop=imageinfo');
    expect(url).toContain('iiprop=url%7Cextmetadata');
    expect(url).toContain('format=json');
    expect(url).toContain('formatversion=2');
  });
});

describe('wikimediaClient.parseWikimediaResponse', () => {
  it('extracts CC-licensed photos and strips HTML from Artist', () => {
    const raw = {
      query: {
        pages: [
          {
            pageid: 123,
            title: 'File:Pinus strobus needles.jpg',
            imageinfo: [{
              url: 'https://upload.wikimedia.org/wikipedia/commons/a/b/Pinus_strobus_needles.jpg',
              descriptionurl: 'https://commons.wikimedia.org/wiki/File:Pinus_strobus_needles.jpg',
              extmetadata: {
                LicenseShortName: { value: 'CC BY-SA 4.0' },
                Artist: { value: '<a href="//commons.wikimedia.org/wiki/User:Jane">Jane Doe</a>' },
              },
            }],
          },
          {
            pageid: 456,
            title: 'File:Pinus strobus protected.jpg',
            imageinfo: [{
              url: 'https://upload.wikimedia.org/wikipedia/commons/.../x.jpg',
              descriptionurl: 'https://commons.wikimedia.org/wiki/File:Pinus_strobus_protected.jpg',
              extmetadata: {
                LicenseShortName: { value: 'All rights reserved' },
                Artist: { value: 'Someone' },
              },
            }],
          },
        ],
      },
    };

    const photos: WikimediaPhoto[] = parseWikimediaResponse(raw);

    expect(photos).toHaveLength(1);
    expect(photos[0].pageId).toBe(123);
    expect(photos[0].title).toBe('File:Pinus strobus needles.jpg');
    expect(photos[0].photographer).toBe('Jane Doe');
    expect(photos[0].licenseCode).toBe('cc-by-sa');
    expect(photos[0].directUrl).toContain('Pinus_strobus_needles.jpg');
    expect(photos[0].sourceUrl).toBe(
      'https://commons.wikimedia.org/wiki/File:Pinus_strobus_needles.jpg'
    );
  });

  it('returns empty array when query.pages is missing', () => {
    expect(parseWikimediaResponse({})).toEqual([]);
    expect(parseWikimediaResponse({ query: {} })).toEqual([]);
  });

  it('handles old formatversion=1 page structure (object map)', () => {
    const raw = {
      query: {
        pages: {
          '123': {
            pageid: 123,
            title: 'File:Foo.jpg',
            imageinfo: [{
              url: 'https://upload.wikimedia.org/x/Foo.jpg',
              descriptionurl: 'https://commons.wikimedia.org/wiki/File:Foo.jpg',
              extmetadata: {
                LicenseShortName: { value: 'CC0' },
                Artist: { value: 'Anon' },
              },
            }],
          },
        },
      },
    };
    const photos = parseWikimediaResponse(raw);
    expect(photos).toHaveLength(1);
    expect(photos[0].licenseCode).toBe('cc0');
  });
});
