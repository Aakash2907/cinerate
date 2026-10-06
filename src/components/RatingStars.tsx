import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number; // 0 - 5
  maxRating?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  totalRatings?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  interactive = false,
  onRate,
  size = 'md',
  showNumber = false,
  totalRatings,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const currentVal = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = currentVal >= starValue;
          const isHalf = !isFilled && currentVal >= starValue - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRate && onRate(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              aria-label={interactive ? `Rate ${starValue} star${starValue > 1 ? 's' : ''}` : `${rating} stars`}
              className={`${
                interactive
                  ? 'cursor-pointer hover:scale-115 active:scale-95 transition-transform'
                  : 'cursor-default'
              } p-1 sm:p-0.5 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded`}
              title={interactive ? `Rate ${starValue} star${starValue > 1 ? 's' : ''}` : `${rating} stars`}
            >
              <Star
                className={`${starSizes[size]} transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'text-slate-600 fill-slate-800/40'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span className="text-xs font-semibold text-amber-400 ml-1">
          {rating > 0 ? rating.toFixed(1) : 'NR'}
          <span className="text-slate-400 font-normal">/5</span>
        </span>
      )}

      {totalRatings !== undefined && (
        <span className="text-xs text-slate-400">
          ({totalRatings.toLocaleString()} {totalRatings === 1 ? 'rating' : 'ratings'})
        </span>
      )}
    </div>
  );
};
