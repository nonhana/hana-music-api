import { expect } from 'bun:test';

import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import type { EncodingCase } from './contract.ts';

const VIDEO_ID = 'BFB0ABD6F5B0F069D3AC90021A1E680E';

export const cases: ReadonlyArray<EncodingCase> = [
  {
    module: 'mv_all',
    input: { area: '港台' },
    check: (wires) => {
      const data = readEapiBody(wires[0]!.body).data as Record<string, unknown>;
      expect(data).toMatchObject({ limit: 30, offset: 0, total: 'true' });
      expect(JSON.parse(data.tags as string)).toEqual({
        地区: '港台',
        类型: '全部',
        排序: '上升最快',
      });
    },
  },
  {
    module: 'mv_exclusive_rcmd',
    input: { limit: '10' },
    check: (wires) => {
      const data = readEapiBody(wires[0]!.body).data as Record<string, unknown>;
      expect(data).toMatchObject({ limit: 10, offset: 0 });
    },
  },
  {
    module: 'mv_first',
    input: {},
    check: (wires) => {
      const data = readEapiBody(wires[0]!.body).data as Record<string, unknown>;
      expect(data).toMatchObject({ area: '', limit: 30, total: true });
    },
  },
  {
    module: 'mv_sublist',
    input: {},
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ limit: 25, offset: 0, total: true });
    },
  },
  {
    module: 'mv_url',
    input: { id: '14634962' },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ id: '14634962', r: 1080 });
    },
  },
  {
    module: 'mv_detail_info',
    input: { mvid: '22769012' },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        threadid: 'R_MV_5_22769012',
        composeliked: true,
      });
    },
  },
  {
    module: 'mv_sub',
    input: { mvid: '14634962', t: '1' },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/mv/sub');
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        mvId: '14634962',
        mvIds: '["14634962"]',
      });
    },
  },
  {
    module: 'mv_sub',
    input: { mvid: '14634962' },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/mv/unsub');
    },
  },
  {
    module: 'video_sub',
    input: { id: VIDEO_ID },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/cloudvideo/video/unsub');
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ id: VIDEO_ID });
    },
  },
  {
    module: 'playmode_intelligence_list',
    input: { id: 1, pid: 2 },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        songId: 1,
        type: 'fromPlayOne',
        playlistId: 2,
        startMusicId: 1,
        count: 1,
      });
    },
  },
  {
    module: 'video_category_list',
    input: {},
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ limit: 99, offset: 0, total: 'true' });
    },
  },
  {
    module: 'video_detail_info',
    input: { vid: VIDEO_ID },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        threadid: `R_VI_62_${VIDEO_ID}`,
        composeliked: true,
      });
    },
  },
  {
    module: 'video_group',
    input: { id: '58100' },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        groupId: '58100',
        offset: 0,
        need_preview_url: 'true',
        total: true,
      });
    },
  },
  {
    module: 'video_sub',
    input: { id: VIDEO_ID, t: '0' },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/cloudvideo/video/unsub');
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ id: VIDEO_ID });
    },
  },
  {
    module: 'video_timeline_all',
    input: {},
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        groupId: 0,
        offset: 0,
        need_preview_url: 'true',
        total: true,
      });
    },
  },
  {
    module: 'video_timeline_recommend',
    input: {},
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        offset: 0,
        filterLives: '[]',
        withProgramInfo: 'true',
        needUrl: '1',
        resolution: '480',
      });
    },
  },
  {
    module: 'video_url',
    input: { id: VIDEO_ID },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        ids: `["${VIDEO_ID}"]`,
        resolution: 1080,
      });
    },
  },
];
