import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, getRatingColor } from '@/lib/utils';
import type { Movie, Series } from '@/lib/types';
import WatchlistButton from './WatchlistButton';

interface MovieCardProps {
  item: (Movie | Series) & { _type?: string };
  type?: 'movie' | 'tv';
}

function isMovie(item: Movie | Series): item is Movie {
  return 'title' in item;
}

export default function MovieCard({ item, type }: MovieCardProps) {
  const title = isMovie(item) ? item.title : (item as Series).name;
  const date = isMovie(item) ? item.release_date : (item as Series).first_air_date;
  const mediaType =
    type ?? ((item as { _type?: string })._type as 'movie' | 'tv') ?? (isMovie(item) ? 'movie' : 'tv');
  const href = mediaType === 'movie' ? `/movies/${item.id}` : `/series/${item.id}`;

  return (
    <Link href={href} className="group flex-shrink-0 w-[120px] sm:w-[145px] md:w-[170px]">
      <div className="relative overflow-hidden rounded-lg bg-[#111118] aspect-[2/3]">
        {item.poster_path ? (
          <Image
            src={getImageUrl(item.poster_path, 'w342')}
            alt={title}
            fill
            sizes="(max-width: 640px) 120px, (max-width: 768px) 145px, 170px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-[#1a1a24] flex items-center justify-center p-2">
            <span className="text-gray-600 text-[10px] text-center">{title}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-bold px-1 py-0.5 rounded border"
              style={{
                color: getRatingColor(item.vote_average),
                borderColor: getRatingColor(item.vote_average),
              }}
            >
              {item.vote_average.toFixed(1)}
            </span>
            <div className="w-7 h-7 rounded-full bg-[#e63946] flex items-center justify-center shadow-lg">
              <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">
          {mediaType === 'movie' ? 'Movie' : 'Series'}
        </div>

        {/* Watchlist button — top right, visible on hover */}
        <div className="absolute top-1.5 right-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <WatchlistButton id={item.id} type={mediaType} title={title} posterPath={item.poster_path ?? null} />
        </div>
      </div>

      <div className="mt-1.5 px-0.5">
        <h3 className="text-white group-hover:text-[#e63946] transition-colors duration-200 text-xs font-medium truncate">{title}</h3>
        <p className="text-gray-500 text-[10px] mt-0.5">
          {date ? new Date(date).getFullYear() : 'N/A'}
        </p>
      </div>
    </Link>
  );
}
