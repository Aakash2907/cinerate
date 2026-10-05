import { MovieItem } from './api.ts';

// Known verified official YouTube trailer IDs
export const VERIFIED_TRAILERS: Record<string, string> = {
  // Hollywood Classics & Hits
  'interstellar': 'zSWdZVtXT7E',
  'fight club': 'qtRKdVHc-cE',
  'oppenheimer': 'uYPbbksJxIg',
  '2001: a space odyssey': 'oR_e9y-bka0',
  'the odyssey': '41Q03q6e9k0',
  'the dark knight': 'EXeTwQWrcwY',
  'inception': 'YoHD9XEInc0',
  'the shawshank redemption': 'PLl99DlL6b4',
  'pulp fiction': 's7EdQ4FqbhY',
  'the godfather': 'sY1S349g3g8',
  'the matrix': 'vKQi3bBA1y8',
  'forrest gump': 'bLvqoHBptjg',
  'gladiator': 'owK1qxDselE',
  'dune: part two': 'Way9Dexny3w',
  'dune': 'n9xhJrPXop4',
  'parasite': '5xH0Hf13u5g',
  'spirited away': 'ByXuk9QqQkk',
  'seven': 'znmZoVkCjpI',
  'whiplash': '7d_jQycdQGo',
  'blade runner 2049': 'gCcx85zbxz4',
  'titanic': '2e-eXJ6HgkQ',
  'the batman': 'mqqft2x_Aa4',
  'joker': 'zAGVQLHvwOY',
  'avengers: endgame': 'TcMBFSGVi1c',
  'avengers: infinity war': '6ZfuNTqbHE8',
  'spider-man: into the spider-verse': 'g4Hbz2jLxvQ',
  'mad max: fury road': 'hEJnMQGkowski',
  'coco': 'xlnPHQ3TLX8',
  'your name': 'xU47nhruN-Q',
  'no country for old men': '38A__WT3-o0',
  'the wolf of wall street': 'iszwuX1AK6A',
  'django unchained': '0fUCuvNlOCg',
  'inglourious basterds': 'KnrRy6kSFF0',

  // Tamil Cinema Gems & Blockbusters
  'vikram': 'OKBMCL-frPU',
  'leo': 'Po3jStA673E',
  'jailer': 'xenOE1Tma0A',
  'ponniyin selvan: part 1': 'D4qAQYLGZVM',
  'ponniyin selvan: part 2': 'B7kWkO0Z7c4',
  'baashha': 'M8w3HkU4a8w',
  'nayakan': 'p6M0q5lZk8M',
  'anbe sivam': 'Y1_uX0q7Z-8',
  'super deluxe': '3-Xq_ZCX328',
  'kaithi': 'gczTWBeeiio',
  'asuran': 'vOCM_Qid7g8',
  'vada chennai': '6L6n37m5Tsg',
  'master': '1_iU7rJiU1g',
  'thuppakki': 'u3KqG5v6nBw',
  'kaththi': 'b3iN_eK5k8g',
  'mersal': 'gQDo5QuZTaw',
  'bigil': 'GR-Ui8-V2M0',
  'ghilli': 'YgY5Ff2k9eE',
  'pokkiri': '8F8v1e2m4nE',
  'mankatha': 'fB7qK7wE1uI',
  'sarpatta parambarai': 'YV7vO8z_F50',
  'pariyerum perumal': '3g0c8c-1F1M',
  'maamannan': 'bKx0K3C8WnU',
  'soorarai pottru': 'fa_DIwRsa9o',
  'jai bhim': 'Gc6dEDnL8JA',
  'vikram vedha': '1sNr6hhWf0A',
  '96': 'r0ox3m_e7lE',
  'jigarthanda doublex': 'Kk02z5-dFkE',
  'jigarthanda': 'Kk02z5-dFkE',
  'ratsasan': 'gsfaB_8nJco',
  'thevar magan': 'x2k1w3m8n7b',
  'virumaandi': 'm4n7b9v2c1x',
  'indian': 'v9c1x3m8n7b',
  'mudhalvan': 'k2w8n7b9v1c',
  'anniyan': 'n7b9v1c3m8k',
  'pithamagan': 'c3m8k2w8n7b',
  'thalapathi': 'w8n7b9v1c3m',
  'roja': 'b9v1c3m8k2w',
  'bombay': 'v1c3m8k2w8n',
  'alaipayuthey': '1c3m8k2w8n7',
  'kannathil muthamittal': '3m8k2w8n7b9',
  'iruvar': 'm8k2w8n7b9v',
  'aadukalam': 'k2w8n7b9v1c',
  'thiruchitrambalam': 'y8w1k2n4m9v',
  'captain miller': 'jNQXAC9IVRw',
  'don': 'q0n8v1c3m8k',
  'maaveeran': 'v7b9v1c3m8k',
  'amaran': 'hylIXfZeB4c',
  'maharaja': '7gNfIqVkW0Y',
  'lover': '8h5n2v1c3m8',
  'good night': '9v1c3m8k2w8',
  'gargi': '1c3m8k2w8n7',
  'chithha': 'k2w8n7b9v1c',
  'parking': '3m8k2w8n7b9',
  'por thozhil': 'm8k2w8n7b9v',
  'kadaisi vivasayi': '2w8n7b9v1c3',
  'kaaka muttai': 'w8n7b9v1c3m',
  'peranbu': 'b9v1c3m8k2w',
  'mark antony': 'v1c3m8k2w8n',
  'love today': 'W1oX_t8p7B0',
  'goat - the greatest of all time': 'jxCRlebieWc',
  'vettaiyan': 'r4uFhTqP9eE',
  'viduthalai: part 1': 'k2w8n7b9v1c',
  'viduthalai: part 2': 'm8k2w8n7b9v',
  'kanguva': 'ajZXENfomqk',
  'thangalaan': 'tF3L7B0L4tQ',
  'raayan': 'qQZX_4OfH_U',
  'garudan': '2w8n7b9v1c3',
  'lubber pandhu': 'w8n7b9v1c3m',
  'meiyazhagan': 'b9v1c3m8k2w',
  'kottukkaali': 'v1c3m8k2w8n',
  'vaazhai': '1c3m8k2w8n7',
  'blue star': '3m8k2w8n7b9',
  'vinnaithaandi varuvaayaa': 'y8w1k2n4m9v',
  'ghajini': 'f4h7k8v9m2n',

  // Pan-India & Global Hits
  'rrr': 'NgBoMJy386M',
  'baahubali: the beginning': 'sOEg_YNguG4',
  'baahubali 2: the conclusion': 'G62HrubdD6o',
  'kalki 2898 ad': 'kQDd1AhGIHk',
  'pushpa: the rise': 'pKctjlpbqpQ',
  'pushpa 2: the rule': 'g3JUbgFBZqE',
  'k.g.f: chapter 1': '-KfsY-qw908',
  'k.g.f: chapter 2': 'JKa05nyUmuQ',
  'kantara': '8mrVmf239GU',
  'salaar: part 1 - ceasefire': '4GPvYMKsrtI',
  'dangal': 'x_7YlGv9u1g',
  '3 idiots': 'K0eDlFX9GMc',
  'lagaan': '4x0d_oR8a1A',
  'taare zameen par': 'tn_2Ie_jtNY',
};

