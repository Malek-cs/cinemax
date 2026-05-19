'use client';

import { useState, useEffect } from 'react';

interface Source {
  label: string;
  movie: (id: string) => string;
  tv: (id: string, s: number, e: number) => string;
}

const SOURCES: Source[] = [
  {
    label: 'سيرفر 1',
    movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    label: 'سيرفر 2',
    movie: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    label: 'سيرفر 3',
    movie: (id) => `https://2embed.cc/embed/${id}`,
    tv: (id, s, e) => `https://2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
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

  return (
    <div className="space-y-2.5">
      {/* Controls bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Server buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 text-xs ml-1 hidden sm:inline">سيرفر:</span>
          {SOURCES.map((s, i) => (
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
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
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
          sandbox="allow-scripts allow-same-origin allow-presentation allow-pointer-lock allow-forms"
          className="absolute inset-0 w-full h-full border-0"
          onLoad={() => setLoaded(true)}
        />
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
