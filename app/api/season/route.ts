import { NextRequest } from 'next/server';
import { getSeasonDetails } from '@/lib/tmdb';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const season = searchParams.get('season');

  if (!id || !season) {
    return Response.json({ error: 'Missing id or season' }, { status: 400 });
  }

  try {
    const data = await getSeasonDetails(id, parseInt(season));
    return Response.json(data);
  } catch {
    return Response.json({ error: 'Failed to fetch season data' }, { status: 500 });
  }
}
