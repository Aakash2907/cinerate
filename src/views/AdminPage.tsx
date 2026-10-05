import React, { useState, useEffect } from 'react';
import {
  Shield,
  Film,
  Users,
  MessageSquare,
  Star,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { MovieItem, ReviewItem, UserProfile, api } from '../lib/api.ts';
import { getMoviePosterUrl } from '../lib/movieImages.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { MovieFormModal } from '../components/MovieFormModal.tsx';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.tsx';

interface AdminPageProps {
  onSelectMovie: (movieId: number) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onSelectMovie }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'movies' | 'reviews' | 'users'>('movies');
  const [stats, setStats] = useState<{
    totalMovies: number;
    totalUsers: number;
    totalReviews: number;
    totalRatings: number;
    avgRating: number;
  }>({
    totalMovies: 0,
    totalUsers: 0,
    totalReviews: 0,
    totalRatings: 0,
    avgRating: 0,
  });

  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search filter inside admin tables
  const [movieFilter, setMovieFilter] = useState('');

  // Movie modal
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [selectedMovieForEdit, setSelectedMovieForEdit] = useState<MovieItem | null>(null);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'movie' | 'review'; id: number; title: string } | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, moviesRes, reviewsRes, usersRes] = await Promise.all([
        api.admin.getStats(),
        api.movies.list({ limit: 100 }),
        api.admin.getReviews(),
        api.admin.getUsers(),
      ]);
      setStats(statsRes.stats);
      setMovies(moviesRes.movies);
      setReviews(reviewsRes.reviews);
      setUsers(usersRes.users);
    } catch (err: any) {
      toast(err.message || 'Failed to load admin dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleOpenAddMovie = () => {
    setSelectedMovieForEdit(null);
    setMovieModalOpen(true);
  };

  const handleOpenEditMovie = (movie: MovieItem) => {
    setSelectedMovieForEdit(movie);
    setMovieModalOpen(true);
  };

  const handleSaveMovie = async (movieData: Partial<MovieItem>) => {
    if (selectedMovieForEdit) {
      await api.movies.update(selectedMovieForEdit.id, movieData);
      toast(`Updated "${movieData.title}" successfully`, 'success');
    } else {
      await api.movies.create(movieData);
      toast(`Created "${movieData.title}" successfully`, 'success');
    }
    loadAdminData();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'movie') {
        await api.movies.delete(deleteTarget.id);
        toast(`Movie "${deleteTarget.title}" deleted`, 'info');
      } else {
        await api.reviews.delete(deleteTarget.id);
        toast('Review moderated and removed', 'info');
      }
      loadAdminData();
    } catch (err: any) {
      toast(err.message || 'Deletion failed', 'error');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="py-20 text-center glass-panel rounded-3xl border border-slate-800 max-w-md mx-auto p-8 space-y-4">
        <Shield className="w-12 h-12 text-purple-400 mx-auto" />
        <h2 className="font-heading text-2xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          You must be signed in with an administrator account to view and manage movies, reviews, and users.
        </p>
      </div>
    );
  }

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(movieFilter.toLowerCase()) ||
    m.genre.toLowerCase().includes(movieFilter.toLowerCase()) ||
    m.director.toLowerCase().includes(movieFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            Portal Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Maintain movie catalog titles, moderate community reviews, and oversee user accounts.
          </p>
        </div>

        <button
          onClick={handleOpenAddMovie}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Movie</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Movies</span>
            <Film className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-heading text-2xl font-extrabold text-white">{stats.totalMovies}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="font-heading text-2xl font-extrabold text-white">{stats.totalUsers}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Reviews Posted</span>
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <p className="font-heading text-2xl font-extrabold text-white">{stats.totalReviews}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Ratings</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="font-heading text-2xl font-extrabold text-white">{stats.totalRatings}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Avg Platform Rating</span>
            <Star className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-heading text-2xl font-extrabold text-emerald-400">{stats.avgRating} / 5</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('movies')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'movies'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          Movie Catalog ({movies.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'reviews'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          Review Moderation ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          User Accounts ({users.length})
        </button>
      </div>

      {/* TAB 1: MOVIES MANAGEMENT */}
      {activeTab === 'movies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog titles..."
                value={movieFilter}
                onChange={(e) => setMovieFilter(e.target.value)}
                className="w-full bg-slate-900 text-xs text-white placeholder-slate-500 pl-10 pr-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400"
              />
            </div>
            <span className="text-xs text-slate-400">
              Showing {filteredMovies.length} of {movies.length} movies
            </span>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Movie</th>
                    <th className="p-4">Year & Genre</th>
                    <th className="p-4">Director</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Featured</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMovies.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getMoviePosterUrl(m)}
                            alt={m.title}
                            className="w-10 h-14 object-cover rounded-lg shrink-0 bg-slate-950"
                          />
                          <div>
                            <span
                              onClick={() => onSelectMovie(m.id)}
                              className="font-bold text-white hover:text-amber-400 cursor-pointer text-sm"
                            >
                              {m.title}
                            </span>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">{m.duration}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">
                        <div>{m.release_year}</div>
                        <div className="text-[11px] text-slate-500">{m.genre}</div>
                      </td>
                      <td className="p-4 text-slate-300">{m.director}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 font-semibold text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{m.average_rating > 0 ? m.average_rating.toFixed(1) : 'NR'}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({m.rating_count})</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {m.featured ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            YES
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">No</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditMovie(m)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                            title="Edit Movie"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTarget({ type: 'movie', id: m.id, title: m.title });
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 transition-colors"
                            title="Delete Movie"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REVIEW MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Movie</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">Review Text</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-semibold text-white whitespace-nowrap">
                        <span
                          onClick={() => onSelectMovie(r.movie_id)}
                          className="hover:text-amber-400 cursor-pointer"
                        >
                          {r.movie_title}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 whitespace-nowrap">
                        <div>{r.user_name}</div>
                        <div className="text-[10px] text-slate-500">{r.user_email}</div>
                      </td>
                      <td className="p-4 text-slate-300 max-w-sm">
                        <p className="line-clamp-2">{r.review_text}</p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {r.user_rating ? (
                          <div className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{r.user_rating}/5</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setDeleteTarget({ type: 'review', id: r.id, title: `Review by ${r.user_name}` });
                            setDeleteModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 border border-rose-600/30 text-rose-300 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USERS LIST */}
      {activeTab === 'users' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Member Since</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-bold text-slate-950 text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      <MovieFormModal
        isOpen={movieModalOpen}
        movie={selectedMovieForEdit}
        onClose={() => setMovieModalOpen(false)}
        onSubmit={handleSaveMovie}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title={deleteTarget?.type === 'movie' ? 'Delete Movie' : 'Moderate Review'}
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete Permanently"
        onConfirm={confirmDelete}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};
