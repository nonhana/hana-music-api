import type { ModuleInputCase } from './contract.ts';

export const cases: ReadonlyArray<ModuleInputCase> = [
  { module: 'vip_growthpoint', valid: [{}], invalid: [null, []] },
  {
    module: 'vip_growthpoint_details',
    valid: [{}, { limit: '10' }, { limit: 7, offset: 3 }, { limit: 0 }],
    invalid: [
      { limit: -1 },
      { offset: 1.5 },
      { limit: 'ten' },
      { limit: '' },
      { limit: null },
      { limit: true },
    ],
  },
  {
    module: 'vip_growthpoint_get',
    valid: [
      { ids: ['7043206830_7'] },
      { ids: ['7043206830_7', '8613118351_1'] },
    ],
    invalid: [
      {},
      { ids: [] },
      { ids: '7043206830_7' },
      { ids: ['7043206830_7,8613118351_1'] },
      { ids: [''] },
      { ids: [7043206830] },
    ],
  },
  {
    module: 'vip_info',
    valid: [{}, { uid: 32953014 }, { uid: '32953014' }],
    invalid: [
      { uid: 0 },
      { uid: -1 },
      { uid: '01' },
      { uid: '' },
      { uid: null },
      { uid: '1,2' },
    ],
  },
  {
    module: 'vip_info_v2',
    valid: [{}, { uid: 32953014 }, { uid: '32953014' }],
    invalid: [
      { uid: 0 },
      { uid: -1 },
      { uid: '01' },
      { uid: '' },
      { uid: null },
      { uid: '1,2' },
    ],
  },
  { module: 'vip_tasks', valid: [{}], invalid: [null, []] },
  {
    module: 'vip_timemachine',
    valid: [
      {},
      { startTime: 1638288000000, endTime: 1640966399999 },
      { startTime: '1609430400', endTime: '1640966399999', limit: '10' },
      { limit: 0 },
    ],
    invalid: [
      { startTime: -1 },
      { endTime: 1.5 },
      { limit: 'ten' },
      { startTime: '' },
      { limit: null },
    ],
  },
  { module: 'yunbei', valid: [{}], invalid: [null, []] },
  {
    module: 'yunbei_expense',
    valid: [{}, { limit: '10' }, { limit: 7, offset: 3 }, { offset: 0 }],
    invalid: [
      { limit: -1 },
      { offset: 1.5 },
      { limit: 'ten' },
      { limit: null },
      { offset: true },
    ],
  },
  { module: 'yunbei_info', valid: [{}], invalid: [null, []] },
  {
    module: 'yunbei_rcmd_song',
    valid: [
      { id: 65528 },
      { id: '65528', reason: '人间好声音', yunbeiNum: '10' },
      { id: 1, yunbeiNum: 0 },
    ],
    invalid: [
      {},
      { id: 0 },
      { id: '1,2' },
      { reason: 'x' },
      { id: 1, reason: 0 },
      { id: 1, yunbeiNum: -1 },
    ],
  },
  {
    module: 'yunbei_rcmd_song_history',
    valid: [
      {},
      { size: '10' },
      { size: 5, cursor: 'synthetic-cursor' },
      { size: 0 },
    ],
    invalid: [{ size: -1 }, { size: 1.5 }, { size: null }, { cursor: 0 }],
  },
  {
    module: 'yunbei_receipt',
    valid: [{}, { limit: '10' }, { limit: 7, offset: 3 }, { offset: 0 }],
    invalid: [
      { limit: -1 },
      { offset: 1.5 },
      { limit: 'ten' },
      { limit: null },
      { offset: true },
    ],
  },
  { module: 'yunbei_sign', valid: [{}], invalid: [null, []] },
  {
    module: 'yunbei_task_finish',
    valid: [
      { userTaskId: '5146243240' },
      { userTaskId: 5146243240, depositCode: '0' },
      { userTaskId: 1, depositCode: 3 },
    ],
    invalid: [
      {},
      { userTaskId: 0 },
      { userTaskId: '1,2' },
      { userTaskId: 1, depositCode: -1 },
      { userTaskId: 1, depositCode: 'synthetic-deposit' },
    ],
  },
  { module: 'yunbei_tasks', valid: [{}], invalid: [null, []] },
  { module: 'yunbei_tasks_todo', valid: [{}], invalid: [null, []] },
  { module: 'yunbei_today', valid: [{}], invalid: [null, []] },
];
