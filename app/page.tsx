import type { Metadata } from 'next';
import { getTrending, getPopular, getTopRated, getByGenre } from '@/lib/tmdb';
import HeroSection from '@/components/HeroSection';
import MovieRow from '@/components/MovieRow';
import GenreFilter from '@/components/GenreFilter';
import PalestineSupport from '@/components/PalestineSupport';

export const metadata: Metadata = {
  title: 'CineMay — Watch Movies & Series Online',
  description:
    'Stream trending movies and popular TV series for free on CineMay. Updated daily with the latest content.',
};

const GENRES = [
  { id: null, name: 'All' },
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 27, name: 'Horror' },
  { id: 878, name: 'Sci-Fi' },
  { id: 18, name: 'Drama' },
  { id: 10749, name: 'Romance' },
  { id: 53, name: 'Thriller' },
];

interface HomePageProps {
  searchParams: Promise<{ genre?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { genre } = await searchParams;
  const activeGenreId = genre ? parseInt(genre) : null;

  const [trending, popularMovies, popularSeries, topRated] = await Promise.all([
    getTrending('all', 'week'),
    activeGenreId ? getByGenre('movie', activeGenreId) : getPopular('movie'),
    activeGenreId ? getByGenre('tv', activeGenreId) : getPopular('tv'),
    getTopRated('movie'),
  ]);

  const heroIndex = Math.floor(Math.random() * Math.min(trending.length, 10));
  const hero = trending[heroIndex];

  return (
    <>
      {/* Palestine flag — top-right corner */}
      <div className="fixed top-16 md:top-20 right-3 md:right-5 z-40">
        <PalestineSupport />
      </div>

      {hero && <HeroSection item={hero} />}

      <div className="space-y-10 py-10">
        <div className="px-4 md:px-8">
          <GenreFilter genres={GENRES} activeGenreId={activeGenreId} basePath="/" />
        </div>

        <MovieRow title="Trending Now" items={trending.slice(1, 13)} />

        <MovieRow
          title="Popular Movies"
          items={popularMovies.slice(0, 12)}
          type="movie"
          viewAllHref="/search?type=movie"
        />

        <MovieRow
          title="Popular Series"
          items={popularSeries.slice(0, 12)}
          type="tv"
          viewAllHref="/search?type=tv"
        />

        <MovieRow
          title="Top Rated Movies"
          items={topRated.slice(0, 12)}
          type="movie"
          viewAllHref="/search?type=movie"
        />
      </div>
    </>
  );
}
