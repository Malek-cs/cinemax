'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Source {
  label: string;
  movie: (tmdbId: string, imdbId?: string) => string;
  tv: (tmdbId: string, s: number, e: number, imdbId?: string) => string;
}

const SOURCES: Source[] = [
  {
    label: 'Server 1',
    movie: (tmdb, imdb) =>
      imdb
        ? `https://multiembed.mov/?video_id=${imdb}`
        : `https://multiembed.mov/?video_id=${tmdb}&tmdb=1`,
    tv: (tmdb, s, e, imdb) =>
      imdb
        ? `https://multiembed.mov/?video_id=${imdb}&s=${s}&e=${e}`
        : `https://multiembed.mov/?video_id=${tmdb}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    label: 'Server 2',
    movie: (tmdb) => `https://player.videasy.net/movie/${tmdb}?lang=ar&sub_lang=ar`,
    tv: (tmdb, s, e) => `https://player.videasy.net/tv/${tmdb}/${s}/${e}?lang=ar&sub_lang=ar`,
  },
  {
    label: 'Server 3',
    movie: (tmdb, imdb) => `https://vidsrc.to/embed/movie/${imdb ?? tmdb}`,
    tv: (tmdb, s, e, imdb) => `https://vidsrc.to/embed/tv/${imdb ?? tmdb}/${s}/${e}`,
  },
  {
    label: 'Server 4',
    movie: (tmdb) => `https://embed.su/embed/movie/${tmdb}`,
    tv: (tmdb, s, e) => `https://embed.su/embed/tv/${tmdb}/${s}/${e}`,
  },
];

interface EmbedPlayerProps {
  tmdbId: string;
  imdbId?: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  totalEpisodes?: number;
  title?: string;
}

export default function EmbedPlayer({
  tmdbId,
  imdbId,
  type,
  season = 1,
  episode = 1,
  totalEpisodes = 50,
  title,
}: EmbedPlayerProps) {
  const router = useRouter();
  const [sourceIdx, setSourceIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Netflix Next Episode Overlay State
  const [showNextPrompt, setShowNextPrompt] = useState(false);
  const [countdown, setCountdown] = useState(10);
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
      ? src.movie(tmdbId, imdbId)
      : src.tv(tmdbId, season, episode, imdbId);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 5000);
    return () => clearTimeout(t);
  }, [embedUrl]);

  const goToNextEpisode = useCallback(() => {
    setShowNextPrompt(false);
    setLoaded(false);
    router.push(`/watch/${tmdbId}?type=tv&season=${season}&episode=${episode + 1}`);
  }, [router, tmdbId, season, episode]);

  // الاستماع للرسائل عند انتهاء الفيديو
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (
          data?.event === 'ended' ||
          data?.type === 'PLAYER_ENDED' ||
          data?.status === 'ended'
        ) {
          if (type === 'tv' && episode < totalEpisodes) {
            setCountdown(10);
            setShowNextPrompt(true);
          }
        }
      } catch {
        // Ignore non-json messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [type, episode, totalEpisodes]);

  // العداد التنازلي التلقائي (مصحح بالكامل بدون خطأ ESLint)
  useEffect(() => {
    if (!showNextPrompt) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            goToNextEpisode();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showNextPrompt, goToNextEpisode]);

  return (
    <div className="space-y-2.5">
      {/* Controls bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 text-xs ml-1 hidden sm:inline">Server:</span>
          {SOURCES.map((_s, i) => (
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
              {i + 1}
            </button>
          ))}
        </div>

        {/* زر التبديل اليدوي في الأعلى */}
        {type === 'tv' && episode < totalEpisodes && (
          <button
            onClick={() => {
              setCountdown(10);
              setShowNextPrompt(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1a1a24] hover:bg-[#e63946] text-white border border-white/10 hover:border-transparent transition-all duration-200"
            title="Next Episode"
          >
            <span>Next Ep ({episode + 1})</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <button
          onClick={() => {
            setLoaded(false);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border ml-auto bg-[#1a1a24] text-gray-400 border-white/10 hover:text-white hover:bg-[#252530]"
          title="Refresh player"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Iframe player container */}
      <div
        ref={wrapperRef}
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group/player"
      >
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0d0d14] z-10">
            <div className="w-10 h-10 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading...</p>
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

        {/* بطاقة نتفلكس العائمة */}
        {showNextPrompt && type === 'tv' && episode < totalEpisodes && (
          <div className="absolute bottom-12 right-6 z-30 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="bg-[#12121a]/95 backdrop-blur-md border border-white/15 p-4 rounded-2xl shadow-2xl shadow-black/80 max-w-[280px] sm:max-w-[320px] text-left">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#e63946]">
                  Playing Next in {countdown}s
                </span>
                <button
                  onClick={() => setShowNextPrompt(false)}
                  className="text-gray-400 hover:text-white text-xs p-1"
                  title="Cancel"
                >
                  ✕
                </button>
              </div>

              <h4 className="text-white text-sm font-bold truncate mb-1">
                {title ?? 'Series'}
              </h4>
              <p className="text-gray-400 text-xs mb-3">
                Season {season} · Episode {episode + 1}
              </p>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-[#e63946] transition-all duration-1000 ease-linear"
                  style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToNextEpisode}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#e63946] hover:bg-[#c1121f] text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-[#e63946]/30"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Play Now</span>
                </button>
                <button
                  onClick={() => setShowNextPrompt(false)}
                  className="py-2 px-3 bg-[#1a1a24] hover:bg-[#252535] text-gray-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className="hidden md:block absolute bottom-3 right-3 z-20 p-2 rounded-lg bg-black/60 text-white opacity-0 group-hover/player:opacity-100 transition-opacity duration-200 hover:bg-black/80"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
              />
            </svg>
          )}
        </button>
      </div>

      <p className="text-gray-600 text-[11px] text-center">
        If the server doesn&apos;t load, try another server or click Refresh
      </p>
    </div>
  );
}