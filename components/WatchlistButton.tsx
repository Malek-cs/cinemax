'use client';

import { useState, useEffect } from 'react';
import { isInWatchlist, toggleWatchlist } from '@/lib/watchlist';

interface WatchlistButtonProps {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
}

export default function WatchlistButton({ id, type, title, posterPath }: WatchlistButtonProps) {
  const [isListed, setIsListed] = useState(false);

  useEffect(() => {
    setIsListed(isInWatchlist(id, type));
  }, [id, type]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleWatchlist({ id, type, title, posterPath });
    setIsListed(next);
  }

  return (
    <button
      onClick={toggle}
      title={isListed ? 'Remove from My List' : 'Add to My List'}
      className={`w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 ${
        isListed
          ? 'bg-[#e63946] shadow-lg shadow-[#e63946]/40'
          : 'bg-black/70 hover:bg-[#e63946]'
      }`}
    >
      <svg
        className="w-3.5 h-3.5 transition-all duration-200"
        viewBox="0 0 24 24"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={isListed ? 'white' : 'none'}
        stroke="white"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
