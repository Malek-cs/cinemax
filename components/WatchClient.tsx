'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import EmbedPlayer from './EmbedPlayer';
import EpisodeSelector from './EpisodeSelector';
import { saveToWatchHistory } from '@/lib/watchHistory';
import type { Series } from '@/lib/types';

interface WatchClientProps {
  tmdbId: string;
  imdbId?: string;
  type: 'movie' | 'tv';
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  series?: Series;
  initialSeason?: number;
  initialEpisode?: number;
}

export default function WatchClient({
  tmdbId,
  imdbId,
  type,
  title,
  posterPath,
  backdropPath,
  series,
  initialSeason = 1,
  initialEpisode = 1,
}: WatchClientProps) {
  const [season, setSeason] = useState(initialSeason);
  const [episode, setEpisode] = useState(initialEpisode);
  const { data: session } = useSession();

  // Track if we already saved this specific item to avoid repeated writes on re-render
  const savedKey = useRef<string>('');

  useEffect(() => {
    const key = `${tmdbId}-${type}-${season}-${episode}`;
    if (savedKey.current === key) return;
    savedKey.current = key;

    saveToWatchHistory(
      {
        id: parseInt(tmdbId, 10),
        type,
        title,
        posterPath: posterPath ?? null,
        backdropPath: backdropPath ?? null,
        season: type === 'tv' ? season : undefined,
        episode: type === 'tv' ? episode : undefined,
        watchedAt: Date.now(),
      },
      session?.user?.email ?? undefined
    );
  }, [tmdbId, type, title, posterPath, backdropPath, season, episode, session]);

  function handleEpisodeSelect(s: number, e: number) {
    setSeason(s);
    setEpisode(e);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-4">
      {/* Now playing label for series */}
      {type === 'tv' && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">يشاهد الآن:</span>
          <span className="text-white font-semibold">
            {title} — الموسم {season} · الحلقة {episode}
          </span>
        </div>
      )}

      <EmbedPlayer
        tmdbId={tmdbId}
        imdbId={imdbId}
        type={type}
        season={season}
        episode={episode}
        title={title}
      />

      {type === 'tv' && series?.seasons && series.seasons.length > 0 && (
        <EpisodeSelector
          seriesId={tmdbId}
          seasons={series.seasons}
          currentSeason={season}
          currentEpisode={episode}
          onSelect={handleEpisodeSelect}
        />
      )}
    </div>
  );
}
