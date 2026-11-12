import type { ModuleInputCase } from './contract.ts';

export const cases: ReadonlyArray<ModuleInputCase> = [
  {
    module: 'artist_album',
    valid: [{ id: 1 }, { id: '33927412', limit: '15', offset: 30 }],
    invalid: [
      {},
      { id: 0 },
      { id: '1,2' },
      { id: 1, limit: -1 },
      { id: 1, limit: 'many' },
    ],
  },
  {
    module: 'artist_desc',
    valid: [{ id: 3684 }, { id: '999999999' }],
    invalid: [{ id: 0 }, { id: 'artist' }, { id: 1.5 }, { id: true }, {}],
  },
  {
    module: 'artist_detail',
    valid: [{ id: 3684 }, { id: '3684' }],
    invalid: [{ id: 0 }, { id: 'artist' }, { id: 1.5 }, { id: true }, {}],
  },
  {
    module: 'artist_detail_dynamic',
    valid: [{ id: 3684 }, { id: '3684' }],
    invalid: [{ id: 0 }, { id: 'artist' }, { id: 1.5 }, { id: true }, {}],
  },
  {
    module: 'artist_fans',
    valid: [{ id: 3684 }, { id: '3684', limit: '20', offset: '0' }],
    invalid: [
      { id: 'artist' },
      { id: 1, limit: -1 },
      { id: 1, offset: 1.5 },
      { limit: 10 },
    ],
  },
  {
    module: 'artist_follow_count',
    valid: [{ id: 3684 }, { id: '999999999' }],
    invalid: [{ id: 0 }, { id: 'artist' }, { id: 1.5 }, {}],
  },
  {
    module: 'artist_list',
    valid: [
      {},
      { type: 1, area: 7, initial: 'a' },
      { type: '2', area: '96', initial: 'Z', limit: '30', offset: 0 },
      { type: -1, initial: '-1' },
      { initial: '0' },
      { initial: -1 },
    ],
    invalid: [
      { area: 1 },
      { type: 4 },
      { type: '3', area: 0, initial: { letter: 'a' } },
      { limit: -1 },
      { initial: 65 },
    ],
  },
  {
    module: 'artist_mv',
    valid: [{ id: 3684 }, { id: '3684', limit: 15, offset: '30' }],
    invalid: [{}, { id: 0 }, { id: '3684,1' }, { id: 1, offset: -1 }],
  },
  {
    module: 'artist_new_mv',
    valid: [{}, { limit: '20', before: 1700000000000 }],
    invalid: [{ limit: 'many' }, { before: -1 }, { limit: 1.5 }],
  },
  {
    module: 'artist_new_song',
    valid: [{}, { limit: 20, before: '1700000000000' }],
    invalid: [{ limit: 'many' }, { before: -1 }, { limit: 1.5 }],
  },
  {
    module: 'artist_songs',
    valid: [
      { id: 3684 },
      { id: '3684', order: 'time', limit: '20', offset: '0' },
    ],
    invalid: [
      { id: 0 },
      { id: '3684', order: 'new' },
      { id: '3684', order: 1 },
      { id: '3684', limit: -1 },
    ],
  },
  {
    module: 'artist_sub',
    valid: [
      { id: 1, t: 1 },
      { id: '4455', t: '0' },
      { id: 4455, t: 0 },
    ],
    invalid: [{ id: 1, t: 2 }, { id: 1, t: true }, { id: 1 }, { id: 0, t: 1 }],
  },
  {
    module: 'artist_sublist',
    valid: [{}, { limit: '10', offset: 0 }],
    invalid: [{ limit: 'many' }, { limit: -1 }, { offset: 1.5 }],
  },
  {
    module: 'artist_top_song',
    valid: [{ id: 3684 }, { id: '3684' }],
    invalid: [{ id: 0 }, { id: 'artist' }, { id: 1.5 }, {}],
  },
  {
    module: 'artist_video',
    valid: [
      { id: 3684 },
      { id: '3684', cursor: '100000', size: '10', order: 0 },
    ],
    invalid: [
      { id: 0 },
      { id: 1, cursor: -1 },
      { id: 1, size: 'many' },
      { id: 1, order: 1.5 },
    ],
  },
  {
    module: 'artists',
    valid: [{ id: 6452 }, { id: '6452' }],
    invalid: [{ id: 0 }, { id: 'artist' }, { id: 1.5 }, {}],
  },
  {
    module: 'ugc_album_get',
    valid: [{ id: 168223858 }, { id: '168223858' }],
    invalid: [{ id: 0 }, { id: 'album' }, { id: 1.5 }, {}],
  },
  {
    module: 'ugc_artist_get',
    valid: [{ id: 15396 }, { id: '15396' }],
    invalid: [{ id: 0 }, { id: 'artist' }, { id: 1.5 }, {}],
  },
  {
    module: 'ugc_artist_search',
    valid: [
      { keyword: 'sasakure' },
      { keyword: 97335329, limit: '40' },
      { keyword: '97335329' },
    ],
    invalid: [
      {},
      { keyword: 0 },
      { keyword: 1.5 },
      { keyword: true },
      { keyword: 'sasakure', limit: -1 },
    ],
  },
  {
    module: 'ugc_detail',
    valid: [
      {},
      {
        auditStatus: 1,
        limit: '10',
        offset: '0',
        order: 'asc',
        sortBy: 'createTime',
        type: 101,
      },
    ],
    invalid: [
      { auditStatus: 2 },
      { order: 'up' },
      { type: 7 },
      { limit: 'many' },
      { offset: -1 },
    ],
  },
  {
    module: 'ugc_mv_get',
    valid: [{ id: 14572641 }, { id: '14572641' }],
    invalid: [{ id: 0 }, { id: 'mv' }, { id: 1.5 }, {}],
  },
  {
    module: 'ugc_song_get',
    valid: [{ id: 2058263032 }, { id: '2058263032' }],
    invalid: [{ id: 0 }, { id: 'song' }, { id: 1.5 }, {}],
  },
  {
    module: 'ugc_user_devote',
    valid: [{}],
    invalid: [{ id: 1 }, []],
  },
];
