import { tmdbClient } from './tmdbClient';
import { MovieDetail, TvDetail } from '../types';

export const detailApi = {
  getMovie: (id: number) =>
    tmdbClient
      .get<MovieDetail>(`/movie/${id}`, {
        params: { append_to_response: 'credits,videos' },
      })
      .then((r) => r.data),

  getTV: (id: number) =>
    tmdbClient
      .get<TvDetail>(`/tv/${id}`, {
        params: { append_to_response: 'credits,videos' },
      })
      .then((r) => r.data),
};
