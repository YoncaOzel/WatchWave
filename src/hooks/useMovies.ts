import { useState, useEffect, useCallback } from 'react';
import { MovieService } from '../services/MovieService';
import { Movie, TvShow, TmdbListResponse } from '../types';

interface UseMoviesReturn {
  popularMovies: Movie[];
  nowPlaying: Movie[];
  topRated: Movie[];
  popularTV: TvShow[];
  onTheAir: TvShow[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useMovies(): UseMoviesReturn {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<TvShow[]>([]);
  const [onTheAir, setOnTheAir] = useState<TvShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pm, np, tr, ptv, ota] = await Promise.all([
        MovieService.getPopularMovies(),
        MovieService.getNowPlaying(),
        MovieService.getTopRatedMovies(),
        MovieService.getPopularTV(),
        MovieService.getOnTheAir(),
      ]);
      setPopularMovies(pm.results);
      setNowPlaying(np.results);
      setTopRated(tr.results);
      setPopularTV(ptv.results);
      setOnTheAir(ota.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { popularMovies, nowPlaying, topRated, popularTV, onTheAir, isLoading, error, refresh: fetchAll };
}
