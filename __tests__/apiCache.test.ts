import { ApiCache } from '../src/utils/apiCache';

beforeEach(() => {
  ApiCache.clear();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ApiCache', () => {
  it('cache olmayan key için null döner', () => {
    expect(ApiCache.get('miss')).toBeNull();
  });

  it('set edilen değeri döner', () => {
    ApiCache.set('key1', { foo: 'bar' });
    expect(ApiCache.get('key1')).toEqual({ foo: 'bar' });
  });

  it('TTL süresi geçince null döner', () => {
    ApiCache.set('exp', 'değer', 1000);
    jest.advanceTimersByTime(1001);
    expect(ApiCache.get('exp')).toBeNull();
  });

  it('getOrFetch: cache yoksa fetchFn çağrılır', async () => {
    const fetchFn = jest.fn().mockResolvedValue('taze veri');
    const result = await ApiCache.getOrFetch('k', fetchFn);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(result).toBe('taze veri');
  });

  it('getOrFetch: cache varsa fetchFn çağrılmaz', async () => {
    ApiCache.set('k2', 'önbellek');
    const fetchFn = jest.fn();
    const result = await ApiCache.getOrFetch('k2', fetchFn);
    expect(fetchFn).not.toHaveBeenCalled();
    expect(result).toBe('önbellek');
  });

  it('invalidate sonrası null döner', () => {
    ApiCache.set('del', 123);
    ApiCache.invalidate('del');
    expect(ApiCache.get('del')).toBeNull();
  });

  it('size() doğru değeri verir', () => {
    ApiCache.set('a', 1);
    ApiCache.set('b', 2);
    expect(ApiCache.size()).toBe(2);
  });
});
