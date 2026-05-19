'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Season, Episode } from '@/lib/types';

interface EpisodeSelectorProps {
  seriesId: string;
  seasons: Season[];
  currentSeason: number;
  currentEpisode: number;
  onSelect: (season: number, episode: number) => void;
}

export default function EpisodeSelector({
  seriesId,
  seasons,
  currentSeason,
  currentEpisode,
  onSelect,
}: EpisodeSelectorProps) {
  const validSeasons = seasons.filter((s) => s.season_number > 0);
  const [activeSeason, setActiveSeason] = useState(currentSeason);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/season?id=${seriesId}&season=${activeSeason}`)
      .then((r) => r.json())
      .then((data) => {
        setEpisodes(data.episodes ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [seriesId, activeSeason]);

  return (
    <div className="bg-[#111118] rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <h2 className="text-white font-bold text-base mb-3">الحلقات</h2>
        {/* Season tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {validSeasons.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSeason(s.season_number)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                activeSeason === s.season_number
                  ? 'bg-[#e63946] text-white'
                  : 'bg-[#1a1a24] text-gray-400 hover:text-white hover:bg-[#252530]'
              }`}
            >
              الموسم {s.season_number}
            </button>
          ))}
        </div>
      </div>

      {/* Episode list */}
      <div className="max-h-[420px] overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[72px] bg-[#1a1a24] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : episodes.length === 0 ? (
          <div className="p-8 text-center text-gray-600 text-sm">لا توجد حلقات متاحة</div>
        ) : (
          <div className="p-3 space-y-2">
            {episodes.map((ep) => {
              const isActive =
                currentSeason === activeSeason && currentEpisode === ep.episode_number;
              return (
                <button
                  key={ep.id}
                  onClick={() => onSelect(activeSeason, ep.episode_number)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all duration-200 border ${
                    isActive
                      ? 'bg-[#e63946]/15 border-[#e63946]/40'
                      : 'bg-[#0d0d14] border-white/5 hover:bg-[#1a1a24] hover:border-white/10'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 w-24 h-[54px] rounded-md overflow-hidden bg-[#1a1a24]">
                    {ep.still_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                        alt={ep.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                        E{ep.episode_number}
                      </div>
                    )}
                    {/* Playing indicator */}
                    {isActive && (
                      <div className="absolute inset-0 bg-[#e63946]/50 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                    {/* Episode number badge */}
                    {!isActive && (
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1 rounded font-bold">
                        {ep.episode_number}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isActive ? 'text-[#e63946]' : 'text-white'
                      }`}
                    >
                      {ep.episode_number}. {ep.name}
                    </p>
                    {ep.runtime && (
                      <p className="text-gray-600 text-[10px] mt-0.5">{ep.runtime} دقيقة</p>
                    )}
                    {ep.overview && (
                      <p className="text-gray-500 text-[10px] line-clamp-2 mt-0.5">{ep.overview}</p>
                    )}
                  </div>

                  {/* Rating */}
                  {ep.vote_average > 0 && (
                    <span className="text-[10px] text-gray-500 flex-shrink-0">
                      ★{ep.vote_average.toFixed(1)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
