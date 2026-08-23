'use client';

import { useState } from 'react';
import ShareCardModal from './ShareCardModal';

interface ShareCardButtonProps {
  title: string;
  posterPath: string | null;
  rating?: number;
  year?: string;
  type?: 'movie' | 'tv';
}

export default function ShareCardButton({
  title,
  posterPath,
  rating,
  year,
  type = 'movie',
}: ShareCardButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-[#1a1a24] hover:bg-[#252535] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all duration-200 border border-white/10 active:scale-95 shadow-md"
        title="Share Story Card"
      >
        <svg
          className="w-4 h-4 text-[#e63946]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        <span>Share Card</span>
      </button>

      <ShareCardModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        posterPath={posterPath}
        rating={rating}
        year={year}
        type={type}
      />
    </>
  );
}