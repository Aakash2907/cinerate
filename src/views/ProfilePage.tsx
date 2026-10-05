import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Calendar,
  Star,
  MessageSquare,
  Bookmark,
  Shield,
  Edit2,
  Trash2,
  Save,
  CheckCircle,
} from 'lucide-react';
import { MovieItem, ReviewItem, api } from '../lib/api.ts';
import { getMoviePosterUrl } from '../lib/movieImages.ts';
import { RatingStars } from '../components/RatingStars.tsx';
import { MovieCard } from '../components/MovieCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.tsx';

interface ProfilePageProps {
  onSelectMovie: (movieId: number) => void;
  onPlayTrailer: (movie: MovieItem) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onSelectMovie,
  onPlayTrailer,
}) => {
  const { user, updateProfile, refreshUser, openAuthModal } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'watchlist' | 'reviews' | 'ratings' | 'settings'>('watchlist');
  const [watchlist, setWatchlist] = useState<MovieItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [ratings, setRatings] = useState<Array<{ id: number; movie_id: number; rating: number; movie: MovieItem }>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Profile Settings Form
  const [nameInput, setNameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Review Edit/Delete
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editingReviewText, setEditingReviewText] = useState<string>('');
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      setNameInput(user.name);
      setEmailInput(user.email);
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [wlData, revData, ratData] = await Promise.all([
        api.watchlist.get(),
        api.reviews.getMyReviews(),
        api.ratings.getMyRatings(),
      ]);
      setWatchlist(wlData.watchlist);
      setReviews(revData.reviews);
      setRatings(ratData.ratings);
    } catch (err: any) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setIsSavingProfile(true);
    try {
      await updateProfile(nameInput.trim(), emailInput.trim());
      toast('Profile details updated successfully!', 'success');
      refreshUser();
    } catch (err: any) {
      toast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdateReview = async (id: number) => {
    if (!editingReviewText.trim()) return;
    try {
      const res = await api.reviews.update(id, editingReviewText.trim());
      setReviews(reviews.map((r) => (r.id === id ? res.review : r)));
      setEditingReviewId(null);
      toast('Review updated successfully!', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to update review', 'error');
    }
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    try {
      await api.reviews.delete(reviewToDelete);
      setReviews(reviews.filter((r) => r.id !== reviewToDelete));
      toast('Review deleted', 'info');
      refreshUser();
    } catch (err: any) {
      toast(err.message || 'Failed to delete review', 'error');
    }
  };

  const handleUpdateRating = async (movieId: number, newRating: number) => {
    try {
      const res = await api.ratings.rate(movieId, newRating);
      setRatings(
        ratings.map((r) =>
          r.movie_id === movieId ? { ...r, rating: res.user_rating } : r
        )
      );
      toast(`Rating updated to ${newRating} stars`, 'success');
      refreshUser();
    } catch (err: any) {
      toast(err.message || 'Failed to update rating', 'error');
    }
  };

  if (!user) {
    return (
      <div className="py-20 text-center glass-panel rounded-3xl border border-slate-800 max-w-md mx-auto p-8 space-y-4">
        <User className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="font-heading text-2xl font-bold text-white">Profile Login Required</h2>
        <p className="text-xs text-slate-400">Please sign in to access your account profile, ratings, and reviews.</p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Profile Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 p-1 shadow-xl shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center font-heading font-extrabold text-3xl text-amber-400">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                {user.name}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  user.role === 'admin'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                    : 'bg-amber-500/20 border-amber-500 text-amber-300'
                }`}
              >
                {user.role} Member
              </span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user.email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Joined{' '}
                {new Date(user.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Quick Stat Badges */}
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-3 flex-wrap">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-white">{watchlist.length}</span>
                <span className="text-[11px] text-slate-400">Watchlist</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-white">{ratings.length}</span>
                <span className="text-[11px] text-slate-400">Rated</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-white">{reviews.length}</span>
                <span className="text-[11px] text-slate-400">Reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'watchlist'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>My Watchlist ({watchlist.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('ratings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'ratings'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>My Ratings ({ratings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'reviews'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>My Reviews ({reviews.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'settings'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Account Settings</span>
        </button>
      </div>

      {/* Tab 1: Watchlist */}
      {activeTab === 'watchlist' && (
        <div>
          {watchlist.length === 0 ? (
            <div className="py-16 text-center glass-panel rounded-3xl border border-slate-800 p-8">
              <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Your watchlist is currently empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {watchlist.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onSelect={onSelectMovie}
                  onPlayTrailer={onPlayTrailer}
                  onWatchlistChange={() => loadUserData()}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Ratings */}
      {activeTab === 'ratings' && (
        <div className="space-y-4">
          {ratings.length === 0 ? (
            <div className="py-16 text-center glass-panel rounded-3xl border border-slate-800 p-8">
              <Star className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">You haven't rated any movies yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ratings.map(({ movie_id, rating, movie }) => (
                <div
                  key={movie_id}
                  className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-4"
                >
                  <img
                    src={getMoviePosterUrl(movie)}
                    alt={movie?.title}
                    onClick={() => onSelectMovie(movie_id)}
                    className="w-14 h-20 object-cover rounded-xl shrink-0 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4
                      onClick={() => onSelectMovie(movie_id)}
                      className="font-heading font-bold text-sm text-white hover:text-amber-400 cursor-pointer truncate"
                    >
                      {movie?.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {movie?.release_year} • {movie?.genre}
                    </p>

                    <div className="pt-2 flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Your Rating:</span>
                      <RatingStars
                        rating={rating}
                        interactive={true}
                        onRate={(val) => handleUpdateRating(movie_id, val)}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="py-16 text-center glass-panel rounded-3xl border border-slate-800 p-8">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">You haven't published any reviews yet.</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    {rev.movie_poster && (
                      <img
                        src={rev.movie_poster}
                        alt={rev.movie_title}
                        onClick={() => onSelectMovie(rev.movie_id)}
                        className="w-10 h-14 object-cover rounded-lg shrink-0 cursor-pointer"
                      />
                    )}
                    <div>
                      <h4
                        onClick={() => onSelectMovie(rev.movie_id)}
                        className="font-heading font-bold text-sm text-white hover:text-amber-400 cursor-pointer"
                      >
                        {rev.movie_title}
                      </h4>
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
                    <button
                      onClick={() => {
                        setEditingReviewId(rev.id);
                        setEditingReviewText(rev.review_text);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setReviewToDelete(rev.id);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {editingReviewId === rev.id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={editingReviewText}
                      onChange={(e) => setEditingReviewText(e.target.value)}
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
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    {rev.review_text}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Account Settings */}
      {activeTab === 'settings' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-xl">
          <h3 className="font-heading font-bold text-lg text-white mb-4">Edit Profile Information</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-slate-950 text-sm text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-slate-950 text-sm text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Review Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
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
