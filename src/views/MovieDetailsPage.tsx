import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Play,
  Bookmark,
  Share2,
  Check,
  Calendar,
  Clock,
  Globe,
  Film,
  Users,
  MessageSquarePlus,
  Edit2,
  Trash2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { MovieItem, ReviewItem, api } from '../lib/api.ts';
import { recordRecentlyViewedMovie } from '../lib/recentlyViewed.ts';
import { copyToClipboard, getMovieShareUrl } from '../lib/clipboard.ts';
import { getMoviePosterUrl, getMovieBackdropUrl } from '../lib/movieImages.ts';
import { RatingStars } from '../components/RatingStars.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.tsx';

interface MovieDetailsPageProps {
  movieId: number;
  onBack: () => void;
  onPlayTrailer: (movie: MovieItem) => void;
}

export const MovieDetailsPage: React.FC<MovieDetailsPageProps> = ({
  movieId,
  onBack,
  onPlayTrailer,
}) => {
  const { user, openAuthModal, refreshUser } = useAuth();
  const { toast } = useToast();

  const [movie, setMovie] = useState<MovieItem | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // User Rating State
  const [userRating, setUserRating] = useState<number>(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);

  // Review State
  const [newReviewText, setNewReviewText] = useState<string>('');
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);

  const [inWatchlist, setInWatchlist] = useState<boolean>(false);
  const [isUpdatingWatchlist, setIsUpdatingWatchlist] = useState<boolean>(false);

  const loadMovieDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.movies.get(movieId);
      if (!data || !data.movie) {
        setError('Movie details could not be found.');
        return;
      }
      setMovie(data.movie);
      recordRecentlyViewedMovie(data.movie);
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      setInWatchlist(Boolean(data.movie?.in_watchlist));
      const savedRating = data.movie?.user_rating || api.ratings.getLocalRating(movieId);
      if (savedRating) {
        setUserRating(savedRating);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load movie details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovieDetails();
  }, [movieId]);

  // Handle Rating Click
  const handleRateMovie = async (ratingVal: number) => {
    setIsSubmittingRating(true);
    try {
      const res = await api.ratings.rate(movieId, ratingVal);
      setUserRating(res.user_rating);
      if (movie) {
        setMovie({
          ...movie,
          average_rating: res.average_rating,
          rating_count: res.rating_count,
          user_rating: res.user_rating,
        });
      }
      toast(`You rated "${movie?.title}" ${ratingVal} star${ratingVal > 1 ? 's' : ''}!`, 'success');
      if (user) {
        refreshUser();
      }
    } catch (err: any) {
      toast(err.message || 'Failed to submit rating', 'error');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Handle Watchlist toggle
  const handleWatchlistToggle = async () => {
    if (!user) {
      toast('Please sign in to manage your watchlist', 'info');
      openAuthModal('login');
      return;
    }

    if (isUpdatingWatchlist || !movie) return;
    setIsUpdatingWatchlist(true);

    try {
      if (inWatchlist) {
        await api.watchlist.remove(movie.id);
        setInWatchlist(false);
        toast(`Removed "${movie.title}" from watchlist`, 'info');
      } else {
        await api.watchlist.add(movie.id);
        setInWatchlist(true);
        toast(`Added "${movie.title}" to watchlist!`, 'success');
      }
      refreshUser();
    } catch (err: any) {
      toast(err.message || 'Failed to update watchlist', 'error');
    } finally {
      setIsUpdatingWatchlist(false);
    }
  };

  // Submit new review
  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!newReviewText.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await api.reviews.create(movieId, newReviewText.trim());
      setReviews([res.review, ...reviews]);
      setNewReviewText('');
      toast('Your review was published!', 'success');
      refreshUser();
    } catch (err: any) {
      toast(err.message || 'Failed to publish review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Save edited review
  const handleUpdateReview = async (reviewId: number) => {
    if (!editingText.trim()) return;

    try {
      const res = await api.reviews.update(reviewId, editingText.trim());
      setReviews(reviews.map((r) => (r.id === reviewId ? res.review : r)));
      setEditingReviewId(null);
      setEditingText('');
      toast('Review updated successfully!', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to update review', 'error');
    }
  };

  // Delete review
  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    try {
      await api.reviews.delete(reviewToDelete);
      setReviews(reviews.filter((r) => r.id !== reviewToDelete));
      toast('Review deleted successfully', 'info');
      refreshUser();
    } catch (err: any) {
      toast(err.message || 'Failed to delete review', 'error');
    }
  };

  // Copy share link
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const handleShare = async () => {
    const shareUrl = getMovieShareUrl(movieId);
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopiedLink(true);
      toast(`Link for "${movie?.title || 'movie'}" copied to clipboard!`, 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      toast('Failed to copy link. Please copy directly from browser address bar.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Loading film details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="py-20 text-center glass-panel rounded-3xl border border-slate-800 max-w-md mx-auto p-8">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="font-heading font-bold text-xl text-white mb-2">Movie Not Found</h3>
        <p className="text-xs text-slate-400 mb-6">{error || 'This title could not be retrieved.'}</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
        >
          Return to Movies
        </button>
      </div>
    );
  }

  const userExistingReview = user ? reviews.find((r) => r.user_id === user.id) : null;
  const otherReviews = user ? reviews.filter((r) => r.user_id !== user.id) : reviews;

  const clipPoster = getMoviePosterUrl(movie);
  const clipBackdrop = getMovieBackdropUrl(movie);

  return (
    <div className="space-y-12 pb-24">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Catalog</span>
        </button>

        <button
          onClick={handleShare}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
            copiedLink
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
          title="Copy Link to Movie"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* ========================================================
          HERO BACKDROP & MAIN DETAILS
      ======================================================== */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl">
        {/* Backdrop Banner Image */}
        <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden bg-slate-950">
          {clipBackdrop ? (
            <img
              src={clipBackdrop}
              alt={movie.title}
              className="w-full h-full object-cover filter brightness-75"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-950">
              <Film className="w-20 h-20 text-slate-800 stroke-[1]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        {/* Content Layout */}
        <div className="relative p-6 sm:p-10 -mt-28 sm:-mt-36 z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster Column */}
            <div className="w-44 sm:w-56 lg:w-64 shrink-0 mx-auto md:mx-0 shadow-2xl rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-slate-900 aspect-[2/3] flex items-center justify-center">
              {clipPoster ? (
                <img
                  src={clipPoster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center bg-gradient-to-b from-slate-900 to-slate-950 select-none">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-3 shadow-inner">
                    <Film className="w-7 h-7 stroke-[1.5]" />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-slate-300 leading-snug line-clamp-2 px-1">
                    {movie.title}
                  </h4>
                  <span className="text-[11px] text-slate-500 mt-1">
                    {movie.release_year} • {movie.genre}
                  </span>
                  <span className="mt-3 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/50">
                    Poster Unavailable
                  </span>
                </div>
              )}
            </div>

            {/* Movie Info Column */}
            <div className="flex-1 space-y-4">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  {movie.genre}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {movie.release_year}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {movie.duration}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {movie.language}
                </span>
                {movie.featured && (
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Featured Spotlight
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
                {movie.title}
              </h1>

              {/* Average Rating Display */}
              <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-4 max-w-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <RatingStars rating={movie.average_rating || 0} size="md" />
                    <span className="font-bold text-amber-400 text-lg">
                      {movie.average_rating > 0 ? movie.average_rating.toFixed(1) : 'NR'}
                      <span className="text-slate-400 text-xs font-normal"> / 5.0</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Based on <strong>{(movie.rating_count || 0).toLocaleString()}</strong> community ratings
                  </p>
                </div>

                {/* User Interactive Rating Widget */}
                <div className="border-l border-slate-800 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      {userRating > 0 ? `Your Rating: ${userRating}/5` : 'Rate this film'}
                    </span>
                    {userRating > 0 && (
                      <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                        Saved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <RatingStars
                      rating={userRating}
                      interactive={true}
                      onRate={handleRateMovie}
                      size="md"
                    />
                    {isSubmittingRating && (
                      <span className="text-xs text-amber-400 animate-pulse">Saving...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2 flex-wrap">
                {movie.trailer_url && (
                  <button
                    onClick={() => onPlayTrailer(movie)}
                    className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 transform active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>Watch Trailer</span>
                  </button>
                )}

                <button
                  onClick={handleWatchlistToggle}
                  disabled={isUpdatingWatchlist}
                  className={`px-5 py-3 rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 text-sm font-semibold border ${
                    inWatchlist
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className={`px-5 py-3 rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 text-sm font-semibold border ${
                    copiedLink
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                  title="Copy share link for this film"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-slate-400" />
                      <span>Share Film</span>
                    </>
                  )}
                </button>
              </div>

              {/* Synopsis */}
              <div className="pt-4 space-y-2">
                <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider">
                  Storyline & Synopsis
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                  {movie.description}
                </p>
              </div>

              {/* Credits Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    Director
                  </span>
                  <p className="text-sm font-medium text-white">{movie.director}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    Starring Cast
                  </span>
                  <p className="text-sm font-medium text-white">{movie.cast_members || 'Ensemble cast'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          RATING & REVIEW SECTION
      ======================================================== */}
      <section className="space-y-8">
        <div className="border-b border-slate-800/80 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">Community Reviews</h2>
              <p className="text-xs text-slate-400">
                Read authentic critique from CineRate verified moviegoers
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
          </span>
        </div>

        {/* Write / Edit Personal Review Form */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              {userExistingReview ? 'Your Personal Review' : 'Write a Review for this Movie'}
            </h3>
            {user && (
              <span className="text-xs text-slate-400">
                Posting as <strong className="text-amber-400">{user.name}</strong>
              </span>
            )}
          </div>

          {!user ? (
            <div className="p-6 text-center rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <p className="text-xs text-slate-400">
                You must be logged in to share your thoughts and critique with the community.
              </p>
              <button
                onClick={() => openAuthModal('login')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
              >
                Sign In to Review
              </button>
            </div>
          ) : userExistingReview && editingReviewId !== userExistingReview.id ? (
            /* User's Existing Review Display */
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    YOUR REVIEW
                  </span>
                  {userExistingReview.user_rating && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{userExistingReview.user_rating}/5</span>
                    </div>
                  )}
                  <span className="text-[11px] text-slate-500">
                    {new Date(userExistingReview.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingReviewId(userExistingReview.id);
                      setEditingText(userExistingReview.review_text);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs flex items-center gap-1 transition-colors"
                    title="Edit Review"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setReviewToDelete(userExistingReview.id);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 text-xs flex items-center gap-1 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {userExistingReview.review_text}
              </p>
            </div>
          ) : (
            /* Review Text Input Form */
            <form onSubmit={handleCreateReview} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="Share your thoughts on the cinematography, acting performances, plot twists, soundtrack..."
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                className="w-full bg-slate-950 text-sm text-white placeholder-slate-500 p-4 rounded-2xl border border-slate-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 leading-relaxed"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Minimum 10 characters</span>
                <button
                  type="submit"
                  disabled={isSubmittingReview || newReviewText.trim().length < 10}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Publishing...' : 'Publish Review'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Community Reviews List */}
        <div className="space-y-4">
          {otherReviews.length === 0 && !userExistingReview ? (
            <div className="py-12 text-center glass-panel rounded-3xl border border-slate-800 p-6">
              <MessageSquarePlus className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-300">No Reviews Yet</h4>
              <p className="text-xs text-slate-500 mt-1">
                Be the first moviegoer to leave a review for "{movie.title}"!
              </p>
            </div>
          ) : (
            otherReviews.map((rev) => (
              <div
                key={rev.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs shadow">
                      {rev.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{rev.user_name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {rev.user_rating && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rev.user_rating}/5</span>
                      </div>
                    )}

                    {/* Admin Delete Action */}
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => {
                          setReviewToDelete(rev.id);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 text-xs flex items-center gap-1 transition-colors"
                        title="Admin: Delete Inappropriate Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Moderate</span>
                      </button>
                    )}
                  </div>
                </div>

                {editingReviewId === rev.id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full bg-slate-950 text-sm text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingReviewId(null)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateReview(rev.id)}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {rev.review_text}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Review"
        message="Are you sure you want to remove this review? This action cannot be undone."
        confirmLabel="Delete Review"
        onConfirm={confirmDeleteReview}
        onClose={() => {
          setDeleteModalOpen(false);
          setReviewToDelete(null);
        }}
      />
    </div>
  );
};
