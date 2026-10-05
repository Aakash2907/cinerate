import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  LayoutGrid,
  List,
  Compass,
  Film,
} from 'lucide-react';
import { MovieItem, api } from '../lib/api.ts';
import { MovieCard } from '../components/MovieCard.tsx';
import { RatingStars } from '../components/RatingStars.tsx';
import { getMoviePosterUrl } from '../lib/movieImages.ts';
import { useCatalog, CatalogFilters } from '../context/CatalogContext.tsx';

interface MoviesPageProps {
  initialFilter?: Partial<CatalogFilters>;
  onSelectMovie: (movieId: number) => void;
  onPlayTrailer: (movie: MovieItem) => void;
}

export const MoviesPage: React.FC<MoviesPageProps> = ({
  initialFilter,
  onSelectMovie,
  onPlayTrailer,
}) => {
  const {
    search,
    genre,
    language,
    year,
    minRating,
    sort,
    currentPage,
    viewMode,
    catalogScrollY,
    setSearch,
    setGenre,
    setLanguage,
    setYear,
    setMinRating,
    setSort,
    setCurrentPage,
    setViewMode,
    setCatalogScrollY,
    updateFilters,
    resetFilters,
    hasActiveFilters,
  } = useCatalog();

  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 24;

  // Local state for smooth typing in search input
  const [searchInput, setSearchInput] = useState<string>(search);

  // Synchronize local input if context search changed externally
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounced search query update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update if initialFilter is explicitly supplied from external props
  useEffect(() => {
    if (initialFilter && Object.keys(initialFilter).length > 0) {
      updateFilters(initialFilter);
    }
  }, [initialFilter]);

  // Restore scroll position when returning from movie details
  useEffect(() => {
    if (catalogScrollY > 0) {
      const timer = setTimeout(() => {
        window.scrollTo({ top: catalogScrollY, behavior: 'instant' as any });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelectMovieWithScroll = (movieId: number) => {
    setCatalogScrollY(window.scrollY);
    onSelectMovie(movieId);
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const data = await api.movies.list({
        search: search.trim() || undefined,
        genre: genre !== 'all' ? genre : undefined,
        language: language !== 'all' ? language : undefined,
        year: year !== 'all' ? year : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        sort,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      });
      setMovies(data.movies);
      setTotalCount(data.total);
    } catch (err) {
      console.error('Failed to fetch movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [search, genre, language, year, minRating, sort, currentPage]);

  const handleResetFilters = () => {
    setSearchInput('');
    resetFilters();
  };

  const genresList = [
    { label: 'All Genres', value: 'all' },
    { label: 'Sci-Fi', value: 'Sci-Fi' },
    { label: 'Action', value: 'Action' },
    { label: 'Drama', value: 'Drama' },
    { label: 'Thriller', value: 'Thriller' },
    { label: 'Fantasy', value: 'Fantasy' },
    { label: 'Romance', value: 'Romance' },
    { label: 'Comedy', value: 'Comedy' },
    { label: 'Mystery', value: 'Mystery' },
    { label: 'Adventure', value: 'Adventure' },
    { label: 'Crime', value: 'Crime' },
  ];

  const languagesList = [
    { label: 'All Languages', value: 'all' },
    { label: 'Tamil', value: 'Tamil' },
    { label: 'Hindi', value: 'Hindi' },
    { label: 'Telugu', value: 'Telugu' },
    { label: 'Malayalam', value: 'Malayalam' },
    { label: 'Kannada', value: 'Kannada' },
    { label: 'English', value: 'English' },
    { label: 'Japanese', value: 'Japanese' },
    { label: 'French', value: 'French' },
    { label: 'Spanish', value: 'Spanish' },
    { label: 'Korean', value: 'Korean' },
    { label: 'German', value: 'German' },
  ];

  const yearsList = [
    { label: 'All Years', value: 'all' },
    { label: '2026 (Upcoming)', value: '2026' },
    { label: '2025 (Current)', value: '2025' },
    { label: '2024', value: '2024' },
    { label: '2023', value: '2023' },
    { label: '2020 - 2022', value: '2020-2022' },
    { label: '2010s Decade', value: '2010s' },
    { label: 'Classics (< 2010)', value: 'classics' },
  ];

  const ratingsList = [
    { label: 'Any Rating', value: 0 },
    { label: '4.5+ Stars', value: 4.5 },
    { label: '4.0+ Stars', value: 4.0 },
    { label: '3.5+ Stars', value: 3.5 },
    { label: '3.0+ Stars', value: 3.0 },
  ];

  const sortOptions = [
    { label: 'Popularity & Activity', value: 'popular' },
    { label: 'Rating (High to Low)', value: 'rating' },
    { label: 'Release Date (Newest first)', value: 'newest' },
    { label: 'Release Date (Oldest first)', value: 'oldest' },
    { label: 'Alphabetical (A - Z)', value: 'alphabetical' },
    { label: 'Most Community Reviews', value: 'reviews' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Movie Catalog</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            Discover Cinema
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore {totalCount} verified movie titles with ratings, cast credits, and community reviews.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          MULTI-FACET FILTER PANEL
      ======================================================== */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
        {/* Search input bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, director, cast members, or keyword..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-slate-950 text-sm text-white placeholder-slate-500 pl-11 pr-10 py-3 rounded-2xl border border-slate-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                setSearch('');
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {/* Genre */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-slate-950 text-xs text-white px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400"
            >
              {genresList.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-950 text-xs text-white px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400"
            >
              {languagesList.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Release Year */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Release Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-slate-950 text-xs text-white px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400"
            >
              {yearsList.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Min Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="w-full bg-slate-950 text-xs text-white px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400"
            >
              {ratingsList.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-slate-950 text-xs text-white px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400 font-medium"
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Badges & Reset Button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                Active filters:
              </span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                  Search: "{search}"
                  <button onClick={() => { setSearchInput(''); setSearch(''); }}>
                    <X className="w-3 h-3 hover:text-white" />
                  </button>
                </span>
              )}
              {genre !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                  Genre: {genre}
                  <button onClick={() => setGenre('all')}>
                    <X className="w-3 h-3 hover:text-white" />
                  </button>
                </span>
              )}
              {language !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                  Language: {language}
                  <button onClick={() => setLanguage('all')}>
                    <X className="w-3 h-3 hover:text-white" />
                  </button>
                </span>
              )}
              {year !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                  Year: {year}
                  <button onClick={() => setYear('all')}>
                    <X className="w-3 h-3 hover:text-white" />
                  </button>
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                  Rating: &ge; {minRating} ★
                  <button onClick={() => setMinRating(0)}>
                    <X className="w-3 h-3 hover:text-white" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          MOVIE RESULTS DISPLAY
      ======================================================== */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-slate-900/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl border border-slate-800 max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-xl text-white mb-2">No Matching Movies Found</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            We couldn't find any movies matching your current search or filter combination.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={handleSelectMovieWithScroll}
              onPlayTrailer={onPlayTrailer}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => handleSelectMovieWithScroll(movie.id)}
              className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer group"
            >
              {getMoviePosterUrl(movie) ? (
                <img
                  src={getMoviePosterUrl(movie)}
                  alt={movie.title}
                  className="w-16 h-24 object-cover rounded-xl shrink-0 bg-slate-950"
                />
              ) : (
                <div className="w-16 h-24 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-500">
                  <Film className="w-6 h-6 stroke-[1.5]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300">{movie.release_year}</span>
                  <span>•</span>
                  <span>{movie.genre}</span>
                  <span>•</span>
                  <span>{movie.language}</span>
                  <span>•</span>
                  <span>{movie.duration}</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-white group-hover:text-amber-400 transition-colors truncate">
                  {movie.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{movie.description}</p>
              </div>

              <div className="flex flex-row sm:flex-col items-end gap-2 shrink-0 self-stretch sm:self-center justify-between sm:justify-center border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                <div className="flex items-center gap-1.5">
                  <RatingStars rating={movie.average_rating || 0} size="sm" />
                  <span className="text-xs font-bold text-amber-400">
                    {movie.average_rating > 0 ? movie.average_rating.toFixed(1) : 'NR'}
                  </span>
                </div>
                <span className="text-xs text-amber-400/90 font-medium group-hover:translate-x-1 transition-transform">
                  Details &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalCount > pageSize && (
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            Showing <strong className="text-white">{Math.min(totalCount, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
            <strong className="text-white">{Math.min(totalCount, currentPage * pageSize)}</strong> of{' '}
            <strong className="text-amber-400">{totalCount.toLocaleString()}</strong> movies
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 200, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              &larr; Prev
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }).map((_, i) => {
              const totalPages = Math.ceil(totalCount / pageSize);
              let pageNum = currentPage;
              if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              if (pageNum < 1 || pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => {
                    setCurrentPage(pageNum);
                    window.scrollTo({ top: 200, behavior: 'smooth' });
                  }}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => {
                const totalPages = Math.ceil(totalCount / pageSize);
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 200, behavior: 'smooth' });
              }}
              disabled={currentPage >= Math.ceil(totalCount / pageSize)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
