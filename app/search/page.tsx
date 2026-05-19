import type { Metadata } from 'next';
import { searchMovies, searchSeries, getPopular } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import SearchPageClient from '@/components/SearchPageClient';
import type { Movie, Series } from '@/lib/types';

interface Props {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : 'Search Movies & Series',
    description: q
      ? `Search results for "${q}" on CineMay`
      : 'Search and discover movies and series on CineMay',
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, type, page } = await searchParams;
  const pageNum = parseInt(page ?? '1');
  const mediaType = type ?? 'all';

  let movieResults: Movie[] = [];
  let tvResults: Series[] = [];
  let totalResults = 0;

  if (q?.trim()) {
    if (mediaType === 'all' || mediaType === 'movie') {
      const movies = await searchMovies(q, pageNum);
      movieResults = movies.results;
      totalResults += movies.total_results;
    }
    if (mediaType === 'all' || mediaType === 'tv') {
      const tv = await searchSeries(q, pageNum);
      tvResults = tv.results;
      totalResults += tv.total_results;
    }
  } else {
    if (mediaType === 'tv') {
      tvResults = (await getPopular('tv', pageNum)) as Series[];
    } else if (mediaType === 'movie') {
      movieResults = (await getPopular('movie', pageNum)) as Movie[];
    } else {
      const [movies, tv] = await Promise.all([getPopular('movie'), getPopular('tv')]);
      movieResults = movies as Movie[];
      tvResults = tv as Series[];
    }
  }

  type TaggedMovie = Movie & { _type: 'movie' };
  type TaggedSeries = Series & { _type: 'tv' };

  const allResults: (TaggedMovie | TaggedSeries)[] = [
    ...movieResults.map((m) => ({ ...m, _type: 'movie' as const })),
    ...tvResults.map((t) => ({ ...t, _type: 'tv' as const })),
  ];

  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-16 px-3 md:px-8">
      <SearchPageClient query={q ?? ''} type={mediaType} totalResults={totalResults} />

      {allResults.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-4 mt-4">
          {allResults.map((item) => (
            <MovieCard key={`${item._type}-${item.id}`} item={item} type={item._type} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg
            className="w-16 h-16 text-gray-700 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-gray-500 text-lg font-medium">
            {q ? `No results found for "${q}"` : 'Search for movies and series'}
          </p>
          <p className="text-gray-700 text-sm mt-2">
            {q ? 'Try a different search term' : 'Type something in the search box above'}
          </p>
        </div>
      )}
    </div>
  );
}
