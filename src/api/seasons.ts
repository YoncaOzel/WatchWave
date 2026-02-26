import { tmdbClient } from './tmdbClient';
import { Season } from '../types';

export const seasonsApi = {
  getSeason: (seriesId: number, seasonNumber: number) =>
    tmdbClient
      .get<Season>(`/tv/${seriesId}/season/${seasonNumber}`)
      .then((r) => r.data),
};
