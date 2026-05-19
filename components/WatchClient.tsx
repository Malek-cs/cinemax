'use client';

import { useState } from 'react';
import EmbedPlayer from './EmbedPlayer';
import EpisodeSelector from './EpisodeSelector';
import type { Series } from '@/lib/types';

interface WatchClientProps {
  tmdbId: string;
  type: 'movie' | 'tv';
  title: string;
  series?: Series;
  initialSeason?: number;
  initialEpisode?: number;
}

export default function WatchClient({
  tmdbId,
  type,
  title,
  series,
  initialSeason = 1,
  initialEpisode = 1,
}: WatchClientProps) {
  const [season, setSeason] = useState(initialSeason);
  const [episode, setEpisode] = useState(initialEpisode);

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
