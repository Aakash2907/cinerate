import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { MOVIES_DATASET } from '../data/moviesData.ts';
import { COMMUNITY_USERS, generateSeedReviewsAndRatings } from '../data/seedReviews.ts';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at?: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  release_year: number;
  genre: string;
  language: string;
  duration: string;
  director: string;
  cast_members: string;
  poster_url: string;
  backdrop_url: string;
  trailer_url: string;
  featured: boolean;
  created_at: string;
  updated_at?: string;
  // Computed fields
  average_rating?: number;
  rating_count?: number;
  reviews_count?: number;
  in_watchlist?: boolean;
  user_rating?: number;
}

export interface Rating {
  id: number;
  user_id: number;
  movie_id: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  user_id: number;
  movie_id: number;
  review_text: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_name?: string;
  user_email?: string;
  movie_title?: string;
  movie_poster?: string;
  user_rating?: number;
}

export interface WatchlistEntry {
  id: number;
  user_id: number;
  movie_id: number;
  created_at: string;
  movie?: Movie;
}

// Global Postgres pool cache
declare global {
  var _cineRatePgPool: Pool | undefined;
}

let pgPool: Pool | null = null;
let isPostgresAvailable = false;

// In-Memory store as standard or fallback
interface LocalStore {
  users: User[];
  movies: Movie[];
  ratings: Rating[];
  reviews: Review[];
  watchlist: WatchlistEntry[];
  nextIds: {
    users: number;
    movies: number;
    ratings: number;
    reviews: number;
    watchlist: number;
  };
}

export const localStore: LocalStore = {
  users: [],
  movies: [],
  ratings: [],
  reviews: [],
  watchlist: [],
  nextIds: {
    users: 5,
    movies: 13,
    ratings: 21,
    reviews: 7,
    watchlist: 7,
  },
};

// Initial Seed Data
const initialUsers: User[] = [
  {
    id: 1,
    name: 'Elena Rostova (Admin)',
    email: 'admin@cinerate.com',
    password_hash: bcrypt.hashSync('Admin@123', 10),
    role: 'admin',
    created_at: new Date('2024-01-10T10:00:00Z').toISOString(),
  },
  {
    id: 2,
    name: 'Alex Mercer',
    email: 'alex@cinerate.com',
    password_hash: bcrypt.hashSync('User@123', 10),
    role: 'user',
    created_at: new Date('2024-02-15T14:30:00Z').toISOString(),
  },
  {
    id: 3,
    name: 'Sarah Connor',
    email: 'sarah@cinerate.com',
    password_hash: bcrypt.hashSync('User@123', 10),
    role: 'user',
    created_at: new Date('2024-03-01T09:15:00Z').toISOString(),
  },
  {
    id: 4,
    name: 'Marcus Vance',
    email: 'marcus@cinerate.com',
    password_hash: bcrypt.hashSync('User@123', 10),
    role: 'user',
    created_at: new Date('2024-03-20T18:45:00Z').toISOString(),
  },
];

