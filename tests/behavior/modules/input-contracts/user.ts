import type { ModuleInputCase } from './contract.ts';

export const cases: ReadonlyArray<ModuleInputCase> = [
  { module: 'user_account', valid: [{}], invalid: [{ uid: 1 }] },
  {
    module: 'user_audio',
    valid: [{ uid: 1 }, { uid: '2' }],
    invalid: [{}, { uid: 0 }, { uid: '01' }, { uid: '1,2' }, { uid: true }],
  },
  {
    module: 'user_binding',
    valid: [{ uid: 1 }, { uid: '2' }],
    invalid: [{}, { uid: 0 }, { uid: '1,2' }],
  },
  {
    module: 'user_cloud',
    valid: [{}, { limit: 10, offset: 0 }, { limit: '50', offset: '20' }],
    invalid: [
      { limit: -1 },
      { limit: 1.5 },
      { limit: 'abc' },
      { offset: '1,2' },
    ],
  },
  {
    module: 'user_cloud_del',
    valid: [{ id: 1 }, { id: '2' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }],
  },
  {
    module: 'user_cloud_detail',
    valid: [{ ids: [1] }, { ids: [1, '2'] }],
    invalid: [{}, { ids: [] }, { ids: ['1,2'] }, { id: '1,2' }],
  },
  {
    module: 'user_comment_history',
    valid: [
      { uid: 1 },
      { uid: '2', limit: 5, time: 0 },
      { uid: 1, limit: '10', time: '1700000000000' },
    ],
    invalid: [{}, { uid: 0 }, { limit: 1 }, { uid: 1, time: 'abc' }],
  },
  {
    module: 'user_detail',
    valid: [{ uid: 1 }, { uid: '2' }],
    invalid: [{}, { uid: 0 }, { uid: '1,2' }],
  },
  {
    module: 'user_dj',
    valid: [{ uid: 1 }, { uid: '2', limit: '5', offset: '0' }],
    invalid: [{}, { uid: 0 }, { uid: 1, limit: -1 }, { uid: 1, limit: 'abc' }],
  },
  {
    module: 'user_event',
    valid: [
      { uid: 1 },
      { uid: '2', limit: '5', offset: 0 },
      { uid: 1, lasttime: -1 },
      { uid: 1, lasttime: '1700000000000' },
    ],
    invalid: [{}, { uid: 0 }, { uid: 1, limit: -1 }, { uid: 1, lasttime: 1.5 }],
  },
  {
    module: 'user_follow_mixed',
    valid: [
      {},
      { cursor: 3, size: 7, scene: 2 },
      { cursor: '3', size: '5', scene: '1' },
    ],
    invalid: [{ cursor: -1 }, { size: 'abc' }, { scene: 3 }],
  },
  {
    module: 'user_followeds',
    valid: [{ uid: 1 }, { uid: '2', limit: '5', offset: '0' }],
    invalid: [{}, { uid: 0 }, { uid: 1, offset: -1 }],
  },
  {
    module: 'user_follows',
    valid: [{ uid: 1 }, { uid: '2', limit: '5', offset: '0' }],
    invalid: [{}, { uid: 0 }, { uid: 1, limit: 'abc' }],
  },
  { module: 'user_level', valid: [{}], invalid: [{ uid: 1 }] },
  {
    module: 'user_medal',
    valid: [{ uid: 1 }, { uid: '2' }],
    invalid: [{}, { uid: 0 }, { uid: '1,2' }],
  },
  {
    module: 'user_mutualfollow_get',
    valid: [{ uid: 1 }, { uid: '2' }],
    invalid: [{}, { uid: 0 }],
  },
  {
    module: 'user_playlist',
    valid: [{ uid: 1 }, { uid: '2', limit: '5', offset: 0 }],
    invalid: [{}, { uid: 0 }, { uid: 1, offset: -1 }],
  },
  {
    module: 'user_playlist_collect',
    valid: [{ uid: 1 }, { uid: '2', limit: '5', offset: 0 }],
    invalid: [{}, { uid: 0 }, { uid: 1, limit: -1 }],
  },
  {
    module: 'user_playlist_create',
    valid: [{ uid: 1 }, { uid: '2', limit: '5', offset: 0 }],
    invalid: [{}, { uid: 0 }, { uid: 1, offset: 'abc' }],
  },
  {
    module: 'user_record',
    valid: [{ uid: 1 }, { uid: '2', type: 1 }, { uid: 3, type: '0' }],
    invalid: [{}, { uid: 0 }, { uid: 1, type: 2 }, { uid: 1, type: 'yes' }],
  },
  {
    module: 'user_replacephone',
    valid: [
      { phone: '1', captcha: 'code', oldcaptcha: 'old' },
      { phone: '1', captcha: 'code', oldcaptcha: 'old', countrycode: '86' },
      { phone: '1', captcha: 'code', oldcaptcha: 'old', countrycode: 1 },
    ],
    invalid: [
      {},
      { phone: '1' },
      { phone: 1, captcha: 'code', oldcaptcha: 'old' },
      { phone: '1', captcha: 'code', oldcaptcha: 'old', countrycode: 'abc' },
    ],
  },
  {
    module: 'user_social_status',
    valid: [{ uid: 1 }, { uid: '2' }],
    invalid: [{}, { uid: 0 }],
  },
  {
    module: 'user_social_status_edit',
    valid: [
      {},
      { type: 'test' },
      {
        type: 'EMOJI_TEXT_19',
        iconUrl: 'https://example.invalid/icon',
        content: '加油',
        actionUrl: 'https://example.invalid/action',
      },
    ],
    invalid: [{ type: 1 }, { content: {} }, { unexpected: true }],
  },
  { module: 'user_social_status_rcmd', valid: [{}], invalid: [{ uid: 1 }] },
  {
    module: 'user_social_status_support',
    valid: [{}],
    invalid: [{ type: 'x' }],
  },
  { module: 'user_subcount', valid: [{}], invalid: [{ uid: 1 }] },
  {
    module: 'user_update',
    valid: [
      { nickname: 'synthetic' },
      {
        birthday: '946684800000',
        city: 100000,
        gender: '1',
        province: '100000',
        signature: 'synthetic signature',
      },
    ],
    invalid: [
      { gender: 3 },
      { birthday: -1 },
      { city: 1.5 },
      { nickname: 1 },
      { unexpected: true },
    ],
  },
];