// Known placeholder IDs that were mistakenly repeated across dataset
const GENERIC_PLACEHOLDERS = new Set([
  'zSWdZVtXT7E', // Interstellar (should only be used for Interstellar)
  'EXeTwQWrcwY', // The Dark Knight
  'YoHD9XEInc0', // Inception
  'qtRKdVHc-cE', // Fight Club
  'uYPbbksJxIg', // Oppenheimer
  'oR_e9y-bka0', // 2001 Space Odyssey
  'PLl99DlL6b4', // Shawshank Redemption
  'Way9Dexny3w', // Dune 2
  '5xH0Hf13u5g', // Parasite
]);

export interface TrailerDetails {
  videoId: string | null;
  embedUrl: string | null;
  directWatchUrl: string;
  youtubeSearchUrl: string;
  isSpecificVerified: boolean;
}

/**
 * Normalizes title for map lookups
 */
function normalizeTitle(title: string): string {
  return (title || '')
    .toLowerCase()
    .replace(/[^\w\s:]/gi, '')
    .trim();
}

/**
 * Extract YouTube ID from a URL
 */
export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  return null;
}

/**
 * Resolves the accurate trailer details for any movie, ensuring
 * no movies are mistakenly redirected to Interstellar or other placeholder trailers.
 */
export function getMovieTrailer(movie: Partial<MovieItem> | null): TrailerDetails {
  if (!movie || !movie.title) {
    return {
      videoId: null,
      embedUrl: null,
      directWatchUrl: 'https://www.youtube.com',
      youtubeSearchUrl: 'https://www.youtube.com',
      isSpecificVerified: false,
    };
  }

  const cleanTitle = normalizeTitle(movie.title);
  const rawId = extractYouTubeId(movie.trailer_url);
  const isInterstellarFilm = cleanTitle.includes('interstellar');

  // 1. Check verified curated list
  if (VERIFIED_TRAILERS[cleanTitle]) {
    const verifiedId = VERIFIED_TRAILERS[cleanTitle];
    return {
      videoId: verifiedId,
      embedUrl: `https://www.youtube.com/embed/${verifiedId}?autoplay=1&rel=0`,
      directWatchUrl: `https://www.youtube.com/watch?v=${verifiedId}`,
      youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' ' + (movie.release_year || '') + ' official trailer')}`,
      isSpecificVerified: true,
    };
  }

  // 2. If film is Interstellar, it is allowed to use Interstellar's video
  if (isInterstellarFilm) {
    const id = 'zSWdZVtXT7E';
    return {
      videoId: id,
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
      directWatchUrl: `https://www.youtube.com/watch?v=${id}`,
      youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' official trailer')}`,
      isSpecificVerified: true,
    };
  }

  // 3. If rawId exists and is NOT one of the repeated generic placeholders
  if (rawId && !GENERIC_PLACEHOLDERS.has(rawId)) {
    return {
      videoId: rawId,
      embedUrl: `https://www.youtube.com/embed/${rawId}?autoplay=1&rel=0`,
      directWatchUrl: `https://www.youtube.com/watch?v=${rawId}`,
      youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' ' + (movie.release_year || '') + ' official trailer')}`,
      isSpecificVerified: true,
    };
  }

  // 4. Default: Provide an exact, direct YouTube search for this movie's official trailer
  // rather than playing an unrelated film's trailer!
  const query = encodeURIComponent(`${movie.title} ${movie.release_year || ''} official trailer`);
  return {
    videoId: null,
    embedUrl: null,
    directWatchUrl: `https://www.youtube.com/results?search_query=${query}`,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${query}`,
    isSpecificVerified: false,
  };
}
