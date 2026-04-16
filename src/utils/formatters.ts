export function formatRuntime(minutes: number | null): string {
  if (!minutes) return 'Bilinmiyor';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}s ${m}dk` : `${m}dk`;
}

export function formatYear(dateStr: string | undefined): string {
  if (!dateStr) return '';
  return dateStr.substring(0, 4);
}

export function formatRating(rating: number | undefined | null): string {
  if (rating === undefined || rating === null) return '0.0';
  return rating.toFixed(1);
}

export function formatEpisodeLabel(season: number, episode: number): string {
  return `S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')}`;
}
