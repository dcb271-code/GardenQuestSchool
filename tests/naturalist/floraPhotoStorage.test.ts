import { describe, it, expect } from 'vitest';
import {
  publicUrlFor,
  BUCKET_NAME,
} from '@/lib/naturalist/floraPhotoStorage';

const BASE = 'https://xyz.supabase.co';

describe('floraPhotoStorage.publicUrlFor', () => {
  it('builds the canonical public-read URL', () => {
    const u = publicUrlFor(BASE, 'tulip_poplar/leaf_1_inat_inat_104857.jpg');
    expect(u).toBe(
      'https://xyz.supabase.co/storage/v1/object/public/flora-photos/tulip_poplar/leaf_1_inat_inat_104857.jpg',
    );
  });

  it('handles a trailing slash on the base URL', () => {
    const u = publicUrlFor(BASE + '/', 'foo/bar.jpg');
    expect(u).toBe('https://xyz.supabase.co/storage/v1/object/public/flora-photos/foo/bar.jpg');
  });

  it('appends a width query when sizePx given', () => {
    const u = publicUrlFor(BASE, 'foo/bar.jpg', { widthPx: 720 });
    expect(u).toBe(
      'https://xyz.supabase.co/storage/v1/object/public/flora-photos/foo/bar.jpg?width=720',
    );
  });

  it('throws on an empty storagePath', () => {
    expect(() => publicUrlFor(BASE, '')).toThrow(/storagePath/);
  });

  it('exports the bucket name as a constant', () => {
    expect(BUCKET_NAME).toBe('flora-photos');
  });
});
