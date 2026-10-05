import { Review, Rating, User } from '../server/db.ts';

export const COMMUNITY_USERS: User[] = [
  {
    id: 1,
    name: 'Elena Rostova (Admin)',
    email: 'admin@cinerate.com',
    password_hash: '$2a$10$wN1QeY9uR8jH/l2eQ9vU1.7y8b4u2m1n0x',
    role: 'admin',
    created_at: new Date('2024-01-10T10:00:00Z').toISOString(),
  },
  {
    id: 2,
    name: 'Sarah Jenkins',
    email: 'sarah.j@cinerate.com',
    password_hash: '$2a$10$wN1QeY9uR8jH/l2eQ9vU1.7y8b4u2m1n0x',
    role: 'user',
    created_at: new Date('2024-01-15T14:30:00Z').toISOString(),
  },
  {
    id: 3,
    name: 'Marcus Vance',
    email: 'marcus.v@cinerate.com',
    password_hash: '$2a$10$wN1QeY9uR8jH/l2eQ9vU1.7y8b4u2m1n0x',
    role: 'user',
    created_at: new Date('2024-01-20T09:15:00Z').toISOString(),
  },
  {
    id: 4,
    name: 'Priya Sharma',
    email: 'priya.s@cinerate.com',
    password_hash: '$2a$10$wN1QeY9uR8jH/l2eQ9vU1.7y8b4u2m1n0x',
    role: 'user',
    created_at: new Date('2024-02-01T11:45:00Z').toISOString(),
  },
  {
    id: 5,
    name: 'Alex Rivera',
    email: 'alex.r@cinerate.com',
    password_hash: '$2a$10$wN1QeY9uR8jH/l2eQ9vU1.7y8b4u2m1n0x',
    role: 'user',
    created_at: new Date('2024-02-10T16:20:00Z').toISOString(),
  },
  {
    id: 6,
    name: 'David Chen',
    email: 'david.c@cinerate.com',
    password_hash: '$2a$10$wN1QeY9uR8jH/l2eQ9vU1.7y8b4u2m1n0x',
    role: 'user',
    created_at: new Date('2024-02-18T18:00:00Z').toISOString(),
  },
  {
    id: 7,
    name: 'Chloe Bennett',
    email: 'chloe.b@cinerate.com',
    password_hash: '$2a$10$wN1QeY9uR8jH/l2eQ9vU1.7y8b4u2m1n0x',
    role: 'user',
    created_at: new Date('2024-02-25T13:10:00Z').toISOString(),
  },
  {
    id: 8,
    name: 'Kenji Sato',
    email: 'kenji.s@cinerate.com',
    password_hash: '$2a$10$wN1QeY9uR8jH/l2eQ9vU1.7y8b4u2m1n0x',
    role: 'user',
    created_at: new Date('2024-03-01T10:30:00Z').toISOString(),
  },
  {
    id: 9,
    name: 'Liam Gallagher',
    email: 'liam.g@cinerate.com',
    password_hash: '$2a$10$wN1QeY9uR8jH/l2eQ9vU1.7y8b4u2m1n0x',
    role: 'user',
    created_at: new Date('2024-03-08T15:40:00Z').toISOString(),
  },
  {
    id: 10,
    name: 'Fatima Al-Mansoor',
    email: 'fatima.m@cinerate.com',
    password_hash: '$2a$10$wN1QeY9uR8jH/l2eQ9vU1.7y8b4u2m1n0x',
    role: 'user',
    created_at: new Date('2024-03-12T17:25:00Z').toISOString(),
  },
];

