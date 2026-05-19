import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getSeriesDetails, getCast, getSimilar, getVideos, getSeasonDetails } from '@/lib/tmdb';
import { getImageUrl, formatDate, getRatingColor } from '@/lib/utils';
import MovieRow from '@/components/MovieRow';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const series = await getSeriesDetails(id);
  return {
    title: series.name,
    description: series.overview?.slice(0, 160),
    openGraph: {
      title: `${series.name} | CineMay`,
      description: series.overview?.slice(0, 160),
      images: series.backdrop_path
        ? [`https://image.tmdb.org/t/p/w1280${series.backdrop_path}`]
        : [],
    },
  };
}

export default async function SeriesPage({ params }: Props) {
  const { id } = await params;
  const [series, cast, similar, videos] = await Promise.all([
    getSeriesDetails(id),
    getCast('tv', id),
    getSimilar('tv', id),
    getVideos('tv', id),
  ]);

  const trailer = videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ?? videos[0];

  // Load first non-special season episodes
  const firstSeason = series.seasons?.find((s) => s.season_number > 0) ?? series.seasons?.[0];
  const seasonDetails = firstSeason
    ? await getSeasonDetails(id, firstSeason.season_number).catch(() => null)
    : null;

  return (
    <>
      {/* Hero */}
      <div className="relative w-full h-[70vh] min-h-[480px] overflow-hidden">
        {series.backdrop_path && (
          <Image
            src={getImageUrl(series.backdrop_path, 'original')}
            alt={series.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/10 to-transparent" />

        <div className="absolute inset-0 flex items-end pb-12 px-6 md:px-12">
          <div className="flex gap-8 items-end">
            {series.poster_path && (
              <div className="hidden md:block flex-shrink-0">
                <Image
                  src={getImageUrl(series.poster_path, 'w342')}
                  alt={series.name}
                  width={190}
                  height={285}
                  className="rounded-xl shadow-2xl ring-1 ring-white/10"
                />
              </div>
            )}

            <div className="flex flex-col">
              {series.genres && series.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {series.genres.map((g) => (
                    <span
                      key={g.id}
                      className="bg-[#e63946]/15 text-[#e63946] text-xs px-2.5 py-1 rounded-full border border-[#e63946]/30"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-white text-4xl md:text-5xl font-bold mb-2 leading-tight">
                {series.name}
              </h1>

              {series.tagline && (
                <p className="text-gray-400 italic text-sm mb-3">&ldquo;{series.tagline}&rdquo;</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-5">
                <span className="font-bold text-base" style={{ color: getRatingColor(series.vote_average) }}>
                  ★ {series.vote_average.toFixed(1)}
                </span>
                {series.first_air_date && (
                  <span>{new Date(series.first_air_date).getFullYear()}</span>
                )}
                {series.number_of_seasons && (
                  <span>
                    {series.number_of_seasons} Season{series.number_of_seasons > 1 ? 's' : ''}
                  </span>
                )}
                {series.number_of_episodes && (
                  <span>{series.number_of_episodes} Episodes</span>
                )}
                {series.status && (
                  <span className="bg-white/10 px-2 py-0.5 rounded text-xs uppercase tracking-wider">
                    {series.status}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {trailer && (
                  <Link
                    href={`/watch/${series.id}?type=tv`}
                    className="flex items-center gap-2 bg-[#e63946] hover:bg-[#c1121f] text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-[#e63946]/30"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Watch Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 py-10 space-y-12 max-w-screen-xl mx-auto">
        {/* Overview */}
        <section>
          <h2 className="text-xl font-bold text-white mb-3">Overview</h2>
          <p className="text-gray-300 leading-relaxed">{series.overview}</p>
        </section>

        {/* Seasons */}
        {series.seasons && series.seasons.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Seasons</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {series.seasons
                .filter((s) => s.season_number > 0)
                .map((season) => (
                  <div key={season.id} className="flex-shrink-0 w-[140px]">
                    <div className="relative w-[140px] h-[210px] rounded-lg overflow-hidden bg-[#111118] ring-1 ring-white/5">
                      {season.poster_path ? (
                        <Image
                          src={getImageUrl(season.poster_path, 'w342')}
                          alt={season.name}
                          fill
                          sizes="140px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-3">
                          {season.name}
                        </div>
                      )}
                    </div>
                    <p className="text-white text-xs font-semibold mt-2 truncate">{season.name}</p>
                    <p className="text-gray-500 text-xs">{season.episode_count} episodes</p>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Episodes from first season */}
        {seasonDetails?.episodes && seasonDetails.episodes.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              {firstSeason?.name ?? 'Season 1'} — Episodes
            </h2>
            <div className="space-y-3">
              {seasonDetails.episodes.map((ep) => (
                <div
                  key={ep.id}
                  className="flex gap-4 bg-[#111118] rounded-lg p-3 hover:bg-[#1a1a24] transition-colors border border-white/5"
                >
                  <div className="flex-shrink-0 relative w-[120px] h-[68px] rounded-lg overflow-hidden bg-[#1a1a24]">
                    {ep.still_path ? (
                      <Image
                        src={getImageUrl(ep.still_path, 'w300')}
                        alt={ep.name}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-white text-sm font-semibold truncate">
                        {ep.episode_number}. {ep.name}
                      </h3>
                      {ep.vote_average > 0 && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          ★ {ep.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {ep.air_date && (
                      <p className="text-gray-600 text-xs mt-0.5">{formatDate(ep.air_date)}</p>
                    )}
                    {ep.overview && (
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{ep.overview}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {cast.slice(0, 15).map((member) => (
                <div key={member.id} className="flex-shrink-0 w-[100px] text-center">
                  <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-[#1a1a24] mx-auto mb-2 ring-2 ring-white/5">
                    {member.profile_path ? (
                      <Image
                        src={getImageUrl(member.profile_path, 'w185')}
                        alt={member.name}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-3xl">
                        👤
                      </div>
                    )}
                  </div>
                  <p className="text-white text-xs font-semibold truncate">{member.name}</p>
                  <p className="text-gray-500 text-xs truncate mt-0.5">{member.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {similar.length > 0 && (
          <section className="-mx-6 md:-mx-12">
            <MovieRow title="Similar Series" items={similar.slice(0, 12)} type="tv" />
          </section>
        )}
      </div>
    </>
  );
}
