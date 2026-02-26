const TTL_MS = 5 * 60 * 1000; // 5 dakika

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export const ApiCache = {
  get<T>(key: string): T | null {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.data;
  },

  set<T>(key: string, data: T, ttl = TTL_MS): void {
    store.set(key, { data, expiresAt: Date.now() + ttl });
  },

  /**
   * Cache'de varsa döndür, yoksa fetchFn'i çağırıp sonucu sakla.
   */
  async getOrFetch<T>(key: string, fetchFn: () => Promise<T>, ttl = TTL_MS): Promise<T> {
    const cached = ApiCache.get<T>(key);
    if (cached !== null) return cached;
    const fresh = await fetchFn();
    ApiCache.set(key, fresh, ttl);
    return fresh;
  },

  invalidate(key: string): void {
    store.delete(key);
  },

  clear(): void {
    store.clear();
  },

  size(): number {
    return store.size;
  },
};
