import Link from 'next/link';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const STREAM_SERVERS = [
  { id: 1, name: 'MultiEmbed', badge: 'Multi-Sub' },
  { id: 2, name: 'Videasy AR', badge: 'Arabic Fast' },
  { id: 3, name: 'VidSrc VIP', badge: 'Multi-Res' },
  { id: 4, name: 'EmbedSU HD', badge: '1080p' },
];

async function getDashboardRealData() {
  if (!TMDB_API_KEY) {
    return {
      trending: [],
      trendingTodayCount: 0,
      totalMovies: 0,
      apiLatency: 'Offline',
    };
  }

  const startTime = Date.now();

  try {
    const [moviesRes, tvRes] = await Promise.all([
      fetch(
        `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}&language=en-US`,
        { next: { revalidate: 3600 } }
      ),
      fetch(
        `https://api.themoviedb.org/3/trending/tv/day?api_key=${TMDB_API_KEY}&language=en-US`,
        { next: { revalidate: 3600 } }
      ),
    ]);

    const latency = `${Date.now() - startTime}ms`;
    const moviesData = await moviesRes.json();
    const tvData = await tvRes.json();

    const moviesList = moviesData.results || [];
    const tvList = tvData.results || [];

    const trending = [
      ...moviesList.slice(0, 5).map((m: any) => ({ ...m, mediaType: 'Movie' })),
      ...tvList.slice(0, 5).map((s: any) => ({ ...s, mediaType: 'TV Series' })),
    ];

    return {
      trending,
      trendingTodayCount: moviesList.length + tvList.length,
      totalMovies: moviesData.total_results || 10000,
      apiLatency: latency,
    };
  } catch {
    return {
      trending: [],
      trendingTodayCount: 0,
      totalMovies: 0,
      apiLatency: 'Error',
    };
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboardRealData();

  const stats = [
    {
      title: 'Trending Media Today',
      value: data.trendingTodayCount.toString(),
      subtext: 'Live daily trending from TMDB',
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Active Stream Gateways',
      value: `${STREAM_SERVERS.length} / ${STREAM_SERVERS.length}`,
      subtext: 'Configured & ready in Player',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ),
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Indexed TMDB Movies',
      value: data.totalMovies.toLocaleString(),
      subtext: 'Available for streaming playback',
      icon: (
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'TMDB API Latency',
      value: data.apiLatency,
      subtext: 'Real-time response time',
      icon: (
        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      borderColor: 'border-yellow-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            Dashboard Overview
           
          </h1>
         
        </div>

        <Link
          href="/admin/streams"
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition self-start sm:self-auto"
        >
          Manage Streams
        </Link>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`p-5 bg-slate-900/90 border ${stat.borderColor} rounded-2xl shadow-xl flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                {stat.title}
              </span>
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                {stat.icon}
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white tracking-tight">
                {stat.value}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                {stat.subtext}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connected Gateways */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Connected Embed Stream Gateways
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Sync: Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {STREAM_SERVERS.map((srv) => (
            <div
              key={srv.id}
              className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {srv.name}
                </div>
                <div className="text-[10px] text-emerald-400 mt-1 font-mono">Status: Ready</div>
              </div>
              <span className="text-[9px] bg-slate-900 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded font-mono">
                {srv.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Media Live Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Trending Media (Real-Time TMDB)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Live streaming test endpoints</p>
          </div>
          <Link href="/admin/streams" className="text-xs text-emerald-400 hover:underline font-medium">
            View All Streams →
          </Link>
        </div>

        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-5">Title & Poster</th>
              <th className="py-3.5 px-5">TMDB ID</th>
              <th className="py-3.5 px-5">Type</th>
              <th className="py-3.5 px-5">Rating</th>
              <th className="py-3.5 px-5">Release Date</th>
              <th className="py-3.5 px-5 text-right">Instant Stream Test</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data.trending.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                  No catalog items found. Check your TMDB API configuration in .env.local
                </td>
              </tr>
            ) : (
              data.trending.map((item: any) => (
                <tr key={`${item.mediaType}-${item.id}`} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                          alt={item.title || item.name}
                          className="w-7 h-10 object-cover rounded shadow border border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-10 bg-slate-800 rounded flex items-center justify-center text-[10px]">
                          N/A
                        </div>
                      )}
                      <span className="font-semibold text-white">{item.title || item.name}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 font-mono text-xs text-slate-400">{item.id}</td>

                  <td className="py-3.5 px-5 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.mediaType === 'Movie'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-purple-950 text-purple-400 border border-purple-800'
                      }`}
                    >
                      {item.mediaType}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 text-xs text-yellow-400 font-medium">
                    ★ {item.vote_average?.toFixed(1)}
                  </td>

                  <td className="py-3.5 px-5 text-xs text-slate-400">
                    {item.release_date || item.first_air_date || 'N/A'}
                  </td>

                  <td className="py-3.5 px-5 text-right space-x-2">
                    <a
                      href={`https://vidsrc.to/embed/${item.mediaType === 'Movie' ? 'movie' : 'tv'}/${item.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block bg-slate-950 hover:bg-emerald-950 border border-slate-800 hover:border-emerald-700 text-slate-300 hover:text-emerald-400 text-xs px-2.5 py-1 rounded transition"
                    >
                      Test Server ↗
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}