import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { LibraryItem, ListType } from '../store/libraryStore';

/**
 * T-87: onSnapshot yerine getDoc/getDocs kullanılıyor.
 * Gereksiz realtime listener açılmıyor → Firestore okuma kotası korunuyor.
 * Çoklu yazma işlemleri writeBatch ile gruplandırılıyor.
 */

const listRef = (uid: string, listType: ListType) =>
  doc(db, 'users', uid, 'lists', listType);

const progressRef = (uid: string, seriesId: string) =>
  doc(db, 'users', uid, 'progress', seriesId);

export const FirestoreService = {
  getList: async (uid: string, listType: ListType): Promise<LibraryItem[]> => {
    const snap = await getDoc(listRef(uid, listType));
    if (!snap.exists()) return [];
    return (snap.data()?.items as LibraryItem[]) ?? [];
  },

  setList: async (uid: string, listType: ListType, items: LibraryItem[]): Promise<void> => {
    await setDoc(listRef(uid, listType), { items, updatedAt: serverTimestamp() });
  },

  addItem: async (uid: string, listType: ListType, item: LibraryItem): Promise<void> => {
    const existing = await FirestoreService.getList(uid, listType);
    const updated = [...existing.filter((i) => i.tmdbId !== item.tmdbId), item];
    await FirestoreService.setList(uid, listType, updated);
  },

  removeItem: async (uid: string, listType: ListType, tmdbId: number): Promise<void> => {
    const existing = await FirestoreService.getList(uid, listType);
    await FirestoreService.setList(uid, listType, existing.filter((i) => i.tmdbId !== tmdbId));
  },

  updateItem: async (
    uid: string,
    listType: ListType,
    tmdbId: number,
    patch: Partial<LibraryItem>,
  ): Promise<void> => {
    const existing = await FirestoreService.getList(uid, listType);
    const updated = existing.map((i) => (i.tmdbId === tmdbId ? { ...i, ...patch } : i));
    await FirestoreService.setList(uid, listType, updated);
  },

  /** T-87: Tüm listeleri tek seferde paralel getDoc ile çek (3 okuma) */
  loadAllLists: async (uid: string): Promise<Record<ListType, LibraryItem[]>> => {
    const [watchlist, watched, favorites] = await Promise.all([
      FirestoreService.getList(uid, 'watchlist'),
      FirestoreService.getList(uid, 'watched'),
      FirestoreService.getList(uid, 'favorites'),
    ]);
    return { watchlist, watched, favorites };
  },

  /** T-87: Tüm listeleri tek bir writeBatch ile kaydet (3 yazma → 1 batch) */
  saveAllLists: async (uid: string, lists: Record<ListType, LibraryItem[]>): Promise<void> => {
    const batch = writeBatch(db);
    const now = serverTimestamp();
    for (const [key, items] of Object.entries(lists)) {
      batch.set(listRef(uid, key as ListType), { items, updatedAt: now });
    }
    await batch.commit();
  },

  saveProgress: async (
    uid: string,
    seriesId: number,
    data: {
      seriesTitle: string;
      posterPath: string;
      currentSeason: number;
      currentEpisode: number;
    },
  ): Promise<void> => {
    await setDoc(progressRef(uid, String(seriesId)), {
      seriesId,
      ...data,
      lastUpdated: serverTimestamp(),
    });
  },

  getProgress: async (uid: string, seriesId: number) => {
    const snap = await getDoc(progressRef(uid, String(seriesId)));
    return snap.exists() ? snap.data() : null;
  },

  getAllProgress: async (uid: string) => {
    const col = collection(db, 'users', uid, 'progress');
    const snap = await getDocs(col);
    return snap.docs.map((d) => d.data());
  },
};
