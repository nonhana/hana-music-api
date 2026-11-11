import type { ModuleInputCase } from './contract.ts';

export const cases: ReadonlyArray<ModuleInputCase> = [
  {
    module: 'batch',
    open: true,
    valid: [
      { '/api/song/detail': { ids: [1] } },
      {
        '/api/playlist/tracks': { op: 'add', pid: '23', trackIds: '[17]' },
        '/api/v2/banner/get': { clientType: 'pc' },
      },
    ],
    invalid: [
      [],
      null,
      { '/api/song/detail': null },
      { '/api/song/detail': [] },
      { '/api/song/detail': '{"ids":[1]}' },
    ],
  },
  {
    module: 'image_upload_token',
    valid: [{}],
    invalid: [[], null, { type: 'week' }],
  },
  {
    module: 'listen_data_realtime_report',
    valid: [{}, { type: 'week' }, { type: 'month' }],
    invalid: [{ type: 'year' }, { type: 1 }, { endTime: 1 }],
  },
  {
    module: 'listen_data_report',
    valid: [
      {},
      { type: 'week' },
      { endTime: '1704067200000', type: 'year' },
      { endTime: 1700600000000, type: 'month' },
    ],
    invalid: [
      { type: 'day' },
      { type: 0 },
      { endTime: -1 },
      { endTime: 'abc' },
    ],
  },
  {
    module: 'listen_data_today_song',
    valid: [{}],
    invalid: [[], null, { type: 'week' }],
  },
  {
    module: 'listen_data_total',
    valid: [{}],
    invalid: [[], null, { type: 'week' }],
  },
  {
    module: 'listen_data_year_report',
    valid: [{}],
    invalid: [[], null, { type: 'year' }],
  },
  {
    module: 'listentogether_accept',
    valid: [
      { inviterId: 900000001, roomId: 'room_1' },
      {
        inviterId: '900000001',
        roomId: '173c2b24bbfbd4f61546d31e0af852ed_1792991389',
      },
    ],
    invalid: [
      { inviterId: 0, roomId: 'room_1' },
      { roomId: 'room_1' },
      { inviterId: 1, roomId: 1 },
      { inviterId: '1,2', roomId: 'room_1' },
    ],
  },
  {
    module: 'listentogether_end',
    valid: [
      { roomId: 'room_1' },
      { roomId: 'e0902e73ecee9403a8d393247d6857d2_1792991303' },
    ],
    invalid: [{}, { roomId: 1 }, { roomId: null }],
  },
  {
    module: 'listentogether_heatbeat',
    valid: [
      {
        playStatus: 'PLAY',
        progress: 0,
        roomId: 'room_1',
        songId: 1394617453,
      },
      {
        playStatus: 'PAUSE',
        progress: '1250',
        roomId: 'room_2',
        songId: '17',
      },
    ],
    invalid: [
      { playStatus: 'PLAY', progress: 0, roomId: 'room_1', songId: 0 },
      { playStatus: 'PLAY', progress: -1, roomId: 'room_1', songId: 1 },
      { playStatus: 'PLAY', progress: 1.5, roomId: 'room_1', songId: 1 },
      { playStatus: 'PLAY', progress: 0, songId: 1 },
    ],
  },
  {
    module: 'listentogether_play_command',
    valid: [
      {
        clientSeq: 1,
        commandType: 'PLAY',
        playStatus: 'PLAY',
        roomId: 'room_1',
        targetSongId: 1394617453,
      },
      {
        clientSeq: '2',
        commandType: 'SEEK',
        formerSongId: '-1',
        playStatus: 'PAUSE',
        progress: '1250',
        roomId: 'room_2',
        targetSongId: '17',
      },
    ],
    invalid: [
      {
        clientSeq: 1,
        commandType: 'PLAY',
        playStatus: 'PLAY',
        roomId: 'room_1',
        targetSongId: 0,
      },
      {
        clientSeq: -1,
        commandType: 'PLAY',
        playStatus: 'PLAY',
        roomId: 'room_1',
        targetSongId: 1,
      },
      {
        clientSeq: 1,
        commandType: 'PLAY',
        playStatus: 'PLAY',
        progress: 1.5,
        roomId: 'room_1',
        targetSongId: 1,
      },
      {
        clientSeq: 1,
        commandType: 'PLAY',
        formerSongId: 1.5,
        playStatus: 'PLAY',
        roomId: 'room_1',
        targetSongId: 1,
      },
      {
        clientSeq: 1,
        commandType: 'PLAY',
        playStatus: 'PLAY',
        roomId: 'room_1',
      },
    ],
  },
  {
    module: 'listentogether_room_check',
    valid: [{ roomId: 'room_1' }],
    invalid: [{}, { roomId: 0 }, { roomId: null }],
  },
  {
    module: 'listentogether_room_create',
    valid: [{}],
    invalid: [[], null, { roomId: 'room_1' }],
  },
  {
    module: 'listentogether_status',
    valid: [{}],
    invalid: [[], null, { roomId: 'room_1' }],
  },
  {
    module: 'listentogether_sync_list_command',
    valid: [
      {
        roomId: 'room_1',
        commandType: 'REPLACE',
        version: 2,
        userId: 3,
        randomList: [4, '5'],
        displayList: [],
      },
      {
        roomId: 'room_2',
        commandType: 'PLAYMODE_CHANGE',
        version: '3',
        userId: '900000001',
        randomList: [],
        displayList: ['17'],
      },
    ],
    invalid: [
      {
        roomId: 'room_1',
        commandType: 'REPLACE',
        version: 2,
        userId: 3,
        randomList: [],
        displayList: [],
        extra: true,
      },
      {
        roomId: 1,
        commandType: 'REPLACE',
        version: 2,
        userId: 3,
        randomList: [],
        displayList: [],
      },
      {
        roomId: 'room_1',
        commandType: 1,
        version: 2,
        userId: 3,
        randomList: [],
        displayList: [],
      },
      {
        roomId: 'room_1',
        commandType: 'REPLACE',
        version: 2,
        userId: 3,
        randomList: ['1,2'],
        displayList: [],
      },
      {
        roomId: 'room_1',
        commandType: 'REPLACE',
        version: -1,
        userId: 3,
        randomList: [],
        displayList: [],
      },
      {
        roomId: 'room_1',
        commandType: 'REPLACE',
        version: 2,
        userId: 0,
        randomList: [],
        displayList: [],
      },
    ],
  },
  {
    module: 'listentogether_sync_playlist_get',
    valid: [{ roomId: 'room_1' }],
    invalid: [{}, { roomId: 0 }, { roomId: null }],
  },
];
