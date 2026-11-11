import type { ModuleInputCase } from './contract.ts';

const uploadedSong = {
  data: new Uint8Array([1, 2, 3]),
  name: 'song.mp3',
  mimetype: 'audio/mpeg',
  size: 3,
};

const cloudImportFields = {
  song: '最伟大的作品',
  fileType: 'flac',
  fileSize: '50412168',
  bitrate: '1652',
  md5: 'd02b8ab79d91c01167ba31e349fe5275',
};

export const cases: ReadonlyArray<ModuleInputCase> = [
  {
    module: 'cloud',
    valid: [{}, { songFile: uploadedSong }],
    invalid: [
      { songFile: { ...uploadedSong, data: 'song.mp3' } },
      { songFile: { ...uploadedSong, size: '3' } },
      { songFile: { name: 'song.mp3', mimetype: 'audio/mpeg', size: 3 } },
    ],
  },
  {
    module: 'cloud_import',
    valid: [
      {},
      { song: '最伟大的作品' },
      {
        ...cloudImportFields,
        artist: '周杰伦',
        album: '最伟大的作品',
        id: '17',
      },
    ],
    invalid: [
      { id: 0 },
      { id: '1,2' },
      { id: '01' },
      { fileSize: 'abc' },
      { bitrate: true },
      { song: 5 },
    ],
  },
  {
    module: 'cloudsearch',
    valid: [
      { keywords: '夜に駆ける' },
      { keywords: '夜に駆ける', type: '10', limit: '5', offset: 0 },
      { keywords: '夜に駆ける', type: 2000 },
    ],
    invalid: [
      {},
      { keywords: 5 },
      { keywords: '夜に駆ける', type: 3 },
      { keywords: '夜に駆ける', limit: -1 },
      { keywords: '夜に駆ける', offset: 1.5 },
    ],
  },
  {
    module: 'fm_trash',
    valid: [{ id: 347230 }, { id: '347230', time: '25' }],
    invalid: [
      { time: 25 },
      { id: 0 },
      { id: '3,4' },
      { id: '01' },
      { id: 347230, time: '-1' },
      { id: 347230, time: 'abc' },
    ],
  },
  {
    module: 'history_recommend_songs',
    valid: [{}],
    invalid: [null, [], { date: '2020-06-21' }],
  },
  {
    module: 'history_recommend_songs_detail',
    valid: [{}, { date: '2020-06-21' }],
    invalid: [{ date: 20200621 }, { date: ['2020-06-21'] }, { date: null }],
  },
  {
    module: 'like',
    valid: [
      { id: 347230 },
      { id: '347230', like: 'false' },
      { id: 1, like: 0 },
      { id: 2, like: 'true' },
    ],
    invalid: [
      { like: true },
      { id: 0 },
      { id: '1,2' },
      { id: 1, like: 'yes' },
      { id: 1, like: null },
    ],
  },
  {
    module: 'likelist',
    valid: [{ uid: 10000001 }, { uid: '10000001' }],
    invalid: [{}, { uid: 0 }, { uid: '1,2' }, { uid: 1.5 }, { uid: null }],
  },
  {
    module: 'personal_fm',
    valid: [{}],
    invalid: [null, [], { limit: 1 }],
  },
  {
    module: 'personal_fm_mode',
    valid: [
      { mode: 'DEFAULT' },
      { mode: 'SCENE_RCMD', submode: 'FOCUS', limit: '3' },
      { mode: 'aidj', limit: 3 },
    ],
    invalid: [
      {},
      { mode: 'UNKNOWN' },
      { mode: 1 },
      { mode: 'DEFAULT', limit: -1 },
      { mode: 'DEFAULT', submode: 1 },
    ],
  },
  {
    module: 'pl_count',
    valid: [{}],
    invalid: [null, [], { uid: 10000001 }],
  },
  {
    module: 'recent_listen_list',
    valid: [{}],
    invalid: [null, [], { limit: 1 }],
  },
  {
    module: 'record_recent_album',
    valid: [{}, { limit: '1' }, { limit: 5 }],
    invalid: [{ limit: 'abc' }, { limit: -1 }, { limit: 1.5 }, { limit: null }],
  },
  {
    module: 'record_recent_dj',
    valid: [{}, { limit: '1' }, { limit: 5 }],
    invalid: [{ limit: 'abc' }, { limit: -1 }, { limit: 1.5 }, { limit: null }],
  },
  {
    module: 'record_recent_playlist',
    valid: [{}, { limit: '1' }, { limit: 5 }],
    invalid: [{ limit: 'abc' }, { limit: -1 }, { limit: 1.5 }, { limit: null }],
  },
  {
    module: 'record_recent_song',
    valid: [{}, { limit: '1' }, { limit: 5 }],
    invalid: [{ limit: 'abc' }, { limit: -1 }, { limit: 1.5 }, { limit: null }],
  },
  {
    module: 'record_recent_video',
    valid: [{}, { limit: '1' }, { limit: 5 }],
    invalid: [{ limit: 'abc' }, { limit: -1 }, { limit: 1.5 }, { limit: null }],
  },
  {
    module: 'record_recent_voice',
    valid: [{}, { limit: '1' }, { limit: 5 }],
    invalid: [{ limit: 'abc' }, { limit: -1 }, { limit: 1.5 }, { limit: null }],
  },
];
