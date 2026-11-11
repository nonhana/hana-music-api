import type { ModuleInputCase } from './contract.ts';

const VIDEO_ID = 'BFB0ABD6F5B0F069D3AC90021A1E680E';

export const cases: ReadonlyArray<ModuleInputCase> = [
  {
    module: 'audio_match',
    valid: [
      { audioFP: 'fingerprint', duration: 3 },
      { audioFP: 'fingerprint', duration: '2.5' },
    ],
    invalid: [
      { audioFP: 'fingerprint' },
      { audioFP: 'fingerprint', duration: '3s' },
      { audioFP: 1, duration: 3 },
    ],
  },
  {
    module: 'cloud_match',
    valid: [
      { uid: 10000001, sid: 2706240277, asid: 347230 },
      { uid: '10000001', sid: '2706240277', asid: '0' },
    ],
    invalid: [
      { uid: 10000001, sid: 2706240277 },
      { uid: 0, sid: 1, asid: 1 },
      { uid: 1, sid: '1,2', asid: 1 },
      { uid: 1, sid: 1, asid: -1 },
    ],
  },
  {
    module: 'mv_all',
    valid: [
      {},
      { area: '港台', limit: 10, offset: 30 },
      { limit: '10', offset: '0', order: '最新', type: '官方版' },
    ],
    invalid: [{ limit: -1 }, { offset: 1.5 }, { limit: 'ten' }, { area: 1 }],
  },
  {
    module: 'mv_detail',
    valid: [{ mvid: 14634962 }, { mvid: '14634962' }],
    invalid: [{}, { mvid: 0 }, { mvid: '1,2' }, { mvid: 1.5 }],
  },
  {
    module: 'mv_detail_info',
    valid: [{ mvid: 22769012 }, { mvid: '22769012' }],
    invalid: [{}, { mvid: 0 }, { mvid: '1;2' }],
  },
  {
    module: 'mv_exclusive_rcmd',
    valid: [{}, { limit: '10', offset: 0 }],
    invalid: [{ limit: -1 }, { offset: 1.5 }, { limit: 'ten' }],
  },
  {
    module: 'mv_first',
    valid: [{}, { area: '不存在的地区' }, { limit: '10' }],
    invalid: [{ area: 1 }, { limit: -1 }, { limit: 2.5 }],
  },
  {
    module: 'mv_sub',
    valid: [
      { mvid: 14634962, t: 1 },
      { mvid: '14634962', t: '0' },
      { mvid: 14634962 },
    ],
    invalid: [
      { mvid: 0, t: 1 },
      { mvid: 1, t: 2 },
      { mvid: 1, t: 'true' },
    ],
  },
  {
    module: 'mv_sublist',
    valid: [{}, { limit: '10', offset: 0 }],
    invalid: [{ limit: -1 }, { offset: 1.5 }],
  },
  {
    module: 'mv_url',
    valid: [
      { id: 14634962 },
      { id: '14634962', r: 720 },
      { id: '14634962', r: '1080' },
    ],
    invalid: [
      {},
      { id: 0 },
      { id: '1,2' },
      { id: 1, r: -1 },
      { id: 1, r: 1.5 },
    ],
  },
  {
    module: 'playmode_intelligence_list',
    valid: [
      { id: 1, pid: 2 },
      { id: '1', pid: '2', sid: 3, count: 5 },
    ],
    invalid: [
      { id: 1 },
      { pid: 2 },
      { id: 0, pid: 2 },
      { id: 1, pid: 2, sid: 0 },
      { id: 1, pid: 2, count: -1 },
      { id: 1, pid: 2, count: 1.5 },
    ],
  },
  {
    module: 'video_category_list',
    valid: [{}, { limit: '20', offset: 0 }],
    invalid: [{ limit: -1 }, { offset: 1.5 }],
  },
  {
    module: 'video_detail',
    valid: [{ id: VIDEO_ID }],
    invalid: [{}, { id: 123 }, { id: null }],
  },
  {
    module: 'video_detail_info',
    valid: [{ vid: VIDEO_ID }],
    invalid: [{}, { vid: 123 }],
  },
  {
    module: 'video_group',
    valid: [{ id: 58100 }, { id: '58100', offset: 0 }],
    invalid: [{}, { id: 0 }, { id: 1, offset: -1 }],
  },
  {
    module: 'video_group_list',
    valid: [{}],
    invalid: [{ any: 1 }],
  },
  {
    module: 'video_sub',
    valid: [{ id: VIDEO_ID, t: 1 }, { id: VIDEO_ID, t: '0' }, { id: VIDEO_ID }],
    invalid: [
      { id: 123, t: 1 },
      { id: VIDEO_ID, t: 2 },
      { id: VIDEO_ID, t: 'true' },
    ],
  },
  {
    module: 'video_timeline_all',
    valid: [{}, { offset: '7' }],
    invalid: [{ offset: -1 }, { offset: 1.5 }],
  },
  {
    module: 'video_timeline_recommend',
    valid: [{}, { offset: 100 }],
    invalid: [{ offset: -1 }, { offset: 2.5 }],
  },
  {
    module: 'video_url',
    valid: [{ id: VIDEO_ID }, { id: VIDEO_ID, res: '720' }],
    invalid: [
      {},
      { id: 123 },
      { id: VIDEO_ID, res: -1 },
      { id: VIDEO_ID, res: 1.5 },
    ],
  },
];
