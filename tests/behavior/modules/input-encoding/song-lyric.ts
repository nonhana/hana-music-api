import { expect } from 'bun:test';

import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import type { EncodingCase } from './contract.ts';

export const cases: ReadonlyArray<EncodingCase> = [
  {
    module: 'check_music',
    input: { id: '34', br: '320000' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        br: 320000,
        ids: '[34]',
      });
    },
  },
  {
    module: 'check_music',
    input: { id: 12 },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        br: 999000,
        ids: '[12]',
      });
    },
  },
  {
    module: 'scrobble',
    input: { id: 22712179, sourceid: 323232, time: 241 },
    check: (wires) => {
      expect(wires).toHaveLength(2);
      const start = readEapiBody(wires[0]!.body).data as { logs: string };
      const play = readEapiBody(wires[1]!.body).data as { logs: string };
      expect(JSON.parse(start.logs)).toEqual([
        {
          action: 'startplay',
          json: {
            content: 'id=323232',
            id: 22712179,
            mainsite: '1',
            mainsiteWeb: '1',
            type: 'song',
          },
        },
      ]);
      expect(JSON.parse(play.logs)).toEqual([
        {
          action: 'play',
          json: {
            content: 'id=323232',
            download: 0,
            end: 'playend',
            id: 22712179,
            mainsite: '1',
            mainsiteWeb: '1',
            source: 'list',
            sourceId: 323232,
            time: 241,
            type: 'song',
            wifi: 0,
          },
        },
      ]);
    },
  },
  {
    module: 'song_chorus',
    input: { id: '2058263032' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        ids: '["2058263032"]',
      });
    },
  },
  {
    module: 'song_downlist',
    input: {},
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        limit: '20',
        offset: '0',
        total: 'true',
      });
    },
  },
  {
    module: 'song_downlist',
    input: { limit: '5', offset: 10 },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        limit: '5',
        offset: '10',
        total: 'true',
      });
    },
  },
  {
    module: 'song_download_url',
    input: { id: '34', br: '320000' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        br: 320000,
        id: '34',
      });
    },
  },
  {
    module: 'song_download_url',
    input: { id: 12 },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        br: 999000,
        id: 12,
      });
    },
  },
  {
    module: 'song_like_check',
    input: { ids: [17, '23'] },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        trackIds: '["17","23"]',
      });
    },
  },
  {
    module: 'song_lyrics_mark_add',
    input: {
      id: 1394617453,
      markId: 29,
      marks: [
        {
          originalLyricsText: 'テスト抜粋一',
          startTimeStamp: 1000,
          translateLyricsText: '测试摘录一',
          translateType: 1,
        },
      ],
    },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      const data = readEapiBody(wires[0]!.body).data as {
        data: string;
        markId: unknown;
        songId: unknown;
      };
      expect(data.songId).toBe(1394617453);
      expect(data.markId).toBe(29);
      expect(JSON.parse(data.data)).toEqual([
        {
          originalLyricsText: 'テスト抜粋一',
          startTimeStamp: 1000,
          translateLyricsText: '测试摘录一',
          translateType: 1,
        },
      ]);
    },
  },
  {
    module: 'song_lyrics_mark_add',
    input: { id: 12 },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        data: '[]',
        markId: '',
        songId: 12,
      });
    },
  },
  {
    module: 'song_lyrics_mark_user_page',
    input: {},
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        limit: 10,
        offset: 0,
      });
    },
  },
  {
    module: 'song_monthdownlist',
    input: {},
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        limit: '20',
        offset: '0',
        total: 'true',
      });
    },
  },
  {
    module: 'song_purchased',
    input: { limit: '5', offset: 10 },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        limit: 5,
        offset: 10,
      });
    },
  },
  {
    module: 'song_singledownlist',
    input: {},
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        limit: '20',
        offset: '0',
        total: 'true',
      });
    },
  },
  {
    module: 'song_url',
    input: { br: '320000', ids: [1, '2'] },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        br: 320000,
        ids: '["1","2"]',
      });
    },
  },
  {
    module: 'song_url',
    input: { ids: [1] },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        br: 999000,
        ids: '["1"]',
      });
    },
  },
  {
    module: 'song_url_v1',
    input: { ids: [1, '2'], level: 'sky' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        encodeType: 'flac',
        ids: '["1","2"]',
        immerseType: 'c51',
        level: 'sky',
      });
    },
  },
  {
    module: 'song_url_v1',
    input: { ids: [1], level: 'lossless' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        encodeType: 'flac',
        ids: '["1"]',
        level: 'lossless',
      });
      expect(data).not.toHaveProperty('immerseType');
    },
  },
];
