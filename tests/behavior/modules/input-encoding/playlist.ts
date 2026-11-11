import { expect } from 'bun:test';

import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import type { EncodingCase } from './contract.ts';

export const cases: ReadonlyArray<EncodingCase> = [
  {
    module: 'playlist_create',
    input: { name: '测试歌单' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        name: '测试歌单',
        privacy: '0',
        type: 'NORMAL',
      });
    },
  },
  {
    module: 'playlist_create',
    input: { name: '私密视频歌单', privacy: '10', type: 'VIDEO' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        name: '私密视频歌单',
        privacy: 10,
        type: 'VIDEO',
      });
    },
  },
  {
    module: 'playlist_delete',
    input: { id: '900000021' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        ids: '[900000021]',
      });
    },
  },
  {
    module: 'playlist_delete',
    input: { id: [900000021, '900000022'] },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        ids: '[900000021,900000022]',
      });
    },
  },
  {
    module: 'playlist_detail',
    input: { id: '123' },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        id: '123',
        n: 100000,
        s: 8,
      });
    },
  },
  {
    module: 'playlist_detail_dynamic',
    input: { id: 456, s: '7' },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        id: 456,
        n: 100000,
        s: 7,
      });
    },
  },
  {
    module: 'playlist_mylike',
    input: {},
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        time: '-1',
        limit: '12',
      });
    },
  },
  {
    module: 'playlist_subscribers',
    input: { id: 1 },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        id: 1,
        limit: 20,
        offset: 0,
      });
    },
  },
  {
    module: 'playlist_subscribe',
    input: { id: 1, t: '1' },
    check: (wires) => {
      expect(wires[0]!.url).toBe(
        'https://music.163.com/weapi/playlist/subscribe',
      );
      expect(readWebBody(wires[0]!.body)).toMatchObject({ id: 1 });
    },
  },
  {
    module: 'playlist_subscribe',
    input: { id: 1, t: 2 },
    check: (wires) => {
      expect(wires[0]!.url).toBe(
        'https://music.163.com/weapi/playlist/unsubscribe',
      );
      expect(readWebBody(wires[0]!.body)).toMatchObject({ id: 1 });
    },
  },
  {
    module: 'playlist_track_add',
    input: { pid: '1', ids: [2, '3'] },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        id: '1',
        tracks: '[{"type":3,"id":"2"},{"type":3,"id":"3"}]',
      });
    },
  },
  {
    module: 'playlist_track_delete',
    input: { id: 1, ids: [2] },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        id: 1,
        tracks: '[{"type":3,"id":"2"}]',
      });
    },
  },
  {
    module: 'playlist_track_all',
    input: { id: '9', limit: 2, offset: 1, s: '7' },
    respond: (_wire, index) =>
      index === 0
        ? Response.json({
            code: 200,
            playlist: {
              trackIds: [{ id: 1 }, { id: 2 }, { id: 3 }],
            },
          })
        : undefined,
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        id: '9',
        n: 100000,
        s: 7,
      });
      expect(readEapiBody(wires[1]!.body).data).toMatchObject({
        c: '[{"id":2},{"id":3}]',
      });
    },
  },
  {
    module: 'playlist_update',
    input: { id: '2', name: '歌单', desc: '描述', tags: ['华语', '流行'] },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        '/api/playlist/desc/update': '{"id":2,"desc":"描述"}',
        '/api/playlist/tags/update': '{"id":2,"tags":"华语;流行"}',
        '/api/playlist/update/name': '{"id":2,"name":"歌单"}',
      });
    },
  },
  {
    module: 'playlist_update',
    input: { id: 3, name: '歌单' },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        '/api/playlist/desc/update': '{"id":3,"desc":""}',
        '/api/playlist/tags/update': '{"id":3,"tags":""}',
        '/api/playlist/update/name': '{"id":3,"name":"歌单"}',
      });
    },
  },
  {
    module: 'playlist_import_task_status',
    input: { id: '202306216' },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        taskIds: '["202306216"]',
      });
    },
  },
  {
    module: 'playlist_import_name_task_create',
    input: {
      local: [{ name: 'song', artist: 'artist', album: 'album' }],
      importStarPlaylist: 'true',
    },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        importStarPlaylist: true,
        multiSongs:
          '[{"songName":"song","artistName":"artist","albumName":"album"}]',
      });
    },
  },
  {
    module: 'playlist_import_name_task_create',
    input: { text: 'song artist', playlistName: 'imported' },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        importStarPlaylist: false,
        playlistName: 'imported',
        taskIdForLog: '',
        songs:
          '[{"name":"imported","type":"","url":"rpc://playlist/import?text=song%20artist"}]',
      });
    },
  },
  {
    module: 'playlist_import_name_task_create',
    input: {
      link: ['https://example.org/list?q=曲'],
      playlistName: 'imported',
    },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        importStarPlaylist: false,
        playlistName: 'imported',
        taskIdForLog: '',
        songs:
          '[{"name":"imported","type":"","url":"https://example.org/list?q=%E6%9B%B2"}]',
      });
    },
  },
  {
    module: 'playlist_import_name_task_create',
    input: {},
    check: (wires) => {
      const data = readEapiBody(wires[0]!.body).data as Record<string, unknown>;
      expect(data.importStarPlaylist).toBe(false);
      expect(data.taskIdForLog).toBe('');
      expect(data.songs).toBe('');
      expect(String(data.playlistName).startsWith('导入音乐 ')).toBe(true);
    },
  },
];
