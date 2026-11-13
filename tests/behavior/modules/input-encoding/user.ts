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
    module: 'user_binding',
    input: { uid: '23' },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/v1/user/bindings/23');
      expect(webData(wires[0]!.body)).toEqual({});
    },
  },
  {
    module: 'user_cloud',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({ limit: 30, offset: 0 });
    },
  },
  {
    module: 'user_cloud',
    input: { limit: '50', offset: '20' },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({ limit: 50, offset: 20 });
    },
  },
  {
    module: 'user_cloud_del',
    input: { id: '17' },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({ songIds: ['17'] });
    },
  },
  {
    module: 'user_cloud_detail',
    input: { ids: [17, '23'] },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        songIds: ['17', '23'],
      });
    },
  },
  {
    module: 'user_comment_history',
    input: { uid: '23' },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        compose_reminder: 'true',
        compose_hot_comment: 'true',
        limit: 10,
        user_id: '23',
        time: 0,
      });
    },
  },
  {
    module: 'user_dj',
    input: { uid: '23' },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/dj/program/23');
      expect(webData(wires[0]!.body)).toEqual({ limit: 30, offset: 0 });
    },
  },
  {
    module: 'user_event',
    input: { uid: '23' },
    check: (wires) => {
      expect(wires[0]!.url).toBe('https://music.163.com/weapi/event/get/23');
      expect(webData(wires[0]!.body)).toEqual({
        getcounts: true,
        time: -1,
        limit: 30,
        total: false,
      });
    },
  },
  {
    module: 'user_follow_mixed',
    input: { cursor: '3', size: '5', scene: '2' },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        authority: 'false',
        page: '{"size":5,"cursor":3}',
        scene: 2,
        size: 5,
        sortType: '0',
      });
    },
  },
  {
    module: 'user_followeds',
    input: { uid: '23' },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        userId: '23',
        time: '0',
        limit: 30,
        offset: 0,
        getcounts: 'true',
      });
    },
  },
  {
    module: 'user_follows',
    input: { uid: '23' },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        offset: 0,
        limit: 30,
        order: true,
      });
    },
  },
  {
    module: 'user_playlist',
    input: { uid: '23' },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        uid: '23',
        limit: 30,
        offset: 0,
        includeVideo: true,
      });
    },
  },
  {
    module: 'user_playlist_collect',
    input: { uid: '23' },
    check: (wires) => {
      expect(eapiData(wires[0]!.body)).toEqual({
        limit: '100',
        offset: '0',
        userId: '23',
        isWebview: 'true',
        includeRedHeart: 'true',
        includeTop: 'true',
      });
    },
  },
  {
    module: 'user_playlist_create',
    input: { uid: '23' },
    check: (wires) => {
      expect(eapiData(wires[0]!.body)).toEqual({
        limit: '100',
        offset: '0',
        userId: '23',
        isWebview: 'true',
        includeRedHeart: 'true',
        includeTop: 'true',
      });
    },
  },
  {
    module: 'user_record',
    input: { uid: '23', type: '1' },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({ uid: '23', type: 1 });
    },
  },
  {
    module: 'user_replacephone',
    input: { phone: '1', captcha: 'code', oldcaptcha: 'old' },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        phone: '1',
        captcha: 'code',
        oldcaptcha: 'old',
        countrycode: '86',
      });
    },
  },
  {
    module: 'user_replacephone',
    input: {
      phone: '1',
      captcha: 'code',
      oldcaptcha: 'old',
      countrycode: '852',
    },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toHaveProperty('countrycode', '852');
    },
  },
  {
    module: 'user_social_status_edit',
    input: {
      type: 'EMOJI_TEXT_19',
      iconUrl: 'https://example.invalid/icon',
      content: '加油',
      actionUrl: 'https://example.invalid/action',
    },
    check: (wires) => {
      expect(eapiData(wires[0]!.body)).toEqual({
        content: JSON.stringify({
          type: 'EMOJI_TEXT_19',
          iconUrl: 'https://example.invalid/icon',
          content: '加油',
          actionUrl: 'https://example.invalid/action',
        }),
      });
    },
  },
  {
    module: 'user_update',
    input: {
      birthday: '946684800000',
      city: '100000',
      gender: '1',
      nickname: 'synthetic',
      province: 100000,
      signature: 'synthetic signature',
    },
    check: (wires) => {
      expect(webData(wires[0]!.body)).toEqual({
        birthday: 946684800000,
        city: 100000,
        gender: 1,
        nickname: 'synthetic',
        province: 100000,
        signature: 'synthetic signature',
      });
    },
  },
];
