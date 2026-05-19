'use client';

import { useRouter } from 'next/navigation';

interface SearchPageClientProps {
  query: string;
  type: string;
  totalResults: number;
}

export default function SearchPageClient({ query, type, totalResults }: SearchPageClientProps) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem('q') as HTMLInputElement).value.trim();
    const newType = (form.elements.namedItem('type') as HTMLSelectElement).value;
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (newType !== 'all') params.set('type', newType);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="space-y-4 mb-2">
      <h1 className="text-white text-2xl md:text-3xl font-bold">
        {query ? (
          <>
            Results for{' '}
            <span className="text-[#e63946]">&ldquo;{query}&rdquo;</span>
          </>
        ) : (
          'Browse All'
        )}
        {totalResults > 0 && (
          <span className="text-gray-500 text-base font-normal ml-3">
            ({totalResults.toLocaleString()} results)
          </span>
        )}
      </h1>

      <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search movies, series..."
          className="flex-1 min-w-[200px] bg-[#111118] border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#e63946] transition-colors"
        />
        <select
          name="type"
          defaultValue={type}
          className="bg-[#111118] border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#e63946] transition-colors"
        >
          <option value="all">All Types</option>
          <option value="movie">Movies Only</option>
          <option value="tv">Series Only</option>
        </select>
        <button
          type="submit"
          className="bg-[#e63946] hover:bg-[#c1121f] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  );
}
