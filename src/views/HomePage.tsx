import React, { useState, useEffect } from 'react';
import {
  Play,
  Bookmark,
  Star,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  Compass,
  Search,
  History,
  Trash2,
  X,
} from 'lucide-react';
import { MovieItem, api } from '../lib/api.ts';
import { useRecentlyViewed } from '../lib/recentlyViewed.ts';
import { getMovieBackdropUrl } from '../lib/movieImages.ts';
import { MovieCard } from '../components/MovieCard.tsx';
import { RatingStars } from '../components/RatingStars.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface HomePageProps {
  onSelectMovie: (movieId: number) => void;
  onNavigate: (view: string, data?: any) => void;
  onPlayTrailer: (movie: MovieItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectMovie,
  onNavigate,
  onPlayTrailer,
}) => {
  const { user, openAuthModal, refreshUser } = useAuth();
  const { toast } = useToast();
  const { recentlyViewed, clearHistory, removeMovie } = useRecentlyViewed();

  const [featuredMovies, setFeaturedMovies] = useState<MovieItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MovieItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MovieItem[]>([]);
  const [recentMovies, setRecentMovies] = useState<MovieItem[]>([]);
  const [tamilMovies, setTamilMovies] = useState<MovieItem[]>([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [homeSearchInput, setHomeSearchInput] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [featRes, popRes, topRes, recRes, tamRes] = await Promise.all([
        api.movies.list({ featured: true, limit: 5 }),
        api.movies.list({ sort: 'popular', limit: 8 }),
        api.movies.list({ sort: 'rating', limit: 8 }),
        api.movies.list({ sort: 'newest', limit: 8 }),
        api.movies.list({ language: 'Tamil', limit: 8 }),
      ]);

      const feats = featRes.movies.length > 0 ? featRes.movies : popRes.movies.slice(0, 3);
      setFeaturedMovies(feats);
      setPopularMovies(popRes.movies);
      setTopRatedMovies(topRes.movies);
      setRecentMovies(recRes.movies);
      setTamilMovies(tamRes.movies);
    } catch (err) {
      console.error('Failed to load homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const heroMovie = featuredMovies[activeHeroIndex] || popularMovies[0];

  const handleHeroWatchlistToggle = async () => {
    if (!heroMovie) return;
    if (!user) {
      toast('Please sign in to add movies to your watchlist', 'info');
      openAuthModal('login');
      return;
    }

    try {
      if (heroMovie.in_watchlist) {
        await api.watchlist.remove(heroMovie.id);
        heroMovie.in_watchlist = false;
        toast(`Removed "${heroMovie.title}" from watchlist`, 'info');
      } else {
        await api.watchlist.add(heroMovie.id);
        heroMovie.in_watchlist = true;
        toast(`Added "${heroMovie.title}" to your watchlist!`, 'success');
      }
      setFeaturedMovies([...featuredMovies]);
      refreshUser();
    } catch (err: any) {
      toast(err.message || 'Error updating watchlist', 'error');
    }
  };

  const genres = [
    { name: 'Sci-Fi', count: '120+ Movies', gradient: 'from-blue-600/30 to-indigo-900/40', border: 'border-blue-500/30' },
    { name: 'Action', count: '240+ Movies', gradient: 'from-amber-600/30 to-red-900/40', border: 'border-amber-500/30' },
    { name: 'Drama', count: '310+ Movies', gradient: 'from-emerald-600/30 to-teal-900/40', border: 'border-emerald-500/30' },
    { name: 'Fantasy', count: '95+ Movies', gradient: 'from-purple-600/30 to-violet-900/40', border: 'border-purple-500/30' },
    { name: 'Thriller', count: '180+ Movies', gradient: 'from-rose-600/30 to-pink-900/40', border: 'border-rose-500/30' },
    { name: 'Mystery', count: '110+ Movies', gradient: 'from-cyan-600/30 to-sky-900/40', border: 'border-cyan-500/30' },
  ];

  const handleHomeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearchInput.trim()) {
      onNavigate('movies', { search: homeSearchInput.trim() });
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* ========================================================
          HERO SHOWCASE SECTION
      ======================================================== */}
      {heroMovie && (
        <section className="relative w-full min-h-[550px] lg:min-h-[640px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-950 flex flex-col justify-end">
          {/* Backdrop Image with Multi-layer Gradient */}
          <div className="absolute inset-0">
            <img
              src={getMovieBackdropUrl(heroMovie)}
              alt={heroMovie.title}
              className="w-full h-full object-cover object-center filter brightness-90 transform scale-105 transition-transform duration-1000"
            />
            {/* Dark Cinematic Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          {/* Hero Content Overlay */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-3xl flex flex-col gap-4">
            {/* Tagline / Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20">
                <Sparkles className="w-3.5 h-3.5 fill-black" />
                Featured Spotlight
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 text-xs font-semibold">
                {heroMovie.release_year}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 text-xs font-semibold">
                {heroMovie.genre}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 text-xs font-semibold">
                {heroMovie.language}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
              {heroMovie.title}
            </h1>

            {/* Rating Stars & Count */}
            <div className="flex items-center gap-3">
              <RatingStars rating={heroMovie.average_rating || 0} size="md" />
              <span className="text-amber-400 font-bold text-base">
                {heroMovie.average_rating > 0 ? heroMovie.average_rating.toFixed(1) : 'NR'}
                <span className="text-slate-400 font-normal text-xs">/5.0</span>
              </span>
              <span className="text-xs text-slate-400">
                ({heroMovie.rating_count} community {heroMovie.rating_count === 1 ? 'rating' : 'ratings'})
              </span>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed max-w-2xl">
              {heroMovie.description}
            </p>

            {/* Metadata info */}
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span>
                Directed by <strong className="text-slate-200 font-semibold">{heroMovie.director}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {heroMovie.duration}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3.5 pt-3 flex-wrap">
              <button
                onClick={() => onSelectMovie(heroMovie.id)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2 transform active:scale-95"
              >
                <span>View Full Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {heroMovie.trailer_url && (
                <button
                  onClick={() => onPlayTrailer(heroMovie)}
                  className="px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700/80 backdrop-blur-md transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Watch Trailer</span>
                </button>
              )}

              <button
                onClick={handleHeroWatchlistToggle}
                className={`px-4 py-3.5 rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 text-sm font-semibold border ${
                  heroMovie.in_watchlist
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-900/60 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${heroMovie.in_watchlist ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{heroMovie.in_watchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>
          </div>

          {/* Hero Carousel Navigation Dots */}
          {featuredMovies.length > 1 && (
            <div className="relative z-10 p-6 flex items-center justify-end gap-2">
              {featuredMovies.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveHeroIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeHeroIndex ? 'w-8 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ========================================================
          PROMINENT SEARCH BANNER
      ======================================================== */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
            <Compass className="w-3.5 h-3.5" />
            <span>Smart Movie Search & Filters</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Find Any Movie in Seconds
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Search across our verified catalog by title, director, cast members, release year, or filter by your preferred genres and minimum ratings.
          </p>

          <form onSubmit={handleHomeSearch} className="max-w-xl mx-auto flex items-center gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Try searching 'Interstellar', 'Sci-Fi', 'Christopher Nolan'..."
                value={homeSearchInput}
                onChange={(e) => setHomeSearchInput(e.target.value)}
                className="w-full bg-slate-950 text-sm text-white placeholder-slate-500 pl-12 pr-4 py-3.5 rounded-2xl border border-slate-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all shrink-0"
            >
              Explore
            </button>
          </form>
        </div>
      </section>

      {/* ========================================================
          RECENTLY VIEWED SECTION (Last 5 clicked in current session)
      ======================================================== */}
      {recentlyViewed.length > 0 ? (
        <section className="space-y-6 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <History className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-2xl font-bold text-white">Recently Viewed</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    {recentlyViewed.length} of 5 in Session
                  </span>
                </div>
                <p className="text-xs text-slate-400">The last 5 movies you clicked and explored during this visit</p>
              </div>
            </div>

            <button
              onClick={() => {
                clearHistory();
                toast('Recently viewed history cleared for this session', 'info');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold text-slate-400 hover:text-rose-300 transition-all active:scale-95 cursor-pointer"
              title="Clear session viewing history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {recentlyViewed.map((movie, index) => (
              <div key={movie.id} className="relative group/recent">
                {/* Visual Position Badge */}
                <div className="absolute top-2 left-2 z-20 pointer-events-none">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md backdrop-blur-md ${
                    index === 0
                      ? 'bg-amber-500 text-slate-950 ring-1 ring-amber-300'
                      : 'bg-slate-900/90 text-slate-300 border border-slate-700/80'
                  }`}>
                    {index === 0 ? '★ Latest' : `#${index + 1}`}
                  </span>
                </div>

                {/* Quick Remove from Session Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMovie(movie.id);
                  }}
                  className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-slate-950/85 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-700 flex items-center justify-center opacity-0 group-hover/recent:opacity-100 transition-all duration-200 shadow-xl cursor-pointer"
                  title="Remove from recently viewed"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <MovieCard
                  movie={movie}
                  onSelect={onSelectMovie}
                  onPlayTrailer={onPlayTrailer}
                />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="p-4 sm:p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800/60 text-slate-400 flex items-center justify-center border border-slate-700/40">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-200">Recently Viewed</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60">0/5</span>
              </div>
              <p className="text-xs text-slate-400">Click on any film below to track your last 5 viewed titles during this session.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('movies', { sort: 'popular' })}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Start Exploring</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* ========================================================
          POPULAR MOVIES SECTION
      ======================================================== */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">Popular Movies</h2>
              <p className="text-xs text-slate-400">Most engaged and viewed titles across the community</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('movies', { sort: 'popular' })}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-slate-900/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {popularMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={onSelectMovie}
                onPlayTrailer={onPlayTrailer}
              />
            ))}
          </div>
        )}
      </section>

      {/* ========================================================
          BROWSE BY GENRE
      ======================================================== */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">Browse by Genre</h2>
              <p className="text-xs text-slate-400">Explore cinematic worlds categorized by their core styles</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('genres')}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            <span>All Genres</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {genres.map((g) => (
            <div
              key={g.name}
              onClick={() => onNavigate('movies', { genre: g.name })}
              className={`p-5 rounded-2xl bg-gradient-to-br ${g.gradient} border ${g.border} hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg flex flex-col justify-between min-h-[110px] group`}
            >
              <div>
                <span className="font-heading font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                  {g.name}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">{g.count}</p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold pt-2">
                <span>Explore</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          TOP RATED MOVIES SECTION
      ======================================================== */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">Top Rated Movies</h2>
              <p className="text-xs text-slate-400">Critically acclaimed titles with highest verified ratings</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('movies', { sort: 'rating' })}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View Rankings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {topRatedMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={onSelectMovie}
              onPlayTrailer={onPlayTrailer}
            />
          ))}
        </div>
      </section>

      {/* ========================================================
          TAMIL & INDIAN CINEMA SECTION
      ======================================================== */}
      {tamilMovies.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">Tamil & Indian Cinema</h2>
                <p className="text-xs text-slate-400">Discover 100+ celebrated Tamil hits, Pan-Indian blockbusters, and classics</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('movies', { language: 'Tamil' })}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Explore 100+ Tamil Films</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {tamilMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={onSelectMovie}
                onPlayTrailer={onPlayTrailer}
              />
            ))}
          </div>
        </section>
      )}

      {/* ========================================================
          RECENTLY ADDED MOVIES SECTION
      ======================================================== */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">Recently Added</h2>
              <p className="text-xs text-slate-400">Fresh additions to our ever-expanding movie database</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('movies', { sort: 'newest' })}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View Newest</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {recentMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={onSelectMovie}
              onPlayTrailer={onPlayTrailer}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
