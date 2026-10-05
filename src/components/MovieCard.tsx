import React, { useState } from 'react';
import { Star, Bookmark, Play, Clock, Sparkles } from 'lucide-react';
import { MovieItem, api } from '../lib/api.ts';
import { getMoviePosterUrl } from '../lib/movieImages.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface MovieCardProps {
  movie: MovieItem;
  onSelect: (movieId: number) => void;
  onWatchlistChange?: (movieId: number, inWatchlist: boolean) => void;
  onPlayTrailer?: (movie: MovieItem) => void;
  compact?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onSelect,
  onWatchlistChange,
  onPlayTrailer,
  compact = false,
}) => {
  const { user, openAuthModal, refreshUser } = useAuth();
  const { toast } = useToast();
  const [inWatchlist, setInWatchlist] = useState<boolean>(
    Boolean(movie.in_watchlist) || api.watchlist.isSavedLocally(movie.id)
  );
  const [isUpdatingWatchlist, setIsUpdatingWatchlist] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  const clipPoster = getMoviePosterUrl(movie);
  const activePoster = imgError
    ? clipPoster
    : (movie.poster_url && !movie.poster_url.includes('unsplash') ? movie.poster_url : clipPoster);

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast('Please sign in to add movies to your watchlist', 'info');
      openAuthModal('login');
      return;
    }

    if (isUpdatingWatchlist) return;
    setIsUpdatingWatchlist(true);

    try {
      if (inWatchlist) {
        await api.watchlist.remove(movie.id);
        setInWatchlist(false);
        toast(`Removed "${movie.title}" from watchlist`, 'info');
        if (onWatchlistChange) onWatchlistChange(movie.id, false);
      } else {
        await api.watchlist.add(movie.id);
        setInWatchlist(true);
        toast(`Added "${movie.title}" to watchlist!`, 'success');
        if (onWatchlistChange) onWatchlistChange(movie.id, true);
      }
      refreshUser();
    } catch (err: any) {
      toast(err.message || 'Failed to update watchlist', 'error');
    } finally {
      setIsUpdatingWatchlist(false);
    }
  };

  const handleTrailer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayTrailer) {
      onPlayTrailer(movie);
    } else {
      onSelect(movie.id);
    }
  };

  return (
    <div
      onClick={() => onSelect(movie.id)}
      className="group relative flex flex-col bg-slate-900/80 rounded-2xl overflow-hidden border border-slate-800/80 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer"
    >
      {/* Poster Image Container */}
      <div className={`relative ${compact ? 'aspect-[3/4]' : 'aspect-[2/3]'} overflow-hidden bg-slate-950`}>
        <img
          src={activePoster}
          alt={movie.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-70 group-hover:opacity-60 transition-opacity" />

        {/* Watchlist Quick Button */}
        <button
          onClick={handleWatchlistToggle}
          disabled={isUpdatingWatchlist}
          title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          className={`absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-md transition-all duration-200 z-10 ${
            inWatchlist
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-400'
              : 'bg-black/50 hover:bg-black/80 text-white hover:text-amber-400 border border-white/10'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-black' : ''}`} />
        </button>

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-amber-400 text-xs font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{movie.average_rating > 0 ? movie.average_rating.toFixed(1) : 'NR'}</span>
        </div>

        {/* Quick Trailer Play Button (visible on hover) */}
        {movie.trailer_url && (
          <button
            onClick={handleTrailer}
            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-amber-500/90 hover:bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-500/40 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 z-10"
            title="Watch Trailer"
          >
            <Play className="w-5 h-5 fill-black ml-0.5" />
          </button>
        )}

        {/* Featured Tag */}
        {movie.featured && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Featured</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="font-medium text-slate-300">{movie.release_year}</span>
            <span>•</span>
            <span className="truncate">{movie.genre.split('/')[0].trim()}</span>
            {movie.duration && (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3 inline" />
                  {movie.duration}
                </span>
              </>
            )}
          </div>

          <h3 className="font-heading font-bold text-white text-base group-hover:text-amber-400 transition-colors line-clamp-1">
            {movie.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {movie.description}
          </p>
        </div>

        {/* Bottom Details Footer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate text-slate-400 max-w-[140px]">
            Dir: <span className="text-slate-300">{movie.director}</span>
          </span>
          <span className="text-amber-400/90 font-medium group-hover:translate-x-1 transition-transform">
            Details &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};
