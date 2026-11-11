import type { ModuleInputCase } from './contract.ts';

export const cases: ReadonlyArray<ModuleInputCase> = [
  {
    module: 'mlog_music_rcmd',
    valid: [
      { songid: 1330348068 },
      { songid: '347230', mvid: '31', limit: '5' },
    ],
    invalid: [
      {},
      { songid: 0 },
      { songid: '1,2' },
      { songid: 'a1PvyoDUbEJmk0' },
      { songid: 1, mvid: 0 },
      { songid: 1, limit: -1 },
      { songid: 1, limit: 1.5 },
    ],
  },
  {
    module: 'mlog_to_video',
    valid: [{ id: 'a1PvyoDUbEJmk0' }, { id: '17' }],
    invalid: [{}, { id: 17 }, { id: null }],
  },
  {
    module: 'mlog_url',
    valid: [
      { id: 'a1PvyoDUbEJmk0' },
      { id: '17', res: 720 },
      { id: '17', res: '720' },
    ],
    invalid: [
      {},
      { id: 17 },
      { id: '17', res: -1 },
      { id: '17', res: 1.5 },
      { id: '17', res: 'abc' },
    ],
  },
  {
    module: 'program_recommend',
    valid: [
      {},
      { limit: 7, offset: 3 },
      { type: 'PUBLIC', limit: '5', offset: '0' },
    ],
    invalid: [
      { limit: -1 },
      { offset: 1.5 },
      { limit: 'x' },
      { type: 5 },
      { type: null },
    ],
  },
  {
    module: 'voice_delete',
    valid: [{ ids: [17, 19] }, { ids: ['17', '19'] }],
    invalid: [
      {},
      { ids: [] },
      { ids: '[17,19]' },
      { ids: ['1,2'] },
      { ids: [0] },
    ],
  },
  {
    module: 'voice_detail',
    valid: [{ id: 2487367164 }, { id: '17' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }, { id: 1.5 }],
  },
  {
    module: 'voice_lyric',
    valid: [{ id: 3064901323 }, { id: '17' }],
    invalid: [{}, { id: 0 }, { id: 'abc' }, { id: null }],
  },
  {
    module: 'voice_upload',
    valid: [
      {},
      {
        autoPublish: true,
        autoPublishText: 'publish',
        categoryId: 17,
        composedSongs: [17, '19'],
        coverImgId: '23',
        description: 'desc',
        orderNo: 2,
        privacy: false,
        publishTime: 1234,
        secondCategoryId: 29,
        songFile: {
          data: new Uint8Array([1, 2]),
          mimetype: 'audio/mpeg',
          name: 'demo.mp3',
          size: 2,
        },
        songName: 'demo',
        voiceListId: 31,
      },
    ],
    invalid: [
      { autoPublish: 'yes' },
      { privacy: 2 },
      { categoryId: 0 },
      { coverImgId: 'cover' },
      { orderNo: -1 },
      { publishTime: 1.5 },
      { voiceListId: ['1'] },
      {
        songFile: {
          data: 'binary',
          mimetype: 'audio/mpeg',
          name: 'a',
          size: 1,
        },
      },
    ],
  },
  {
    module: 'voicelist_detail',
    valid: [{ id: 792544462 }, { id: '17' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }],
  },
  {
    module: 'voicelist_list',
    valid: [
      { voiceListId: 792544462 },
      { voiceListId: '37', limit: 7, offset: '3' },
    ],
    invalid: [
      {},
      { voiceListId: 0 },
      { voiceListId: '1,2' },
      { voiceListId: 1, limit: -1 },
      { voiceListId: 1, offset: 1.5 },
    ],
  },
  {
    module: 'voicelist_list_search',
    valid: [
      {},
      { voiceListId: 792544462 },
      {
        voiceListId: '37',
        limit: 7,
        offset: 3,
        name: 'voice',
        displayStatus: 'ONLINE',
        type: 'PUBLIC',
        voiceFeeType: 1,
      },
      { voiceListId: 37, voiceFeeType: '-1' },
    ],
    invalid: [
      { voiceListId: 0 },
      { voiceListId: 37, voiceFeeType: 1.5 },
      { voiceListId: 37, voiceFeeType: 'x' },
      { voiceListId: 37, name: 5 },
      { voiceListId: 37, displayStatus: 1 },
    ],
  },
  {
    module: 'voicelist_search',
    valid: [
      {},
      { limit: 7, offset: 3, podcastName: 'podcast' },
      { limit: '7', offset: '3' },
    ],
    invalid: [
      { limit: -1 },
      { offset: 1.5 },
      { podcastName: 5 },
      { limit: 'x' },
    ],
  },
  {
    module: 'voicelist_trans',
    valid: [
      {},
      { limit: 7, offset: 3, radioId: '37', programId: 41, position: 3 },
    ],
    invalid: [
      { radioId: 0 },
      { programId: 'x' },
      { position: -1 },
      { position: 0 },
      { limit: 1.5 },
      { offset: 'x' },
    ],
  },
];
