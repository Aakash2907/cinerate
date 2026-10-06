import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  getAllUsers,
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  upsertRating,
  getUserRatings,
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getAdminStats,
  localStore,
} from './db.ts';
import {
  type AuthRequest,
  generateToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
  requireAdmin,
} from './auth.ts';

export const apiRouter = Router();

// =============================================================
// AUTHENTICATION ENDPOINTS
// =============================================================

// POST /api/auth/register
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email address format.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // If email contains "admin" or is the specific admin email, grant admin role for easy testing
    const role = email.trim().toLowerCase().includes('admin') ? 'admin' : 'user';

    const user = await createUser({
      name: name.trim(),
      email: email.trim(),
      password_hash,
      role,
    });

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      token,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Unable to complete registration. Please try again.' });
  }
});

// POST /api/auth/login
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.json({
      message: 'Signed in successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Unable to sign in. Please try again later.' });
  }
});

// POST /api/auth/logout
apiRouter.post('/auth/logout', (_req: Request, res: Response) => {
  clearAuthCookie(res);
  return res.json({ message: 'Signed out successfully.' });
});

// GET /api/auth/me
apiRouter.get('/auth/me', async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.json({ user: null });
  }

  const user = await getUserById(req.user.id);
  if (!user) {
    clearAuthCookie(res);
    return res.json({ user: null });
  }

  const watchlist = await getWatchlist(user.id);
  const reviews = await getUserReviews(user.id);
  const ratings = await getUserRatings(user.id);

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      watchlist_count: watchlist.length,
      reviews_count: reviews.length,
      ratings_count: ratings.length,
    },
  });
});

// PUT /api/auth/profile
apiRouter.put('/auth/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name cannot be empty.' });
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Invalid email address.' });
      }

      const existing = await getUserByEmail(email);
      if (existing && existing.id !== userId) {
        return res.status(409).json({ error: 'Email address is already in use by another account.' });
      }
    }

    const updated = await updateUser(userId, { name, email });
    if (!updated) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const token = generateToken(updated);
    setAuthCookie(res, token);

    return res.json({
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        created_at: updated.created_at,
      },
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// =============================================================
// MOVIES ENDPOINTS
// =============================================================

// GET /api/movies/search?q=
apiRouter.get('/movies/search', async (req: AuthRequest, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    const userId = req.user?.id;
    const result = await getMovies({ search: q, limit: 20 }, userId);
    return res.json({
      query: q,
      results: result.movies,
      total: result.total,
    });
  } catch (err: any) {
    console.error('Search error:', err);
    return res.status(500).json({ error: 'Failed to execute movie search.' });
  }
});

// GET /api/movies
apiRouter.get('/movies', async (req: AuthRequest, res: Response) => {
  try {
    const {
      search,
      genre,
      language,
      year,
      minRating,
      sort,
      limit,
      offset,
      featured,
    } = req.query;

    const userId = req.user?.id;

    const result = await getMovies(
      {
        search: search as string,
        genre: genre as string,
        language: language as string,
        year: year as string,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        sort: sort as string,
        limit: limit ? parseInt(limit as string, 10) : 50,
        offset: offset ? parseInt(offset as string, 10) : 0,
        featured: featured !== undefined ? featured === 'true' : undefined,
      },
      userId
    );

    return res.json({
      movies: result.movies,
      total: result.total,
    });
  } catch (err: any) {
    console.error('Get movies error:', err);
    return res.status(500).json({ error: 'Unable to retrieve movie collection.' });
  }
});

// GET /api/movies/:id
apiRouter.get('/movies/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid movie ID.' });
    }

    const userId = req.user?.id;
    const movie = await getMovieById(id, userId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    const reviews = await getReviews(id);

    return res.json({
      movie,
      reviews,
    });
  } catch (err: any) {
    console.error('Get movie details error:', err);
    return res.status(500).json({ error: 'Unable to retrieve movie details.' });
  }
});

