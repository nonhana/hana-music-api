import { expect } from 'bun:test';

import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import type { EncodingCase } from './contract.ts';

const webData = (body: string) => {
  const {
    csrf_token: _csrf,
    e_r: _encryptResponse,
    header: _header,
    ...data
  } = readWebBody(body) as Record<string, unknown>;
  return data;
};

const eapiData = (body: string) => {
  const {
    csrf_token: _csrf,
    e_r: _encryptResponse,
    header: _header,
    ...data
  } = readEapiBody(body).data as Record<string, unknown>;
  return data;
};

export const cases: ReadonlyArray<EncodingCase> = [
  {
    module: 'event',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        pagesize: 20,
        lasttime: -1,
      });
    },
  },
  {
    module: 'event',
    input: { pagesize: '5', lasttime: '-1' },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        pagesize: 5,
        lasttime: -1,
      });
    },
  },
  {
    module: 'follow',
    input: { id: '17', t: '1' },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/user/follow/17');
      expect(webData(wires[0]!.body)).toEqual({});
    },
  },
  {
    module: 'follow',
    input: { id: 17, t: 0 },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/user/delfollow/17');
      expect(webData(wires[0]!.body)).toEqual({});
    },
  },
  {
    module: 'get_userids',
    input: { nicknames: ['synthetic', 'missing'] },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        nicknames: 'synthetic;missing',
      });
    },
  },
  {
    module: 'hug_comment',
    input: { uid: '23', cid: '29', sid: '17', type: '6' },
    check: (wires) => {
      expect(eapiData(wires[0]!.body)).toEqual({
        targetUserId: '23',
        commentId: '29',
        threadId: 'A_EV_2_17',
      });
    },
  },
  {
    module: 'resource_like',
    input: { id: '17', type: '0', t: '0' },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/resource/unlike');
      expect(webData(wires[0]!.body)).toEqual({
        threadId: 'R_SO_4_17',
      });
    },
  },
  {
    module: 'resource_like',
    input: { id: '17', type: 6, t: 1, threadId: 'A_EV_2_synthetic' },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/resource/like');
      expect(webData(wires[0]!.body)).toEqual({
        threadId: 'A_EV_2_synthetic',
      });
    },
  },
  {
    module: 'send_album',
    input: { id: '17', userIds: ['23', '29'] },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        id: '17',
        msg: '',
        type: 'album',
        userIds: '[23,29]',
      });
    },
  },
  {
    module: 'send_playlist',
    input: { playlist: '17', userIds: ['23', 29], msg: 'synthetic' },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        id: '17',
        type: 'playlist',
        msg: 'synthetic',
        userIds: '[23,29]',
      });
    },
  },
  {
    module: 'send_song',
    input: { id: '17', userIds: [23] },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        id: '17',
        msg: '',
        type: 'song',
        userIds: '[23]',
      });
    },
  },
  {
    module: 'send_text',
    input: { userIds: ['23', '29'] },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        type: 'text',
        userIds: '[23,29]',
      });
    },
  },
  {
    module: 'share_resource',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        type: 'song',
        msg: '',
        id: '',
      });
    },
  },
  {
    module: 'share_resource',
    input: { id: '17', type: 'mv', msg: 'synthetic share' },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        type: 'mv',
        msg: 'synthetic share',
        id: '17',
      });
    },
  },
];
