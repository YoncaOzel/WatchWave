import { tmdbClient } from './tmdbClient';
import { Movie, TmdbListResponse } from '../types';

export const moviesApi = {
  getPopular: () =>
    tmdbClient.get<TmdbListResponse<Movie>>('/movie/popular').then((r) => r.data),

  getNowPlaying: () =>
    tmdbClient.get<TmdbListResponse<Movie>>('/movie/now_playing').then((r) => r.data),

  getTopRated: () =>
    tmdbClient.get<TmdbListResponse<Movie>>('/movie/top_rated').then((r) => r.data),
};