const initialMovies: Movie[] = [
  {
    id: 1,
    title: 'Interstellar Odyssey',
    description: 'A team of pioneering astrophysicists and deep-space explorers travel through a newly discovered cosmic wormhole in search of a viable planetary sanctuary for endangered humanity.',
    release_year: 2024,
    genre: 'Sci-Fi',
    language: 'English',
    duration: '2h 49m',
    director: 'Christopher Sterling',
    cast_members: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine',
    poster_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
    trailer_url: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    featured: true,
    created_at: new Date('2024-01-01').toISOString(),
  },
  {
    id: 2,
    title: 'Neon Horizon: 2088',
    description: 'In a rain-soaked cyberpunk metropolis controlled by synthetic intelligence syndicates, an augmented detective uncovers an existential conspiracy linking corporate titans to human memory erasure.',
    release_year: 2025,
    genre: 'Sci-Fi',
    language: 'English',
    duration: '2h 14m',
    director: 'Denis Villeneuve',
    cast_members: 'Ryan Gosling, Ana de Armas, Harrison Ford, Sylvia Hoeks',
    poster_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1600&auto=format&fit=crop',
    trailer_url: 'https://www.youtube.com/watch?v=gCcx85zbxz4',
    featured: true,
    created_at: new Date('2024-01-15').toISOString(),
  },
  {
    id: 3,
    title: 'The Kyoto Echo',
    description: 'An intimate, poignant drama unfolding in the historic alleyways of Kyoto, exploring three generations of traditional tea masters grappling with contemporary societal changes.',
    release_year: 2024,
    genre: 'Drama',
    language: 'Japanese',
    duration: '1h 56m',
    director: 'Hirokazu Kore-eda',
    cast_members: 'Koji Yakusho, Sakura Ando, Lily Franky, Mayu Matsuoka',
    poster_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1600&auto=format&fit=crop',
    trailer_url: 'https://www.youtube.com/watch?v=1F3hm6MfR1k',
    featured: false,
    created_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: 4,
    title: 'Shadows in the Mist',
    description: 'A veteran alpine search-and-rescue specialist investigates a string of inexplicable disappearances across the treacherous Pyrenees mountain range during a paralyzing blizzard.',
    release_year: 2023,
    genre: 'Thriller',
    language: 'French',
    duration: '2h 08m',
    director: 'Justine Triet',
    cast_members: 'Sandra Hüller, Swann Arlaud, Milo Machado-Graner, Antoine Reinartz',
    poster_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=1600&auto=format&fit=crop',
    trailer_url: 'https://www.youtube.com/watch?v=fTr7h7kQpB8',
    featured: false,
    created_at: new Date('2024-02-10').toISOString(),
  },
  {
    id: 5,
    title: 'Chronicles of Eldoria',
    description: 'When ancient elemental seals shatter beneath the forgotten ruins of Eldoria, an exiled cartographer must unite fractured rival kingdoms before eternal darkness descends.',
    release_year: 2025,
    genre: 'Fantasy',
    language: 'English',
    duration: '2h 38m',
    director: 'Guillermo del Toro',
    cast_members: 'Dev Patel, Florence Pugh, Mads Mikkelsen, Cate Blanchett',
    poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
    trailer_url: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    featured: true,
    created_at: new Date('2024-02-25').toISOString(),
  },
  {
    id: 6,
    title: 'Midnight in Madrid',
    description: 'A whirlwind romance ignites between an art restorer on the run and an enigmatic flamenco guitarist as they navigate a high-stakes museum heist across Spain.',
    release_year: 2024,
    genre: 'Romance',
    language: 'Spanish',
    duration: '1h 48m',
    director: 'Pedro Almodóvar',
    cast_members: 'Penélope Cruz, Antonio Banderas, Javier Bardem, Blanca Suárez',
    poster_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=800&auto=format&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1600&auto=format&fit=crop',
    trailer_url: 'https://www.youtube.com/watch?v=Yrz3B8hZ9Zk',
    featured: false,
    created_at: new Date('2024-03-01').toISOString(),
  },
  {
    id: 7,
    title: 'Seoul Velocity',
    description: 'An elite undercover traffic investigator infiltrates the perilous underground electric street racing syndicate operating in the neon highways of futuristic Seoul.',
    release_year: 2025,
    genre: 'Action',
    language: 'Korean',
    duration: '2h 05m',
    director: 'Bong Joon-ho',
    cast_members: 'Song Kang-ho, Park So-dam, Choi Woo-shik, Lee Sun-kyun',
    poster_url: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=800&auto=format&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    trailer_url: 'https://www.youtube.com/watch?v=5xH0Hf13u5g',
    featured: false,
    created_at: new Date('2024-03-08').toISOString(),
  },
  {
    id: 8,
    title: 'The Symphony of Silence',
    description: 'Based on an extraordinary true story of a visionary conductor who loses his hearing during the peak of the 1920s jazz revolution and invents a new sensory form of musical notation.',
    release_year: 2023,
    genre: 'Drama',
    language: 'English',
    duration: '2h 21m',
    director: 'Damien Chazelle',
    cast_members: 'Bradley Cooper, Carey Mulligan, Matt Bomer, Maya Hawke',
    poster_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1600&auto=format&fit=crop',
    trailer_url: 'https://www.youtube.com/watch?v=ga1m0456Vb4',
    featured: false,
    created_at: new Date('2024-03-12').toISOString(),
  },
  {
    id: 9,
    title: 'Quantum Labyrinth',
    description: 'A rogue theoretical physicist discovers that every time she makes a conscious decision, her laboratory splits into divergent timelines that threaten to collapse the fabric of spacetime.',
    release_year: 2026,
    genre: 'Mystery',
    language: 'English',
    duration: '2h 17m',
    director: 'Alex Garland',
    cast_members: 'Natalie Portman, Oscar Isaac, Tessa Thompson, Jennifer Jason Leigh',
    poster_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?q=80&w=1600&auto=format&fit=crop',
    trailer_url: 'https://www.youtube.com/watch?v=89OP78l9W1k',
    featured: false,
    created_at: new Date('2024-03-15').toISOString(),
  },
  {
    id: 10,
    title: 'The Alpine Heist',
    description: 'A crew of international master lockpicks attempts an impossible extraction from an impenetrable vault carved into the heart of a Swiss glacier during an avalanche.',
    release_year: 2024,
    genre: 'Action',
    language: 'German',
    duration: '2h 02m',
    director: 'Edward Berger',
    cast_members: 'Daniel Brühl, Sebastian Koch, Paula Beer, Albrecht Schuch',
    poster_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?q=80&w=1600&auto=format&fit=crop',
    trailer_url: 'https://www.youtube.com/watch?v=W6N8l293eX0',
    featured: false,
    created_at: new Date('2024-03-18').toISOString(),
  },
  {
    id: 11,
    title: 'Whispers in the Stacks',
    description: 'In a sprawling Victorian archive, a meticulous conservator discovers encoded watermarks in rare medieval manuscripts that foretell historic global cataclysms.',
    release_year: 2023,
    genre: 'Mystery',
    language: 'English',
    duration: '1h 58m',
    director: 'Kenneth Branagh',
    cast_members: 'Kenneth Branagh, Emma Thompson, Colin Firth, Judi Dench',
    poster_url: 'https://images.unsplash.com/photo-1507842229452-976932454b8d?q=80&w=800&auto=format&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1600&auto=format&fit=crop',
    trailer_url: 'https://www.youtube.com/watch?v=qM79_itR0Nc',
    featured: false,
    created_at: new Date('2024-03-20').toISOString(),
  },
  {
    id: 12,
    title: 'The Last Canopy',
    description: 'A courageous botanical expedition deep in the uncharted Amazon basin uncovers a sentient bioluminescent biome that holds the cure to a worldwide atmospheric degradation.',
    release_year: 2025,
    genre: 'Adventure',
    language: 'Spanish',
    duration: '2h 11m',
    director: 'Alejandro G. Iñárritu',
    cast_members: 'Gael García Bernal, Salma Hayek, Diego Luna, Wagner Moura',
    poster_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1600&auto=format&fit=crop',
    trailer_url: 'https://www.youtube.com/watch?v=73_1biulkYk',
    featured: false,
    created_at: new Date('2024-03-22').toISOString(),
  },
];

