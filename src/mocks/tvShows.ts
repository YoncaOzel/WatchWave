import { TvShow, TmdbListResponse } from '../types';

export const MOCK_TV_SHOWS: TvShow[] = [
  {
    id: 1396,
    name: 'Breaking Bad',
    overview:
      'Kanser tanısı alan lise kimya öğretmeni Walter White, ailesine para bırakmak için eski öğrencisiyle uyuşturucu üretimine başlar.',
    poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    backdrop_path: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    first_air_date: '2008-01-20',
    vote_average: 9.5,
    vote_count: 14800,
    genre_ids: [18, 80],
    popularity: 245.6,
    original_language: 'en',
    original_name: 'Breaking Bad',
  },
  {
    id: 1399,
    name: 'Game of Thrones',
    overview:
      'Demir Taht\'ı ele geçirmek isteyen soylu aileler, Westeros topraklarında birbirleriyle savaşırken eski bir tehdit yeniden canlanmaktadır.',
    poster_path: '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    backdrop_path: '/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    first_air_date: '2011-04-17',
    vote_average: 9.3,
    vote_count: 22300,
    genre_ids: [10759, 18, 10765],
    popularity: 198.4,
    original_language: 'en',
    original_name: 'Game of Thrones',
  },
  {
    id: 66732,
    name: 'Stranger Things',
    overview:
      '1980\'lerde Indiana\'nın Hawkins kasabasında bir çocuğun gizemli kayboluşu, doğaüstü olayların zincirini başlatır.',
    poster_path: '/x2LSRK2Cm7MZhjluni1msVJ3wDj.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    first_air_date: '2016-07-15',
    vote_average: 8.7,
    vote_count: 15200,
    genre_ids: [10759, 10765, 9648],
    popularity: 167.3,
    original_language: 'en',
    original_name: 'Stranger Things',
  },
  {
    id: 63174,
    name: 'Lucifer',
    overview:
      'Şeytan Lucifer Morningstar cehennemden sıkılıp Los Angeles\'a taşınır ve bir dedektifle suçluları yakalamaya başlar.',
    poster_path: '/4EYPN5mVIhKLfxGruy7Dy41dTVn.jpg',
    backdrop_path: '/ta5oblpMlEcIPIS2YGcq9XEkWK2.jpg',
    first_air_date: '2016-01-25',
    vote_average: 8.1,
    vote_count: 10600,
    genre_ids: [80, 10765, 35],
    popularity: 142.8,
    original_language: 'en',
    original_name: 'Lucifer',
  },
  {
    id: 1402,
    name: 'The Walking Dead',
    overview:
      'Zombi salgınının patlak verdiği dünyada hayatta kalmaya çalışan bir grup insanın mücadelesi anlatılır.',
    poster_path: '/n7PdR6DRt4KCuTFwF4PFQBTvF4m.jpg',
    backdrop_path: '/uro2Khv7JxlzXtLb8tCIbRhkb9E.jpg',
    first_air_date: '2010-10-31',
    vote_average: 8.2,
    vote_count: 13400,
    genre_ids: [10759, 18, 10765],
    popularity: 88.5,
    original_language: 'en',
    original_name: 'The Walking Dead',
  },
  {
    id: 94997,
    name: 'House of the Dragon',
    overview:
      'Game of Thrones\'un öncesini anlatan bu dizi, Targaryen hanedanının iç savaşını konu alır.',
    poster_path: '/z2yahl2uefxDCl0nogcRBstwruJ.jpg',
    backdrop_path: '/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg',
    first_air_date: '2022-08-21',
    vote_average: 8.4,
    vote_count: 4700,
    genre_ids: [10759, 18, 10765],
    popularity: 176.9,
    original_language: 'en',
    original_name: 'House of the Dragon',
  },
];

export const MOCK_POPULAR_TV: TmdbListResponse<TvShow> = {
  page: 1,
  results: MOCK_TV_SHOWS.slice(0, 5),
  total_pages: 1,
  total_results: 5,
};

export const MOCK_ON_THE_AIR: TmdbListResponse<TvShow> = {
  page: 1,
  results: MOCK_TV_SHOWS.slice(2, 6),
  total_pages: 1,
  total_results: 4,
};
