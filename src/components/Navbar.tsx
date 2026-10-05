import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Search,
  Star,
  Bookmark,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Compass,
  Flame,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api, MovieItem } from '../lib/api.ts';
import { getMoviePosterUrl } from '../lib/movieImages.ts';
import { ThemeToggle } from './ThemeToggle.tsx';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
  onSearchSelect?: (movieId: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onSearchSelect }) => {
  const { user, openAuthModal, logout, quickLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const [quickSearch, setQuickSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MovieItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search debounce
  useEffect(() => {
    if (!quickSearch.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await api.movies.search(quickSearch);
        setSearchResults(data.results.slice(0, 5));
        setShowSearchResults(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [quickSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      setShowSearchResults(false);
      onNavigate('movies', { search: quickSearch.trim() });
    }
  };

  const handleSelectMovieResult = (id: number) => {
    setShowSearchResults(false);
    setQuickSearch('');
    if (onSearchSelect) {
      onSearchSelect(id);
    } else {
      onNavigate('movie-details', { movieId: id });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Film className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
                Cine<span className="text-amber-400">Rate</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-1 hidden sm:block">Movie Information & Ratings</p>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              currentView === 'home'
                ? 'bg-amber-500/15 text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('movies')}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              currentView === 'movies'
                ? 'bg-amber-500/15 text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            Discover
          </button>
          <button
            onClick={() => onNavigate('movies', { language: 'Tamil' })}
            className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all text-slate-300 hover:text-amber-400 hover:bg-slate-800/50 flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Tamil Cinema
          </button>
          <button
            onClick={() => onNavigate('genres')}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              currentView === 'genres'
                ? 'bg-amber-500/15 text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Genres
          </button>
          <button
            onClick={() => onNavigate('top-rated')}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              currentView === 'top-rated'
                ? 'bg-amber-500/15 text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            Top Rated
          </button>
          <button
            onClick={() => onNavigate('watchlist')}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 relative ${
              currentView === 'watchlist'
                ? 'bg-amber-500/15 text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Watchlist</span>
            {user && (user.watchlist_count || 0) > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-black">
                {user.watchlist_count}
              </span>
            )}
          </button>
        </nav>

        {/* Search Bar with Dropdown Preview */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xs md:max-w-sm hidden sm:block">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search movies, directors, genres..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                onFocus={() => quickSearch.trim() && setShowSearchResults(true)}
                className="w-full bg-slate-900/90 text-sm text-white placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 transition-all"
              />
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {showSearchResults && (
            <div className="absolute left-0 right-0 mt-2 glass-dropdown rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {isSearching ? (
                <div className="py-4 text-center text-xs text-slate-400">Searching catalog...</div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelectMovieResult(m.id)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors"
                    >
                      {getMoviePosterUrl(m) ? (
                        <img
                          src={getMoviePosterUrl(m)}
                          alt={m.title}
                          className="w-10 h-14 object-cover rounded-lg shrink-0 bg-slate-950"
                        />
                      ) : (
                        <div className="w-10 h-14 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-500">
                          <Film className="w-4 h-4 stroke-[1.5]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{m.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{m.release_year}</span>
                          <span>•</span>
                          <span className="truncate">{m.genre}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{m.average_rating > 0 ? m.average_rating.toFixed(1) : 'NR'}</span>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full text-center py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 border-t border-slate-800/80 mt-1"
                  >
                    View all results for "{quickSearch}" &rarr;
                  </button>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">No movies found matching "{quickSearch}"</div>
              )}
            </div>
          )}
        </div>

        {/* Right Action: Auth & Profile */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle variant="navbar" />

          {user ? (
            <div ref={userDropdownRef} className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all focus:outline-none"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-bold text-slate-950 text-sm shadow">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span className="truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
                    {user.role === 'admin' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        ADMIN
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-dropdown rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 border-b border-slate-800/80 mb-1">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    <p className="text-[11px] text-amber-400 mt-0.5 capitalize">{user.role} Member</p>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    My Profile & Ratings
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('watchlist');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
                  >
                    <Bookmark className="w-4 h-4 text-slate-400" />
                    My Watchlist
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('admin');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-purple-300 hover:text-purple-200 hover:bg-purple-950/40 transition-colors border-t border-slate-800/80 mt-1 pt-2"
                    >
                      <Shield className="w-4 h-4 text-purple-400" />
                      Admin Dashboard
                    </button>
                  )}

                  {/* Quick role test toggles */}
                  <div className="px-3 py-2 mt-1 border-t border-slate-800/80">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">
                      Switch Demo Role
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          quickLogin('admin');
                          setUserDropdownOpen(false);
                        }}
                        className={`text-[11px] py-1 px-2 rounded-lg font-medium border ${
                          user.role === 'admin'
                            ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        Admin
                      </button>
                      <button
                        onClick={() => {
                          quickLogin('user');
                          setUserDropdownOpen(false);
                        }}
                        className={`text-[11px] py-1 px-2 rounded-lg font-medium border ${
                          user.role === 'user'
                            ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        User
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 mt-1 pt-1">
                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all transform active:scale-95"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800/80 bg-slate-950 p-4 space-y-3 animate-in slide-in-from-top-4 duration-200">
          {/* Theme Toggle (Mobile) */}
          <ThemeToggle variant="mobile" />

          {/* Mobile Search input */}
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search movies..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full bg-slate-900 text-sm text-white placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400"
              />
            </div>
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('home');
              }}
              className="p-3 rounded-xl bg-slate-900 text-left font-medium text-sm text-slate-200"
            >
              Home
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('movies');
              }}
              className="p-3 rounded-xl bg-slate-900 text-left font-medium text-sm text-slate-200"
            >
              Discover
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('movies', { language: 'Tamil' });
              }}
              className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/30 text-left font-medium text-sm text-orange-200"
            >
              Tamil Cinema (100+)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('genres');
              }}
              className="p-3 rounded-xl bg-slate-900 text-left font-medium text-sm text-slate-200"
            >
              Genres
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('top-rated');
              }}
              className="p-3 rounded-xl bg-slate-900 text-left font-medium text-sm text-slate-200"
            >
              Top Rated
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('watchlist');
              }}
              className="p-3 rounded-xl bg-slate-900 text-left font-medium text-sm text-slate-200 col-span-2 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                My Watchlist
              </span>
              {user && (user.watchlist_count || 0) > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-black">
                  {user.watchlist_count}
                </span>
              )}
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('admin');
                }}
                className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-left font-medium text-sm text-purple-200 col-span-2 flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-purple-400" />
                Administrator Area
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
