import type { ModuleInputCase } from './contract.ts';

export const cases: ReadonlyArray<ModuleInputCase> = [
  {
    module: 'check_music',
    valid: [{ id: 12 }, { id: '34', br: '128000' }],
    invalid: [
      {},
      { id: 0 },
      { id: '1,2' },
      { br: 128000 },
      { id: 12, br: 0 },
      { id: 12, br: 'abc' },
    ],
  },
  {
    module: 'lyric',
    valid: [{ id: 12 }, { id: '34' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }, { id: 'abc' }],
  },
  {
    module: 'lyric_new',
    valid: [{ id: 12 }, { id: '34' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }, { id: 'abc' }],
  },
  {
    module: 'music_first_listen_info',
    valid: [{}, { id: 12 }, { id: '34' }],
    invalid: [{ id: 0 }, { id: '1,2' }, { id: 'abc' }],
  },
  {
    module: 'scrobble',
    valid: [
      { id: 12, sourceid: 0 },
      { id: '34', sourceid: '99', source: 'album', time: '241' },
    ],
    invalid: [
      {},
      { id: 12 },
      { sourceid: 1 },
      { id: 12, sourceid: 'abc' },
      { id: 12, sourceid: 1, time: -1 },
      { id: 12, sourceid: 1, source: 5 },
      { id: 0, sourceid: 1 },
    ],
  },
  {
    module: 'song_chorus',
    valid: [{ id: 12 }, { id: '34' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }, { id: 'abc' }],
  },
  {
    module: 'song_detail',
    valid: [{ ids: [12, '34'] }],
    invalid: [
      { ids: [] },
      { ids: ['12,34'] },
      { ids: [0] },
      { ids: [1.5] },
      {},
    ],
  },
  {
    module: 'song_downlist',
    valid: [{}, { limit: 5, offset: '10' }],
    invalid: [
      { limit: -1 },
      { limit: 'abc' },
      { offset: 1.5 },
      { limit: true },
      { limit: null },
    ],
  },
  {
    module: 'song_download_url',
    valid: [{ id: 12 }, { id: '34', br: '320000' }],
    invalid: [
      {},
      { id: 0 },
      { br: 128000 },
      { id: 12, br: 0 },
      { id: 12, br: 'abc' },
    ],
  },
  {
    module: 'song_download_url_v1',
    valid: [
      { id: 12, level: 'lossless' },
      { id: '34', level: 'hires' },
    ],
    invalid: [
      {},
      { id: 0, level: 'standard' },
      { id: 12 },
      { id: 12, level: 5 },
    ],
  },
  {
    module: 'song_dynamic_cover',
    valid: [{ id: 12 }, { id: '34' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }],
  },
  {
    module: 'song_like_check',
    valid: [{ ids: [1, '2'] }],
    invalid: [{}, { ids: [] }, { ids: ['1,2'] }, { ids: [0] }, { ids: 1 }],
  },
  {
    module: 'song_lyrics_mark',
    valid: [{ id: 12 }, { id: '34' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }],
  },
  {
    module: 'song_lyrics_mark_add',
    valid: [
      { id: 12 },
      { id: '34', markId: 32538120, marks: [] },
      {
        id: 12,
        marks: [
          {
            originalLyricsText: '逃がしてくれって声を枯らした',
            startTimeStamp: 800,
            translateLyricsText: '让我逃走吧、声音已经枯萎',
            translateType: 1,
          },
        ],
      },
    ],
    invalid: [
      {},
      { id: 0 },
      { id: 12, markId: 0 },
      { id: 12, marks: '[]' },
      { id: 12, marks: [{}] },
      {
        id: 12,
        marks: [
          {
            startTimeStamp: 800,
            translateLyricsText: 'text',
            translateType: 1,
          },
        ],
      },
      {
        id: 12,
        marks: [
          {
            extra: true,
            originalLyricsText: 'a',
            startTimeStamp: 800,
            translateLyricsText: 'b',
            translateType: 1,
          },
        ],
      },
    ],
  },
  {
    module: 'song_lyrics_mark_del',
    valid: [{ id: 12 }, { id: '34' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }],
  },
  {
    module: 'song_lyrics_mark_user_page',
    valid: [{}, { limit: 5, offset: '10' }],
    invalid: [{ limit: -1 }, { limit: 'abc' }, { offset: 1.5 }],
  },
  {
    module: 'song_monthdownlist',
    valid: [{}, { limit: 5, offset: '10' }],
    invalid: [{ limit: -1 }, { limit: 'abc' }, { offset: 1.5 }],
  },
  {
    module: 'song_music_detail',
    valid: [{ id: 12 }, { id: '34' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }],
  },
  {
    module: 'song_order_update',
    valid: [{ pid: 1, ids: [2, '3'] }],
    invalid: [
      { pid: 1, ids: [] },
      { pid: 1, ids: ['2,3'] },
      { pid: 0, ids: [2] },
    ],
  },
  {
    module: 'song_purchased',
    valid: [{}, { limit: 5, offset: '10' }],
    invalid: [{ limit: -1 }, { limit: 'abc' }, { offset: 1.5 }],
  },
  {
    module: 'song_red_count',
    valid: [{ id: 12 }, { id: '34' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }],
  },
  {
    module: 'song_singledownlist',
    valid: [{}, { limit: 5, offset: '10' }],
    invalid: [{ limit: -1 }, { limit: 'abc' }, { offset: 1.5 }],
  },
  {
    module: 'song_url',
    valid: [{ ids: [1, '2'] }, { ids: [1], br: '320000' }],
    invalid: [
      {},
      { ids: [] },
      { ids: ['1,2'] },
      { ids: [0] },
      { id: 1 },
      { ids: [1], br: 0 },
    ],
  },
  {
    module: 'song_url_v1',
    valid: [
      { ids: [1, '2'], level: 'lossless' },
      { ids: [1], level: 'sky' },
    ],
    invalid: [
      {},
      { ids: [], level: 'standard' },
      { ids: [1] },
      { id: 1, level: 'standard' },
      { ids: [1], level: 'future' },
    ],
  },
  {
    module: 'song_wiki_summary',
    valid: [{ id: 12 }, { id: '34' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }],
  },
];
