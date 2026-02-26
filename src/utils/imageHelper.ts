const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type ImageSize =
  | 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original'
  | 'h632' | 'w300';

export function buildImageUrl(
  path: string | null | undefined,
  size: ImageSize = 'w500',
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function buildPosterUrl(path: string | null | undefined): string | null {
  return buildImageUrl(path, 'w342');
}

export function buildBackdropUrl(path: string | null | undefined): string | null {
  return buildImageUrl(path, 'w780');
}

export function buildProfileUrl(path: string | null | undefined): string | null {
  return buildImageUrl(path, 'w185');
}
