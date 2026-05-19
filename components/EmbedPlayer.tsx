'use client';

import { useState, useEffect, useRef } from 'react';

interface Source {
  label: string;
  movie: (id: string) => string;
  tv: (id: string, s: number, e: number) => string;
}

const SOURCES: Source[] = [
  {
    label: 'سيرفر 1',
    movie: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    label: 'سيرفر 2',
    movie: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    label: 'سيرفر 3',
    movie: (id) => `https://autoembed.cc/movie/tmdb-${id}`,
    tv: (id, s, e) => `https://autoembed.cc/tv/tmdb-${id}-${s}-${e}`,
  },
];

interface EmbedPlayerProps {
  tmdbId: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title?: string;
}

export default function EmbedPlayer({
  tmdbId,
  type,
  season = 1,
  episode = 1,
  title,
}: EmbedPlayerProps) {
  const [sourceIdx, setSourceIdx] = useState(0);
  const [arabicSubs, setArabicSubs] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when CSS-fullscreen is active
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isFullscreen]);

  const src = SOURCES[sourceIdx];
  const baseUrl =
    type === 'movie'
      ? src.movie(tmdbId)
      : src.tv(tmdbId, season, episode);

  const embedUrl = arabicSubs
    ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}ds_langs=ar&sub_lang=ar`
    : baseUrl;

  // Mobile browsers (iOS Safari) often don't fire onLoad for cross-origin iframes.
  // Fall back to showing the player after 5s regardless.
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 5000);
    return () => clearTimeout(t);
  }, [embedUrl]);

  function toggleFullscreen() {
    setIsFullscreen(prev => !prev);
  }

  return (
    <div className="space-y-2.5">
      {/* Controls bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Server buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 text-xs ml-1 hidden sm:inline">سيرفر:</span>
          {SOURCES.map((_s, i) => (
            <button
              key={i}
              onClick={() => { setSourceIdx(i); setLoaded(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                sourceIdx === i
                  ? 'bg-[#e63946] text-white shadow-md shadow-[#e63946]/30'
                  : 'bg-[#1a1a24] text-gray-400 hover:text-white hover:bg-[#252530]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Arabic subtitle toggle */}
        <button
          onClick={() => { setArabicSubs(!arabicSubs); setLoaded(false); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border ml-auto ${
            arabicSubs
              ? 'bg-[#e63946]/20 text-[#e63946] border-[#e63946]/50 shadow-sm'
              : 'bg-[#1a1a24] text-gray-400 border-white/10 hover:text-white'
          }`}
          title={arabicSubs ? 'تعطيل الترجمة العربية' : 'تفعيل الترجمة العربية'}
        >
          <span className="text-sm font-bold" style={{ fontFamily: 'serif' }}>ع</span>
          <span>ترجمة عربية</span>
        </button>
      </div>

      {/* Iframe player */}
      <div
        ref={containerRef}
        className={
          isFullscreen
            ? 'fixed inset-0 z-[9999] bg-black'
            : 'relative w-full aspect-video bg-black rounded-xl shadow-2xl'
        }
        style={{ overflow: 'clip' }}
      >
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0d0d14] z-10">
            <div className="w-10 h-10 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">جاري التحميل...</p>
          </div>
        )}
        <iframe
          key={embedUrl}
          src={embedUrl}
          title={title ?? 'Video Player'}
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          referrerPolicy="origin"
          className="absolute inset-0 w-full h-full border-0"
          onLoad={() => setLoaded(true)}
        />

        {/* Fullscreen button — bottom right corner */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'خروج من الشاشة الكاملة' : 'شاشة كاملة'}
          className="absolute bottom-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-lg bg-black/60 hover:bg-black/90 text-white transition-all duration-200 backdrop-blur-sm"
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4m0 5H4m11 0h-5m5 0V4M9 15v5m0-5H4m11 5v-5m0 5h-5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </div>

      {/* Info strip */}
      <p className="text-gray-600 text-[11px] text-center">
        {arabicSubs
          ? '✓ الترجمة العربية مفعّلة — اختر "Arabic" من قائمة الترجمة داخل المشغّل إن لم تظهر تلقائياً'
          : 'إذا لم يعمل السيرفر، جرّب سيرفراً آخر أو فعّل الترجمة العربية'}
      </p>
    </div>
  );
}
