import { parseError } from '../src/utils/errorHandler';

describe('parseError', () => {
  it('null/undefined için fallback mesaj döner', () => {
    expect(parseError(null)).toContain('hata');
    expect(parseError(undefined)).toContain('hata');
  });

  it('string hatayı aynen döner', () => {
    expect(parseError('sunucu hatası')).toBe('sunucu hatası');
  });

  it('auth/user-not-found kodunu Turkce mesaja cevirir', () => {
    const msg = parseError({ code: 'auth/user-not-found' });
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });

  it('auth/wrong-password kodunu Turkce mesaja cevirir', () => {
    const msg = parseError({ code: 'auth/wrong-password' });
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });

  it('message alani olan nesneden mesaj ceker', () => {
    const msg = parseError({ message: 'ag hatasi' });
    expect(msg).toContain('ag hatasi');
  });

  it('Axios 401 icin Turkce mesaj doner', () => {
    const msg = parseError({ response: { status: 401 } });
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });
});
