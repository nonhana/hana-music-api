import { expect } from 'bun:test';

import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import type { EncodingCase } from './contract.ts';

const startedAt = Date.now();

const eapiData = (wire: { readonly body: string }) => {
  const {
    header: _header,
    e_r: _e_r,
    csrf_token: _csrfToken,
    checkToken: _checkToken,
    ...data
  } = readEapiBody(wire.body).data as Record<string, unknown>;
  return data;
};

const webData = (wire: { readonly body: string }) => {
  const {
    csrf_token: _csrfToken,
    e_r: _e_r,
    ...data
  } = readWebBody(wire.body) as Record<string, unknown>;
  return data;
};

export const cases: ReadonlyArray<EncodingCase> = [
  {
    module: 'aidj_content_rcmd',
    input: { latitude: '12.34', longitude: '56.78' },
    check: (wires) => {
      const data = eapiData(wires[0]!);
      expect(Object.keys(data)).toEqual(['extInfo']);
      const extInfo = JSON.parse(String(data.extInfo)) as {
        lastRequestTimestamp: number;
        lbsInfoList: ReadonlyArray<{
          lat: number;
          lon: number;
          time: number;
        }>;
        listenedTs: boolean;
        noAidjToAidj: boolean;
      };
      expect(extInfo.noAidjToAidj).toBe(false);
      expect(extInfo.listenedTs).toBe(false);
      expect(extInfo.lastRequestTimestamp).toBeGreaterThanOrEqual(startedAt);
      expect(extInfo.lbsInfoList).toHaveLength(1);
      expect(extInfo.lbsInfoList[0]!.lat).toBe(12.34);
      expect(extInfo.lbsInfoList[0]!.lon).toBe(56.78);
      expect(extInfo.lbsInfoList[0]!.time).toBeGreaterThanOrEqual(
        Math.floor(startedAt / 1000),
      );
    },
  },
  {
    module: 'aidj_content_rcmd',
    input: {},
    check: (wires) => {
      const data = eapiData(wires[0]!);
      const extInfo = JSON.parse(String(data.extInfo)) as Record<
        string,
        unknown
      >;
      expect(extInfo).not.toHaveProperty('lbsInfoList');
      expect(extInfo.noAidjToAidj).toBe(false);
    },
  },
  {
    module: 'banner',
    input: {},
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({ clientType: 'pc' });
    },
  },
  {
    module: 'banner',
    input: { type: '2' },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({ clientType: 'iphone' });
    },
  },
  {
    module: 'banner',
    input: { type: 3 },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({ clientType: 'ipad' });
    },
  },
  {
    module: 'calendar',
    input: { startTime: '1700000000000', endTime: 1700086400000 },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        startTime: 1700000000000,
        endTime: 1700086400000,
      });
    },
  },
  {
    module: 'calendar',
    input: {},
    check: (wires) => {
      const data = webData(wires[0]!) as {
        startTime: number;
        endTime: number;
      };
      expect(typeof data.startTime).toBe('number');
      expect(typeof data.endTime).toBe('number');
      expect(data.startTime).toBeGreaterThanOrEqual(startedAt);
      expect(data.endTime).toBeGreaterThanOrEqual(startedAt);
    },
  },
  {
    module: 'homepage_block_page',
    input: { refresh: 'false', cursor: 'cursor-17' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        refresh: false,
        cursor: 'cursor-17',
      });
    },
  },
  {
    module: 'homepage_block_page',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ refresh: false });
    },
  },
  {
    module: 'personalized',
    input: { limit: '7' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        limit: 7,
        total: true,
        n: 1000,
      });
    },
  },
  {
    module: 'personalized',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        limit: 30,
        total: true,
        n: 1000,
      });
    },
  },
  {
    module: 'personalized_newsong',
    input: { limit: '7', areaId: '7' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        type: 'recommend',
        limit: 7,
        areaId: 7,
      });
    },
  },
  {
    module: 'personalized_newsong',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        type: 'recommend',
        limit: 10,
        areaId: 0,
      });
    },
  },
  {
    module: 'personalized_privatecontent_list',
    input: { limit: '7', offset: '3' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        offset: 3,
        total: 'true',
        limit: 7,
      });
    },
  },
  {
    module: 'personalized_privatecontent_list',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        offset: 0,
        total: 'true',
        limit: 60,
      });
    },
  },
  {
    module: 'recommend_songs_dislike',
    input: { id: 168091 },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        resId: '168091',
        resType: 4,
        sceneType: 1,
      });
    },
  },
  {
    module: 'recommend_songs_dislike',
    input: { id: '3431747417' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        resId: '3431747417',
        resType: 4,
        sceneType: 1,
      });
    },
  },
  {
    module: 'search',
    input: { keywords: '晴天' },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({
        s: '晴天',
        type: 1,
        limit: 30,
        offset: 0,
      });
    },
  },
  {
    module: 'search',
    input: { keywords: '晴天', type: '2000', limit: '5', offset: 2 },
    check: (wires) => {
      const decoded = readEapiBody(wires[0]!.body);
      expect(decoded.path).toBe('/api/search/voice/get');
      expect(eapiData(wires[0]!)).toEqual({
        keyword: '晴天',
        scene: 'normal',
        limit: 5,
        offset: 2,
      });
    },
  },
  {
    module: 'search_match',
    input: { md5: 'bd708d006912a09d827f02e754cf8e56' },
    check: (wires) => {
      const data = eapiData(wires[0]!);
      expect(JSON.parse(String(data.songs))).toEqual([
        {
          title: '',
          album: '',
          artist: '',
          duration: 0,
          persistId: 'bd708d006912a09d827f02e754cf8e56',
        },
      ]);
    },
  },
  {
    module: 'search_match',
    input: {
      artist: '周杰伦',
      duration: '259.21',
      md5: 'bd708d006912a09d827f02e754cf8e56',
      title: '晴天',
    },
    check: (wires) => {
      const data = eapiData(wires[0]!);
      expect(JSON.parse(String(data.songs))).toEqual([
        {
          title: '晴天',
          album: '',
          artist: '周杰伦',
          duration: 259.21,
          persistId: 'bd708d006912a09d827f02e754cf8e56',
        },
      ]);
    },
  },
  {
    module: 'search_multimatch',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ type: 1, s: '' });
    },
  },
  {
    module: 'search_multimatch',
    input: { keywords: '晴天', type: '100' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ type: 100, s: '晴天' });
    },
  },
  {
    module: 'search_suggest',
    input: { keywords: '夜に' },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/search/suggest/web');
      expect(webData(wires[0]!)).toEqual({ s: '夜に' });
    },
  },
  {
    module: 'search_suggest',
    input: { type: 'mobile' },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/search/suggest/keyword');
      expect(webData(wires[0]!)).toEqual({ s: '' });
    },
  },
  {
    module: 'sheet_list',
    input: { id: 1815684465 },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({
        id: '1815684465',
        abTest: 'b',
      });
    },
  },
  {
    module: 'sheet_list',
    input: { ab: 'a', id: '1815684465' },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({
        id: '1815684465',
        abTest: 'a',
      });
    },
  },
  {
    module: 'sheet_preview',
    input: { id: 143190 },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({ id: '143190' });
    },
  },
  {
    module: 'summary_annual',
    input: { year: '2018' },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).path).toBe(
        '/api/activity/summary/annual/2018/userdata',
      );
    },
  },
  {
    module: 'summary_annual',
    input: { year: 2024 },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).path).toBe(
        '/api/activity/summary/annual/2024/data',
      );
    },
  },
];
