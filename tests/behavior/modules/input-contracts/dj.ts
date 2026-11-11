import type { ModuleInputCase } from './contract.ts';

export const cases: ReadonlyArray<ModuleInputCase> = [
  {
    module: 'djRadio_top',
    valid: [
      {},
      { dataGapDays: 30, dataType: 0, djRadioId: 1, sortIndex: 2 },
      { dataGapDays: '90', dataType: '4', djRadioId: '3', sortIndex: '5' },
    ],
    invalid: [
      { djRadioId: 0 },
      { djRadioId: '1,2' },
      { sortIndex: 6 },
      { dataGapDays: 14 },
      { dataType: -1 },
    ],
  },
  { module: 'dj_banner', valid: [{}], invalid: [null, { clientType: 1 }] },
  {
    module: 'dj_category_excludehot',
    valid: [{}],
    invalid: [null, { type: 1 }],
  },
  {
    module: 'dj_category_recommend',
    valid: [{}],
    invalid: [null, { type: 1 }],
  },
  { module: 'dj_catelist', valid: [{}], invalid: [null, { type: 1 }] },
  {
    module: 'dj_detail',
    valid: [{ rid: 1 }, { rid: '2' }],
    invalid: [{}, { rid: 0 }, { rid: '1,2' }, { rid: true }, { id: 1 }],
  },
  {
    module: 'dj_difm_all_style_channel',
    valid: [{}, { sources: [0, 1, 2] }, { sources: ['1'] }],
    invalid: [
      { sources: '[1,2]' },
      { sources: [3] },
      { sources: '0' },
      { sources: [0, 0.5] },
    ],
  },
  {
    module: 'dj_difm_channel_subscribe',
    valid: [{ id: 1 }, { id: '2' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }, { id: true }],
  },
  {
    module: 'dj_difm_channel_unsubscribe',
    valid: [{ id: 1 }, { id: '2' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }, { id: true }],
  },
  {
    module: 'dj_difm_playing_tracks_list',
    valid: [
      { channelId: 1 },
      { channelId: '2', limit: 5, source: 1 },
      { channelId: '3', limit: '7', source: '2' },
    ],
    invalid: [
      {},
      { channelId: 0 },
      { channelId: 1, source: 3 },
      { channelId: 1, source: 'x' },
      { channelId: 1, limit: -1 },
    ],
  },
  {
    module: 'dj_difm_subscribe_channels_get',
    valid: [{}, { sources: [0] }, { sources: [1, '2'] }],
    invalid: [{ sources: '[1]' }, { sources: [3] }, { sources: '0' }],
  },
  {
    module: 'dj_hot',
    valid: [{}, { limit: 7, offset: 3 }, { limit: '10', offset: '20' }],
    invalid: [{ limit: -1 }, { limit: 1.5 }, { offset: 'abc' }],
  },
  {
    module: 'dj_paygift',
    valid: [{}, { limit: 7, offset: 3 }, { limit: '10', offset: '20' }],
    invalid: [{ limit: -1 }, { limit: 1.5 }, { offset: 'abc' }],
  },
  {
    module: 'dj_personalize_recommend',
    valid: [{}, { limit: 3 }, { limit: '6' }],
    invalid: [{ limit: -1 }, { limit: 'x' }],
  },
  {
    module: 'dj_program',
    valid: [
      { rid: 1 },
      { asc: true, limit: 5, offset: 10, rid: '2' },
      { asc: 'false', rid: 1 },
      { asc: 0, rid: 1 },
    ],
    invalid: [
      {},
      { rid: 0 },
      { rid: '1,2' },
      { asc: 'yes', rid: 1 },
      { asc: 2, rid: 1 },
      { limit: -1, rid: 1 },
    ],
  },
  {
    module: 'dj_program_detail',
    valid: [{ id: 1 }, { id: '2' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }, { id: true }],
  },
  {
    module: 'dj_program_toplist',
    valid: [{}, { limit: 7, offset: 3 }, { limit: '10', offset: '20' }],
    invalid: [{ limit: -1 }, { offset: 'abc' }],
  },
  {
    module: 'dj_program_toplist_hours',
    valid: [{}, { limit: 7 }, { limit: '10' }],
    invalid: [{ limit: -1 }, { offset: 3 }],
  },
  {
    module: 'dj_radio_hot',
    valid: [
      { cateId: 3 },
      { cateId: '3', limit: 5, offset: 0 },
      { cateId: '3', limit: '7', offset: '3' },
    ],
    invalid: [{}, { cateId: 0 }, { cateId: 'x' }, { cateId: 3, limit: -1 }],
  },
  { module: 'dj_recommend', valid: [{}], invalid: [null, { type: 1 }] },
  {
    module: 'dj_recommend_type',
    valid: [{ type: 3 }, { type: '10001' }],
    invalid: [{}, { type: 0 }, { type: 'abc' }, { id: 3 }],
  },
  {
    module: 'dj_sub',
    valid: [{ rid: 1 }, { rid: '2', t: 1 }, { rid: 1, t: '0' }],
    invalid: [
      {},
      { rid: 0 },
      { rid: 1, t: 2 },
      { rid: 1, t: 'unsub' },
      { rid: 1, t: null },
    ],
  },
  {
    module: 'dj_sublist',
    valid: [{}, { limit: 7, offset: 3 }, { limit: '10', offset: '20' }],
    invalid: [{ limit: -1 }, { offset: 'abc' }],
  },
  {
    module: 'dj_subscriber',
    valid: [
      { id: 1 },
      { id: '2', limit: 5, time: 1_700_000_000_000 },
      { id: 1, limit: '7', time: '-1' },
    ],
    invalid: [
      {},
      { id: 0 },
      { id: 1, limit: -1 },
      { id: 1, time: 1.5 },
      { id: 1, time: 'yesterday' },
    ],
  },
  {
    module: 'dj_today_perfered',
    valid: [{}, { page: 0 }, { page: '2' }],
    invalid: [{ page: -1 }, { page: 'x' }],
  },
  {
    module: 'dj_toplist',
    valid: [{}, { limit: 7, offset: 3, type: 'hot' }, { type: 'new' }],
    invalid: [{ type: 'PUBLIC' }, { type: 1 }, { type: null }, { limit: -1 }],
  },
  {
    module: 'dj_toplist_hours',
    valid: [{}, { limit: 7 }, { limit: '10' }],
    invalid: [{ limit: -1 }, { offset: 1 }],
  },
  {
    module: 'dj_toplist_newcomer',
    valid: [{}, { limit: 7, offset: 3 }, { limit: '10', offset: '20' }],
    invalid: [{ limit: -1 }, { offset: 'abc' }],
  },
  {
    module: 'dj_toplist_pay',
    valid: [{}, { limit: 7 }, { limit: '10' }],
    invalid: [{ limit: -1 }, { offset: 1 }],
  },
  {
    module: 'dj_toplist_popular',
    valid: [{}, { limit: 7 }, { limit: '10' }],
    invalid: [{ limit: -1 }, { offset: 1 }],
  },
];
