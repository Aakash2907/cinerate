import { MovieItem } from './api.ts';
import { extractYouTubeId, VERIFIED_TRAILERS } from './trailers.ts';

/**
 * Resolves the verified video ID associated with this movie.
 * Returns null if no verified official trailer exists for this specific movie.
 */
export function getMovieVideoId(movie?: Partial<MovieItem> | null): string | null {
  if (!movie || !movie.title) return null;
  const cleanTitle = (movie.title || '').toLowerCase().replace(/[^\w\s:]/gi, '').trim();

  // 1. Check verified list
  if (VERIFIED_TRAILERS[cleanTitle]) {
    return VERIFIED_TRAILERS[cleanTitle];
  }

  // 2. If title is literally Interstellar
  if (cleanTitle === 'interstellar') {
    return 'zSWdZVtXT7E';
  }

  return null;
}

/**
 * Returns a high-definition movie clip frame directly from the movie trailer clip.
 * If trailer of the movie is NOT available, returns empty string ("") so the poster is left empty.
 */
export function getMoviePosterUrl(movie?: Partial<MovieItem> | null): string {
  if (!movie || !movie.title) {
    return '';
  }

  // Check if verified trailer exists for THIS movie
  const videoId = getMovieVideoId(movie);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  // Trailer not available -> leave poster empty
  return '';
}

/**
 * Returns the widescreen movie clip backdrop directly from the movie trailer clip.
 * If trailer of the movie is NOT available, returns empty string ("").
 */
export function getMovieBackdropUrl(movie?: Partial<MovieItem> | null): string {
  if (!movie || !movie.title) {
    return '';
  }

  // Check if verified trailer exists for THIS movie
  const videoId = getMovieVideoId(movie);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  // Trailer not available -> leave backdrop empty
  return '';
}
