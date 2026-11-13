import { expect } from 'bun:test';

import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import type { EncodingCase } from './contract.ts';

export const cases: ReadonlyArray<EncodingCase> = [
  {
    module: 'like',
    input: { id: '347230' },
    check: (wires) => {
      expect(wires[0]!.url).toBe('https://music.163.com/weapi/song/like');
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        alg: 'itembased',
        trackId: '347230',
        like: true,
        time: '3',
      });
    },
  },
  {
    module: 'like',
    input: { id: 347230, like: 'false' },
    check: (wires) => {
      expect(wires[0]!.url).toBe('https://music.163.com/weapi/song/like');
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        trackId: 347230,
        like: false,
      });
    },
  },
  {
    module: 'cloud_import',
    input: {
      id: '17',
      song: 'song-A',
      fileType: 'flac',
      fileSize: '50412168',
      bitrate: '1652',
      md5: 'md5-A',
    },
    respond: (_wire, index) =>
      index === 0
        ? Response.json({ code: 200, data: [{ songId: 117 }] })
        : Response.json({ code: 200 }),
    check: (wires) => {
      expect(wires).toHaveLength(2);
      expect(wires[0]!.url).toBe(
        'https://interface.music.163.com/eapi/cloud/upload/check/v2',
      );
      const check = readEapiBody(wires[0]!.body).data as {
        readonly songs: string;
        readonly uploadType: number;
      };
      expect(check.uploadType).toBe(0);
      expect(JSON.parse(check.songs)).toEqual([
        { md5: 'md5-A', songId: '17', bitrate: 1652, fileSize: 50412168 },
      ]);
      expect(wires[1]!.url).toBe(
        'https://interface.music.163.com/eapi/cloud/user/song/import',
      );
      const imported = readEapiBody(wires[1]!.body).data as {
        readonly songs: string;
        readonly uploadType: number;
      };
      expect(imported.uploadType).toBe(0);
      expect(JSON.parse(imported.songs)).toEqual([
        {
          songId: 117,
          bitrate: 1652,
          song: 'song-A',
          artist: '未知',
          album: '未知',
          fileName: 'song-A.flac',
        },
      ]);
    },
  },
  {
    module: 'cloud_import',
    input: { song: 'song-B' },
    respond: (_wire, index) =>
      index === 0
        ? Response.json({ code: 200, data: [{ songId: 119 }] })
        : Response.json({ code: 200 }),
    check: (wires) => {
      const check = readEapiBody(wires[0]!.body).data as {
        readonly songs: string;
      };
      expect(JSON.parse(check.songs)).toEqual([{ songId: -2 }]);
    },
  },
  {
    module: 'cloudsearch',
    input: { keywords: '海阔天空' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        s: '海阔天空',
        type: 1,
        limit: 30,
        offset: 0,
        total: true,
      });
    },
  },
  {
    module: 'cloudsearch',
    input: { keywords: '海阔天空', type: '10', limit: '5', offset: '30' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        type: 10,
        limit: 5,
        offset: 30,
      });
    },
  },
  {
    module: 'fm_trash',
    input: { id: '347230' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        songId: '347230',
        alg: 'RT',
        time: 25,
      });
    },
  },
  {
    module: 'history_recommend_songs_detail',
    input: {},
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({ date: '' });
    },
  },
  {
    module: 'personal_fm_mode',
    input: { mode: 'DEFAULT' },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ mode: 'DEFAULT', limit: 3 });
      expect(data).not.toHaveProperty('subMode');
    },
  },
  {
    module: 'personal_fm_mode',
    input: { mode: 'SCENE_RCMD', submode: 'FOCUS', limit: '5' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        mode: 'SCENE_RCMD',
        subMode: 'FOCUS',
        limit: 5,
      });
    },
  },
  {
    module: 'record_recent_album',
    input: {},
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({ limit: 100 });
    },
  },
  {
    module: 'record_recent_album',
    input: { limit: '5' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({ limit: 5 });
    },
  },
  {
    module: 'record_recent_dj',
    input: { limit: '5' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({ limit: 5 });
    },
  },
  {
    module: 'record_recent_playlist',
    input: { limit: '5' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({ limit: 5 });
    },
  },
  {
    module: 'record_recent_song',
    input: { limit: '5' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({ limit: 5 });
    },
  },
  {
    module: 'record_recent_video',
    input: { limit: '5' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({ limit: 5 });
    },
  },
  {
    module: 'record_recent_voice',
    input: { limit: '5' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({ limit: 5 });
    },
  },
];
