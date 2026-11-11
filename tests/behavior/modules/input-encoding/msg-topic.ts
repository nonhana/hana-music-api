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
    module: 'broadcast_channel_collect_list',
    input: {},
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({
        contentType: 'BROADCAST',
        limit: '99999',
        timeReverseOrder: 'true',
        startDate: '4762584922000',
      });
    },
  },
  {
    module: 'broadcast_channel_collect_list',
    input: { limit: '7' },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({
        contentType: 'BROADCAST',
        limit: 7,
        timeReverseOrder: 'true',
        startDate: '4762584922000',
      });
    },
  },
  {
    module: 'broadcast_channel_list',
    input: {},
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({
        categoryId: '0',
        regionId: '0',
        limit: '20',
        lastId: '0',
        score: '-1',
      });
    },
  },
  {
    module: 'broadcast_channel_list',
    input: {
      limit: '7',
      categoryId: '5',
      regionId: 9,
      lastId: '13',
      score: 3,
    },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({
        categoryId: '5',
        regionId: '9',
        limit: 7,
        lastId: '13',
        score: 3,
      });
    },
  },
  {
    module: 'broadcast_sub',
    input: { id: '131', t: '1' },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({
        contentType: 'BROADCAST',
        contentId: '131',
        cancelCollect: 'false',
      });
    },
  },
  {
    module: 'broadcast_sub',
    input: { id: 131 },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({
        contentType: 'BROADCAST',
        contentId: 131,
        cancelCollect: 'true',
      });
    },
  },
  {
    module: 'hot_topic',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 20, offset: 0 });
    },
  },
  {
    module: 'hot_topic',
    input: { limit: '30', offset: '30' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 30, offset: 30 });
    },
  },
  {
    module: 'msg_comments',
    input: { uid: '23', limit: 10, before: 1 },
    check: (wires) => {
      expect(wires[0]!.url).toBe(
        'https://music.163.com/weapi/v1/user/comments/23',
      );
      expect(webData(wires[0]!)).toEqual({
        beforeTime: 1,
        limit: 10,
        total: 'true',
        uid: '23',
      });
    },
  },
  {
    module: 'msg_forwards',
    input: { limit: '7', offset: 3 },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        offset: 3,
        limit: 7,
        total: 'true',
      });
    },
  },
  {
    module: 'msg_notices',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 30, time: -1 });
    },
  },
  {
    module: 'msg_notices',
    input: { limit: '3', lasttime: -1 },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 3, time: -1 });
    },
  },
  {
    module: 'msg_private',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        offset: 0,
        limit: 30,
        total: 'true',
      });
    },
  },
  {
    module: 'msg_private_history',
    input: { uid: '23', before: '1700000000000' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        userId: '23',
        limit: 30,
        time: 1700000000000,
        total: 'true',
      });
    },
  },
  {
    module: 'topic_sublist',
    input: { limit: '2', offset: '1' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        limit: 2,
        offset: 1,
        total: true,
      });
    },
  },
];