const initialRatings: Rating[] = [
  { id: 1, user_id: 2, movie_id: 1, rating: 5, created_at: new Date('2024-02-16').toISOString(), updated_at: new Date('2024-02-16').toISOString() },
  { id: 2, user_id: 3, movie_id: 1, rating: 5, created_at: new Date('2024-03-02').toISOString(), updated_at: new Date('2024-03-02').toISOString() },
  { id: 3, user_id: 4, movie_id: 1, rating: 4, created_at: new Date('2024-03-22').toISOString(), updated_at: new Date('2024-03-22').toISOString() },
  { id: 4, user_id: 2, movie_id: 2, rating: 5, created_at: new Date('2024-02-18').toISOString(), updated_at: new Date('2024-02-18').toISOString() },
  { id: 5, user_id: 3, movie_id: 2, rating: 4, created_at: new Date('2024-03-05').toISOString(), updated_at: new Date('2024-03-05').toISOString() },
  { id: 6, user_id: 4, movie_id: 2, rating: 5, created_at: new Date('2024-03-25').toISOString(), updated_at: new Date('2024-03-25').toISOString() },
  { id: 7, user_id: 2, movie_id: 3, rating: 5, created_at: new Date('2024-02-20').toISOString(), updated_at: new Date('2024-02-20').toISOString() },
  { id: 8, user_id: 3, movie_id: 3, rating: 5, created_at: new Date('2024-03-07').toISOString(), updated_at: new Date('2024-03-07').toISOString() },
  { id: 9, user_id: 2, movie_id: 4, rating: 4, created_at: new Date('2024-02-22').toISOString(), updated_at: new Date('2024-02-22').toISOString() },
  { id: 10, user_id: 4, movie_id: 4, rating: 4, created_at: new Date('2024-03-28').toISOString(), updated_at: new Date('2024-03-28').toISOString() },
  { id: 11, user_id: 2, movie_id: 5, rating: 4, created_at: new Date('2024-02-26').toISOString(), updated_at: new Date('2024-02-26').toISOString() },
  { id: 12, user_id: 3, movie_id: 5, rating: 5, created_at: new Date('2024-03-10').toISOString(), updated_at: new Date('2024-03-10').toISOString() },
  { id: 13, user_id: 2, movie_id: 6, rating: 4, created_at: new Date('2024-03-02').toISOString(), updated_at: new Date('2024-03-02').toISOString() },
  { id: 14, user_id: 4, movie_id: 6, rating: 4, created_at: new Date('2024-03-30').toISOString(), updated_at: new Date('2024-03-30').toISOString() },
  { id: 15, user_id: 3, movie_id: 7, rating: 5, created_at: new Date('2024-03-12').toISOString(), updated_at: new Date('2024-03-12').toISOString() },
  { id: 16, user_id: 4, movie_id: 7, rating: 4, created_at: new Date('2024-04-01').toISOString(), updated_at: new Date('2024-04-01').toISOString() },
  { id: 17, user_id: 2, movie_id: 8, rating: 5, created_at: new Date('2024-03-14').toISOString(), updated_at: new Date('2024-03-14').toISOString() },
  { id: 18, user_id: 3, movie_id: 8, rating: 4, created_at: new Date('2024-03-15').toISOString(), updated_at: new Date('2024-03-15').toISOString() },
  { id: 19, user_id: 4, movie_id: 9, rating: 4, created_at: new Date('2024-03-21').toISOString(), updated_at: new Date('2024-03-21').toISOString() },
  { id: 20, user_id: 2, movie_id: 10, rating: 4, created_at: new Date('2024-03-24').toISOString(), updated_at: new Date('2024-03-24').toISOString() },
];

const initialReviews: Review[] = [
  {
    id: 1,
    user_id: 2,
    movie_id: 1,
    review_text: 'An astonishing cinematic masterpiece. The auditory sound design combined with theoretical physics visuals left me spellbound from start to finish.',
    created_at: new Date('2024-02-16T12:00:00Z').toISOString(),
    updated_at: new Date('2024-02-16T12:00:00Z').toISOString(),
  },
  {
    id: 2,
    user_id: 3,
    movie_id: 1,
    review_text: 'Transcendent emotional core beneath awe-inspiring interstellar scale. Zimmer-esque scoring elevated every tense sequence.',
    created_at: new Date('2024-03-02T16:20:00Z').toISOString(),
    updated_at: new Date('2024-03-02T16:20:00Z').toISOString(),
  },
  {
    id: 3,
    user_id: 2,
    movie_id: 2,
    review_text: 'The atmospheric cinematography in Neon Horizon sets a new benchmark for cyberpunk cinema. Truly mesmerizing visual effects.',
    created_at: new Date('2024-02-18T19:40:00Z').toISOString(),
    updated_at: new Date('2024-02-18T19:40:00Z').toISOString(),
  },
  {
    id: 4,
    user_id: 4,
    movie_id: 2,
    review_text: 'Intricate philosophical questions regarding consciousness and soul in an artificial era. A modern classic in every sense.',
    created_at: new Date('2024-03-25T11:00:00Z').toISOString(),
    updated_at: new Date('2024-03-25T11:00:00Z').toISOString(),
  },
  {
    id: 5,
    user_id: 2,
    movie_id: 3,
    review_text: 'Quiet, profoundly moving portrayal of human connections and tradition. The pacing is deliberate and rewarding.',
    created_at: new Date('2024-02-20T21:15:00Z').toISOString(),
    updated_at: new Date('2024-02-20T21:15:00Z').toISOString(),
  },
  {
    id: 6,
    user_id: 3,
    movie_id: 5,
    review_text: 'Spectacular world-building that honors classic fantasy while introducing fresh mythological motifs.',
    created_at: new Date('2024-03-10T14:45:00Z').toISOString(),
    updated_at: new Date('2024-03-10T14:45:00Z').toISOString(),
  },
];

