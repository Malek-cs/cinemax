'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Source {
  label: string;
  movie: (tmdbId: string, imdbId?: string, lang?: string) => string;
  tv: (tmdbId: string, s: number, e: number, imdbId?: string, lang?: string) => string;
}

const SOURCES: Source[] = [
  {
    // VidLink — يدعم العربي والإنجليزي في قائمة الترجمة
    label: 'سيرفر 1 (VidLink)',
    movie: (tmdb, _imdb, lang = 'ar') =>
      `https://vidlink.pro/movie/${tmdb}?sub=${lang}&sub_lang=${lang === 'ar' ? 'arabic' : 'english'}`,
    tv: (tmdb, s, e, _imdb, lang = 'ar') =>
      `https://vidlink.pro/tv/${tmdb}/${s}/${e}?sub=${lang}&sub_lang=${lang === 'ar' ? 'arabic' : 'english'}`,
  },
  {
    // VidSrc CC (v2) — يحتوي على جميع ملفات الترجمة
    label: 'سيرفر 2 (VidSrc CC)',
    movie: (tmdb, imdb, lang = 'ar') =>
      `https://vidsrc.cc/v2/embed/movie/${imdb ?? tmdb}?auto_lang=${lang}`,
    tv: (tmdb, s, e, imdb, lang = 'ar') =>
      `https://vidsrc.cc/v2/embed/tv/${imdb ?? tmdb}/${s}/${e}?auto_lang=${lang}`,
  },
  {
    // AutoEmbed — يدعم تحديد لغة الترجمة
    label: 'سيرفر 3 (AutoEmbed)',
    movie: (tmdb, _imdb, lang = 'ar') =>
      `https://player.autoembed.cc/embed/movie/${tmdb}?sub=${lang}`,
    tv: (tmdb, s, e, _imdb, lang = 'ar') =>
      `https://player.autoembed.cc/embed/tv/${tmdb}/${s}/${e}?sub=${lang}`,
  },
  {
    // multiembed.mov — احتياطي
    label: 'سيرفر 4 (MultiEmbed)',
    movie: (tmdb, imdb) =>
      imdb
        ? `https://multiembed.mov/?video_id=${imdb}`
        : `https://multiembed.mov/?video_id=${tmdb}&tmdb=1`,
    tv: (tmdb, s, e, imdb) =>
      imdb
        ? `https://multiembed.mov/?video_id=${imdb}&s=${s}&e=${e}`
        : `https://multiembed.mov/?video_id=${tmdb}&tmdb=1&s=${s}&e=${e}`,
  },
];

interface EmbedPlayerProps {
  tmdbId: string;
  imdbId?: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title?: string;
}

export default function EmbedPlayer({
  tmdbId,
  imdbId,
  type,
  season = 1,
  episode = 1,
  title,
}: EmbedPlayerProps) {
  const [sourceIdx, setSourceIdx] = useState(0);
  const [subLang, setSubLang] = useState<'ar' | 'en'>('ar');
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
  const embedUrl =
    type === 'movie'
      ? src.movie(tmdbId, imdbId, subLang)
      : src.tv(tmdbId, season, episode, imdbId, subLang);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 5000);
    return () => clearTimeout(t);
  }, [embedUrl]);

  return (
    <div className="space-y-2.5">
      {/* Controls bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Servers list */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-gray-500 text-xs hidden sm:inline">السيرفر:</span>
          {SOURCES.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setSourceIdx(i);
                setLoaded(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                sourceIdx === i
                  ? 'bg-[#e63946] text-white shadow-md shadow-[#e63946]/30'
                  : 'bg-[#1a1a24] text-gray-400 hover:text-white hover:bg-[#252530]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Subtitle toggle & Refresh */}
        <div className="flex items-center gap-2">
          {/* Subtitle selector */}
          <div className="flex items-center bg-[#1a1a24] p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => {
                setSubLang('ar');
                setLoaded(false);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                subLang === 'ar' ? 'bg-[#e63946] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => {
                setSubLang('en');
                setLoaded(false);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                subLang === 'en' ? 'bg-[#e63946] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          <button
            onClick={() => setLoaded(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border bg-[#1a1a24] text-gray-400 border-white/10 hover:text-white hover:bg-[#252530]"
            title="Refresh player"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Iframe player */}
      <div
        ref={wrapperRef}
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group/player"
      >
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
        {/* Custom fullscreen */}
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
        يمكنك تغيير لغة الترجمة من الأزرار بالأعلى أو مباشرة من أيقونة الترجمة (CC) داخل المشغل.
      </p>
    </div>
  );
}