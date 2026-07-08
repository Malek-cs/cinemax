import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getMovieDetails, getCast, getSimilar, getVideos } from '@/lib/tmdb';
import { getImageUrl, formatRuntime, formatDate, getRatingColor } from '@/lib/utils';
import MovieRow from '@/components/MovieRow';
import TrailerButton from '@/components/TrailerButton';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieDetails(id);
  return {
    title: movie.title,
    description: movie.overview?.slice(0, 160),
    openGraph: {
      title: `${movie.title} | CineMay`,
      description: movie.overview?.slice(0, 160),
      images: movie.backdrop_path
        ? [`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`]
        : [],
    },
  };
}

export default async function MoviePage({ params }: Props) {
  const { id } = await params;
  const [movie, cast, similar, videos] = await Promise.all([
    getMovieDetails(id),
    getCast('movie', id),
    getSimilar('movie', id),
    getVideos('movie', id),
  ]);

  const trailer = videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ?? videos[0];

  return (
    <>
      {/* Hero */}
      <div className="relative w-full h-[55vh] md:h-[70vh] min-h-[340px] md:min-h-[480px] overflow-hidden">
        {movie.backdrop_path && (
          <Image
            src={getImageUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/10 to-transparent" />

        <div className="absolute inset-0 flex items-end pb-6 md:pb-12 px-4 md:px-12">
          <div className="flex gap-5 md:gap-8 items-end w-full">
            {/* Poster — desktop only */}
            {movie.poster_path && (
              <div className="hidden md:block flex-shrink-0">
                <Image
                  src={getImageUrl(movie.poster_path, 'w342')}
                  alt={movie.title}
                  width={160}
                  height={240}
                  className="rounded-xl shadow-2xl ring-1 ring-white/10"
                />
              </div>
            )}

            <div className="flex flex-col min-w-0 flex-1">
              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {movie.genres.slice(0, 3).map((g) => (
                    <span key={g.id}
                      className="bg-[#e63946]/15 text-[#e63946] text-[10px] md:text-xs px-2 py-0.5 rounded-full border border-[#e63946]/30">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-white text-xl sm:text-2xl md:text-4xl font-bold mb-1.5 leading-tight">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="text-gray-400 italic text-xs md:text-sm mb-2 line-clamp-1">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-300 mb-4">
                <span className="font-bold md:text-base" style={{ color: getRatingColor(movie.vote_average) }}>
                  ★ {movie.vote_average.toFixed(1)}
                </span>
                <span className="text-gray-500 hidden sm:inline">
                  ({movie.vote_count?.toLocaleString()} votes)
                </span>
                {movie.release_date && (
                  <span className="hidden sm:inline">{formatDate(movie.release_date)}</span>
                )}
                {movie.release_date && (
                  <span className="sm:hidden">{new Date(movie.release_date).getFullYear()}</span>
                )}
                {movie.runtime && <span>{formatRuntime(movie.runtime)}</span>}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Link
                  href={`/watch/${movie.id}`}
                  className="inline-flex items-center gap-2 bg-[#e63946] hover:bg-[#c1121f] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all duration-200 active:scale-95 shadow-lg shadow-[#e63946]/30"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Now
                </Link>
                {trailer && <TrailerButton videoKey={trailer.key} title={movie.title} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 md:px-12 py-6 md:py-10 space-y-8 md:space-y-12 max-w-screen-xl mx-auto">
        <section>
          <h2 className="text-lg md:text-xl font-bold text-white mb-2">Overview</h2>
          <p className="text-gray-300 leading-relaxed text-sm md:text-base">{movie.overview}</p>
        </section>

        {/* Cast */}
        {cast.length > 0 && (
          <section>
            <h2 className="text-lg md:text-xl font-bold text-white mb-3">Cast</h2>
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
              {cast.slice(0, 15).map((member) => (
                <div key={member.id} className="flex-shrink-0 w-[80px] md:w-[100px] text-center">
                  <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden bg-[#1a1a24] mx-auto mb-1.5 ring-2 ring-white/5">
                    {member.profile_path ? (
                      <Image
                        src={getImageUrl(member.profile_path, 'w185')}
                        alt={member.name}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-2xl">👤</div>
                    )}
                  </div>
                  <p className="text-white text-[10px] md:text-xs font-semibold truncate">{member.name}</p>
                  <p className="text-gray-500 text-[10px] truncate mt-0.5">{member.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {similar.length > 0 && (
          <section className="-mx-4 md:-mx-12">
            <MovieRow title="Similar Movies" items={similar.slice(0, 12)} type="movie" />
          </section>
        )}
      </div>
    </>
  );
}
