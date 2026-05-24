export interface WatchHistoryItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  season?: number;
  episode?: number;
  watchedAt: number;
}

const STORAGE_KEY = 'cinemax_watch_history';
const MAX_ITEMS = 20;

function getStorageKey(userEmail?: string): string {
  return userEmail ? `${STORAGE_KEY}_${userEmail}` : STORAGE_KEY;
}

export function getWatchHistory(userEmail?: string): WatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(getStorageKey(userEmail));
    return data ? (JSON.parse(data) as WatchHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveToWatchHistory(item: WatchHistoryItem, userEmail?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(userEmail);
    // Remove existing entry for same item
    const history = getWatchHistory(userEmail).filter(
      (h) => !(h.id === item.id && h.type === item.type)
    );
    // Add to front with current timestamp
    history.unshift({ ...item, watchedAt: Date.now() });
    localStorage.setItem(key, JSON.stringify(history.slice(0, MAX_ITEMS)));
  } catch {
    // Silently fail if localStorage is full or unavailable
  }
}

export function removeFromWatchHistory(
  id: number,
  type: 'movie' | 'tv',
  userEmail?: string
): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(userEmail);
    const history = getWatchHistory(userEmail).filter(
      (h) => !(h.id === id && h.type === type)
    );
    localStorage.setItem(key, JSON.stringify(history));
  } catch {
    // Silently fail
  }
}
