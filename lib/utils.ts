export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatYear(dateStr: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).getFullYear().toString();
}

export function formatRuntime(minutes: number | undefined): string {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function getRatingColor(rating: number): string {
  if (rating >= 7.5) return '#22c55e';
  if (rating >= 5) return '#eab308';
  return '#ef4444';
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text ?? '';
  return text.substring(0, maxLength).trim() + '...';
}

export function getImageUrl(path: string | null, size = 'w500'): string {
  if (!path) return '/placeholder.jpg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