// POST /api/movies (Admin only)
apiRouter.post('/movies', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      release_year,
      genre,
      language,
      duration,
      director,
      cast_members,
      poster_url,
      backdrop_url,
      trailer_url,
      featured,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Movie title is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Movie description is required.' });
    }
    const year = parseInt(release_year, 10);
    if (isNaN(year) || year < 1888 || year > 2100) {
      return res.status(400).json({ error: 'Please enter a valid release year (1888-2100).' });
    }
    if (!genre || !genre.trim()) {
      return res.status(400).json({ error: 'Movie genre is required.' });
    }
    if (!director || !director.trim()) {
      return res.status(400).json({ error: 'Director name is required.' });
    }
    if (!poster_url || !poster_url.trim()) {
      return res.status(400).json({ error: 'Poster URL is required.' });
    }

    const movie = await createMovie({
      title: title.trim(),
      description: description.trim(),
      release_year: year,
      genre: genre.trim(),
      language: language?.trim() || 'English',
      duration: duration?.trim() || '2h 00m',
      director: director.trim(),
      cast_members: cast_members?.trim() || '',
      poster_url: poster_url.trim(),
      backdrop_url: backdrop_url?.trim() || poster_url.trim(),
      trailer_url: trailer_url?.trim() || '',
      featured: Boolean(featured),
    });

    return res.status(201).json({
      message: 'Movie added successfully.',
      movie,
    });
  } catch (err: any) {
    console.error('Create movie error:', err);
    return res.status(500).json({ error: 'Failed to create movie.' });
  }
});

// PUT /api/movies/:id (Admin only)
apiRouter.put('/movies/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid movie ID.' });
    }

    const movie = await getMovieById(id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    const updated = await updateMovie(id, req.body);
    return res.json({
      message: 'Movie updated successfully.',
      movie: updated,
    });
  } catch (err: any) {
    console.error('Update movie error:', err);
    return res.status(500).json({ error: 'Failed to update movie.' });
  }
});

// DELETE /api/movies/:id (Admin only)
apiRouter.delete('/movies/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid movie ID.' });
    }

    const deleted = await deleteMovie(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    return res.json({ message: 'Movie deleted successfully.' });
  } catch (err: any) {
    console.error('Delete movie error:', err);
    return res.status(500).json({ error: 'Failed to delete movie.' });
  }
});

// =============================================================
// RATINGS ENDPOINTS
// =============================================================

// POST /api/ratings
apiRouter.post('/ratings', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user ? req.user.id : (localStore.users[0]?.id || 1);
    const { movieId, rating } = req.body;

    const mId = parseInt(movieId, 10);
    const rVal = parseInt(rating, 10);

    if (isNaN(mId)) {
      return res.status(400).json({ error: 'Valid movie ID is required.' });
    }
    if (isNaN(rVal) || rVal < 1 || rVal > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    const movie = await getMovieById(mId, userId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    const result = await upsertRating(userId, mId, rVal);

    return res.json({
      message: 'Rating saved successfully.',
      user_rating: rVal,
      average_rating: result.averageRating,
      rating_count: result.totalRatings,
    });
  } catch (err: any) {
    console.error('Rating error:', err);
    return res.status(500).json({ error: 'Failed to record rating.' });
  }
});

// PUT /api/ratings/:id
apiRouter.put('/ratings/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { movieId, rating } = req.body;
    const mId = parseInt(movieId, 10);
    const rVal = parseInt(rating, 10);

    if (isNaN(mId) || isNaN(rVal) || rVal < 1 || rVal > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    const result = await upsertRating(userId, mId, rVal);
    return res.json({
      message: 'Rating updated.',
      user_rating: rVal,
      average_rating: result.averageRating,
      rating_count: result.totalRatings,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update rating.' });
  }
});

// GET /api/ratings/me
apiRouter.get('/ratings/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRatings = await getUserRatings(userId);
    return res.json({ ratings: userRatings });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch user ratings.' });
  }
});

// =============================================================
// REVIEWS ENDPOINTS
// =============================================================

