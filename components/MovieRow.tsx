import Link from 'next/link';
import MovieCard from './MovieCard';
import type { Movie, Series } from '@/lib/types';

interface MovieRowProps {
  title: string;
  items: (Movie | Series)[];
  type?: 'movie' | 'tv';
  viewAllHref?: string;
}

export default function MovieRow({ title, items, type, viewAllHref }: MovieRowProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-4 md:px-8">
        <h2 className="text-white text-xl md:text-2xl font-bold">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-[#e63946] text-sm hover:underline flex items-center gap-1"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 md:px-8 pb-4 scrollbar-hide">
        {items.map((item) => (
          <MovieCard key={item.id} item={item} type={type} />
        ))}
      </div>
    </section>
  );
}
