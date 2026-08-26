'use client';

import { useState } from 'react';

export default function AddOrEditStreamPage() {
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [tmdbId, setTmdbId] = useState('');
  const [title, setTitle] = useState('');
  const [poster, setPoster] = useState('');
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // السيرفرات القابلة للتعديل
  const [servers, setServers] = useState([
    { name: 'Server 1 (MultiEmbed)', url: '' },
    { name: 'Server 2 (Videasy AR)', url: '' },
    { name: 'Server 3 (VidSrc VIP)', url: '' },
    { name: 'Server 4 (EmbedSU HD)', url: '' },
  ]);

  // دالة توليد روابط السيرفرات الافتراضية
  const generateServerUrls = (id: string, s: number, e: number, type: 'movie' | 'tv') => {
    if (!id) return;
    if (type === 'movie') {
      setServers([
        { name: 'Server 1 (MultiEmbed)', url: `https://multiembed.mov/?video_id=${id}&tmdb=1` },
        { name: 'Server 2 (Videasy AR)', url: `https://player.videasy.net/movie/${id}?lang=ar&sub_lang=ar` },
        { name: 'Server 3 (VidSrc VIP)', url: `https://vidsrc.to/embed/movie/${id}` },
        { name: 'Server 4 (EmbedSU HD)', url: `https://embed.su/embed/movie/${id}` },
      ]);
    } else {
      setServers([
        { name: 'Server 1 (MultiEmbed)', url: `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
        { name: 'Server 2 (Videasy AR)', url: `https://player.videasy.net/tv/${id}/${s}/${e}?lang=ar&sub_lang=ar` },
        { name: 'Server 3 (VidSrc VIP)', url: `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
        { name: 'Server 4 (EmbedSU HD)', url: `https://embed.su/embed/tv/${id}/${s}/${e}` },
      ]);
    }
  };

  // جلب البيانات من TMDB بالمعرف
  const handleFetchTMDB = async () => {
    if (!tmdbId) return;
    setLoading(true);
    setSavedSuccess(false);
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '8265bd1679663a7ea12ac168da84d2e8';
      const res = await fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${apiKey}&language=en-US`);
      const data = await res.json();

      if (data.id) {
        setTitle(data.title || data.name);
        setPoster(data.poster_path ? `https://image.tmdb.org/t/p/w342${data.poster_path}` : '');
        generateServerUrls(tmdbId, season, episode, mediaType);
      } else {
        alert('Media not found on TMDB. Please check the ID.');
      }
    } catch {
      alert('Failed to connect to TMDB API.');
    } finally {
      setLoading(false);
    }
  };

  // تحديث رابط سيرفر معين
  const handleServerUrlChange = (index: number, newUrl: string) => {
    const updated = [...servers];
    updated[index].url = newUrl;
    setServers(updated);
  };

  // إضافة سيرفر مخصص إضافي (Direct M3U8 أو Embed خارجي)
  const handleAddCustomServer = () => {
    setServers([...servers, { name: `Custom Server ${servers.length + 1}`, url: '' }]);
  };

  // حذف سيرفر
  const handleRemoveServer = (index: number) => {
    setServers(servers.filter((_, i) => i !== index));
  };

  // نشر وحفظ الإعدادات
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !tmdbId) {
      alert('Please provide a valid title and TMDB ID');
      return;
    }

    // هنا يتم إرسال البيانات للباك إند أو تخزينها
    console.log({
      tmdbId,
      mediaType,
      title,
      season: mediaType === 'tv' ? season : undefined,
      episode: mediaType === 'tv' ? episode : undefined,
      servers,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Add & Configure Stream Servers</h1>
        <p className="text-xs text-slate-400 mt-1">
          Auto-fetch movie/series metadata and configure custom or fallback stream embed URLs.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* النوع: فيلم أو مسلسل */}
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Category
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setMediaType('movie');
                  generateServerUrls(tmdbId, 1, 1, 'movie');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition border ${
                  mediaType === 'movie'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                 Movie
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaType('tv');
                  generateServerUrls(tmdbId, season, episode, 'tv');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition border ${
                  mediaType === 'tv'
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                TV Series
              </button>
            </div>
          </div>

          {/* TMDB Auto-Fetch Input */}
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              TMDB ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                
                value={tmdbId}
                onChange={(e) => setTmdbId(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleFetchTMDB}
                disabled={loading || !tmdbId}
                className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Fetching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* إذا كان مسلسلاً: إعداد الموسم والحلقة */}
          {mediaType === 'tv' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <div>
                <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                  Season Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={season}
                  onChange={(e) => {
                    const s = parseInt(e.target.value) || 1;
                    setSeason(s);
                    generateServerUrls(tmdbId, s, episode, 'tv');
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                  Episode Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={episode}
                  onChange={(e) => {
                    const ep = parseInt(e.target.value) || 1;
                    setEpisode(ep);
                    generateServerUrls(tmdbId, season, ep, 'tv');
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* معاينة العنوان والبوستر */}
          <div className="flex gap-4 items-start">
            {poster && (
              <img
                src={poster}
                alt="Poster"
                className="w-20 h-28 object-cover rounded-xl border border-slate-800 shrink-0 shadow-lg"
              />
            )}
            <div className="flex-1">
              <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Title
              </label>
              <input
                type="text"
                placeholder="Movie or Series Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* قائمة تعديل السيرفرات */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Configured Stream Gateways & Embed URLs
              </label>
              <button
                type="button"
                onClick={handleAddCustomServer}
                className="text-[11px] text-emerald-400 hover:underline font-semibold"
              >
                + Add Another Server
              </button>
            </div>

            {servers.map((server, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center gap-3"
              >
                <input
                  type="text"
                  value={server.name}
                  onChange={(e) => {
                    const updated = [...servers];
                    updated[idx].name = e.target.value;
                    setServers(updated);
                  }}
                  className="w-full sm:w-44 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
                />

                <input
                  type="text"
                  placeholder="https://server.domain/embed/... or .m3u8"
                  value={server.url}
                  onChange={(e) => handleServerUrlChange(idx, e.target.value)}
                  className="flex-1 w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
                />

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {server.url && (
                    <a
                      href={server.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs rounded-lg transition"
                      title="Test URL"
                    >
                      Test ↗
                    </a>
                  )}
                  {servers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveServer(idx)}
                      className="px-2.5 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-400 text-xs rounded-lg border border-red-800/40 transition"
                      title="Remove Server"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* تنبيه النجاح */}
          {savedSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl text-center font-medium">
              ✓ Stream servers and endpoints updated successfully!
            </div>
          )}

          {/* زر الحفظ والنشر */}
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            Save & Publish Stream
          </button>
        </form>
      </div>
    </div>
  );
}