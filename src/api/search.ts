import { tmdbClient } from './tmdbClient';
import { Movie, TvShow, TmdbListResponse } from '../types';

export const searchApi = {
  multi: (query: string) =>
    tmdbClient
      .get<TmdbListResponse<Movie | TvShow>>('/search/multi', { params: { query } })
      .then((r) => r.data),

  discoverMovies: (params: {
    with_genres?: string;
    'primary_release_date.gte'?: string;
    'primary_release_date.lte'?: string;
    'vote_average.gte'?: number;
    with_original_language?: string;
  }) =>
    tmdbClient
      .get<TmdbListResponse<Movie>>('/discover/movie', { params })
      .then((r) => r.data),
};
