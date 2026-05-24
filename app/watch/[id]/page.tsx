import type { Metadata } from 'next';
import Image from 'next/image';
import { getMovieDetails, getSeriesDetails } from '@/lib/tmdb';
import { getImageUrl, formatRuntime } from '@/lib/utils';
import WatchClient from '@/components/WatchClient';
import type { Movie, Series } from '@/lib/types';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; season?: string; episode?: string }>;
}

function getTitle(d: Movie | Series): string {
  return 'title' in d ? d.title : (d as Series).name;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const { type } = await searchParams;
  const details = type === 'tv' ? await getSeriesDetails(id) : await getMovieDetails(id);
  return {
    title: `مشاهدة ${getTitle(details)}`,
    description: details.overview?.slice(0, 160),
  };
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { type, season, episode } = await searchParams;
  const isTV = type === 'tv';

  const details = isTV ? await getSeriesDetails(id) : await getMovieDetails(id);
  const title = getTitle(details);
  const initialSeason = season ? parseInt(season) : 1;
  const initialEpisode = episode ? parseInt(episode) : 1;

  return (
    <div className="min-h-screen pt-14 md:pt-16 bg-[#0a0a0f]">
      <div className="max-w-screen-2xl mx-auto px-3 md:px-8 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Main — player + episodes */}
          <div className="lg:col-span-2">
            <WatchClient
              tmdbId={id}
              type={isTV ? 'tv' : 'movie'}
              title={title}
              posterPath={details.poster_path}
              backdropPath={details.backdrop_path}
              series={isTV ? (details as Series) : undefined}
              initialSeason={initialSeason}
              initialEpisode={initialEpisode}
            />
          </div>

          {/* Sidebar — movie info */}
          <div className="space-y-4">
            <div className="bg-[#111118] rounded-xl p-4 border border-white/5">
              <h2 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">
                معلومات
              </h2>

              {/* Mobile: compact poster + info */}
              <div className="flex gap-3 lg:hidden">
                {details.poster_path && (
                  <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={getImageUrl(details.poster_path, 'w185')}
                      alt={title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm mb-2 line-clamp-2">{title}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">التقييم</span>
                      <span className="text-white font-semibold">★ {details.vote_average.toFixed(1)}</span>
                    </div>
                    {'runtime' in details && details.runtime && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">المدة</span>
                        <span className="text-white">{formatRuntime(details.runtime)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Desktop: full poster */}
              {details.poster_path && (
                <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden mb-4 hidden lg:block">
                  <Image
                    src={getImageUrl(details.poster_path, 'w342')}
                    alt={title}
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="space-y-2 text-sm hidden lg:block">
                <h3 className="text-white font-bold">{title}</h3>
                <div className="flex justify-between">
                  <span className="text-gray-500">التقييم</span>
                  <span className="text-white font-semibold">★ {details.vote_average.toFixed(1)}</span>
                </div>
                {'runtime' in details && details.runtime && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">المدة</span>
                    <span className="text-white">{formatRuntime(details.runtime)}</span>
                  </div>
                )}
                {'release_date' in details && (details as Movie).release_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">سنة الإصدار</span>
                    <span className="text-white">
                      {new Date((details as Movie).release_date).getFullYear()}
                    </span>
                  </div>
                )}
                {'first_air_date' in details && (details as Series).first_air_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">أول بث</span>
                    <span className="text-white">
                      {new Date((details as Series).first_air_date).getFullYear()}
                    </span>
                  </div>
                )}
                {'number_of_seasons' in details && (details as Series).number_of_seasons && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">المواسم</span>
                    <span className="text-white">{(details as Series).number_of_seasons}</span>
                  </div>
                )}
              </div>

              {details.genres && details.genres.length > 0 && (
                <div className="mt-3">
                  <span className="text-gray-500 text-xs block mb-1.5">التصنيفات</span>
                  <div className="flex flex-wrap gap-1.5">
                    {details.genres.map((g) => (
                      <span
                        key={g.id}
                        className="bg-[#1a1a24] text-gray-300 text-xs px-2 py-0.5 rounded-full"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {details.overview && (
                <p className="text-gray-500 text-xs leading-relaxed mt-3 line-clamp-5">
                  {details.overview}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
