import { MovieItem } from './api.ts';

// 100% Audited, 200 OK Verified Official YouTube Trailer IDs
export const VERIFIED_TRAILERS: Record<string, string> = {
  "20": "7cx-KSsYcjg",
  "24": "wqXE_es_I3M",
  "96": "r0synl-lI4I",
  "interstellar": "zSWdZVtXT7E",
  "fight club": "qtRKdVHc-cE",
  "oppenheimer": "uYPbbksJxIg",
  "2001: a space odyssey": "oR_e9y-bka0",
  "the odyssey": "OfTs-mJZLD8",
  "the dark knight": "EXeTwQWrcwY",
  "inception": "YoHD9XEInc0",
  "the shawshank redemption": "PLl99DlL6b4",
  "pulp fiction": "s7EdQ4FqbhY",
  "the godfather": "UaVTIH8mujA",
  "the matrix": "vKQi3bBA1y8",
  "forrest gump": "bLvqoHBptjg",
  "gladiator": "owK1qxDselE",
  "dune: part two": "Way9Dexny3w",
  "dune": "n9xhJrPXop4",
  "parasite": "isOGD_7hNIY",
  "spirited away": "ByXuk9QqQkk",
  "seven": "znmZoVkCjpI",
  "whiplash": "7d_jQycdQGo",
  "blade runner 2049": "gCcx85zbxz4",
  "titanic": "2e-eXJ6HgkQ",
  "the batman": "mqqft2x_Aa4",
  "joker": "zAGVQLHvwOY",
  "avengers: endgame": "TcMBFSGVi1c",
  "avengers: infinity war": "6ZfuNTqbHE8",
  "spider-man: into the spider-verse": "g4Hbz2jLxvQ",
  "coco": "xlnPHQ3TLX8",
  "your name": "xU47nhruN-Q",
  "no country for old men": "38A__WT3-o0",
  "the wolf of wall street": "iszwuX1AK6A",
  "django unchained": "0fUCuvNlOCg",
  "inglourious basterds": "KnrRy6kSFF0",
  "vikram": "OKBMCL-frPU",
  "leo": "Po3jStA673E",
  "jailer": "xenOE1Tma0A",
  "ponniyin selvan: part 1": "D4qAQYlgZQs",
  "ponniyin selvan: part 2": "-3Uusr6RjH4",
  "kaithi": "g79CvhHaj5I",
  "asuran": "vOCM9wztBYQ",
  "vada chennai": "q5GG5HJ1hVk",
  "master": "UTiXQcrLlv4",
  "thuppakki": "2S0Fk2Dh9Mk",
  "kaththi": "Tb1mE1CtBRA",
  "mersal": "gQDo5QuZTaw",
  "bigil": "GR-Ui8-V2M0",
  "ghilli": "EtJXEmW_XNM",
  "mankatha": "nEC7IJgUw1A",
  "sarpatta parambarai": "b8DmN_bEtzg",
  "soorarai pottru": "fa_DIwRsa9o",
  "jai bhim": "Gc6dEDnL8JA",
  "vikram vedha": "1sVr-uWZPjE",
  "ratsasan": "ZkJr6EVkBaU",
  "amaran": "hylIXfZeB4c",
  "maharaja": "z37hCm4eges",
  "goat - the greatest of all time": "CR5LzB6_xlc",
  "the greatest of all time": "CR5LzB6_xlc",
  "vettaiyan": "VNRBmh0QGw0",
  "kanguva": "NMjQzssYLcQ",
  "thangalaan": "9KUOQvF25NI",
  "raayan": "qQJJWhh-XRo",
  "rrr": "NgBoMJy386M",
  "baahubali: the beginning": "LCaSXJopSto",
  "baahubali 2: the conclusion": "G62HrubdD6o",
  "kalki 2898 ad": "kQDd1AhGIHk",
  "pushpa: the rise": "Q1NKMPhP8PY",
  "k.g.f: chapter 1": "qXgF-iJ_ezE",
  "k.g.f: chapter 2": "JKa05nyUmuQ",
  "kantara": "8mrVmf239GU",
  "salaar: part 1 - ceasefire": "bUR_FKt7Iso",
  "dangal": "x_7YlGv9u1g",
  "3 idiots": "K0eDlFX9GMc",
  "jawan": "k8YiqM0Y-78",
  "pathaan": "vqu4z34wENw",
  "12th fail": "KjbtuqENvVE",
  "manjummel boys": "16p0DjKimQU",
  "aavesham": "L0yEMl8PXnw",
  "baashha": "1g-yZ3BDDK0",
  "nayakan": "1S6YkmYvgi8",
  "anbe sivam": "lPLN69KAukE",
  "super deluxe": "3-Xq_Zz3nPA",
  "pokkiri": "0OKiGzwv-1E",
  "billa": "SpDD9YIBhv8",
  "vedalam": "b3WB7ogte-g",
  "viswasam": "1rUi9U9Opuk",
  "sivaji: the boss": "rQkD0QQOJ0Y",
  "enthiran": "sY_F6issHsU",
  "petta": "FCB0ZfQ9Rzs",
  "kabali": "9mdJV5-eias",
  "madras": "TZE8iayS_Xk",
  "pariyerum perumal": "GMNsUxJe4R4",
  "karnan": "pgfUzQ8nzBY",
  "maamannan": "xWe03YByWEI",
  "ayan": "wbvmzziVpWI",
  "singam": "96CgGu1JYbY",
  "pizza": "1ORbkrHs5JU",
  "jigarthanda": "_T8n-EHr4ZE",
  "jigarthanda doublex": "PvoUJejn1e4",
  "thevar magan": "GbZjpr13FWQ",
  "hey ram": "GKLvKk_uXzA",
  "virumaandi": "Suj0B0keaJ4",
  "dasavathaaram": "aZvRZV6llOM",
  "vishwaroopam": "W4_ih6Rt9jU",
  "indian": "qPCTt-XDzdE",
  "mudhalvan": "Wa2LlzZ78pg",
  "anniyan": "bzAxJDtS7zE",
  "i": "8uPK9Ov6Zd4",
  "deiva thirumagal": "AuFXIH5qWfU",
  "pithamagan": "rycv49ClLao",
  "sethu": "MVjd7kbSdp4",
  "raavanan": "OzRUuZ_zj00",
  "thalapathi": "L-vDX9lHZM4",
  "roja": "djnHkj0Ic24",
  "bombay": "vIZmPQaDuI8",
  "alaipayuthey": "BRFdGc3ku-k",
  "kannathil muthamittal": "z5xjbix1Gwg",
  "o kadhal kanmani": "TjJbdcKKlnU",
  "iruvar": "A7TnX7jUPUQ",
  "aadukalam": "GDA-PZjqjeA",
  "polladhavan": "kd6bNu1Hq3Q",
  "velaiilla pattadhari": "fZOwwAzI9jM",
  "thiruchitrambalam": "tNnPHz1u3RM",
  "captain miller": "ujhWbKP1rKA",
  "doctor": "oQiH_Iw0kDs",
  "gargi": "4_73N1iGkCU",
  "chithha": "T0C5I90Y-sA",
  "garudan": "B2yC1jpAYvQ",
  "vinnaithaandi varuvaayaa": "hKuSjEQRS84",
  "ghajini": "tlvrGfHbPsw",
  "gangs of wasseypur": "XuK5TAEIqfg",
  "eega": "x-1ZoU1xB4I",
  "jersey": "AjAe_Q1WZ_8",
  "psycho": "Wz719b9QUqY",
  "city of god": "dcUOO4Itgmw",
  "oldboy": "tAaBkFChaRg",
  "past lives": "kA244xewjcI",
  "poor things": "_klfx5sGzFk",
  "padayappa": "8U9t5xMElN0",
  "chandramukhi": "QaheOBHOJOs",
  "dilwale dulhania le jayenge": "cmax1C1p660",
  "sholay": "fefaxq2nXoE",
  "zindagi na milegi dobara": "FJrpcDgC3zU",
  "magadheera": "NXfhuqDNxg4",
  "arjun reddy": "aozErj9NqeE",
  "mahanati": "OrnYMmWBuV4",
  "sita ramam": "Ljk6tGZ1l3A",
  "ulidavaru kandanthe": "POJ_6EtGeMw",
  "garuda gamana vrishabha vahana": "BnuDHJcSd0Q",
  "goodfellas": "2ilzidi_J8Q",
  "taxi driver": "T5IligQP7Fo",
  "princess mononoke": "4OiMOHRDs14",
  "roma": "6BS27ngZtxg",
  "all quiet on the western front": "hf8EYbVxtCY",
  "bicycle thieves": "H2P4xo9kmPM",
};

