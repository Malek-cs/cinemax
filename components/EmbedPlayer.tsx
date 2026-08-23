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

  // Netflix Next Episode States
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [countdown, setCountdown] = useState(8);

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

  // دالة الانتقال للحلقة التالية
  const goToNextEpisode = useCallback(() => {
    setShowNextOverlay(false);
    setLoaded(false);
    router.push(`/watch/${tmdbId}?type=tv&season=${season}&episode=${episode + 1}`);
  }, [router, tmdbId, season, episode]);

  // الاستماع لانتهاء الفيديو من مختلف سيرفرات الـ Iframe الخارجية
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        let msg = event.data;
        if (typeof msg === 'string') {
          try {
            msg = JSON.parse(msg);
          } catch {
            // ليست بصيغة JSON
          }
        }

        // الكشف عن إشارات نهاية الحلقة من السيرفرات (VidSrc, MultiEmbed, VideoJS events)
        const isEnded =
          msg?.event === 'ended' ||
          msg?.type === 'PLAYER_ENDED' ||
          msg?.event === 'timeupdate' && msg?.currentTime > 0 && (msg?.duration - msg?.currentTime <= 15) ||
          msg === 'ended' ||
          msg?.status === 'ended';

        if (isEnded && type === 'tv' && episode < totalEpisodes) {
          setShowNextOverlay(true);
        }
      } catch {
        // تجاهل أخطاء التفسير
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [type, episode, totalEpisodes]);

  // العداد التنازلي التلقائي (أوتوماتيكي 100%)
  useEffect(() => {
    if (!showNextOverlay) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            goToNextEpisode();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showNextOverlay, goToNextEpisode]);

  return (
    <div className="space-y-2.5">
      {/* شريط السيرفرات والتحديث */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 text-xs ml-1 hidden sm:inline">Server:</span>
          {SOURCES.map((_s, i) => (
            <button
              key={i}
              onClick={() => {
                setSourceIdx(i);
                setLoaded(false);
                setShowNextOverlay(false);
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

        <button
          onClick={() => {
            setLoaded(false);
            setShowNextOverlay(false);
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

      {/* شاشة الفيديو والطبقة التفاعلية الداخلية */}
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

        {/* بطاقة Netflix التلقائية داخل المشغل مباشرة (Next Episode Overlay) */}
        {showNextOverlay && type === 'tv' && episode < totalEpisodes && (
          <div className="absolute bottom-6 right-6 z-30 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-[#0e0e16]/95 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl shadow-black max-w-[280px] sm:max-w-[320px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold tracking-wider text-[#e63946] uppercase">
                  Next Episode in {countdown}s
                </span>
                <button
                  onClick={() => setShowNextOverlay(false)}
                  className="text-gray-400 hover:text-white text-xs p-1"
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>

              <h4 className="text-white text-sm font-bold truncate mb-1">
                {title ?? 'Next Episode'}
              </h4>
              <p className="text-gray-400 text-xs mb-3">
                Season {season} · Episode {episode + 1}
              </p>

              {/* Progress Bar التنازلي التلقائي */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3.5">
                <div
                  className="h-full bg-[#e63946] transition-all duration-1000 ease-linear"
                  style={{ width: `${((8 - countdown) / 8) * 100}%` }}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToNextEpisode}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#e63946] hover:bg-[#c1121f] text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-[#e63946]/40"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Play Now</span>
                </button>
                <button
                  onClick={() => setShowNextOverlay(false)}
                  className="py-2 px-3 bg-[#1a1a24] hover:bg-[#252535] text-gray-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Stay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* زر الـ Fullscreen المخصص */}
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