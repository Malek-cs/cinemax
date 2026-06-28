import type { Metadata } from 'next';
import { getTrending, getPopular, getTopRated, getByGenre } from '@/lib/tmdb';
import HeroSection from '@/components/HeroSection';
import MovieRow from '@/components/MovieRow';
import GenreFilter from '@/components/GenreFilter';
import PalestineSupport from '@/components/PalestineSupport';
import ContinueWatchingRow from '@/components/ContinueWatchingRow';
import WatchlistRow from '@/components/WatchlistRow';
import FadeInSection from '@/components/FadeInSection';

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
  { id: 16, name: 'Animation' },
  { id: 10751, name: 'Family' },
];

interface HomePageProps {
  searchParams: Promise<{ genre?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { genre } = await searchParams;
  const activeGenreId = genre ? parseInt(genre) : null;

  // Find the active genre name for display in section headings
  const activeGenreName =
    activeGenreId !== null
      ? (GENRES.find((g) => g.id === activeGenreId)?.name ?? '')
      : '';

  const [trending, popularMovies, popularSeries, topRated] = await Promise.all([
    // Trending Now — when genre active, mix popular movies + TV of that genre
    activeGenreId
      ? Promise.all([
          getByGenre('movie', activeGenreId, 1),
          getByGenre('tv', activeGenreId, 1),
        ]).then(([movies, tvShows]) =>
          // Interleave movie + tv results then sort by popularity (vote_average × vote_count)
          [...movies, ...tvShows].sort(
            (a, b) =>
              b.vote_average * Math.log(b.vote_count + 1) -
              a.vote_average * Math.log(a.vote_count + 1)
          )
        )
      : getTrending('all', 'week'),

    // Popular Movies — filtered or global
    activeGenreId ? getByGenre('movie', activeGenreId) : getPopular('movie'),

    // Popular Series — filtered or global
    activeGenreId ? getByGenre('tv', activeGenreId) : getPopular('tv'),

    // Top Rated Movies — filtered or global (min 100 votes to avoid obscure films)
    activeGenreId
      ? getByGenre('movie', activeGenreId, 1, 'vote_average.desc', { 'vote_count.gte': 100 })
      : getTopRated('movie'),
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
        {/* Continue Watching — client component, only visible when there's history */}
        <FadeInSection delay={0}>
          <ContinueWatchingRow />
        </FadeInSection>

        {/* My List — client component, only visible when watchlist has items */}
        <FadeInSection delay={0}>
          <WatchlistRow />
        </FadeInSection>

        {/* Genre filter tabs */}
        <FadeInSection delay={60}>
          <div className="px-4 md:px-8">
            <GenreFilter genres={GENRES} activeGenreId={activeGenreId} basePath="/" />
          </div>
        </FadeInSection>

        {/* Section label when a genre is active */}
        {activeGenreId && activeGenreName && (
          <div className="px-4 md:px-8">
            <p className="text-gray-400 text-sm">
              Showing results for{' '}
              <span className="text-[#e63946] font-semibold">{activeGenreName}</span>
            </p>
          </div>
        )}

        <FadeInSection delay={0}>
          <MovieRow
            title={activeGenreId ? `Trending — ${activeGenreName}` : 'Trending Now'}
            items={trending.slice(0, 13).filter((_, i) => i !== heroIndex)}
          />
        </FadeInSection>

        <FadeInSection delay={0}>
          <MovieRow
            title={activeGenreId ? `Popular ${activeGenreName} Movies` : 'Popular Movies'}
            items={popularMovies.slice(0, 12)}
            type="movie"
            viewAllHref={
              activeGenreId
                ? `/search?type=movie&genre=${activeGenreId}`
                : '/search?type=movie'
            }
          />
        </FadeInSection>

        <FadeInSection delay={0}>
          <MovieRow
            title={activeGenreId ? `Popular ${activeGenreName} Series` : 'Popular Series'}
            items={popularSeries.slice(0, 12)}
            type="tv"
            viewAllHref={
              activeGenreId
                ? `/search?type=tv&genre=${activeGenreId}`
                : '/search?type=tv'
            }
          />
        </FadeInSection>

        <FadeInSection delay={0}>
          <MovieRow
            title={activeGenreId ? `Top Rated ${activeGenreName} Movies` : 'Top Rated Movies'}
            items={topRated.slice(0, 12)}
            type="movie"
            viewAllHref={
              activeGenreId
                ? `/search?type=movie&genre=${activeGenreId}`
                : '/search?type=movie'
            }
          />
        </FadeInSection>
      </div>
    </>
  );
}
