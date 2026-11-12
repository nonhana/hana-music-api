import type { ModuleInputCase } from './contract.ts';

export const cases: ReadonlyArray<ModuleInputCase> = [
  {
    module: 'broadcast_category_region_get',
    valid: [{}],
    invalid: [{ page: 1 }],
  },
  {
    module: 'broadcast_channel_collect_list',
    valid: [{}, { limit: 7 }, { limit: '7' }],
    invalid: [{ limit: 'abc' }, { limit: -1 }, { limit: 1.5 }, { offset: 3 }],
  },
  {
    module: 'broadcast_channel_currentinfo',
    valid: [{ id: 131 }, { id: '131' }],
    invalid: [{}, { id: 0 }, { id: '01' }, { id: '1,2' }],
  },
  {
    module: 'broadcast_channel_list',
    valid: [
      {},
      { limit: 7, categoryId: '5', regionId: 9, lastId: '13', score: 3 },
      { categoryId: 0, regionId: 0, limit: 0, lastId: 0, score: -1 },
    ],
    invalid: [
      { limit: 'abc' },
      { categoryId: -1 },
      { lastId: '1,2' },
      { score: 1.5 },
      { regionId: true },
    ],
  },
  {
    module: 'broadcast_sub',
    valid: [{ id: 131 }, { id: '131', t: 1 }, { id: 131, t: '0' }],
    invalid: [{}, { t: 1 }, { id: 131, t: 2 }, { id: 131, t: 'true' }],
  },
  {
    module: 'hot_topic',
    valid: [{}, { limit: 7, offset: 3 }, { limit: '30', offset: '30' }],
    invalid: [{ limit: 'abc' }, { limit: -1 }, { offset: 1.5 }, { cursor: 1 }],
  },
  {
    module: 'msg_comments',
    valid: [
      { uid: 599663130 },
      { uid: '599663130', limit: 10, before: 1 },
      { uid: '23', limit: '5' },
    ],
    invalid: [
      {},
      { uid: 0 },
      { uid: '01' },
      { uid: '1,2' },
      { uid: {} },
      { uid: 1, before: 1.5 },
      { uid: 1, limit: -1 },
    ],
  },
  {
    module: 'msg_forwards',
    valid: [{}, { limit: 7, offset: 3 }, { limit: '30' }],
    invalid: [{ limit: 'abc' }, { offset: -1 }, { lasttime: 1 }],
  },
  {
    module: 'msg_notices',
    valid: [{}, { limit: 7 }, { limit: '3', lasttime: -1 }],
    invalid: [{ limit: 'abc' }, { lasttime: 1.5 }, { offset: 1 }],
  },
  {
    module: 'msg_private',
    valid: [{}, { limit: 7, offset: 3 }, { offset: '0' }],
    invalid: [{ limit: 'abc' }, { offset: -1 }, { uid: 1 }],
  },
  {
    module: 'msg_private_history',
    valid: [
      { uid: 609105586 },
      { uid: '23', limit: 10, before: 1700000000000 },
    ],
    invalid: [
      {},
      { uid: 0 },
      { uid: '1,2' },
      { uid: 1, before: -1 },
      { uid: 1, limit: 1.5 },
    ],
  },
  {
    module: 'msg_recentcontact',
    valid: [{}],
    invalid: [{ limit: 1 }],
  },
  {
    module: 'starpick_comments_summary',
    valid: [{}],
    invalid: [{ cursor: '{}' }],
  },
  {
    module: 'topic_detail',
    valid: [{ actid: 115842105 }, { actid: '19' }],
    invalid: [{}, { actid: 0 }, { actid: 'abc' }, { actid: '1,2' }],
  },
  {
    module: 'topic_detail_event_hot',
    valid: [{ actid: 115842105 }, { actid: '19' }],
    invalid: [{}, { actid: 0 }, { actid: {} }],
  },
  {
    module: 'topic_sublist',
    valid: [{}, { limit: 7, offset: 3 }, { limit: '2', offset: '1' }],
    invalid: [{ limit: 'abc' }, { offset: -1 }, { total: true }],
  },
];
