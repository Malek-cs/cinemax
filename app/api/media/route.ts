import { NextRequest } from 'next/server';
import { getMovieDetails, getSeriesDetails } from '@/lib/tmdb';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  if (!id || !type) {
    return Response.json({ error: 'Missing id or type' }, { status: 400 });
  }

  try {
    const data =
      type === 'movie' ? await getMovieDetails(id) : await getSeriesDetails(id);
    const title = 'title' in data ? data.title : data.name;
    return Response.json({ posterPath: data.poster_path ?? null, title });
  } catch {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
}
