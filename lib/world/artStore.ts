// lib/world/artStore.ts
//
// The art store — gallery state and validation. Spec:
// docs/superpowers/specs/2026-08-26-art-store-spec.md.
//
// THE RULE THAT MATTERS: the making is free, forever. Nothing in
// this file (or anywhere) charges for drawing, and nothing pays for
// it either — the picture is the reward.

export const ART_BUCKET = 'artwork';

/** Longest a picture title may be. Her words, untouched. */
export const MAX_TITLE_LENGTH = 40;

/** ~300KB of PNG is a generous finger painting; 1.5MB is a bug. */
export const MAX_PNG_BYTES = 1_500_000;

export interface ArtPiece {
  id: string;
  /** Storage path inside the artwork bucket. */
  path: string;
  title?: string;
  createdAt: string;
  /** Frame code, once the shelves open (phase 2). */
  frame?: string;
}

export type ArtGallery = ArtPiece[];

/** Ids are date-sequenced per child, like letters. */
export function artId(createdAtIso: string, gallery: ArtGallery): string {
  const day = createdAtIso.slice(0, 10);
  const nth = gallery.filter(p => p.id.startsWith(day)).length + 1;
  return `${day}-${nth}`;
}

export function validateTitle(raw: string | undefined): { title?: string } | { error: string } {
  if (raw === undefined) return {};
  const title = raw.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  if (title.length === 0) return {};
  if (title.length > MAX_TITLE_LENGTH) {
    return { error: 'That title is longer than the picture. Forty letters at most.' };
  }
  return { title };
}

/**
 * Check a data URL is really a PNG of sane size. Returns the raw
 * bytes for upload, or a refusal in words.
 */
export function decodePngDataUrl(dataUrl: string): { bytes: Buffer } | { error: string } {
  const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) return { error: 'That did not look like a picture. Nothing was saved.' };
  const bytes = Buffer.from(m[1], 'base64');
  if (bytes.length < 60) return { error: 'That picture is empty. Draw something first!' };
  if (bytes.length > MAX_PNG_BYTES) {
    return { error: 'That picture is too big to carry. Try saving it again.' };
  }
  // PNG magic number — eight bytes that say "I am really a PNG".
  const magic = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!magic.every((b, i) => bytes[i] === b)) {
    return { error: 'That did not look like a picture. Nothing was saved.' };
  }
  return { bytes };
}

export function addPiece(
  gallery: ArtGallery, path: string, createdAtIso: string, title?: string,
): { gallery: ArtGallery; piece: ArtPiece } {
  const piece: ArtPiece = {
    id: artId(createdAtIso, gallery),
    path,
    createdAt: createdAtIso,
    ...(title ? { title } : {}),
  };
  // Newest first, like letters.
  return { gallery: [piece, ...gallery], piece };
}

export function removePiece(
  gallery: ArtGallery, id: string,
): { gallery: ArtGallery; removed: ArtPiece | null } {
  const removed = gallery.find(p => p.id === id) ?? null;
  return { gallery: gallery.filter(p => p.id !== id), removed };
}
