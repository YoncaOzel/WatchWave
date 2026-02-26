import { tmdbClient } from './tmdbClient';
import { TvShow, TmdbListResponse } from '../types';

export const tvApi = {
  getPopular: () =>
    tmdbClient.get<TmdbListResponse<TvShow>>('/tv/popular').then((r) => r.data),

  getOnTheAir: () =>
    tmdbClient.get<TmdbListResponse<TvShow>>('/tv/on_the_air').then((r) => r.data),
};
