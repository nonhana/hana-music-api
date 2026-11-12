import type { ModuleInputCase } from './contract.ts';

export const cases: ReadonlyArray<ModuleInputCase> = [
  {
    module: 'aidj_content_rcmd',
    valid: [
      {},
      { latitude: '12.34', longitude: '56.78' },
      { latitude: 40.23, longitude: -129.07 },
    ],
    invalid: [
      { latitude: 'north' },
      { latitude: true },
      { latitude: '12.34', longitude: [] },
    ],
  },
  {
    module: 'banner',
    valid: [{}, { type: 0 }, { type: '2' }, { type: 3 }],
    invalid: [{ type: 4 }, { type: 99 }, { type: 'pc' }, { type: null }],
  },
  {
    module: 'calendar',
    valid: [
      {},
      { startTime: '1700000000000', endTime: 1700086400000 },
      { startTime: 0 },
    ],
    invalid: [
      { startTime: 'morning' },
      { startTime: -1 },
      { endTime: 1.5 },
      { startTime: null },
    ],
  },
  {
    module: 'homepage_block_page',
    valid: [
      {},
      { refresh: true, cursor: 'cursor-17' },
      { refresh: 'false' },
      { refresh: 0 },
    ],
    invalid: [
      { cursor: 0 },
      { cursor: { offset: 1 } },
      { refresh: 'yes' },
      { refresh: null },
    ],
  },
  {
    module: 'homepage_dragon_ball',
    valid: [{}],
    invalid: [{ refresh: true }, []],
  },
  {
    module: 'personalized',
    valid: [{}, { limit: 7 }, { limit: '7' }, { limit: 0 }],
    invalid: [{ limit: 'many' }, { limit: -1 }, { limit: 1.5 }, { offset: 0 }],
  },
  {
    module: 'personalized_djprogram',
    valid: [{}],
    invalid: [{ limit: 1 }],
  },
  {
    module: 'personalized_mv',
    valid: [{}],
    invalid: [{ limit: 1 }],
  },
  {
    module: 'personalized_newsong',
    valid: [{}, { limit: 3, areaId: 7 }, { limit: '3', areaId: '0' }],
    invalid: [
      { limit: 'many' },
      { areaId: -1 },
      { areaId: 1.5 },
      { offset: 0 },
    ],
  },
  {
    module: 'personalized_privatecontent',
    valid: [{}],
    invalid: [{ limit: 1 }],
  },
  {
    module: 'personalized_privatecontent_list',
    valid: [{}, { limit: 6, offset: 0 }, { offset: '2' }],
    invalid: [
      { offset: 'later' },
      { limit: -1 },
      { limit: 1.5 },
      { offset: null },
    ],
  },
  {
    module: 'recommend_resource',
    valid: [{}],
    invalid: [{ id: 1 }],
  },
  {
    module: 'recommend_songs',
    valid: [{}],
    invalid: [{ id: 1 }],
  },
  {
    module: 'recommend_songs_dislike',
    valid: [{ id: 168091 }, { id: '3431747417' }],
    invalid: [
      {},
      { id: 0 },
      { id: -1 },
      { id: '1,2' },
      { id: '01' },
      { id: null },
    ],
  },
  {
    module: 'search',
    valid: [
      { keywords: '晴天' },
      { keywords: '晴天', type: '2000', limit: '5', offset: 0 },
      { keywords: '晴天', type: 1004, limit: 3 },
      { keywords: '' },
    ],
    invalid: [
      {},
      { keywords: 1 },
      { keywords: '晴天', type: 5 },
      { keywords: '晴天', type: '1,2' },
      { keywords: '晴天', limit: 'many' },
      { keywords: '晴天', offset: -1 },
    ],
  },
  {
    module: 'search_default',
    valid: [{}],
    invalid: [{ keywords: '晴天' }],
  },
  {
    module: 'search_hot',
    valid: [{}],
    invalid: [{ type: 1 }],
  },
  {
    module: 'search_hot_detail',
    valid: [{}],
    invalid: [{ limit: 1 }],
  },
  {
    module: 'search_match',
    valid: [
      { md5: 'bd708d006912a09d827f02e754cf8e56' },
      {
        album: '叶惠美',
        artist: '周杰伦',
        duration: '259.21',
        md5: 'bd708d006912a09d827f02e754cf8e56',
        title: '晴天',
      },
      { duration: 269000, md5: 'abc123' },
    ],
    invalid: [
      {},
      { md5: 123 },
      { md5: 'abc123', duration: 'quick' },
      { md5: 'abc123', title: 1 },
    ],
  },
  {
    module: 'search_multimatch',
    valid: [
      {},
      { keywords: '晴天', type: 1 },
      { keywords: '晴天', type: '100' },
    ],
    invalid: [
      { keywords: 1 },
      { type: 'many' },
      { type: -1 },
      { type: 1.5 },
      { limit: 1 },
    ],
  },
  {
    module: 'search_suggest',
    valid: [
      {},
      { keywords: '夜に' },
      { keywords: '夜に', type: 'mobile' },
      { keywords: '晴天', type: 'web' },
    ],
    invalid: [
      { keywords: 1 },
      { keywords: '晴天', type: 100 },
      { keywords: '晴天', type: ['mobile'] },
      { keywords: '晴天', limit: 5 },
    ],
  },
  {
    module: 'sheet_list',
    valid: [{ id: 1815684465 }, { ab: 'b', id: '1815684465' }],
    invalid: [
      {},
      { id: 0 },
      { id: '1,2' },
      { id: '01815684465' },
      { ab: 1, id: 1815684465 },
    ],
  },
  {
    module: 'sheet_preview',
    valid: [{ id: 143190 }, { id: '143190' }],
    invalid: [{}, { id: 0 }, { id: -1 }, { id: 1.5 }, { id: null }],
  },
  {
    module: 'summary_annual',
    valid: [{ year: 2024 }, { year: '2023' }, { year: 2018 }],
    invalid: [
      {},
      { year: 'last year' },
      { year: -1 },
      { year: 2024.5 },
      { year: null },
      { year: {} },
    ],
  },
];
