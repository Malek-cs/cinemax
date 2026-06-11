import axios from 'axios';
import https from 'https';
import type { Movie, Series, Cast, Video, Genre, TMDBResponse, Season } from './types';

const BASE_URL = 'https://api.themoviedb.org/3';

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error('TMDB_API_KEY is not set in environment variables');
  return key;
}

const api = axios.create({
  baseURL: BASE_URL,
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});

function withKey(params: Record<string, unknown> = {}) {
  return { api_key: getApiKey(), ...params };
}

export async function getTrending(
  type: 'movie' | 'tv' | 'all' = 'all',
  timeWindow: 'day' | 'week' = 'week'
): Promise<(Movie & Series)[]> {
  const { data } = await api.get<TMDBResponse<Movie & Series>>(
    `/trending/${type}/${timeWindow}`,
    { params: withKey() }
  );
  return data.results;
}

export async function getMovieDetails(id: string | number): Promise<Movie> {
  const { data } = await api.get<Movie>(`/movie/${id}`, { params: withKey() });
  return data;
}

export async function getSeriesDetails(id: string | number): Promise<Series> {
  const { data } = await api.get<Series>(`/tv/${id}`, { params: withKey() });
  return data;
}

export async function getSeasonDetails(
  seriesId: string | number,
  seasonNumber: number
): Promise<Season> {
  const { data } = await api.get<Season>(`/tv/${seriesId}/season/${seasonNumber}`, {
    params: withKey(),
  });
  return data;
}

export async function searchMovies(
  query: string,
  page = 1
): Promise<TMDBResponse<Movie>> {
  const { data } = await api.get<TMDBResponse<Movie>>('/search/movie', {
    params: withKey({ query, page }),
  });
  return data;
}

export async function searchSeries(
  query: string,
  page = 1
): Promise<TMDBResponse<Series>> {
  const { data } = await api.get<TMDBResponse<Series>>('/search/tv', {
    params: withKey({ query, page }),
  });
  return data;
}

export async function searchMulti(query: string, page = 1) {
  const { data } = await api.get('/search/multi', {
    params: withKey({ query, page }),
  });
  return data;
}

export async function getTopRated(
  type: 'movie' | 'tv' = 'movie',
  page = 1
): Promise<(Movie | Series)[]> {
  const { data } = await api.get<TMDBResponse<Movie | Series>>(`/${type}/top_rated`, {
    params: withKey({ page }),
  });
  return data.results;
}

export async function getPopular(
  type: 'movie' | 'tv' = 'movie',
  page = 1
): Promise<(Movie | Series)[]> {
  const { data } = await api.get<TMDBResponse<Movie | Series>>(`/${type}/popular`, {
    params: withKey({ page }),
  });
  return data.results;
}

export async function getByGenre(
  type: 'movie' | 'tv',
  genreId: number,
  page = 1,
  sortBy?: string,
  extraParams?: Record<string, unknown>
): Promise<(Movie | Series)[]> {
  const params: Record<string, unknown> = {
    with_genres: genreId,
    page,
    ...extraParams,
  };
  if (sortBy) params.sort_by = sortBy;
  const { data } = await api.get<TMDBResponse<Movie | Series>>(`/discover/${type}`, {
    params: withKey(params),
  });
  return data.results;
}

export async function getVideos(
  type: 'movie' | 'tv',
  id: string | number
): Promise<Video[]> {
  const { data } = await api.get<{ results: Video[] }>(`/${type}/${id}/videos`, {
    params: withKey(),
  });
  return data.results;
}

export async function getCast(
  type: 'movie' | 'tv',
  id: string | number
): Promise<Cast[]> {
  const { data } = await api.get<{ cast: Cast[] }>(`/${type}/${id}/credits`, {
    params: withKey(),
  });
  return data.cast;
}

export async function getSimilar(
  type: 'movie' | 'tv',
  id: string | number
): Promise<(Movie | Series)[]> {
  const { data } = await api.get<TMDBResponse<Movie | Series>>(`/${type}/${id}/similar`, {
    params: withKey(),
  });
  return data.results;
}

export async function getMovieGenres(): Promise<Genre[]> {
  const { data } = await api.get<{ genres: Genre[] }>('/genre/movie/list', {
    params: withKey(),
  });
  return data.genres;
}

export async function getTvGenres(): Promise<Genre[]> {
  const { data } = await api.get<{ genres: Genre[] }>('/genre/tv/list', {
    params: withKey(),
  });
  return data.genres;
}
