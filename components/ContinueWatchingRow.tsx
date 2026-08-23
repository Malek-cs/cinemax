'use client';

import { useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getWatchHistory, removeFromWatchHistory } from '@/lib/watchHistory';
import type { WatchHistoryItem } from '@/lib/watchHistory';
import { getImageUrl } from '@/lib/utils';

export default function ContinueWatchingRow() {
  const { data: session } = useSession();

  // جلب السجل بشكل متزامن وآمن من المتصفح بدون أخطاء ESLint أو Hydration
  const history: WatchHistoryItem[] = useSyncExternalStore(
    (callback) => {
      window.addEventListener('storage', callback);
      return () => window.removeEventListener('storage', callback);
    },
    () => getWatchHistory(session?.user?.email ?? undefined),
    () => []
  );

  if (history.length === 0) return null;

  function handleRemove(id: number, type: 'movie' | 'tv') {
    removeFromWatchHistory(id, type, session?.user?.email ?? undefined);
    // إرسال حدث لتحديث الـ UI فوراً
    window.dispatchEvent(new Event('storage'));
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-4 md:px-8">
        <h2 className="text-white text-xl md:text-2xl font-bold flex items-center gap-3">
          <span className="w-1 h-6 bg-[#e63946] rounded-full inline-block" />
          Continue Watching
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 md:px-8 pb-4 scrollbar-hide">
        {history.map((item) => {
          const watchHref =
            item.type === 'movie'
              ? `/watch/${item.id}`
              : `/watch/${item.id}?type=tv&season=${item.season ?? 1}&episode=${item.episode ?? 1}`;

          return (
            <div
              key={`${item.type}-${item.id}`}
              className="group flex-shrink-0 w-[120px] sm:w-[145px] md:w-[170px]"
            >
              <div className="relative overflow-hidden rounded-lg bg-[#111118] aspect-[2/3]">
                {item.posterPath ? (
                  <Image
                    src={getImageUrl(item.posterPath, 'w342')}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 120px, (max-width: 768px) 145px, 170px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1a1a24] flex items-center justify-center p-2">
                    <span className="text-gray-600 text-[10px] text-center">{item.title}</span>
                  </div>
                )}

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Centered play button on hover */}
                <Link
                  href={watchHref}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <div className="w-12 h-12 rounded-full bg-[#e63946] flex items-center justify-center shadow-xl shadow-black/50 scale-90 group-hover:scale-100 transition-transform duration-200">
                    <svg
                      className="w-5 h-5 text-white ml-0.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </Link>

                {/* Remove (×) button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove(item.id, item.type);
                  }}
                  title="Remove from history"
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#e63946] z-10"
                >
                  ×
                </button>

                {/* Type badge */}
                <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">
                  {item.type === 'movie' ? 'Movie' : 'Series'}
                </div>

                {/* Watched progress indicator */}
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#e63946]/80" />

                {/* Season / Episode badge for TV */}
                {item.type === 'tv' && (
                  <div className="absolute bottom-1.5 left-1.5 bg-[#e63946]/90 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    S{item.season} · E{item.episode}
                  </div>
                )}

                {/* Continue label */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2 translate-y-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Link
                    href={watchHref}
                    className="flex items-center justify-center gap-1 text-white text-[10px] font-semibold w-full"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    {item.type === 'tv' ? 'Continue' : 'Resume'}
                  </Link>
                </div>
              </div>

              <div className="mt-1.5 px-0.5">
                <Link href={watchHref}>
                  <h3 className="text-white text-xs font-medium truncate hover:text-[#e63946] transition-colors">
                    {item.title}
                  </h3>
                </Link>
                {item.type === 'tv' ? (
                  <p className="text-gray-500 text-[10px] mt-0.5">
                    Season {item.season}, Ep {item.episode}
                  </p>
                ) : (
                  <p className="text-gray-500 text-[10px] mt-0.5">Movie</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}