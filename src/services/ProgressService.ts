import { FirestoreService } from './FirestoreService';
import { useProgressStore, SeriesProgress } from '../store/progressStore';
import type { TvDetail, Episode } from '../types';

export const ProgressService = {
  /**
   * Belirli bir bölümü "Burada Kaldım" olarak işaretle.
   * Hem Zustand store hem Firestore'a yazar.
   */
  saveProgress: async (
    uid: string | null,
    seriesId: number,
    seriesTitle: string,
    posterPath: string,
    season: number,
    episode: number,
  ): Promise<void> => {
    const data: SeriesProgress = {
      seriesId,
      seriesTitle,
      posterPath,
      currentSeason: season,
      currentEpisode: episode,
      lastUpdated: Date.now(),
    };

    useProgressStore.getState().setProgress(data);

    if (uid) {
      await FirestoreService.saveProgress(uid, seriesId, {
        seriesTitle,
        posterPath,
        currentSeason: season,
        currentEpisode: episode,
      }).catch(() => {});
    }
  },

  /**
   * Sonraki bölüme ilerle. Sezon sonu ise sonraki sezona geç.
   */
  nextEpisode: async (
    uid: string | null,
    tv: TvDetail,
    currentSeason: number,
    currentEpisode: number,
    posterPath: string,
  ): Promise<{ season: number; episode: number }> => {
    const season = tv.seasons.find((s) => s.season_number === currentSeason);
    const episodeCount = season?.episode_count ?? 1;

    let nextSeason = currentSeason;
    let nextEpisode = currentEpisode + 1;

    if (nextEpisode > episodeCount) {
      const nextSeasonData = tv.seasons.find(
        (s) => s.season_number > currentSeason && s.season_number > 0,
      );
      if (nextSeasonData) {
        nextSeason = nextSeasonData.season_number;
        nextEpisode = 1;
      } else {
        return { season: currentSeason, episode: currentEpisode };
      }
    }

    await ProgressService.saveProgress(
      uid,
      tv.id,
      tv.name,
      posterPath,
      nextSeason,
      nextEpisode,
    );

    return { season: nextSeason, episode: nextEpisode };
  },

  /** Firestore'dan tüm ilerleme verilerini çekip store'a yükle */
  loadAll: async (uid: string): Promise<void> => {
    try {
      const items = await FirestoreService.getAllProgress(uid);
      const mapped: SeriesProgress[] = items.map((d) => ({
        seriesId: d['seriesId'] as number,
        seriesTitle: d['seriesTitle'] as string,
        posterPath: d['posterPath'] as string,
        currentSeason: d['currentSeason'] as number,
        currentEpisode: d['currentEpisode'] as number,
        lastUpdated: (d['lastUpdated']?.toMillis?.() as number) ?? Date.now(),
      }));
      useProgressStore.getState().setAllProgress(mapped);
    } catch {
      // Firestore henüz yapılandırılmamış olabilir
    }
  },
};
