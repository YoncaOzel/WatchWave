import { buildPosterUrl, buildBackdropUrl, buildProfileUrl } from '../src/utils/imageHelper';

describe('imageHelper', () => {
  it('buildPosterUrl geçerli URL döner', () => {
    const url = buildPosterUrl('/abc.jpg');
    expect(url).toContain('image.tmdb.org');
    expect(url).toContain('abc.jpg');
  });

  it('buildPosterUrl null için null döner', () => {
    expect(buildPosterUrl(null)).toBeNull();
  });

  it('buildBackdropUrl daha büyük boyut prefix kullanır', () => {
    const url = buildBackdropUrl('/hero.jpg');
    expect(url).toContain('image.tmdb.org');
  });

  it('buildProfileUrl null için null döner', () => {
    expect(buildProfileUrl(null)).toBeNull();
  });
});