const initialWatchlist: WatchlistEntry[] = [
  { id: 1, user_id: 2, movie_id: 2, created_at: new Date('2024-02-16').toISOString() },
  { id: 2, user_id: 2, movie_id: 5, created_at: new Date('2024-02-27').toISOString() },
  { id: 3, user_id: 2, movie_id: 7, created_at: new Date('2024-03-09').toISOString() },
  { id: 4, user_id: 2, movie_id: 9, created_at: new Date('2024-03-16').toISOString() },
  { id: 5, user_id: 3, movie_id: 1, created_at: new Date('2024-03-02').toISOString() },
  { id: 6, user_id: 3, movie_id: 6, created_at: new Date('2024-03-05').toISOString() },
];

// Initialize local store with cloned copies and generated community reviews
const { reviews: seedReviews, ratings: seedRatings } = generateSeedReviewsAndRatings(MOVIES_DATASET);

localStore.users = JSON.parse(JSON.stringify(COMMUNITY_USERS));
localStore.movies = MOVIES_DATASET.map((m) => ({
  ...m,
  created_at: new Date(2024, 0, 1 + (m.id % 300)).toISOString(),
}));
localStore.nextIds.movies = 2500;
localStore.ratings = seedRatings;
localStore.reviews = seedReviews;
localStore.nextIds.ratings = seedRatings.length + 1;
localStore.nextIds.reviews = seedReviews.length + 1;
localStore.watchlist = JSON.parse(JSON.stringify(initialWatchlist));

