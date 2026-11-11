import type { ModuleInputCase } from './contract.ts';

export const cases: ReadonlyArray<ModuleInputCase> = [
  {
    module: 'daily_signin',
    valid: [{}, { type: 0 }, { type: 1 }, { type: '0' }, { type: '1' }],
    invalid: [
      { type: 2 },
      { type: '2' },
      { type: 'month' },
      { type: 1.5 },
      { type: null },
      { type: false },
    ],
  },
  {
    module: 'musician_cloudbean',
    valid: [{}],
    invalid: [{ id: 1 }],
  },
  {
    module: 'musician_cloudbean_obtain',
    valid: [
      { id: 7036416928, period: 1 },
      { id: '7036416928', period: '7' },
    ],
    invalid: [
      {},
      { id: 7036416928 },
      { period: 1 },
      { id: 0, period: 1 },
      { id: 1.5, period: 1 },
      { id: '01', period: 1 },
      { id: '1,2', period: 1 },
      { id: 7036416928, period: -1 },
      { id: 7036416928, period: 1.5 },
      { id: 7036416928, period: 'abc' },
      { id: 7036416928, period: null },
    ],
  },
  {
    module: 'musician_data_overview',
    valid: [{}],
    invalid: [{ startTime: '2026-10-19' }],
  },
  {
    module: 'musician_play_trend',
    valid: [{ startTime: '2026-10-19', endTime: '2026-10-26' }],
    invalid: [
      {},
      { startTime: '2026-10-19' },
      { endTime: '2026-10-26' },
      { startTime: 1792362902464, endTime: '2026-10-26' },
      { startTime: '2026-10-19', endTime: 1792967702535 },
      { startTime: null, endTime: '2026-10-26' },
    ],
  },
  {
    module: 'musician_sign',
    valid: [{}],
    invalid: [{ id: 1 }],
  },
  {
    module: 'musician_tasks',
    valid: [{}],
    invalid: [{ id: 1 }],
  },
  {
    module: 'musician_tasks_new',
    valid: [{}],
    invalid: [{ id: 1 }],
  },
  {
    module: 'sign_happy_info',
    valid: [{}],
    invalid: [{ id: 1 }],
  },
  {
    module: 'signin_progress',
    valid: [
      {},
      { moduleId: '' },
      { moduleId: '1207signin-1207signin' },
      { moduleId: 'unknown-module' },
    ],
    invalid: [
      { moduleId: 1207 },
      { moduleId: null },
      { moduleId: false },
      { moduleId: ['1207signin-1207signin'] },
    ],
  },
];
