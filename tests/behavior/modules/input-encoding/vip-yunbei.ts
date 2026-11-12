import { expect } from 'bun:test';

import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import type { EncodingCase } from './contract.ts';

export const cases: ReadonlyArray<EncodingCase> = [
  {
    module: 'vip_growthpoint_details',
    input: {},
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ limit: 20, offset: 0 });
    },
  },
  {
    module: 'vip_growthpoint_details',
    input: { limit: '7', offset: '3' },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ limit: 7, offset: 3 });
    },
  },
  {
    module: 'vip_growthpoint_get',
    input: { ids: ['7043206830_7', '8613118351_1'] },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        taskIds: '7043206830_7,8613118351_1',
      });
    },
  },
  {
    module: 'vip_info',
    input: {},
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ userId: '' });
    },
  },
  {
    module: 'vip_info',
    input: { uid: 23 },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ userId: '23' });
    },
  },
  {
    module: 'vip_info_v2',
    input: { uid: '32953014' },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ userId: '32953014' });
    },
  },
  {
    module: 'vip_timemachine',
    input: {},
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).not.toHaveProperty('startTime');
      expect(data).not.toHaveProperty('limit');
    },
  },
  {
    module: 'vip_timemachine',
    input: { startTime: '1638288000000', endTime: '1640966399999' },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        startTime: 1638288000000,
        endTime: 1640966399999,
        type: 1,
        limit: 60,
      });
    },
  },
  {
    module: 'vip_timemachine',
    input: { startTime: 1, endTime: 2, limit: '10' },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        startTime: 1,
        endTime: 2,
        type: 1,
        limit: 10,
      });
    },
  },
  {
    module: 'yunbei_expense',
    input: {},
    check: (wires) => {
      const data = readEapiBody(wires[0]!.body).data as Record<string, unknown>;
      expect(data).toMatchObject({ limit: 10, offset: 0 });
    },
  },
  {
    module: 'yunbei_expense',
    input: { limit: '7', offset: '3' },
    check: (wires) => {
      const data = readEapiBody(wires[0]!.body).data as Record<string, unknown>;
      expect(data).toMatchObject({ limit: 7, offset: 3 });
    },
  },
  {
    module: 'yunbei_receipt',
    input: {},
    check: (wires) => {
      const data = readEapiBody(wires[0]!.body).data as Record<string, unknown>;
      expect(data).toMatchObject({ limit: 10, offset: 0 });
    },
  },
  {
    module: 'yunbei_rcmd_song',
    input: { id: '65528' },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        songId: '65528',
        reason: '好歌献给你',
        scene: '',
        fromUserId: -1,
        yunbeiNum: 10,
      });
    },
  },
  {
    module: 'yunbei_rcmd_song',
    input: { id: 65528, reason: '人间好声音', yunbeiNum: '20' },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        songId: 65528,
        reason: '人间好声音',
        yunbeiNum: 20,
      });
    },
  },
  {
    module: 'yunbei_rcmd_song_history',
    input: {},
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data.page).toBe('{"size":20,"cursor":""}');
    },
  },
  {
    module: 'yunbei_rcmd_song_history',
    input: { size: '5', cursor: 'synthetic-cursor' },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data.page).toBe('{"size":5,"cursor":"synthetic-cursor"}');
    },
  },
  {
    module: 'yunbei_task_finish',
    input: { userTaskId: '29' },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ userTaskId: '29', depositCode: '0' });
    },
  },
  {
    module: 'yunbei_task_finish',
    input: { userTaskId: 29, depositCode: '3' },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ userTaskId: 29, depositCode: '3' });
    },
  },
];
