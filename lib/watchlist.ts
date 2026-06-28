export interface WatchlistEntry {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
}

const KEY = 'cinemax_watchlist';

export function getWatchlist(): WatchlistEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as WatchlistEntry[];
  } catch {
    return [];
  }
}

export function isInWatchlist(id: number, type: string): boolean {
  return getWatchlist().some((i) => i.id === id && i.type === type);
}

export function toggleWatchlist(entry: WatchlistEntry): boolean {
  const list = getWatchlist();
  const exists = list.some((i) => i.id === entry.id && i.type === entry.type);
  const updated = exists
    ? list.filter((i) => !(i.id === entry.id && i.type === entry.type))
    : [...list, entry];
  localStorage.setItem(KEY, JSON.stringify(updated));
  return !exists;
}

export function removeFromWatchlist(id: number, type: string): void {
  const updated = getWatchlist().filter((i) => !(i.id === id && i.type === type));
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function updateWatchlistEntry(entry: WatchlistEntry): void {
  if (typeof window === 'undefined') return;
  const list = getWatchlist().map((i) =>
    i.id === entry.id && i.type === entry.type ? entry : i
  );
  localStorage.setItem(KEY, JSON.stringify(list));
}
