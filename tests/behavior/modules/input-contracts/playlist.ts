import type { ModuleInputCase } from './contract.ts';

export const cases: ReadonlyArray<ModuleInputCase> = [
  { module: 'playlist_catlist', valid: [{}], invalid: [{ id: 1 }] },
  {
    module: 'playlist_cover_update',
    valid: [
      { id: 1, imgId: 'doc-1' },
      { id: '900000002', imgId: '109951174079391436' },
    ],
    invalid: [
      { id: '1,2', imgId: 'img' },
      { id: 0, imgId: 'img' },
      { id: 1, imgId: {} },
    ],
  },
  {
    module: 'playlist_create',
    valid: [
      { name: '歌单' },
      { name: '私密视频歌单', privacy: 10, type: 'VIDEO' },
      { name: '共享歌单', privacy: '10', type: 'SHARED' },
    ],
    invalid: [
      {},
      { name: 1 },
      { name: '歌单', privacy: 5 },
      { name: '歌单', privacy: '20' },
      { name: '歌单', type: 'LOCAL' },
    ],
  },
  {
    module: 'playlist_delete',
    valid: [{ id: 1 }, { id: '2' }, { id: [3, '4'] }],
    invalid: [{}, { id: 0 }, { id: '1,2' }, { id: [] }],
  },
  {
    module: 'playlist_desc_update',
    valid: [
      { id: 1, desc: '' },
      { id: '2', desc: '描述' },
    ],
    invalid: [{ id: 1 }, { id: 0, desc: '描述' }, { id: 1, desc: 1 }],
  },
  {
    module: 'playlist_detail',
    valid: [{ id: 1 }, { id: '2', s: 8 }, { id: 3, s: '8' }],
    invalid: [
      { id: 0 },
      { id: '01' },
      { id: 1, s: -1 },
      { id: 1, s: 1.5 },
      { id: 1, s: 'x' },
    ],
  },
  {
    module: 'playlist_detail_dynamic',
    valid: [{ id: 1 }, { id: '2', s: 8 }, { id: 3, s: '8' }],
    invalid: [{ id: 0 }, { id: '1,2' }, { id: 1, s: -1 }, { id: 1, s: 1.5 }],
  },
  {
    module: 'playlist_detail_rcmd_get',
    valid: [{ id: 18374591158 }, { id: '930180433' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }],
  },
  { module: 'playlist_highquality_tags', valid: [{}], invalid: [{ id: 1 }] },
  { module: 'playlist_hot', valid: [{}], invalid: [{ id: 1 }] },
  {
    module: 'playlist_import_name_task_create',
    valid: [
      {},
      { text: 'song artist', playlistName: '导入' },
      { local: [{ name: 'song', artist: 'artist', album: 'album' }] },
      { local: [{}] },
      { link: ['https://example.org/list?q=曲'] },
      { importStarPlaylist: 'true' },
    ],
    invalid: [
      { local: '[]' },
      { link: '[]' },
      { link: [1] },
      { local: [{ name: 1 }] },
      { text: 1 },
      { importStarPlaylist: 'yes' },
    ],
  },
  {
    module: 'playlist_import_task_status',
    valid: [{ id: 1 }, { id: '202306216' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }],
  },
  {
    module: 'playlist_mylike',
    valid: [{}, { time: -1, limit: 12 }, { time: '-1', limit: '12' }],
    invalid: [
      { time: 1.5 },
      { time: 'abc' },
      { limit: -1 },
      { limit: 'x' },
      { time: null },
    ],
  },
  {
    module: 'playlist_name_update',
    valid: [
      { id: 1, name: '' },
      { id: '2', name: '歌单名' },
    ],
    invalid: [{ id: 1 }, { name: '歌单名' }, { id: 0, name: '歌单名' }],
  },
  {
    module: 'playlist_order_update',
    valid: [{ ids: [1, '2'] }],
    invalid: [{ ids: [] }, { ids: ['1,2'] }, { ids: [0] }, {}],
  },
  {
    module: 'playlist_privacy',
    valid: [{ id: 1 }, { id: '900000020' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }],
  },
  {
    module: 'playlist_subscribe',
    valid: [
      { id: 1, t: 1 },
      { id: 2, t: 2 },
      { id: 3, t: 0 },
      { id: 4, t: '1' },
    ],
    invalid: [{ id: 1 }, { id: 1, t: 3 }, { id: 0, t: 1 }, { id: '1,2', t: 1 }],
  },
  {
    module: 'playlist_subscribers',
    valid: [
      { id: 1 },
      { id: '2', limit: 20, offset: 0 },
      { id: 3, limit: '20', offset: '20' },
    ],
    invalid: [
      { limit: 20 },
      { id: 1, limit: -1 },
      { id: 1, offset: 1.5 },
      { id: 1, limit: 'x' },
    ],
  },
  {
    module: 'playlist_tags_update',
    valid: [
      { id: 1, tags: ['rock', '2026'] },
      { id: '2', tags: [] },
    ],
    invalid: [
      { id: 1, tags: ['rock;pop'] },
      { id: 1, tags: [''] },
      { id: 0, tags: [] },
      { id: 1, tags: 'rock;pop' },
    ],
  },
  {
    module: 'playlist_track_add',
    valid: [
      { pid: 1, ids: [2] },
      { pid: '1', ids: [2, '3'] },
    ],
    invalid: [
      {},
      { pid: 1 },
      { pid: 1, ids: [] },
      { pid: 1, ids: '2,3' },
      { pid: 0, ids: [2] },
    ],
  },
  {
    module: 'playlist_track_all',
    valid: [
      { id: 1 },
      { id: '2', s: 8, limit: 10, offset: 0 },
      { id: 3, limit: '10', offset: '0' },
    ],
    invalid: [
      {},
      { id: 0 },
      { id: 1, s: -1 },
      { id: 1, limit: -1 },
      { id: 1, offset: 1.2 },
    ],
  },
  {
    module: 'playlist_track_delete',
    valid: [
      { id: 1, ids: [2] },
      { id: '1', ids: [2, '3'] },
    ],
    invalid: [
      {},
      { id: 1 },
      { id: 1, ids: [] },
      { id: 1, ids: '2,3' },
      { id: 0, ids: [2] },
    ],
  },
  {
    module: 'playlist_tracks',
    valid: [{ op: 'add', pid: 1, tracks: [2, '3'] }],
    invalid: [
      { op: 'move', pid: 1, tracks: [2] },
      { op: 'add', pid: 0, tracks: [2] },
      { op: 'add', pid: 1, tracks: [] },
      { op: 'add', pid: 1, tracks: ['1,2'] },
    ],
  },
  {
    module: 'playlist_update',
    valid: [
      { id: 1, name: '歌单' },
      { id: '2', name: '歌单', desc: '', tags: ['华语', '流行'] },
    ],
    invalid: [
      { id: 1 },
      { id: 0, name: '歌单' },
      { id: 1, name: '歌单', tags: '华语;流行' },
      { id: 1, name: '歌单', tags: ['华语;流行'] },
      { id: 1, name: '歌单', tags: [''] },
    ],
  },
  {
    module: 'playlist_update_playcount',
    valid: [{ id: 1 }, { id: '18526771500' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }],
  },
  { module: 'playlist_video_recent', valid: [{}], invalid: [{ id: 1 }] },
];
