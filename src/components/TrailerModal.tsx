import React, { useEffect, useState } from 'react';
import { X, Play, Film, ExternalLink, Search, AlertCircle } from 'lucide-react';
import { MovieItem } from '../lib/api.ts';
import { getMovieTrailer } from '../lib/trailers.ts';

interface TrailerModalProps {
  movie: MovieItem | null;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ movie, onClose }) => {
  if (!movie) return null;

  const trailer = getMovieTrailer(movie);
  const [embedFailed, setEmbedFailed] = useState<boolean>(false);

  // Reset embed failed state whenever movie changes
  useEffect(() => {
    setEmbedFailed(false);
  }, [movie?.id]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-white truncate max-w-xs sm:max-w-md">
                {movie.title} – Official Trailer
              </h3>
              <p className="text-xs text-slate-400">
                {movie.release_year} • {movie.genre} • Directed by {movie.director}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={trailer.directWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-all"
              title="Open trailer directly on YouTube"
            >
              <span>YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Trailer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player or Fallback */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {trailer.embedUrl && !embedFailed ? (
            <iframe
              src={trailer.embedUrl}
              title={`${movie.title} Official Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
              onError={() => setEmbedFailed(true)}
            />
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              <img
                src={movie.backdrop_url || movie.poster_url}
                alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />

              <div className="relative z-10 max-w-md space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10">
                  <Play className="w-8 h-8 fill-amber-400 ml-1" />
                </div>

                <div>
                  <h4 className="font-heading text-xl font-bold text-white mb-1">
                    {movie.title} ({movie.release_year})
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2 max-w-sm mx-auto leading-relaxed">
                    {movie.description}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
                  <a
                    href={trailer.directWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 shadow-xl shadow-amber-500/25 transition-all transform active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>Watch Trailer on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={trailer.youtubeSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-all"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <span>Search Trailers</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Direct YouTube Links */}
        <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Verified Film Catalog Trailer</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={trailer.directWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>Open on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a
              href={trailer.youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <span>Search More Clips</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
