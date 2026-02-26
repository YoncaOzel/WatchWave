import { create } from 'zustand';

export interface SeriesProgress {
  seriesId: number;
  seriesTitle: string;
  posterPath: string;
  currentSeason: number;
  currentEpisode: number;
  lastUpdated: number;
}

interface ProgressState {
  progress: Record<number, SeriesProgress>;
  setProgress: (data: SeriesProgress) => void;
  removeProgress: (seriesId: number) => void;
  setAllProgress: (items: SeriesProgress[]) => void;
  getProgress: (seriesId: number) => SeriesProgress | undefined;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: {},

  setProgress: (data) =>
    set((state) => ({
      progress: { ...state.progress, [data.seriesId]: data },
    })),

  removeProgress: (seriesId) =>
    set((state) => {
      const next = { ...state.progress };
      delete next[seriesId];
      return { progress: next };
    }),

  setAllProgress: (items) =>
    set({
      progress: Object.fromEntries(items.map((i) => [i.seriesId, i])),
    }),

  getProgress: (seriesId) => get().progress[seriesId],
}));
