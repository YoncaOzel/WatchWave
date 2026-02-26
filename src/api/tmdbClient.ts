import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_TMDB_BASE_URL ?? 'https://api.themoviedb.org/3';
const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY ?? '';

export const IMAGE_BASE_URL =
  process.env.EXPO_PUBLIC_TMDB_IMAGE_BASE_URL ?? 'https://image.tmdb.org/t/p/w500';

export const tmdbClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
  params: {
    language: 'tr-TR',
  },
});

tmdbClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.status_message ?? error.message ?? 'Bilinmeyen hata';
    return Promise.reject(new Error(message));
  },
);

export function buildImageUrl(path: string | null, size = 'w500'): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
