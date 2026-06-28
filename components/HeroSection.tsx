import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, getRatingColor, truncateText } from '@/lib/utils';
import type { Movie, Series } from '@/lib/types';

interface HeroSectionProps {
  item: Movie | Series;
}

function isMovie(item: Movie | Series): item is Movie {
  return 'title' in item;
}

export default function HeroSection({ item }: HeroSectionProps) {
  const title = isMovie(item) ? item.title : (item as Series).name;
  const date = isMovie(item) ? item.release_date : (item as Series).first_air_date;
  const type = isMovie(item) ? 'movie' : 'tv';
  const detailHref = type === 'movie' ? `/movies/${item.id}` : `/series/${item.id}`;
  const watchHref = type === 'movie' ? `/watch/${item.id}` : `/watch/${item.id}?type=tv`;

  return (
    <section className="relative w-full h-[75vh] md:h-[88vh] min-h-[440px] overflow-hidden">
      {item.backdrop_path ? (
        <Image
          src={getImageUrl(item.backdrop_path, 'original')}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top animate-ken-burns"
        />
      ) : (
        <div className="absolute inset-0 bg-[#111118]" />
      )}

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/10 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-20 px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="max-w-xl md:max-w-2xl">
          {/* Meta row */}
          <div className="flex items-center gap-2.5 mb-3">
            <span className="bg-[#e63946] text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded uppercase tracking-widest">
              {type === 'movie' ? 'Movie' : 'Series'}
            </span>
            <span className="font-bold text-sm" style={{ color: getRatingColor(item.vote_average) }}>
              ★ {item.vote_average.toFixed(1)}
            </span>
            {date && (
              <span className="text-gray-400 text-sm">{new Date(date).getFullYear()}</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
            {title}
          </h1>

          {/* Overview — shorter on mobile */}
          {item.overview && (
            <p className="text-gray-300 text-sm md:text-base mb-5 leading-relaxed">
              <span className="md:hidden">{truncateText(item.overview, 110)}</span>
              <span className="hidden md:inline">{truncateText(item.overview, 220)}</span>
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-2.5">
            <Link
              href={watchHref}
              className="flex items-center gap-1.5 bg-[#e63946] hover:bg-[#c1121f] text-white font-semibold px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base transition-all duration-200 active:scale-95 shadow-lg shadow-[#e63946]/30"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play Now
            </Link>
            <Link
              href={detailHref}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base transition-all duration-200 border border-white/20"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">More Info</span>
              <span className="sm:hidden">Info</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