const GENRE_REVIEWS: Record<string, string[]> = {
  'Sci-Fi': [
    'Stunning visual effects and a thought-provoking concept. The exploration of futuristic themes was executed brilliantly.',
    'The world-building and sound design are out of this world. Zimmer-esque scoring elevated every tense sequence.',
    'A gripping narrative that balances deep theoretical ideas with emotional character arcs.',
    'Intricate philosophical questions regarding consciousness and spacetime. A modern sci-fi triumph.',
  ],
  'Action': [
    'Incredible adrenaline rush from start to finish! The choreography and practical stunts are top notch.',
    'Fast-paced, relentless, and thrilling. The climax delivers everything an action fan could ask for.',
    'Crisp editing, intense action set-pieces, and a magnetic lead performance.',
    'Electrifying action sequences and fantastic pacing. Kept my eyes glued to the screen throughout.',
  ],
  'Drama': [
    'Deeply moving storytelling with nuanced performances. It tackles profound human emotions with subtlety and grace.',
    'A masterclass in character development. The dialogue feels raw, authentic, and emotionally resonant.',
    'An unforgettable narrative that lingers in your thoughts for days. The third act was overwhelmingly powerful.',
    'Quiet, profoundly touching portrayal of human resilience and bonds. Highly recommended.',
  ],
  'Thriller': [
    'Kept me guessing until the final ten minutes. The suspense builds up relentlessly with every scene.',
    'Atmospheric, tense, and expertly plotted. Every clue and twist fits together seamlessly.',
    'A psychological puzzle that rewards close attention. Exceptional pacing and moody cinematography.',
    'White-knuckle tension from start to finish. The tension never lets up.',
  ],
  'Mystery': [
    'Layer upon layer of intrigue. The reveal was earned and completely satisfying.',
    'Smart, stylish, and brilliantly written detective work. A genuine pleasure to decipher.',
    'Rich in atmospheric clues and suspenseful red herrings. Highly engrossing.',
  ],
  'Comedy': [
    'Hilarious from start to finish. The comedic timing and chemistry between the leads are pitch perfect.',
    'Witty writing with heart. So many laugh-out-loud moments that make this infinitely rewatchable.',
    'A delightful and refreshing experience. Exactly the uplifting watch I was hoping for.',
  ],
  'Romance': [
    'Pure poetic cinema. The emotional connection between the protagonists feels genuine and heartfelt.',
    'Breathtaking soundtrack and beautiful chemistry. Touched my heart in ways few films manage.',
    'Bittersweet, elegant, and poignant. A story that captures the beauty of memory and love.',
  ],
  'Adventure': [
    'A grand, epic adventure across vast landscapes. The sense of discovery and spectacle is unmatched.',
    'Sweeping cinematic scale and memorable heroic beats. Pure escapism at its finest.',
    'Immersive world-building and breathtaking vistas. Kept the child in me completely captivated.',
  ],
};

const GENERAL_REVIEWS = [
  'A captivating cinematic experience. The direction and score elevate the entire production.',
  'Remarkable depth in every scene. The cast chemistry brings the whole story to life.',
  'One of the most memorable watches of this year. Beautifully shot and structured.',
  'Impressive artistic vision and meticulous attention to detail. Worth watching more than once.',
  'A rare gem that balances great storytelling with flawless technical execution.',
  'Brilliant pacing and phenomenal lead acting. Truly exceeded my expectations.',
  'Engrossing from the opening scene right through the climax. A must-watch for film enthusiasts.',
  'Superb direction and sharp dialogue. The storytelling flows naturally and keeps you invested.',
];

/**
 * Deterministically generates random numbers of reviews (2 to 5) for every movie
 */
export function generateSeedReviewsAndRatings(movies: Array<{ id: number; genre?: string; title?: string }>): {
  reviews: Review[];
  ratings: Rating[];
} {
  const reviews: Review[] = [];
  const ratings: Rating[] = [];
  let reviewIdCounter = 1;
  let ratingIdCounter = 1;

  for (const movie of movies) {
    // Generate between 2 and 5 reviews per movie (deterministically based on movie.id)
    const reviewCount = 2 + ((movie.id * 7 + 3) % 4); // 2, 3, 4, or 5 reviews
    const usedUsers = new Set<number>();

    const genreReviews = (movie.genre && GENRE_REVIEWS[movie.genre.split('/')[0].trim()]) || GENERAL_REVIEWS;

    for (let i = 0; i < reviewCount; i++) {
      // Pick a user (users id 2 through 10)
      let userIdx = ((movie.id * 13 + i * 5 + 1) % 9) + 2;
      while (usedUsers.has(userIdx)) {
        userIdx = (userIdx % 9) + 2;
      }
      usedUsers.add(userIdx);

      // Pick review text
      const pool = i % 2 === 0 ? genreReviews : GENERAL_REVIEWS;
      const textIdx = (movie.id * 3 + i * 7) % pool.length;
      const reviewText = pool[textIdx];

      // Rating: mostly 4 or 5 stars, occasional 3
      const ratingOptions = [4, 5, 5, 4, 3, 5, 4, 5];
      const ratingVal = ratingOptions[(movie.id + i * 3) % ratingOptions.length];

      // Date: staggered over past year
      const daysAgo = (movie.id * 2 + i * 14) % 320;
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const isoDate = date.toISOString();

      ratings.push({
        id: ratingIdCounter++,
        user_id: userIdx,
        movie_id: movie.id,
        rating: ratingVal,
        created_at: isoDate,
        updated_at: isoDate,
      });

      reviews.push({
        id: reviewIdCounter++,
        user_id: userIdx,
        movie_id: movie.id,
        review_text: reviewText,
        created_at: isoDate,
        updated_at: isoDate,
      });
    }
  }

  return { reviews, ratings };
}
