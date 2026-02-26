import { tmdbClient } from '../api/tmdbClient';
import { ApiCache } from '../utils/apiCache';
import {
  MOCK_POPULAR_MOVIES,
  MOCK_NOW_PLAYING,
  MOCK_TOP_RATED,
  MOCK_POPULAR_TV,
  MOCK_ON_THE_AIR,
  MOCK_MOVIE_DETAIL,
  MOCK_TV_DETAIL,
  MOCK_MOVIES,
  MOCK_TV_SHOWS,
} from '../mocks';
import {
  Movie,
  TvShow,
  MovieDetail,
  TvDetail,
  TmdbListResponse,
  Season,
} from '../types';

/**
 * USE_MOCK = true  → mock verilerle çalış (API anahtarı gerekmez)
 * USE_MOCK = false → gerçek TMDB API'ye istek at
 */
const USE_MOCK = true;

export const MovieService = {
  // ─── Filmler ──────────────────────────────────────────────────────────

  getPopularMovies: async (): Promise<TmdbListResponse<Movie>> => {
    if (USE_MOCK) return MOCK_POPULAR_MOVIES;
    return ApiCache.getOrFetch('movie/popular', async () => {
      const { data } = await tmdbClient.get<TmdbListResponse<Movie>>('/movie/popular');
      return data;
    });
  },

  getNowPlaying: async (): Promise<TmdbListResponse<Movie>> => {
    if (USE_MOCK) return MOCK_NOW_PLAYING;
    return ApiCache.getOrFetch('movie/now_playing', async () => {
      const { data } = await tmdbClient.get<TmdbListResponse<Movie>>('/movie/now_playing');
      return data;
    });
  },

  getTopRatedMovies: async (): Promise<TmdbListResponse<Movie>> => {
    if (USE_MOCK) return MOCK_TOP_RATED;
    return ApiCache.getOrFetch('movie/top_rated', async () => {
      const { data } = await tmdbClient.get<TmdbListResponse<Movie>>('/movie/top_rated');
      return data;
    });
  },

  getMovieDetail: async (id: number): Promise<MovieDetail> => {
    if (USE_MOCK) return { ...MOCK_MOVIE_DETAIL, id };
    return ApiCache.getOrFetch(`movie/${id}`, async () => {
      const { data } = await tmdbClient.get<MovieDetail>(
        `/movie/${id}?append_to_response=credits,videos`,
      );
      return data;
    });
  },

  // ─── Diziler ──────────────────────────────────────────────────────────

  getPopularTV: async (): Promise<TmdbListResponse<TvShow>> => {
    if (USE_MOCK) return MOCK_POPULAR_TV;
    return ApiCache.getOrFetch('tv/popular', async () => {
      const { data } = await tmdbClient.get<TmdbListResponse<TvShow>>('/tv/popular');
      return data;
    });
  },

  getOnTheAir: async (): Promise<TmdbListResponse<TvShow>> => {
    if (USE_MOCK) return MOCK_ON_THE_AIR;
    return ApiCache.getOrFetch('tv/on_the_air', async () => {
      const { data } = await tmdbClient.get<TmdbListResponse<TvShow>>('/tv/on_the_air');
      return data;
    });
  },

  getTVDetail: async (id: number): Promise<TvDetail> => {
    if (USE_MOCK) return { ...MOCK_TV_DETAIL, id };
    return ApiCache.getOrFetch(`tv/${id}`, async () => {
      const { data } = await tmdbClient.get<TvDetail>(
        `/tv/${id}?append_to_response=credits,videos`,
      );
      return data;
    });
  },

  getSeasonDetail: async (seriesId: number, seasonNumber: number): Promise<Season> => {
    if (USE_MOCK) {
      const season = MOCK_TV_DETAIL.seasons.find(
        (s) => s.season_number === seasonNumber,
      );
      return season ?? MOCK_TV_DETAIL.seasons[0];
    }
    return ApiCache.getOrFetch(`tv/${seriesId}/season/${seasonNumber}`, async () => {
      const { data } = await tmdbClient.get<Season>(
        `/tv/${seriesId}/season/${seasonNumber}`,
      );
      return data;
    });
  },

  // ─── Arama ────────────────────────────────────────────────────────────

  search: async (
    query: string,
  ): Promise<TmdbListResponse<Movie | TvShow>> => {
    if (USE_MOCK) {
      const q = query.toLowerCase();
      const movies = MOCK_MOVIES.filter((m) =>
        m.title.toLowerCase().includes(q),
      );
      const tv = MOCK_TV_SHOWS.filter((s) =>
        s.name.toLowerCase().includes(q),
      );
      return {
        page: 1,
        results: [...movies, ...tv],
        total_pages: 1,
        total_results: movies.length + tv.length,
      };
    }
    const { data } = await tmdbClient.get<TmdbListResponse<Movie | TvShow>>(
      '/search/multi',
      { params: { query } },
    );
    return data;
  },

  discoverMovies: async (params: {
    with_genres?: string;
    'primary_release_date.gte'?: string;
    'primary_release_date.lte'?: string;
    'vote_average.gte'?: number;
  }): Promise<TmdbListResponse<Movie>> => {
    if (USE_MOCK) return MOCK_POPULAR_MOVIES;
    const { data } = await tmdbClient.get<TmdbListResponse<Movie>>(
      '/discover/movie',
      { params },
    );
    return data;
  },
};
