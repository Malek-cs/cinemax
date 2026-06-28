'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getWatchlist, removeFromWatchlist, updateWatchlistEntry } from '@/lib/watchlist';
import type { WatchlistEntry } from '@/lib/watchlist';
import { getImageUrl } from '@/lib/utils';

export default function WatchlistRow() {
  const [list, setList] = useState<WatchlistEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const entries = getWatchlist();
    setList(entries);

    // Hydrate any old entries that are missing posterPath or title
    const stale = entries.filter((e) => !e.posterPath || !e.title);
    if (stale.length === 0) return;

    Promise.all(
      stale.map((e) =>
        fetch(`/api/media?id=${e.id}&type=${e.type}`)
          .then((r) => r.json())
          .then((d) => ({ ...e, posterPath: d.posterPath ?? null, title: d.title ?? e.title ?? '' }))
          .catch(() => e)
      )
    ).then((hydrated) => {
      hydrated.forEach(updateWatchlistEntry);
      setList(getWatchlist());
    });
  }, []);

  if (!mounted || list.length === 0) return null;

  function handleRemove(id: number, type: string) {
    removeFromWatchlist(id, type);
    setList((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
  }

  return (
    <section className="space-y-3">
      <div className="px-4 md:px-8">
        <h2 className="text-white text-xl md:text-2xl font-bold flex items-center gap-3">
          <span className="w-1 h-6 bg-[#e63946] rounded-full inline-block flex-shrink-0" />
          My List
        </h2>
      </div>

      {/* Mobile: 2-column grid · Desktop: horizontal scroll row */}
      <div className="px-4 md:px-8">
        {/* grid on mobile */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          {list.map((item) => (
            <Card key={`${item.type}-${item.id}`} item={item} onRemove={handleRemove} />
          ))}
        </div>
        {/* scroll row on sm+ */}
        <div className="hidden sm:flex gap-3 overflow-x-auto pb-4 scrollbar-red">
          {list.map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex-shrink-0 w-[145px] md:w-[170px]">
              <Card item={item} onRemove={handleRemove} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({
  item,
  onRemove,
}: {
  item: WatchlistEntry;
  onRemove: (id: number, type: string) => void;
}) {
  const href = item.type === 'movie' ? `/movies/${item.id}` : `/series/${item.id}`;
  const watchHref =
    item.type === 'movie' ? `/watch/${item.id}` : `/watch/${item.id}?type=tv`;

  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-xl bg-[#111118] aspect-[2/3]">
        {item.posterPath ? (
          <Image
            src={getImageUrl(item.posterPath, 'w342')}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 145px, 170px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-[#1a1a24] flex items-center justify-center p-3">
            <span className="text-gray-500 text-xs text-center">{item.title}</span>
          </div>
        )}

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Play button */}
        <Link
          href={watchHref}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <div className="w-12 h-12 rounded-full bg-[#e63946] flex items-center justify-center shadow-xl shadow-black/50 scale-90 group-hover:scale-100 transition-transform duration-200">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </Link>

        {/* Remove × */}
        <button
          onClick={() => onRemove(item.id, item.type)}
          title="Remove from My List"
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#e63946] z-10"
        >
          ×
        </button>

        {/* Type badge */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">
          {item.type === 'movie' ? 'Movie' : 'Series'}
        </div>
      </div>

      <div className="mt-2 px-0.5">
        <Link href={href}>
          <h3 className="text-white hover:text-[#e63946] transition-colors duration-200 text-xs font-semibold truncate">
            {item.title}
          </h3>
        </Link>
        <p className="text-gray-500 text-[10px] mt-0.5">
          {item.type === 'movie' ? 'Movie' : 'Series'}
        </p>
      </div>
    </div>
  );
}
