export interface StreamServer {
  name: string;
  movie: (id: number) => string;
  tv: (id: number, season?: number, episode?: number) => string;
}

export const STREAM_SERVERS: StreamServer[] = [
  {
    name: 'Server 3 (VidSrc VIP)',
    movie: (id: number) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id: number, s = 1, e = 1) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: 'Server 4 (EmbedSU)',
    movie: (id: number) => `https://embed.su/embed/movie/${id}`,
    tv: (id: number, s = 1, e = 1) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
  // لحذف سيرفر: احذف كتلته من هنا
  // لإضافة سيرفر جديد: أضف كتلته هنا مباشرة
];