import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.tsx';
import { CatalogProvider, useCatalog } from './context/CatalogContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { TrailerModal } from './components/TrailerModal.tsx';
import { HomePage } from './views/HomePage.tsx';
import { MoviesPage } from './views/MoviesPage.tsx';
import { MovieDetailsPage } from './views/MovieDetailsPage.tsx';
import { WatchlistPage } from './views/WatchlistPage.tsx';
import { ProfilePage } from './views/ProfilePage.tsx';
import { AdminPage } from './views/AdminPage.tsx';
import { GenresPage } from './views/GenresPage.tsx';
import { MovieItem } from './lib/api.ts';
import { recordRecentlyViewedId } from './lib/recentlyViewed.ts';
import { Film, Heart, Shield, Star, Sparkles, Compass } from 'lucide-react';

function AppContent() {
  const { isLight } = useTheme();
  const { updateFilters } = useCatalog();
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [activeTrailerMovie, setActiveTrailerMovie] = useState<MovieItem | null>(null);

  // Sync URL with view state
  const syncUrl = (view: string, movieId?: number | null) => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.origin + window.location.pathname);
      if (view === 'movie-details' && movieId) {
        url.searchParams.set('movie', String(movieId));
      } else if (view !== 'home') {
        url.searchParams.set('view', view);
      }
      window.history.pushState({ view, movieId }, '', url.toString());
    } catch {}
  };

  // Handle URL deep-linking on initial load and back/forward navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parseUrl = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const movieParam = urlParams.get('movie');
        if (movieParam) {
          const mId = parseInt(movieParam, 10);
          if (!isNaN(mId) && mId > 0) {
            setSelectedMovieId(mId);
            recordRecentlyViewedId(mId);
            setCurrentView('movie-details');
            return;
          }
        }

        const viewParam = urlParams.get('view');
        if (viewParam && ['home', 'movies', 'genres', 'watchlist', 'profile', 'admin'].includes(viewParam)) {
          setCurrentView(viewParam);
        }
      } catch {}
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  const handleNavigate = (view: string, data?: any) => {
    // Only scroll to top if not returning to preserved catalog
    if (view !== 'movies' || (data && Object.keys(data).length > 0)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (view === 'movies') {
      if (data && Object.keys(data).length > 0) {
        updateFilters(data);
      }
      setCurrentView('movies');
      syncUrl('movies');
    } else if (view === 'movie-details') {
      const id = typeof data === 'object' && data !== null 
        ? Number(data.movieId ?? data.id ?? 1) 
        : Number(data || 1);
      const safeId = isNaN(id) ? 1 : id;
      setSelectedMovieId(safeId);
      recordRecentlyViewedId(safeId);
      setCurrentView('movie-details');
      syncUrl('movie-details', safeId);
    } else if (view === 'top-rated') {
      updateFilters({ sort: 'rating', currentPage: 1 });
      setCurrentView('movies');
      syncUrl('movies');
    } else {
      setCurrentView(view);
      syncUrl(view);
    }
  };

  const handleSelectMovie = (id: number | string) => {
    const numId = Number(id);
    const safeId = isNaN(numId) ? 1 : numId;
    setSelectedMovieId(safeId);
    recordRecentlyViewedId(safeId);
    setCurrentView('movie-details');
    syncUrl('movie-details', safeId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayTrailer = (movie: MovieItem) => {
    setActiveTrailerMovie(movie);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isLight 
        ? 'bg-[#f8fafc] text-slate-900 selection:bg-amber-400 selection:text-black' 
        : 'bg-[#0b0f17] text-slate-100 selection:bg-amber-500 selection:text-black'
    }`}>
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onSearchSelect={handleSelectMovie}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        {currentView === 'home' && (
          <HomePage
            onSelectMovie={handleSelectMovie}
            onNavigate={handleNavigate}
            onPlayTrailer={handlePlayTrailer}
          />
        )}

        {currentView === 'movies' && (
          <MoviesPage
            onSelectMovie={handleSelectMovie}
            onPlayTrailer={handlePlayTrailer}
          />
        )}

        {currentView === 'genres' && (
          <GenresPage
            onSelectGenre={(genre) => handleNavigate('movies', { genre })}
          />
        )}

        {currentView === 'movie-details' && selectedMovieId && (
          <MovieDetailsPage
            movieId={selectedMovieId}
            onBack={() => handleNavigate('movies')}
            onPlayTrailer={handlePlayTrailer}
          />
        )}

        {currentView === 'watchlist' && (
          <WatchlistPage
            onSelectMovie={handleSelectMovie}
            onNavigate={handleNavigate}
            onPlayTrailer={handlePlayTrailer}
          />
        )}

        {currentView === 'profile' && (
          <ProfilePage
            onSelectMovie={handleSelectMovie}
            onPlayTrailer={handlePlayTrailer}
          />
        )}

        {currentView === 'admin' && (
          <AdminPage
            onSelectMovie={handleSelectMovie}
          />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal />
      {activeTrailerMovie && (
        <TrailerModal
          movie={activeTrailerMovie}
          onClose={() => setActiveTrailerMovie(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1: Brand */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold">
                  <Film className="w-4 h-4" />
                </div>
                <span className="font-heading font-extrabold text-xl text-white">
                  Cine<span className="text-amber-400">Rate</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                The modern cinematic discovery, rating, and review portal. Explore verified catalog titles, stream trailers, rate films, and maintain your personal watchlist.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Vercel & PostgreSQL Architecture
                </span>
                <span>•</span>
                <span>Production Ready</span>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Explore</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <button onClick={() => handleNavigate('home')} className="hover:text-amber-400 transition-colors">
                    Home Showcase
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('movies')} className="hover:text-amber-400 transition-colors">
                    Discover Movies
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('genres')} className="hover:text-amber-400 transition-colors">
                    Movie Genres
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('top-rated')} className="hover:text-amber-400 transition-colors">
                    Top Rated Rankings
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Community & Account */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Account</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <button onClick={() => handleNavigate('watchlist')} className="hover:text-amber-400 transition-colors">
                    Personal Watchlist
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('profile')} className="hover:text-amber-400 transition-colors">
                    User Profile & Ratings
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('admin')} className="hover:text-amber-400 transition-colors">
                    Admin Dashboard
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} CineRate Portal. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Engineered with clean code, secure HTTP-only cookies & PostgreSQL.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <CatalogProvider>
            <AppContent />
          </CatalogProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