// Database initialization
export async function initDb(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  const host = process.env.PGHOST || process.env.SQL_HOST;

  if (connectionString || host) {
    try {
      if (!global._cineRatePgPool) {
        if (connectionString) {
          global._cineRatePgPool = new Pool({
            connectionString,
            ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000,
          });
        } else {
          global._cineRatePgPool = new Pool({
            host: process.env.PGHOST || process.env.SQL_HOST,
            port: Number(process.env.PGPORT || 5432),
            user: process.env.PGUSER || process.env.SQL_USER,
            password: process.env.PGPASSWORD || process.env.SQL_PASSWORD,
            database: process.env.PGDATABASE || process.env.SQL_DB_NAME,
            ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
            connectionTimeoutMillis: 5000,
          });
        }

        global._cineRatePgPool.on('error', (err) => {
          console.error('PostgreSQL idle client warning:', err.message);
        });
      }

      pgPool = global._cineRatePgPool;

      // Test connection
      const client = await pgPool.connect();
      try {
        await client.query('SELECT 1');
        isPostgresAvailable = true;
        console.log('Successfully connected to PostgreSQL database.');

        // Initialize schema if not present
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS movies (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            release_year INTEGER NOT NULL,
            genre VARCHAR(100) NOT NULL,
            language VARCHAR(50) NOT NULL DEFAULT 'English',
            duration VARCHAR(50) NOT NULL,
            director VARCHAR(150) NOT NULL,
            cast_members TEXT NOT NULL,
            poster_url TEXT NOT NULL,
            backdrop_url TEXT NOT NULL,
            trailer_url TEXT NOT NULL,
            featured BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS ratings (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_user_movie_rating UNIQUE (user_id, movie_id)
          );

          CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
            review_text TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS watchlist (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_user_movie_watchlist UNIQUE (user_id, movie_id)
          );
        `);

        // Check if movies table has records; if not, seed
        const movieCountRes = await client.query('SELECT COUNT(*) FROM movies');
        if (parseInt(movieCountRes.rows[0].count, 10) === 0) {
          console.log('Seeding initial data into PostgreSQL...');
          for (const u of initialUsers) {
            await client.query(
              'INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING',
              [u.id, u.name, u.email, u.password_hash, u.role, u.created_at]
            );
          }
          for (const m of MOVIES_DATASET) {
            await client.query(
              `INSERT INTO movies (id, title, description, release_year, genre, language, duration, director, cast_members, poster_url, backdrop_url, trailer_url, featured, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT (id) DO NOTHING`,
              [m.id, m.title, m.description, m.release_year, m.genre, m.language, m.duration, m.director, m.cast_members, m.poster_url, m.backdrop_url, m.trailer_url, m.featured, new Date('2024-01-01').toISOString()]
            );
          }
          for (const r of initialRatings) {
            await client.query(
              'INSERT INTO ratings (id, user_id, movie_id, rating, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
              [r.id, r.user_id, r.movie_id, r.rating, r.created_at, r.updated_at]
            );
          }
          for (const rv of initialReviews) {
            await client.query(
              'INSERT INTO reviews (id, user_id, movie_id, review_text, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
              [rv.id, rv.user_id, rv.movie_id, rv.review_text, rv.created_at, rv.updated_at]
            );
          }
          for (const w of initialWatchlist) {
            await client.query(
              'INSERT INTO watchlist (id, user_id, movie_id, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
              [w.id, w.user_id, w.movie_id, w.created_at]
            );
          }
        }
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.warn('PostgreSQL connection attempt failed or offline. Using embedded resilient data store:', err.message);
      isPostgresAvailable = false;
    }
  } else {
    isPostgresAvailable = false;
  }
}

// Helper: Calculate movie rating and review stats
function attachMovieStats(movie: Movie, currentUserId?: number): Movie {
  const ratings = localStore.ratings.filter((r) => r.movie_id === movie.id);
  const reviews = localStore.reviews.filter((r) => r.movie_id === movie.id);
  
  const baseRating = (movie as any).average_rating || 4.6;
  const baseCount = (movie as any).rating_count || 120;
  const totalCount = baseCount + ratings.length;
  const avgRating = ratings.length > 0
    ? Number(((baseRating * baseCount + ratings.reduce((sum, r) => sum + r.rating, 0)) / totalCount).toFixed(1))
    : baseRating;
  
  let inWatchlist = false;
  let userRating: number | undefined = undefined;

  if (currentUserId) {
    inWatchlist = localStore.watchlist.some((w) => w.user_id === currentUserId && w.movie_id === movie.id);
    const userRatingObj = ratings.find((r) => r.user_id === currentUserId);
    if (userRatingObj) {
      userRating = userRatingObj.rating;
    }
  }

  return {
    ...movie,
    average_rating: avgRating,
    rating_count: totalCount,
    reviews_count: reviews.length,
    in_watchlist: inWatchlist,
    user_rating: userRating,
  };
}

// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------
export async function getUserByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  if (isPostgresAvailable && pgPool) {
    try {
      const res = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalized]);
      return res.rows[0] || null;
    } catch (e) {
      console.error('Postgres error, falling back to local store:', e);
    }
  }
  const user = localStore.users.find((u) => u.email.toLowerCase() === normalized);
  return user || null;
}

export async function getUserById(id: number): Promise<User | null> {
  if (isPostgresAvailable && pgPool) {
    try {
      const res = await pgPool.query('SELECT * FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    } catch (e) {
      console.error('Postgres error, falling back to local store:', e);
    }
  }
  const user = localStore.users.find((u) => u.id === id);
  return user || null;
}

export async function createUser(data: { name: string; email: string; password_hash: string; role?: 'user' | 'admin' }): Promise<User> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const role = data.role || (localStore.users.length === 0 ? 'admin' : 'user');

  if (isPostgresAvailable && pgPool) {
    try {
      const res = await pgPool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [data.name.trim(), normalizedEmail, data.password_hash, role]
      );
      return res.rows[0];
    } catch (e) {
      console.error('Postgres error in createUser:', e);
    }
  }

  const newUser: User = {
    id: localStore.nextIds.users++,
    name: data.name.trim(),
    email: normalizedEmail,
    password_hash: data.password_hash,
    role,
    created_at: new Date().toISOString(),
  };

  localStore.users.push(newUser);
  return newUser;
}

export async function updateUser(id: number, data: { name?: string; email?: string }): Promise<User | null> {
  if (isPostgresAvailable && pgPool) {
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (data.name) {
        setClauses.push(`name = $${idx++}`);
        values.push(data.name.trim());
      }
      if (data.email) {
        setClauses.push(`email = $${idx++}`);
        values.push(data.email.trim().toLowerCase());
      }

      if (setClauses.length > 0) {
        setClauses.push(`updated_at = NOW()`);
        values.push(id);
        const res = await pgPool.query(
          `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
          values
        );
        return res.rows[0] || null;
      }
    } catch (e) {
      console.error('Postgres error in updateUser:', e);
    }
  }

  const user = localStore.users.find((u) => u.id === id);
  if (!user) return null;

  if (data.name) user.name = data.name.trim();
  if (data.email) user.email = data.email.trim().toLowerCase();
  user.updated_at = new Date().toISOString();
  return user;
}

export async function getAllUsers(): Promise<User[]> {
  if (isPostgresAvailable && pgPool) {
    try {
      const res = await pgPool.query('SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC');
      return res.rows;
    } catch (e) {
      console.error('Postgres error in getAllUsers:', e);
    }
  }
  return localStore.users.map(({ password_hash, ...u }) => u as User);
}

// -------------------------------------------------------------
// MOVIE OPERATIONS
// -------------------------------------------------------------
export interface MovieQueryParams {
  search?: string;
  genre?: string;
  language?: string;
  year?: string | number;
  minRating?: number;
  sort?: string;
  limit?: number;
  offset?: number;
  featured?: boolean;
}

export async function getMovies(params: MovieQueryParams = {}, currentUserId?: number): Promise<{ movies: Movie[]; total: number }> {
  // If Postgres is available, execute query; otherwise filter localStore
  let allMovies: Movie[] = [];

  if (isPostgresAvailable && pgPool) {
    try {
      const res = await pgPool.query('SELECT * FROM movies ORDER BY id ASC');
      allMovies = res.rows;
    } catch (e) {
      console.error('Postgres error in getMovies, using local store:', e);
      allMovies = [...localStore.movies];
    }
  } else {
    allMovies = [...localStore.movies];
  }

  // Calculate and attach ratings & watchlists
  let moviesWithStats = allMovies.map((m) => attachMovieStats(m, currentUserId));

  // 1. Search filter
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    moviesWithStats = moviesWithStats.filter((m) =>
      m.title.toLowerCase().includes(q) ||
      m.director.toLowerCase().includes(q) ||
      m.cast_members.toLowerCase().includes(q) ||
      m.genre.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
    );
  }

  // 2. Genre filter
  if (params.genre && params.genre.toLowerCase() !== 'all') {
    const genreQ = params.genre.toLowerCase();
    moviesWithStats = moviesWithStats.filter((m) => m.genre.toLowerCase().includes(genreQ));
  }

  // 3. Language filter
  if (params.language && params.language.toLowerCase() !== 'all') {
    const langQ = params.language.toLowerCase();
    moviesWithStats = moviesWithStats.filter((m) => m.language.toLowerCase() === langQ);
  }

  // 4. Year filter
  if (params.year && params.year !== 'all') {
    if (params.year === '2026+') {
      moviesWithStats = moviesWithStats.filter((m) => m.release_year >= 2026);
    } else if (params.year === '2020-2022') {
      moviesWithStats = moviesWithStats.filter((m) => m.release_year >= 2020 && m.release_year <= 2022);
    } else if (params.year === '2010s') {
      moviesWithStats = moviesWithStats.filter((m) => m.release_year >= 2010 && m.release_year <= 2019);
    } else if (params.year === 'classics') {
      moviesWithStats = moviesWithStats.filter((m) => m.release_year < 2010);
    } else {
      const yearNum = Number(params.year);
      if (!isNaN(yearNum)) {
        moviesWithStats = moviesWithStats.filter((m) => m.release_year === yearNum);
      }
    }
  }

  // 5. Min Rating filter
  if (params.minRating && params.minRating > 0) {
    const min = Number(params.minRating);
    moviesWithStats = moviesWithStats.filter((m) => (m.average_rating || 0) >= min);
  }

  // 6. Featured
  if (params.featured !== undefined) {
    moviesWithStats = moviesWithStats.filter((m) => m.featured === params.featured);
  }

  // 7. Sort
  const sort = params.sort || 'popular';
  switch (sort) {
    case 'rating':
      moviesWithStats.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0) || (b.rating_count || 0) - (a.rating_count || 0));
      break;
    case 'newest':
      moviesWithStats.sort((a, b) => b.release_year - a.release_year || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case 'oldest':
      moviesWithStats.sort((a, b) => a.release_year - b.release_year || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      break;
    case 'alphabetical':
      moviesWithStats.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'reviews':
      moviesWithStats.sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0));
      break;
    case 'popular':
    default:
      moviesWithStats.sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0) || (b.average_rating || 0) - (a.average_rating || 0));
      break;
  }

  const total = moviesWithStats.length;
  const offset = params.offset || 0;
  const limit = params.limit || 50;
  const paginated = moviesWithStats.slice(offset, offset + limit);

  return { movies: paginated, total };
}

