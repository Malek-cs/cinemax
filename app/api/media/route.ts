import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Replace this with your actual database client (e.g. Prisma / Mongoose / Drizzle)
// import { db } from '@/lib/db';

// Helper to verify admin authentication session cookie
function isAuthenticated(req: Request): boolean {
  const cookieHeader = req.headers.get('cookie') || '';
  const token = cookieHeader
    .split('; ')
    .find((row) => row.startsWith('admin_session='))
    ?.split('=')[1];

  if (!token) return false;

  const [timestamp, signature] = token.split('.');
  if (!timestamp || !signature) return false;

  const secret = process.env.SESSION_SECRET || process.env.ADMIN_SECRET_KEY;
  if (!secret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(timestamp)
    .digest('hex');

  const bufActual = Buffer.from(signature);
  const bufExpected = Buffer.from(expectedSignature);

  return (
    bufActual.length === bufExpected.length &&
    crypto.timingSafeEqual(bufActual, bufExpected)
  );
}

// 1. GET: Fetch all movies/series or filter by type
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'movie' or 'tv'

    // Example DB Query:
    // const media = await db.media.findMany({
    //   where: type ? { type } : undefined,
    //   orderBy: { createdAt: 'desc' }
    // });

    // Mock response:
    const media = [
      {
        id: '1',
        title: 'Oppenheimer',
        type: 'movie',
        tmdbId: '872585',
        poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        rating: 8.9,
        releaseYear: 2023,
        servers: [
          { name: 'VidSrc Auto', url: 'https://vidsrc.to/embed/movie/872585' },
          { name: 'AutoEmbed Multi', url: 'https://autoembed.to/movie/tmdb/872585' }
        ]
      }
    ];

    return NextResponse.json({ success: true, data: media }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

// 2. POST: Add a new movie or TV series with stream servers
export async function POST(req: Request) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, type, tmdbId, poster, backdrop, overview, rating, releaseDate, servers } = body;

    if (!title || !tmdbId || !type) {
      return NextResponse.json(
        { error: 'Title, Type, and TMDB ID are required fields.' },
        { status: 400 }
      );
    }

    // Example DB Insertion:
    // const newMedia = await db.media.create({
    //   data: { title, type, tmdbId, poster, backdrop, overview, rating, releaseDate, servers }
    // });

    return NextResponse.json(
      { success: true, message: 'Media published successfully', data: body },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to save media' }, { status: 500 });
  }
}

// 3. PUT: Update existing media or servers
export async function PUT(req: Request) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, overview, servers } = body;

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    // Example DB Update:
    // const updated = await db.media.update({
    //   where: { id },
    //   data: { title, overview, servers }
    // });

    return NextResponse.json(
      { success: true, message: 'Media updated successfully' },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
}

// 4. DELETE: Remove movie or series from catalog
export async function DELETE(req: Request) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    // Example DB Deletion:
    // await db.media.delete({ where: { id } });

    return NextResponse.json(
      { success: true, message: 'Media deleted successfully' },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}