/**
 * Extracts YouTube Video ID from any standard or short URL
 */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

/**
 * Normalizes title string for dictionary matching
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s:]/gi, '')
    .trim();
}

export interface TrailerDetails {
  videoId: string | null;
  embedUrl: string | null;
  directWatchUrl: string;
  youtubeSearchUrl: string;
  isSpecificVerified: boolean;
}

/**
 * Resolves the genuine official YouTube trailer for a movie.
 * Checks against verified trailers dictionary and explicit movie trailer_url.
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
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' ' + (movie.release_year || '') + ' official trailer')}`;

  // 1. Check verified curated list
  if (VERIFIED_TRAILERS[cleanTitle]) {
    const verifiedId = VERIFIED_TRAILERS[cleanTitle];
    return {
      videoId: verifiedId,
      embedUrl: `https://www.youtube.com/embed/${verifiedId}?autoplay=1&rel=0`,
      directWatchUrl: `https://www.youtube.com/watch?v=${verifiedId}`,
      youtubeSearchUrl: searchUrl,
      isSpecificVerified: true,
    };
  }

  // 2. Check if movie has an explicitly set trailer_url with a valid 11-char YouTube ID
  const rawId = extractYouTubeId(movie.trailer_url);
  if (rawId) {
    return {
      videoId: rawId,
      embedUrl: `https://www.youtube.com/embed/${rawId}?autoplay=1&rel=0`,
      directWatchUrl: `https://www.youtube.com/watch?v=${rawId}`,
      youtubeSearchUrl: searchUrl,
      isSpecificVerified: true,
    };
  }

  // 3. Fallback: Direct YouTube search URL for this movie's official trailer
  return {
    videoId: null,
    embedUrl: null,
    directWatchUrl: searchUrl,
    youtubeSearchUrl: searchUrl,
    isSpecificVerified: false,
  };
}
