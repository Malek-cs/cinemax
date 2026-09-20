import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tmdbId = searchParams.get('tmdbId');
  const type = searchParams.get('type'); // 'movie' or 'tv'
  const season = searchParams.get('season') || '1';
  const episode = searchParams.get('episode') || '1';

  if (!tmdbId || !type) {
    return NextResponse.json({ servers: [] });
  }

  try {
    // 1. البحث في الاستثناءات (إذا قمت بإضافة سيرفر مخصص لهذا الفيلم من لوحة التحكم)
    const customStreams = await prisma.customStreamOverride.findMany({
      where: {
        tmdbId: parseInt(tmdbId),
        mediaType: type,
        ...(type === 'tv' ? { season: parseInt(season), episode: parseInt(episode) } : {})
      }
    });

    if (customStreams.length > 0) {
      const servers = customStreams.map(s => ({
        name: s.serverName,
        url: s.customUrl
      }));
      return NextResponse.json({ servers });
    }

    // 2. البحث في السيرفرات العامة للموقع (إذا تمت إضافتها في لوحة التحكم - جدول StreamGateway)
    const globalStreams = await prisma.streamGateway.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    if (globalStreams.length > 0) {
      const servers = globalStreams.map(g => {
         let url = type === 'movie' ? g.moviePattern : g.tvPattern;
         url = url.replace('{tmdbId}', tmdbId)
                  .replace('{season}', season)
                  .replace('{episode}', episode);
         return { name: g.name, url };
      });
      return NextResponse.json({ servers });
    }

    // 3. السيرفر الأساسي والافتراضي (VidSrc VIP) إذا كانت قاعدة البيانات فارغة
    return NextResponse.json({
      servers: [
        {
          name: 'Server 1 (VidSrc VIP)',
          url: type === 'movie' 
            ? `https://vidsrc.to/embed/movie/${tmdbId}`
            : `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`
        }
      ]
    });

  } catch (error) {
    console.error("Error fetching streams:", error);
    return NextResponse.json({ servers: [] });
  } finally {
    await prisma.$disconnect();
  }
}