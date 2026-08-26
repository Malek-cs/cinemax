'use client';

import { useState, useEffect, useMemo } from 'react';
import { STREAM_SERVERS } from '@/lib/servers';

interface TMDBMovieResult {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
}

interface TMDBTVResult {
  id: number;
  name: string;
  poster_path: string | null;
  vote_average: number;
  first_air_date?: string;
}

interface TMDBResponse<T> {
  results?: T[];
}

interface MediaItem {
  id: number;
  title: string;
  type: 'Movie' | 'TV Series';
  poster: string | null;
  rating: string;
  releaseDate: string;
  servers: { name: string; url: string }[];
}

export default function AdminStreamsPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'Movie' | 'TV Series'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '8265bd1679663a7ea12ac168da84d2e8';
        const p1 = (currentPage - 1) * 2 + 1;
        const p2 = p1 + 1;

        const [mRes1, mRes2, tvRes1, tvRes2] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&page=${p1}`),
          fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&page=${p2}`),
          fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&page=${p1}`),
          fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&page=${p2}`),
        ]);

        const [mData1, mData2, tvData1, tvData2] = await Promise.all([
          mRes1.json() as Promise<TMDBResponse<TMDBMovieResult>>,
          mRes2.json() as Promise<TMDBResponse<TMDBMovieResult>>,
          tvRes1.json() as Promise<TMDBResponse<TMDBTVResult>>,
          tvRes2.json() as Promise<TMDBResponse<TMDBTVResult>>,
        ]);

        if (!isMounted) return;

        // تصفية التكرارات عبر Map
        const uniqueMoviesMap = new Map<number, TMDBMovieResult>();
        [...(mData1.results ?? []), ...(mData2.results ?? [])].forEach((m) => {
          if (m?.id && !uniqueMoviesMap.has(m.id)) {
            uniqueMoviesMap.set(m.id, m);
          }
        });

        const uniqueTvMap = new Map<number, TMDBTVResult>();
        [...(tvData1.results ?? []), ...(tvData2.results ?? [])].forEach((t) => {
          if (t?.id && !uniqueTvMap.has(t.id)) {
            uniqueTvMap.set(t.id, t);
          }
        });

        const movies: MediaItem[] = Array.from(uniqueMoviesMap.values()).map((m) => ({
          id: m.id,
          title: m.title || 'Untitled Movie',
          type: 'Movie',
          poster: m.poster_path,
          rating: typeof m.vote_average === 'number' ? m.vote_average.toFixed(1) : '0.0',
          releaseDate: m.release_date ? m.release_date.split('-')[0] : 'N/A',
          servers: STREAM_SERVERS.map((srv) => ({
            name: srv.name,
            url: srv.movie(m.id),
          })),
        }));

        const series: MediaItem[] = Array.from(uniqueTvMap.values()).map((s) => ({
          id: s.id,
          title: s.name || 'Untitled Show',
          type: 'TV Series',
          poster: s.poster_path,
          rating: typeof s.vote_average === 'number' ? s.vote_average.toFixed(1) : '0.0',
          releaseDate: s.first_air_date ? s.first_air_date.split('-')[0] : 'N/A',
          servers: STREAM_SERVERS.map((srv) => ({
            name: srv.name,
            url: srv.tv(s.id, 1, 1),
          })),
        }));

        setMediaList([...movies, ...series]);
      } catch {
        if (isMounted) setMediaList([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const filteredList = useMemo(() => {
    return mediaList.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toString().includes(searchQuery);

      const matchesType = filterType === 'all' ? true : item.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [mediaList, searchQuery, filterType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Active Media & Stream Servers</h1>
        <p className="text-xs text-slate-400 mt-1">
          Catalog synchronized with TMDB — Multi-server inspection & fallback endpoints.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by Title or TMDB ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {(['all', 'Movie', 'TV Series'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                filterType === type
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {type === 'all' ? `All (${mediaList.length})` : type === 'Movie' ? 'Movies' : 'TV Series'}
            </button>
          ))}
        </div>
      </div>

      {/* Streams Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Media & Poster</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Rating</th>
              <th className="py-3.5 px-4">Configured Gateways ({STREAM_SERVERS.length})</th>
              <th className="py-3.5 px-4 text-right">Watch Page</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading streams catalog...</span>
                  </div>
                </td>
              </tr>
            ) : filteredList.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-slate-500">
                  No matching media found for &quot;{searchQuery}&quot;
                </td>
              </tr>
            ) : (
              filteredList.map((item, index) => (
                <tr
                  key={`${item.type}-${item.id}-${index}`}
                  className="hover:bg-slate-800/40 transition"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {item.poster ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${item.poster}`}
                          alt={item.title}
                          className="w-8 h-12 object-cover rounded border border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-12 bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-500">
                          N/A
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: {item.id} · {item.releaseDate}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.type === 'Movie'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-purple-950 text-purple-400 border border-purple-800'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-yellow-400 font-medium">
                    ★ {item.rating}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.servers.map((srv, idx) => (
                        <a
                          key={idx}
                          href={srv.url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-950 hover:bg-emerald-950 border border-slate-800 hover:border-emerald-700 text-slate-300 hover:text-emerald-400 px-2.5 py-1 rounded text-[11px] font-medium transition shrink-0"
                          title={`Open ${srv.name}`}
                        >
                          Server {idx + 1}
                        </a>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={`/watch/${item.id}?type=${item.type === 'Movie' ? 'movie' : 'tv'}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-400 hover:underline font-medium"
                    >
                      Open in Player ↗
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page <span className="text-white font-bold">{currentPage}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition cursor-pointer"
            >
              ← Previous Page
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={loading}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:text-white disabled:opacity-40 transition cursor-pointer"
            >
              Next Page →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}