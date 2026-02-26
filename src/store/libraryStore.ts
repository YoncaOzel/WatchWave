import { create } from 'zustand';

export type MediaType = 'movie' | 'tv';
export type ListType = 'watchlist' | 'watched' | 'favorites';

export interface LibraryItem {
  tmdbId: number;
  title: string;
  posterPath: string;
  mediaType: MediaType;
  addedAt: number;
  userRating: number | null;
  userNote: string | null;
}

interface LibraryState {
  watchlist: LibraryItem[];
  watched: LibraryItem[];
  favorites: LibraryItem[];
  addItem: (list: ListType, item: LibraryItem) => void;
  removeItem: (list: ListType, tmdbId: number) => void;
  moveItem: (from: ListType, to: ListType, tmdbId: number) => void;
  updateItem: (list: ListType, tmdbId: number, patch: Partial<LibraryItem>) => void;
  isInList: (list: ListType, tmdbId: number) => boolean;
  setList: (list: ListType, items: LibraryItem[]) => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  watchlist: [],
  watched: [],
  favorites: [],

  addItem: (list, item) =>
    set((state) => ({ [list]: [...state[list], item] })),

  removeItem: (list, tmdbId) =>
    set((state) => ({
      [list]: state[list].filter((i) => i.tmdbId !== tmdbId),
    })),

  moveItem: (from, to, tmdbId) => {
    const item = get()[from].find((i) => i.tmdbId === tmdbId);
    if (!item) return;
    set((state) => ({
      [from]: state[from].filter((i) => i.tmdbId !== tmdbId),
      [to]: [...state[to], { ...item, addedAt: Date.now() }],
    }));
  },

  updateItem: (list, tmdbId, patch) =>
    set((state) => ({
      [list]: state[list].map((i) =>
        i.tmdbId === tmdbId ? { ...i, ...patch } : i,
      ),
    })),

  isInList: (list, tmdbId) => get()[list].some((i) => i.tmdbId === tmdbId),

  setList: (list, items) => set({ [list]: items }),
}));