export async function getMovieById(id: number, currentUserId?: number): Promise<Movie | null> {
  let movie: Movie | null = null;

  if (isPostgresAvailable && pgPool) {
    try {
      const res = await pgPool.query('SELECT * FROM movies WHERE id = $1', [id]);
      movie = res.rows[0] || null;
    } catch (e) {
      console.error('Postgres error in getMovieById:', e);
      movie = localStore.movies.find((m) => m.id === id) || null;
    }
  } else {
    movie = localStore.movies.find((m) => m.id === id) || null;
  }

  if (!movie) return null;
  return attachMovieStats(movie, currentUserId);
}

export async function createMovie(data: Omit<Movie, 'id' | 'created_at' | 'updated_at' | 'average_rating' | 'rating_count' | 'reviews_count' | 'in_watchlist' | 'user_rating'>): Promise<Movie> {
  if (isPostgresAvailable && pgPool) {
    try {
      const res = await pgPool.query(
        `INSERT INTO movies (title, description, release_year, genre, language, duration, director, cast_members, poster_url, backdrop_url, trailer_url, featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          data.title.trim(),
          data.description.trim(),
          Number(data.release_year),
          data.genre.trim(),
          data.language.trim() || 'English',
          data.duration.trim(),
          data.director.trim(),
          data.cast_members.trim(),
          data.poster_url.trim(),
          data.backdrop_url.trim() || data.poster_url.trim(),
          data.trailer_url.trim() || '',
          Boolean(data.featured),
        ]
      );
      return attachMovieStats(res.rows[0]);
    } catch (e) {
      console.error('Postgres error in createMovie:', e);
    }
  }

  const newMovie: Movie = {
    id: localStore.nextIds.movies++,
    title: data.title.trim(),
    description: data.description.trim(),
    release_year: Number(data.release_year),
    genre: data.genre.trim(),
    language: data.language.trim() || 'English',
    duration: data.duration.trim(),
    director: data.director.trim(),
    cast_members: data.cast_members.trim(),
    poster_url: data.poster_url.trim(),
    backdrop_url: data.backdrop_url.trim() || data.poster_url.trim(),
    trailer_url: data.trailer_url.trim() || '',
    featured: Boolean(data.featured),
    created_at: new Date().toISOString(),
  };

  localStore.movies.push(newMovie);
  return attachMovieStats(newMovie);
}

export async function updateMovie(id: number, data: Partial<Movie>): Promise<Movie | null> {
  if (isPostgresAvailable && pgPool) {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (data.title !== undefined) { fields.push(`title = $${idx++}`); values.push(data.title.trim()); }
      if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description.trim()); }
      if (data.release_year !== undefined) { fields.push(`release_year = $${idx++}`); values.push(Number(data.release_year)); }
      if (data.genre !== undefined) { fields.push(`genre = $${idx++}`); values.push(data.genre.trim()); }
      if (data.language !== undefined) { fields.push(`language = $${idx++}`); values.push(data.language.trim()); }
      if (data.duration !== undefined) { fields.push(`duration = $${idx++}`); values.push(data.duration.trim()); }
      if (data.director !== undefined) { fields.push(`director = $${idx++}`); values.push(data.director.trim()); }
      if (data.cast_members !== undefined) { fields.push(`cast_members = $${idx++}`); values.push(data.cast_members.trim()); }
      if (data.poster_url !== undefined) { fields.push(`poster_url = $${idx++}`); values.push(data.poster_url.trim()); }
      if (data.backdrop_url !== undefined) { fields.push(`backdrop_url = $${idx++}`); values.push(data.backdrop_url.trim()); }
      if (data.trailer_url !== undefined) { fields.push(`trailer_url = $${idx++}`); values.push(data.trailer_url.trim()); }
      if (data.featured !== undefined) { fields.push(`featured = $${idx++}`); values.push(Boolean(data.featured)); }

      if (fields.length > 0) {
        fields.push(`updated_at = NOW()`);
        values.push(id);
        const res = await pgPool.query(
          `UPDATE movies SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
          values
        );
        if (res.rows[0]) return attachMovieStats(res.rows[0]);
      }
    } catch (e) {
      console.error('Postgres error in updateMovie:', e);
    }
  }

  const movie = localStore.movies.find((m) => m.id === id);
  if (!movie) return null;

  if (data.title !== undefined) movie.title = data.title.trim();
  if (data.description !== undefined) movie.description = data.description.trim();
  if (data.release_year !== undefined) movie.release_year = Number(data.release_year);
  if (data.genre !== undefined) movie.genre = data.genre.trim();
  if (data.language !== undefined) movie.language = data.language.trim();
  if (data.duration !== undefined) movie.duration = data.duration.trim();
  if (data.director !== undefined) movie.director = data.director.trim();
  if (data.cast_members !== undefined) movie.cast_members = data.cast_members.trim();
  if (data.poster_url !== undefined) movie.poster_url = data.poster_url.trim();
  if (data.backdrop_url !== undefined) movie.backdrop_url = data.backdrop_url.trim();
  if (data.trailer_url !== undefined) movie.trailer_url = data.trailer_url.trim();
  if (data.featured !== undefined) movie.featured = Boolean(data.featured);
  movie.updated_at = new Date().toISOString();

  return attachMovieStats(movie);
}

