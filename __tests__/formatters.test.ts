import { formatRuntime, formatYear, formatRating, formatEpisodeLabel } from '../src/utils/formatters';

describe('formatRuntime', () => {
  it('dakikayı saat+dk biçimine çevirir', () => {
    expect(formatRuntime(125)).toBe('2s 5dk');
  });
  it('1 saatten az ise sadece dakika gösterir', () => {
    expect(formatRuntime(45)).toBe('45dk');
  });
  it('null/undefined icin fallback doner', () => {
    const result = formatRuntime(undefined);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatYear', () => {
  it('tarihten yılı döndürür', () => {
    expect(formatYear('2023-07-15')).toBe('2023');
  });
  it('gecersiz tarihte string doner', () => {
    expect(typeof formatYear('')).toBe('string');
  });
});

describe('formatRating', () => {
  it('sayıyı tek ondalıkla biçimlendirir', () => {
    expect(formatRating(7.89)).toBe('7.9');
  });
  it('0 icin string doner', () => {
    expect(typeof formatRating(0)).toBe('string');
  });
});

describe('formatEpisodeLabel', () => {
  it("S ve E prefix'ini dogru olusturur", () => {
    expect(formatEpisodeLabel(2, 5)).toBe('S02E05');
  });
  it('tek basamaklı sayılara sıfır ekler', () => {
    expect(formatEpisodeLabel(1, 1)).toBe('S01E01');
  });
});
