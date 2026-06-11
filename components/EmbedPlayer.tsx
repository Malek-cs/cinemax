'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Source {
  label: string;
  movie: (id: string) => string;
  tv: (id: string, s: number, e: number) => string;
  arabicParam: string;
}

const SOURCES: Source[] = [
  {
    label: 'سيرفر 1',
    movie: (id) => `https://vidsrc.icu/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.icu/embed/tv/${id}/${s}/${e}`,
    arabicParam: 'sub_lang=ar&ds_langs=ar',
  },
  {
    label: 'سيرفر 2',
    movie: (id) => `https://player.videasy.net/movie/${id}`,
    tv: (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}`,
    arabicParam: 'lang=ar&sub_lang=ar',
  },
  {
    label: 'سيرفر 3',
    movie: (id) => `https://www.2embed.cc/embed/${id}`,
    tv: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
    arabicParam: 'lang=ar',
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const src = SOURCES[sourceIdx];
  const baseUrl =
    type === 'movie'
      ? src.movie(tmdbId)
      : src.tv(tmdbId, season, episode);

  const embedUrl = arabicSubs
    ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${src.arabicParam}`
    : baseUrl;

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 5000);
    return () => clearTimeout(t);
  }, [embedUrl]);

  return (
    <div className="space-y-2.5">
      {/* Controls bar */}
      <div className="flex items-center gap-2 flex-wrap">
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
      <div ref={wrapperRef} className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group/player">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0d0d14] z-10">
            <div className="w-10 h-10 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">جاري التحميل...</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          key={embedUrl}
          src={embedUrl}
          title={title ?? 'Video Player'}
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          referrerPolicy="origin"
          className="absolute inset-0 w-full h-full border-0"
          onLoad={() => setLoaded(true)}
        />
        {/* Custom fullscreen button — works on PC where iframe's own button may be blocked */}
        <button
          onClick={toggleFullscreen}
          className="hidden md:block absolute bottom-3 right-3 z-20 p-2 rounded-lg bg-black/60 text-white opacity-0 group-hover/player:opacity-100 transition-opacity duration-200 hover:bg-black/80"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          )}
        </button>
      </div>

      <p className="text-gray-600 text-[11px] text-center">
        {arabicSubs
          ? '✓ الترجمة العربية مفعّلة تلقائياً'
          : 'إذا لم يعمل السيرفر، جرّب سيرفراً آخر أو فعّل الترجمة العربية'}
      </p>
    </div>
  );
}