export async function deleteMovie(id: number): Promise<boolean> {
  if (isPostgresAvailable && pgPool) {
    try {
      const res = await pgPool.query('DELETE FROM movies WHERE id = $1 RETURNING id', [id]);
      return (res.rowCount || 0) > 0;
    } catch (e) {
      console.error('Postgres error in deleteMovie:', e);
    }
  }

  const idx = localStore.movies.findIndex((m) => m.id === id);
  if (idx === -1) return false;

  localStore.movies.splice(idx, 1);
  // Cascading deletes
  localStore.ratings = localStore.ratings.filter((r) => r.movie_id !== id);
  localStore.reviews = localStore.reviews.filter((r) => r.movie_id !== id);
  localStore.watchlist = localStore.watchlist.filter((w) => w.movie_id !== id);
  return true;
}

// -------------------------------------------------------------
// RATINGS OPERATIONS
// -------------------------------------------------------------
export async function upsertRating(userId: number, movieId: number, ratingVal: number): Promise<{ rating: Rating; averageRating: number; totalRatings: number }> {
  const ratingClamped = Math.max(1, Math.min(5, Math.round(ratingVal)));

  if (isPostgresAvailable && pgPool) {
    try {
      await pgPool.query(
        `INSERT INTO ratings (user_id, movie_id, rating, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, movie_id)
         DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()`,
        [userId, movieId, ratingClamped]
      );
      const statsRes = await pgPool.query(
        'SELECT COALESCE(AVG(rating), 0) as avg, COUNT(*) as cnt FROM ratings WHERE movie_id = $1',
        [movieId]
      );
      return {
        rating: { id: 0, user_id: userId, movie_id: movieId, rating: ratingClamped, created_at: '', updated_at: '' },
        averageRating: Number(parseFloat(statsRes.rows[0].avg).toFixed(1)),
        totalRatings: parseInt(statsRes.rows[0].cnt, 10),
      };
    } catch (e) {
      console.error('Postgres error in upsertRating:', e);
    }
  }

  let existing = localStore.ratings.find((r) => r.user_id === userId && r.movie_id === movieId);
  if (existing) {
    existing.rating = ratingClamped;
    existing.updated_at = new Date().toISOString();
  } else {
    existing = {
      id: localStore.nextIds.ratings++,
      user_id: userId,
      movie_id: movieId,
      rating: ratingClamped,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localStore.ratings.push(existing);
  }

  const movieRatings = localStore.ratings.filter((r) => r.movie_id === movieId);
  const avg = Number((movieRatings.reduce((sum, r) => sum + r.rating, 0) / movieRatings.length).toFixed(1));

  return {
    rating: existing,
    averageRating: avg,
    totalRatings: movieRatings.length,
  };
}

export async function getUserRatings(userId: number): Promise<Array<Rating & { movie: Movie }>> {
  const userRatings = localStore.ratings.filter((r) => r.user_id === userId);
  return userRatings.map((r) => {
    const movie = localStore.movies.find((m) => m.id === r.movie_id)!;
    return {
      ...r,
      movie: attachMovieStats(movie, userId),
    };
  }).filter((r) => Boolean(r.movie));
}

// -------------------------------------------------------------
// REVIEWS OPERATIONS
// -------------------------------------------------------------
export async function getReviews(movieId?: number): Promise<Review[]> {
  let reviewsList = [...localStore.reviews];
  if (movieId) {
    reviewsList = reviewsList.filter((r) => r.movie_id === movieId);
  }

  // Sort newest first
  reviewsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Attach joined fields
  return reviewsList.map((r) => {
    const user = localStore.users.find((u) => u.id === r.user_id);
    const movie = localStore.movies.find((m) => m.id === r.movie_id);
    const ratingObj = localStore.ratings.find((rt) => rt.user_id === r.user_id && rt.movie_id === r.movie_id);

    return {
      ...r,
      user_name: user?.name || 'Anonymous Moviegoer',
      user_email: user?.email || '',
      movie_title: movie?.title || 'Unknown Title',
      movie_poster: movie?.poster_url || '',
      user_rating: ratingObj?.rating,
    };
  });
}

export async function getReviewById(id: number): Promise<Review | null> {
  const review = localStore.reviews.find((r) => r.id === id);
  if (!review) return null;
  const user = localStore.users.find((u) => u.id === review.user_id);
  const movie = localStore.movies.find((m) => m.id === review.movie_id);
  const ratingObj = localStore.ratings.find((rt) => rt.user_id === review.user_id && rt.movie_id === review.movie_id);

  return {
    ...review,
    user_name: user?.name || 'Anonymous Moviegoer',
    user_email: user?.email || '',
    movie_title: movie?.title || '',
    movie_poster: movie?.poster_url || '',
    user_rating: ratingObj?.rating,
  };
}

export async function createReview(userId: number, movieId: number, reviewText: string): Promise<Review> {
  const newReview: Review = {
    id: localStore.nextIds.reviews++,
    user_id: userId,
    movie_id: movieId,
    review_text: reviewText.trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  localStore.reviews.unshift(newReview);
  return (await getReviewById(newReview.id)) || newReview;
}

export async function updateReview(id: number, userId: number, reviewText: string, isAdmin: boolean = false): Promise<Review | null> {
  const review = localStore.reviews.find((r) => r.id === id);
  if (!review) return null;

  if (review.user_id !== userId && !isAdmin) {
    throw new Error('Forbidden: You can only edit your own reviews');
  }

  review.review_text = reviewText.trim();
  review.updated_at = new Date().toISOString();
  return getReviewById(id);
}

export async function deleteReview(id: number, userId: number, isAdmin: boolean = false): Promise<boolean> {
  const idx = localStore.reviews.findIndex((r) => r.id === id);
  if (idx === -1) return false;

  const review = localStore.reviews[idx];
  if (review.user_id !== userId && !isAdmin) {
    throw new Error('Forbidden: You can only delete your own reviews');
  }

  localStore.reviews.splice(idx, 1);
  return true;
}

export async function getUserReviews(userId: number): Promise<Review[]> {
  const reviews = localStore.reviews.filter((r) => r.user_id === userId);
  return Promise.all(reviews.map((r) => getReviewById(r.id) as Promise<Review>));
}

// -------------------------------------------------------------
// WATCHLIST OPERATIONS
// -------------------------------------------------------------
export async function getWatchlist(userId: number): Promise<Movie[]> {
  const userEntries = localStore.watchlist.filter((w) => w.user_id === userId);
  const movieIds = userEntries.map((w) => w.movie_id);
  const movies = localStore.movies.filter((m) => movieIds.includes(m.id));
  return movies.map((m) => attachMovieStats(m, userId));
}

export async function addToWatchlist(userId: number, movieId: number): Promise<boolean> {
  const exists = localStore.watchlist.some((w) => w.user_id === userId && w.movie_id === movieId);
  if (exists) return true;

  localStore.watchlist.push({
    id: localStore.nextIds.watchlist++,
    user_id: userId,
    movie_id: movieId,
    created_at: new Date().toISOString(),
  });
  return true;
}

export async function removeFromWatchlist(userId: number, movieId: number): Promise<boolean> {
  const initialLen = localStore.watchlist.length;
  localStore.watchlist = localStore.watchlist.filter((w) => !(w.user_id === userId && w.movie_id === movieId));
  return localStore.watchlist.length < initialLen;
}

// -------------------------------------------------------------
// ADMIN STATS
// -------------------------------------------------------------
export async function getAdminStats() {
  const totalMovies = localStore.movies.length;
  const totalUsers = localStore.users.length;
  const totalReviews = localStore.reviews.length;
  const totalRatings = localStore.ratings.length;

  const avgRating = totalRatings > 0
    ? Number((localStore.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(2))
    : 0;

  return {
    totalMovies,
    totalUsers,
    totalReviews,
    totalRatings,
    avgRating,
  };
}