// GET /api/reviews
apiRouter.get('/reviews', async (req: Request, res: Response) => {
  try {
    const movieId = req.query.movieId ? parseInt(req.query.movieId as string, 10) : undefined;
    const reviews = await getReviews(movieId);
    return res.json({ reviews });
  } catch (err: any) {
    console.error('Get reviews error:', err);
    return res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// POST /api/reviews
apiRouter.post('/reviews', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { movieId, reviewText } = req.body;

    const mId = parseInt(movieId, 10);
    if (isNaN(mId)) {
      return res.status(400).json({ error: 'Valid movie ID is required.' });
    }
    if (!reviewText || !reviewText.trim()) {
      return res.status(400).json({ error: 'Review text cannot be empty.' });
    }
    if (reviewText.trim().length < 3) {
      return res.status(400).json({ error: 'Review should be at least 3 characters long.' });
    }

    const movie = await getMovieById(mId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    const review = await createReview(userId, mId, reviewText.trim());

    return res.status(201).json({
      message: 'Review posted successfully.',
      review,
    });
  } catch (err: any) {
    console.error('Create review error:', err);
    return res.status(500).json({ error: 'Failed to post review.' });
  }
});

// PUT /api/reviews/:id
apiRouter.put('/reviews/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { reviewText } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid review ID.' });
    }
    if (!reviewText || !reviewText.trim()) {
      return res.status(400).json({ error: 'Review text cannot be empty.' });
    }

    const isAdmin = req.user!.role === 'admin';
    const updated = await updateReview(id, req.user!.id, reviewText.trim(), isAdmin);

    if (!updated) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    return res.json({
      message: 'Review updated successfully.',
      review: updated,
    });
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      return res.status(403).json({ error: err.message });
    }
    console.error('Update review error:', err);
    return res.status(500).json({ error: 'Failed to update review.' });
  }
});

// DELETE /api/reviews/:id
apiRouter.delete('/reviews/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid review ID.' });
    }

    const isAdmin = req.user!.role === 'admin';
    await deleteReview(id, req.user!.id, isAdmin);

    return res.json({ message: 'Review deleted successfully.' });
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      return res.status(403).json({ error: err.message });
    }
    console.error('Delete review error:', err);
    return res.status(500).json({ error: 'Failed to delete review.' });
  }
});

// GET /api/reviews/me
apiRouter.get('/reviews/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const reviews = await getUserReviews(userId);
    return res.json({ reviews });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch user reviews.' });
  }
});

// =============================================================
// WATCHLIST ENDPOINTS
// =============================================================

// GET /api/watchlist
apiRouter.get('/watchlist', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const watchlist = await getWatchlist(userId);
    return res.json({ watchlist });
  } catch (err: any) {
    console.error('Get watchlist error:', err);
    return res.status(500).json({ error: 'Failed to retrieve watchlist.' });
  }
});

// POST /api/watchlist
apiRouter.post('/watchlist', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { movieId } = req.body;

    const mId = parseInt(movieId, 10);
    if (isNaN(mId)) {
      return res.status(400).json({ error: 'Valid movie ID is required.' });
    }

    const movie = await getMovieById(mId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    await addToWatchlist(userId, mId);

    return res.json({
      message: 'Movie added to your watchlist.',
      in_watchlist: true,
    });
  } catch (err: any) {
    console.error('Add to watchlist error:', err);
    return res.status(500).json({ error: 'Failed to add to watchlist.' });
  }
});

// DELETE /api/watchlist/:movieId
apiRouter.delete('/watchlist/:movieId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const mId = parseInt(req.params.movieId, 10);

    if (isNaN(mId)) {
      return res.status(400).json({ error: 'Valid movie ID is required.' });
    }

    await removeFromWatchlist(userId, mId);

    return res.json({
      message: 'Movie removed from your watchlist.',
      in_watchlist: false,
    });
  } catch (err: any) {
    console.error('Remove from watchlist error:', err);
    return res.status(500).json({ error: 'Failed to remove from watchlist.' });
  }
});

// =============================================================
// ADMINISTRATOR DASHBOARD ENDPOINTS
// =============================================================

// GET /api/admin/stats
apiRouter.get('/admin/stats', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const stats = await getAdminStats();
    return res.json({ stats });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve admin statistics.' });
  }
});

// GET /api/admin/users
apiRouter.get('/admin/users', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const users = await getAllUsers();
    return res.json({ users });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve user list.' });
  }
});

// GET /api/admin/reviews
apiRouter.get('/admin/reviews', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const reviews = await getReviews();
    return res.json({ reviews });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve all reviews.' });
  }
});
