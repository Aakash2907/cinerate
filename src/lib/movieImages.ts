import { MovieItem } from './api.ts';
import { extractYouTubeId, VERIFIED_TRAILERS } from './trailers.ts';

// Known authentic cinematic movie clip frames for titles
export const CURATED_MOVIE_CLIP_FRAMES: Record<string, { poster: string; backdrop: string }> = {
  'fight club': {
    poster: 'https://img.youtube.com/vi/qtRKdVHc-cE/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/qtRKdVHc-cE/maxresdefault.jpg',
  },
  'oppenheimer': {
    poster: 'https://img.youtube.com/vi/uYPbbksJxIg/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/uYPbbksJxIg/maxresdefault.jpg',
  },
  '2001: a space odyssey': {
    poster: 'https://img.youtube.com/vi/oR_e9y-bka0/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/oR_e9y-bka0/maxresdefault.jpg',
  },
  'the dark knight': {
    poster: 'https://img.youtube.com/vi/EXeTwQWrcwY/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/EXeTwQWrcwY/maxresdefault.jpg',
  },
  'inception': {
    poster: 'https://img.youtube.com/vi/YoHD9XEInc0/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/YoHD9XEInc0/maxresdefault.jpg',
  },
  'interstellar': {
    poster: 'https://img.youtube.com/vi/zSWdZVtXT7E/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/zSWdZVtXT7E/maxresdefault.jpg',
  },
  'the shawshank redemption': {
    poster: 'https://img.youtube.com/vi/PLl99DlL6b4/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/PLl99DlL6b4/maxresdefault.jpg',
  },
  'pulp fiction': {
    poster: 'https://img.youtube.com/vi/s7EdQ4FqbhY/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/s7EdQ4FqbhY/maxresdefault.jpg',
  },
  'the godfather': {
    poster: 'https://img.youtube.com/vi/sY1S349g3g8/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/sY1S349g3g8/maxresdefault.jpg',
  },
  'the matrix': {
    poster: 'https://img.youtube.com/vi/vKQi3bBA1y8/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/vKQi3bBA1y8/maxresdefault.jpg',
  },
  'forrest gump': {
    poster: 'https://img.youtube.com/vi/bLvqoHBptjg/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/bLvqoHBptjg/maxresdefault.jpg',
  },
  'gladiator': {
    poster: 'https://img.youtube.com/vi/owK1qxDselE/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/owK1qxDselE/maxresdefault.jpg',
  },
  'dune: part two': {
    poster: 'https://img.youtube.com/vi/Way9Dexny3w/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/Way9Dexny3w/maxresdefault.jpg',
  },
  'dune': {
    poster: 'https://img.youtube.com/vi/n9xhJrPXop4/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/n9xhJrPXop4/maxresdefault.jpg',
  },
  'parasite': {
    poster: 'https://img.youtube.com/vi/5xH0Hf13u5g/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/5xH0Hf13u5g/maxresdefault.jpg',
  },
  'vikram': {
    poster: 'https://img.youtube.com/vi/OKBMCL-frPU/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/OKBMCL-frPU/maxresdefault.jpg',
  },
  'leo': {
    poster: 'https://img.youtube.com/vi/Po3jStA673E/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/Po3jStA673E/maxresdefault.jpg',
  },
  'jailer': {
    poster: 'https://img.youtube.com/vi/xenOE1Tma0A/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/xenOE1Tma0A/maxresdefault.jpg',
  },
  'ponniyin selvan: part 1': {
    poster: 'https://img.youtube.com/vi/D4qAQYLGZVM/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/D4qAQYLGZVM/maxresdefault.jpg',
  },
  'ponniyin selvan: part 2': {
    poster: 'https://img.youtube.com/vi/B7kWkO0Z7c4/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/B7kWkO0Z7c4/maxresdefault.jpg',
  },
  'baashha': {
    poster: 'https://img.youtube.com/vi/M8w3HkU4a8w/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/M8w3HkU4a8w/maxresdefault.jpg',
  },
  'nayakan': {
    poster: 'https://img.youtube.com/vi/p6M0q5lZk8M/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/p6M0q5lZk8M/maxresdefault.jpg',
  },
  'kaithi': {
    poster: 'https://img.youtube.com/vi/gczTWBeeiio/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/gczTWBeeiio/maxresdefault.jpg',
  },
  'asuran': {
    poster: 'https://img.youtube.com/vi/vOCM_Qid7g8/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/vOCM_Qid7g8/maxresdefault.jpg',
  },
  'vada chennai': {
    poster: 'https://img.youtube.com/vi/6L6n37m5Tsg/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/6L6n37m5Tsg/maxresdefault.jpg',
  },
  'master': {
    poster: 'https://img.youtube.com/vi/1_iU7rJiU1g/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/1_iU7rJiU1g/maxresdefault.jpg',
  },
  'rrr': {
    poster: 'https://img.youtube.com/vi/NgBoMJy386M/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/NgBoMJy386M/maxresdefault.jpg',
  },
  'baahubali: the beginning': {
    poster: 'https://img.youtube.com/vi/sOEg_YNguG4/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/sOEg_YNguG4/maxresdefault.jpg',
  },
  'baahubali 2: the conclusion': {
    poster: 'https://img.youtube.com/vi/G62HrubdD6o/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/G62HrubdD6o/maxresdefault.jpg',
  },
  'kalki 2898 ad': {
    poster: 'https://img.youtube.com/vi/kQDd1AhGIHk/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/kQDd1AhGIHk/maxresdefault.jpg',
  },
  'pushpa: the rise': {
    poster: 'https://img.youtube.com/vi/pKctjlpbqpQ/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/pKctjlpbqpQ/maxresdefault.jpg',
  },
  'pushpa 2: the rule': {
    poster: 'https://img.youtube.com/vi/g3JUbgFBZqE/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/g3JUbgFBZqE/maxresdefault.jpg',
  },
  'k.g.f: chapter 1': {
    poster: 'https://img.youtube.com/vi/-KfsY-qw908/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/-KfsY-qw908/maxresdefault.jpg',
  },
  'k.g.f: chapter 2': {
    poster: 'https://img.youtube.com/vi/JKa05nyUmuQ/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/JKa05nyUmuQ/maxresdefault.jpg',
  },
  'kantara': {
    poster: 'https://img.youtube.com/vi/8mrVmf239GU/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/8mrVmf239GU/maxresdefault.jpg',
  },
  'salaar: part 1 - ceasefire': {
    poster: 'https://img.youtube.com/vi/4GPvYMKsrtI/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/4GPvYMKsrtI/maxresdefault.jpg',
  },
  'amaran': {
    poster: 'https://img.youtube.com/vi/hylIXfZeB4c/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/hylIXfZeB4c/maxresdefault.jpg',
  },
  'maharaja': {
    poster: 'https://img.youtube.com/vi/7gNfIqVkW0Y/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/7gNfIqVkW0Y/maxresdefault.jpg',
  },
  'goat - the greatest of all time': {
    poster: 'https://img.youtube.com/vi/jxCRlebieWc/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/jxCRlebieWc/maxresdefault.jpg',
  },
  'vettaiyan': {
    poster: 'https://img.youtube.com/vi/r4uFhTqP9eE/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/r4uFhTqP9eE/maxresdefault.jpg',
  },
  'kanguva': {
    poster: 'https://img.youtube.com/vi/ajZXENfomqk/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/ajZXENfomqk/maxresdefault.jpg',
  },
  'thangalaan': {
    poster: 'https://img.youtube.com/vi/tF3L7B0L4tQ/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/tF3L7B0L4tQ/maxresdefault.jpg',
  },
  'raayan': {
    poster: 'https://img.youtube.com/vi/qQZX_4OfH_U/hqdefault.jpg',
    backdrop: 'https://img.youtube.com/vi/qQZX_4OfH_U/maxresdefault.jpg',
  },
};

/**
 * Resolves the verified video ID associated with this movie
 * Returns null if no verified trailer exists for this specific movie.
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

  const cleanTitle = (movie.title || '').toLowerCase().replace(/[^\w\s:]/gi, '').trim();

  // 1. Check curated clip frames
  if (CURATED_MOVIE_CLIP_FRAMES[cleanTitle]?.poster) {
    return CURATED_MOVIE_CLIP_FRAMES[cleanTitle].poster;
  }

  // 2. Check if verified trailer exists for THIS movie
  const videoId = getMovieVideoId(movie);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  // 3. Trailer not available -> leave poster empty
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

  const cleanTitle = (movie.title || '').toLowerCase().replace(/[^\w\s:]/gi, '').trim();

  // 1. Check curated clip frames
  if (CURATED_MOVIE_CLIP_FRAMES[cleanTitle]?.backdrop) {
    return CURATED_MOVIE_CLIP_FRAMES[cleanTitle].backdrop;
  }

  // 2. Check if verified trailer exists for THIS movie
  const videoId = getMovieVideoId(movie);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  // 3. Trailer not available -> leave backdrop empty
  return '';
}
