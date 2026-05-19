'use client';

import { useRouter } from 'next/navigation';

interface Genre {
  id: number | null;
  name: string;
}

interface GenreFilterProps {
  genres: Genre[];
  activeGenreId: number | null;
  basePath?: string;
}

export default function GenreFilter({
  genres,
  activeGenreId,
  basePath = '/',
}: GenreFilterProps) {
  const router = useRouter();

  function handleGenreChange(genreId: number | null) {
    const params = new URLSearchParams();
    if (genreId !== null) params.set('genre', String(genreId));
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {genres.map((genre) => (
        <button
          key={genre.id ?? 'all'}
          onClick={() => handleGenreChange(genre.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeGenreId === genre.id
              ? 'bg-[#e63946] text-white'
              : 'bg-[#1a1a24] text-gray-400 hover:bg-[#2a2a34] hover:text-white'
          }`}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
}
