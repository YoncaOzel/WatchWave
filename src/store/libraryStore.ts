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

export interface CustomList {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  items: LibraryItem[];
}

interface LibraryState {
  watchlist: LibraryItem[];
  watched: LibraryItem[];
  favorites: LibraryItem[];
  customLists: CustomList[];
  addItem: (list: ListType, item: LibraryItem) => void;
  removeItem: (list: ListType, tmdbId: number) => void;
  moveItem: (from: ListType, to: ListType, tmdbId: number) => void;
  updateItem: (list: ListType, tmdbId: number, patch: Partial<LibraryItem>) => void;
  isInList: (list: ListType, tmdbId: number) => boolean;
  setList: (list: ListType, items: LibraryItem[]) => void;
  
  // Custom List Actions
  setCustomLists: (lists: CustomList[]) => void;
  addCustomList: (list: CustomList) => void;
  updateCustomList: (id: string, patch: Partial<CustomList>) => void;
  removeCustomList: (id: string) => void;
  addItemToCustomList: (listId: string, item: LibraryItem) => void;
  removeItemFromCustomList: (listId: string, tmdbId: number) => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  watchlist: [],
  watched: [],
  favorites: [],
  customLists: [],

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

  // Custom Lists Implementations
  setCustomLists: (lists) => set({ customLists: lists }),

  addCustomList: (list) =>
    set((state) => ({ customLists: [...state.customLists, list] })),

  updateCustomList: (id, patch) =>
    set((state) => ({
      customLists: state.customLists.map((cl) =>
        cl.id === id ? { ...cl, ...patch } : cl
      ),
    })),

  removeCustomList: (id) =>
    set((state) => ({
      customLists: state.customLists.filter((cl) => cl.id !== id),
    })),

  addItemToCustomList: (listId, item) =>
    set((state) => ({
      customLists: state.customLists.map((cl) => {
        if (cl.id === listId) {
          // Avoid duplicates
          if (!cl.items.some((i) => i.tmdbId === item.tmdbId)) {
            return { ...cl, items: [...cl.items, item] };
          }
        }
        return cl;
      }),
    })),

  removeItemFromCustomList: (listId, tmdbId) =>
    set((state) => ({
      customLists: state.customLists.map((cl) => {
        if (cl.id === listId) {
          return { ...cl, items: cl.items.filter((i) => i.tmdbId !== tmdbId) };
        }
        return cl;
      }),
    })),
}));
