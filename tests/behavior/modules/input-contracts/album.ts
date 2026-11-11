import type { ModuleInputCase } from './contract.ts';

const albumIdentifier = {
  valid: [{ id: 396372188 }, { id: '396372188' }],
  invalid: [
    {},
    { id: 0 },
    { id: '01' },
    { id: '1,2' },
    { id: 1.5 },
    { id: true },
  ],
};

export const cases: ReadonlyArray<ModuleInputCase> = [
  { module: 'album', ...albumIdentifier },
  { module: 'album_detail', ...albumIdentifier },
  { module: 'album_detail_dynamic', ...albumIdentifier },
  {
    module: 'album_list',
    valid: [
      {},
      { limit: 10, offset: 0 },
      { limit: '10', offset: '0', area: 'ZH', type: '1' },
      { area: 'JP' },
    ],
    invalid: [
      { limit: -1 },
      { offset: 1.5 },
      { limit: 'ten' },
      { area: 'UNKNOWN' },
      { area: 1 },
      { type: '1,2' },
    ],
  },
  {
    module: 'album_list_style',
    valid: [{}, { limit: '10', offset: 0, area: 'Z_H' }, { area: 'E_A' }],
    invalid: [{ limit: -1 }, { offset: 1.5 }, { area: 'ALL' }, { area: 1 }],
  },
  {
    module: 'album_new',
    valid: [{}, { limit: '10', offset: 0, area: 'KR' }],
    invalid: [{ limit: -1 }, { offset: 1.5 }, { area: 'UNKNOWN' }, { type: 1 }],
  },
  {
    module: 'album_newest',
    valid: [{}],
    invalid: [{ id: 1 }],
  },
  { module: 'album_privilege', ...albumIdentifier },
  {
    module: 'album_songsaleboard',
    valid: [
      {},
      { type: 'daily', albumType: 0 },
      { type: 'year', albumType: '1', year: 2026 },
      { type: 'custom', albumType: 1, year: 2026 },
      { albumType: 99 },
    ],
    invalid: [
      { type: 1 },
      { albumType: -1 },
      { albumType: 1.5 },
      { year: -1 },
      { year: '2026x' },
    ],
  },
  {
    module: 'album_sub',
    valid: [
      { id: 396372188, t: 1 },
      { id: '396372188', t: '0' },
    ],
    invalid: [
      { id: 396372188 },
      { id: 396372188, t: 2 },
      { id: 396372188, t: -1 },
      { id: 396372188, t: 'true' },
      { id: 0, t: 1 },
    ],
  },
  {
    module: 'album_sublist',
    valid: [{}, { limit: '10', offset: 0 }, { limit: 100 }],
    invalid: [{ limit: -1 }, { offset: 1.5 }, { limit: 'ten' }],
  },
];
