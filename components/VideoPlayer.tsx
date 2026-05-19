'use client';

import { useState } from 'react';
import Image from 'next/image';

interface VideoPlayerProps {
  videoKey: string;
  title?: string;
}

export default function VideoPlayer({ videoKey, title }: VideoPlayerProps) {
  const [started, setStarted] = useState(false);

  const thumbnailUrl = `https://img.youtube.com/vi/${videoKey}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
      {started ? (
        <iframe
          src={embedUrl}
          title={title ?? 'Video player'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : (
        <button
          onClick={() => setStarted(true)}
          aria-label={`Play ${title ?? 'video'}`}
          className="absolute inset-0 w-full h-full flex items-center justify-center group cursor-pointer"
        >
          <Image
            src={thumbnailUrl}
            alt={title ?? 'Video thumbnail'}
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
          <div className="relative z-10 w-20 h-20 rounded-full bg-[#e63946]/90 flex items-center justify-center group-hover:bg-[#e63946] group-hover:scale-110 transition-all duration-200 shadow-2xl shadow-[#e63946]/40">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}
