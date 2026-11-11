import { expect } from 'bun:test';

import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import type { EncodingCase, EncodingWire } from './contract.ts';

const webData = (wire: EncodingWire): Record<string, unknown> => {
  const {
    csrf_token: _csrf,
    e_r: _encryptResponse,
    ...data
  } = readWebBody(wire.body) as Record<string, unknown>;
  return data;
};

const eapiData = (wire: EncodingWire): Record<string, unknown> => {
  const {
    header: _header,
    e_r: _encryptResponse,
    csrf_token: _csrf,
    checkToken: _checkToken,
    ...data
  } = readEapiBody(wire.body).data as Record<string, unknown>;
  return data;
};

export const cases: ReadonlyArray<EncodingCase> = [
  {
    module: 'artist_album',
    input: { id: '33927412' },
    check: (wires) => {
      expect(wires[0]!.url).toBe(
        'https://music.163.com/weapi/artist/albums/33927412',
      );
      expect(webData(wires[0]!)).toEqual({
        limit: 30,
        offset: 0,
        total: true,
      });
    },
  },
  {
    module: 'artist_album',
    input: { id: 33927412, limit: '15', offset: '30' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        limit: 15,
        offset: 30,
        total: true,
      });
    },
  },
  {
    module: 'artist_fans',
    input: { id: '3684' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        id: '3684',
        limit: 20,
        offset: 0,
      });
    },
  },
  {
    module: 'artist_list',
    input: { type: '2', area: '96', initial: 'z', limit: '5', offset: '3' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        initial: 90,
        offset: 3,
        limit: 5,
        total: true,
        type: 2,
        area: 96,
      });
    },
  },
  {
    module: 'artist_list',
    input: { initial: '-1', type: '-1' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        initial: '-1',
        offset: 0,
        limit: 30,
        total: true,
        type: -1,
      });
    },
  },
  {
    module: 'artist_list',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        offset: 0,
        limit: 30,
        total: true,
        type: 1,
      });
    },
  },
  {
    module: 'artist_new_mv',
    input: { limit: '20', before: 1700000000000 },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        limit: 20,
        startTimestamp: 1700000000000,
      });
    },
  },
  {
    module: 'artist_new_song',
    input: { limit: '20', before: '1700000000000' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        limit: 20,
        startTimestamp: 1700000000000,
      });
    },
  },
  {
    module: 'artist_songs',
    input: { id: '3684', order: 'time', limit: '20', offset: '5' },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({
        id: '3684',
        private_cloud: 'true',
        work_type: 1,
        order: 'time',
        offset: 5,
        limit: 20,
      });
    },
  },
  {
    module: 'artist_songs',
    input: { id: 3684 },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({
        id: 3684,
        private_cloud: 'true',
        work_type: 1,
        order: 'hot',
        offset: 0,
        limit: 100,
      });
    },
  },
  {
    module: 'artist_sub',
    input: { id: '4455', t: '1' },
    check: (wires) => {
      expect(wires[0]!.url).toBe('https://music.163.com/weapi/artist/sub');
      expect(webData(wires[0]!)).toEqual({
        artistId: '4455',
        artistIds: '[4455]',
      });
    },
  },
  {
    module: 'artist_sub',
    input: { id: 4455, t: 0 },
    check: (wires) => {
      expect(wires[0]!.url).toBe('https://music.163.com/weapi/artist/unsub');
      expect(webData(wires[0]!)).toEqual({
        artistId: 4455,
        artistIds: '[4455]',
      });
    },
  },
  {
    module: 'artist_sublist',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        limit: 25,
        offset: 0,
        total: true,
      });
    },
  },
  {
    module: 'artist_video',
    input: { id: '3684', cursor: '100000', size: '10', order: 1 },
    check: (wires) => {
      const data = webData(wires[0]!);
      expect(data.artistId).toBe('3684');
      expect(data.tab).toBe(0);
      expect(data.order).toBe(1);
      expect(JSON.parse(String(data.page))).toEqual({
        size: 10,
        cursor: 100000,
      });
    },
  },
  {
    module: 'artist_video',
    input: { id: 3684 },
    check: (wires) => {
      const data = webData(wires[0]!);
      expect(data.order).toBe(0);
      expect(JSON.parse(String(data.page))).toEqual({
        size: 10,
        cursor: 0,
      });
    },
  },
  {
    module: 'ugc_artist_search',
    input: { keyword: 97335329 },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({
        keyword: 97335329,
        limit: 40,
      });
    },
  },
  {
    module: 'ugc_artist_search',
    input: { keyword: 'sasakure', limit: '10' },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({
        keyword: 'sasakure',
        limit: 10,
      });
    },
  },
  {
    module: 'ugc_detail',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        auditStatus: '',
        limit: 10,
        offset: 0,
        order: 'desc',
        sortBy: 'createTime',
        type: 1,
      });
    },
  },
  {
    module: 'ugc_detail',
    input: {
      auditStatus: '1',
      limit: '5',
      offset: '10',
      order: 'asc',
      sortBy: 'updateTime',
      type: '101',
    },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        auditStatus: 1,
        limit: 5,
        offset: 10,
        order: 'asc',
        sortBy: 'updateTime',
        type: 101,
      });
    },
  },
];
